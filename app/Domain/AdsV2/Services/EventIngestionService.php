<?php

namespace App\Domain\AdsV2\Services;

use App\Domain\Recommendation\Services\BehaviorSignalService;
use App\Models\AdsV2\AdDelivery;
use App\Models\AdsV2\AdEvent;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdPayoutItem;
use App\Models\AdsV2\AdWalletLedger;
use App\Models\UserWallet;
use Illuminate\Support\Arr;
use Illuminate\Database\QueryException;
use Illuminate\Support\Str;

class EventIngestionService
{
    public function __construct(
        private readonly FraudGuardService $fraudGuard,
        private readonly WalletLedgerService $walletLedger,
        private readonly BehaviorSignalService $behaviorSignals,
        private readonly AdPricingService $pricing,
    ) {}

    public function ingest(array $payload, ?string $viewerUserId, ?string $ip, ?string $userAgent): AdEvent
    {
        $idempotencyKey = $payload['idempotency_key'] ?? (string) Str::uuid();
        $existing = AdEvent::where('idempotency_key', $idempotencyKey)->first();
        if ($existing) {
            return $existing;
        }

        $delivery = null;
        if (! empty($payload['delivery_id'])) {
            $delivery = AdDelivery::find($payload['delivery_id']);
            $delivery?->loadMissing('campaign.account.wallet', 'creative', 'placement');
        }

        $eventType = (string) $payload['event_type'];
        $fingerprint = $payload['fingerprint'] ?? null;
        $sessionId = $payload['session_id'] ?? null;

        $fraud = $this->fraudGuard->evaluate($eventType, $fingerprint, $sessionId, $delivery?->id);

        $isBillable = false;
        $billAmount = 0.0;
        $shouldRewardViewer = false;
        $viewerRewardAmount = 0.0;

        if ($fraud['valid'] && $delivery && $delivery->campaign) {
            $mediaType = $this->resolveCreativeMediaType($delivery);
            $isInternal = $this->isInternalDelivery($delivery);
            $rewardEligible = $this->isRewardEligible($delivery);

            if ($isInternal) {
                if ($mediaType === 'video' && $eventType === 'view_complete' && $this->isQualifiedVideoView($payload, $delivery)) {
                    $isBillable = true;
                    $billAmount = max(0.001, $this->pricing->chargeRateForMediaType('video'));
                    if ($rewardEligible) {
                        $shouldRewardViewer = true;
                        $viewerRewardAmount = max(0.01, $this->pricing->viewerRewardForMediaType('video'));
                    }
                }

                $isRewardedImageCompletion = $mediaType !== 'video'
                    && $rewardEligible
                    && $eventType === 'view_complete';
                $isStandardImageImpression = $mediaType !== 'video'
                    && ! $rewardEligible
                    && $eventType === 'impression';

                if ($isStandardImageImpression || $isRewardedImageCompletion) {
                    $isBillable = true;
                    $billAmount = max(0.001, $this->pricing->chargeRateForMediaType('image'));
                    if ($isRewardedImageCompletion) {
                        $shouldRewardViewer = true;
                        $viewerRewardAmount = max(0.01, $this->pricing->viewerRewardForMediaType('image'));
                    }
                }
            } else {
                $campaign = $delivery->campaign;
                $model = $campaign->billing_model;
                if ($eventType === 'impression' && $model === 'cpm') {
                    $isBillable = true;
                    $billAmount = max(0.001, (float) $this->pricing->computeBidAmount($campaign->bid_amount));
                }
                if ($eventType === 'click' && $model === 'cpc') {
                    $isBillable = true;
                    $billAmount = max(0.001, (float) $delivery->campaign->bid_amount);
                }
                if ($eventType === 'view_complete' && $model === 'cpv') {
                    $isBillable = true;
                    $billAmount = max(0.001, (float) $delivery->campaign->bid_amount);
                }
                if ($eventType === 'conversion' && $model === 'cpa') {
                    $isBillable = true;
                    $billAmount = max(0.001, (float) $delivery->campaign->bid_amount);
                }
            }
        }

        if ($isBillable && $delivery && $delivery->campaign && $delivery->campaign->account?->wallet) {
            $wallet = $delivery->campaign->account->wallet;
            try {
                $usedReservedCharge = false;
                if ($eventType === 'view_complete' && $this->isRewardEligible($delivery)) {
                    $reservedAmount = $this->commitReservedChargeForDelivery($delivery);
                    if ($reservedAmount !== null) {
                        $billAmount = $reservedAmount;
                        $usedReservedCharge = true;
                    }
                }

                if (! $usedReservedCharge) {
                    $this->walletLedger->chargeWithCreditFallback(
                        $wallet,
                        $billAmount,
                        'ad_events_v2',
                        $idempotencyKey,
                        'event-charge-' . $idempotencyKey,
                    );
                }

                $delivery->campaign->spent = (float) $delivery->campaign->spent + $billAmount;

                if ($delivery->campaign->spent >= (float) $delivery->campaign->budget_total) {
                    $delivery->campaign->status = 'completed';
                }
                $delivery->campaign->save();
            } catch (\RuntimeException $e) {
                // Insufficient funds: pause campaign
                $delivery->campaign->status = 'paused';
                $delivery->campaign->save();
                $isBillable = false;
                $billAmount = 0;
                $shouldRewardViewer = false;
                $viewerRewardAmount = 0;
            }
        }

        try {
            $event = AdEvent::create([
                'delivery_id' => $delivery?->id,
                'placement_id' => $delivery?->placement_id,
                'campaign_id' => $delivery?->campaign_id,
                'creative_id' => $delivery?->creative_id,
                'viewer_user_id' => $viewerUserId,
                'event_type' => $eventType,
                'occurred_at' => Arr::get($payload, 'occurred_at', now()),
                'session_id' => $sessionId,
                'fingerprint' => $fingerprint,
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'idempotency_key' => $idempotencyKey,
                'meta' => Arr::get($payload, 'meta', []),
                'is_billable' => $isBillable,
                'billed_amount' => $billAmount,
                'currency' => $delivery?->campaign?->currency ?? 'NGN',
                'invalidated' => ! $fraud['valid'],
                'invalid_reason' => $fraud['reason'],
            ]);
        } catch (QueryException $exception) {
            if ($this->isIdempotencyConflict($exception)) {
                $existing = AdEvent::where('idempotency_key', $idempotencyKey)->first();
                if ($existing) {
                    return $existing;
                }
            }

            throw $exception;
        }

        if ($shouldRewardViewer && $isBillable && $fraud['valid'] && $viewerUserId && $delivery) {
            $mediaType = $this->resolveCreativeMediaType($delivery);
            AdPayoutItem::create([
                'user_id' => $viewerUserId,
                'source' => 'rewarded',
                'amount' => $viewerRewardAmount,
                'status' => 'completed',
                'reference_type' => 'ad_events_v2',
                'reference_id' => $event->id,
                'meta' => [
                    'delivery_id' => $delivery->id,
                    'campaign_id' => $delivery->campaign_id,
                    'creative_id' => $delivery->creative_id,
                    'event_type' => $eventType,
                    'media_type' => $mediaType,
                ],
                'paid_at' => now(),
            ]);

            $wallet = UserWallet::query()->firstOrCreate(
                ['user_id' => $viewerUserId],
                [
                    'balance' => 0,
                    'total_earned' => 0,
                    'total_withdrawn' => 0,
                    'pending_withdrawal' => 0,
                    'currency' => 'NGN',
                    'is_active' => true,
                    'min_payout_amount' => 10,
                ],
            );

            $wallet->balance = (float) $wallet->balance + $viewerRewardAmount;
            $wallet->total_earned = (float) $wallet->total_earned + $viewerRewardAmount;
            $wallet->currency = strtoupper((string) ($wallet->currency ?: 'NGN'));
            if ($wallet->currency === 'USD') {
                $wallet->currency = 'NGN';
            }
            $wallet->save();
        }

        $this->behaviorSignals->recordAdEvent($event->loadMissing('delivery.placement', 'delivery.creative'));

        if (! $event->invalidated && $delivery?->campaign) {
            $this->completeCampaignIfGoalReached($delivery->campaign);
        }

        return $event;
    }

