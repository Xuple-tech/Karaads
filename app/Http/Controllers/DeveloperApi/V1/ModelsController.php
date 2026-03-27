<?php

namespace App\Http\Controllers\DeveloperApi\V1;

use App\Http\Controllers\Controller;
use App\Services\DeveloperApiChatService;
use Illuminate\Http\JsonResponse;

class ModelsController extends Controller
{
    public function __construct(private readonly DeveloperApiChatService $chatService)
    {
    }

    public function index(): JsonResponse
    {
        $data = $this->chatService->listModels()->map(fn ($model) => [
            'id' => $model->public_id,
            'object' => 'model',
            'created' => $model->created_at?->timestamp ?? now()->timestamp,
            'owned_by' => 'kwati',
            'type' => $model->model_type,
            'max_context_tokens' => $model->max_context_tokens,
            'supports_reasoning' => $model->supports_reasoning,
            'supports_streaming' => $model->supports_streaming,
        ])->values();

        return response()->json([
            'object' => 'list',
            'data' => $data,
        ]);
    }
}
