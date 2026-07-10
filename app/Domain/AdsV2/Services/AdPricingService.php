<?php

namespace App\Domain\AdsV2\Services;

use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AdPricingService
{
    public function cpmRateNgn(): float
    {
        return $this->readSettingAmount('cpm_base_rate_ngn', 2.0, 'amount');
    }

    public function minBudget(): float
    {
        return $this->readSettingAmount('min_campaign_budget_ngn', 500.0, 'amount');
    }

    public function maxBudget(): float
    {
        return $this->readSettingAmount('max_campaign_budget_ngn', 1000000.0, 'amount');
    }

    public function videoViewRateNgn(): float
    {
        return $this->readSettingAmount('ad_video_view_rate_ngn', 5.0, 'amount');
    }

    public function imageViewRateNgn(): float
    {
        return $this->readSettingAmount('ad_image_view_rate_ngn', 3.0, 'amount');
    }

    public function videoViewerRewardNgn(): float
    {
        return $this->readSettingAmount('ad_video_viewer_reward_ngn', 3.0, 'amount');
    }

    public function imageViewerRewardNgn(): float
    {
        return $this->readSettingAmount('ad_image_viewer_reward_ngn', 2.0, 'amount');
    }

    public function videoViewThresholdRatio(): float
    {
        return max(0.01, min(1.0, $this->readSettingAmount('ad_video_view_threshold_ratio', 0.5, 'ratio')));
    }

    public function maxVideoDurationSeconds(): float
    {
        return max(1.0, $this->readSettingAmount('ad_video_max_duration_seconds', 300.0, 'seconds'));
    }

    public function normalizeMediaType(?string $mediaType): string
    {
        return $mediaType === 'video' ? 'video' : 'image';
    }

    public function chargeRateForMediaType(?string $mediaType): float
    {
        $normalized = $this->normalizeMediaType($mediaType);

        return $normalized === 'video'
            ? $this->videoViewRateNgn()
            : $this->imageViewRateNgn();
    }

    public function viewerRewardForMediaType(?string $mediaType): float
    {
        $normalized = $this->normalizeMediaType($mediaType);

        return $normalized === 'video'
            ? $this->videoViewerRewardNgn()
            : $this->imageViewerRewardNgn();
    }

    /**
     * @return array{rate:float,budget_daily:float,budget_total:float,reach_estimate:int}
     */
    public function budgetFromDailyViews(?string $mediaType, int $dailyViews, int $durationDays): array
    {
        if ($dailyViews < 1) {
            throw new InvalidArgumentException('Daily target views must be at least 1.');
        }

        if ($durationDays < 1) {
            throw new InvalidArgumentException('Duration days must be at least 1.');
        }

        $rate = $this->chargeRateForMediaType($mediaType);
        $budgetDaily = $rate * $dailyViews;
        $budgetTotal = $budgetDaily * $durationDays;

        return [
            'rate' => $rate,
            'budget_daily' => round($budgetDaily, 6),
            'budget_total' => round($budgetTotal, 6),
            'reach_estimate' => $dailyViews * $durationDays,
        ];
    }

    public function computeBidAmount(?float $customBid): float
    {
        if ($customBid !== null && $customBid > 0) {
            return $customBid;
        }

        // For CPM, bid amount is per 1000 impressions
        return $this->cpmRateNgn();
    }

    public function reachEstimate(float $budget, ?float $cpm = null, float $targetingFactor = 1.0): int
    {
        $cpm = $cpm ?? $this->cpmRateNgn();
        if ($cpm <= 0) {
            return 0;
        }

        // price is per impression; reach = budget / price
        $impressionsPerUnit = 1 / $cpm;
        return (int) floor($budget * $impressionsPerUnit * $targetingFactor);
    }

    private function readSettingAmount(string $key, float $fallback, string $valueField): float
    {
        $row = DB::table('monetization_settings')->where('key', $key)->first();
        $value = $row?->value ? json_decode($row->value, true) : null;

        return (float) ($value[$valueField] ?? $fallback);
    }
}
