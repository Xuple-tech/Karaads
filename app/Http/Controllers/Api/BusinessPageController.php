<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BusinessPageResource;
use App\Http\Resources\PostResource;
use App\Models\BusinessPage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BusinessPageController extends Controller
{
    private const CATEGORIES = [
        'Local business',
        'Restaurant',
        'Fashion',
        'Beauty',
        'Real estate',
        'Education',
        'Entertainment',
        'Health',
        'Technology',
        'Shopping',
        'Professional service',
        'Nonprofit',
        'Public figure',
        'Other',
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $viewer = $request->user();
        $scope = $request->query('scope', 'all');
        $search = trim((string) $request->query('search', ''));

        $query = BusinessPage::query()
            ->with('owner')
            ->when($scope === 'mine', fn ($q) => $q->where('owner_user_id', $viewer->id))
            ->when($scope === 'following', function ($q) use ($viewer) {
                $q->whereExists(function ($sub) use ($viewer) {
                    $sub->selectRaw('1')
                        ->from('business_page_followers')
                        ->whereColumn('business_page_followers.business_page_id', 'business_pages.id')
                        ->where('business_page_followers.user_id', $viewer->id);
                });
            })
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->latest();

        $query->withExists(['followers as is_following' => function ($q) use ($viewer) {
            $q->where('users.id', $viewer->id);
        }]);

        return BusinessPageResource::collection($query->paginate(20));
    }

    public function store(Request $request): BusinessPageResource
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', Rule::in(self::CATEGORIES)],
            'description' => ['nullable', 'string', 'max:1000'],
            'avatar' => ['nullable', 'image', 'max:8192'],
            'cover' => ['nullable', 'image', 'max:12288'],
        ]);

        $baseSlug = Str::slug($validated['name']);
        $baseSlug = $baseSlug !== '' ? $baseSlug : 'page';
        $slug = $baseSlug;
        $suffix = 2;

        while (BusinessPage::query()->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        $page = new BusinessPage([
            'owner_user_id' => $request->user()->id,
            'name' => $validated['name'],
            'slug' => $slug,
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
        ]);

        if ($request->hasFile('avatar')) {
            $page->avatar_path = $request->file('avatar')->store('business-pages/avatars', 'public');
        }

        if ($request->hasFile('cover')) {
            $page->cover_path = $request->file('cover')->store('business-pages/covers', 'public');
        }

        $page->save();
        $page->load('owner');
        $page->setAttribute('is_following', false);

        return new BusinessPageResource($page);
    }

    public function show(BusinessPage $businessPage, Request $request): BusinessPageResource
    {
        $businessPage
            ->load('owner')
            ->loadExists(['followers as is_following' => function ($q) use ($request) {
                $q->where('users.id', $request->user()?->id);
            }]);

        return new BusinessPageResource($businessPage);
    }

    public function posts(BusinessPage $businessPage, Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $query = $businessPage
            ->posts()
            ->with(['user', 'media', 'businessPage'])
            ->where(function ($q) {
                $q->whereNull('scheduled_at')
                    ->orWhere('scheduled_at', '<=', now());
            })
            ->latest();

        if ($user) {
            $query
                ->withExists(['likes as user_liked' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->withExists(['reposts as user_reshared' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->withExists(['bookmarks as user_saved' => function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                }]);
        }

        $posts = $query->paginate((int) $request->query('per_page', 15));

        return PostResource::collection($posts);
    }

    public function follow(BusinessPage $businessPage, Request $request): BusinessPageResource
    {
        abort_if((string) $businessPage->owner_user_id === (string) $request->user()->id, 422, 'You already own this page.');

        DB::transaction(function () use ($businessPage, $request) {
            $exists = DB::table('business_page_followers')
                ->where('business_page_id', $businessPage->id)
                ->where('user_id', $request->user()->id)
                ->exists();

            if (! $exists) {
                DB::table('business_page_followers')->insert([
                    'id' => (string) Str::uuid(),
                    'business_page_id' => $businessPage->id,
                    'user_id' => $request->user()->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $businessPage->increment('follower_count');
            }
        });

        $businessPage->refresh()->load('owner');
        $businessPage->setAttribute('is_following', true);

        return new BusinessPageResource($businessPage);
    }

    public function unfollow(BusinessPage $businessPage, Request $request): BusinessPageResource
    {
        DB::transaction(function () use ($businessPage, $request) {
            $deleted = DB::table('business_page_followers')
                ->where('business_page_id', $businessPage->id)
                ->where('user_id', $request->user()->id)
                ->delete();

            if ($deleted > 0) {
                $businessPage->decrement('follower_count');
            }
        });

        $businessPage->refresh()->load('owner');
        $businessPage->setAttribute('is_following', false);

        return new BusinessPageResource($businessPage);
    }

    public function invite(BusinessPage $businessPage, Request $request): array
    {
        abort_unless((string) $businessPage->owner_user_id === (string) $request->user()->id, 403);

        $validated = $request->validate([
            'invite_all_following' => ['nullable', 'boolean'],
            'user_ids' => ['required_without:invite_all_following', 'array', 'min:1', 'max:25'],
            'user_ids.*' => ['uuid', 'exists:users,id'],
        ]);

        $inviter = $request->user();
        $rawUserIds = (bool) ($validated['invite_all_following'] ?? false)
            ? $inviter->following()->pluck('users.id')->all()
            : ($validated['user_ids'] ?? []);

        $userIds = collect($rawUserIds)
            ->map(fn ($id) => (string) $id)
            ->unique()
            ->reject(fn ($id) => $id === (string) $inviter->id)
            ->values();

        if ($userIds->isEmpty()) {
            return ['message' => 'No valid users selected.', 'invited_count' => 0];
        }

        $alreadyFollowing = DB::table('business_page_followers')
            ->where('business_page_id', $businessPage->id)
            ->whereIn('user_id', $userIds->all())
            ->pluck('user_id')
            ->map(fn ($id) => (string) $id)
            ->all();

        $inviteeIds = $userIds
            ->reject(fn ($id) => in_array($id, $alreadyFollowing, true))
            ->values();

        $now = now();
        $invitedCount = 0;

        DB::transaction(function () use ($businessPage, $inviter, $inviteeIds, $now, &$invitedCount) {
            foreach ($inviteeIds as $inviteeId) {
                $existing = DB::table('business_page_invites')
                    ->where('business_page_id', $businessPage->id)
                    ->where('invited_user_id', $inviteeId)
                    ->exists();

                if ($existing) {
                    DB::table('business_page_invites')
                        ->where('business_page_id', $businessPage->id)
                        ->where('invited_user_id', $inviteeId)
                        ->update([
                            'inviter_user_id' => $inviter->id,
                            'status' => 'pending',
                            'updated_at' => $now,
                        ]);
                } else {
                    DB::table('business_page_invites')->insert([
                        'id' => (string) Str::uuid(),
                        'business_page_id' => $businessPage->id,
                        'inviter_user_id' => $inviter->id,
                        'invited_user_id' => $inviteeId,
                        'status' => 'pending',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }

                $invitedCount++;
            }
        });

        return [
            'message' => $invitedCount === 1
                ? 'Invite sent.'
                : "{$invitedCount} invites sent.",
            'invited_count' => $invitedCount,
        ];
    }
}
