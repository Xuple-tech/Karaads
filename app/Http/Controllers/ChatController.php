<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Conversation;
use App\Services\GrokApiService;
use App\Services\SearchService;
use App\Services\SubscriptionService;
use App\Services\LimitResponseService;
use App\Services\ChatPersonalizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ChatController extends Controller
{
    protected $ollamaCloud;
    protected $searchService;
    protected $subscriptionService;

    public function __construct(GrokApiService $grok_api_service, SearchService $searchService, SubscriptionService $subscriptionService)
    {
        $this->ollamaCloud = $grok_api_service;
        $this->searchService = $searchService;
        $this->subscriptionService = $subscriptionService;
    }

    public function index()
    {
      
        $component = match (request()->route()->getName()) {
            'home' => 'welcome',
            'app' => 'chat/interface',
            'new' => 'new',
            default => 'welcome',
        };
        if(auth('web')->user() ){
            // if(!auth('web')->user()->email_verified_at){
            //     return redirect('/verify-email');
            // }
            if($component != 'new'){
                return redirect('/new');
            }
        }

        return Inertia::render($component);
    }

    public function privacyPolicy()
    {
        return Inertia::render('PrivacyPolicy');
    }

    /**
     * Create a new conversation
     */
    public function create(Request $request)
    {
        try {
            $title =  'New Chat';
            $canvasMode = $request->input('canvas_mode', false);

            $conversation = Conversation::create([
                'user_id' => Auth::id(),
                'title' => $title,
                'canvas_mode' => $canvasMode,
                'context' => $request->input('context', [])
            ]);

            // If this is the first conversation, make it the active one
            $conversationsCount = Conversation::where('user_id', Auth::id())->count();
            if ($conversationsCount === 1) {
                session(['current_conversation_id' => $conversation->id]);
            }

            return response()->json([
                'success' => true,
                'conversation' => $conversation,
                'message' => 'Conversation created successfully',
                "id" => $conversation->id,
                "title" => $conversation->title
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create conversation'
            ], 500);
        }
    }

    /**
     * Show a specific conversation
     */
    public function show(Conversation $conversation)
    {
        try {
            if($conversation->type == 'voice' || $conversation->hasVoiceConversations()) {
                return redirect()->route('voice.chat', ['conversation' => $conversation->id]);
            }
            if(strtolower($conversation->title) == 'voice chat' ) {
                return redirect()->route('voice.chat', ['conversation' => $conversation->id]);
            }
            $conversation->load(['chats' => function ($query) {
                $query->orderBy('created_at', 'asc')->with('files');
            }]);

            // Check if user owns this conversation
            if ($conversation->user_id !== Auth::id()) {
                abort(403, 'Unauthorized access to this conversation.');
            }

            // Update session with current conversation
            session(['current_conversation_id' => $conversation->id]);

            $conversations = $this->getUserConversations();

            return Inertia::render('Chat', [
                'conversation' => $conversation,
                // 'conversations' => $conversations,
                'isAuthenticated' => Auth::check(),
                'user' => Auth::user(),
                'chats' => $conversation->chats,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching conversation: ' . $e->getMessage());
            abort(404, 'Conversation not found');
        }
    }

    /**
     * Get all conversations for the user
     */
    public function list()
    {
        try {
            $conversations = $this->getUserConversations();

            return response()->json([
                'success' => true,
                'cg_' => $conversations
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching conversations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch conversations'
            ], 500);
        }
    }

    /**
     * Update conversation title or settings
     */
    public function update(Request $request, $id)
    {
        try {
            $conversation = Conversation::where('user_id', Auth::id())->findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'canvas_mode' => 'sometimes|boolean',
                'context' => 'sometimes|array'
            ]);

            $conversation->update($validated);

            return response()->json([
                'success' => true,
                'conversation' => $conversation,
                'message' => 'Conversation updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update conversation'
            ], 500);
        }
    }

    /**
     * Delete a conversation
     */
    public function destroy($id)
    {
        try {
            $conversation = Conversation::where('user_id', Auth::id())->findOrFail($id);

            // Delete associated chats
            $conversation->chats()->delete();
            $conversation->delete();

            // Clear session if this was the current conversation
            if (session('current_conversation_id') == $id) {
                session()->forget('current_conversation_id');
            }

            return response()->json([
                'success' => true,
                'message' => 'Conversation deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete conversation'
            ], 500);
        }
    }

    /**
     * Clear all conversations for the user
     */
    public function clearAll()
    {
        try {
            $conversations = Conversation::where('user_id', Auth::id())->get();

            foreach ($conversations as $conversation) {
                $conversation->chats()->delete();
                $conversation->delete();
            }

            session()->forget('current_conversation_id');

            return response()->json([
                'success' => true,
                'message' => 'All conversations cleared successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error clearing conversations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to clear conversations'
            ], 500);
        }
    }

    /**
     * Main chat endpoint with enhanced tool calling
     */
    public function chat(Request $request)
    {
        // $request->validate([
        //     'message' => 'required|nullable',
        //     'conversation_id' => 'nullable|integer|exists:conversations,id',
        //     'stream' => 'boolean|nullable',
        //     'enable_tools' => 'boolean|nullable',
        //     'canvas_mode' => 'boolean|nullable',
        //     'model' => 'sometimes|string',
        //     'files' => 'sometimes|array'
        // ]);

        $message = $request->input('message');
        $stream = $request->input('stream', true);
        $conversationId = $request->input('conversation_id');
        $enableTools = $request->input('enable_tools', true);
        $canvasMode = $request->input('canvas_mode', false);
        $model = $request->input('model', 'grok-4-fast-reasoning');
        $files = $request->input('files', []);

        try {
            // Check if user has hit any limits before processing
            $limitCheck = $this->ollamaCloud->checkChatLimits(Auth::user());
            if ($limitCheck !== null) {
                // User has hit a limit - return structured response
                return response()->json($limitCheck, 429);
            }
            // Get or create conversation
            $conversation = $this->getOrCreateConversation($conversationId, $message, $canvasMode);

            // Store user message
            $userChat = $conversation->chats()->create([
                'message' => $message,
                'role' => 'user',
                'type' => 'text',
                'metadata' => [
                    'enable_tools' => $enableTools,
                    'canvas_mode' => $canvasMode,
                    'model' => $model
                ]
            ]);

            // Store files if provided
            if (!empty($files)) {
                foreach ($files as $file) {
                    $this->storeFileForChat($userChat, $file);
                }
            }

            // Get conversation history
            $history = $this->getConversationHistory($conversation);

            // Build personalized system prompt based on user preferences
            $user = Auth::user();
            $customSystemPrompt = $user ?  ChatPersonalizationService::buildSystemPrompt($user) : "";

            if ($stream) {
                return $this->handleStreamingChat($message, $history, $conversation, $enableTools, $model, $canvasMode, $files, $customSystemPrompt, false, $user->name ?? null);
            } else {
                return $this->handleNonStreamingChat($message, $history, $conversation, $enableTools, $model, $files, $customSystemPrompt, false, $user->name ?? null);
            }
        } catch (\Exception $e) {
            Log::error('Chat error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to process your message: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle streaming chat response
     */
    private function handleStreamingChat($message, $history, $conversation, $enableTools, $model, $canvasMode, $files = [], $customSystemPrompt = null, $callByName = false, $userName = null)
    {
        return response()->stream(function () use ($message, $history, $conversation, $enableTools, $model, $canvasMode, $files, $customSystemPrompt, $callByName, $userName) {
            try {
                // Create assistant message record
                $assistantChat = $conversation->chats()->create([
                    'message' => '',
                    'thinking' => '',
                    'role' => 'assistant',
                    'metadata' => [
                        'model' => $model,
                        'canvas_mode' => $canvasMode,
                        'tools_enabled' => $enableTools
                    ]
                ]);

                $fullResponse = '';
                $thinkingContent = '';
                $toolResults = [];

                // Send message ID for frontend reference
                $this->sendStreamResponse(['message_id' => $assistantChat->id]);

                // Prepare canvas format if needed
                $format = $canvasMode ? $this->getCanvasFormat() : null;

                $this->ollamaCloud->generateStreamingChat(
                    $message,
                    function ($chunk) use (&$fullResponse, &$thinkingContent, &$toolResults, $assistantChat, $conversation) {
                        // Handle tool status updates
                        if (isset($chunk['tool_status'])) {
                            $statusResponse = $this->formatToolStatusResponse($chunk);
                            $this->sendStreamResponse($statusResponse);

                            // If images were generated, include them
                            if (isset($chunk['generated_images'])) {
                                foreach ($chunk['generated_images'] as $image) {
                                    $this->sendStreamResponse([
                                        'image' => [
                                            'url' => $image['url'],
                                            'revised_prompt' => $image['revised_prompt'] ?? '',
                                            'metadata' => ['source' => 'generated']
                                        ]
                                    ]);
                                }
                            }

                            // Store tool results in metadata when tool completes
                            if ($chunk['tool_status'] === 'tool_completed' && isset($chunk['tool_result'])) {
                                $currentMetadata = $assistantChat->metadata ?? [];
                                if (!isset($currentMetadata['tool_results'])) {
                                    $currentMetadata['tool_results'] = [];
                                }
                                $currentMetadata['tool_results'][] = [
                                    'tool_name' => $chunk['tool_name'] ?? 'unknown',
                                    'result' => $chunk['tool_result']
                                ];
                                $assistantChat->update(['metadata' => $currentMetadata]);

                                // Check if tool result indicates to stop generation (for image generation)
                                if (isset($chunk['tool_result']['stop_generation']) && $chunk['tool_result']['stop_generation'] === true) {
                                    // Send completion signal to stop AI response
                                    $this->sendStreamResponse(['done' => true, 'stopped_by_tool' => true]);

                                    // Update conversation's updated_at timestamp
                                    $conversation->touch();

                                    // Record subscription usage for authenticated users
                                    if (Auth::check()) {
                                        $tokensEstimate = ceil(strlen($fullResponse) / 4);
                                        $this->subscriptionService->recordRequest(
                                            Auth::user(),
                                            $tokensEstimate,
                                            [
                                                'model' => 'Default',
                                                'enable_tools' => true,
                                                'message_type' => 'image_generation',
                                                'stream' => true,
                                                'stopped_by_tool' => true
                                            ]
                                        );
                                    }
                                    return; // Stop processing further chunks
                                }
                            }

                            return;
                        }

                        // Handle content updates
                        if (isset($chunk['content'])) {
                            $fullResponse .= $chunk['content'];
                            $thinkingContent .= $chunk['thinking'] ?? '';

                            // Update the assistant message incrementally
                            $assistantChat->update([
                                'message' => $fullResponse,
                                'thinking' => $thinkingContent
                            ]);

                            $responseData = [
                                'content' => $chunk['content'],
                                'thinking' => $chunk['thinking'] ?? ''
                            ];

                            // Add canvas data if present
                            if (isset($chunk['canvas_sections'])) {
                                $responseData['canvas_sections'] = $chunk['canvas_sections'];
                            }
                            if (isset($chunk['canvas_summary'])) {
                                $responseData['canvas_summary'] = $chunk['canvas_summary'];
                            }

                            $this->sendStreamResponse($responseData);
                        }

                        // Handle completion
                        if (isset($chunk['done'])) {
                            $this->sendStreamResponse(['done' => true]);

                            // Update conversation's updated_at timestamp
                            $conversation->touch();

                            // Record subscription usage for authenticated users after streaming completes
                            if (Auth::check() && !empty($fullResponse)) {
                                $tokensEstimate = ceil(strlen($fullResponse) / 4); // Rough estimate: 1 token ≈ 4 characters
                                $this->subscriptionService->recordRequest(
                                    Auth::user(),
                                    $tokensEstimate,
                                    [
                                        'model' => 'Default',
                                        'enable_tools' => Null,
                                        'message_type' => 'text',
                                        'stream' => true
                                    ]
                                );
                            }
                        }

                        // Handle errors
                        if (isset($chunk['error'])) {
                            $this->sendStreamResponse(['error' => $chunk['error']]);
                            Log::error('Streaming error: ' . $chunk['error']);
                        }
                    },
                    $model,
                    $history,
                    [], // tools - let AI decide
                    $format,
                    $enableTools, // auto tools
                    $files,
                    $customSystemPrompt,
                    $callByName,
                    $userName,
                    $assistantChat->id
                );
            } catch (\Exception $e) {
                Log::error('Chat streaming error: ' . $e->getMessage());
                $this->sendStreamResponse(['error' => 'An error occurred while processing your message']);
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive'
        ]);
    }

    /**
     * Handle non-streaming chat response
     */
    private function handleNonStreamingChat($message, $history, $conversation, $enableTools, $model, $files = [], $customSystemPrompt = null, $callByName = false, $userName = null)
    {
        try {
            // Create assistant message record first
            $assistantChat = $conversation->chats()->create([
                'message' => '',
                'role' => 'assistant',
                'metadata' => [
                    'model' => $model,
                    'tools_enabled' => $enableTools
                ]
            ]);

            $response = $this->ollamaCloud->generateChat(
                $message,
                $model,
                $history,
                $enableTools ? $this->ollamaCloud->getTools() : [],
                null,
                $files,
                $customSystemPrompt,
                $callByName,
                $userName,
                $assistantChat->id
            );

            // Update the assistant message with the response
            $assistantChat->update(['message' => $response]);

            $conversation->touch();

            // Record subscription usage for authenticated users
            if (Auth::check()) {
                $tokensEstimate = ceil(strlen($response) / 4); // Rough estimate: 1 token ≈ 4 characters
                $this->subscriptionService->recordRequest(
                    Auth::user(),
                    $tokensEstimate,
                    [
                        'model' => $model,
                        'enable_tools' => $enableTools,
                        'message_type' => 'text'
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'response' => $response,
                'conversation_id' => $conversation->id
            ]);
        } catch (\Exception $e) {
            Log::error('Non-streaming chat error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Format tool status response
     */
    private function formatToolStatusResponse(array $chunk): array
    {
        $status = $chunk['tool_status'] ?? 'unknown';

        $response = match ($status) {
            'executing_tools' => [
                'tool_status' => 'starting',
                'message' => 'Starting tool execution...',
                'count' => $chunk['count'] ?? 1
            ],
            'executing_tool' => $this->getToolExecutingMessage($chunk),
            'tool_completed' => [
                'tool_status' => 'completed',
                'tool_name' => $chunk['tool_name'] ?? 'unknown',
                'result_summary' => $chunk['result_summary'] ?? 'Tool completed'
            ],
            'tool_failed' => [
                'tool_status' => 'failed',
                'tool_name' => $chunk['tool_name'] ?? 'unknown',
                'error' => $chunk['error'] ?? 'Tool execution failed'
            ],
            'continuing_conversation' => [
                'tool_status' => 'continuing',
                'message' => 'Processing results...'
            ],
            default => [
                'tool_status' => $status,
                'message' => 'Tool operation in progress...'
            ]
        };

        // Preserve login_required and type flags from chunk
        if (isset($chunk['login_required'])) {
            $response['login_required'] = $chunk['login_required'];
        }
        if (isset($chunk['type'])) {
            $response['type'] = $chunk['type'];
        }

        return $response;
    }


    /**
     * Handle tool status updates during streaming (legacy)
     */
    private function handleToolStatus(array $chunk): void
    {
        $statusResponse = $this->formatToolStatusResponse($chunk);
        $this->sendStreamResponse($statusResponse);
    }

    /**
     * Send stream response
     */
    private function sendStreamResponse(array $data): void
    {
        echo "data: " . json_encode($data) . "\n\n";
        ob_flush();
        flush();
    }

    /**
     * Get or create conversation
     */
    private function getOrCreateConversation($conversationId, string $message, bool $canvasMode = false): Conversation
    {
        if ($conversationId) {
            $conversation = Conversation::find($conversationId);
            if ($conversation && $conversation->user_id === Auth::id()) {
                // Update canvas mode if changed
                if ($conversation->canvas_mode != $canvasMode) {
                    $conversation->update(['canvas_mode' => $canvasMode]);
                }
                return $conversation;
            }
        }

        // Create new conversation
        $title = $this->generateConversationTitle($message);

        return Conversation::create([
            'user_id' => Auth::id(),
            'title' => $title,
            'canvas_mode' => $canvasMode
        ]);
    }

    /**
     * Store a file attachment for a chat message
     */
    private function storeFileForChat($chat, $fileData)
    {
        try {
            // Extract base64 data and metadata
            $filename = $fileData['name'] ?? 'file';
            $mimeType = $fileData['type'] ?? 'application/octet-stream';
            $base64Data = $fileData['data'] ?? '';

            // Remove data URL prefix if present (e.g., "data:image/png;base64,")
            if (strpos($base64Data, 'data:') === 0) {
                $base64Data = substr($base64Data, strpos($base64Data, ',') + 1);
            }

            // Decode base64 to binary
            $fileContent = base64_decode($base64Data);
            if ($fileContent === false) {
                Log::warning("Failed to decode base64 for file: {$filename}");
                return;
            }

            // Generate unique filepath
            $hash = hash('sha256', $fileContent);
            $extension = pathinfo($filename, PATHINFO_EXTENSION) ?: 'tmp';
            $storagePath = 'chat-files/' . Auth::id() . '/' . $hash . '.' . $extension;

            // Check if file already exists (duplicate prevention)
            $existingFile = \App\Models\ChatFile::where('hash', $hash)
                ->where('user_id', Auth::id())
                ->first();

            if ($existingFile) {
                // Link existing file to this chat
                $existingFile->replicate()
                    ->fill([
                        'chat_id' => $chat->id,
                        'user_id' => Auth::id()
                    ])
                    ->save();
                return;
            }

            // Store the file
            Storage::put($storagePath, $fileContent);

            // Get file size
            $fileSize = strlen($fileContent);

            // Save file metadata to database
            \App\Models\ChatFile::create([
                'chat_id' => $chat->id,
                'user_id' => Auth::id(),
                'filename' => $filename,
                'filepath' => $storagePath,
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'hash' => $hash,
                'status' => 'processed',
                'metadata' => [
                    'uploaded_at' => now()->toIso8601String(),
                    'source' => 'chat_upload'
                ]
            ]);

            Log::info("File stored successfully: {$filename} (Hash: {$hash})");
        } catch (\Exception $e) {
            Log::error("Error storing file: " . $e->getMessage());
        }
    }

    /**
     * Get conversation history
     */
    private function getConversationHistory(Conversation $conversation): array
    {
        return $conversation->chats()
            ->orderBy('created_at', 'asc')
            ->with('files') // Eager load files
            ->get()
            ->map(function ($chat) {
                $data = [
                    'role' => $chat->role,
                    'content' => $chat->message
                ];

                // Include files if they exist
                if ($chat->files && $chat->files->count() > 0) {
                    $data['files'] = $chat->files->map(function ($file) {
                        return [
                            'id' => $file->id,
                            'filename' => $file->filename,
                            'filepath' => $file->filepath,
                            'mime_type' => $file->mime_type,
                            'file_size' => $file->file_size,
                            'hash' => $file->hash,
                            'status' => $file->status,
                            'url' => $file->url
                        ];
                    })->toArray();
                }

                return $data;
            })
            ->toArray();
    }

    /**
     * Generate conversation title
     */
    private function generateConversationTitle(string $message): string
    {
        try {
            // Use AI to generate title for longer messages
            // if (strlen($message) > 20) {
            //     return $this->ollamaCloud->generateTitle($message);
            // }

            // Use first 50 chars of message as temporary title
            // return substr($message, 0, 50) . (strlen($message) > 50 ? '...' : '');
            return 'New Conversation';
        } catch (\Exception $e) {
            Log::warning('Title generation failed: ' . $e->getMessage());
            return 'New Conversation';
        }
    }

    /**
     * Get canvas format for structured responses
     */
    private function getCanvasFormat(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'sections' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'title' => ['type' => 'string'],
                            'content' => ['type' => 'string']
                        ],
                        'required' => ['title', 'content']
                    ]
                ],
                'summary' => ['type' => 'string']
            ],
            'required' => ['sections', 'summary']
        ];
    }

    /**
     * Get user conversations
     */
    private function getUserConversations()
    {
        if (!Auth::check()) {
            return [];
        }

        return Conversation::where('user_id', Auth::id())
            // ->where('type', '!=', 'voice')
            ->withCount('chats')
            ->with(['chats' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(1);
            }])
            ->orderBy('updated_at', 'desc')
            ->limit(request()->get('limit', 10))
            ->offset(request()->get('offset', 0))
            ->get()
            ->map(function ($conversation) {
                return [
                    'id' => $conversation->id,
                    'title' => $conversation->title,
                    'canvas_mode' => $conversation->canvas_mode,
                    'chats_count' => $conversation->chats_count,
                    'last_message' => $conversation->chats->first()->message ?? '',
                    'last_message_time' => $conversation->chats->first()->created_at ?? $conversation->updated_at,
                    'created_at' => $conversation->created_at,
                    'updated_at' => $conversation->updated_at
                ];
            });
    }

    /**
     * Web search endpoint for manual searches
     */
    public function webSearch(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:500',
            'max_results' => 'nullable|integer|min:1|max:10'
        ]);

        $query = $request->input('query');
        $maxResults = $request->input('max_results', 5);

        try {
            $results = $this->searchService->search($query, $maxResults);

            return response()->json([
                'success' => true,
                'query' => $query,
                'results' => $results['results'],
                'summary' => $results['summary'],
                'result_count' => $results['result_count']
            ]);
        } catch (\Exception $e) {
            Log::error('Web search error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Search failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Regenerate message
     */
    public function regenerateMessage(Request $request, $messageId)
    {
        try {
            $chat = Chat::findOrFail($messageId);
            $conversation = $chat->conversation;

            if ($conversation->user_id !== Auth::id()) {
                abort(403, 'Unauthorized');
            }

            // Get the user message that prompted this response
            $userMessage = $conversation->chats()
                ->where('role', 'user')
                ->where('created_at', '<', $chat->created_at)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$userMessage) {
                return response()->json([
                    'success' => false,
                    'error' => 'No user message found to regenerate from'
                ], 400);
            }

            // Get history up to the user message
            $history = $conversation->chats()
                ->where('created_at', '<=', $userMessage->created_at)
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($chat) {
                    return [
                        'role' => $chat->role,
                        'content' => $chat->message
                    ];
                })
                ->toArray();

            // Remove the current assistant message
            $conversation->chats()
                ->where('created_at', '>=', $chat->created_at)
                ->where('role', 'assistant')
                ->delete();

            // Create new chat request
            $newRequest = new Request([
                'message' => $userMessage->message,
                'conversation_id' => $conversation->id,
                'stream' => $request->input('stream', true),
                'enable_tools' => $request->input('enable_tools', true),
                'canvas_mode' => $conversation->canvas_mode,
                'model' => $chat->metadata['model'] ?? 'gpt-oss:120b-cloud'
            ]);

            return $this->chat($newRequest);
        } catch (\Exception $e) {
            Log::error('Message regeneration error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to regenerate message'
            ], 500);
        }
    }

    /**
     * Get conversation statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_conversations' => Conversation::where('user_id', Auth::id())->count(),
                'total_messages' => Chat::whereHas('conversation', function ($query) {
                    $query->where('user_id', Auth::id());
                })->count(),
                'today_messages' => Chat::whereHas('conversation', function ($query) {
                    $query->where('user_id', Auth::id());
                })->whereDate('created_at', today())->count(),
            ];

            return response()->json([
                'success' => true,
                'statistics' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Statistics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    /**
     * Generate content for canvas
     */
    public function generateCanvasContent(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string',
            'language' => 'required|string',
            'model' => 'sometimes|string'
        ]);

        $model = $request->input('model', 'grok-4');

        try {
            $content = $this->ollamaCloud->generateContent($request->prompt, $request->language, $model);

            return response()->json([
                'success' => true,
                'content' => $content
            ]);
        } catch (\Exception $e) {
            Log::error('Generate content error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export conversation
     */
    public function export($id)
    {
        try {
            $conversation = Conversation::with(['chats' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }])->where('user_id', Auth::id())->findOrFail($id);

            $exportData = [
                'title' => $conversation->title,
                'created_at' => $conversation->created_at,
                'updated_at' => $conversation->updated_at,
                'messages' => $conversation->chats->map(function ($chat) {
                    return [
                        'role' => $chat->role,
                        'content' => $chat->message,
                        'timestamp' => $chat->created_at,
                        'thinking' => $chat->thinking
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'conversation' => $exportData
            ]);
        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to export conversation'
            ], 500);
        }
    }
    // In ChatController.php - add these new methods
    /**
     * Handle direct image editing with uploaded files
     */
    public function editImage(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string',
            'conversation_id' => 'nullable|integer|exists:conversations,id',
            'number_of_images' => 'nullable|integer|min:1|max:4',
            'files' => 'required|array|min:1',
            'files.*.name' => 'required|string',
            'files.*.type' => 'required|string',
            'files.*.data' => 'required|string'
        ]);

        $prompt = $request->input('prompt');
        $conversationId = $request->input('conversation_id');
        $numberOfImages = $request->input('number_of_images', 1);
        $files = $request->input('files', []);

        try {
            // Check if user has hit any limits before processing
            $limitCheck = $this->ollamaCloud->checkImageLimits($numberOfImages, Auth::user());
            if ($limitCheck !== null) {
                return response()->json($limitCheck, 429);
            }

            // Get or create conversation
            $conversation = $this->getOrCreateConversation($conversationId, $prompt, false);

            // Store user message
            $userChat = $conversation->chats()->create([
                'message' => $prompt,
                'role' => 'user',
                'type' => 'image_edit_request',
                'metadata' => [
                    'action' => 'edit_image',
                    'files_count' => count($files),
                    'number_of_images' => $numberOfImages
                ]
            ]);

            // Store files if provided
            if (!empty($files)) {
                foreach ($files as $file) {
                    $this->storeFileForChat($userChat, $file);
                }
            }

            // Process files for editing
            $processedFiles = $this->ollamaCloud->openAIImageService->processUploadedFiles($files);

            // Edit images using GPT Image 1
            $editResult = $this->ollamaCloud->openAIImageService->createImageEdit(
                images: $processedFiles,
                prompt: $prompt,
                model: 'gpt-image-1',
                n: $numberOfImages,
                size: '1024x1024',
                quality: 'high',
                background: 'auto',
                output_format: 'png'
            );

            // Store assistant response with edited image data
            $assistantChat = $conversation->chats()->create([
                'message' => "I've edited the uploaded images based on your instructions: \"{$prompt}\"",
                'role' => 'assistant',
                'type' => 'image_edit',
                'metadata' => [
                    'edited_images' => $editResult['images'],
                    'edit_data' => [
                        'prompt' => $prompt,
                        'model' => 'gpt-image-1',
                        'input_files_count' => count($files),
                        'output_images_count' => $numberOfImages
                    ]
                ]
            ]);

            return response()->json([
                'success' => true,
                'type' => 'image_edit',
                'edited_images' => $editResult['images'],
                'conversation_id' => $conversation->id,
                'edit_prompt' => $prompt,
                'message' => 'Images edited successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Image edit error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to edit images: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create image variations (DALL-E 2 only)
     */
    public function createImageVariations(Request $request)
    {
        $request->validate([
            'image_path' => 'required|string',
            'conversation_id' => 'nullable|integer|exists:conversations,id',
            'number_of_variations' => 'nullable|integer|min:1|max:10'
        ]);

        $imagePath = $request->input('image_path');
        $conversationId = $request->input('conversation_id');
        $numberOfVariations = $request->input('number_of_variations', 2);

        try {
            // Check if user has hit any limits before processing
            $limitCheck = $this->ollamaCloud->checkImageLimits($numberOfVariations, Auth::user());
            if ($limitCheck !== null) {
                return response()->json($limitCheck, 429);
            }

            // Get or create conversation
            $conversation = $this->getOrCreateConversation($conversationId, 'Create image variations', false);

            // Create variations using DALL-E 2
            $variationsResult = $this->ollamaCloud->openAIImageService->createImageVariations(
                imagePath: $imagePath,
                model: 'dall-e-2',
                n: $numberOfVariations,
                size: '1024x1024'
            );

            // Store assistant response
            $assistantChat = $conversation->chats()->create([
                'message' => "I've created {$numberOfVariations} variations of your image",
                'role' => 'assistant',
                'type' => 'image_variations',
                'metadata' => [
                    'variations' => $variationsResult['images'],
                    'variation_data' => [
                        'original_image' => $imagePath,
                        'model' => 'dall-e-2',
                        'variations_count' => $numberOfVariations
                    ]
                ]
            ]);

            return response()->json([
                'success' => true,
                'type' => 'image_variations',
                'variations' => $variationsResult['images'],
                'conversation_id' => $conversation->id,
                'message' => 'Image variations created successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Image variations error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create image variations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available image models and their capabilities
     */
    public function getImageModels()
    {
        try {
            $models = $this->ollamaCloud->openAIImageService->getAvailableModels();

            return response()->json([
                'success' => true,
                'models' => $models
            ]);
        } catch (\Exception $e) {
            Log::error('Get image models error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch image models'
            ], 500);
        }
    }
    // In ChatController.php - update getToolExecutingMessage method
    private function getToolExecutingMessage(array $chunk): array
    {
        $toolName = $chunk['tool_name'] ?? 'unknown';
        $toolArgs = $chunk['tool_args'] ?? [];

        $message = match ($toolName) {
            'web_search' => "Searching web for: \"{$toolArgs['query']}\"",
            'web_fetch' => "Fetching webpage: {$toolArgs['url']}",
            'generate_image' => "Generating image ",
            'edit_image' => "Editing uploaded images: \"{$toolArgs['edit_prompt']}\" with GPT Image 1",
            default => "Using tool: {$toolName}"
        };

        return [
            'tool_status' => 'executing',
            'tool_name' => $toolName,
            'message' => $message
        ];
    }
}
