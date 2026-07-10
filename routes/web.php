<?php

use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\Auth\AccountActivationController;
use App\Http\Controllers\Auth\EmailVerificationOtpController;
use App\Http\Resources\UserResource;
use App\Models\Post;
use App\Models\User;
use App\Support\PostAccess;
use App\Support\PostSeo;
use App\Support\UserPrivacy;
use App\Support\OnboardingInterestOptions;
use App\Support\UserPresence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Features;

if (! function_exists('karaads_public_media_response')) {
    function karaads_public_media_response(Request $request, string $path)
    {
        $path = ltrim(str_replace('\\', '/', $path), '/');
        abort_if($path === '' || str_contains($path, '..'), 404);

        if (! app()->environment('local')) {
            if (karaads_is_video_path($path)) {
                $streamedResponse = karaads_s3_streaming_response($request, $path);
                if ($streamedResponse) {
                    return $streamedResponse;
                }
            }

            $temporaryUrl = karaads_s3_temporary_url($path);
            if ($temporaryUrl) {
                return redirect()->away($temporaryUrl, 302, [
                    'Cache-Control' => 'public, max-age=300',
                ]);
            }
        }

        $localRoot = realpath(storage_path('app/public'));
        $localPath = realpath(storage_path('app/public/' . $path));
        if ($localRoot && $localPath && str_starts_with($localPath, $localRoot) && is_file($localPath)) {
            return response()->file($localPath, [
                'Accept-Ranges' => 'bytes',
                'Cache-Control' => 'public, max-age=31536000, immutable',
            ]);
        }

        $legacyWasabiPath = trim(str_replace('\\', '/', storage_path('app/public')), '/') . '/' . $path;
        if (karaads_is_video_path($legacyWasabiPath)) {
            $streamedResponse = karaads_s3_streaming_response($request, $legacyWasabiPath);
            if ($streamedResponse) {
                return $streamedResponse;
            }
        }

        $temporaryUrl = karaads_s3_temporary_url($legacyWasabiPath);
        if ($temporaryUrl) {
            return redirect()->away($temporaryUrl, 302, [
                'Cache-Control' => 'public, max-age=300',
            ]);
        }

        abort(404);
    }
}

if (! function_exists('karaads_is_video_path')) {
    function karaads_is_video_path(string $path): bool
    {
        return preg_match('/\.(mp4|m4v|mov|webm)(?:$|\?)/i', $path) === 1;
    }
}

if (! function_exists('karaads_video_content_type')) {
    function karaads_video_content_type(string $path, ?string $fallback = null): string
    {
        $extension = strtolower(pathinfo(parse_url($path, PHP_URL_PATH) ?: $path, PATHINFO_EXTENSION));

        return match ($extension) {
            'webm' => 'video/webm',
            'mov' => 'video/quicktime',
            'm4v' => 'video/x-m4v',
            default => $fallback ?: 'video/mp4',
        };
    }
}

if (! function_exists('karaads_s3_client')) {
    function karaads_s3_client(): mixed
    {
        try {
            $disk = Storage::disk('s3');

            if (method_exists($disk, 'getClient')) {
                return $disk->getClient();
            }

            $adapter = $disk->getAdapter();

            return method_exists($adapter, 'getClient') ? $adapter->getClient() : null;
        } catch (Throwable) {
            return null;
        }
    }
}