    private function isInternalDelivery(AdDelivery $delivery): bool
    {
        if ($delivery->source_type === 'internal') {
            return true;
        }

        return $delivery->creative?->source_type === 'internal';
    }

    private function resolveCreativeMediaType(AdDelivery $delivery): string
    {
        return $this->pricing->normalizeMediaType(
            $delivery->creative?->media_type ?? $delivery->campaign?->pricing_media_type,
        );
    }

    private function isRewardEligible(AdDelivery $delivery): bool
    {
        if (($delivery->campaign?->objective ?? null) === 'rewarded') {
            return true;
        }

        return ($delivery->placement?->slot ?? null) === 'rewarded';
    }

    private function isQualifiedVideoView(array $payload, AdDelivery $delivery): bool
    {
        $meta = (array) Arr::get($payload, 'meta', []);
        $threshold = $this->pricing->videoViewThresholdRatio();
        $maxDurationSeconds = $this->pricing->maxVideoDurationSeconds();

        $watchRatio = Arr::get($meta, 'watch_ratio');
        if (! is_numeric($watchRatio)) {
            $watchSeconds = Arr::get($meta, 'watch_seconds', Arr::get($meta, 'view_duration'));
            $videoDuration = Arr::get($meta, 'video_duration_seconds', $delivery->creative?->duration_seconds);

            if (is_numeric($watchSeconds) && is_numeric($videoDuration) && (float) $videoDuration > 0) {
                $effectiveDuration = min((float) $videoDuration, $maxDurationSeconds);
                $watchRatio = (float) $watchSeconds / max(1.0, $effectiveDuration);
            }
        } else {
            $watchRatio = (float) $watchRatio;
        }

        if (! is_numeric($watchRatio)) {
            return false;
        }

        return min(1.0, max(0.0, (float) $watchRatio)) >= $threshold;
    }

