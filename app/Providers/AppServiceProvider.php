<?php

namespace App\Providers;

use App\Listeners\CompleteReferralReward;
use App\Listeners\SendNewPostEmailNotifications;
use App\Models\LiveStream;
use App\Models\Post;
use App\Models\Story;
use App\Models\User;
use App\Observers\UserObserver;
use App\Support\UserPresence;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Verified;
use App\Events\PostCreated;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use App\Policies\LiveStreamPolicy;
use App\Policies\PostPolicy;
use App\Policies\StoryPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (! (bool) config('services.http_client.verify_ssl', true)) {
            Http::globalOptions([
                'verify' => false,
            ]);
        }

        User::observe(UserObserver::class);
        Event::listen(Verified::class, CompleteReferralReward::class);
        Event::listen(PostCreated::class, SendNewPostEmailNotifications::class);
        Event::listen(Login::class, function (Login $event): void {
            if ($event->user instanceof User) {
                $loginData = [
                    'last_login_at' => now(),
                ];

                if (Schema::hasColumn('users', 'ip_address')) {
                    $loginData['ip_address'] = $this->clientIpAddress();
                }

                $event->user->forceFill($loginData)->saveQuietly();
                app(UserPresence::class)->markOnline($event->user);
            }
        });
        Event::listen(Logout::class, function (Logout $event): void {
            if ($event->user instanceof User) {
                app(UserPresence::class)->markOffline($event->user);
            }
        });
        Gate::policy(Story::class, StoryPolicy::class);
        Gate::policy(Post::class, PostPolicy::class);
        Gate::policy(LiveStream::class, LiveStreamPolicy::class);
    }

    private function clientIpAddress(): ?string
    {
        $request = request();
        $headerIp = collect([
            $request->header('CF-Connecting-IP'),
            $request->header('X-Real-IP'),
            $request->header('X-Forwarded-For') ? explode(',', $request->header('X-Forwarded-For'))[0] : null,
        ])
            ->map(fn ($ip) => is_string($ip) ? trim($ip) : null)
            ->first(fn ($ip) => filter_var($ip, FILTER_VALIDATE_IP));

        return $headerIp ?: $request->ip();
    }
}
