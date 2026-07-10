<?php

namespace App\Http\Controllers\Api;

use App\Actions\Media\QueueUserAvatarUploadAction;
use App\Actions\Media\QueueUserCoverUploadAction;
use App\Events\UserFollowed;
use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Models\BusinessPage;
use App\Models\Comment;
use App\Models\Earning;
use App\Models\Follow;
use App\Models\Like;
use App\Models\Bookmark;
use App\Models\LiveStream;
use App\Models\Message;
use App\Models\Post;
use App\Models\User;
use App\Models\UserWallet;
use App\Support\CountryCurrency;
use App\Support\UserPrivacy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use App\Support\OnboardingInterestOptions;

class UserController extends Controller
{
    private const MONETIZATION_FEE_AMOUNT = 5000.00;

    public function index(Request $request): AnonymousResourceCollection
    {
        $search = trim((string) $request->query('search', ''));
        $viewer = $request->user();

        if ($search === '') {
            $users = User::query()
                ->when($viewer, fn ($query) => $this->excludeBlockedUsers($query, $viewer))
                ->limit(20)
                ->get();

            return UserResource::collection($users);
        }

        $matchingIds = User::search($search)->keys();

        $users = User::query()
            ->when($matchingIds->isEmpty(), fn ($query) => $query->whereRaw('1 = 0'))
            ->when($matchingIds->isNotEmpty(), fn ($query) => $query->whereIn('id', $matchingIds->all()))
            ->when($viewer, fn ($query) => $this->excludeBlockedUsers($query, $viewer))
            ->latest()
            ->limit(20)
            ->get();

        return UserResource::collection($users);
    }

    public function show(User $user): UserResource
    {
        $viewer = request()->user();
        $this->abortIfBlocked($viewer, $user);
        if ($viewer && $viewer->id !== $user->id) {
            $user->loadExists([
                'followers as is_following' => function ($q) use ($viewer) {
                    $q->where('users.id', $viewer->id);
                },
            ]);
            $user->setAttribute('is_blocked', $viewer->blocked()->where('blocked_user_id', $user->id)->exists());
            $user->setAttribute('has_blocked_me', $viewer->blockedBy()->where('blocker_id', $user->id)->exists());
        } else {
            $user->setAttribute('is_following', false);
            $user->setAttribute('is_blocked', false);
            $user->setAttribute('has_blocked_me', false);
        }

        $user->loadCount(['followers', 'following']);

        return new UserResource($user);
    }

    public function byUsername(string $username): UserResource
    {
        $user = User::where('username', $username)->firstOrFail();
        $viewer = request()->user();
        $this->abortIfBlocked($viewer, $user);
        if ($viewer && $viewer->id !== $user->id) {
            $user->loadExists([
                'followers as is_following' => function ($q) use ($viewer) {
                    $q->where('users.id', $viewer->id);
                },
            ]);
            $user->setAttribute('is_blocked', $viewer->blocked()->where('blocked_user_id', $user->id)->exists());
            $user->setAttribute('has_blocked_me', $viewer->blockedBy()->where('blocker_id', $user->id)->exists());
        } else {
            $user->setAttribute('is_following', false);
            $user->setAttribute('is_blocked', false);
            $user->setAttribute('has_blocked_me', false);
        }

        $user->loadCount(['followers', 'following']);

        return new UserResource($user);
    }

    public function profile(Request $request): UserResource
    {
        $user = $request->user();
        $user->setAttribute('is_following', false);

        $user->loadCount(['followers', 'following']);

        return new UserResource($user);
    }

