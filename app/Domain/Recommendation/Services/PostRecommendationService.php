<?php

namespace App\Domain\Recommendation\Services;

use App\Domain\Recommendation\Fallback\SafePopularFallback;
use App\Domain\Recommendation\RecommendationConfigService;
use App\Domain\Recommendation\RecommendationContext;
use App\Domain\Recommendation\Scoring\FeatureExtractor;
use App\Domain\Recommendation\Scoring\WeightedScorer;
use App\Models\Post;
use Illuminate\Support\Collection;

class PostRecommendationService
{
    public function __construct(
        private readonly RecommendationConfigService $configService,
        private readonly FeatureExtractor $featureExtractor,
        private readonly WeightedScorer $weightedScorer,
        private readonly SafePopularFallback $fallback,
    ) {}

    /**
     * @param  Collection<int, Post>  $candidates
     * @return Collection<int, Post>
     */
    public function rank(Collection $candidates, RecommendationContext $context, int $limit = 200): Collection
    {
        $config = $this->configService->runtimeConfig('post', $context->surface, $context->slot, $context->userId);
        $weights = (array) ($config['weights'] ?? []);
        $thresholds = (array) ($config['thresholds'] ?? []);
        $minScore = (float) ($thresholds['min_score'] ?? 0.05);
        $maxFreq = (int) ($thresholds['max_freq_per_user_24h'] ?? 30);

        $scored = $candidates->take($limit)
            ->map(function (Post $post) use ($context, $weights, $minScore, $maxFreq) {
                $features = $this->featureExtractor->forPost($post, $context);
                if (((float) ($features['diversity'] ?? 1.0)) <= max(0, 1 - ($maxFreq / 30))) {
                    return null;
                }

                $scorePayload = $this->weightedScorer->score($features, $weights);
                if ($scorePayload['score'] < $minScore) {
                    return null;
                }

                $post->setAttribute('reco_score', $scorePayload['score']);
                $post->setAttribute('reco_breakdown', $scorePayload['breakdown']);

                return $post;
            })
            ->filter()
            ->values();

        if ($scored->isEmpty()) {
            return collect($this->fallback->posts($context->surface, 50, $context->userId))
                ->filter(fn ($post) => $post instanceof Post);
        }

        $ordered = $scored->sortByDesc(fn (Post $post) => (float) $post->getAttribute('reco_score'))->values();

        // Light diversity pass: avoid repeating the same author in adjacent positions.
        $result = collect();
        $remaining = $ordered->values();
        $lastAuthor = null;
        while ($remaining->isNotEmpty()) {
            $index = $remaining->search(fn (Post $post) => $post->user_id !== $lastAuthor);
            if ($index === false) {
                $index = 0;
            }
            $picked = $remaining->pull($index);
            $result->push($picked);
            $lastAuthor = $picked->user_id;
            $remaining = $remaining->values();
        }

        return $result->values();
    }
}
