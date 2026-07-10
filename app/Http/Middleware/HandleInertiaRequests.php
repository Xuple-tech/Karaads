<?php

namespace App\Http\Middleware;

use App\Services\Media\MediaPathService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Resolve the root view by route namespace.
     */
    public function rootView(Request $request): string
    {
        if ($request->is('admin') || $request->is('admin/*')) {
            return 'admin';
        }

        return 'app';
    }

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $mediaPathService = app(MediaPathService::class);
        $user = $request->user();
        $isAppUser = $user && method_exists($user, 'hasActiveKaraVerifiedBadge');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'avatar' => $mediaPathService->toUrl($user->avatar ?? null),
                    'country' => $isAppUser ? $user->country : null,
                    'state' => $isAppUser ? $user->state : null,
                    'location' => $isAppUser ? $user->location : null,
                    'birth_date' => $user->birth_date?->toDateString(),
                    'onboarding_interests' => is_array($user->onboarding_interests ?? null) ? array_values($user->onboarding_interests) : null,
                    'onboarding_completed_at' => $user->onboarding_completed_at?->toIso8601String(),
                    'onboarding_complete' => $isAppUser ? $user->hasCompletedOnboarding() : false,
                    'kara_verified_at' => $isAppUser ? $user->kara_verified_at?->toIso8601String() : null,
                    'kara_verified_expires_at' => $isAppUser ? $user->kara_verified_expires_at?->toIso8601String() : null,
                    'is_verified' => $isAppUser ? $user->hasActiveKaraVerifiedBadge() : false,
                    'has_verification_badge' => $isAppUser ? $user->hasActiveKaraVerifiedBadge() : false,
                    'message_policy' => $user->message_policy ?? 'everyone',
                    'default_post_visibility' => $user->default_post_visibility ?? 'everyone',
                    'post_email_notifications_enabled' => (bool) ($user->post_email_notifications_enabled ?? true),
                    'avatar_variants' => $mediaPathService->mapToUrls(
                        is_array($user->avatar_variants ?? null) ? $user->avatar_variants : null
                    ),
                    'avatar_processing_status' => $user->avatar_processing_status ?? null,
                ] : null,
                'admin' => Auth::guard('admin')->user() ? Auth::guard('admin')->user()->toArray() : null,
            ],
            "flash"=>[
                "success"=>session("success"),
                "error"=>session("error"),
                "info"=>session("info"),
                "warning"=>session("warning")
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