    private function isIdempotencyConflict(QueryException $exception): bool
    {
        $sqlState = (string) ($exception->errorInfo[0] ?? '');
        $driverCode = (string) ($exception->errorInfo[1] ?? '');
        $message = strtolower($exception->getMessage());

        $isUniqueViolation = in_array($sqlState, ['23000', '23505'], true)
            || in_array($driverCode, ['1062', '19'], true);

        return $isUniqueViolation && str_contains($message, 'idempotency_key');
    }

    private function commitReservedChargeForDelivery(AdDelivery $delivery): ?float
    {
        $deliveryId = (string) $delivery->id;

        $reserveEntry = AdWalletLedger::query()
            ->where('reference_type', 'rewarded_delivery')
            ->where('reference_id', $deliveryId)
            ->where('entry_type', 'reserve')
            ->latest('created_at')
            ->first();
        if (! $reserveEntry) {
            return null;
        }

        $finalizedByRelease = AdWalletLedger::query()
            ->where('reference_type', 'rewarded_delivery')
            ->where('reference_id', $deliveryId)
            ->where('entry_type', 'release')
            ->exists();
        if ($finalizedByRelease) {
            return null;
        }

        $wallet = $delivery->campaign?->account?->wallet;
        if (! $wallet || (string) $wallet->id !== (string) $reserveEntry->ad_wallet_id) {
            return null;
        }

        $amount = max(0.001, (float) $reserveEntry->amount);
        $this->walletLedger->commit(
            $wallet,
            $amount,
            'rewarded_delivery',
            $deliveryId,
            'rewarded-reserve-commit-' . $deliveryId,
        );

        return $amount;
    }

    private function completeCampaignIfGoalReached(AdCampaign $campaign): void
    {
        // Campaigns should stay active while there is funded budget left.
        // The billing block above marks campaigns completed only when spend reaches budget.
        return;
    }

    private function campaignActionTarget(AdCampaign $campaign): ?int
    {
        if ($campaign->billing_model === 'cpc') {
            $bidAmount = (float) $campaign->bid_amount;
            if ($bidAmount <= 0) {
                return null;
            }

            return max(1, (int) floor((float) $campaign->budget_total / $bidAmount));
        }

        $dailyTargetViews = (int) ($campaign->daily_target_views ?? 0);
        if ($dailyTargetViews <= 0) {
            return null;
        }

        return $dailyTargetViews * $this->campaignDurationDays($campaign);
    }

    private function campaignCompletedActionCount(AdCampaign $campaign): int
    {
        $eventTypes = $campaign->billing_model === 'cpc'
            ? ['click']
            : ($campaign->pricing_media_type === 'video' || $campaign->billing_model === 'cpv'
                ? ['view_complete']
                : ['impression']);

        return (int) AdEvent::query()
            ->where('campaign_id', $campaign->id)
            ->whereIn('event_type', $eventTypes)
            ->where('invalidated', false)
            ->count();
    }

    private function campaignDurationDays(AdCampaign $campaign): int
    {
        $start = $campaign->start_at ?? now();
        $end = $campaign->end_at ?? $start->copy()->addDay();
        $seconds = max(1, $end->getTimestamp() - $start->getTimestamp());

        return max(1, (int) ceil($seconds / 86400));
    }
}
