<?php

namespace App\Domain\Recommendation\Fallback;

use App\Models\AdsV2\AdCreative;
use App\Models\Post;
use App\Models\Recommendation\RecoEntityPerformanceDaily;
use Illuminate\Database\Eloquent\Builder;

class SafePopularFallback
{
    public function ad(string $surface): ?AdCreative
    {
        $entityId = RecoEntityPerformanceDaily::query()
            ->where('entity_type', 'ad')
            ->where('surface', $surface)
            ->where('date', '>=', now()->subDays(7)->toDateString())
            ->selectRaw('entity_id, SUM(clicks) as clicks, SUM(impressions) as impressions')
            ->groupBy('entity_id')
            ->orderByRaw('(SUM(clicks) / NULLIF(SUM(impressions), 0)) DESC')
            ->value('entity_id');

        if (! $entityId) {
            return null;
        }

        return AdCreative::query()
            ->where('id', $entityId)
            ->where('status', 'active')
            ->first();
    }

    /**
     * @return array<int, Post>
     */
    public function posts(string $surface, int $limit = 50, ?string $userId = null): array
    {
        $entityIds = RecoEntityPerformanceDaily::query()
            ->where('entity_type', 'post')
            ->where('surface', $surface)
            ->where('date', '>=', now()->subDays(7)->toDateString())
            ->selectRaw('entity_id, SUM(clicks) as clicks, SUM(impressions) as impressions')
            ->groupBy('entity_id')
            ->orderByRaw('(SUM(clicks) / NULLIF(SUM(impressions), 0)) DESC')
            ->limit($limit)
            ->pluck('entity_id')
            ->all();

        if ($entityIds === []) {
            return $this->applyPostFeedScope(
                Post::query()
                    ->latest()
                    ->limit($limit),
                $userId
            )
                ->get()
                ->all();
        }

        $posts = $this->applyPostFeedScope(
            Post::query()->whereIn('id', $entityIds),
            $userId
        )
            ->get()
            ->keyBy('id');

        $ordered = [];
        foreach ($entityIds as $entityId) {
            if (isset($posts[$entityId])) {
                $ordered[] = $posts[$entityId];
            }
        }

        return $ordered;
    }

    private function applyPostFeedScope(Builder $query, ?string $userId): Builder
    {
        $query->whereHas('user')
            ->with([
                'user',
                'media',
                'monetization',
                'originalPost.media',
                'originalPost.user',
                'originalPost.originalPost.media',
                'originalPost.originalPost.user',
                'originalPost.originalPost.originalPost.media',
                'originalPost.originalPost.originalPost.user',
            ]);

        if ($userId) {
            $query->withExists(['likes as user_liked' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }])
                ->withExists(['reposts as user_reshared' => function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                }])
                ->withExists(['bookmarks as user_saved' => function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                }]);
        }

        return $query;
    }
}
