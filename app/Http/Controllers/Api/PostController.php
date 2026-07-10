<?php

namespace App\Http\Controllers\Api;

use App\Domain\Recommendation\RecommendationContext;
use App\Domain\Recommendation\Services\BehaviorSignalService;
use App\Domain\Recommendation\Services\PostCategorizationService;
use App\Domain\Recommendation\Services\PostRecommendationService;
use App\Events\CommentCreated;
use App\Events\PostCreated;
use App\Events\PostLiked;
use App\Events\PostReshared;
use App\Events\PostUnliked;
use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Jobs\ProcessPostMedia;
use App\Models\Bookmark;
use App\Models\BusinessPage;
use App\Models\Comment;
use App\Models\Post;
use App\Models\PostView;
use App\Models\User;
use App\Services\Content\ContentValidationService;
use App\Services\Content\CopyrightRiskService;
use App\Services\Content\MediaQualityService;
use App\Services\Media\MediaPathService;
use App\Services\Monetization\PostEngagementMonetizationService;
use App\Services\Post\PostRewardService;
use App\Support\PostAccess;
use App\Support\UserPrivacy;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PostController extends Controller
{
    use AuthorizesRequests;
    private const VIEW_DEDUP_TTL_SECONDS = 1800;
    private const MAX_MEDIA_FILE_SIZE_KB = 52428800;
    private const MAX_MUSIC_FILE_SIZE_KB = 20480;
    private const MAX_MUSIC_DURATION_SECONDS = 1800;

    public function __construct(
        private readonly PostRecommendationService $postRecommendationService,
        private readonly BehaviorSignalService $behaviorSignalService,
        private readonly PostCategorizationService $postCategorizationService,
        private readonly ContentValidationService $contentValidationService,
        private readonly CopyrightRiskService $copyrightRiskService,
        private readonly MediaQualityService $mediaQualityService,
        private readonly PostRewardService $postRewardService,
        private readonly PostEngagementMonetizationService $postEngagementMonetizationService,
    ) {}

    private function repostDepthRelations(): array
    {
        return [
            'originalPost.media',
            'originalPost.user',
            'originalPost.businessPage',
            'originalPost.liveReplayStream',
            'originalPost.originalPost.media',
            'originalPost.originalPost.user',
            'originalPost.originalPost.businessPage',
            'originalPost.originalPost.liveReplayStream',
            'originalPost.originalPost.originalPost.media',
            'originalPost.originalPost.originalPost.user',
            'originalPost.originalPost.originalPost.businessPage',
            'originalPost.originalPost.originalPost.liveReplayStream',
        ];
    }

    private function postRelations(array $extra = []): array
    {
        return array_values(array_unique(array_merge(
            ['user', 'media', 'monetization', 'businessPage', 'liveReplayStream'],
            $extra,
            $this->repostDepthRelations(),
        )));
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $search = trim((string) $request->query('search', ''));

        $relations = $request->boolean('lite')
            ? [
                'user',
                'media',
                'businessPage',
                'liveReplayStream',
                'originalPost.media',
                'originalPost.user',
                'originalPost.businessPage',
                'originalPost.liveReplayStream',
            ]
            : $this->postRelations();

        $query = Post::with($relations)
            ->whereHas('user');

        if ($search !== '') {
            $postIds = Post::search($search)->keys();
            $userIds = User::search($search)->keys();

            $query->where(function ($searchQuery) use ($postIds, $userIds): void {
                $hasPosts = $postIds->isNotEmpty();
                $hasUsers = $userIds->isNotEmpty();

                if (! $hasPosts && ! $hasUsers) {
                    $searchQuery->whereRaw('1 = 0');

                    return;
                }

                if ($hasPosts) {
                    $searchQuery->whereIn('id', $postIds->all());
                }

                if ($hasUsers) {
                    $method = $hasPosts ? 'orWhereIn' : 'whereIn';
                    $searchQuery->{$method}('user_id', $userIds->all());
                }
            });
        }

        $this->applyPostAccessScope($query, $user);

        $query
            ->latest();

        if ($user) {
            $query->withExists(['likes as user_liked' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }])
                ->withExists(['reposts as user_reshared' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->withExists(['bookmarks as user_saved' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }]);
        }

        $posts = $this->filterReadyPostsForDisplay($query->limit(200)->get());
        $posts = $this->dedupePostsForDisplay($posts);
        $posts = $this->shuffleRankedForSeed($posts, $request);

        return PostResource::collection($this->paginateRanked($posts, $request));
    }

    public function feed(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $feedMode = $request->query('feed', 'following');

        if ($feedMode === 'for-you') {
            return $this->feedForYou($request, $user);
        }

        // --- Following feed (original behaviour) ---
        $query = Post::with($this->postRelations())
            ->whereHas('user')
            ->where(function ($q) use ($user) {
                $q->whereIn('user_id', function ($sub) use ($user) {
                    $sub->select('following_id')
                        ->from('follows')
                        ->where('follower_id', $user->id);
                })
                    ->orWhereIn('business_page_id', function ($sub) use ($user) {
                        $sub->select('business_page_id')
                            ->from('business_page_followers')
                            ->where('user_id', $user->id);
                    })
                    ->orWhere('user_id', $user->id);
            })
            ->latest()
            ->limit(200);

        $this->applyPostAccessScope($query, $user);

        if ($user) {
            $query->withExists(['likes as user_liked' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }])
                ->withExists(['reposts as user_reshared' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->withExists(['bookmarks as user_saved' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }]);
        }

        $candidates = $query->get();
        $ranked = $this->postRecommendationService->rank($candidates, RecommendationContext::fromArray([
            'entity_type' => 'post',
            'surface' => 'feed',
            'slot' => 'main',
            'user_id' => $user?->id,
            'context' => ['mode' => 'feed'],
        ]));
        $ranked = $this->ensureMinimumRecommendedPosts($ranked, $request, $user, 10, false);
        $ranked = $this->filterReadyPostsForDisplay($ranked);
        $ranked = $this->dedupePostsForDisplay($ranked);
        $ranked = $this->shuffleRankedForSeed($ranked, $request);

        return PostResource::collection($this->paginateRanked($ranked, $request));
    }

    private function feedForYou(Request $request, ?User $user): AnonymousResourceCollection
    {
        $perPage = max(1, min(50, (int) $request->query('per_page', 15)));
        $page = max(1, (int) LengthAwarePaginator::resolveCurrentPage());
        $windowSize = $perPage * 2;
        $offset = ($page - 1) * $windowSize;

        $liteRelations = [
            'user', 'media', 'businessPage', 'liveReplayStream',
            'originalPost.media', 'originalPost.user',
            'originalPost.businessPage', 'originalPost.liveReplayStream',
        ];

        // Base filters shared by both page-1 shuffle and offset-based scrolling
        $baseFilters = function ($q) {
            $q->whereHas('user')
                ->whereDoesntHave('media', fn ($m) => $m->whereIn('processing_status', ['queued', 'processing', 'failed']))
                ->whereDoesntHave('media', fn ($m) => $m
                    ->where('file_type', 'video')
                    ->whereNull('thumbnail_path')
                    ->where(fn ($v) => $v
                        ->whereColumn('processed_file_path', 'file_path')
                        ->orWhereNull('processed_file_path')));
            $this->applyPostAccessScope($q, null);
        };

        if ($page === 1) {
            // Shuffle the most recent 300 eligible post IDs in PHP — fast index scan, no joins
            $ids = Post::select('id')
                ->where(function ($q) use ($baseFilters) { $baseFilters($q); })
                ->latest()
                ->limit(300)
                ->pluck('id')
                ->shuffle()
                ->take($windowSize + 1);

            $query = Post::with($liteRelations)->whereIn('id', $ids);
        } else {
            $query = Post::with($liteRelations)
                ->where(function ($q) use ($baseFilters) { $baseFilters($q); })
                ->latest()
                ->offset($offset)
                ->limit($windowSize + 1);
        }

        $this->applyPostAccessScope($query, $user);

        if ($user) {
            $query->withExists(['likes as user_liked' => fn ($q) => $q->where('user_id', $user->id)])
                ->withExists(['reposts as user_reshared' => fn ($q) => $q->where('user_id', $user->id)])
                ->withExists(['bookmarks as user_saved' => fn ($q) => $q->where('user_id', $user->id)]);
        }

        $results = $query->get();
        $hasMore = $results->count() > $windowSize;
        $candidates = $results->take($windowSize);

        $ranked = $this->filterReadyPostsForDisplay($candidates);
        $ranked = $this->dedupePostsForDisplay($ranked);

        $pageItems = $ranked->take($perPage)->values();

        foreach ($pageItems as $post) {
            $this->behaviorSignalService->recordPostEvent($post->loadMissing('media'), 'impression', $user?->id, 'feed');
            $this->recordDedupedPostView($post, $request);
        }

        $hasMore = $hasMore || $pageItems->count() >= $perPage;
        $estimatedLastPage = $hasMore ? $page + 9999 : $page;

        $paginator = new LengthAwarePaginator(
            $pageItems,
            $estimatedLastPage * $perPage,
            $perPage,
            $page,
            [
                'path' => LengthAwarePaginator::resolveCurrentPath(),
                'query' => $request->query(),
            ],
        );

        return PostResource::collection($paginator);
    }

    public function trending(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = Post::with($this->postRelations())
            ->whereHas('user')
            ->orderByDesc('like_count')
            ->orderByDesc('created_at')
            ->limit(200);

        $this->applyPostAccessScope($query, $user);

        if ($user) {
            $query->withExists(['likes as user_liked' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }])
                ->withExists(['reposts as user_reshared' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->withExists(['bookmarks as user_saved' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }]);
        }

        $candidates = $query->get();
        $ranked = $this->postRecommendationService->rank($candidates, RecommendationContext::fromArray([
            'entity_type' => 'post',
            'surface' => 'feed',
            'slot' => 'trending',
            'user_id' => $user?->id,
            'context' => ['mode' => 'trending'],
        ]));
        $ranked = $this->ensureMinimumRecommendedPosts($ranked, $request, $user, 10, true);
        $ranked = $this->filterReadyPostsForDisplay($ranked);
        $ranked = $this->dedupePostsForDisplay($ranked);
        $ranked = $this->shuffleRankedForSeed($ranked, $request);

        return PostResource::collection($this->paginateRanked($ranked, $request));
    }

    public function moments(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $feed = $request->query('feed');

        $query = Post::with($this->postRelations())
            ->whereHas('user')
            ->when($feed === 'following', function ($q) use ($user) {
                return $q->where(function ($qq) use ($user) {
                    $qq->whereIn('user_id', function ($sub) use ($user) {
                        $sub->select('following_id')
                            ->from('follows')
                            ->where('follower_id', $user->id);
                    })
                        ->orWhereIn('business_page_id', function ($sub) use ($user) {
                            $sub->select('business_page_id')
                                ->from('business_page_followers')
                                ->where('user_id', $user->id);
                        })
                        ->orWhere('user_id', $user->id);
                });
            })
            ->where(fn ($q) => $this->applyVideoContentScope($q))
            ->latest()
            ->limit(200);

        $this->applyPostAccessScope($query, $user);

        if ($user) {
            $query->withExists(['likes as user_liked' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }])
                ->withExists(['reposts as user_reshared' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->withExists(['bookmarks as user_saved' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }]);
        }

        $candidates = $query->get();
        $ranked = $this->postRecommendationService->rank($candidates, RecommendationContext::fromArray([
            'entity_type' => 'post',
            'surface' => 'moments',
            'slot' => 'main',
            'user_id' => $user?->id,
            'context' => ['mode' => 'moments'],
        ]));
        $ranked = $this->ensureMinimumRecommendedPosts($ranked, $request, $user, 10, true);
        $ranked = $this->filterReadyPostsForDisplay($ranked);
        $ranked = $this->dedupePostsForDisplay($ranked);
        $ranked = $this->shuffleRankedForSeed($ranked, $request);

        return PostResource::collection($this->paginateRanked($ranked, $request));
    }

    public function getTrendingTopics(): array
    {
        $recentPosts = Post::query()
            ->where('visibility', 'everyone')
            ->where(function ($q) {
                $q->whereNull('scheduled_at')
                    ->orWhere('scheduled_at', '<=', now());
            })
            ->whereNotNull('hashtags')
            ->where('created_at', '>=', now()->subDays(14))
            ->orderByDesc('created_at')
            ->limit(500)
            ->get(['hashtags', 'primary_category']);

        $tagCounts = [];
        $tagCategories = [];
        foreach ($recentPosts as $post) {
            foreach ((array) ($post->hashtags ?? []) as $tag) {
                $normalized = ltrim(strtolower((string) $tag), '#');
                if ($normalized === '') {
                    continue;
                }
                $tagCounts[$normalized] = ($tagCounts[$normalized] ?? 0) + 1;
                if (! isset($tagCategories[$normalized]) && $post->primary_category) {
                    $tagCategories[$normalized] = (string) $post->primary_category;
                }
            }
        }

        arsort($tagCounts);
        $topics = [];
        foreach (array_slice($tagCounts, 0, 10, true) as $tag => $count) {
            $topics[] = [
                'tag' => '#' . ucfirst($tag),
                'posts' => $this->formatCompactCount($count),
                'category' => $tagCategories[$tag] ?? 'Trending',
            ];
        }

        return ['data' => $topics];
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Post>  $ranked
     */
    private function paginateRanked($ranked, Request $request): LengthAwarePaginator
    {
        $perPage = max(1, min(50, (int) $request->query('per_page', 15)));
        $page = LengthAwarePaginator::resolveCurrentPage();
        $offset = ($page - 1) * $perPage;
        $total = $ranked->count();
        $items = $ranked->slice($offset, $perPage)->values();
        $userId = $request->user()?->id;
        $surface = str_contains($request->path(), 'moments') ? 'moments' : 'feed';
        foreach ($items as $post) {
            $this->behaviorSignalService->recordPostEvent($post->loadMissing('media'), 'impression', $userId, $surface);
            $this->recordDedupedPostView($post, $request);
        }

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            [
                'path' => LengthAwarePaginator::resolveCurrentPath(),
                'query' => $request->query(),
            ],
        );
    }

    private function shuffleRankedForSeed(Collection $ranked, Request $request): Collection
    {
        $seed = trim((string) $request->query('shuffle_seed', ''));

        if ($seed === '') {
            return $ranked;
        }

        return $ranked
            ->sortBy(fn (Post $post) => sha1($seed . ':' . $post->id))
            ->values();
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Post>  $posts
     * @return \Illuminate\Support\Collection<int, Post>
     */
    private function dedupePostsForDisplay(Collection $posts): Collection
    {
        $seen = [];

        return $posts
            ->filter(function (Post $post) use (&$seen): bool {
                $source = $post->originalPost ?: $post;
                $source->loadMissing('media');

                $mediaFingerprints = $source->media
                    ->pluck('media_fingerprint')
                    ->filter()
                    ->sort()
                    ->values()
                    ->implode('|');
                $normalizedContent = $this->normalizeContentForDuplicateCheck((string) ($source->content ?? ''));

                if ($mediaFingerprints !== '') {
                    $key = 'media:' . $mediaFingerprints;
                } elseif (mb_strlen($normalizedContent) >= 8) {
                    $key = 'caption:' . $normalizedContent;
                } else {
                    $key = 'post:' . $source->id;
                }

                if (isset($seen[$key])) {
                    return false;
                }

                $seen[$key] = true;

                return true;
            })
            ->values();
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Post>  $posts
     * @return \Illuminate\Support\Collection<int, Post>
     */
    private function filterReadyPostsForDisplay(Collection $posts): Collection
    {
        return $posts
            ->filter(fn (Post $post): bool => $this->postMediaReadyForDisplay($post))
            ->values();
    }

    private function postMediaReadyForDisplay(Post $post, int $depth = 0): bool
    {
        if ($depth > 8) {
            return true;
        }

        if ($post->originalPost) {
            return $this->postMediaReadyForDisplay($post->originalPost, $depth + 1);
        }

        $post->loadMissing('media');

        if ($post->media->isEmpty()) {
            return true;
        }

        return $post->media->every(function ($media): bool {
            $status = $media->processing_status;

            if (in_array($status, ['queued', 'processing'], true)) {
                return false;
            }

            if ($media->file_type === 'video') {
                return (bool) ($media->processed_file_path ?: $media->file_path);
            }

            $variantPath = is_array($media->variants)
                ? ($media->variants['medium'] ?? $media->variants['thumb'] ?? null)
                : null;

            return (bool) ($media->processed_file_path ?: $variantPath ?: $media->file_path);
        });
    }

    private function applyPostAccessScope($query, ?User $viewer): void
    {
        if ($viewer) {
            $query->where(function ($visibilityQuery) use ($viewer): void {
                $visibilityQuery
                    ->where('user_id', $viewer->id)
                    ->orWhere('visibility', 'everyone')
                    ->orWhere(function ($followersQuery) use ($viewer): void {
                        $followersQuery
                            ->where('visibility', 'followers')
                            ->where(function ($followTargetQuery) use ($viewer): void {
                                $followTargetQuery
                                    ->whereExists(function ($followSub) use ($viewer): void {
                                        $followSub->selectRaw('1')
                                            ->from('follows')
                                            ->whereColumn('follows.following_id', 'posts.user_id')
                                            ->where('follows.follower_id', $viewer->id);
                                    })
                                    ->orWhereExists(function ($pageFollowSub) use ($viewer): void {
                                        $pageFollowSub->selectRaw('1')
                                            ->from('business_page_followers')
                                            ->whereColumn('business_page_followers.business_page_id', 'posts.business_page_id')
                                            ->where('business_page_followers.user_id', $viewer->id);
                                    });
                            });
                    });
            });
        } else {
            $query->where('visibility', 'everyone');
        }

        $query->where(function ($scheduledQuery) use ($viewer): void {
            $scheduledQuery->whereNull('scheduled_at')
                ->orWhere('scheduled_at', '<=', now());

            if ($viewer) {
                $scheduledQuery->orWhere('user_id', $viewer->id);
            }
        });

        UserPrivacy::excludeBlockedUsers($query, $viewer, 'user_id');
    }

    private function applyVideoContentScope($query): void
    {
        $query->whereHas('media', function ($mediaQuery) {
            $mediaQuery->where('type', 'video')
                ->orWhere('mime_type', 'like', 'video/%');
        })
        ->orWhereHas('originalPost.media', function ($mediaQuery) {
            $mediaQuery->where('type', 'video')
                ->orWhere('mime_type', 'like', 'video/%');
        })
        ->orWhereHas('originalPost.originalPost.media', function ($mediaQuery) {
            $mediaQuery->where('type', 'video')
                ->orWhere('mime_type', 'like', 'video/%');
        });
    }

    private function ensureMinimumRecommendedPosts(Collection $ranked, Request $request, ?User $user, int $min = 10, bool $videosOnly = false): Collection
    {
        if ($ranked->count() >= $min) {
            return $ranked;
        }

        $missing = $min - $ranked->count();
        $existingIds = $ranked->pluck('id')->filter()->all();

        $query = Post::with($this->postRelations())
            ->whereHas('user')
            ->when(! empty($existingIds), fn ($q) => $q->whereNotIn('id', $existingIds))
            ->latest()
            ->limit(max($missing, 1) * 3);

        if ($videosOnly) {
            $query->where(fn ($q) => $this->applyVideoContentScope($q));
        }

        $this->applyPostAccessScope($query, $user);

        if ($user) {
            $query->withExists(['likes as user_liked' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }])
                ->withExists(['reposts as user_reshared' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->withExists(['bookmarks as user_saved' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }]);
        }

        $fallback = $query->get()->take($missing);

        return $ranked->concat($fallback)->values();
    }

    private function formatCompactCount(int $count): string
    {
        if ($count >= 1000000) {
            return rtrim(rtrim(number_format($count / 1000000, 1), '0'), '.') . 'M';
        }
        if ($count >= 1000) {
            return rtrim(rtrim(number_format($count / 1000, 1), '0'), '.') . 'K';
        }

        return (string) $count;
    }

    private function recordDedupedPostView(Post $post, Request $request): void
    {
        $viewerToken = $this->resolveViewerToken($request);
        $cacheKey = "post-view:{$post->id}:{$viewerToken}";

        if (! Cache::add($cacheKey, true, now()->addSeconds(self::VIEW_DEDUP_TTL_SECONDS))) {
            return;
        }

        Post::query()->whereKey($post->id)->increment('view_count');
        $post->view_count = (int) ($post->view_count ?? 0) + 1;
        $this->changePostDailyMetric($post, 'views');

        if ($request->user() && (string) $request->user()->id !== (string) $post->user_id) {
            $view = PostView::query()->firstOrNew([
                'post_id' => (string) $post->id,
                'user_id' => (string) $request->user()->id,
            ]);
            $view->exists ? $view->touch() : $view->save();

            $this->postEngagementMonetizationService->credit($post, 'view', $request->user());
        }
    }

    private function changePostDailyMetric(Post $post, string $column, int $amount = 1): void
    {
        if (! in_array($column, ['views', 'likes', 'comments', 'comment_likes'], true)) {
            return;
        }

        $postId = (string) $post->id;
        $userId = (string) $post->user_id;
        $metricDate = now()->toDateString();
        $now = now();

        DB::table('post_daily_metrics')->updateOrInsert(
            [
                'post_id' => $postId,
                'metric_date' => $metricDate,
            ],
            [
                'user_id' => $userId,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        );

        $expression = $amount >= 0
            ? DB::raw($column . ' + ' . $amount)
            : DB::raw('GREATEST(' . $column . ' - ' . abs($amount) . ', 0)');

        DB::table('post_daily_metrics')
            ->where('post_id', $postId)
            ->where('metric_date', $metricDate)
            ->update([
                $column => $expression,
                'updated_at' => $now,
            ]);
    }

    private function resolveViewerToken(Request $request): string
    {
        $userId = $request->user()?->id;
        if ($userId) {
            return 'user:' . $userId;
        }

        $sessionId = $request->hasSession() ? (string) $request->session()->getId() : '';
        $fingerprint = implode('|', [
            $sessionId,
            (string) $request->ip(),
            (string) $request->userAgent(),
        ]);

        return 'guest:' . sha1($fingerprint);
    }

    public function show(Post $post, Request $request): PostResource
    {
        abort_unless(PostAccess::canView($post, $request->user()), 404);

        $post->load($this->postRelations(['comments', 'monetization']));

        $user = $request->user();
        if ($user) {
            $post->loadExists(['likes as user_liked' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
            $post->loadExists(['reposts as user_reshared' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
            $post->loadExists(['bookmarks as user_saved' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
        }

        return new PostResource($post);
    }

    public function getComments(Post $post, Request $request)
    {
        $user = $request->user();
        abort_unless(PostAccess::canView($post, $user), 404);

        $comments = $post->comments()
            ->whereNull('parent_id')
            ->with('user')
            ->withCount(['replies', 'likes'])
            ->when($user, fn ($query) => $query->withExists(['likes as user_liked' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]))
            ->oldest()
            ->paginate(15);

        return response()->json($this->formatCommentPaginator($comments));
    }

    public function getCommentReplies(Post $post, Comment $comment, Request $request)
    {
        $user = $request->user();
        abort_unless(PostAccess::canView($post, $user), 404);
        abort_unless($comment->post_id === $post->id, 404);

        $replies = $comment->replies()
            ->with('user')
            ->withCount(['replies', 'likes'])
            ->when($user, fn ($query) => $query->withExists(['likes as user_liked' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]))
            ->oldest()
            ->paginate(15);

        return response()->json($this->formatCommentPaginator($replies));
    }

    public function store(Request $request)
    {
        $rules = [
            'content' => 'nullable|string|max:5000',
            'business_page_id' => 'nullable|uuid|exists:business_pages,id',
            'type' => 'in:post,repost,quote',
            'original_post_id' => 'nullable|uuid|exists:posts,id',
            'quote_content' => 'nullable|string|max:5000',
            'visibility' => 'in:everyone,followers,private',
            'comments_disabled' => 'nullable',
            'scheduled_at' => 'nullable|date_format:Y-m-d\TH:i',
            'link' => 'nullable|url|max:2048',
            'hashtags.*' => 'nullable|string|max:50',
            'music' => [
                'nullable',
                'file',
                'mimetypes:audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/wav,audio/webm,audio/ogg',
                'max:' . self::MAX_MUSIC_FILE_SIZE_KB,
            ],
            'music_duration_seconds' => 'nullable|numeric|min:0|max:' . self::MAX_MUSIC_DURATION_SECONDS,
            'media_duration_seconds' => 'nullable|array',
            'media_duration_seconds.*' => 'nullable|numeric|min:0|max:21600',
        ];

        if ($request->hasFile('media')) {
            $rules['media.*'] = [
                'file',
                'max:' . self::MAX_MEDIA_FILE_SIZE_KB,
            ];
        } else {
            // Check if media was uploaded but failed (e.g. file size limit)
            $media = $request->file('media');
            if (!empty($media)) {
                $files = is_array($media) ? $media : [$media];
                foreach ($files as $file) {
                    if ($file instanceof \Illuminate\Http\UploadedFile && !$file->isValid()) {
                        abort(422, 'File upload error: ' . $file->getErrorMessage());
                    }
                }
            }
        }

        $messages = [
            'media.*.uploaded' => 'The file failed to upload. It may be larger than the server limit.',
            'media.*.max' => 'Each media file must be 50GB or smaller.',
            'media.*.mimes' => 'The file must be a file of type: jpeg, png, gif, webp, mp4, webm.',
            'music.max' => 'Music must be 20MB or smaller.',
            'music.mimetypes' => 'Music must be an MP3, M4A, AAC, WAV, OGG, or WebM audio file.',
        ];

        $validated = $request->validate($rules, $messages);
        if (! empty($validated['business_page_id'])) {
            $businessPage = BusinessPage::query()
                ->whereKey($validated['business_page_id'])
                ->where('owner_user_id', $request->user()->id)
                ->first();

            abort_unless($businessPage, 403, 'You can only post as a business page you own.');
        }

        $uploadedMedia = $request->hasFile('media') ? $request->file('media') : [];
        $mediaDurationSeconds = array_map(
            static fn ($value) => is_numeric($value) ? (float) $value : null,
            (array) ($validated['media_duration_seconds'] ?? []),
        );
        $hasImageMedia = collect($uploadedMedia)->contains(
            fn ($file) => Str::startsWith((string) $file->getMimeType(), 'image/')
        );
        $hasVideoMedia = collect($uploadedMedia)->contains(
            fn ($file) => Str::startsWith((string) $file->getMimeType(), 'video/')
        );
        $this->validatePostMediaSelection($uploadedMedia);

        if (!$request->hasFile('media') && !($validated['content'] ?? false)) {
            Log::info('Post creation failed: No content or media provided', [
                'user_id' => $request->user()->id,
                'timestamp' => now(),
                'request_data' => $request->all(),
                'files' => $request->allFiles(),
            ]);
            abort(422, 'Please provide content or upload media');
        }

        if ($request->hasFile('music') && (!$hasImageMedia || $hasVideoMedia)) {
            abort(422, 'Music can only be attached to posts with image media.');
        }

        $validated['id'] = (string) Str::uuid();
        $validated['type'] = $validated['type'] ?? 'post';
        $validated['visibility'] = $validated['visibility'] ?? ($request->user()->default_post_visibility ?? 'everyone');
        $validated['comments_disabled'] = filter_var($validated['comments_disabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $categorization = $this->postCategorizationService->categorize(
            $validated['content'] ?? '',
            (array) ($validated['hashtags'] ?? []),
            null,
        );
        $validated['primary_category'] = $categorization['primary_category'];
        $validated['category_confidence'] = $categorization['confidence'];
        $validated['category_scores'] = $categorization['scores'];
        $validated['hashtags'] = $categorization['hashtags'];
        $longestVideoDuration = $this->resolveLongestVideoDuration($uploadedMedia, $mediaDurationSeconds);
        $validation = $this->contentValidationService->validate(
            (string) ($validated['content'] ?? ''),
            (array) $validated['hashtags'],
            $request->hasFile('media'),
            $hasVideoMedia,
            $longestVideoDuration,
        );
        $mediaFingerprints = $this->mediaFingerprintsForDuplicateCheck($uploadedMedia);
        $validation = $this->applyAutomaticApprovalSignals(
            $validation,
            $request->user(),
            (string) ($validated['content'] ?? ''),
            $uploadedMedia,
            null,
            $mediaFingerprints,
        );
        $validation = $this->applyMediaQualitySignals(
            $validation,
            $this->mediaQualityService->validateUploads($uploadedMedia, $mediaDurationSeconds),
        );
        $validation = $this->applyCopyrightRiskSignals(
            $validation,
            $this->copyrightRiskService->inspectUploads((string) ($validated['content'] ?? ''), $uploadedMedia),
        );

        if (! $validation['passed']) {
            throw ValidationException::withMessages([
                'media' => $validation['violations'],
                'content' => $validation['violations'],
            ]);
        }

        $validated['content_validation_status'] = $validation['status'];
        $validated['content_validation_score'] = $validation['score'];
        $validated['content_validation_summary'] = $validation['summary'];
        $validated['content_validation_flags'] = [
            'violations' => $validation['violations'],
            'warnings' => $validation['warnings'],
        ];
        $validated['content_validation_trace'] = $validation['trace'];
        $validated['content_validated_at'] = now();
        $validated['reward_status'] = $longestVideoDuration !== null && $longestVideoDuration >= PostRewardService::MIN_VIDEO_DURATION_SECONDS
            ? 'eligible'
            : 'ineligible';
        $validated['reward_amount'] = 0;
        $validated['reward_reason'] = $validated['reward_status'] === 'eligible'
            ? 'Video meets the duration threshold and is ready for reward crediting.'
            : 'Video must be at least 30 seconds long to earn a creator reward.';
        $validated['rewarded_at'] = null;

        $post = $request->user()->posts()->create($validated);

        if ($request->hasFile('music')) {
            $musicFile = $request->file('music');
            $musicPath = $musicFile->store(
                app(MediaPathService::class)->originalUploadDirectory('post-music'),
                'public',
            );
            if (! is_string($musicPath) || $musicPath === '') {
                throw ValidationException::withMessages([
                    'music' => 'Unable to save music right now. Please try again.',
                ]);
            }

            $post->update([
                'music_path' => $musicPath,
                'music_title' => pathinfo($musicFile->getClientOriginalName(), PATHINFO_FILENAME),
                'music_mime_type' => $musicFile->getMimeType(),
                'music_duration_seconds' => $validated['music_duration_seconds'] ?? null,
            ]);
        }

        if ($request->hasFile('media')) {
            $uploadDirectory = app(MediaPathService::class)->originalUploadDirectory('posts');

            foreach ($uploadedMedia as $index => $file) {
                if (!$file->isValid()) {
                    throw new \Exception('File upload failed: ' . $file->getErrorMessage());
                }
                $path = $file->store($uploadDirectory, 'public');
                if (! is_string($path) || $path === '') {
                    throw ValidationException::withMessages([
                        'media' => 'Unable to save media right now. Please try again.',
                    ]);
                }
                $postMedia = $post->media()->create([
                    'id' => (string) Str::uuid(),
                    'file_path' => $path,
                    'processed_file_path' => null,
                    'file_type' => Str::startsWith($file->getMimeType(), 'video') ? 'video' : 'image',
                    'mime_type' => $file->getMimeType(),
                    'media_fingerprint' => $mediaFingerprints[$index] ?? null,
                    'duration' => isset($mediaDurationSeconds[$index]) && is_numeric($mediaDurationSeconds[$index])
                        ? (int) round((float) $mediaDurationSeconds[$index])
                        : null,
                    'thumbnail_path' => null,
                    'variants' => ['original' => $path],
                    'processing_status' => 'queued',
                    'processed_at' => null,
                ]);
                ProcessPostMedia::dispatch($postMedia->id);
            }

            // Re-categorize once media is known (video/image can shift category confidence)
            $firstMediaType = $post->media()->value('file_type');
            
            $categorization = $this->postCategorizationService->categorize(
                (string) ($post->content ?? ''),
                (array) ($post->hashtags ?? []),
                $firstMediaType,
            );

            $post->update([
                'primary_category' => $categorization['primary_category'],
                'category_confidence' => $categorization['confidence'],
                'category_scores' => $categorization['scores'],
                'hashtags' => $categorization['hashtags'],
            ]);
        }

        $post = $this->postRewardService->syncReward($post, $longestVideoDuration);

        $post->load(['user', 'media', 'businessPage']);

        PostCreated::dispatch($post);

        return (new PostResource($post))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, Post $post): PostResource
    {
        $this->authorize('update', $post);

        $validated = $request->validate([
            'content' => 'nullable|string|max:5000',
            'remove_existing_media' => 'nullable|boolean',
            'media_duration_seconds' => 'nullable|array',
            'media_duration_seconds.*' => 'nullable|numeric|min:0|max:21600',
            'media.*' => [
                'file',
                'max:' . self::MAX_MEDIA_FILE_SIZE_KB,
            ],
        ], [
            'media.*.uploaded' => 'The file failed to upload. It may be larger than the server limit.',
            'media.*.max' => 'Each media file must be 50GB or smaller.',
        ]);

        $uploaded = $request->file('media');
        $uploadedMedia = is_array($uploaded) ? $uploaded : ($uploaded ? [$uploaded] : []);
        $this->validatePostMediaSelection($uploadedMedia);
        $mediaDurationSeconds = array_map(
            static fn ($value) => is_numeric($value) ? (float) $value : null,
            (array) ($validated['media_duration_seconds'] ?? []),
        );
        $hasNewMedia = count($uploadedMedia) > 0;
        $removeExistingMedia = filter_var($validated['remove_existing_media'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $nextContent = trim((string) ($validated['content'] ?? $post->content ?? ''));
        $hasCurrentMedia = $post->media()->exists();
        $willHaveMedia = $hasNewMedia || (!$removeExistingMedia && $hasCurrentMedia);

        if ($nextContent === '' && !$willHaveMedia) {
            abort(422, 'Please provide content or upload media');
        }

        $nextMediaType = $hasNewMedia
            ? (Str::startsWith((string) $uploadedMedia[0]->getMimeType(), 'video') ? 'video' : 'image')
            : ($removeExistingMedia ? null : $post->media()->value('file_type'));
        $categorization = $this->postCategorizationService->categorize(
            $nextContent,
            (array) ($post->hashtags ?? []),
            $nextMediaType,
        );
        $longestVideoDuration = $hasNewMedia
            ? $this->resolveLongestVideoDuration($uploadedMedia, $mediaDurationSeconds)
            : $this->resolveExistingLongestVideoDuration($post, $removeExistingMedia);
        $validation = $this->contentValidationService->validate(
            $nextContent,
            (array) ($post->hashtags ?? []),
            $willHaveMedia,
            $nextMediaType === 'video',
            $longestVideoDuration,
        );
        $mediaFingerprints = $this->mediaFingerprintsForDuplicateCheck($uploadedMedia);
        $validation = $this->applyAutomaticApprovalSignals(
            $validation,
            $request->user(),
            $nextContent,
            $uploadedMedia,
            $post,
            $mediaFingerprints,
        );
        $validation = $this->applyMediaQualitySignals(
            $validation,
            $this->mediaQualityService->validateUploads($uploadedMedia, $mediaDurationSeconds),
        );
        $validation = $this->applyCopyrightRiskSignals(
            $validation,
            $this->copyrightRiskService->inspectUploads($nextContent, $uploadedMedia),
        );

        if (! $validation['passed']) {
            throw ValidationException::withMessages([
                'media' => $validation['violations'],
                'content' => $validation['violations'],
            ]);
        }

        $alreadyCredited = $post->reward_status === 'credited' && (float) $post->reward_amount > 0;

        $updatePayload = [
            'primary_category' => $categorization['primary_category'],
            'category_confidence' => $categorization['confidence'],
            'category_scores' => $categorization['scores'],
            'hashtags' => $categorization['hashtags'],
            'content_validation_status' => $validation['status'],
            'content_validation_score' => $validation['score'],
            'content_validation_summary' => $validation['summary'],
            'content_validation_flags' => [
                'violations' => $validation['violations'],
                'warnings' => $validation['warnings'],
            ],
            'content_validation_trace' => $validation['trace'],
            'content_validated_at' => now(),
            'reward_status' => $alreadyCredited
                ? 'credited'
                : ($longestVideoDuration !== null && $longestVideoDuration >= PostRewardService::MIN_VIDEO_DURATION_SECONDS
                    ? 'eligible'
                    : 'ineligible'),
            'reward_amount' => $alreadyCredited ? $post->reward_amount : 0,
            'reward_reason' => $alreadyCredited
                ? ($post->reward_reason ?: 'Validated video reached 30 seconds and earned a creator reward.')
                : ($longestVideoDuration !== null && $longestVideoDuration >= PostRewardService::MIN_VIDEO_DURATION_SECONDS
                    ? 'Video meets the duration threshold and is ready for reward crediting.'
                    : 'Video must be at least 30 seconds long to earn a creator reward.'),
            'rewarded_at' => $alreadyCredited ? $post->rewarded_at : null,
        ];
        if (array_key_exists('content', $validated)) {
            $updatePayload['content'] = $validated['content'];
        }

        $post->update($updatePayload);

        if ($removeExistingMedia || $hasNewMedia) {
            $post->media()->delete();
        }

        if ($hasNewMedia) {
            $uploadDirectory = app(MediaPathService::class)->originalUploadDirectory('posts');
            foreach ($uploadedMedia as $index => $file) {
                if (!$file->isValid()) {
                    throw new \Exception('File upload failed: ' . $file->getErrorMessage());
                }
                $path = $file->store($uploadDirectory, 'public');
                if (! is_string($path) || $path === '') {
                    throw ValidationException::withMessages([
                        'media' => 'Unable to save media right now. Please try again.',
                    ]);
                }
                $postMedia = $post->media()->create([
                    'id' => (string) Str::uuid(),
                    'file_path' => $path,
                    'processed_file_path' => null,
                    'file_type' => Str::startsWith($file->getMimeType(), 'video') ? 'video' : 'image',
                    'mime_type' => $file->getMimeType(),
                    'media_fingerprint' => $mediaFingerprints[$index] ?? null,
                    'duration' => isset($mediaDurationSeconds[$index]) && is_numeric($mediaDurationSeconds[$index])
                        ? (int) round((float) $mediaDurationSeconds[$index])
                        : null,
                    'thumbnail_path' => null,
                    'variants' => ['original' => $path],
                    'processing_status' => 'queued',
                    'processed_at' => null,
                ]);
                ProcessPostMedia::dispatch($postMedia->id);
            }
        }

        $post = $this->postRewardService->syncReward($post->fresh(), $longestVideoDuration);

        $post->load(['user', 'media', 'businessPage']);

        return new PostResource($post);
    }

    public function destroy(Request $request, Post $post): void
    {
        $this->authorize('delete', $post);
        $post->forceDelete();
    }

    public function like(Post $post): PostResource
    {
        $user = request()->user();
        abort_unless(PostAccess::canView($post, $user), 404);

        Log::info('Like request received', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $exists = $post->likes()
            ->where('user_id', $user->id)
            ->where('likeable_type', 'App\\Models\\Post')
            ->exists();

        if (!$exists) {
            $post->likes()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'likeable_type' => 'App\\Models\\Post',
            ]);
            $post->increment('like_count');
            $this->changePostDailyMetric($post, 'likes');
            $this->postEngagementMonetizationService->credit($post, 'like', $user);
            Log::info('Post liked successfully', [
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
        } else {
            Log::info('Like relationship already exists', [
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
        }

        $post->load($this->postRelations(['monetization']));

        // Set user_liked explicitly since we just liked it
        $post->user_liked = true;

        // Load user_reshared status
        $post->loadExists(['reposts as user_reshared' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }]);

        PostLiked::dispatch($post, $user, true);
        $this->behaviorSignalService->recordPostEvent($post->loadMissing('media'), 'click', $user->id);

        return new PostResource($post);
    }

    public function unlike(Post $post): PostResource
    {
        $user = request()->user();
        abort_unless(PostAccess::canView($post, $user), 404);

        Log::info('Unlike request received', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $deleted = $post->likes()
            ->where('user_id', $user->id)
            ->where('likeable_type', 'App\\Models\\Post')
            ->delete();

        if ($deleted) {
            $post->decrement('like_count');
            $this->changePostDailyMetric($post, 'likes', -1);
            Log::info('Post unliked successfully', [
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
        } else {
            Log::info('Unlike relationship not found', [
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
        }

        $post->load($this->postRelations(['monetization']));

        // Set user_liked explicitly since we just unliked it
        $post->user_liked = false;

        // Load user_reshared status
        $post->loadExists(['reposts as user_reshared' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }]);

        PostUnliked::dispatch($post, $user->id);

        return new PostResource($post);
    }

    public function engagement(Request $request, Post $post): array
    {
        $user = $request->user();
        abort_unless(PostAccess::canView($post, $user), 404);

        $validated = $request->validate([
            'event_type' => 'required|in:dwell',
            'dwell_seconds' => 'required|numeric|min:10|max:21600',
            'surface' => 'nullable|string|max:40',
        ]);

        $surface = in_array($validated['surface'] ?? 'feed', ['feed', 'moments', 'profile', 'search'], true)
            ? (string) ($validated['surface'] ?? 'feed')
            : 'feed';
        $cacheKey = sprintf(
            'post-engagement:%s:%s:%s:%s',
            $post->id,
            $user?->id ?: $request->ip(),
            $validated['event_type'],
            now()->toDateString(),
        );

        if (Cache::add($cacheKey, true, now()->addDay())) {
            $this->behaviorSignalService->recordPostEvent(
                $post->loadMissing('media'),
                (string) $validated['event_type'],
                $user?->id,
                $surface,
            );
        }

        return [
            'recorded' => true,
            'event_type' => $validated['event_type'],
            'dwell_seconds' => (float) $validated['dwell_seconds'],
            'surface' => $surface,
        ];
    }

    public function reshare(Request $request, Post $post): PostResource
    {
        $user = $request->user();
        abort_unless(PostAccess::canView($post, $user), 404);

        Log::info('Reshare request received', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $existingReshare = Post::where('user_id', $user->id)
            ->where('original_post_id', $post->id)
            ->where('type', 'repost')
            ->first();

        if ($existingReshare) {
            Log::info('Reshare already exists', [
                'user_id' => $user->id,
                'post_id' => $post->id,
                'reshare_id' => $existingReshare->id,
            ]);
            return new PostResource($existingReshare);
        }

        $repost = $user->posts()->create([
            'id' => (string) Str::uuid(),
            'original_post_id' => $post->id,
            'type' => 'repost',
            'visibility' => 'everyone',
            'content' => '',
        ]);

        $post->increment('repost_count');

        Log::info('Post reshared successfully', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'reshare_id' => $repost->id,
        ]);

        PostReshared::dispatch($repost, $post);
        $this->behaviorSignalService->recordPostEvent($post->loadMissing('media'), 'completion', $user->id);

        return new PostResource($repost->load($this->postRelations()));
    }

    public function save(Post $post): PostResource
    {
        $user = request()->user();
        abort_unless(PostAccess::canView($post, $user), 404);

        $exists = $post->bookmarks()
            ->where('user_id', $user->id)
            ->exists();

        if (!$exists) {
            $post->bookmarks()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
            ]);
            $post->increment('save_count');
            $this->behaviorSignalService->recordPostEvent($post->loadMissing('media'), 'view', $user->id);
        }

        $post->load($this->postRelations(['monetization']));
        $post->user_saved = true;

        // Load other statuses
        $post->loadExists(['likes as user_liked' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }]);
        $post->loadExists(['reposts as user_reshared' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }]);

        return new PostResource($post);
    }

    public function unsave(Post $post): PostResource
    {
        $user = request()->user();
        abort_unless(PostAccess::canView($post, $user), 404);

        $deleted = $post->bookmarks()
            ->where('user_id', $user->id)
            ->delete();

        if ($deleted) {
            $post->decrement('save_count');
        }

        $post->load($this->postRelations(['monetization']));
        $post->user_saved = false;

        // Load other statuses
        $post->loadExists(['likes as user_liked' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }]);
        $post->loadExists(['reposts as user_reshared' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }]);

        return new PostResource($post);
    }

    public function unreshare(Request $request, Post $post): PostResource
    {
        $user = $request->user();
        abort_unless(PostAccess::canView($post, $user), 404);

        Log::info('Unreshare request received', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $deleted = Post::where('user_id', $user->id)
            ->where('original_post_id', $post->id)
            ->where('type', 'repost')
            ->delete();

        if ($deleted) {
            $post->decrement('repost_count');
            Log::info('Post unreshared successfully', [
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
        } else {
            Log::info('Reshare not found', [
                'user_id' => $user->id,
                'post_id' => $post->id,
            ]);
        }

        $post->load($this->postRelations(['monetization']));

        $post->user_reshared = false;
        $post->loadExists(['likes as user_liked' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }]);

        return new PostResource($post);
    }

    public function comment(Request $request, Post $post): array
    {
        $user = $request->user();
        abort_unless(PostAccess::canView($post, $user), 404);

        Log::info('Comment request received', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $validated = $request->validate([
            'content' => 'nullable|string|max:1000',
            'parent_id' => 'nullable|uuid|exists:comments,id',
            'images' => 'nullable|array|max:4',
            'images.*' => 'image|max:10240',
        ]);

        $uploadedImages = array_values(array_filter((array) $request->file('images', [])));
        if (trim((string) ($validated['content'] ?? '')) === '' && $uploadedImages === []) {
            throw ValidationException::withMessages([
                'content' => ['Add a comment, image, emoji, or sticker before posting.'],
            ]);
        }

        $parentComment = null;
        if (! empty($validated['parent_id'])) {
            $parentComment = Comment::query()->find($validated['parent_id']);

            if (! $parentComment || $parentComment->post_id !== $post->id || $parentComment->trashed()) {
                throw ValidationException::withMessages([
                    'parent_id' => ['The selected parent comment is invalid.'],
                ]);
            }
        }

        $media = [];
        if ($uploadedImages !== []) {
            $uploadDirectory = app(MediaPathService::class)->originalUploadDirectory('comments');

            foreach ($uploadedImages as $file) {
                if (! $file->isValid()) {
                    throw new \Exception('File upload failed: ' . $file->getErrorMessage());
                }

                $media[] = [
                    'id' => (string) Str::uuid(),
                    'path' => $file->store($uploadDirectory, 'public'),
                    'type' => 'image',
                    'mime_type' => $file->getMimeType(),
                ];
            }
        }

        $comment = $post->comments()->create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'parent_id' => $parentComment?->id,
            'content' => trim((string) ($validated['content'] ?? '')),
            'media' => $media,
        ]);

        $comment->load('user');
        $post->increment('comment_count');
        $this->changePostDailyMetric($post, 'comments');
        $this->postEngagementMonetizationService->credit($post, 'comment', $user, (string) $comment->id);

        Log::info('Comment created successfully', [
            'user_id' => $user->id,
            'post_id' => $post->id,
            'comment_id' => $comment->id,
        ]);

        CommentCreated::dispatch($comment);
        $this->behaviorSignalService->recordPostEvent($post->loadMissing('media'), 'view', $user->id);

        return [
            'id' => $comment->id,
            'post_id' => $comment->post_id,
            'user_id' => $comment->user_id,
            'content' => $comment->content,
            'parent_id' => $comment->parent_id,
            'media' => $this->formatCommentMedia($comment),
            'like_count' => 0,
            'user_liked' => false,
            'reply_count' => 0,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'username' => $comment->user->username,
                'avatar' => $comment->user->avatar_url,
                'is_verified' => $comment->user->hasActiveKaraVerifiedBadge(),
            ],
            'created_at' => $comment->created_at->toISOString(),
        ];
    }

    public function likeComment(Post $post, Comment $comment, Request $request): array
    {
        $user = $request->user();
        abort_unless(PostAccess::canView($post, $user), 404);
        abort_unless($comment->post_id === $post->id, 404);

        $exists = $comment->likes()
            ->where('user_id', $user->id)
            ->where('likeable_type', Comment::class)
            ->exists();

        if (! $exists) {
            $comment->likes()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'likeable_type' => Comment::class,
            ]);
            $comment->increment('like_count');
            $this->changePostDailyMetric($post, 'comment_likes');
        }

        return [
            'id' => $comment->id,
            'like_count' => $comment->fresh()->like_count,
            'user_liked' => true,
        ];
    }

    public function unlikeComment(Post $post, Comment $comment, Request $request): array
    {
        $user = $request->user();
        abort_unless(PostAccess::canView($post, $user), 404);
        abort_unless($comment->post_id === $post->id, 404);

        $deleted = $comment->likes()
            ->where('user_id', $user->id)
            ->where('likeable_type', Comment::class)
            ->delete();

        if ($deleted && $comment->like_count > 0) {
            $comment->decrement('like_count');
            $this->changePostDailyMetric($post, 'comment_likes', -1);
        }

        return [
            'id' => $comment->id,
            'like_count' => $comment->fresh()->like_count,
            'user_liked' => false,
        ];
    }

    private function transformComment(Comment $comment): array
    {
        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'parent_id' => $comment->parent_id,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'username' => $comment->user->username,
                'avatar' => $comment->user->avatar_url,
                'is_verified' => $comment->user->hasActiveKaraVerifiedBadge(),
            ],
            'created_at' => $comment->created_at->toISOString(),
            'like_count' => $comment->likes_count ?? 0,
            'user_liked' => (bool) ($comment->user_liked ?? false),
            'media' => $this->formatCommentMedia($comment),
            'reply_count' => $comment->replies_count ?? 0,
        ];
    }

    private function formatCommentMedia(Comment $comment): array
    {
        $items = $comment->media ?? [];
        if (! is_array($items)) {
            return [];
        }

        return array_values(array_map(function (array $item): array {
            $path = (string) ($item['path'] ?? '');

            return [
                'id' => $item['id'] ?? (string) Str::uuid(),
                'path' => $path,
                'url' => app(MediaPathService::class)->toUrl($path),
                'type' => $item['type'] ?? 'image',
                'mime_type' => $item['mime_type'] ?? null,
            ];
        }, array_filter($items, fn ($item) => is_array($item) && ! empty($item['path']))));
    }

    /**
     * @param  array<int, \Illuminate\Http\UploadedFile>  $uploadedMedia
     */
    private function validatePostMediaSelection(array $uploadedMedia): void
    {
        if ($uploadedMedia === []) {
            return;
        }

        $imageCount = 0;
        $videoCount = 0;

        foreach ($uploadedMedia as $file) {
            $mimeType = (string) $file->getMimeType();

            if (Str::startsWith($mimeType, 'image/')) {
                $imageCount++;
                continue;
            }

            if (Str::startsWith($mimeType, 'video/')) {
                $videoCount++;
                continue;
            }

            throw ValidationException::withMessages([
                'media' => ['Only image and video files are supported.'],
            ]);
        }

        if ($imageCount > 0 && $videoCount > 0) {
            throw ValidationException::withMessages([
                'media' => ['Upload either images or a single video, not both.'],
            ]);
        }

        if ($imageCount > 4) {
            throw ValidationException::withMessages([
                'media' => ['Maximum 4 images per post.'],
            ]);
        }

        if ($videoCount > 1) {
            throw ValidationException::withMessages([
                'media' => ['Only one video is allowed.'],
            ]);
        }
    }

    /**
     * @param  array<int, \Illuminate\Http\UploadedFile>  $uploadedMedia
     * @param  array<int, float|null>  $mediaDurationSeconds
     */
    private function resolveLongestVideoDuration(array $uploadedMedia, array $mediaDurationSeconds): ?float
    {
        $durations = [];

        foreach ($uploadedMedia as $index => $file) {
            if (! Str::startsWith((string) $file->getMimeType(), 'video/')) {
                continue;
            }

            $duration = $mediaDurationSeconds[$index] ?? null;
            if ($duration !== null && $duration > 0) {
                $durations[] = (float) $duration;
            }
        }

        if ($durations === []) {
            return null;
        }

        return max($durations);
    }

    private function resolveExistingLongestVideoDuration(Post $post, bool $removeExistingMedia): ?float
    {
        if ($removeExistingMedia) {
            return null;
        }

        $durations = $post->media()
            ->where('file_type', 'video')
            ->pluck('duration')
            ->filter(fn ($duration) => is_numeric($duration) && (float) $duration > 0)
            ->map(fn ($duration) => (float) $duration)
            ->all();

        if ($durations === []) {
            return null;
        }

        return max($durations);
    }

    /**
     * @param  array<string, mixed>  $validation
     * @param  array<int, \Illuminate\Http\UploadedFile>  $uploadedMedia
     * @return array<string, mixed>
     */
    private function applyAutomaticApprovalSignals(
        array $validation,
        User $user,
        string $content,
        array $uploadedMedia,
        ?Post $excludePost = null,
        ?array $mediaFingerprints = null,
    ): array {
        if (($validation['status'] ?? null) === 'rejected') {
            return $validation;
        }

        $mediaFingerprints ??= $this->mediaFingerprintsForDuplicateCheck($uploadedMedia);
        $duplicateSignals = $this->duplicateContentSignals($user, $content, $mediaFingerprints, $excludePost);
        $validation['trace'][] = [
            'rule' => 'media_fingerprint',
            'severity' => 'info',
            'passed' => true,
            'message' => $mediaFingerprints === []
                ? 'No upload media fingerprint was available.'
                : 'Upload media fingerprints saved for duplicate checks.',
            'meta' => ['fingerprints' => $mediaFingerprints],
        ];

        if ($duplicateSignals === []) {
            return $validation;
        }

        $violations = array_merge((array) ($validation['violations'] ?? []), $duplicateSignals);
        $validation['violations'] = array_values(array_unique($violations));
        $validation['passed'] = false;
        $validation['score'] = max(0, (int) ($validation['score'] ?? 100) - 45);
        $validation['status'] = 'rejected';
        $validation['summary'] = 'This post cannot be published because it appears to duplicate existing content.';
        $validation['trace'][] = [
            'rule' => 'duplicate_content',
            'severity' => 'error',
            'passed' => false,
            'message' => implode(' ', $duplicateSignals),
        ];

        return $validation;
    }

    /**
     * @param  array<string, mixed>  $validation
     * @param  array{passed: bool, violations: array<int, string>, warnings: array<int, string>, trace: array<int, array<string, mixed>>}  $quality
     * @return array<string, mixed>
     */
    private function applyMediaQualitySignals(array $validation, array $quality): array
    {
        $validation['trace'] = array_merge((array) ($validation['trace'] ?? []), $quality['trace']);

        if ($quality['warnings'] !== []) {
            $validation['warnings'] = array_values(array_unique(array_merge(
                (array) ($validation['warnings'] ?? []),
                $quality['warnings'],
            )));
        }

        if ($quality['passed']) {
            return $validation;
        }

        $validation['violations'] = array_values(array_unique(array_merge(
            (array) ($validation['violations'] ?? []),
            $quality['violations'],
        )));
        $validation['passed'] = false;
        $validation['score'] = max(0, (int) ($validation['score'] ?? 100) - 40);
        $validation['status'] = 'rejected';
        $validation['summary'] = 'This post cannot be published because the media quality is too low.';

        return $validation;
    }

    /**
     * @param  array<string, mixed>  $validation
     * @param  array{has_risk: bool, warnings: array<int, string>, trace: array<int, array<string, mixed>>}  $copyright
     * @return array<string, mixed>
     */
    private function applyCopyrightRiskSignals(array $validation, array $copyright): array
    {
        $validation['trace'] = array_merge((array) ($validation['trace'] ?? []), $copyright['trace']);

        if (! $copyright['has_risk']) {
            return $validation;
        }

        $validation['warnings'] = array_values(array_unique(array_merge(
            (array) ($validation['warnings'] ?? []),
            $copyright['warnings'],
        )));
        $validation['score'] = max(0, (int) ($validation['score'] ?? 100) - 25);

        if (($validation['status'] ?? 'approved') === 'approved') {
            $validation['status'] = 'warning';
        }

        if (($validation['passed'] ?? true) === true) {
            $validation['summary'] = 'Post published, but a copyright/watermark warning was saved. This video is not eligible for creator earnings.';
        }

        return $validation;
    }

    /**
     * @param  array<int, string>  $mediaFingerprints
     * @return array<int, string>
     */
    private function duplicateContentSignals(User $user, string $content, array $mediaFingerprints, ?Post $excludePost = null): array
    {
        $signals = [];
        $normalizedContent = $this->normalizeContentForDuplicateCheck($content);

        if (mb_strlen($normalizedContent) >= 8) {
            $recentCaptions = Post::query()
                ->when($excludePost, fn ($query) => $query->where('id', '!=', $excludePost->id))
                ->whereNotNull('content')
                ->where('created_at', '>=', now()->subDays(90))
                ->latest()
                ->limit(500)
                ->get(['user_id', 'content']);

            $sameUserDuplicate = false;
            $otherUserDuplicate = false;
            foreach ($recentCaptions as $post) {
                if ($this->normalizeContentForDuplicateCheck((string) $post->content) !== $normalizedContent) {
                    continue;
                }

                if ((string) $post->user_id === (string) $user->id) {
                    $sameUserDuplicate = true;
                } else {
                    $otherUserDuplicate = true;
                }
            }

            if ($sameUserDuplicate) {
                $signals[] = 'This caption looks like a duplicate of a recent post from the same user.';
            }

            if ($otherUserDuplicate) {
                $signals[] = 'This caption already appears on another KaraAds post and needs ownership review before reward payment.';
            }
        }

        if (count($mediaFingerprints) !== count(array_unique($mediaFingerprints))) {
            $signals[] = 'The upload contains duplicate media files.';
        }

        if ($mediaFingerprints !== []) {
            $matchingMediaPostIds = DB::table('post_media')
                ->when($excludePost, fn ($query) => $query->where('post_id', '!=', $excludePost->id))
                ->whereIn('media_fingerprint', $mediaFingerprints)
                ->whereNotNull('media_fingerprint')
                ->pluck('post_id')
                ->filter()
                ->unique()
                ->values()
                ->all();

            if ($matchingMediaPostIds !== []) {
                $matchingPosts = Post::query()
                    ->whereIn('id', $matchingMediaPostIds)
                    ->where('created_at', '>=', now()->subDays(365))
                    ->get(['user_id']);

                if ($matchingPosts->contains(fn (Post $post) => (string) $post->user_id === (string) $user->id)) {
                    $signals[] = 'This media looks like a duplicate of a previous post from the same user.';
                }

                if ($matchingPosts->contains(fn (Post $post) => (string) $post->user_id !== (string) $user->id)) {
                    $signals[] = 'This media already appears on another KaraAds post and needs ownership review before reward payment.';
                }
            }

            $recentPosts = Post::query()
                ->when($excludePost, fn ($query) => $query->where('id', '!=', $excludePost->id))
                ->where('created_at', '>=', now()->subDays(90))
                ->latest()
                ->limit(500)
                ->get(['user_id', 'content_validation_trace']);

            $sameUserMediaDuplicate = false;
            $otherUserMediaDuplicate = false;
            foreach ($recentPosts as $post) {
                if (array_intersect($mediaFingerprints, $this->mediaFingerprintsFromTrace((array) ($post->content_validation_trace ?? []))) === []) {
                    continue;
                }

                if ((string) $post->user_id === (string) $user->id) {
                    $sameUserMediaDuplicate = true;
                } else {
                    $otherUserMediaDuplicate = true;
                }
            }

            if ($sameUserMediaDuplicate) {
                $signals[] = 'This media looks like a duplicate of a recent post from the same user.';
            }

            if ($otherUserMediaDuplicate) {
                $signals[] = 'This media already appears on another KaraAds post and needs ownership review before reward payment.';
            }
        }

        return array_values(array_unique($signals));
    }

    /**
     * @param  array<int, \Illuminate\Http\UploadedFile>  $uploadedMedia
     * @return array<int, string>
     */
    private function mediaFingerprintsForDuplicateCheck(array $uploadedMedia): array
    {
        $fingerprints = [];

        foreach ($uploadedMedia as $file) {
            if (! $file->isValid()) {
                continue;
            }

            $path = $file->getRealPath();
            $fingerprints[] = $path && is_readable($path)
                ? hash_file('sha256', $path)
                : hash('sha256', implode(':', [
                    (string) $file->getSize(),
                    (string) $file->getMimeType(),
                    Str::lower((string) $file->getClientOriginalName()),
                ]));
        }

        return $fingerprints;
    }

    /**
     * @param  array<int, array<string, mixed>>  $trace
     * @return array<int, string>
     */
    private function mediaFingerprintsFromTrace(array $trace): array
    {
        return collect($trace)
            ->filter(fn ($entry) => is_array($entry) && ($entry['rule'] ?? null) === 'media_fingerprint')
            ->flatMap(fn ($entry) => (array) data_get($entry, 'meta.fingerprints', []))
            ->filter(fn ($fingerprint) => is_string($fingerprint) && $fingerprint !== '')
            ->values()
            ->all();
    }

    private function normalizeContentForDuplicateCheck(string $content): string
    {
        $normalized = mb_strtolower(trim($content));
        $normalized = preg_replace('/\s+/u', ' ', $normalized) ?? '';
        $normalized = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $normalized) ?? '';
        $normalized = preg_replace('/\s+/u', ' ', $normalized) ?? '';

        return trim($normalized);
    }

    private function formatCommentPaginator(LengthAwarePaginator $comments): array
    {
        $transformedComments = $comments->getCollection()->transform(
            fn (Comment $comment) => $this->transformComment($comment)
        );

        return [
            'data' => $transformedComments,
            'links' => [
                'first' => $comments->url(1),
                'last' => $comments->url($comments->lastPage()),
                'prev' => $comments->previousPageUrl(),
                'next' => $comments->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $comments->currentPage(),
                'from' => $comments->firstItem(),
                'last_page' => $comments->lastPage(),
                'links' => $comments->linkCollection()->toArray(),
                'path' => $comments->path(),
                'per_page' => $comments->perPage(),
                'to' => $comments->lastItem(),
                'total' => $comments->total(),
            ],
        ];
    }

    public function search(Request $request): AnonymousResourceCollection
    {
        $query = trim((string) $request->query('q', ''));

        if (strlen($query) < 2) {
            return PostResource::collection(collect([]));
        }

        $user = $request->user();

        $posts = Post::search($query)
            ->query(function ($searchQuery) use ($user): void {
                $searchQuery->whereHas('user')
                    ->with($this->postRelations());
                $this->applyPostAccessScope($searchQuery, $user);

                if ($user) {
                    $searchQuery->withExists(['likes as user_liked' => function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    }])
                        ->withExists(['reposts as user_reshared' => function ($q) use ($user) {
                            $q->where('user_id', $user->id);
                        }])
                        ->withExists(['bookmarks as user_saved' => function ($q) use ($user) {
                            $q->where('user_id', $user->id);
                        }]);
                }
            })
            ->paginate(15);

        return PostResource::collection($posts);
    }

    public function hashtag(Request $request, string $tag): AnonymousResourceCollection
    {
        $normalizedTag = $this->normalizeHashtag($tag);
        if ($normalizedTag === '') {
            return PostResource::collection(collect([]));
        }

        $user = $request->user();

        $exactQuery = Post::with($this->postRelations())
            ->whereHas('user')
            ->whereJsonContains('hashtags', $normalizedTag)
            ->latest();

        $this->applyPostAccessScope($exactQuery, $user);
        $this->applyUserPostFlags($exactQuery, $user);

        $exactPosts = $exactQuery->paginate(15);
        if ($exactPosts->total() > 0) {
            return PostResource::collection($exactPosts);
        }

        $fallbackPosts = Post::search($normalizedTag)
            ->query(function ($searchQuery) use ($user): void {
                $searchQuery->whereHas('user')
                    ->with($this->postRelations());
                $this->applyPostAccessScope($searchQuery, $user);
                $this->applyUserPostFlags($searchQuery, $user);
            })
            ->paginate(15);

        return PostResource::collection($fallbackPosts);
    }

    public function report(Request $request, Post $post)
    {
        $validated = $request->validate([
            'reason' => 'required|in:spam,abusive,misinformation,harassment,other',
            'description' => 'nullable|string|max:500',
        ]);

        // Store the report (you may need to create a Report model)
        // For now, just acknowledge the report
        Log::info('Post reported', [
            'user_id' => $request->user()->id,
            'post_id' => $post->id,
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? '',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report submitted successfully. Thank you for helping us keep the community safe.',
        ], 201);
    }

    private function applyUserPostFlags(EloquentBuilder $query, ?User $user): void
    {
        if (! $user) {
            return;
        }

        $query->withExists(['likes as user_liked' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }])
            ->withExists(['reposts as user_reshared' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }])
            ->withExists(['bookmarks as user_saved' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
    }

    private function normalizeHashtag(string $tag): string
    {
        $normalized = trim(urldecode($tag));
        $normalized = ltrim($normalized, '#');
        $normalized = Str::lower($normalized);
        $normalized = preg_replace('/[^\p{L}\p{N}_-]+/u', '', $normalized) ?? '';

        return trim($normalized);
    }

    public function updateComment(Post $post, Comment $comment, Request $request): array
    {
        $user = $request->user();
        abort_unless((string) $comment->user_id === (string) $user->id, 403, 'You cannot edit this comment.');
        abort_unless((string) $comment->post_id === (string) $post->id, 404, 'Comment not found on this post.');
        $validated = $request->validate(['content' => ['required', 'string', 'min:1', 'max:1000']]);
        $comment->update(['content' => $validated['content']]);
        return [
            'id'         => $comment->id,
            'content'    => $comment->content,
            'updated_at' => $comment->updated_at,
        ];
    }

    public function destroyComment(Post $post, Comment $comment, Request $request): \Illuminate\Http\Response
    {
        $user = $request->user();
        $isOwner    = (string) $comment->user_id === (string) $user->id;
        $isPostOwner = (string) $post->user_id   === (string) $user->id;
        abort_unless($isOwner || $isPostOwner, 403, 'You cannot delete this comment.');
        abort_unless((string) $comment->post_id === (string) $post->id, 404, 'Comment not found on this post.');
        $comment->delete();
        return response()->noContent();
    }

}