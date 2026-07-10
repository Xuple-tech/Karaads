<?php

namespace App\Domain\Recommendation\Services;

use App\Models\AdsV2\AdEvent;
use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use App\Models\Recommendation\RecoEntityPerformanceDaily;
use App\Models\Recommendation\RecoUserEntityStatsDaily;
use App\Models\Recommendation\RecoUserInterestProfile;
use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class BehaviorSignalService
{
    public function recordAdEvent(AdEvent $event): void
    {
        if (! $event->creative_id || ! $event->delivery?->placement?->surface) {
            return;
        }

        $surface = $event->delivery->placement->surface;
        $date = now()->toDateString();

        $entity = RecoEntityPerformanceDaily::firstOrCreate(
            [
                'date' => $date,
                'entity_type' => 'ad',
                'entity_id' => $event->creative_id,
                'surface' => $surface,
            ],
            [],
        );

        $this->incrementByEventType($entity, $event->event_type);
        $this->refreshRates($entity);

        if ($event->viewer_user_id) {
            $userEntity = RecoUserEntityStatsDaily::firstOrCreate(
                [
                    'date' => $date,
                    'user_id' => $event->viewer_user_id,
                    'entity_type' => 'ad',
                    'entity_id' => $event->creative_id,
                ],
                [],
            );
            $this->incrementByEventType($userEntity, $event->event_type);
        }

        $this->updateUserInterestsForAd($event);
    }

    public function rebuildDailyStats(string $date): void
    {
        $this->rebuildAdEntityStats($date);
        $this->rebuildPostEntityStats($date);
    }

    public function rebuildUserInterestProfiles(): void
    {
        $this->rebuildAdUserProfiles();
        $this->rebuildPostUserProfiles();
    }

    public function recordPostEvent(Post $post, string $eventType, ?string $userId, string $surface = 'feed'): void
    {
        $date = now()->toDateString();
        $lookup = [
            'date' => $date,
            'entity_type' => 'post',
            'entity_id' => $post->id,
            'surface' => $surface,
        ];

        $entity = RecoEntityPerformanceDaily::query()->where($lookup)->first();
        if (! $entity) {
            try {
                $entity = RecoEntityPerformanceDaily::create($lookup);
            } catch (QueryException) {
                $entity = RecoEntityPerformanceDaily::query()->where($lookup)->first();
                if (! $entity) {
                    return;
                }
            }
        }

        match ($eventType) {
            'impression' => $entity->increment('impressions'),
            'click' => $entity->increment('clicks'),
            'view' => $entity->increment('views'),
            'completion' => $entity->increment('completions'),
            'dwell' => tap($entity, function ($model): void {
                $model->increment('views');
                $model->increment('completions');
            }),
            'dismiss' => $entity->increment('dismissals'),
            default => null,
        };
        $this->refreshRates($entity);

        if ($userId) {
            $userLookup = [
                'date' => $date,
                'user_id' => $userId,
                'entity_type' => 'post',
                'entity_id' => $post->id,
            ];
            $userEntity = RecoUserEntityStatsDaily::query()->where($userLookup)->first();
            if (! $userEntity) {
                try {
                    $userEntity = RecoUserEntityStatsDaily::create($userLookup);
                } catch (QueryException) {
                    $userEntity = RecoUserEntityStatsDaily::query()->where($userLookup)->first();
                    if (! $userEntity) {
                        return;
                    }
                }
            }
            match ($eventType) {
                'impression' => $userEntity->increment('impressions'),
                'click' => $userEntity->increment('clicks'),
                'view' => $userEntity->increment('views'),
                'completion' => $userEntity->increment('completions'),
                'dwell' => tap($userEntity, function ($model): void {
                    $model->increment('views');
                    $model->increment('completions');
                }),
                'dismiss' => $userEntity->increment('dismissals'),
                default => null,
            };

            $profile = RecoUserInterestProfile::firstOrCreate(
                ['user_id' => $userId, 'entity_type' => 'post'],
                ['interests' => []],
            );

            $interests = (array) $profile->interests;
            $interestWeight = match ($eventType) {
                'dwell' => 5,
                'completion' => 4,
                'click' => 3,
                'view' => 2,
                default => 1,
            };

            $interests['author'][$post->user_id] = ($interests['author'][$post->user_id] ?? 0) + $interestWeight;
            $mediaType = $post->media->first()?->file_type ?? 'text';
            $interests['media_type'][$mediaType] = ($interests['media_type'][$mediaType] ?? 0) + $interestWeight;
            if ($post->primary_category) {
                $interests['category'][$post->primary_category] = ($interests['category'][$post->primary_category] ?? 0) + $interestWeight;
            }
            $profile->interests = $interests;
            $profile->save();
        }
    }

    private function rebuildAdEntityStats(string $date): void
    {
        $rows = DB::table('ad_events_v2')
            ->leftJoin('ad_deliveries_v2', 'ad_deliveries_v2.id', '=', 'ad_events_v2.delivery_id')
            ->leftJoin('ad_placements_v2', 'ad_placements_v2.id', '=', 'ad_deliveries_v2.placement_id')
            ->selectRaw("
                ad_events_v2.creative_id as entity_id,
                COALESCE(ad_placements_v2.surface, 'feed') as surface,
                SUM(CASE WHEN ad_events_v2.event_type = 'impression' THEN 1 ELSE 0 END) as impressions,
                SUM(CASE WHEN ad_events_v2.event_type = 'view_start' THEN 1 ELSE 0 END) as views,
                SUM(CASE WHEN ad_events_v2.event_type = 'click' THEN 1 ELSE 0 END) as clicks,
                SUM(CASE WHEN ad_events_v2.event_type = 'view_complete' THEN 1 ELSE 0 END) as completions,
                SUM(CASE WHEN ad_events_v2.event_type = 'dismiss' THEN 1 ELSE 0 END) as dismissals
            ")
            ->whereDate('ad_events_v2.created_at', $date)
            ->whereNotNull('ad_events_v2.creative_id')
            ->groupBy('ad_events_v2.creative_id', 'ad_placements_v2.surface')
            ->get();

        foreach ($rows as $row) {
            $impressions = max(1, (int) $row->impressions);
            RecoEntityPerformanceDaily::updateOrCreate(
                [
                    'date' => $date,
                    'entity_type' => 'ad',
                    'entity_id' => $row->entity_id,
                    'surface' => $row->surface,
                ],
                [
                    'impressions' => (int) $row->impressions,
                    'views' => (int) $row->views,
                    'clicks' => (int) $row->clicks,
                    'completions' => (int) $row->completions,
                    'dismissals' => (int) $row->dismissals,
                    'ctr' => (float) $row->clicks / $impressions,
                    'completion_rate' => (float) $row->completions / $impressions,
                ],
            );
        }
    }

    private function rebuildPostEntityStats(string $date): void
    {
        $posts = Post::query()
            ->withCount(['likes', 'comments', 'reposts'])
            ->whereDate('created_at', '<=', $date)
            ->limit(2000)
            ->get();

        foreach ($posts as $post) {
            $impressions = max(1, (int) $post->like_count + (int) $post->comment_count + (int) $post->repost_count);
            RecoEntityPerformanceDaily::updateOrCreate(
                [
                    'date' => $date,
                    'entity_type' => 'post',
                    'entity_id' => $post->id,
                    'surface' => 'feed',
                ],
                [
                    'impressions' => $impressions,
                    'views' => (int) $post->comment_count,
                    'clicks' => (int) $post->like_count,
                    'completions' => (int) $post->repost_count,
                    'dismissals' => 0,
                    'ctr' => (int) $post->like_count / $impressions,
                    'completion_rate' => (int) $post->repost_count / $impressions,
                ],
            );
        }
    }

    private function rebuildAdUserProfiles(): void
    {
        $events = DB::table('ad_events_v2')
            ->join('ad_deliveries_v2', 'ad_deliveries_v2.id', '=', 'ad_events_v2.delivery_id')
            ->join('ad_placements_v2', 'ad_placements_v2.id', '=', 'ad_deliveries_v2.placement_id')
            ->join('ad_creatives_v2', 'ad_creatives_v2.id', '=', 'ad_events_v2.creative_id')
            ->whereNotNull('ad_events_v2.viewer_user_id')
            ->where('ad_events_v2.created_at', '>=', now()->subDays(30))
            ->select([
                'ad_events_v2.viewer_user_id as user_id',
                'ad_placements_v2.surface',
                'ad_creatives_v2.media_type',
            ])
            ->get();

        $bucket = [];
        foreach ($events as $event) {
            $key = $event->user_id;
            $bucket[$key]['surface'][$event->surface] = ($bucket[$key]['surface'][$event->surface] ?? 0) + 1;
            $bucket[$key]['media_type'][$event->media_type ?? 'unknown'] = ($bucket[$key]['media_type'][$event->media_type ?? 'unknown'] ?? 0) + 1;
        }

        foreach ($bucket as $userId => $interests) {
            RecoUserInterestProfile::updateOrCreate(
                ['user_id' => $userId, 'entity_type' => 'ad'],
                ['interests' => $interests],
            );
        }
    }

    private function rebuildPostUserProfiles(): void
    {
        $likes = Like::query()
            ->where('likeable_type', Post::class)
            ->where('created_at', '>=', now()->subDays(30))
            ->get(['user_id', 'likeable_id']);

        $comments = Comment::query()
            ->where('created_at', '>=', now()->subDays(30))
            ->get(['user_id', 'post_id']);

        $postMeta = Post::query()
            ->with('media:id,post_id,file_type')
            ->get(['id', 'user_id'])
            ->keyBy('id');

        $bucket = [];
        foreach ($likes as $like) {
            $post = $postMeta->get($like->likeable_id);
            if (! $post) {
                continue;
            }
            $userId = $like->user_id;
            $mediaType = $post->media->first()?->file_type ?? 'text';
            $bucket[$userId]['author'][$post->user_id] = ($bucket[$userId]['author'][$post->user_id] ?? 0) + 1;
            $bucket[$userId]['media_type'][$mediaType] = ($bucket[$userId]['media_type'][$mediaType] ?? 0) + 1;
            if ($post->primary_category) {
                $bucket[$userId]['category'][$post->primary_category] = ($bucket[$userId]['category'][$post->primary_category] ?? 0) + 1;
            }
        }

        foreach ($comments as $comment) {
            $post = $postMeta->get($comment->post_id);
            if (! $post) {
                continue;
            }
            $userId = $comment->user_id;
            $bucket[$userId]['author'][$post->user_id] = ($bucket[$userId]['author'][$post->user_id] ?? 0) + 1;
            if ($post->primary_category) {
                $bucket[$userId]['category'][$post->primary_category] = ($bucket[$userId]['category'][$post->primary_category] ?? 0) + 1;
            }
        }

        foreach ($bucket as $userId => $interests) {
            RecoUserInterestProfile::updateOrCreate(
                ['user_id' => $userId, 'entity_type' => 'post'],
                ['interests' => $interests],
            );
        }
    }

    private function incrementByEventType(Model $model, string $eventType): void
    {
        match ($eventType) {
            'impression' => $model->increment('impressions'),
            'view_start' => $model->increment('views'),
            'click' => $model->increment('clicks'),
            'view_complete', 'conversion' => $model->increment('completions'),
            'dismiss' => $model->increment('dismissals'),
            default => null,
        };
    }

    private function refreshRates(RecoEntityPerformanceDaily $entity): void
    {
        $impressions = max(1, (int) $entity->impressions);
        $entity->ctr = (float) $entity->clicks / $impressions;
        $entity->completion_rate = (float) $entity->completions / $impressions;
        $entity->save();
    }

    private function updateUserInterestsForAd(AdEvent $event): void
    {
        if (! $event->viewer_user_id) {
            return;
        }

        $creative = $event->delivery?->creative;
        $surface = $event->delivery?->placement?->surface;
        if (! $creative || ! $surface) {
            return;
        }

        $profile = RecoUserInterestProfile::firstOrCreate(
            ['user_id' => $event->viewer_user_id, 'entity_type' => 'ad'],
            ['interests' => []],
        );

        $interests = (array) $profile->interests;
        $interests['surface'][$surface] = ($interests['surface'][$surface] ?? 0) + 1;
        $mediaType = $creative->media_type ?? 'unknown';
        $interests['media_type'][$mediaType] = ($interests['media_type'][$mediaType] ?? 0) + 1;
        $profile->interests = $interests;
        $profile->save();
    }
}
