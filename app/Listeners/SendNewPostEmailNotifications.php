<?php

namespace App\Listeners;

use App\Events\PostCreated;
use App\Models\User;
use App\Notifications\NewPostFromConnectionNotification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Throwable;

class SendNewPostEmailNotifications
{
    private const MAIL_RATE_LIMIT_CACHE_KEY = 'mail:smtp-rate-limited:post-notifications';

    public function handle(PostCreated $event): void
    {
        if (Cache::has(self::MAIL_RATE_LIMIT_CACHE_KEY)) {
            return;
        }

        $post = $event->post->loadMissing('user');

        if ($post->visibility === 'private') {
            return;
        }

        $recipientIds = collect();

        if (in_array($post->visibility, ['everyone', 'followers'], true)) {
            $recipientIds = $recipientIds->merge(
                DB::table('follows')
                    ->where('following_id', $post->user_id)
                    ->pluck('follower_id')
            );
        }

        if ($post->visibility === 'everyone') {
            $recipientIds = $recipientIds->merge(
                DB::table('follows')
                    ->where('follower_id', $post->user_id)
                    ->pluck('following_id')
            );
        }

        $recipientIds = $recipientIds
            ->unique()
            ->reject(fn ($userId) => (string) $userId === (string) $post->user_id)
            ->values();

        if ($recipientIds->isEmpty()) {
            return;
        }

        $maxRecipients = (int) config('mail.post_notification_recipient_limit', 25);
        if ($maxRecipients <= 0) {
            return;
        }

        $recipientIds = $recipientIds->take($maxRecipients);

        User::query()
            ->whereIn('id', $recipientIds)
            ->whereNotNull('email')
            ->where('post_email_notifications_enabled', true)
            ->chunkById(25, function ($users) use ($post): void {
                foreach ($users as $user) {
                    if (! filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
                        continue;
                    }

                    try {
                        Notification::send($user, new NewPostFromConnectionNotification($post));
                    } catch (Throwable $exception) {
                        Log::warning('New post email notification skipped after mail failure', [
                            'post_id' => $post->id,
                            'user_id' => $user->id,
                            'message' => $exception->getMessage(),
                        ]);

                        $message = strtolower($exception->getMessage());
                        if (str_contains($message, 'ratelimit') || str_contains($message, 'timeout')) {
                            Cache::put(self::MAIL_RATE_LIMIT_CACHE_KEY, true, now()->addHours(2));

                            return;
                        }
                    }
                }
            });
    }
}