if (! function_exists('karaads_s3_streaming_response')) {
    function karaads_s3_streaming_response(Request $request, string $path)
    {
        $client = karaads_s3_client();
        $bucket = (string) config('filesystems.disks.s3.bucket');
        if (! $client || $bucket === '') {
            return null;
        }

        try {
            $head = $client->headObject([
                'Bucket' => $bucket,
                'Key' => $path,
            ]);
        } catch (Throwable) {
            return null;
        }

        $size = (int) ($head['ContentLength'] ?? 0);
        if ($size <= 0) {
            return null;
        }

        $start = 0;
        $end = $size - 1;
        $status = 200;
        $rangeHeader = $request->header('Range');

        if (is_string($rangeHeader) && preg_match('/bytes=(\d*)-(\d*)/', $rangeHeader, $matches)) {
            if ($matches[1] === '' && $matches[2] !== '') {
                $suffixLength = min((int) $matches[2], $size);
                $start = max(0, $size - $suffixLength);
            } elseif ($matches[1] !== '') {
                $start = min((int) $matches[1], $size - 1);
            }

            if ($matches[2] !== '' && $matches[1] !== '') {
                $end = min((int) $matches[2], $size - 1);
            }

            if ($start > $end) {
                return response('', 416, [
                    'Content-Range' => "bytes */{$size}",
                    'Accept-Ranges' => 'bytes',
                ]);
            }

            $status = 206;
        }

        try {
            $object = $client->getObject([
                'Bucket' => $bucket,
                'Key' => $path,
                'Range' => "bytes={$start}-{$end}",
            ]);
        } catch (Throwable) {
            return null;
        }

        $length = $end - $start + 1;
        $contentType = karaads_video_content_type($path, $head['ContentType'] ?? null);
        $headers = [
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'Content-Length' => (string) $length,
            'Content-Type' => $contentType,
            'X-Content-Type-Options' => 'nosniff',
        ];

        if ($status === 206) {
            $headers['Content-Range'] = "bytes {$start}-{$end}/{$size}";
        }

        return response()->stream(function () use ($object) {
            $body = $object['Body'] ?? null;
            while ($body && ! $body->eof()) {
                echo $body->read(1024 * 256);
                if (connection_aborted()) {
                    break;
                }
            }
        }, $status, $headers);
    }
}

if (! function_exists('karaads_s3_temporary_url')) {
    function karaads_s3_temporary_url(string $path): ?string
    {
        try {
            return Storage::disk('s3')->temporaryUrl($path, now()->addMinutes(30));
        } catch (Throwable) {
            return null;
        }
    }
}

$publicMediaMiddlewareExclusions = [
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
    \Illuminate\View\Middleware\ShareErrorsFromSession::class,
    \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    \App\Http\Middleware\HandleAppearance::class,
    \App\Http\Middleware\HandleInertiaRequests::class,
    \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
    \App\Http\Middleware\TrackUserPresence::class,
];

Route::get('/', function (Request $request) {
    // If logged in, go to app
    if ($request->user()) {
        return redirect('/app');
    }

    $userAgent = $request->header('User-Agent');

    // Simple WebView detection
    // Android WebView usually contains 'wv'
    // iOS WebView usually does NOT contain 'Safari' (but has 'Mobile')
    $isWebView = false;

    if ($userAgent && (
        strpos($userAgent, 'wv') !== false ||
        (strpos($userAgent, 'Mobile') !== false && strpos($userAgent, 'Safari') === false)
    )) {
        $isWebView = true;
    }

    if (Auth::guard('admin')->check()) {
        return redirect('/admin/dashboard');
    }

    if ($isWebView) {
        return redirect('/app');
    }

    return Inertia::render('Landing');
})->name('home');
Route::get('/dashboard', function () {
    if (Auth::guard('admin')->check()) {
        return redirect('/admin/dashboard');
    }

    return redirect('/app');
});

Route::get('/media/{path}', function (Request $request, string $path) {
    return karaads_public_media_response($request, $path);
})->where('path', '.*')->withoutMiddleware($publicMediaMiddlewareExclusions)->name('media.public');

Route::get('/media-file/{encodedPath}', function (Request $request, string $encodedPath) {
    $decoded = base64_decode(strtr($encodedPath, '-_', '+/'), true);
    abort_unless(is_string($decoded), 404);

    return karaads_public_media_response($request, $decoded);
})->where('encodedPath', '[A-Za-z0-9_-]+')->withoutMiddleware($publicMediaMiddlewareExclusions)->name('media.asset');

Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::get('/auth/me/confirm/v0', [AccountActivationController::class, 'show'])->name('account-activation.show');
Route::post('/auth/me/confirm/v0/send-code', [AccountActivationController::class, 'sendCode'])->name('account-activation.send-code');
Route::post('/auth/me/confirm/v0/verify-code', [AccountActivationController::class, 'verifyCode'])->name('account-activation.verify-code');
Route::post('/auth/me/confirm/v0/set-password', [AccountActivationController::class, 'setPassword'])->name('account-activation.set-password');

Route::get('/verify-email', function (Request $request) {
    if (! $request->user()) {
        return redirect('/login');
    }

    return redirect('/auth/verify-email/otp');
})->name('email-verification.redirect');

Route::middleware('auth')->group(function () {
    Route::get('/auth/verify-email/otp', [EmailVerificationOtpController::class, 'show'])->name('email-verification-otp.show');
    Route::post('/auth/verify-email/otp/send-code', [EmailVerificationOtpController::class, 'sendCode'])
        ->middleware('throttle:6,1')
        ->name('email-verification-otp.send-code');
    Route::post('/auth/verify-email/otp/verify-code', [EmailVerificationOtpController::class, 'verifyCode'])
        ->middleware('throttle:12,1')
        ->name('email-verification-otp.verify-code');
});

