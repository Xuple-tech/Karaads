<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AppController extends Controller
{
    protected $geminiService;

    public function __construct()
    {
        $this->geminiService = app('App\Services\GeminiService');
    }

    public function getSessions()
    {
        return Chat::select('session_id')
            ->where('user_id', auth()->id())
            ->distinct()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getSessionMessages($sessionId)
    {
        return Chat::where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function chat(Request $request)
    {
        $sessionId = $request->input('session_id', Str::uuid());
        $message = $request->input('message');
        $stream = $request->input('stream', false);

        if (empty($message)) {
            return response()->json(['error' => 'Message is required'], 400);
        }

        // Get chat history
        $history = Chat::where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($chat) {
                return [
                    'role' => $chat->role,
                    'content' => $chat->content
                ];
            })
            ->toArray();

        // Save user message
        Chat::create([
            'session_id' => $sessionId,
            'role' => 'user',
            'content' => $message,
            'user_id' => auth()->id()
        ]);

        $generationConfig = [
            'temperature' => 0.7,
            'top_p' => 0.9,
            'max_output_tokens' => 1024,
        ];

        if (!$stream) {
            try {
                $response = $this->geminiService->generateChatResponse($message, $history, $generationConfig);

                // Save assistant's response
                Chat::create([
                    'session_id' => $sessionId,
                    'role' => 'assistant',
                    'content' => $response,
                    'user_id' => auth()->id()
                ]);

                return response()->json([
                    'response' => $response,
                    'session_id' => $sessionId
                ]);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Failed to generate response: ' . $e->getMessage()], 500);
            }
        }

        // Streaming response
        return response()->stream(function () use ($message, $history, $generationConfig, $sessionId) {
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            header('Connection: keep-alive');
            header('X-Accel-Buffering: no');

            try {
                $fullResponse = '';

                $this->geminiService->generateTextStream(
                    $message,
                    function ($chunk) use (&$fullResponse) {
                        $fullResponse .= $chunk;
                        echo "data: " . json_encode(['chunk' => $chunk]) . "\n\n";
                        ob_flush();
                        flush();
                    },
                    $generationConfig
                );

                // Save the complete response
                Chat::create([
                    'session_id' => $sessionId,
                    'role' => 'assistant',
                    'content' => $fullResponse,
                    'user_id' => auth()->id()
                ]);

                echo "data: [DONE]\n\n";
            } catch (\Exception $e) {
                echo "data: " . json_encode(['error' => $e->getMessage()]) . "\n\n";
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
    
}
