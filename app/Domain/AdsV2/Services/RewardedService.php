<?php

namespace App\Domain\AdsV2\Services;

use App\Models\AdsV2\AdEvent;
use App\Models\AdsV2\AdPayoutItem;

class RewardedService
{
    public function canComplete(string $deliveryId, string $userId): bool
    {
        return ! AdEvent::query()
            ->where('delivery_id', $deliveryId)
            ->where('viewer_user_id', $userId)
            ->where('event_type', 'view_complete')
            ->exists();
    }

    public function earningsSummary(string $userId): array
    {
        $query = AdPayoutItem::query()
            ->where('user_id', $userId)
            ->where('source', 'rewarded');

        $total = (float) $query->sum('amount');
        $pending = (float) (clone $query)->where('status', 'pending')->sum('amount');
        $processing = (float) (clone $query)->where('status', 'processing')->sum('amount');
        $completedQuery = (clone $query)->where('status', 'completed');
        $availableCompleted = (clone $completedQuery)
            ->where(function ($builder) {
                $builder->whereNull('meta->withdrawal_reference')
                    ->orWhere('meta->withdrawal_failed', true);
            });
        $available = (float) $availableCompleted->sum('amount');
        $withdrawn = (float) (clone $completedQuery)
            ->whereNotNull('meta->withdrawal_reference')
            ->where(function ($builder) {
                $builder->whereNull('meta->withdrawal_failed')
                    ->orWhere('meta->withdrawal_failed', false);
            })
            ->sum('amount');

        $today = (float) (clone $query)
            ->whereDate('created_at', today())
            ->sum('amount');

        $week = (float) (clone $query)
            ->where('created_at', '>=', now()->subDays(7))
            ->sum('amount');

        $month = (float) (clone $query)
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('amount');

        $adsCompleted = (int) (clone $query)->count();
        $average = $adsCompleted > 0 ? ($total / $adsCompleted) : 0;

        return [
            'total_earned' => round($total, 2),
            'pending' => round($pending, 2),
            'processing' => round($processing, 2),
            'available_balance' => round($available, 2),
            'today_earnings' => round($today, 2),
            'week_earnings' => round($week, 2),
            'month_earnings' => round($month, 2),
            'ads_completed' => $adsCompleted,
            'ads_watched' => $adsCompleted,
            'average_earning_per_ad' => round($average, 2),
            'total_withdrawn' => round($withdrawn, 2),
        ];
    }
}
