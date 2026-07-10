<?php

namespace App\Services\Monetization;

use App\Models\Earning;
use App\Models\Post;
use App\Models\PostMonetization;
use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PostEngagementMonetizationService
{
    private const MINIMUM_VIEWS_BEFORE_EARNING = 1000;

    private const RATES = [
        'view' => 0.01,
        'like' => 0.05,
        'comment' => 0.09,
    ];

    public function credit(Post $post, string $eventType, ?User $actor = null, ?string $sourceId = null): void
    {
        if (! array_key_exists($eventType, self::RATES)) {
            return;
        }

        $owner = $post->user ?: User::query()->find($post->user_id);
        if (! $owner || ! $owner->monetization_activated_at) {
            return;
        }

        if ($post->created_at && $post->created_at->lt($owner->monetization_activated_at)) {
            return;
        }

        if (! $this->hasReachedViewThreshold($owner)) {
            return;
        }

        if ($actor && (string) $actor->id === (string) $owner->id) {
            return;
        }

        $eventKey = $this->eventKey($post, $eventType, $actor, $sourceId);
        $amount = self::RATES[$eventType];

        DB::transaction(function () use ($owner, $post, $actor, $eventType, $sourceId, $eventKey, $amount): void {
            try {
                DB::table('post_monetization_events')->insert([
                    'id' => (string) Str::uuid(),
                    'user_id' => (string) $owner->id,
                    'post_id' => (string) $post->id,
                    'actor_user_id' => $actor?->id ? (string) $actor->id : null,
                    'event_type' => $eventType,
                    'source_id' => $sourceId,
                    'event_key' => $eventKey,
                    'amount' => $amount,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (QueryException $exception) {
                if ($this->isDuplicateEvent($exception)) {
                    return;
                }

                throw $exception;
            }

            $wallet = UserWallet::query()->firstOrCreate(
                ['user_id' => (string) $owner->id],
                [
                    'balance' => 0,
                    'total_earned' => 0,
                    'total_withdrawn' => 0,
                    'pending_withdrawal' => 0,
                    'currency' => 'NGN',
                    'min_payout_amount' => 1000,
                    'is_active' => true,
                ],
            );

            $wallet->increment('balance', $amount);
            $wallet->increment('total_earned', $amount);

            Earning::query()->create([
                'user_id' => (string) $owner->id,
                'post_id' => (string) $post->id,
                'earning_type' => Earning::TYPE_CONTENT_CREATOR,
                'amount' => $amount,
                'currency' => 'NGN',
                'description' => 'Monetized post engagement credit.',
                'status' => Earning::STATUS_PENDING,
                'transaction_id' => 'monetization:' . $eventKey,
                'base_amount' => $amount,
            ]);

            $monetization = PostMonetization::query()->firstOrCreate(
                ['post_id' => (string) $post->id],
                [
                    'id' => (string) Str::uuid(),
                    'user_id' => (string) $owner->id,
                    'is_monetized' => true,
                    'monetization_status' => PostMonetization::STATUS_ACTIVE,
                ],
            );

            $monetization->increment('total_earnings', $amount);
            $monetization->increment('estimated_earnings', $amount);

            if ($eventType === 'view') {
                $monetization->increment('total_impressions');
            } elseif (in_array($eventType, ['like', 'comment'], true)) {
                $monetization->increment('total_clicks');
            }
        });
    }

    private function eventKey(Post $post, string $eventType, ?User $actor, ?string $sourceId): string
    {
        $actorKey = $actor?->id ? (string) $actor->id : 'guest';
        $sourceKey = $sourceId ?: $actorKey;

        return "{$eventType}:{$post->id}:{$sourceKey}";
    }

    private function hasReachedViewThreshold(User $owner): bool
    {
        if (! $owner->monetization_activated_at) {
            return false;
        }

        $eligibleViews = Post::query()
            ->where('user_id', (string) $owner->id)
            ->where('created_at', '>=', $owner->monetization_activated_at)
            ->sum('view_count');

        return (int) $eligibleViews >= self::MINIMUM_VIEWS_BEFORE_EARNING;
    }

    private function isDuplicateEvent(QueryException $exception): bool
    {
        $sqlState = (string) ($exception->errorInfo[0] ?? '');
        $driverCode = (string) ($exception->errorInfo[1] ?? '');

        return $sqlState === '23000' || $driverCode === '1062';
    }
}
