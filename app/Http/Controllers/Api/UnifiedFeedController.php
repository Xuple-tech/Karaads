<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LiveStreamResource;
use App\Http\Resources\PostResource;
use App\Models\LiveStream;
use App\Models\Post;
use App\Support\ResponseCache;
use App\Support\UserPrivacy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class UnifiedFeedController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $mode = $request->query('feed') === 'following' ? 'following' : 'for-you';
        $perPage = max(5, min(20, (int) $request->integer('per_page', 10)));
        $page = max(1, (int) $request->integer('page', 1));

        $cacheKey = ResponseCache::key('unified-feed', $request, [
            'mode' => $mode,
            'page' => $page,
            'per_page' => $perPage,
        ], ['feed', 'page', 'per_page']);

        $payload = ResponseCache::store()->remember(
            $cacheKey,
            now()->addMinutes(3),
            function () use ($request, $mode, $page, $perPage): array {
                $viewer = $request->user();
                $followedUserIds = $viewer
                    ? DB::table('follows')
                        ->where('follower_id', $viewer->id)
                        ->pluck('following_id')
                        ->map(fn ($id) => (string) $id)
                        ->all()
                    : [];

                [$postCollection, $hasMorePosts] = $this->postCandidates($request, $mode, $page, $perPage);

                $posts = $postCollection
                    ->map(fn (Post $post) => [
                        'type' => 'post',
                        'id' => (string) $post->id,
                        'score' => $this->postScore($post, $followedUserIds),
                        'created_at' => $post->created_at,
                        'resource' => $post,
                    ]);

                $streams = $this->liveCandidates($request, $mode, $followedUserIds)
                    ->map(fn (LiveStream $stream) => [
                        'type' => 'live_stream',
                        'id' => (string) $stream->id,
                        'score' => $this->liveScore($stream, $followedUserIds),
                        'created_at' => $stream->started_at ?? $stream->created_at,
                        'resource' => $stream,
                    ]);

                $ranked = $posts
                    ->concat($streams)
                    ->sortByDesc(fn (array $item) => [$item['score'], optional($item['created_at'])->timestamp ?? 0])
                    ->values();

                $ranked = $this->spaceLiveStreams($ranked);

                if ($mode === 'for-you') {
                    $pageItems = $ranked->take($perPage)->values();
                    $hasMore = $hasMorePosts || $pageItems->count() >= $perPage;
                    $nextUrl = $hasMore
                        ? $request->url() . '?' . http_build_query(array_merge((array) $request->query(), ['page' => $page + 1, 'feed' => 'for-you']))
                        : null;

                    return [
                        'data' => $pageItems->map(fn (array $item) => $this->serializeItem($item, $request))->values(),
                        'links' => [
                            'next' => $nextUrl,
                            'prev' => $page > 1 ? $request->url() . '?' . http_build_query(array_merge((array) $request->query(), ['page' => $page - 1, 'feed' => 'for-you'])) : null,
                        ],
                        'meta' => [
                            'current_page' => $page,
                            'last_page' => $hasMore ? $page + 9999 : $page,
                            'per_page' => $perPage,
                            'total' => $hasMore ? ($page + 9999) * $perPage : $page * $perPage,
                        ],
                    ];
                }

                $paginator = new LengthAwarePaginator(
                    $ranked->slice(($page - 1) * $perPage, $perPage)->values(),
                    $ranked->count(),
                    $perPage,
                    $page,
                    ['path' => $request->url(), 'query' => $request->query()],
                );

                return [
                    'data' => $paginator->getCollection()
                        ->map(fn (array $item) => $this->serializeItem($item, $request))
                        ->values(),
                    'links' => [
                        'next' => $paginator->nextPageUrl(),
                        'prev' => $paginator->previousPageUrl(),
                    ],
                    'meta' => [
                        'current_page' => $paginator->currentPage(),
                        'last_page' => $paginator->lastPage(),
                        'per_page' => $paginator->perPage(),
                        'total' => $paginator->total(),
                    ],
                ];
            }
        );

        return response()->json($payload);
    }

    private function postCandidates(Request $request, string $mode, int $page = 1, int $perPage = 10): array
    {
        $viewer = $request->user();

        $query = Post::query()
            ->with([
                'user',
                'media',
                'businessPage',
                'liveReplayStream',
                'originalPost.media',
                'originalPost.user',
                'originalPost.businessPage',
                'originalPost.liveReplayStream',
            ])
            ->latest();

        if ($mode === 'for-you') {
            // Per-page DB window: fetch a fresh candidate batch at the right offset
            // so users can scroll through all posts, not just the first 160.
            $windowSize = $perPage * 8;
            $query->offset(($page - 1) * $windowSize)->limit($windowSize + 1);
        } else {
            $query->limit(160);
        }

        if ($mode === 'following') {
            $query->where(function ($q) use ($viewer) {
                $q->whereIn('user_id', function ($sub) use ($viewer) {
                    $sub->select('following_id')
                        ->from('follows')
                        ->where('follower_id', $viewer->id);
                })
                    ->orWhere('user_id', $viewer->id);
            });
        }

        $query->where(function ($visibilityQuery) use ($viewer) {
            $visibilityQuery
                ->where('user_id', $viewer->id)
                ->orWhere(function ($publicQuery) {
                    $publicQuery
                        ->where('visibility', 'everyone')
                        ->where(function ($scheduledQuery) {
                            $scheduledQuery
                                ->whereNull('scheduled_at')
                                ->orWhere('scheduled_at', '<=', now());
                        });
                })
                ->orWhere(function ($followersQuery) use ($viewer) {
                    $followersQuery
                        ->where('visibility', 'followers')
                        ->where(function ($scheduledQuery) {
                            $scheduledQuery
                                ->whereNull('scheduled_at')
                                ->orWhere('scheduled_at', '<=', now());
                        })
                        ->whereExists(function ($sub) use ($viewer) {
                            $sub->selectRaw('1')
                                ->from('follows')
                                ->whereColumn('follows.following_id', 'posts.user_id')
                                ->where('follows.follower_id', $viewer->id);
                        });
                });
        });

        if ($viewer) {
            $query->withExists([
                'likes as user_liked' => fn ($q) => $q->where('user_id', $viewer->id),
                'reposts as user_reshared' => fn ($q) => $q->where('user_id', $viewer->id),
                'bookmarks as user_saved' => fn ($q) => $q->where('user_id', $viewer->id),
            ]);
        }

        UserPrivacy::excludeBlockedUsers($query, $viewer, 'user_id');

        $results = $query->get();

        if ($mode === 'for-you') {
            $windowSize = $perPage * 8;
            $hasMore = $results->count() > $windowSize;
            return [$results->take($windowSize), $hasMore];
        }

        return [$results, null];
    }

    private function liveCandidates(Request $request, string $mode, array $followedUserIds): Collection
    {
        $viewer = $request->user();

        $query = LiveStream::query()
            ->with('user')
            ->withCount(['likes', 'messages as comments_count'])
            ->withExists(['likes as user_liked' => fn ($q) => $q->where('user_id', $viewer->id)])
            ->where('status', 'live')
            ->where(function ($activityQuery) {
                $activityQuery
                    ->where('last_activity_at', '>=', now()->subSeconds($this->staleTimeoutSeconds()))
                    ->orWhere('started_at', '>=', now()->subSeconds($this->staleTimeoutSeconds()));
            })
            ->where(function ($visibilityQuery) use ($viewer) {
                $visibilityQuery
                    ->where('user_id', $viewer->id)
                    ->orWhere('visibility', 'everyone')
                    ->orWhere(function ($followersQuery) use ($viewer) {
                        $followersQuery->where('visibility', 'followers')
                            ->whereExists(function ($sub) use ($viewer) {
                                $sub->selectRaw('1')
                                    ->from('follows')
                                    ->whereColumn('follows.following_id', 'live_streams.user_id')
                                    ->where('follows.follower_id', $viewer->id);
                            });
                    });
            })
            ->latest('started_at')
            ->limit(40);

        if ($mode === 'following') {
            $query->where(function ($q) use ($viewer, $followedUserIds) {
                $q->whereIn('user_id', $followedUserIds)
                    ->orWhere('user_id', $viewer->id);
            });
        }

        UserPrivacy::excludeBlockedUsers($query, $viewer, 'user_id');

        $streams = $query->get();
        $streams->each(fn (LiveStream $stream) => $this->loadCreatorFollowState($stream, $viewer));

        return $streams;
    }

    private function postScore(Post $post, array $followedUserIds): float
    {
        $hoursOld = max(0.1, now()->diffInMinutes($post->created_at) / 60);
        $followBoost = in_array((string) $post->user_id, $followedUserIds, true) ? 28 : 0;
        $engagement = ((int) $post->like_count * 1.8) + ((int) $post->comment_count * 2.4) + ((int) $post->repost_count * 3.2);

        return $followBoost + $engagement + (36 / (1 + ($hoursOld / 8)));
    }

    private function liveScore(LiveStream $stream, array $followedUserIds): float
    {
        $startedAt = $stream->started_at ?? $stream->created_at;
        $hoursOld = max(0.1, now()->diffInMinutes($startedAt) / 60);
        $followBoost = in_array((string) $stream->user_id, $followedUserIds, true) ? 80 : 0;
        $viewerBoost = min(120, (int) $stream->viewer_count * 2.8);
        $engagement = ((int) $stream->reaction_count * 0.8) + ((int) ($stream->comments_count ?? 0) * 2.2) + ((int) $stream->likes_count * 1.5);

        return 85 + $followBoost + $viewerBoost + $engagement + (44 / (1 + ($hoursOld / 3)));
    }

    private function spaceLiveStreams(Collection $ranked): Collection
    {
        $result = collect();
        $pendingLives = collect();
        $regularSinceLive = 2;

        foreach ($ranked as $item) {
            if ($item['type'] === 'live_stream' && $regularSinceLive < 2) {
                $pendingLives->push($item);
                continue;
            }

            $result->push($item);
            $regularSinceLive = $item['type'] === 'live_stream' ? 0 : $regularSinceLive + 1;

            if ($regularSinceLive >= 2 && $pendingLives->isNotEmpty()) {
                $result->push($pendingLives->shift());
                $regularSinceLive = 0;
            }
        }

        return $result->concat($pendingLives)->values();
    }

    private function serializeItem(array $item, Request $request): array
    {
        if ($item['type'] === 'live_stream') {
            return [
                'type' => 'live_stream',
                'id' => $item['id'],
                'score' => round((float) $item['score'], 2),
                'live_stream' => (new LiveStreamResource($item['resource']))->resolve($request),
            ];
        }

        return [
            'type' => 'post',
            'id' => $item['id'],
            'score' => round((float) $item['score'], 2),
            'post' => (new PostResource($item['resource']))->resolve($request),
        ];
    }

    private function loadCreatorFollowState(LiveStream $stream, $viewer): void
    {
        if (! $viewer || ! $stream->relationLoaded('user') || ! $stream->user) {
            return;
        }

        if ((string) $stream->user->id === (string) $viewer->id) {
            $stream->user->setAttribute('is_following', false);

            return;
        }

        $stream->user->loadExists([
            'followers as is_following' => function ($q) use ($viewer) {
                $q->where('users.id', $viewer->id);
            },
        ]);
    }

    private function staleTimeoutSeconds(): int
    {
        return max(300, (int) config('live.stale_stream_timeout_seconds', 300));
    }
}
