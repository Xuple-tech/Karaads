<?php

namespace App\Http\Controllers\DeveloperApi\V1;

use App\Http\Controllers\Controller;
use App\Models\DeveloperApiKey;
use App\Services\DeveloperApiImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImageGenerationsController extends Controller
{
    public function __construct(private readonly DeveloperApiImageService $imageService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'model' => 'required|string',
            'prompt' => 'required|string|max:10000',
            'n' => 'nullable|integer|min:1|max:10',
            'size' => 'nullable|string|max:32',
            'response_format' => 'nullable|string|in:b64_json,url',
        ]);

        /** @var DeveloperApiKey $apiKey */
        $apiKey = $request->attributes->get('developer_api_key');

        try {
            $result = $this->imageService->generate($apiKey, $validated);
        } catch (\InvalidArgumentException $exception) {
            return $this->error($exception->getMessage(), 'invalid_request_error', 'invalid_request', 400);
        } catch (\RuntimeException $exception) {
            $status = $exception->getMessage() === 'Insufficient credits.' ? 402 : 502;
            $code = $status === 402 ? 'insufficient_credits' : 'upstream_error';
            $type = $status === 402 ? 'billing_error' : 'api_error';

            return $this->error($exception->getMessage(), $type, $code, $status);
        }

        return response()->json([
            'created' => $result['created'],
            'data' => $result['images'],
            'model' => $result['model']->public_id,
            'usage' => $result['usage'],
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
