<?php

namespace App\Http\Controllers;

use App\Services\DeveloperApiModelCatalogService;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperApiDocsController extends Controller
{
    public function __construct(private readonly DeveloperApiModelCatalogService $modelCatalog)
    {
    }

    public function index(): Response
    {
        $models = $this->modelCatalog->textModels()
            ->map(fn ($m) => [
                'public_id' => $this->modelCatalog->publicModelId($m->public_id),
                'name' => $m->name,
                'description' => $m->description,
                'max_context_tokens' => $m->max_context_tokens,
                'supports_streaming' => $this->modelCatalog->supportsStreaming($m),
                'supports_tools' => (bool) $m->supports_tools,
            ]);

        return Inertia::render('Docs/Api', [
            'models' => $models,
            'apiBaseUrl' => rtrim((string) config('developer-api.api_base_url', url('')), '/') . '/api/v1',
            'appName' => config('app.name', 'Kwati AI'),
        ]);
    }

    public function agents(): Response
    {
        return Inertia::render('Docs/Agents', [
            'appName' => config('app.name', 'Kwati AI'),
        ]);
    }
}
