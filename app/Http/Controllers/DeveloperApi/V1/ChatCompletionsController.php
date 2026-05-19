<?php

namespace App\Http\Controllers\DeveloperApi\V1;

use App\Http\Controllers\Controller;
use App\Models\DeveloperApiKey;
use App\Services\DeveloperApiChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatCompletionsController extends Controller
{
    public function __construct(private readonly DeveloperApiChatService $chatService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'model' => 'required|string',
            'messages' => 'required|array|min:1',
            'messages.*.role' => 'required|string|in:system,user,assistant',
            'messages.*.content' => 'required',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'top_p' => 'nullable|numeric|min:0|max:1',
            'max_tokens' => 'nullable|integer|min:1|max:32768',
            'stream' => 'nullable|boolean',
            'user' => 'nullable|string|max:255',
        ]);

        if ((bool) ($validated['stream'] ?? false)) {
            return $this->errorResponse(
                'Streaming is not available on the Developer API yet.',
                'invalid_request_error',
                'unsupported_feature',
                400
            );
        }

        /** @var DeveloperApiKey $apiKey */
        $apiKey = $request->attributes->get('developer_api_key');

        try {
            $result = $this->chatService->complete($apiKey, $validated);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 'invalid_request_error', 'invalid_request', 400);
        } catch (\RuntimeException $e) {
            $isInsufficient = str_contains($e->getMessage(), 'Insufficient');
            $status = $isInsufficient ? 402 : 502;
            $code = $isInsufficient ? 'insufficient_credits' : 'upstream_error';
            $type = $isInsufficient ? 'billing_error' : 'api_error';
            return $this->errorResponse($e->getMessage(), $type, $code, $status);
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
                'logprobs' => null,
                'finish_reason' => $result['finish_reason'],
            ]],
            'usage' => $result['usage'],
        ]);
    }

    private function errorResponse(string $message, string $type, string $code, int $status): JsonResponse
    {
        return response()->json([
            'error' => [
                'message' => $message,
                'type' => $type,
                'param' => null,
                'code' => $code,
            ],
        ], $status);
    }
}