// Public profile route by username
Route::get('/@{username}', function (string $username, Request $request) {
    $user = User::where('username', $username)->firstOrFail();
    $user->loadCount(['followers', 'following']);
    $currentUser = $request->user();
    if ($currentUser && $currentUser->id !== $user->id && UserPrivacy::isBlockedBetween($currentUser, $user)) {
        abort(404);
    }

    $isFollowing = false;
    if ($currentUser) {
        $isFollowing = $currentUser->following()
            ->where('following_id', $user->id)
            ->exists();
    }
    $isOwnProfile = $currentUser && $currentUser->id === $user->id;
    if ($user->referral_code === null && $isOwnProfile) {
        // Generate and save a referral code if it doesn't exist
        $user->referral_code = Str::random(10);
        $user->save();
    }
    $profilePayload = (new UserResource($user))->resolve($request);
    $profilePayload['is_following'] = $isFollowing;

    return Inertia::render('app/profile', [
        'initialUser' => $profilePayload,
        'isOwnProfile' => $currentUser && $currentUser->id === $user->id,
    ]);
})->name('profile.show');

Route::get('/posts/{post}', function (Post $post, Request $request) {
    abort_unless(PostAccess::canView($post, $request->user()), 404);

    $post->loadMissing(['user', 'media']);

    return Inertia::render('Post/Show', [
        'postId' => $post->id,
        'seo' => PostSeo::build($post),
    ]);
})->name('post.show');

Route::middleware(['auth', 'verified', 'onboarding.completed'])->group(function () {
    Route::get('/onboarding', function (Request $request) {
        return Inertia::render('onboarding', [
            'interestOptions' => OnboardingInterestOptions::options(),
            'initialBirthDate' => $request->user()?->birth_date?->toDateString(),
            'initialInterests' => is_array($request->user()?->onboarding_interests) ? array_values($request->user()->onboarding_interests) : [],
        ]);
    })->name('onboarding');

    Route::get('app', function () {
        return Inertia::render('app/moments', [
            'token' => Str::ulid(),
        ]);
    })->name('dashboard');
    Route::get('/app/moments', function () {
        return Inertia::render('app/moments', [
            'token' => Str::ulid(),
        ]);
    })->name('app.moments');
    Route::get('/search', function () {
        return Inertia::render('app/search', [
            'token' => Str::ulid(),
        ]);
    })->name('app.search');
    Route::get('/hashtag/{tag}', function (string $tag) {
        return Inertia::render('app/hashtag', [
            'token' => Str::ulid(),
            'tag' => $tag,
        ]);
    })->name('app.hashtag');
    Route::redirect('/browse', '/search')->name('app.browse');
    Route::get('/earn', function () {
        return Inertia::render('Earn/Index', [
            'token' => Str::ulid(),
        ]);
    })->name('app.earn');
    Route::get('/monetization', function () {
        return Inertia::render('app/monetization', [
            'token' => Str::ulid(),
        ]);
    })->name('app.monetization');
    Route::get('/live', function () {
        return Inertia::render('app/live/index', [
            'token' => Str::ulid(),
        ]);
    })->name('app.live');
    Route::get('/live/{streamId}', function (string $streamId) {
        return Inertia::render('app/live/show', [
            'token' => Str::ulid(),
            'streamId' => $streamId,
        ]);
    })->name('app.live.show');
    Route::get('/live/{streamId}/host', function (string $streamId) {
        return Inertia::render('app/live/host', [
            'token' => Str::ulid(),
            'streamId' => $streamId,
        ]);
    })->name('app.live.host');
    Route::get('/messages', function () {
        return Inertia::render('app/messages', [
            'token' => Str::ulid(),
        ]);
    })->name('app.messages');
     Route::get('/messages/{userId}', function (string $userId) {
        return Inertia::render('app/messages', [
            'token' => Str::ulid(),
            'userId' => $userId,
        ]);
    })->name('app.messages.show');
     Route::get('/messages/c/{userId}', function (string $userId) {
        return Inertia::render('app/messages', [
            'token' => Str::ulid(),
            'userId' => $userId,
        ]);
    })->name('app.messages.conversation');
    Route::get('/notifications', function () {
        return Inertia::render('app/notifications', [
            'token' => Str::ulid(),
        ]);
    })->name('app.notifications');
    Route::get('/pages', function () {
        return Inertia::render('app/business-pages', [
            'token' => Str::ulid(),
        ]);
    })->name('app.business-pages');
    Route::get('/pages/{slug}', function (string $slug) {
        return Inertia::render('app/business-pages', [
            'token' => Str::ulid(),
            'slug' => $slug,
        ]);
    })->name('app.business-pages.show');
    Route::get('/profile', function (Request $request) {
        $user = $request->user();
        $user->loadCount(['followers', 'following']);

        $profilePayload = (new UserResource($user))->resolve($request);
        $profilePayload['is_following'] = false;

        return Inertia::render('app/profile', [
            'initialUser' => $profilePayload,
            'isOwnProfile' => true,
        ]);
    })->name('app.profile');

    Route::get('/ads', function () {
        return Inertia::render('app/ads/index');
    })->name('ads.index');

    Route::get('/ads/create', function () {
        return Inertia::render('app/ads/create');
    })->name('ads.create');

    Route::get('/ads/{creative}', function (string $creative) {
        return Inertia::render('app/ads/show', ['creativeId' => $creative]);
    })->name('ads.show');

    Route::get('/ads/{creative}/edit', function (string $creative) {
        return Inertia::render('app/ads/edit', ['creativeId' => $creative]);
    })->name('ads.edit');

    Route::get('/manager-ads', function () {
        return Inertia::render('ads-portal/index');
    })->name('ads.portal.index');

    Route::get('/manager-ads/create', function () {
        return Inertia::render('ads-portal/create');
    })->name('ads.portal.create');

    Route::get('/manager-ads/{creative}', function (string $creative) {
        return Inertia::render('ads-portal/show', ['creativeId' => $creative]);
    })->name('ads.portal.show');

    Route::get('/manager-ads/{creative}/edit', function (string $creative) {
        return Inertia::render('ads-portal/edit', ['creativeId' => $creative]);
    })->name('ads.portal.edit');

    Route::get('/post/create', function () {
        return Inertia::render('app/post/create');
    })->name('post.create');
    Route::get('/app/stories/create', function () {
        return Inertia::render('app/stories-create', [
            'token' => Str::ulid(),
        ]);
    })->name('app.stories.create');
});