    public function onboarding(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'interest_options' => OnboardingInterestOptions::options(),
            'user' => [
                'birth_date' => $user->birth_date?->toDateString(),
                'onboarding_interests' => is_array($user->onboarding_interests) ? array_values($user->onboarding_interests) : null,
                'onboarding_completed_at' => $user->onboarding_completed_at?->toIso8601String(),
                'onboarding_complete' => $user->hasCompletedOnboarding(),
            ],
        ]);
    }

    public function completeOnboarding(Request $request): JsonResponse
    {
        $allowedInterests = OnboardingInterestOptions::values();

        $validated = $request->validate([
            'birth_date' => ['required', 'date', 'before_or_equal:today'],
            'interests' => ['required', 'array', 'min:3', 'max:5'],
            'interests.*' => ['required', 'string', Rule::in($allowedInterests)],
        ]);

        $normalizedInterests = $this->normalizeOnboardingInterests((array) ($validated['interests'] ?? []), $allowedInterests);

        if (count($normalizedInterests) < 3 || count($normalizedInterests) > 5) {
            return response()->json([
                'message' => 'The selected interests are invalid.',
                'errors' => [
                    'interests' => ['Select between 3 and 5 unique interests.'],
                ],
            ], 422);
        }

        $user = $request->user();
        $user->forceFill([
            'birth_date' => $validated['birth_date'],
            'onboarding_interests' => $normalizedInterests,
            'onboarding_completed_at' => now(),
        ])->save();

        $user->refresh();

        return response()->json([
            'message' => 'Onboarding completed successfully',
            'user' => new UserResource($user),
        ]);
    }

    public function posts(User $user,Request $request): AnonymousResourceCollection
    {
        $viewer = $request->user();
        $this->abortIfBlocked($viewer, $user);

        $query = $user->posts()
            ->with([
                'user',
                'media',
                'businessPage',
                'liveReplayStream',
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
            ])
            ->latest();

        $viewerId = $viewer?->id;
        if (!$viewer || (string) $viewerId !== (string) $user->id) {
            $query->where(function ($visibilityQuery) use ($viewerId, $user) {
                $visibilityQuery->where('visibility', 'everyone')
                    ->orWhere(function ($followersQuery) use ($viewerId, $user) {
                        $followersQuery->where('visibility', 'followers')
                            ->whereExists(function ($sub) use ($viewerId, $user) {
                                $sub->selectRaw('1')
                                    ->from('follows')
                                    ->where('follower_id', $viewerId)
                                    ->where('following_id', $user->id);
                            });
                    });
            })->where(function ($scheduled) {
                $scheduled->whereNull('scheduled_at')
                    ->orWhere('scheduled_at', '<=', now());
            });
        }

        if ($viewer) {
            $query->withExists(['likes as user_liked' => function ($q) use ($viewer) {
                $q->where('user_id', $viewer->id);
            }])
                ->withExists(['reposts as user_reshared' => function ($q) use ($viewer) {
                    $q->where('user_id', $viewer->id);
                }])
                ->withExists(['bookmarks as user_saved' => function ($q) use ($viewer) {
                    $q->where('user_id', $viewer->id);
                }]);
        }

        $perPage = (int) $request->query('per_page', $request->query('limit', 24));
        $perPage = max(1, min($perPage, 60));

        if ($request->boolean('media_only')) {
            $query->whereHas('media');
        }

        $posts = $query->paginate($perPage);

        return PostResource::collection($posts);
    }

    public function bookmarks(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = (int) $request->query('limit', 20);
        $limit = max(1, min($limit, 50));
        $cursor = $request->query('cursor');

        $query = Post::query()
            ->whereHas('bookmarks', fn ($q) => $q->where('user_id', $user->id))
            ->with([
                'user',
                'media',
                'liveReplayStream',
                'originalPost.media',
                'originalPost.user',
                'originalPost.liveReplayStream',
            ])
            ->withExists(['likes as user_liked' => fn ($q) => $q->where('user_id', $user->id)])
            ->withExists(['reposts as user_reshared' => fn ($q) => $q->where('user_id', $user->id)])
            ->withExists(['bookmarks as user_saved' => fn ($q) => $q->where('user_id', $user->id)])
            ->latest();

        if ($cursor) {
            $cursorPost = Post::find($cursor);
            if ($cursorPost) {
                $query->where('created_at', '<', $cursorPost->created_at)
                    ->orWhere(function ($q) use ($cursorPost) {
                        $q->where('created_at', $cursorPost->created_at)
                          ->where('id', '<', $cursorPost->id);
                    });
            }
        }

        $posts = $query->limit($limit + 1)->get();
        $hasMore = $posts->count() > $limit;
        $posts = $posts->take($limit);
        $nextCursor = $hasMore ? $posts->last()?->id : null;

        return response()->json([
            'data' => PostResource::collection($posts),
            'pagination' => [
                'next_cursor' => $nextCursor,
                'has_more' => $hasMore,
            ],
        ]);
    }

    public function getFollowing(Request $request): AnonymousResourceCollection
    {
        $search = $request->query('search');
        $user = $request->user();

        $following = $user->following()
            ->when($user, fn ($query) => $this->excludeBlockedUsers($query, $user))
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->limit(20)
            ->get();

        return UserResource::collection($following);
    }

    public function followers(User $user, Request $request): AnonymousResourceCollection
    {
        $viewer = $request->user();
        $this->abortIfBlocked($viewer, $user);
        $limit = (int) $request->query('limit', 50);
        $limit = max(1, min($limit, 200));

        $followers = $user->followers()
            ->when($viewer, fn ($query) => $this->excludeBlockedUsers($query, $viewer))
            ->when($viewer, function ($query) use ($viewer) {
                $query->addSelect([
                    'is_following' => Follow::query()
                        ->selectRaw('COUNT(*)')
                        ->whereColumn('follows.following_id', 'users.id')
                        ->where('follows.follower_id', $viewer->id),
                ]);
            })
            ->latest('follows.created_at')
            ->take($limit)
            ->get();

        return UserResource::collection($followers);
    }

    public function followingList(User $user, Request $request): AnonymousResourceCollection
    {
        $viewer = $request->user();
        $this->abortIfBlocked($viewer, $user);
        $limit = (int) $request->query('limit', 50);
        $limit = max(1, min($limit, 200));

        $following = $user->following()
            ->when($viewer, fn ($query) => $this->excludeBlockedUsers($query, $viewer))
            ->when($viewer, function ($query) use ($viewer) {
                $query->addSelect([
                    'is_following' => Follow::query()
                        ->selectRaw('COUNT(*)')
                        ->whereColumn('follows.following_id', 'users.id')
                        ->where('follows.follower_id', $viewer->id),
                ]);
            })
            ->latest('follows.created_at')
            ->take($limit)
            ->get();

        return UserResource::collection($following);
    }

    public function follow(User $user, Request $request): array
    {
        $currentUser = $request->user();

        abort_if($currentUser->id === $user->id, 422, 'You cannot follow yourself.');
        abort_if(UserPrivacy::isBlockedBetween($currentUser, $user), 422, 'Follow not allowed for blocked users.');

        Log::info('Follow request received', [
            'follower_id' => $currentUser->id,
            'following_id' => $user->id,
        ]);

        $exists = Follow::where('follower_id', $currentUser->id)
            ->where('following_id', $user->id)
            ->exists();

        if (! $exists) {
            $currentUser->following()->attach($user->id, ['id' => (string) Str::uuid()]);
            Log::info('User followed successfully', [
                'follower_id' => $currentUser->id,
                'following_id' => $user->id,
            ]);
        } else {
            Log::info('Follow relationship already exists', [
                'follower_id' => $currentUser->id,
                'following_id' => $user->id,
            ]);
        }

        $currentUser->forceFill([
            'following_count' => $currentUser->following()->count(),
        ])->save();

        $user->forceFill([
            'followers_count' => $user->followers()->count(),
        ])->save();

        UserFollowed::dispatch($currentUser, $user, true);

        return ['following' => true];
    }

    public function unfollow(User $user, Request $request): array
    {
        $currentUser = $request->user();

        abort_if($currentUser->id === $user->id, 422, 'You cannot unfollow yourself.');

        Log::info('Unfollow request received', [
            'follower_id' => $currentUser->id,
            'following_id' => $user->id,
        ]);

        $deleted = Follow::where('follower_id', $currentUser->id)
            ->where('following_id', $user->id)
            ->delete();

        if ($deleted) {
            Log::info('User unfollowed successfully', [
                'follower_id' => $currentUser->id,
                'following_id' => $user->id,
            ]);
        } else {
            Log::info('Unfollow relationship not found', [
                'follower_id' => $currentUser->id,
                'following_id' => $user->id,
            ]);
        }

        $currentUser->forceFill([
            'following_count' => $currentUser->following()->count(),
        ])->save();

        $user->forceFill([
            'followers_count' => $user->followers()->count(),
        ])->save();

        UserFollowed::dispatch($currentUser, $user, false);

        return ['following' => false];
    }

    public function block(User $user, Request $request): array
    {
        $currentUser = $request->user();

        abort_if($currentUser->id === $user->id, 422, 'You cannot block yourself.');

        Log::info('Block request received', [
            'blocker_id' => $currentUser->id,
            'blocked_id' => $user->id,
        ]);

        // Check if already blocked
        $exists = $currentUser->blocked()
            ->where('blocked_user_id', $user->id)
            ->exists();

        if (!$exists) {
            $currentUser->blocked()->attach($user->id, ['id' => (string) Str::uuid()]);
            Follow::where('follower_id', $currentUser->id)->where('following_id', $user->id)->delete();
            Follow::where('follower_id', $user->id)->where('following_id', $currentUser->id)->delete();

            $currentUser->forceFill([
                'following_count' => $currentUser->following()->count(),
                'followers_count' => $currentUser->followers()->count(),
            ])->save();

            $user->forceFill([
                'following_count' => $user->following()->count(),
                'followers_count' => $user->followers()->count(),
            ])->save();

            Log::info('User blocked successfully', [
                'blocker_id' => $currentUser->id,
                'blocked_id' => $user->id,
            ]);
        }

        return ['blocked' => true];
    }

    public function unblock(User $user, Request $request): array
    {
        $currentUser = $request->user();

        abort_if($currentUser->id === $user->id, 422, 'You cannot unblock yourself.');

        Log::info('Unblock request received', [
            'blocker_id' => $currentUser->id,
            'unblocked_id' => $user->id,
        ]);

        $deleted = $currentUser->blocked()->detach($user->id);

        if ($deleted) {
            Log::info('User unblocked successfully', [
                'blocker_id' => $currentUser->id,
                'unblocked_id' => $user->id,
            ]);
        }

        return ['blocked' => false];
    }

    public function blockedUsers(Request $request): AnonymousResourceCollection
    {
        $blocked = $request->user()
            ->blocked()
            ->latest('blocks.created_at')
            ->limit(100)
            ->get();

        return UserResource::collection($blocked);
    }

    public function privacy(Request $request): array
    {
        $user = $request->user();

        return [
            'message_policy' => $user->message_policy ?? 'everyone',
            'default_post_visibility' => $user->default_post_visibility ?? 'everyone',
        ];
    }

    public function updatePrivacy(Request $request): array
    {
        $validated = $request->validate([
            'message_policy' => 'sometimes|in:everyone,followers,nobody',
            'default_post_visibility' => 'sometimes|in:everyone,followers,private',
        ]);

        $user = $request->user();
        $user->update($validated);
        $user->refresh();

        return [
            'message_policy' => $user->message_policy ?? 'everyone',
            'default_post_visibility' => $user->default_post_visibility ?? 'everyone',
        ];
    }

    public function updateNotificationSettings(Request $request): array
    {
        $validated = $request->validate([
            'post_email_notifications_enabled' => ['required', 'boolean'],
        ]);

        $user = $request->user();
        $user->forceFill([
            'post_email_notifications_enabled' => (bool) $validated['post_email_notifications_enabled'],
        ])->save();

        return [
            'post_email_notifications_enabled' => (bool) $user->post_email_notifications_enabled,
        ];
    }

    public function updateProfile(Request $request, QueueUserAvatarUploadAction $queueUserAvatarUploadAction, QueueUserCoverUploadAction $queueUserCoverUploadAction): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'country' => ['sometimes', 'nullable', 'string', 'max:120'],
            'state' => ['sometimes', 'nullable', 'string', 'max:120'],
            'location' => ['sometimes', 'nullable', 'string', 'max:180'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:500'],
            'avatar' => ['sometimes', 'nullable', 'image', 'max:5120', 'mimes:jpeg,png,jpg,gif,webp'],
            'cover' => ['sometimes', 'nullable', 'image', 'max:10240', 'mimes:jpeg,png,jpg,gif,webp'],
            'content_validation_agreed' => ['sometimes', 'accepted'],
        ]);

        $avatarFile = $request->file('avatar');
        $coverFile = $request->file('cover');
        unset($validated['avatar'], $validated['cover']);

        if ($request->boolean('content_validation_agreed') && is_null($user->content_validation_agreed_at)) {
            $validated['content_validation_agreed_at'] = now();
        }

        unset($validated['content_validation_agreed']);

        if (!empty($validated)) {
            $user->update($validated);
        }

        if ($avatarFile) {
            $queueUserAvatarUploadAction->execute($user, $avatarFile);
        }

        if ($coverFile) {
            $queueUserCoverUploadAction->execute($user, $coverFile);
        }

        $user->refresh();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => new UserResource($user),
        ]);
    }

    public function updateCover(Request $request, QueueUserCoverUploadAction $queueUserCoverUploadAction): JsonResponse
    {
        $request->validate([
            'cover' => ['required', 'image', 'max:10240', 'mimes:jpeg,png,jpg,gif,webp'],
        ]);

        $user = $request->user();
        $queueUserCoverUploadAction->execute($user, $request->file('cover'));
        $user->refresh();

        return response()->json([
            'message' => 'Cover picture updated successfully',
            'user' => new UserResource($user),
        ]);
    }

    public function updateAvatar(Request $request, QueueUserAvatarUploadAction $queueUserAvatarUploadAction): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:5120', 'mimes:jpeg,png,jpg,gif,webp'],
        ]);

        $user = $request->user();
        $queueUserAvatarUploadAction->execute($user, $request->file('avatar'));
        $user->refresh();

        return response()->json([
            'message' => 'Avatar updated successfully',
            'user' => new UserResource($user),
        ]);
    }

    /**
     * @param  array<int, mixed>  $interests
     * @param  array<int, string>  $allowedInterests
     * @return array<int, string>
     */
    private function normalizeOnboardingInterests(array $interests, array $allowedInterests): array
    {
        $allowedLookup = array_fill_keys($allowedInterests, true);
        $normalized = [];

        foreach ($interests as $interest) {
            $value = Str::lower(trim((string) $interest));
            if ($value === '' || ! isset($allowedLookup[$value])) {
                continue;
            }

            if (! in_array($value, $normalized, true)) {
                $normalized[] = $value;
            }
        }

        return $normalized;
    }

    public function notifications(Request $request): array
    {
        $user = $request->user();
        $notifications = [];
        $page = max(1, (int) $request->query('page', 1));
        $perPage = max(1, min((int) $request->query('per_page', 20), 50));

        // Get recent follows (last 10)
        $followers = $user->followers()
            ->addSelect([
                'is_following' => Follow::query()
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('follows.following_id', 'users.id')
                    ->where('follows.follower_id', $user->id),
            ])
            ->latest('follows.created_at')
            ->take(50)
            ->get();
        foreach ($followers as $follower) {
            $notifications[] = [
                'id' => 'follow-' . $follower->id,
                'type' => 'follow',
                'user' => new UserResource($follower),
                'action' => 'started following you',
                'created_at' => $follower->pivot->created_at?->toIso8601String() ?? now()->toIso8601String(),
            ];
        }

        // Get recent likes (last 10)
        $likes = Like::query()
            ->where('likeable_type', Post::class)
            ->where('user_id', '!=', $user->id)
            ->whereHas('post', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['post', 'user'])
            ->latest('created_at')
            ->take(50)
            ->get();
        foreach ($likes as $like) {
            if ($like->post && $like->user) {
                $notifications[] = [
                    'id' => 'like-' . $like->id,
                    'type' => 'like',
                    'user' => new UserResource($like->user),
                    'action' => 'liked your post',
                    'content' => $like->post->content,
                    'related_id' => $like->post->id,
                    'created_at' => $like->created_at->toIso8601String(),
                ];
            }
        }

        $comments = Comment::query()
            ->where('user_id', '!=', $user->id)
            ->whereHas('post', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['post', 'user'])
            ->latest('created_at')
            ->take(50)
            ->get();

        foreach ($comments as $comment) {
            if ($comment->post && $comment->user) {
                $notifications[] = [
                    'id' => 'comment-' . $comment->id,
                    'type' => $comment->parent_id ? 'reply' : 'comment',
                    'user' => new UserResource($comment->user),
                    'action' => $comment->parent_id ? 'replied on your post' : 'commented on your post',
                    'content' => $comment->content,
                    'related_id' => $comment->post->id,
                    'comment_id' => $comment->id,
                    'created_at' => $comment->created_at->toIso8601String(),
                ];
            }
        }

        $reposts = Post::query()
            ->where('type', 'repost')
            ->where('user_id', '!=', $user->id)
            ->whereHas('originalPost', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['originalPost', 'user'])
            ->latest('created_at')
            ->take(50)
            ->get();

        foreach ($reposts as $repost) {
            if ($repost->originalPost && $repost->user) {
                $notifications[] = [
                    'id' => 'repost-' . $repost->id,
                    'type' => 'repost',
                    'user' => new UserResource($repost->user),
                    'action' => 'shared your post',
                    'content' => $repost->originalPost->content,
                    'related_id' => $repost->originalPost->id,
                    'created_at' => $repost->created_at->toIso8601String(),
                ];
            }
        }

        $messages = Message::query()
            ->where('user_id', '!=', $user->id)
            ->whereHas('conversation.participants', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->with(['user', 'conversation.participants'])
            ->latest('created_at')
            ->take(50)
            ->get();

        foreach ($messages as $message) {
            if (! $message->user || ! $message->conversation) {
                continue;
            }

            $content = $message->content;

            if (($content === null || trim($content) === '') && $message->message_type === 'image') {
                $content = 'Sent you a photo';
            } elseif (($content === null || trim($content) === '') && $message->message_type === 'video') {
                $content = 'Sent you a video';
            } elseif (($content === null || trim($content) === '') && $message->message_type === 'file') {
                $content = 'Sent you a file';
            }

            $notifications[] = [
                'id' => 'message-' . $message->id,
                'type' => 'message',
                'user' => new UserResource($message->user),
                'action' => 'sent you a message',
                'content' => $content,
                'conversation_id' => $message->conversation_id,
                'created_at' => $message->created_at->toIso8601String(),
            ];
        }

        $pageInvites = DB::table('business_page_invites')
            ->where('invited_user_id', $user->id)
            ->where('status', 'pending')
            ->latest('created_at')
            ->take(50)
            ->get();

        foreach ($pageInvites as $invite) {
            $inviter = User::query()->find($invite->inviter_user_id);
            $businessPage = BusinessPage::query()
                ->with('owner')
                ->find($invite->business_page_id);

            if (! $inviter || ! $businessPage) {
                continue;
            }

            $notifications[] = [
                'id' => 'page-invite-' . $invite->id,
                'type' => 'page_invite',
                'user' => new UserResource($inviter),
                'action' => 'invited you to join ' . $businessPage->name,
                'content' => $businessPage->description ?: 'Open the page to view posts and follow updates.',
                'related_id' => $businessPage->slug,
                'created_at' => \Carbon\Carbon::parse((string) $invite->created_at)->toIso8601String(),
                'page' => [
                    'id' => $businessPage->id,
                    'name' => $businessPage->name,
                    'slug' => $businessPage->slug,
                    'category' => $businessPage->category,
                    'avatar' => $businessPage->avatar_url,
                    'follower_count' => (int) ($businessPage->follower_count ?? 0),
                ],
            ];
        }

        $liveStreamsQuery = LiveStream::query()
            ->with('user')
            ->where('status', 'live')
            ->where('user_id', '!=', $user->id)
            ->where(function ($visibilityQuery) use ($user) {
                $visibilityQuery
                    ->where('visibility', 'everyone')
                    ->orWhere(function ($followersQuery) use ($user) {
                        $followersQuery->where('visibility', 'followers')
                            ->whereExists(function ($sub) use ($user) {
                                $sub->selectRaw('1')
                                    ->from('follows')
                                    ->whereColumn('follows.following_id', 'live_streams.user_id')
                                    ->where('follows.follower_id', $user->id);
                            });
                    });
            })
            ->latest('started_at')
            ->take(50);

        UserPrivacy::excludeBlockedUsers($liveStreamsQuery, $user, 'user_id');

        foreach ($liveStreamsQuery->get() as $stream) {
            if (! $stream->user) {
                continue;
            }

            $notifications[] = [
                'id' => 'live-stream-' . $stream->id,
                'type' => 'live_stream',
                'user' => new UserResource($stream->user),
                'action' => 'is live now',
                'content' => $stream->title ?: 'Tap to join the live stream.',
                'related_id' => $stream->id,
                'created_at' => ($stream->started_at ?? $stream->created_at)->toIso8601String(),
                'live_stream' => [
                    'id' => $stream->id,
                    'title' => $stream->title,
                    'viewer_count' => (int) ($stream->viewer_count ?? 0),
                    'started_at' => $stream->started_at?->toIso8601String(),
                ],
            ];
        }

        foreach ($this->dailyPostReportRows($user, 14) as $report) {
            $date = \Carbon\Carbon::parse((string) $report['date']);
            $views = (int) $report['views'];
            $likesCount = (int) $report['likes'];
            $commentsCount = (int) $report['comments'];
            $commentLikes = (int) $report['comment_likes'];
            $postsCount = (int) $report['posts_count'];

            $notifications[] = [
                'id' => 'daily-post-report-' . $date->toDateString(),
                'type' => 'daily_report',
                'user' => new UserResource($user),
                'action' => 'Daily post report for ' . $date->format('M j'),
                'content' => "Views: {$views} • Likes: {$likesCount} • Comments: {$commentsCount} • Comment likes: {$commentLikes}",
                'created_at' => $date->isToday()
                    ? now()->toIso8601String()
                    : $date->endOfDay()->toIso8601String(),
                'metrics' => [
                    'views' => $views,
                    'likes' => $likesCount,
                    'comments' => $commentsCount,
                    'comment_likes' => $commentLikes,
                    'posts_count' => $postsCount,
                    'date' => $date->toDateString(),
                ],
            ];
        }

        $sorted = collect($notifications)
            ->sortByDesc(fn ($item) => strtotime((string) ($item['created_at'] ?? '')))
            ->values();
        $total = $sorted->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $pagedItems = $sorted->forPage($page, $perPage)->values()->all();

        $query = $request->query();
        $buildPageUrl = function (int $targetPage) use ($request, $query, $perPage): string {
            return $request->url() . '?' . http_build_query([
                ...$query,
                'page' => $targetPage,
                'per_page' => $perPage,
            ]);
        };

        return [
            'data' => $pagedItems,
            'links' => [
                'next' => $page < $lastPage ? $buildPageUrl($page + 1) : null,
                'prev' => $page > 1 ? $buildPageUrl($page - 1) : null,
            ],
            'meta' => [
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
            ],
        ];
    }

    public function dailyPostReports(Request $request): array
    {
        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'min:1', 'max:90'],
        ]);

        $days = (int) ($validated['days'] ?? 14);
        $reports = $this->dailyPostReportRows($request->user(), $days);

        return [
            'data' => $reports,
            'summary' => [
                'views' => array_sum(array_column($reports, 'views')),
                'likes' => array_sum(array_column($reports, 'likes')),
                'comments' => array_sum(array_column($reports, 'comments')),
                'comment_likes' => array_sum(array_column($reports, 'comment_likes')),
                'posts_count' => array_sum(array_column($reports, 'posts_count')),
            ],
            'meta' => [
                'days' => $days,
                'from' => now()->subDays($days - 1)->toDateString(),
                'to' => now()->toDateString(),
            ],
        ];
    }

    public function postEarnings(Request $request): array
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $user = $request->user();
        $perPage = (int) ($validated['per_page'] ?? 20);
        $money = app(CountryCurrency::class);
        $displayCurrency = $money->forUser($user);
        $exchangeRate = $money->rateFromNgn($displayCurrency);

        $posts = Post::query()
            ->where('user_id', $user->id)
            ->with(['media'])
            ->withSum('earnings as earnings_total', 'amount')
            ->withCount(['comments', 'likes'])
            ->latest()
            ->paginate($perPage);

        $items = $posts->getCollection()->map(function (Post $post) use ($money, $displayCurrency, $exchangeRate) {
            $media = $post->media->first();
            $earnedAmount = (float) ($post->earnings_total ?? 0);
            if ($earnedAmount <= 0 && $post->reward_status === 'credited') {
                $earnedAmount = (float) ($post->reward_amount ?? 0);
            }
            $rewardAmount = round((float) ($post->reward_amount ?? 0), 2);
            $earnedAmount = round($earnedAmount, 2);

            return [
                'post_id' => $post->id,
                'content' => (string) ($post->content ?? ''),
                'created_at' => $post->created_at?->toIso8601String(),
                'media' => $media ? [
                    'type' => $media->type,
                    'path' => $media->path,
                    'thumbnail' => $media->thumbnail ?? null,
                ] : null,
                'views' => (int) ($post->view_count ?? 0),
                'likes' => (int) ($post->likes_count ?? $post->like_count ?? 0),
                'comments' => (int) ($post->comments_count ?? $post->comment_count ?? 0),
                'reward_status' => (string) ($post->reward_status ?? 'ineligible'),
                'reward_amount' => $rewardAmount,
                'reward_amount_display' => $money->convertFromNgn($rewardAmount, $displayCurrency),
                'reward_amount_formatted' => $money->formatFromNgn($rewardAmount, $displayCurrency),
                'reward_reason' => $post->reward_reason,
                'rewarded_at' => $post->rewarded_at?->toIso8601String(),
                'earned_amount' => $earnedAmount,
                'earned_amount_display' => $money->convertFromNgn($earnedAmount, $displayCurrency),
                'earned_amount_formatted' => $money->formatFromNgn($earnedAmount, $displayCurrency),
                'base_currency' => 'NGN',
                'currency' => $displayCurrency,
                'display_currency' => $displayCurrency,
                'exchange_rate' => $exchangeRate,
            ];
        })->values();

        $summary = Earning::query()
            ->where('user_id', $user->id)
            ->whereNotNull('post_id')
            ->selectRaw('
                COALESCE(SUM(amount), 0) as total,
                COALESCE(SUM(CASE WHEN status = ? THEN amount ELSE 0 END), 0) as pending,
                COALESCE(SUM(CASE WHEN status = ? THEN amount ELSE 0 END), 0) as paid
            ', [Earning::STATUS_PENDING, Earning::STATUS_PAID])
            ->first();

        $totalEarned = round((float) ($summary->total ?? 0), 2);
        $pending = round((float) ($summary->pending ?? 0), 2);
        $paid = round((float) ($summary->paid ?? 0), 2);

        return [
            'data' => $items,
            'summary' => [
                'total_earned' => $totalEarned,
                'total_earned_display' => $money->convertFromNgn($totalEarned, $displayCurrency),
                'total_earned_formatted' => $money->formatFromNgn($totalEarned, $displayCurrency),
                'pending' => $pending,
                'pending_display' => $money->convertFromNgn($pending, $displayCurrency),
                'pending_formatted' => $money->formatFromNgn($pending, $displayCurrency),
                'paid' => $paid,
                'paid_display' => $money->convertFromNgn($paid, $displayCurrency),
                'paid_formatted' => $money->formatFromNgn($paid, $displayCurrency),
                'base_currency' => 'NGN',
                'currency' => $displayCurrency,
                'display_currency' => $displayCurrency,
                'exchange_rate' => $exchangeRate,
            ],
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
            'links' => [
                'next' => $posts->nextPageUrl(),
                'prev' => $posts->previousPageUrl(),
            ],
        ];
    }

    public function monetizationDashboard(Request $request): array
    {
        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'min:1', 'max:90'],
        ]);

        $user = $request->user();
        $days = (int) ($validated['days'] ?? 30);
        $reports = $this->monetizationDailyRows($user, $days);
        $wallet = $user->wallet()->first();
        $money = app(CountryCurrency::class);
        $displayCurrency = $money->forUser($user);
        $exchangeRate = $money->rateFromNgn($displayCurrency);
        $monetizationTotal = (float) DB::table('post_monetization_events as events')
            ->join('posts', 'posts.id', '=', 'events.post_id')
            ->where('events.user_id', $user->id)
            ->whereNull('posts.deleted_at')
            ->when($user->monetization_activated_at, function ($query) use ($user) {
                $query->where('posts.created_at', '>=', $user->monetization_activated_at);
            }, function ($query) {
                $query->whereRaw('1 = 0');
            })
            ->sum('events.amount');

        $eventCountsByPost = DB::table('post_monetization_events')
            ->selectRaw("
                post_id,
                SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) as views,
                SUM(CASE WHEN event_type = 'like' THEN 1 ELSE 0 END) as likes,
                SUM(CASE WHEN event_type = 'comment' THEN 1 ELSE 0 END) as comments
            ")
            ->where('user_id', $user->id)
            ->groupBy('post_id')
            ->get()
            ->keyBy(fn ($row) => (string) $row->post_id);

        $posts = Post::query()
            ->where('user_id', $user->id)
            ->when($user->monetization_activated_at, function ($query) use ($user) {
                $query->where('created_at', '>=', $user->monetization_activated_at);
            }, function ($query) {
                $query->whereRaw('1 = 0');
            })
            ->with(['media'])
            ->withCount(['comments', 'likes'])
            ->latest()
            ->limit(12)
            ->get()
            ->map(function (Post $post) use ($eventCountsByPost) {
                $media = $post->media->first();
                $eventCounts = $eventCountsByPost->get((string) $post->id);

                return [
                    'post_id' => $post->id,
                    'content' => Str::limit((string) ($post->content ?? ''), 90),
                    'created_at' => $post->created_at?->toIso8601String(),
                    'media' => $media ? [
                        'type' => $media->type,
                        'path' => $media->path,
                        'thumbnail' => $media->thumbnail ?? null,
                    ] : null,
                    'views' => (int) ($eventCounts->views ?? 0),
                    'likes' => (int) ($eventCounts->likes ?? 0),
                    'comments' => (int) ($eventCounts->comments ?? 0),
                ];
            })
            ->values();

        return [
            'status' => [
                'is_monetized' => (bool) $user->monetization_activated_at,
                'activated_at' => $user->monetization_activated_at?->toIso8601String(),
                'fee_amount' => self::MONETIZATION_FEE_AMOUNT,
                'fee_amount_formatted' => $this->formatMoney(self::MONETIZATION_FEE_AMOUNT),
                'can_pay_from_wallet' => $wallet ? (float) $wallet->balance >= self::MONETIZATION_FEE_AMOUNT : false,
                'payment_provider' => $user->monetization_payment_provider,
                'payment_reference' => $user->monetization_payment_reference,
                'payment_status' => $user->monetization_payment_status,
            ],
            'summary' => [
                'views' => array_sum(array_column($reports, 'views')),
                'likes' => array_sum(array_column($reports, 'likes')),
                'comments' => array_sum(array_column($reports, 'comments')),
                'posts_count' => array_sum(array_column($reports, 'posts_count')),
                'total_monetization_earned' => round($monetizationTotal, 2),
                'total_monetization_earned_display' => $money->convertFromNgn($monetizationTotal, $displayCurrency),
                'total_monetization_earned_formatted' => $money->formatFromNgn($monetizationTotal, $displayCurrency),
                'base_currency' => 'NGN',
                'currency' => $displayCurrency,
                'display_currency' => $displayCurrency,
                'exchange_rate' => $exchangeRate,
            ],
            'daily' => $reports,
            'posts' => $posts,
            'meta' => [
                'days' => $days,
                'from' => now()->subDays($days - 1)->toDateString(),
                'to' => now()->toDateString(),
            ],
        ];
    }

    public function payForMonetizationFromWallet(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->monetization_activated_at) {
            return response()->json([
                'message' => 'Your monetization dashboard is already active.',
                'data' => $this->monetizationDashboard($request),
            ]);
        }

        DB::transaction(function () use ($user): void {
            $wallet = UserWallet::query()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (! $wallet || (float) $wallet->balance < self::MONETIZATION_FEE_AMOUNT) {
                throw ValidationException::withMessages([
                    'wallet' => ['Monetization activation costs N5,000. Please fund your wallet first.'],
                ]);
            }

            $wallet->balance = (float) $wallet->balance - self::MONETIZATION_FEE_AMOUNT;
            $wallet->save();

            $user->forceFill([
                'monetization_activated_at' => now(),
                'monetization_paid_at' => now(),
                'monetization_payment_provider' => 'wallet',
                'monetization_payment_reference' => 'wallet_' . Str::uuid(),
                'monetization_payment_status' => 'paid',
                'monetization_payment_amount' => self::MONETIZATION_FEE_AMOUNT,
            ])->save();

            Earning::query()->create([
                'user_id' => $user->id,
                'earning_type' => Earning::TYPE_BONUS,
                'amount' => -self::MONETIZATION_FEE_AMOUNT,
                'currency' => 'NGN',
                'description' => 'Profile monetization activation fee.',
                'status' => Earning::STATUS_PAID,
                'paid_at' => now(),
                'payout_method' => 'wallet_debit',
                'transaction_id' => 'profile_monetization_fee:' . $user->id . ':' . now()->timestamp,
                'base_amount' => -self::MONETIZATION_FEE_AMOUNT,
            ]);
        });

        $user->refresh();

        return response()->json([
            'message' => 'Monetization is now active on your profile.',
            'data' => $this->monetizationDashboard($request),
        ]);
    }

    public function initializeMonetizationPaystack(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->monetization_activated_at) {
            return response()->json([
                'message' => 'Your monetization dashboard is already active.',
                'data' => $this->monetizationDashboard($request),
            ]);
        }

        $reference = 'monetization_' . Str::uuid();
        $user->forceFill([
            'monetization_payment_provider' => 'paystack',
            'monetization_payment_reference' => $reference,
            'monetization_payment_status' => 'pending',
            'monetization_payment_amount' => self::MONETIZATION_FEE_AMOUNT,
        ])->save();

        $requestClient = Http::withToken(config('services.paystack.secret_key'))
            ->acceptJson();

        if (! (bool) config('services.paystack.verify_ssl', true)) {
            $requestClient = $requestClient->withoutVerifying();
        }

        $init = $requestClient->post('https://api.paystack.co/transaction/initialize', [
            'reference' => $reference,
            'amount' => (int) round(self::MONETIZATION_FEE_AMOUNT * 100),
            'email' => $user->email,
            'currency' => 'NGN',
            'callback_url' => url('/api/payment/monetization/paystack/callback'),
            'metadata' => [
                'type' => 'profile_monetization',
                'user_id' => $user->id,
            ],
        ]);

        if (! $init->ok() || $init->json('status') !== true) {
            Log::warning('Monetization Paystack init failed', [
                'user_id' => $user->id,
                'response' => $init->json(),
            ]);

            $user->forceFill([
                'monetization_payment_status' => 'failed',
            ])->save();

            return response()->json(['message' => 'Unable to initialize Paystack payment.'], 502);
        }

        return response()->json([
            'message' => 'Paystack payment initialized.',
            'reference' => $reference,
            'authorization_url' => $init->json('data.authorization_url'),
        ], 201);
    }

    public function verifyMonetizationPaystack(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reference' => ['nullable', 'string', 'max:160'],
        ]);

        $reference = (string) ($validated['reference'] ?? $request->user()->monetization_payment_reference ?? '');
        $user = $this->confirmMonetizationPaystackReference($reference, $request->user());

        return response()->json([
            'message' => $user->monetization_activated_at
                ? 'Payment confirmed. Monetization is now active.'
                : 'Payment is still pending.',
            'data' => $this->monetizationDashboard($request),
        ]);
    }

    public function monetizationPaystackCallback(Request $request): RedirectResponse
    {
        $reference = (string) ($request->query('reference') ?: $request->query('trxref'));

        if ($reference !== '') {
            try {
                $this->confirmMonetizationPaystackReference($reference);
            } catch (\Throwable $exception) {
                Log::warning('Monetization Paystack callback verification failed', [
                    'reference' => $reference,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return redirect('/monetization?' . http_build_query([
            'monetization_payment' => 'paystack',
            'reference' => $reference,
        ]));
    }

    public function monetizationPaystackWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $reference = (string) ($payload['data']['reference'] ?? $payload['reference'] ?? '');

        if ($reference === '') {
            return response()->json(['message' => 'Missing reference'], 422);
        }

        $signature = $request->header('x-paystack-signature');
        $secret = config('services.paystack.webhook_secret');
        if ($secret && ! $signature) {
            return response()->json(['message' => 'Missing signature'], 401);
        }

        if ($signature && $secret) {
            $computed = hash_hmac('sha512', $request->getContent(), $secret);
            if (! hash_equals($computed, $signature)) {
                return response()->json(['message' => 'Invalid signature'], 401);
            }
        }

        $data = $payload['data'] ?? [];
        if (is_array($data) && ($data['status'] ?? null) === 'success') {
            $this->activateMonetizationFromPaystack($reference);
        } else {
            $this->confirmMonetizationPaystackReference($reference);
        }

        return response()->json(['message' => 'Monetization payment processed']);
    }

    private function confirmMonetizationPaystackReference(string $reference, ?User $expectedUser = null): User
    {
        $reference = trim($reference);
        if ($reference === '') {
            throw ValidationException::withMessages([
                'reference' => ['Missing Paystack payment reference.'],
            ]);
        }

        $user = User::query()
            ->where('monetization_payment_reference', $reference)
            ->firstOrFail();

        if ($expectedUser && (string) $expectedUser->id !== (string) $user->id) {
            abort(403, 'Unauthorized payment reference.');
        }

        if ($user->monetization_activated_at) {
            return $user;
        }

        $requestClient = Http::withToken(config('services.paystack.secret_key'))
            ->acceptJson();

        if (! (bool) config('services.paystack.verify_ssl', true)) {
            $requestClient = $requestClient->withoutVerifying();
        }

        $verify = $requestClient->get('https://api.paystack.co/transaction/verify/' . rawurlencode($reference));
        if (! $verify->ok() || $verify->json('status') !== true) {
            Log::warning('Monetization Paystack verify failed', [
                'reference' => $reference,
                'response' => $verify->json(),
            ]);

            return $user;
        }

        $payload = $verify->json('data');
        if (! is_array($payload) || ($payload['status'] ?? null) !== 'success') {
            return $user;
        }

        return $this->activateMonetizationFromPaystack($reference, $payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function activateMonetizationFromPaystack(string $reference, array $payload = []): User
    {
        return DB::transaction(function () use ($reference, $payload): User {
            $user = User::query()
                ->where('monetization_payment_reference', $reference)
                ->lockForUpdate()
                ->firstOrFail();

            if ($user->monetization_activated_at) {
                return $user;
            }

            $amountKobo = (int) ($payload['amount'] ?? round(self::MONETIZATION_FEE_AMOUNT * 100));
            if ($amountKobo < (int) round(self::MONETIZATION_FEE_AMOUNT * 100)) {
                $user->forceFill([
                    'monetization_payment_status' => 'failed',
                ])->save();

                return $user;
            }

            $paidAt = now();
            $user->forceFill([
                'monetization_activated_at' => $paidAt,
                'monetization_paid_at' => $paidAt,
                'monetization_payment_provider' => 'paystack',
                'monetization_payment_status' => 'paid',
                'monetization_payment_amount' => self::MONETIZATION_FEE_AMOUNT,
            ])->save();

            Earning::query()->firstOrCreate(
                ['transaction_id' => 'profile_monetization_paystack:' . $reference],
                [
                    'user_id' => $user->id,
                    'earning_type' => Earning::TYPE_BONUS,
                    'amount' => -self::MONETIZATION_FEE_AMOUNT,
                    'currency' => 'NGN',
                    'description' => 'Profile monetization activation fee via Paystack.',
                    'status' => Earning::STATUS_PAID,
                    'paid_at' => $paidAt,
                    'payout_method' => 'paystack',
                    'base_amount' => -self::MONETIZATION_FEE_AMOUNT,
                ],
            );

            return $user;
        });
    }

    /**
     * @return array<int, array{date: string, views: int, likes: int, comments: int, comment_likes: int, posts_count: int, last_activity_at: string|null}>
     */
    private function dailyPostReportRows(User $user, int $days = 14, bool $monetizedOnly = false): array
    {
        $days = max(1, min($days, 90));

        return DB::table('post_daily_metrics as metrics')
            ->join('posts', 'posts.id', '=', 'metrics.post_id')
            ->where('metrics.user_id', $user->id)
            ->where('metrics.metric_date', '>=', now()->subDays($days - 1)->toDateString())
            ->whereNull('posts.deleted_at')
            ->when($monetizedOnly, function ($query) use ($user) {
                if ($user->monetization_activated_at) {
                    $query->where('posts.created_at', '>=', $user->monetization_activated_at);
                } else {
                    $query->whereRaw('1 = 0');
                }
            })
            ->groupBy('metrics.metric_date')
            ->selectRaw('
                metrics.metric_date,
                SUM(metrics.views) as views,
                SUM(metrics.likes) as likes,
                SUM(metrics.comments) as comments,
                SUM(metrics.comment_likes) as comment_likes,
                COUNT(DISTINCT metrics.post_id) as posts_count,
                MAX(metrics.updated_at) as last_activity_at
            ')
            ->orderByDesc('metrics.metric_date')
            ->take($days)
            ->get()
            ->map(fn ($report) => [
                'date' => (string) $report->metric_date,
                'views' => (int) $report->views,
                'likes' => (int) $report->likes,
                'comments' => (int) $report->comments,
                'comment_likes' => (int) $report->comment_likes,
                'posts_count' => (int) $report->posts_count,
                'last_activity_at' => $report->last_activity_at ? (string) $report->last_activity_at : null,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{date: string, views: int, likes: int, comments: int, comment_likes: int, posts_count: int, last_activity_at: string|null}>
     */
    private function monetizationDailyRows(User $user, int $days = 30): array
    {
        $days = max(1, min($days, 90));

        return DB::table('post_monetization_events as events')
            ->join('posts', 'posts.id', '=', 'events.post_id')
            ->where('events.user_id', $user->id)
            ->where('events.created_at', '>=', now()->subDays($days - 1)->startOfDay())
            ->whereNull('posts.deleted_at')
            ->when($user->monetization_activated_at, function ($query) use ($user) {
                $query->where('posts.created_at', '>=', $user->monetization_activated_at);
            }, function ($query) {
                $query->whereRaw('1 = 0');
            })
            ->groupBy(DB::raw('DATE(events.created_at)'))
            ->selectRaw("
                DATE(events.created_at) as metric_date,
                SUM(CASE WHEN events.event_type = 'view' THEN 1 ELSE 0 END) as views,
                SUM(CASE WHEN events.event_type = 'like' THEN 1 ELSE 0 END) as likes,
                SUM(CASE WHEN events.event_type = 'comment' THEN 1 ELSE 0 END) as comments,
                0 as comment_likes,
                COUNT(DISTINCT events.post_id) as posts_count,
                MAX(events.updated_at) as last_activity_at
            ")
            ->orderByDesc('metric_date')
            ->take($days)
            ->get()
            ->map(fn ($report) => [
                'date' => (string) $report->metric_date,
                'views' => (int) $report->views,
                'likes' => (int) $report->likes,
                'comments' => (int) $report->comments,
                'comment_likes' => 0,
                'posts_count' => (int) $report->posts_count,
                'last_activity_at' => $report->last_activity_at ? (string) $report->last_activity_at : null,
            ])
            ->values()
            ->all();
    }

    public function wallet(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallet = $user->wallet()->first();
        $money = app(CountryCurrency::class);
        $displayCurrency = $money->forUser($user);
        $exchangeRate = $money->rateFromNgn($displayCurrency);

        if (! $wallet) {
            $postEarnings = $this->postEarningsForUser($user);

            return response()->json([
                'id' => '',
                'user_id' => $user->id,
                'balance' => 0,
                'balance_display' => 0,
                'balance_formatted' => $money->format(0, $displayCurrency),
                'total_earned' => 0,
                'total_earned_display' => 0,
                'total_earned_formatted' => $money->format(0, $displayCurrency),
                'post_earnings' => $postEarnings,
                'post_earnings_display' => $money->convertFromNgn($postEarnings, $displayCurrency),
                'post_earnings_formatted' => $money->formatFromNgn($postEarnings, $displayCurrency),
                'total_withdrawn' => 0,
                'total_withdrawn_display' => 0,
                'total_withdrawn_formatted' => $money->format(0, $displayCurrency),
                'pending_withdrawal' => 0,
                'pending_withdrawal_display' => 0,
                'pending_withdrawal_formatted' => $money->format(0, $displayCurrency),
                'base_currency' => 'NGN',
                'currency' => $displayCurrency,
                'wallet_currency' => 'NGN',
                'display_currency' => $displayCurrency,
                'exchange_rate' => $exchangeRate,
                'is_active' => true,
            ]);
        }

        $walletCurrency = strtoupper((string) $wallet->currency);
        if ($walletCurrency === '' || $walletCurrency === 'USD') {
            $walletCurrency = 'NGN';
        }

        $balance = (float) $wallet->balance;
        $totalEarned = (float) $wallet->total_earned;
        $postEarnings = $this->postEarningsForUser($user);
        $totalWithdrawn = (float) $wallet->total_withdrawn;
        $pendingWithdrawal = (float) $wallet->pending_withdrawal;

        return response()->json([
            'id' => $wallet->id,
            'user_id' => $wallet->user_id,
            'balance' => $balance,
            'balance_display' => $money->convertFromNgn($balance, $displayCurrency),
            'balance_formatted' => $money->formatFromNgn($balance, $displayCurrency),
            'total_earned' => $totalEarned,
            'total_earned_display' => $money->convertFromNgn($totalEarned, $displayCurrency),
            'total_earned_formatted' => $money->formatFromNgn($totalEarned, $displayCurrency),
            'post_earnings' => $postEarnings,
            'post_earnings_display' => $money->convertFromNgn($postEarnings, $displayCurrency),
            'post_earnings_formatted' => $money->formatFromNgn($postEarnings, $displayCurrency),
            'total_withdrawn' => $totalWithdrawn,
            'total_withdrawn_display' => $money->convertFromNgn($totalWithdrawn, $displayCurrency),
            'total_withdrawn_formatted' => $money->formatFromNgn($totalWithdrawn, $displayCurrency),
            'pending_withdrawal' => $pendingWithdrawal,
            'pending_withdrawal_display' => $money->convertFromNgn($pendingWithdrawal, $displayCurrency),
            'pending_withdrawal_formatted' => $money->formatFromNgn($pendingWithdrawal, $displayCurrency),
            'base_currency' => 'NGN',
            'currency' => $displayCurrency,
            'wallet_currency' => $walletCurrency,
            'display_currency' => $displayCurrency,
            'exchange_rate' => $exchangeRate,
            'is_active' => $wallet->is_active,
        ]);
    }

    private function postEarningsForUser(User $user): float
    {
        return round((float) $user->posts()
            ->where('reward_status', 'credited')
            ->sum('reward_amount'), 2);
    }

    private function formatMoney(float|int|string|null $amount, string $currency = 'NGN'): string
    {
        return app(CountryCurrency::class)->format($amount, $currency);
    }

    private function abortIfBlocked(?User $viewer, User $target): void
    {
        if ($viewer && $viewer->id !== $target->id && UserPrivacy::isBlockedBetween($viewer, $target)) {
            abort(404);
        }
    }

    private function excludeBlockedUsers($query, User $viewer)
    {
        return $query
            ->where('users.id', '!=', $viewer->id)
            ->whereNotIn('users.id', function ($sub) use ($viewer) {
                $sub->select('blocked_user_id')
                    ->from('blocks')
                    ->where('blocker_id', $viewer->id);
            })
            ->whereNotIn('users.id', function ($sub) use ($viewer) {
                $sub->select('blocker_id')
                    ->from('blocks')
                    ->where('blocked_user_id', $viewer->id);
            });
    }

    public function markAllNotificationsRead(Request $request): array
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);
        return ['marked_read' => true];
    }

    public function markNotificationRead(Request $request, string $id): array
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();
        return ['marked_read' => true];
    }

}