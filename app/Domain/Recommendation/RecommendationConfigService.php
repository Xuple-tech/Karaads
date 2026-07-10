<?php

namespace App\Domain\Recommendation;

use App\Models\Recommendation\RecoSurfaceConfig;
use Illuminate\Support\Facades\Cache;

class RecommendationConfigService
{
    public function getConfig(string $entityType, string $surface, ?string $slot = null, ?string $userId = null): array
    {
        $cacheKey = sprintf('reco:cfg:%s:%s:%s', $entityType, $surface, $slot ?? '*');

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($entityType, $surface, $slot) {
            $config = RecoSurfaceConfig::query()
                ->where('entity_type', $entityType)
                ->where('surface', $surface)
                ->where('is_active', true)
                ->when($slot, fn ($q) => $q->where(function ($inner) use ($slot) {
                    $inner->where('slot', $slot)->orWhereNull('slot');
                }), fn ($q) => $q->whereNull('slot'))
                ->orderByRaw('slot IS NULL')
                ->first();

            return [
                'weights' => (array) ($config?->weights ?? $this->defaultWeights($entityType)),
                'thresholds' => (array) ($config?->thresholds ?? $this->defaultThresholds($entityType)),
                'config_id' => $config?->id,
                'rollout_mode' => (string) ($config?->rollout_mode ?? 'big_bang'),
                'canary_percentage' => (int) ($config?->canary_percentage ?? 100),
            ];
        });
    }

    public function runtimeConfig(string $entityType, string $surface, ?string $slot = null, ?string $userId = null): array
    {
        $config = $this->getConfig($entityType, $surface, $slot, $userId);
        $rolloutMode = (string) ($config['rollout_mode'] ?? 'big_bang');
        $canaryPercentage = (int) ($config['canary_percentage'] ?? 100);

        $useConfiguredWeights = $this->shouldUseConfiguredWeights($rolloutMode, $canaryPercentage, $userId);
        if (! $useConfiguredWeights) {
            $config['weights'] = $this->defaultWeights($entityType);
            $thresholds = (array) ($config['thresholds'] ?? []);
            $thresholds['ml_effective'] = false;
            $config['thresholds'] = $thresholds;
        } else {
            $thresholds = (array) ($config['thresholds'] ?? []);
            $thresholds['ml_effective'] = true;
            $config['thresholds'] = $thresholds;
        }

        return $config;
    }

    public function defaultWeights(string $entityType): array
    {
        if ($entityType === 'post') {
            return [
                'recency' => 0.25,
                'affinity' => 0.25,
                'engagement_prior' => 0.20,
                'completion' => 0.15,
                'ctr' => 0.05,
                'diversity' => 0.10,
            ];
        }

        return [
            'bid' => 0.35,
            'quality' => 0.20,
            'affinity' => 0.20,
            'completion' => 0.10,
            'ctr' => 0.10,
            'pacing' => 0.05,
        ];
    }

    public function defaultThresholds(string $entityType): array
    {
        return [
            'min_score' => $entityType === 'post' ? 0.05 : 0.10,
            'max_freq_per_user_24h' => $entityType === 'post' ? 30 : 8,
        ];
    }

    public function resetDefaults(): void
    {
        $surfaces = ['feed', 'moments', 'profile'];
        $entityTypes = ['ad', 'post'];

        foreach ($entityTypes as $entityType) {
            foreach ($surfaces as $surface) {
                RecoSurfaceConfig::updateOrCreate(
                    [
                        'entity_type' => $entityType,
                        'surface' => $surface,
                        'slot' => null,
                    ],
                    [
                        'is_active' => true,
                        'rollout_mode' => 'big_bang',
                        'canary_percentage' => 100,
                        'weights' => $this->defaultWeights($entityType),
                        'thresholds' => $this->defaultThresholds($entityType),
                    ],
                );
            }
        }

        Cache::flush();
    }

    private function shouldUseConfiguredWeights(string $rolloutMode, int $canaryPercentage, ?string $userId): bool
    {
        if ($rolloutMode === 'rules_only') {
            return false;
        }
        if ($rolloutMode === 'big_bang') {
            return true;
        }

        // canary mode
        $canaryPercentage = max(0, min(100, $canaryPercentage));
        if ($canaryPercentage === 0) {
            return false;
        }
        if ($canaryPercentage === 100) {
            return true;
        }
        if (! $userId) {
            return false;
        }

        $bucket = crc32($userId) % 100;

        return $bucket < $canaryPercentage;
    }
}
