<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\KwatiAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use RuntimeException;

class KwatiAiController extends Controller
{
    public function __construct(
        private readonly KwatiAiService $kwatiAiService,
    ) {}

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'messages' => ['required', 'array', 'min:1', 'max:20'],
            'messages.*.role' => ['required', 'string', Rule::in(['system', 'user', 'assistant'])],
            'messages.*.content' => ['required', 'string', 'max:4000'],
            'use_web_search' => ['sometimes', 'boolean'],
        ]);

        try {
            $result = $this->kwatiAiService->chat(
                (array) $validated['messages'],
                (bool) ($validated['use_web_search'] ?? false),
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 502);
        }

        return response()->json([
            'data' => $result,
        ]);
    }
}
