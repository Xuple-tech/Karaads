<?php

namespace App\Domain\Recommendation\Scoring;

use App\Domain\Recommendation\RecommendationContext;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdCreative;
use App\Models\Post;
use App\Models\Recommendation\RecoEntityPerformanceDaily;
use App\Models\Recommendation\RecoUserEntityStatsDaily;
use App\Models\Recommendation\RecoUserInterestProfile;

class FeatureExtractor
{
    /** @var array<string, array<string, float|int|string|null>> */
    private array $entityPerformanceCache = [];

    /** @var array<string, array<string, float|int|string|null>> */
    private array $userEntityStatsCache = [];

    /** @var array<string, array<string, mixed>> */
    private array $userInterestsCache = [];

    /**
     * @return array<string, float>
     */
    public function forAd(AdCampaign $campaign, AdCreative $creative, RecommendationContext $context): array
    {
        $perf = $this->entityPerformance('ad', $creative->id, $context->surface);
        $userStats = $this->userEntityStats($context->userId, 'ad', $creative->id);
        $interests = $this->userInterests($context->userId, 'ad');

        $budgetTotal = max(0.000001, (float) $campaign->budget_total);
        $spent = max(0, (float) $campaign->spent);
        $remainingRatio = max(0.0, min(1.0, ($budgetTotal - $spent) / $budgetTotal));
        $pacing = $campaign->pacing_type === 'accelerated'
            ? (0.8 + $remainingRatio * 0.2)
            : (0.5 + $remainingRatio * 0.5);

        $mediaTypeAffinity = (float) (($interests['media_type'][$creative->media_type ?? 'unknown'] ?? 0) / 10);
        $surfaceAffinity = (float) (($interests['surface'][$context->surface] ?? 0) / 10);
        $affinity = $this->clamp(($mediaTypeAffinity + $surfaceAffinity) / 2);

        $freqPenalty = $this->clamp(1 - ((float) ($userStats['impressions'] ?? 0) / 10));
        $bidNorm = $this->clamp((float) $campaign->bid_amount / 10);
        $quality = $this->clamp(((float) ($creative->quality_score ?? 1.0)) / 2);
        $ctr = $this->clamp((float) ($perf['ctr'] ?? 0));
        $completion = $this->clamp((float) ($perf['completion_rate'] ?? 0));

        return [
            'bid' => $bidNorm,
            'quality' => $quality,
            'affinity' => $affinity,
            'completion' => $completion,
            'ctr' => $ctr,
            'pacing' => $this->clamp($pacing * $freqPenalty),
        ];
    }

    /**
     * @return array<string, float>
     */
    public function forPost(Post $post, RecommendationContext $context): array
    {
        $perf = $this->entityPerformance('post', $post->id, $context->surface);
        $userStats = $this->userEntityStats($context->userId, 'post', $post->id);
        $interests = $this->userInterests($context->userId, 'post');

        $ageMinutes = max(1, now()->diffInMinutes($post->created_at));
        $recency = $this->clamp(exp(-$ageMinutes / 7200));

        $mediaType = $post->media->first()?->file_type ?? 'text';
        $mediaAffinity = (float) (($interests['media_type'][$mediaType] ?? 0) / 10);
        $authorAffinity = (float) (($interests['author'][$post->user_id] ?? 0) / 10);
        $categoryAffinity = (float) (($interests['category'][$post->primary_category ?? 'general'] ?? 0) / 10);
        $affinity = $this->clamp(($mediaAffinity * 0.35) + ($authorAffinity * 0.35) + ($categoryAffinity * 0.30));

        $engagementPrior = $this->clamp(((float) $post->like_count + ((float) $post->comment_count * 1.5) + ((float) $post->repost_count * 2.0)) / 500);
        $ctr = $this->clamp((float) ($perf['ctr'] ?? 0));
        $completion = $this->clamp((float) ($perf['completion_rate'] ?? 0));
        $diversity = $this->clamp(1 - ((float) ($userStats['impressions'] ?? 0) / 20));

        return [
            'recency' => $recency,
            'affinity' => $affinity,
            'engagement_prior' => $engagementPrior,
            'completion' => $completion,
            'ctr' => $ctr,
            'diversity' => $diversity,
        ];
    }

    /**
     * @return array<string, float|int|string|null>
     */
    private function entityPerformance(string $entityType, string $entityId, string $surface): array
    {
        $cacheKey = $entityType . '|' . $entityId . '|' . $surface;
        if (isset($this->entityPerformanceCache[$cacheKey])) {
            return $this->entityPerformanceCache[$cacheKey];
        }

        $row = RecoEntityPerformanceDaily::query()
            ->where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->where('surface', $surface)
            ->where('date', '>=', now()->subDays(7)->toDateString())
            ->selectRaw('SUM(impressions) as impressions, SUM(clicks) as clicks, SUM(completions) as completions')
            ->first();

        $impressions = max(1, (int) ($row?->impressions ?? 0));
        $clicks = (int) ($row?->clicks ?? 0);
        $completions = (int) ($row?->completions ?? 0);

        return $this->entityPerformanceCache[$cacheKey] = [
            'ctr' => $clicks / $impressions,
            'completion_rate' => $completions / $impressions,
        ];
    }

    /**
     * @return array<string, float|int|string|null>
     */
    private function userEntityStats(?string $userId, string $entityType, string $entityId): array
    {
        if (! $userId) {
            return ['impressions' => 0];
        }

        $cacheKey = $userId . '|' . $entityType . '|' . $entityId;
        if (isset($this->userEntityStatsCache[$cacheKey])) {
            return $this->userEntityStatsCache[$cacheKey];
        }

        $row = RecoUserEntityStatsDaily::query()
            ->where('user_id', $userId)
            ->where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->where('date', '>=', now()->subDay()->toDateString())
            ->selectRaw('SUM(impressions) as impressions')
            ->first();

        return $this->userEntityStatsCache[$cacheKey] = ['impressions' => (int) ($row?->impressions ?? 0)];
    }

    /**
     * @return array<string, mixed>
     */
    private function userInterests(?string $userId, string $entityType): array
    {
        if (! $userId) {
            return [];
        }

        $cacheKey = $userId . '|' . $entityType;
        if (isset($this->userInterestsCache[$cacheKey])) {
            return $this->userInterestsCache[$cacheKey];
        }

        return $this->userInterestsCache[$cacheKey] = (array) RecoUserInterestProfile::query()
            ->where('user_id', $userId)
            ->where('entity_type', $entityType)
            ->value('interests');
    }

    private function clamp(float $value): float
    {
        return max(0.0, min(1.0, $value));
    }
}