$adsPortalSubdomain = env('ADS_PORTAL_SUBDOMAIN', 'manager');
$appHost = parse_url((string) config('app.url'), PHP_URL_HOST);

if (is_string($appHost) && $appHost !== '' && !filter_var($appHost, FILTER_VALIDATE_IP)) {
    Route::domain($adsPortalSubdomain . '.' . $appHost)
        ->middleware(['auth', 'verified', 'onboarding.completed'])
        ->group(function () {
            Route::get('/', function () {
                return Inertia::render('ads-portal/index');
            })->name('ads.portal.domain.index');

            Route::get('/create', function () {
                return Inertia::render('ads-portal/create');
            })->name('ads.portal.domain.create');

            Route::get('/{creative}', function (string $creative) {
                return Inertia::render('ads-portal/show', ['creativeId' => $creative]);
            })->name('ads.portal.domain.show');

            Route::get('/{creative}/edit', function (string $creative) {
                return Inertia::render('ads-portal/edit', ['creativeId' => $creative]);
            })->name('ads.portal.domain.edit');
        });
}

// Public pages
Route::get('/privacy', function () {
    return Inertia::render('privacy-policy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('terms-of-service');
})->name('terms');

Route::get('/csae-policy', function () {
    return Inertia::render('csae-policy');
})->name('csae-policy');

// Account deletion - public routes for Google Play Store compliance
Route::get('/account-deletion', function () {
    return Inertia::render('account-deletion-info');
})->name('account-deletion.info');

use App\Http\Controllers\PublicAccountDeletionController;

Route::get('/delete-account', [PublicAccountDeletionController::class, 'show'])->name('account-deletion.request');
Route::post('/delete-account', [PublicAccountDeletionController::class, 'sendConfirmationEmail'])
    ->middleware('throttle:3,10')
    ->name('account-deletion.email');
Route::get('/delete-account/{token}', [PublicAccountDeletionController::class, 'showConfirmation'])->name('account-deletion.show');
Route::post('/delete-account/{token}', [PublicAccountDeletionController::class, 'confirmDeletion'])
    ->middleware('throttle:5,10')
    ->name('account-deletion.confirm');

require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/channels.php';
 
