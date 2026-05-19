<?php

namespace App\Http\Controllers\DeveloperApi\V1;

use App\Http\Controllers\Controller;
use App\Services\DeveloperApiChatService;
use Illuminate\Http\JsonResponse;

class ModelsController extends Controller
{
    public function __construct(
        private readonly DeveloperApiChatService $chatService,
        private readonly \App\Services\DeveloperApiModelCatalogService $modelCatalog,
    )
    {
    }

    public function index(): JsonResponse
    {
        $data = $this->chatService->listModels()->map(fn ($model) => [
            'id' => $this->modelCatalog->publicModelId($model->public_id),
            'object' => 'model',
            'created' => $model->created_at?->timestamp ?? now()->timestamp,
            'owned_by' => config('app.name', 'kwati'),
            'name' => $model->name,
            'description' => $model->description,
            'max_context_tokens' => $model->max_context_tokens,
            'supports_streaming' => $this->modelCatalog->supportsStreaming($model),
            'supports_tools' => (bool) $model->supports_tools,
        ])->values();

        return response()->json([
            'object' => 'list',
            'data' => $data,
        ]);
    }
}
