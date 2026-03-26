<?php

namespace App\Http\Controllers;

use App\Models\Projects;
use App\Models\Conversation;
use App\Models\Chat;
use App\Models\Agent;
use App\Services\DeepSeekService;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProjectChatController extends Controller
{
    private DeepSeekService $deepSeekService;
    private ProjectService $projectService;

    public function __construct(DeepSeekService $deepSeekService, ProjectService $projectService)
    {
        $this->deepSeekService = $deepSeekService;
        $this->projectService = $projectService;
    }

    /**
     * Display project chat interface
     */
    public function index(Projects $project, Request $request)
    {
        $this->authorize('chat', $project);

        // Get conversations for this project
        $conversations = $project->conversations()
            ->with(['chats' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->latest()
            ->paginate(20);

        // Get available agents for this user
        $userId = Auth::id();
        $agents = Agent::visibleTo($userId)
            ->where('status', 'active')
            ->select(['id', 'name', 'description', 'avatar_url', 'type', 'capabilities', 'available_tools', 'is_system_agent'])
            ->orderBy('is_system_agent', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'description' => $agent->description,
                    'avatar_url' => $agent->avatar_url,
                    'type' => $agent->type,
                    'capabilities' => $agent->getCapabilities(),
                    'available_tools' => $agent->getAvailableTools(),
                    'is_system_agent' => $agent->isSystemAgent(),
                    'badge' => $agent->isSystemAgent() ? 'System' : 'Custom'
                ];
            });

        // Get current conversation if specified
        $currentConversation = null;
        if ($request->has('conversation_id')) {
            $currentConversation = $project->conversations()
                ->with(['chats' => function ($query) {
                    $query->with(['user', 'agent', 'files'])
                        ->orderBy('created_at', 'asc');
                }])
                ->find($request->conversation_id);
        }

        // Get project AI capabilities
        $aiCapabilities = [
            'hasCoding' => $project->hasAICoding(),
            'hasAnalytics' => $project->analytics_enabled,
            'model' => $project->ai_model,
            'framework' => $project->coding_framework,
            'canGenerate' => !empty($project->ai_model),
        ];

        return Inertia::render('Projects/Chat/Index', [
            'project' => $project->load(['user', 'members.user']),
            'conversations' => $conversations,
            'currentConversation' => $currentConversation,
            'agents' => $agents,
            'aiCapabilities' => $aiCapabilities,
            'userRole' => $project->isOwner(Auth::id()) ? 'owner' : $project->getMemberRole(Auth::id()),
        ]);
    }

    /**
     * Create new conversation
     */
    public function createConversation(Projects $project, Request $request)
    {
        $this->authorize('chat', $project);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'type' => 'nullable|in:general,coding,analytics,support',
            'agent_id' => 'nullable|exists:agents,id',
        ]);

        try {
            DB::beginTransaction();

            $conversation = $project->conversations()->create([
                'user_id' => Auth::id(),
                'title' => $validated['title'] ?? 'New Conversation',
                'description' => $validated['description'] ?? null,
                'type' => $validated['type'] ?? 'general',
                'context' => [
                    'project_id' => $project->id,
                    'project_title' => $project->title,
                    'ai_model' => $project->ai_model,
                    'coding_framework' => $project->coding_framework,
                    'analytics_enabled' => $project->analytics_enabled,
                ],
            ]);

            // Log activity
            $this->projectService->logActivity($project, 'conversation_created', [
                'conversation_id' => $conversation->id,
                'title' => $conversation->title,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'conversation' => $conversation->load(['chats', 'user']),
                'message' => 'Conversation created successfully!',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create conversation', [
                'project_id' => $project->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create conversation. Please try again.',
            ], 500);
        }
    }

    /**
     * Send message in conversation
     */
    public function sendMessage(Projects $project, Conversation $conversation, Request $request)
    {
        $this->authorize('chat', $project);

        // Verify conversation belongs to project
        if ($conversation->projects_id !== $project->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:10000',
            'type' => 'nullable|in:text,code,analytics',
            'agent_id' => 'nullable|exists:agents,id',
            'reply_to_id' => 'nullable|exists:chats,id',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240', // 10MB max per file
        ]);

        try {
            DB::beginTransaction();

            // Create user message
            $userMessage = $conversation->chats()->create([
                'message' => $validated['message'],
                'role' => 'user',
                'type' => $validated['type'] ?? 'text',
                'reply_to_id' => $validated['reply_to_id'] ?? null,
                'metadata' => [
                    'user_id' => Auth::id(),
                    'project_id' => $project->id,
                    'timestamp' => now()->toISOString(),
                ],
            ]);

            // Handle file uploads
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('chat-files', 'public');
                    $userMessage->files()->create([
                        'filename' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ]);
                }
            }

            // Generate AI response if AI is enabled
            $aiResponse = null;
            if ($project->ai_model && !empty($validated['message'])) {
                $selectedAgent = null;
                if (!empty($validated['agent_id'])) {
                    $selectedAgent = Agent::find($validated['agent_id']);
                    // Verify agent is accessible to user
                    if (!$selectedAgent || !$selectedAgent->isVisibleTo(Auth::id())) {
                        $selectedAgent = null;
                    }
                }

                $aiResponse = $this->generateAIResponse($project, $conversation, $validated['message'], $validated['type'] ?? 'text', $selectedAgent);
            }

            // Log activity
            $this->projectService->logActivity($project, 'message_sent', [
                'conversation_id' => $conversation->id,
                'message_id' => $userMessage->id,
                'has_ai_response' => !is_null($aiResponse),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $userMessage->load(['files', 'user']),
                'ai_response' => $aiResponse,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to send message', [
                'project_id' => $project->id,
                'conversation_id' => $conversation->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again.',
            ], 500);
        }
    }

    /**
     * Stream AI response
     */
    public function streamAIResponse(Projects $project, Conversation $conversation, Request $request)
    {
        $this->authorize('chat', $project);

        if ($conversation->projects_id !== $project->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:10000',
            'type' => 'nullable|in:text,code,analytics',
            'context' => 'nullable|array',
        ]);

        if (!$project->ai_model) {
            return response()->json(['error' => 'AI not configured for this project'], 400);
        }

        return new StreamedResponse(function () use ($project, $conversation, $validated) {
            try {
                // Prepare context
                $context = $this->buildConversationContext($project, $conversation);
                $context = array_merge($context, $validated['context'] ?? []);

                // Determine the type of response needed
                $responseType = $validated['type'] ?? 'text';

                if ($responseType === 'code') {
                    $this->streamCodeGeneration($project, $validated['message'], $context);
                } elseif ($responseType === 'analytics') {
                    $this->streamAnalyticsGeneration($project, $validated['message'], $context);
                } else {
                    $this->streamGeneralResponse($project, $validated['message'], $context);
                }

            } catch (\Exception $e) {
                Log::error('AI streaming failed', [
                    'project_id' => $project->id,
                    'conversation_id' => $conversation->id,
                    'error' => $e->getMessage(),
                ]);

                echo "data: " . json_encode([
                    'type' => 'error',
                    'content' => 'AI response failed. Please try again.',
                ]) . "\n\n";
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Get conversation messages
     */
    public function getMessages(Projects $project, Conversation $conversation, Request $request)
    {
        $this->authorize('chat', $project);

        if ($conversation->projects_id !== $project->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $conversation->chats()
            ->with(['user', 'agent', 'files', 'replyTo'])
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json([
            'messages' => $messages,
            'conversation' => $conversation,
        ]);
    }

    /**
     * Update conversation
     */
    public function updateConversation(Projects $project, Conversation $conversation, Request $request)
    {
        $this->authorize('chat', $project);

        if ($conversation->projects_id !== $project->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            $conversation->update($validated);

            $this->projectService->logActivity($project, 'conversation_updated', [
                'conversation_id' => $conversation->id,
                'changes' => $validated,
            ]);

            return response()->json([
                'success' => true,
                'conversation' => $conversation,
                'message' => 'Conversation updated successfully!',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update conversation', [
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update conversation.',
            ], 500);
        }
    }

    /**
     * Delete conversation
     */
    public function deleteConversation(Projects $project, Conversation $conversation)
    {
        $this->authorize('chat', $project);

        if ($conversation->projects_id !== $project->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only owner or conversation creator can delete
        if (!$project->isOwner(Auth::id()) && $conversation->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            DB::beginTransaction();

            // Delete related files
            foreach ($conversation->chats as $chat) {
                foreach ($chat->files as $file) {
                    if (file_exists(storage_path('app/public/' . $file->path))) {
                        unlink(storage_path('app/public/' . $file->path));
                    }
                }
            }

            $conversation->delete();

            $this->projectService->logActivity($project, 'conversation_deleted', [
                'conversation_title' => $conversation->title,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Conversation deleted successfully!',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete conversation', [
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete conversation.',
            ], 500);
        }
    }

    /**
     * Pin/Unpin message
     */
    public function togglePinMessage(Projects $project, Conversation $conversation, Chat $chat)
    {
        $this->authorize('chat', $project);

        if ($conversation->projects_id !== $project->id || $chat->conversation_id !== $conversation->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $chat->is_pinned = !$chat->is_pinned;
            $chat->save();

            return response()->json([
                'success' => true,
                'message' => $chat->is_pinned ? 'Message pinned!' : 'Message unpinned!',
                'is_pinned' => $chat->is_pinned,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to toggle pin message', [
                'chat_id' => $chat->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update message.',
            ], 500);
        }
    }

    /**
     * Generate AI response
     */
    private function generateAIResponse(Projects $project, Conversation $conversation, string $message, string $type, ?Agent $agent = null): ?Chat
    {
        try {
            $context = $this->buildConversationContext($project, $conversation, $agent);

            // If agent is specified, use agent-specific instructions
            if ($agent) {
                $agentContext = $this->buildAgentContext($agent, $project);
                $context = array_merge($context, $agentContext);
            }

            $response = match ($type) {
                'code' => $this->deepSeekService->generateCode($message, $project->coding_framework ?? 'general', $context),
                'analytics' => $this->deepSeekService->generatePythonAnalytics($message, $context),
                default => $this->deepSeekService->chat($message, $context),
            };

            if ($response && isset($response['content'])) {
                return $conversation->chats()->create([
                    'message' => $response['content'],
                    'role' => 'assistant',
                    'type' => $type,
                    'metadata' => [
                        'ai_model' => $project->ai_model,
                        'response_type' => $type,
                        'tokens_used' => $response['usage'] ?? null,
                        'agent_id' => $agent?->id,
                        'agent_name' => $agent?->name,
                        'timestamp' => now()->toISOString(),
                    ],
                ]);
            }

        } catch (\Exception $e) {
            Log::error('AI response generation failed', [
                'project_id' => $project->id,
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
            ]);
        }

        return null;
    }

    /**
     * Build conversation context for AI
     */
    private function buildConversationContext(Projects $project, Conversation $conversation, ?Agent $agent = null): array
    {
        $recentMessages = $conversation->chats()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->reverse()
            ->map(function ($chat) {
                return [
                    'role' => $chat->role,
                    'content' => $chat->message,
                    'type' => $chat->type,
                ];
            })
            ->toArray();

        return [
            'project' => [
                'title' => $project->title,
                'description' => $project->description,
                'type' => $project->project_type,
                'framework' => $project->coding_framework,
                'analytics_enabled' => $project->analytics_enabled,
            ],
            'conversation' => [
                'title' => $conversation->title,
                'type' => $conversation->type,
                'recent_messages' => $recentMessages,
            ],
            'user_preferences' => [
                'language' => Auth::user()->language ?? 'en',
            ],
        ];
    }

    /**
     * Stream code generation
     */
    private function streamCodeGeneration(Projects $project, string $prompt, array $context): void
    {
        $this->deepSeekService->streamCodeGeneration($prompt, $project->coding_framework ?? 'general', $context, function ($chunk) {
            echo "data: " . json_encode([
                'type' => 'code_chunk',
                'content' => $chunk,
            ]) . "\n\n";
            ob_flush();
            flush();
        });

        echo "data: " . json_encode(['type' => 'done']) . "\n\n";
    }

    /**
     * Stream analytics generation
     */
    private function streamAnalyticsGeneration(Projects $project, string $prompt, array $context): void
    {
        $this->deepSeekService->streamPythonAnalytics($prompt, $context, function ($chunk) {
            echo "data: " . json_encode([
                'type' => 'analytics_chunk',
                'content' => $chunk,
            ]) . "\n\n";
            ob_flush();
            flush();
        });

        echo "data: " . json_encode(['type' => 'done']) . "\n\n";
    }

    /**
     * Stream general response
     */
    private function streamGeneralResponse(Projects $project, string $prompt, array $context): void
    {
        $this->deepSeekService->streamChat($prompt, $context, function ($chunk) {
            echo "data: " . json_encode([
                'type' => 'text_chunk',
                'content' => $chunk,
            ]) . "\n\n";
            ob_flush();
            flush();
        });

        echo "data: " . json_encode(['type' => 'done']) . "\n\n";
    }

    /**
     * Build agent-specific context
     */
    private function buildAgentContext(Agent $agent, Projects $project): array
    {
        $agentContext = [
            'agent' => [
                'name' => $agent->name,
                'description' => $agent->description,
                'type' => $agent->type,
                'capabilities' => $agent->getCapabilities(),
                'available_tools' => $agent->getAvailableTools(),
                'custom_instructions' => $agent->getCustomInstructions(),
                'is_system_agent' => $agent->isSystemAgent(),
            ],
            'instructions' => []
        ];

        // Add agent's custom instructions
        if ($agent->getCustomInstructions()) {
            $agentContext['instructions'][] = $agent->getCustomInstructions();
        }

        // Add capability-specific instructions
        $capabilities = $agent->getCapabilities();

        if (in_array('code_generation', $capabilities)) {
            $agentContext['instructions'][] = "Focus on writing clean, efficient, and well-documented code. Follow best practices for the specified framework: " . ($project->coding_framework ?? 'general');
        }

        if (in_array('data_analysis', $capabilities)) {
            $agentContext['instructions'][] = "Provide detailed data analysis with clear explanations of methodology and findings. Include visualizations when appropriate.";
        }

        if (in_array('project_planning', $capabilities)) {
            $agentContext['instructions'][] = "Break down tasks into manageable steps with realistic timelines. Consider project constraints and resources.";
        }

        if (in_array('documentation_writing', $capabilities)) {
            $agentContext['instructions'][] = "Create comprehensive, well-structured documentation with clear examples and proper formatting.";
        }

        if (in_array('automated_testing', $capabilities)) {
            $agentContext['instructions'][] = "Focus on code quality, test coverage, and identifying potential issues. Suggest improvements for maintainability and performance.";
        }

        // Add tool-specific context
        $tools = $agent->getAvailableTools();
        if (!empty($tools)) {
            $agentContext['available_tools_context'] = "You have access to the following tools: " . implode(', ', $tools) . ". Use them appropriately to enhance your responses.";
        }

        return $agentContext;
    }
}
