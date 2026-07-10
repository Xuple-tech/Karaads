<?php

namespace App\Services\Post;

use App\Models\Earning;
use App\Models\Post;
use App\Models\UserWallet;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class PostRewardService
{
    public const MIN_VIDEO_DURATION_SECONDS = 30;
    public const LEGACY_UNVERIFIED_REWARD_AMOUNT = 20.0;
    public const LEGACY_VERIFIED_REWARD_AMOUNT = 50.0;
    public const JUNE_2026_UNVERIFIED_REWARD_AMOUNT = 10.0;
    public const JUNE_2026_VERIFIED_REWARD_AMOUNT = 30.0;

    public function syncReward(Post $post, ?float $videoDurationSeconds): Post
    {
        $duration = $videoDurationSeconds !== null ? (float) $videoDurationSeconds : null;

        if (! in_array($post->content_validation_status, ['approved', 'warning'], true)) {
            $post->forceFill([
                'reward_status' => 'blocked',
                'reward_amount' => 0,
                'reward_reason' => 'Reward blocked until the post passes content validation.',
                'rewarded_at' => null,
            ])->save();

            return $post->fresh();
        }

        if ($this->hasCopyrightWatermarkRisk($post)) {
            $post->forceFill([
                'reward_status' => 'blocked',
                'reward_amount' => 0,
                'reward_reason' => 'Video can stay published, but creator earnings are blocked because it may contain a platform watermark or copyrighted content.',
                'rewarded_at' => null,
            ])->save();

            return $post->fresh();
        }

        if ($this->hasBlurryVideoRisk($post)) {
            $post->forceFill([
                'reward_status' => 'blocked',
                'reward_amount' => 0,
                'reward_reason' => 'Video can stay published, but creator earnings are blocked because the video appears too blurry.',
                'rewarded_at' => null,
            ])->save();

            return $post->fresh();
        }

        if (trim(strip_tags((string) $post->content)) === '') {
            $post->forceFill([
                'reward_status' => 'ineligible',
                'reward_amount' => 0,
                'reward_reason' => 'Post must include a caption to earn a creator reward.',
                'rewarded_at' => null,
            ])->save();

            return $post->fresh();
        }

        if ($duration === null || $duration < self::MIN_VIDEO_DURATION_SECONDS) {
            $post->forceFill([
                'reward_status' => 'ineligible',
                'reward_amount' => 0,
                'reward_reason' => 'Video must be at least 30 seconds long to earn a creator reward.',
                'rewarded_at' => null,
            ])->save();

            return $post->fresh();
        }

        return DB::transaction(function () use ($post) {
            $post = Post::query()->lockForUpdate()->findOrFail($post->id);
            $hasBadge = $this->hasActiveKaraVerifiedBadge($post);
            $rewardAmount = $this->rewardAmountFor($post, $hasBadge);

            if ($post->reward_status === 'credited' && (float) $post->reward_amount > 0) {
                $currentAmount = (float) $post->reward_amount;

                if (abs($currentAmount - $rewardAmount) < 0.000001) {
                    return $post;
                }

                $difference = $rewardAmount - $currentAmount;
                $wallet = UserWallet::query()->lockForUpdate()->firstOrCreate(
                    ['user_id' => $post->user_id],
                    [
                        'balance' => 0,
                        'total_earned' => 0,
                        'total_withdrawn' => 0,
                        'pending_withdrawal' => 0,
                        'currency' => 'NGN',
                        'min_payout_amount' => 10,
                        'is_active' => true,
                    ],
                );

                $wallet->balance = (float) $wallet->balance + $difference;
                $wallet->total_earned = (float) $wallet->total_earned + $difference;
                $wallet->save();

                Earning::query()
                    ->where('transaction_id', 'post_reward:' . $post->id)
                    ->update([
                        'amount' => $rewardAmount,
                        'base_amount' => $rewardAmount,
                    ]);

                $post->forceFill([
                    'reward_amount' => $rewardAmount,
                    'reward_reason' => sprintf(
                        'Validated video reached 30 seconds and earned N%.0f%s.',
                        $rewardAmount,
                        $hasBadge ? ' with Kara Verified badge' : ''
                    ),
                ])->save();

                return $post->fresh();
            }

            $wallet = UserWallet::query()->lockForUpdate()->firstOrCreate(
                ['user_id' => $post->user_id],
                [
                    'balance' => 0,
                    'total_earned' => 0,
                    'total_withdrawn' => 0,
                    'pending_withdrawal' => 0,
                    'currency' => 'NGN',
                    'min_payout_amount' => 10,
                    'is_active' => true,
                ],
            );

            $wallet->balance = (float) $wallet->balance + $rewardAmount;
            $wallet->total_earned = (float) $wallet->total_earned + $rewardAmount;
            $wallet->save();

            Earning::query()->create([
                'user_id' => $post->user_id,
                'post_id' => $post->id,
                'earning_type' => Earning::TYPE_BONUS,
                'amount' => $rewardAmount,
                'currency' => 'NGN',
                'description' => '30 seconds or longer validated video reward.',
                'status' => Earning::STATUS_PENDING,
                'payout_method' => 'wallet_credit',
                'transaction_id' => 'post_reward:' . $post->id,
                'base_amount' => $rewardAmount,
            ]);

            $post->forceFill([
                'reward_status' => 'credited',
                'reward_amount' => $rewardAmount,
                'reward_reason' => sprintf(
                    'Validated video reached 30 seconds and earned N%.0f%s.',
                    $rewardAmount,
                    $hasBadge ? ' with Kara Verified badge' : ''
                ),
                'rewarded_at' => now(),
            ])->save();

            return $post->fresh();
        });
    }

    private function rewardAmountFor(Post $post, bool $hasBadge): float
    {
        if ($this->usesJune2026RewardRate($post)) {
            return $hasBadge ? self::JUNE_2026_VERIFIED_REWARD_AMOUNT : self::JUNE_2026_UNVERIFIED_REWARD_AMOUNT;
        }

        return $hasBadge ? self::LEGACY_VERIFIED_REWARD_AMOUNT : self::LEGACY_UNVERIFIED_REWARD_AMOUNT;
    }

    private function usesJune2026RewardRate(Post $post): bool
    {
        $createdAt = $post->created_at ?: now();
        $effectiveAt = CarbonImmutable::parse('2026-06-01 00:00:00', 'Africa/Lagos')->utc();

        return $createdAt->greaterThanOrEqualTo($effectiveAt);
    }

    private function hasActiveKaraVerifiedBadge(Post $post): bool
    {
        return $post->user()
            ->whereNotNull('kara_verified_at')
            ->where(function ($query): void {
                $query->whereNull('kara_verified_expires_at')
                    ->orWhere('kara_verified_expires_at', '>', now());
            })
            ->exists();
    }

    private function hasCopyrightWatermarkRisk(Post $post): bool
    {
        $flags = is_array($post->content_validation_flags) ? $post->content_validation_flags : [];
        $warnings = (array) ($flags['warnings'] ?? []);
        foreach ($warnings as $warning) {
            $warning = mb_strtolower((string) $warning);
            if (str_contains($warning, 'copyright') || str_contains($warning, 'watermark')) {
                return true;
            }
        }

        $trace = is_array($post->content_validation_trace) ? $post->content_validation_trace : [];
        foreach ($trace as $entry) {
            if (! is_array($entry)) {
                continue;
            }

            if (($entry['rule'] ?? null) === 'copyright_watermark_risk' && ($entry['passed'] ?? true) === false) {
                return true;
            }
        }

        return false;
    }

    private function hasBlurryVideoRisk(Post $post): bool
    {
        $trace = is_array($post->content_validation_trace) ? $post->content_validation_trace : [];
        foreach ($trace as $entry) {
            if (is_array($entry) && ($entry['rule'] ?? null) === 'video_blur' && ($entry['passed'] ?? true) === false) {
                return true;
            }
        }

        $flags = is_array($post->content_validation_flags) ? $post->content_validation_flags : [];
        foreach ((array) ($flags['warnings'] ?? []) as $warning) {
            if (str_contains(mb_strtolower((string) $warning), 'blurr')) {
                return true;
            }
        }

        return false;
    }
}
