<?php

namespace App\Services;

use App\Models\ApiModel;
use Illuminate\Support\Collection;

class DeveloperApiModelCatalogService
{
    public function textModels(): Collection
    {
        $this->ensureFallbackModels();

        return ApiModel::query()
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('model_type')->orWhere('model_type', 'text'))
            ->orderBy('public_id')
            ->get();
    }

    public function findTextModel(string $publicId): ?ApiModel
    {
        $this->ensureFallbackModels();

        $resolvedId = $this->resolveRequestedModelId($publicId);

        return ApiModel::query()
            ->where('public_id', $resolvedId)
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('model_type')->orWhere('model_type', 'text'))
            ->first();
    }

    public function publicModelId(string $storedId): string
    {
        return $this->publicIdMap()[$storedId] ?? $storedId;
    }

    public function supportsStreaming(ApiModel $model): bool
    {
        return (bool) $model->supports_streaming && (bool) config('developer-api.enable_streaming', false);
    }

    private function resolveRequestedModelId(string $publicId): string
    {
        $aliases = array_flip($this->publicIdMap());

        return $aliases[$publicId] ?? $publicId;
    }

    private function ensureFallbackModels(): void
    {
        foreach ($this->fallbackModels() as $attributes) {
            ApiModel::query()->firstOrCreate(
                ['public_id' => $attributes['public_id']],
                $attributes
            );
        }
    }

    private function fallbackModels(): array
    {
        return [
            [
                'public_id' => 'grok-4',
                'name' => 'Kwati',
                'description' => 'Advanced reasoning, coding, and visual processing capabilities.',
                'model_type' => 'text',
                'upstream_provider' => 'xai',
                'upstream_model' => 'grok-4',
                'input_price_per_1m_tokens' => 0,
                'output_price_per_1m_tokens' => 0,
                'provider_input_price_per_1m_tokens' => 0,
                'provider_output_price_per_1m_tokens' => 0,
                'max_context_tokens' => 131072,
                'supports_reasoning' => true,
                'supports_streaming' => true,
                'supports_tools' => true,
                'is_active' => true,
            ],
            [
                'public_id' => 'grok-4-fast-non-reasoning',
                'name' => 'Kwati Fast',
                'description' => 'General purpose model with strong performance.',
                'model_type' => 'text',
                'upstream_provider' => 'xai',
                'upstream_model' => 'grok-4-fast-non-reasoning',
                'input_price_per_1m_tokens' => 0,
                'output_price_per_1m_tokens' => 0,
                'provider_input_price_per_1m_tokens' => 0,
                'provider_output_price_per_1m_tokens' => 0,
                'max_context_tokens' => 131072,
                'supports_reasoning' => false,
                'supports_streaming' => true,
                'supports_tools' => true,
                'is_active' => true,
            ],
            [
                'public_id' => 'grok-4-fast-reasoning',
                'name' => 'Kwati Reasoning',
                'description' => 'Reasoning-focused model for more deliberate responses.',
                'model_type' => 'text',
                'upstream_provider' => 'xai',
                'upstream_model' => 'grok-4-fast-reasoning',
                'input_price_per_1m_tokens' => 0,
                'output_price_per_1m_tokens' => 0,
                'provider_input_price_per_1m_tokens' => 0,
                'provider_output_price_per_1m_tokens' => 0,
                'max_context_tokens' => 131072,
                'supports_reasoning' => true,
                'supports_streaming' => true,
                'supports_tools' => true,
                'is_active' => true,
            ],
        ];
    }

    private function publicIdMap(): array
    {
        return [
            'grok-4' => 'kwati',
            'grok-4-fast-non-reasoning' => 'kwati-fast',
            'grok-4-fast-reasoning' => 'kwati-reasoning',
        ];
    }
}
