<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Chat;
use App\Services\GrokApiService;
use App\Services\ChatPersonalizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    protected $grokService;

    public function __construct(GrokApiService $grokService)
    {
        $this->grokService = $grokService;
    }

    public function createConversation(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'canvas_mode' => 'boolean',
            'context' => 'nullable|array'
        ]);

        try {
            $conversation = Conversation::create([
                'user_id' => Auth::id(),
                'title' => $request->input('title', 'New Chat'),
                'canvas_mode' => $request->input('canvas_mode', false),
                'context' => $request->input('context', [])
            ]);

            return response()->json([
                'success' => true,
                'conversation' => $conversation,
                'message' => 'Conversation created successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create conversation'
            ], 500);
        }
    }

    public function listConversations()
    {
        try {
            $conversations = Conversation::where('user_id', Auth::id())
                ->with(['chats' => function ($query) {
                    $query->select('id', 'conversation_id', 'message', 'role', 'created_at')
                        ->orderBy('created_at', 'desc')
                        ->limit(1);
                }])
                ->orderBy('updated_at', 'desc')
                ->get()
                ->map(function ($conversation) {
                    return [
                        'id' => $conversation->id,
                        'title' => $conversation->title,
                        'canvas_mode' => $conversation->canvas_mode,
                        'created_at' => $conversation->created_at,
                        'updated_at' => $conversation->updated_at,
                        'last_message' => $conversation->chats->first()?->message,
                    ];
                });

            return response()->json([
                'success' => true,
                'conversations' => $conversations
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching conversations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch conversations'
            ], 500);
        }
    }

    public function showConversation($id)
    {
        try {
            $conversation = Conversation::where('user_id', Auth::id())
                ->with(['chats' => function ($query) {
                    $query->orderBy('created_at', 'asc');
                }])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'conversation' => $conversation
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Conversation not found'
            ], 404);
        }
    }

    public function updateConversation(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'canvas_mode' => 'sometimes|boolean',
            'context' => 'sometimes|array'
        ]);

        try {
            $conversation = Conversation::where('user_id', Auth::id())->findOrFail($id);
            $conversation->update($request->only(['title', 'canvas_mode', 'context']));

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

    public function deleteConversation($id)
    {
        try {
            $conversation = Conversation::where('user_id', Auth::id())->findOrFail($id);
            $conversation->chats()->delete();
            $conversation->delete();

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

    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'conversation_id' => 'nullable|integer|exists:conversations,id',
            'stream' => 'boolean',
            'enable_tools' => 'boolean',
            'canvas_mode' => 'boolean',
            'model' => 'string',
            'files' => 'array'
        ]);

        try {
            $conversationId = $request->conversation_id;
            $message = $request->message;
            $stream = $request->input('stream', true);
            $enableTools = $request->input('enable_tools', true);
            $canvasMode = $request->input('canvas_mode', false);
            $model = $request->input('model', 'grok-4');
            $files = $request->input('files', []);

            // Get or create conversation
            if (!$conversationId) {
                $conversation = Conversation::create([
                    'user_id' => Auth::id(),
                    'title' => substr($message, 0, 50) . '...',
                    'canvas_mode' => $canvasMode
                ]);
                $conversationId = $conversation->id;
            } else {
                $conversation = Conversation::where('user_id', Auth::id())->findOrFail($conversationId);
            }

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

            // Get conversation history
            $history = $conversation->chats()
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($chat) {
                    return [
                        'role' => $chat->role,
                        'content' => $chat->message,
                        'type' => $chat->type,
                        'metadata' => $chat->metadata
                    ];
                });

            // Build personalized system prompt based on user preferences
            $user = Auth::user();
            $customSystemPrompt = ChatPersonalizationService::buildSystemPrompt($user);

            if ($stream) {
                return $this->handleStreamingResponse($message, $history, $conversation, $enableTools, $model, $canvasMode, $files, $customSystemPrompt, $user);
            } else {
                return $this->handleNonStreamingResponse($message, $history, $conversation, $enableTools, $model, $files, $customSystemPrompt, $user);
            }

        } catch (\Exception $e) {
            Log::error('Chat error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to process message'
            ], 500);
        }
    }

    private function handleStreamingResponse($message, $history, $conversation, $enableTools, $model, $canvasMode, $files, $customSystemPrompt = null, $user = null)
    {
        return response()->stream(function () use ($message, $history, $conversation, $enableTools, $model, $canvasMode, $files, $customSystemPrompt, $user) {
            try {
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

                echo "event: message_id\ndata: " . json_encode(['message_id' => $assistantChat->id]) . "\n\n";

                $format = $canvasMode ? $this->getCanvasFormat() : null;

                // Ensure user is loaded if not passed
                if (!$user) {
                    $user = Auth::user();
                }

                $this->grokService->generateStreamingChat(
                    $message,
                    function ($chunk) use (&$fullResponse, &$thinkingContent, $assistantChat, $conversation) {
                        // Handle tool status updates
                        if (isset($chunk['tool_status'])) {
                            $toolData = [
                                'tool_status' => $chunk['tool_status'],
                                'tool_name' => $chunk['tool_name'] ?? null,
                                'tool_executing_message' => $chunk['tool_executing_message'] ?? null
                            ];

                            // Update metadata with tool status
                            $metadata = $assistantChat->metadata ?? [];
                            $metadata['tool_status'] = $chunk['tool_status'];
                            $metadata['tool_name'] = $chunk['tool_name'] ?? null;
                            $metadata['tool_executing_message'] = $chunk['tool_executing_message'] ?? null;

                            $assistantChat->update(['metadata' => $metadata]);

                            echo "data: " . json_encode($toolData) . "\n\n";
                        }

                        // Handle generated images - send each image as individual events
                        if (isset($chunk['generated_images']) && is_array($chunk['generated_images'])) {
                            foreach ($chunk['generated_images'] as $image) {
                                $imageData = [
                                    'image' => [
                                        'url' => $image['url'] ?? '',
                                        'metadata' => [
                                            'text_response' => $image['revised_prompt'] ?? ''
                                        ]
                                    ]
                                ];
                                echo "data: " . json_encode($imageData) . "\n\n";
                            }
                        }

                        // Handle web search results and references
                        if (isset($chunk['search_results']) && isset($chunk['references'])) {
                            $searchData = [
                                'search_results' => $chunk['search_results'],
                                'search_query' => $chunk['search_query'] ?? '',
                                'search_count' => $chunk['search_count'] ?? 0,
                                'references' => $chunk['references'] ?? []
                            ];
                            echo "data: " . json_encode($searchData) . "\n\n";
                        }

                        // Handle regular content
                        if (isset($chunk['content'])) {
                            $fullResponse .= $chunk['content'];
                            $thinkingContent .= $chunk['thinking'] ?? '';

                            $assistantChat->update([
                                'message' => $fullResponse,
                                'thinking' => $thinkingContent
                            ]);

                            $data = [
                                'content' => $chunk['content'],
                                'thinking' => $chunk['thinking'] ?? ''
                            ];

                            if (isset($chunk['canvas_sections'])) {
                                $data['canvas_sections'] = $chunk['canvas_sections'];
                            }
                            if (isset($chunk['canvas_summary'])) {
                                $data['canvas_summary'] = $chunk['canvas_summary'];
                            }

                            echo "data: " . json_encode($data) . "\n\n";
                        }

                        // Handle completion
                        if (isset($chunk['done'])) {
                            echo "data: " . json_encode(['done' => true]) . "\n\n";
                            $conversation->touch();
                        }

                        // Handle errors
                        if (isset($chunk['error'])) {
                            echo "data: " . json_encode(['error' => $chunk['error']]) . "\n\n";
                            Log::error('Streaming error: ' . $chunk['error']);
                        }
                    },
                    $model,
                    $history,
                    [],
                    $format,
                    $enableTools,
                    $files,
                    $customSystemPrompt,
                    $user->call_by_name ?? false,
                    $user->name
                );
            } catch (\Exception $e) {
                Log::error('Streaming error: ' . $e->getMessage());
                echo "event: error\ndata: " . json_encode(['error' => 'An error occurred']) . "\n\n";
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive'
        ]);
    }

    private function handleNonStreamingResponse($message, $history, $conversation, $enableTools, $model, $files, $customSystemPrompt = null, $user = null)
    {
        $assistantChat = $conversation->chats()->create([
            'message' => '',
            'role' => 'assistant',
            'metadata' => [
                'model' => $model,
                'tools_enabled' => $enableTools
            ]
        ]);

        try {
            // Ensure user is loaded if not passed
            if (!$user) {
                $user = Auth::user();
            }

            $response = $this->grokService->generateChat(
                $message,
                $model,
                $history,
                [],
                $enableTools,
                $files,
                $customSystemPrompt,
                $user->call_by_name ?? false,
                $user->name
            );

            $assistantChat->update(['message' => $response['content'] ?? '']);
            $conversation->touch();

            return response()->json([
                'success' => true,
                'message' => $response['content'] ?? '',
                'message_id' => $assistantChat->id,
                'conversation_id' => $conversation->id
            ]);
        } catch (\Exception $e) {
            $assistantChat->delete();
            throw $e;
        }
    }

    private function getCanvasFormat()
    {
        return [
            'type' => 'object',
            'properties' => [
                'canvas_sections' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'title' => ['type' => 'string'],
                            'content' => ['type' => 'string'],
                            'position' => ['type' => 'object']
                        ]
                    ]
                ],
                'canvas_summary' => ['type' => 'string']
            ],
            'required' => ['canvas_sections']
        ];
    }
}
