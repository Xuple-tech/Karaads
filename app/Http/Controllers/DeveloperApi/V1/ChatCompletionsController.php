<?php

namespace App\Http\Controllers\DeveloperApi\V1;

use App\Http\Controllers\Controller;
use App\Models\DeveloperApiKey;
use App\Services\DeveloperApiChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatCompletionsController extends Controller
{
    public function __construct(private readonly DeveloperApiChatService $chatService)
    {
    }

    public function store(Request $request): JsonResponse|StreamedResponse
    {
        $validated = $request->validate([
            'model' => 'required|string',
            'messages' => 'required|array|min:1',
            'messages.*.role' => 'required|string|in:system,user,assistant',
            'messages.*.content' => 'required',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'top_p' => 'nullable|numeric|min:0|max:1',
            'max_tokens' => 'nullable|integer|min:1|max:16384',
            'stream' => 'nullable|boolean',
            'user' => 'nullable|string|max:255',
        ]);

        /** @var DeveloperApiKey $apiKey */
        $apiKey = $request->attributes->get('developer_api_key');

        try {
            $result = $this->chatService->complete($apiKey, $validated);
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), 'invalid_request_error', 'invalid_request', 400);
        } catch (\RuntimeException $exception) {
            $status = $exception->getMessage() === 'Insufficient credits.' ? 402 : 502;
            $code = $status === 402 ? 'insufficient_credits' : 'upstream_error';
            $type = $status === 402 ? 'billing_error' : 'api_error';
            return $this->error($exception->getMessage(), $type, $code, $status);
        }

        if ((bool) ($validated['stream'] ?? false)) {
            return response()->stream(function () use ($result) {
                $id = $result['request_id'];
                $chunks = preg_split('/(\s+)/', $result['content'], -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

                foreach ($chunks as $chunk) {
                    echo 'data: ' . json_encode([
                        'id' => $id,
                        'object' => 'chat.completion.chunk',
                        'created' => now()->timestamp,
                        'model' => $result['model']->public_id,
                        'choices' => [[
                            'index' => 0,
                            'delta' => ['content' => $chunk],
                            'finish_reason' => null,
                        ]],
                    ], JSON_UNESCAPED_UNICODE) . "\n\n";
                    @ob_flush();
                    flush();
                }

                echo 'data: ' . json_encode([
                    'id' => $id,
                    'object' => 'chat.completion.chunk',
                    'created' => now()->timestamp,
                    'model' => $result['model']->public_id,
                    'choices' => [[
                        'index' => 0,
                        'delta' => (object) [],
                        'finish_reason' => $result['finish_reason'],
                    ]],
                ]) . "\n\n";
                echo "data: [DONE]\n\n";
                @ob_flush();
                flush();
            }, 200, [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache, no-transform',
                'X-Accel-Buffering' => 'no',
            ]);
        }

        return response()->json([
            'id' => $result['request_id'],
            'object' => 'chat.completion',
            'created' => now()->timestamp,
            'model' => $result['model']->public_id,
            'choices' => [[
                'index' => 0,
                'message' => [
                    'role' => 'assistant',
                    'content' => $result['content'],
                ],
                'finish_reason' => $result['finish_reason'],
            ]],
            'usage' => $result['usage'],
            'billing' => $result['billing'],
        ]);
    }

    private function error(string $message, string $type, string $code, int $status): JsonResponse
    {
        return response()->json([
            'error' => [
                'message' => $message,
                'type' => $type,
                'code' => $code,
            ],
        ], $status);
    }
}
