<?php

namespace App\Http\Controllers\Api\Widget;

use App\Http\Controllers\Controller;
use App\Models\AgentConversation;
use App\Models\AgentMessage;
use App\Models\AIAgent;
use App\Services\WidgetGrokService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use League\CommonMark\CommonMarkConverter;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    protected WidgetGrokService $widgetGrokService;

    public function __construct(WidgetGrokService $widgetGrokService)
    {
        $this->widgetGrokService = $widgetGrokService;
    }
    public function sendMessage(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'message' => 'required|string',
            'widget_id' => 'required|string',
            'attachments' => 'nullable|array',
            'stream' => 'boolean',
        ]);

        // Get conversation
        $conversation = AgentConversation::where('session_id', $request->session_id)
            ->with(['aiAgent'])
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'error' => 'Session not found'
            ], 404);
        }

        $agent = $conversation->aiAgent;

        // Save user message
        $userMessage = AgentMessage::create([
            'id' => Str::uuid(),
            'conversation_id' => $conversation->id,
            'agent_id' => $agent->id,
            'sender_type' => 'user',
            'content' => $request->message,
            'attachments' => $request->attachments,
            'is_read' => true,
            'read_at' => now(),
        ]);

        // Update conversation
        $conversation->increment('message_count');
        $conversation->update(['last_message_at' => now()]);

        // Get AI response
        if (!$request->boolean('stream')) {
            return $this->streamDeepSeekResponse($this->apiKey, $agent, $request->message, $conversation);
        } else {
            return $this->regularDeepSeekResponse($this->apiKey, $agent, $request->message, $conversation);
        }
    }

    public function deepseekChat(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'message' => 'required|string',
            'widget_id' => 'required|string',
            'stream' => 'boolean',
            'model' => 'nullable|string',
        ]);

        // Get conversation and agent with knowledge base
        $conversation = AgentConversation::where('session_id', $request->session_id)
            ->with(['aiAgent.knowledgeBase' => function($query) {
                $query->where('is_active', true)->orderBy('order');
            }])
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'error' => 'Session not found'
            ], 404);
        }

        $agent = $conversation->aiAgent;

        // Save user message
        $userMessage = AgentMessage::create([
            'id' => Str::uuid(),
            'conversation_id' => $conversation->id,
            'agent_id' => $agent->id,
            'sender_type' => 'user',
            'content' => $request->message,
            'is_read' => true,
            'read_at' => now(),
        ]);

        // Update conversation
        $conversation->increment('message_count');
        $conversation->update(['last_message_at' => now()]);

        // Process with Grok xAI
        return $this->processWithGrok($agent, $request->message, $conversation, $request->boolean('stream', true), $request->input('modelssa', 'grok-4-fast-non-reasoning'));
    }

    private function processWithGrok($agent, $message, $conversation, $stream = true, $model = 'grok-4-fast-non-reasoning')
    {
        try {
            // Get conversation history for context
            $history = $this->getConversationHistory($conversation, 10);

            // Prepare history for Grok API
            $formattedHistory = [];
            foreach ($history as $msg) {
                $formattedHistory[] = [
                    'role' => $msg->sender_type === 'user' ? 'user' : 'assistant',
                    'content' => $msg->content
                ];
            }

            // Use custom system prompt if available
            $customSystemPrompt = $agent->behavior_profile ?: null;

            if ($stream) {
                return $this->streamGrokResponse($agent, $message, $conversation, $formattedHistory, $model, $customSystemPrompt);
            } else {
                return $this->regularGrokResponse($agent, $message, $conversation, $formattedHistory, $model, $customSystemPrompt);
            }
        } catch (\Exception $e) {
            Log::error('Grok processing error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to process request: ' . $e->getMessage()
            ], 500);
        }
    }

    private function streamGrokResponse($agent, $message, $conversation, $history, $model, $customSystemPrompt)
    {
        $response = new StreamedResponse(function () use ($agent, $message, $conversation, $history, $model, $customSystemPrompt) {
            try {
                $aiMessageId = Str::uuid();
                $aiMessageContent = '';
                $toolResults = [];

                // Callback to handle streaming chunks and tool calls
                $callback = function ($data, $final) use (&$aiMessageContent, &$toolResults) {
                    // Handle tool status updates
                    if (isset($data['tool_status'])) {
                        $toolStatus = $data['tool_status'];

                        // Send tool status to client
                        if ($toolStatus === 'executing_tool') {
                            echo "data: " . json_encode([
                                'tool_status' => 'executing',
                                'tool_name' => $data['tool_name'] ?? 'unknown',
                                'tool_message' => $data['tool_executing_message'] ?? 'Processing...'
                            ]) . "\n\n";
                            flush();
                        } elseif ($toolStatus === 'tool_completed') {
                            // Handle completed tools
                            $toolName = $data['tool_name'] ?? 'unknown';

                            // Send tool completion data
                            $toolData = ['tool_status' => 'completed', 'tool_name' => $toolName];

                            // Handle image generation results
                            if ($toolName === 'generate_image' && isset($data['generated_images'])) {
                                $toolData['images'] = $data['generated_images'];
                                $toolResults['images'] = $data['generated_images'];
                            }

                            // Handle web search results
                            if ($toolName === 'web_search' && isset($data['references'])) {
                                $toolData['references'] = $data['references'];
                                $toolResults['references'] = $data['references'];
                            }

                            echo "data: " . json_encode($toolData) . "\n\n";
                            flush();
                        } elseif ($toolStatus === 'tool_failed') {
                            echo "data: " . json_encode([
                                'tool_status' => 'failed',
                                'tool_name' => $data['tool_name'] ?? 'unknown',
                                'error' => $data['error'] ?? 'Tool execution failed'
                            ]) . "\n\n";
                            flush();
                        }

                        return;
                    }

                    // Handle content streaming
                    if (isset($data['content'])) {
                        $content = $data['content'];
                        $aiMessageContent .= $content;

                        // Send content to client
                        echo "data: " . json_encode(['content' => $content]) . "\n\n";
                        flush();
                    }

                    // Handle completion
                    if (isset($data['done']) && $data['done']) {
                        echo "data: [DONE]\n\n";
                        flush();
                    }
                };

                // Call Widget Grok streaming API with tools enabled
                $this->widgetGrokService->generateStreamingChat(
                    prompt: $message,
                    callback: $callback,
                    agent: $agent,
                    model: $model,
                    history: $history,
                    enableTools: true
                );

                // Save the complete AI message
                if (!empty($aiMessageContent)) {
                    $converter = new CommonMarkConverter([
                        'html_input' => 'strip',
                        'allow_unsafe_links' => false,
                    ]);

                    $htmlContent = $converter->convert($aiMessageContent)->getContent();

                    // Save with tool results metadata
                    $this->saveAIMessage($conversation, $aiMessageId, $aiMessageContent, $model, $htmlContent, $toolResults);
                }

            } catch (\Exception $e) {
                Log::error('Grok streaming error: ' . $e->getMessage());
                echo "data: " . json_encode(['error' => $e->getMessage()]) . "\n\n";
                flush();
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('X-Accel-Buffering', 'no');
        $response->headers->set('Access-Control-Allow-Origin', '*');

        return $response;
    }

    private function saveAIMessage($conversation, $messageId, $markdownContent, $model = 'grok-4-fast-non-reasoning', $htmlContent = null, $toolResults = [])
    {
        // Estimate tokens
        $tokensUsed = ceil(strlen($markdownContent) / 4);

        try {
            // If HTML content not provided, convert markdown
            if (!$htmlContent) {
                $converter = new CommonMarkConverter([
                    'html_input' => 'strip',
                    'allow_unsafe_links' => false,
                ]);
                $htmlContent = $converter->convert($markdownContent)->getContent();
            }

            // Prepare metadata with tool results
            $metadata = [
                'html' => $htmlContent
            ];

            if (!empty($toolResults)) {
                $metadata['tool_results'] = $toolResults;
            }

            $aiMessage = AgentMessage::create([
                'id' => $messageId,
                'conversation_id' => $conversation->id,
                'agent_id' => $conversation->agent_id,
                'sender_type' => 'agent',
                'content' => $markdownContent,
                'content_parsed' => $metadata,
                'model' => $model,
                'tokens_used' => $tokensUsed,
                'processing_time' => null,
            ]);

            // Update conversation
            $conversation->increment('message_count');
            $conversation->update(['last_message_at' => now()]);

            return $aiMessage;
        } catch (\Exception $e) {
            error_log('Failed to save AI message: ' . $e->getMessage());
            return null;
        }
    }
    private function regularGrokResponse($agent, $message, $conversation, $history, $model, $customSystemPrompt)
    {
        // For widgets, always use streaming for better UX
        // Redirect to streaming response
        return $this->streamGrokResponse($agent, $message, $conversation, $history, $model, $customSystemPrompt);
    }


    public function getMessages($conversationId)
    {
        $conversation = AgentConversation::find($conversationId);

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'error' => 'Conversation not found'
            ], 404);
        }

        $messages = AgentMessage::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'sender_type' => $message->sender_type,
                    'content' => $message->content,
                    'timestamp' => $message->created_at->toISOString(),
                    'is_read' => $message->is_read,
                    'attachments' => $message->attachments,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'conversation_id' => $conversationId,
                'messages' => $messages,
                'total' => $messages->count(),
            ]
        ]);
    }

    public function deleteMessage($messageId)
    {
        $message = AgentMessage::find($messageId);

        if (!$message) {
            return response()->json([
                'success' => false,
                'error' => 'Message not found'
            ], 404);
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully'
        ]);
    }

    public function createConversation(Request $request)
    {
        // This is for authenticated agent API
        $agent = $request->get('agent');

        $request->validate([
            'visitor_id' => 'required|string',
            'page_url' => 'nullable|url',
            'title' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $conversation = AgentConversation::create([
            'id' => Str::uuid(),
            'agent_id' => $agent->id,
            'session_id' => Str::random(32),
            'visitor_id' => $request->visitor_id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'page_url' => $request->page_url,
            'title' => $request->title ?: 'Chat Session',
            'status' => 'active',
            'started_at' => now(),
            'last_message_at' => now(),
            'metadata' => $request->metadata,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'conversation_id' => $conversation->id,
                'session_id' => $conversation->session_id,
                'started_at' => $conversation->started_at->toISOString(),
            ]
        ]);
    }

    public function createMessage(Request $request)
    {
        // This is for authenticated agent API
        $agent = $request->get('agent');

        $request->validate([
            'conversation_id' => 'required|string',
            'sender_type' => 'required|in:user,agent,system',
            'content' => 'required|string',
            'attachments' => 'nullable|array',
        ]);

        $conversation = AgentConversation::where('id', $request->conversation_id)
            ->where('agent_id', $agent->id)
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'error' => 'Conversation not found'
            ], 404);
        }

        $message = AgentMessage::create([
            'id' => Str::uuid(),
            'conversation_id' => $conversation->id,
            'agent_id' => $agent->id,
            'sender_type' => $request->sender_type,
            'content' => $request->content,
            'attachments' => $request->attachments,
            'is_read' => $request->sender_type === 'user',
            'read_at' => $request->sender_type === 'user' ? now() : null,
        ]);

        // Update conversation
        $conversation->increment('message_count');
        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'success' => true,
            'data' => [
                'message_id' => $message->id,
                'conversation_id' => $conversation->id,
                'sender_type' => $message->sender_type,
                'content' => $message->content,
                'timestamp' => $message->created_at->toISOString(),
            ]
        ]);
    }

    private function getConversationHistory($conversation, $limit = 10)
    {
        return AgentMessage::where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse();
    }
}
