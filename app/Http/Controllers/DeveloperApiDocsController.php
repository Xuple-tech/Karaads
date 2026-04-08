<?php

namespace App\Http\Controllers;

use App\Models\ApiModel;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperApiDocsController extends Controller
{
    public function index(): Response
    {
        $models = ApiModel::where('is_active', true)
            ->where(fn ($q) => $q->whereNull('model_type')->orWhere('model_type', 'text'))
            ->orderBy('public_id')
            ->get()
            ->map(fn ($m) => [
                'public_id' => $m->public_id,
                'name' => $m->name,
                'description' => $m->description,
                'max_context_tokens' => $m->max_context_tokens,
                'supports_streaming' => (bool) $m->supports_streaming,
                'supports_tools' => (bool) $m->supports_tools,
            ]);

        return Inertia::render('Docs/Api', [
            'models' => $models,
            'apiBaseUrl' => rtrim((string) config('developer-api.api_base_url', url('')), '/') . '/v1',
            'appName' => config('app.name', 'Kwati AI'),
        ]);
    }
}
