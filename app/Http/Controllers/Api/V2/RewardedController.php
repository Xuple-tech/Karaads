<?php

namespace App\Http\Controllers\Api\V2;

use App\Domain\AdsV2\Services\AdPricingService;
use App\Domain\AdsV2\Services\EventIngestionService;
use App\Domain\AdsV2\Services\RewardedService;
use App\Domain\AdsV2\Services\WalletLedgerService;
use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdCreative;
use App\Models\AdsV2\AdDelivery;
use App\Models\AdsV2\AdEvent;
use App\Models\AdsV2\AdPayoutItem;
use App\Models\AdsV2\AdPlacement;
use App\Models\AdsV2\AdWallet;
use App\Models\AdsV2\AdWalletLedger;
use App\Models\User;
use App\Models\UserWallet;
use App\Services\InterfaceApiService;
use App\Support\CountryCurrency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class RewardedController extends Controller
{
    private const RESERVATION_REFERENCE_TYPE = 'rewarded_delivery';
    private const RESERVATION_HOLD_MINUTES = 15;
    private const REWARD_UNAVAILABLE_BLOCK_HOURS = 6;
    private const ACTIVE_WATCHER_LEASE_SECONDS = 120;
    private const WITHDRAWAL_LOCK_SECONDS = 90;
    private const WITHDRAWAL_MIN_AMOUNT = 1000.0;
    private const WITHDRAWAL_DAILY_MAX = 5000.0;
    private const WITHDRAWAL_FLAT_FEE = 50.0;

    public function __construct(
        private readonly RewardedService $rewardedService,
        private readonly EventIngestionService $eventIngestionService,
        private readonly AdPricingService $pricing,
        private readonly WalletLedgerService $walletLedgerService,
        private readonly InterfaceApiService $interfaceApiService,
    ) {}

    public function queue(Request $request): JsonResponse
    {
        $limit = max(1, (int) $request->query('limit', 100));
        $userId = $request->user()->id;
        if (! $this->acquireActiveWatcherLease($request, $userId)) {
            return response()->json([
                'message' => 'Rewarded ads are active on another tab or device for this account.',
                'reason' => 'active_session_conflict',
            ], 409);
        }

        $now = now();
        $this->releaseExpiredReservationsForUser($userId, $now);

        $placement = AdPlacement::firstOrCreate([
            'surface' => 'moments',
            'slot' => 'rewarded',
        ], [
            'name' => 'Rewarded Moments Slot',
            'source_type' => 'internal',
            'status' => true,
        ]);

        $queue = [];
        $temporarilyBlockedDeliveries = AdDelivery::query()
            ->where('viewer_user_id', $userId)
            ->where('blocked_reason', 'reward_unavailable')
            ->where('invalidated_at', '>=', $now->copy()->subHours(self::REWARD_UNAVAILABLE_BLOCK_HOURS))
            ->get(['creative_id', 'campaign_id']);
        $blockedCreativeIds = $temporarilyBlockedDeliveries
            ->pluck('creative_id')
            ->filter(fn ($id) => is_string($id) && $id !== '')
            ->unique()
            ->values()
            ->all();
        $blockedCampaignIds = $temporarilyBlockedDeliveries
            ->pluck('campaign_id')
            ->filter(fn ($id) => is_string($id) && $id !== '')
            ->values()
            ->all();
        $blockedCampaignLookup = array_fill_keys($blockedCampaignIds, true);
        $blockedCreativeLookup = array_fill_keys($blockedCreativeIds, true);

        $usedCreativeIds = [];
        $existingDeliveries = AdDelivery::query()
            ->with('creative.campaign.account.wallet')
            ->where('placement_id', $placement->id)
            ->where('viewer_user_id', $userId)
            ->where('source_type', 'internal')
            ->where('status', 'served')
            ->whereNull('blocked_reason')
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', $now))
            ->orderByDesc('served_at')
            ->limit($limit * 5)
            ->get();

        if ($existingDeliveries->isNotEmpty()) {
            $completedDeliveryIds = AdEvent::query()
                ->where('viewer_user_id', $userId)
                ->where('event_type', 'view_complete')
                ->whereIn('delivery_id', $existingDeliveries->pluck('id')->all())
                ->pluck('delivery_id')
                ->map(fn ($id) => (string) $id)
                ->all();
            $completedLookup = array_fill_keys($completedDeliveryIds, true);

            foreach ($existingDeliveries as $delivery) {
                if (isset($completedLookup[(string) $delivery->id])) {
                    continue;
                }

                $campaign = $delivery->campaign;
                if (! $campaign instanceof AdCampaign) {
                    continue;
                }
                $creative = $delivery->creative;
                if (! $campaign->isAdminApproved() || ! $creative instanceof AdCreative || ! $creative->isAdminApproved()) {
                    $delivery->status = 'blocked';
                    $delivery->blocked_reason = 'approval_required';
                    $delivery->invalidated_at = $now;
                    $delivery->save();
                    continue;
                }
                if (isset($blockedCampaignLookup[(string) $campaign->id])) {
                    continue;
                }

                $creativeId = (string) ($delivery->creative_id ?? '');
                if ($creativeId !== '' && isset($blockedCreativeLookup[$creativeId])) {
                    continue;
                }
                if (! $this->ensureDeliveryReservation($delivery)) {
                    $delivery->status = 'blocked';
                    $delivery->blocked_reason = 'reward_unavailable';
                    $delivery->invalidated_at = $now;
                    $delivery->save();
                    continue;
                }

                $queueItem = $this->queueItemFromDelivery($delivery);
                if (! $queueItem) {
                    continue;
                }

                if ($creativeId !== '') {
                    $usedCreativeIds[$creativeId] = true;
                }

                $queue[] = $queueItem;
                if (count($queue) >= $limit) {
                    break;
                }
            }
        }

        $remainingLimit = $limit - count($queue);
        if ($remainingLimit > 0) {
            $excludedCreativeIds = array_values(array_unique(array_merge(
                array_keys($usedCreativeIds),
                $blockedCreativeIds,
            )));

            $creatives = AdCreative::query()
                ->with('campaign.account.wallet')
                ->where('source_type', 'internal')
                ->adminApproved()
                ->where('status', 'active')
                ->whereIn('media_type', ['video', 'image'])
                ->whereNotNull('media_url')
                ->where('media_url', '!=', '')
                ->whereHas('campaign', function ($query) {
                    $query->adminApproved()
                        ->where('status', 'active');
                })
                ->when($blockedCampaignIds !== [], function ($query) use ($blockedCampaignIds) {
                    $query->whereNotIn('campaign_id', $blockedCampaignIds);
                })
                ->when($excludedCreativeIds !== [], function ($query) use ($excludedCreativeIds) {
                    $query->whereNotIn('id', $excludedCreativeIds);
                })
                ->inRandomOrder()
                ->limit(max($remainingLimit * 4, $remainingLimit))
                ->get()
                ->filter(function (AdCreative $creative) {
                    $campaign = $creative->campaign;
                    if (! $campaign instanceof AdCampaign) {
                        return false;
                    }

                    return $this->campaignHasRewardCapacity($campaign, $creative->media_type);
                })
                ->values();

            $videoCreatives = $creatives->filter(fn (AdCreative $creative) => $creative->media_type === 'video')->values();
            $imageCreatives = $creatives->filter(fn (AdCreative $creative) => $creative->media_type === 'image')->values();

            $orderedCreatives = collect();
            while ($orderedCreatives->count() < $remainingLimit && (! $videoCreatives->isEmpty() || ! $imageCreatives->isEmpty())) {
                if (! $imageCreatives->isEmpty()) {
                    $orderedCreatives->push($imageCreatives->shift());
                }

                if ($orderedCreatives->count() >= $remainingLimit) {
                    break;
                }

                if (! $videoCreatives->isEmpty()) {
                    $orderedCreatives->push($videoCreatives->shift());
                }
            }

            if ($orderedCreatives->count() < $remainingLimit) {
                $remaining = $creatives
                    ->reject(fn (AdCreative $creative) => $orderedCreatives->contains('id', $creative->id))
                    ->take($remainingLimit - $orderedCreatives->count());
                $orderedCreatives = $orderedCreatives->concat($remaining);
            }

            foreach ($orderedCreatives as $creative) {
                $campaign = $creative->campaign;
                if (! $campaign instanceof AdCampaign) {
                    continue;
                }

                $delivery = AdDelivery::create([
                    'placement_id' => $placement->id,
                    'campaign_id' => $campaign->id,
                    'creative_id' => $creative->id,
                    'viewer_user_id' => $userId,
                    'source_type' => $creative->source_type,
                    'status' => 'served',
                    'score' => 1,
                    'session_id' => $request->session()->getId(),
                    'fingerprint' => hash('sha256', $request->session()->getId() . '|' . $request->ip()),
                    'served_at' => now(),
                    'expires_at' => now()->addMinutes(self::RESERVATION_HOLD_MINUTES),
                ]);

                if (! $this->ensureDeliveryReservation($delivery->setRelation('creative', $creative)->setRelation('campaign', $campaign))) {
                    $delivery->status = 'blocked';
                    $delivery->blocked_reason = 'reward_unavailable';
                    $delivery->invalidated_at = now();
                    $delivery->save();
                    continue;
                }

                $signature = hash_hmac('sha256', $delivery->id . '|' . $delivery->session_id, (string) config('app.key'));
                $delivery->signature = $signature;
                $delivery->save();

                $queueItem = $this->queueItemFromDelivery($delivery->setRelation('creative', $creative));
                if (! $queueItem) {
                    continue;
                }

                $queue[] = $queueItem;
                if (count($queue) >= $limit) {
                    break;
                }
            }
        }

        return response()->json([
            'ads' => $queue,
            'count' => count($queue),
        ]);
    }

    private function queueItemFromDelivery(AdDelivery $delivery): ?array
    {
        $delivery->loadMissing('creative.campaign');
        $creative = $delivery->creative;
        if (! $creative instanceof AdCreative || ! $creative->campaign instanceof AdCampaign) {
            return null;
        }

        $signature = (string) ($delivery->signature ?: '');
        if ($signature === '') {
            $signature = hash_hmac('sha256', $delivery->id . '|' . $delivery->session_id, (string) config('app.key'));
            $delivery->signature = $signature;
            $delivery->save();
        }

        $normalizedMediaType = $this->pricing->normalizeMediaType($creative->media_type);
        $configuredMaxVideoDuration = $this->pricing->maxVideoDurationSeconds();
        $creativeDuration = (float) ($creative->duration_seconds ?: 0);
        $effectiveVideoDuration = $creativeDuration > 0
            ? min($creativeDuration, $configuredMaxVideoDuration)
            : $configuredMaxVideoDuration;
        $requiredViewSeconds = $normalizedMediaType === 'video'
            ? max(30, (int) ceil($effectiveVideoDuration * $this->pricing->videoViewThresholdRatio()))
            : 30;

        return [
            'delivery_id' => $delivery->id,
            'signature' => $signature,
            'session_id' => $delivery->session_id,
            'title' => $creative->title,
            'description' => $creative->description,
            'media_url' => $creative->media_url,
            'media_type' => $creative->media_type,
            'duration' => $creativeDuration > 0 ? (int) round($creativeDuration) : null,
            'required_view_seconds' => $requiredViewSeconds,
            'ad_type' => 'rewarded',
            'reward' => (float) max(0.01, $this->pricing->viewerRewardForMediaType($creative->media_type)),
            'target_url' => $creative->target_url,
        ];
    }

    public function complete(Request $request, string $deliveryId): JsonResponse
    {
        $validated = $request->validate([
            'signature' => 'required|string|max:255',
            'view_duration' => 'required|integer|min:1|max:3600',
            'meta' => 'nullable|array',
        ]);

        if ((int) $validated['view_duration'] < 30) {
            return response()->json([
                'message' => 'Rewarded ad must be watched for at least 30 seconds.',
                'required_view_seconds' => 30,
            ], 422);
        }

        $delivery = AdDelivery::findOrFail($deliveryId);

        $expectedSignature = hash_hmac('sha256', $delivery->id . '|' . $delivery->session_id, (string) config('app.key'));
        if (! hash_equals($expectedSignature, $validated['signature'])) {
            return response()->json(['message' => 'Invalid signature.'], 422);
        }

        $userId = $request->user()->id;
        if (! $this->acquireActiveWatcherLease($request, $userId)) {
            return response()->json([
                'message' => 'Rewarded ads are active on another tab or device for this account.',
                'reason' => 'active_session_conflict',
            ], 409);
        }

        if ($delivery->viewer_user_id && $delivery->viewer_user_id !== $userId) {
            return response()->json(['message' => 'Unauthorized delivery access.'], 403);
        }

        if ((string) $delivery->session_id !== (string) $request->session()->getId()) {
            return response()->json([
                'message' => 'Delivery session mismatch. Please refresh rewarded ads queue on this device.',
                'reason' => 'session_mismatch',
            ], 422);
        }

        $requestFingerprint = hash('sha256', (string) $request->session()->getId() . '|' . (string) $request->ip());
        if ((string) $delivery->fingerprint !== $requestFingerprint) {
            return response()->json([
                'message' => 'Delivery fingerprint mismatch. Please refresh rewarded ads queue on this device.',
                'reason' => 'fingerprint_mismatch',
            ], 422);
        }

        if ($delivery->expires_at && now()->greaterThan($delivery->expires_at)) {
            return response()->json(['message' => 'Delivery has expired.'], 422);
        }

        if ($delivery->status !== 'served') {
            return response()->json(['message' => 'Delivery is no longer eligible for completion.'], 422);
        }

        if (! $this->rewardedService->canComplete($deliveryId, $userId)) {
            return response()->json(['message' => 'Reward completion already recorded for this delivery.'], 422);
        }

        $delivery->loadMissing('creative');

        if (! $this->ensureDeliveryReservation($delivery)) {
            $delivery->status = 'blocked';
            $delivery->blocked_reason = 'reward_unavailable';
            $delivery->invalidated_at = now();
            $delivery->save();

            return response()->json([
                'message' => 'Completion recorded, but reward could not be credited.',
                'reason' => 'reward_unavailable',
            ], 422);
        }

        $watchSeconds = (float) $validated['view_duration'];
        $creativeDuration = (float) ($delivery->creative?->duration_seconds ?: 0);
        $maxVideoDuration = $this->pricing->maxVideoDurationSeconds();
        $videoDuration = $creativeDuration > 0
            ? min($creativeDuration, $maxVideoDuration)
            : min($watchSeconds, $maxVideoDuration);
        $watchRatio = $videoDuration > 0
            ? min(1.0, max(0.0, $watchSeconds / $videoDuration))
            : 1.0;

        $event = $this->eventIngestionService->ingest([
            'delivery_id' => $deliveryId,
            'event_type' => 'view_complete',
            'occurred_at' => now(),
            'session_id' => $delivery->session_id,
            'fingerprint' => $delivery->fingerprint,
            'idempotency_key' => 'rewarded-complete-' . $deliveryId . '-' . $userId,
            'meta' => array_merge($validated['meta'] ?? [], [
                'view_duration' => $validated['view_duration'],
                'watch_seconds' => $watchSeconds,
                'video_duration_seconds' => $videoDuration,
                'watch_ratio' => $watchRatio,
            ]),
        ], $userId, $request->ip(), $request->userAgent());

        $rewardCredited = AdPayoutItem::query()
            ->where('reference_type', 'ad_events_v2')
            ->where('reference_id', $event->id)
            ->where('user_id', $userId)
            ->where('source', 'rewarded')
            ->exists();

        if (! $rewardCredited) {
            $reason = $event->invalidated
                ? ($event->invalid_reason ?: 'fraud_check_failed')
                : 'reward_unavailable';
            $this->releaseDeliveryReservation($delivery, $reason);
            $delivery->status = 'blocked';
            $delivery->blocked_reason = $reason;
            $delivery->invalidated_at = now();
            $delivery->save();

            return response()->json([
                'message' => 'Completion recorded, but reward could not be credited.',
                'event_id' => $event->id,
                'reason' => $reason,
            ], 422);
        }

        $wallet = UserWallet::query()->where('user_id', $userId)->first();
        $user = $request->user();

        return response()->json([
            'message' => 'Rewarded completion recorded.',
            'event_id' => $event->id,
            'earnings' => $this->rewardedEarningsPayload($this->rewardedService->earningsSummary($userId), $user),
            'wallet' => $this->displayWalletPayload($user, $wallet),
        ], 201);
    }

    private function reservationIdempotencyKey(string $deliveryId): string
    {
        return 'rewarded-reserve-' . $deliveryId;
    }

    private function reservationReleaseIdempotencyKey(string $deliveryId): string
    {
        return 'rewarded-reserve-release-' . $deliveryId;
    }

    private function reservationIsFinalized(string $deliveryId): bool
    {
        return AdWalletLedger::query()
            ->where('reference_type', self::RESERVATION_REFERENCE_TYPE)
            ->where('reference_id', $deliveryId)
            ->whereIn('entry_type', ['commit', 'release'])
            ->exists();
    }

    private function activeReservationEntry(string $deliveryId): ?AdWalletLedger
    {
        $entry = AdWalletLedger::query()
            ->where('reference_type', self::RESERVATION_REFERENCE_TYPE)
            ->where('reference_id', $deliveryId)
            ->where('entry_type', 'reserve')
            ->latest('created_at')
            ->first();

        if (! $entry) {
            return null;
        }

        if ($this->reservationIsFinalized($deliveryId)) {
            return null;
        }

        return $entry;
    }

    private function ensureDeliveryReservation(AdDelivery $delivery): bool
    {
        $delivery->loadMissing('campaign.account.wallet', 'creative');
        $campaign = $delivery->campaign;
        if (! $campaign instanceof AdCampaign || ! $campaign->account?->wallet || ! $delivery->creative instanceof AdCreative) {
            return false;
        }

        $deliveryId = (string) $delivery->id;
        if ($this->reservationIsFinalized($deliveryId)) {
            return false;
        }

        if ($this->activeReservationEntry($deliveryId)) {
            return true;
        }

        $amount = max(0.001, (float) $this->pricing->chargeRateForMediaType($delivery->creative->media_type));

        try {
            return (bool) DB::transaction(function () use ($campaign, $amount, $deliveryId) {
                $wallet = AdWallet::query()
                    ->whereKey($campaign->account?->wallet?->id)
                    ->lockForUpdate()
                    ->first();
                if (! $wallet) {
                    return false;
                }

                if ($this->reservationIsFinalized($deliveryId)) {
                    return false;
                }

                if ($this->activeReservationEntry($deliveryId)) {
                    return true;
                }

                $this->walletLedgerService->reserve(
                    $wallet,
                    $amount,
                    self::RESERVATION_REFERENCE_TYPE,
                    $deliveryId,
                    $this->reservationIdempotencyKey($deliveryId),
                );

                return true;
            });
        } catch (RuntimeException) {
            return false;
        }
    }

    private function releaseDeliveryReservation(AdDelivery $delivery, string $reason): void
    {
        $deliveryId = (string) $delivery->id;
        $reservation = $this->activeReservationEntry($deliveryId);
        if (! $reservation) {
            return;
        }

        DB::transaction(function () use ($reservation, $deliveryId, $reason) {
            $wallet = AdWallet::query()
                ->whereKey($reservation->ad_wallet_id)
                ->lockForUpdate()
                ->first();
            if (! $wallet) {
                return;
            }

            $reservationMeta = is_array($reservation->meta) ? $reservation->meta : [];
            $fromCash = is_numeric($reservationMeta['from_cash'] ?? null)
                ? max(0.0, (float) $reservationMeta['from_cash'])
                : (float) $reservation->amount;
            $fromCredit = is_numeric($reservationMeta['from_credit'] ?? null)
                ? max(0.0, (float) $reservationMeta['from_credit'])
                : max(0.0, (float) $reservation->amount - $fromCash);

            $this->walletLedgerService->release(
                $wallet,
                (float) $reservation->amount,
                self::RESERVATION_REFERENCE_TYPE,
                $deliveryId,
                $this->reservationReleaseIdempotencyKey($deliveryId),
                [
                    'from_cash' => $fromCash,
                    'from_credit' => $fromCredit,
                    'reason' => $reason,
                ],
            );
        });
    }

    private function releaseExpiredReservationsForUser(string $userId, \Illuminate\Support\Carbon $now): void
    {
        $expiredDeliveries = AdDelivery::query()
            ->where('viewer_user_id', $userId)
            ->where('status', 'served')
            ->whereNull('blocked_reason')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $now)
            ->limit(50)
            ->get();

        foreach ($expiredDeliveries as $delivery) {
            $this->releaseDeliveryReservation($delivery, 'delivery_expired');
            $delivery->status = 'expired';
            $delivery->blocked_reason = 'expired';
            $delivery->invalidated_at = $now;
            $delivery->save();
        }
    }

    public function earnings(Request $request): JsonResponse
    {
        return response()->json(
            $this->rewardedEarningsPayload(
                $this->rewardedService->earningsSummary($request->user()->id),
                $request->user(),
            ),
        );
    }

    public function transactions(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $transactions = AdPayoutItem::query()
            ->where('user_id', $userId)
            ->where('source', 'rewarded')
            ->whereNotNull('meta->withdrawal_reference')
            ->orderByDesc('updated_at')
            ->get()
            ->groupBy(fn (AdPayoutItem $item) => (string) (is_array($item->meta) ? ($item->meta['withdrawal_reference'] ?? '') : ''))
            ->filter(fn ($items, $reference) => $reference !== '')
            ->map(function ($items, string $reference) {
                /** @var \Illuminate\Support\Collection<int, AdPayoutItem> $items */
                $latest = $items->sortByDesc('updated_at')->first();
                $meta = $latest && is_array($latest->meta) ? $latest->meta : [];
                $transfer = is_array($meta['withdrawal_response'] ?? null) ? $meta['withdrawal_response'] : null;
                $status = $this->withdrawalHistoryStatus($latest, $meta, $transfer);
                if ($status === null) {
                    return null;
                }

                return [
                    'reference' => $reference,
                    'amount' => round((float) $items->sum('amount'), 2),
                    'status' => $status,
                    'account_number' => (string) ($meta['account_number'] ?? ''),
                    'bank_code' => (string) ($meta['bank_code'] ?? ''),
                    'provider_message' => (string) ($transfer['message'] ?? ''),
                    'provider_reference' => (string) ($transfer['refrence'] ?? $transfer['reference'] ?? ''),
                    'created_at' => $items->sortBy('created_at')->first()?->created_at?->toISOString(),
                    'updated_at' => $items->sortByDesc('updated_at')->first()?->updated_at?->toISOString(),
                ];
            })
            ->filter()
            ->values();

        return response()->json([
            'transactions' => $transactions,
        ]);
    }

    public function bankList(): JsonResponse
    {
        try {
            $banks = $this->interfaceApiService->bankList();
        } catch (\RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        return response()->json($banks);
    }

    public function resolveBankAccountName(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'account_number' => ['required', 'string', 'size:10', 'regex:/^[0-9]+$/'],
            'bank_code' => ['required', 'string', 'max:20', 'regex:/^[0-9]+$/'],
        ]);

        try {
            $result = $this->interfaceApiService->resolveAccountName(
                $validated['account_number'],
                $validated['bank_code'],
            );
        } catch (\RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        $accountName = $this->extractResolvedAccountName($result);

        if ($accountName === '') {
            return response()->json([
                'message' => 'Unable to verify this account number. Please check the bank and account number.',
                'data' => [
                    'account_number' => $validated['account_number'],
                    'bank_code' => $validated['bank_code'],
                    'account_name' => '',
                    'verified' => false,
                ],
            ], 422);
        }

        return response()->json([
            'data' => [
                'account_number' => $validated['account_number'],
                'bank_code' => $validated['bank_code'],
                'account_name' => $accountName,
                'verified' => true,
                'raw' => $result,
            ],
        ]);
    }

    public function withdraw(Request $request): JsonResponse
    {
        // MAINTENANCE_PAUSE_START
        if (\Cache::store('database')->get('withdrawals_paused', false)) {
            return response()->json([
                'message' => 'Withdrawals are temporarily unavailable. Your balance is safe — please try again in a few minutes.',
                'reason' => 'bank_maintenance',
            ], 503);
        }
        // MAINTENANCE_PAUSE_END
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'account_number' => ['required', 'string', 'max:20', 'regex:/^[0-9]+$/'],
            'bank_code' => ['required', 'string', 'max:20', 'regex:/^[0-9]+$/'],
            'narration' => 'nullable|string|max:255',
            'idempotency_key' => 'nullable|string|max:255',
        ]);

        $userId = $request->user()->id;
        $amount = round((float) $validated['amount'], 2);
        $feeAmount = self::WITHDRAWAL_FLAT_FEE;
        $netAmount = round($amount - $feeAmount, 2);
        $narration = trim((string) (($validated['narration'] ?? null) ?: 'Karaads rewarded earnings withdrawal'));
        $idempotencyKey = $this->resolveWithdrawalIdempotencyKey($request, $validated);
        $requestFingerprint = $this->withdrawalRequestFingerprint(
            $amount,
            $validated['account_number'],
            $validated['bank_code'],
            $narration,
        );
        $cache = Cache::store('database');

        if ($idempotencyKey !== null) {
            $existingResponse = $this->existingWithdrawalResponse($userId, $idempotencyKey, $requestFingerprint);
            if ($existingResponse instanceof JsonResponse) {
                return $existingResponse;
            }
        }

        // Global sequential gate: only one withdrawal sent to provider at a time
        $globalGateKey = 'rewarded-withdraw-global-gate';
        if (! $cache->add($globalGateKey, $userId, now()->addSeconds(self::WITHDRAWAL_LOCK_SECONDS))) {
            return response()->json([
                'message' => 'Another withdrawal is being processed. Please wait a moment and try again.',
                'reason' => 'withdrawal_in_progress',
            ], 409);
        }

        $lockKey = $this->withdrawalLockKey($userId);
        if (! $cache->add($lockKey, $idempotencyKey ?: (string) Str::uuid(), now()->addSeconds(self::WITHDRAWAL_LOCK_SECONDS))) {
            $cache->forget($globalGateKey);
            return response()->json([
                'message' => 'Another withdrawal request is already being processed for this account.',
                'reason' => 'withdrawal_in_progress',
            ], 409);
        }

        // Block withdrawal if kwatibank float is below ₦5,000
        try {
            $interfaceBalance = Cache::remember('interface_available_balance', 60, fn () => $this->interfaceApiService->balance());
            if (($interfaceBalance['available_balance'] ?? 0) < 5000) {
                $cache->forget($globalGateKey);
                $cache->forget($lockKey);
                return response()->json([
                    'message' => 'Withdrawals are temporarily unavailable. Your balance is safe — please try again later.',
                    'reason' => 'insufficient_float',
                ], 503);
            }
        } catch (\Throwable) {
            $cache->forget($globalGateKey);
            $cache->forget($lockKey);
            return response()->json([
                'message' => 'Withdrawals are temporarily unavailable. Your balance is safe — please try again in a few minutes.',
                'reason' => 'bank_maintenance',
            ], 503);
        }

        $selectedIds = [];
        $selectedAmount = 0.0;
        $reference = null;
        try {
            $reference = $this->buildWithdrawalReference($idempotencyKey);

            DB::transaction(function () use (
                $userId,
                $amount,
                $feeAmount,
                $netAmount,
                &$selectedIds,
                &$selectedAmount,
                $reference,
                $validated,
                $idempotencyKey,
                $requestFingerprint
            ) {
                $wallet = UserWallet::query()->lockForUpdate()->firstOrCreate(
                    ['user_id' => $userId],
                    [
                        'balance' => 0,
                        'total_earned' => 0,
                        'total_withdrawn' => 0,
                        'pending_withdrawal' => 0,
                        'currency' => 'NGN',
                        'is_active' => true,
                        'min_payout_amount' => 100,
                    ],
                );

                if (! $wallet->is_active) {
                    abort(422, 'Wallet is not active for withdrawals.');
                }

                $minimumPayout = max(self::WITHDRAWAL_MIN_AMOUNT, (float) $wallet->min_payout_amount);
                if ($minimumPayout > 0 && $amount + 0.000001 < $minimumPayout) {
                    abort(422, 'Withdrawal amount is below the minimum payout amount.');
                }

                if ($netAmount <= 0) {
                    abort(422, 'Withdrawal amount must be greater than the NGN 50 withdrawal charge.');
                }

                $todaysWithdrawals = $this->todaysRewardedWithdrawalAmount($userId);
                if ($todaysWithdrawals + $amount > self::WITHDRAWAL_DAILY_MAX + 0.000001) {
                    abort(422, 'Withdrawal amount exceeds the daily withdrawal limit.');
                }

                if ((float) $wallet->balance + 0.000001 < $amount) {
                    abort(422, 'Insufficient wallet balance.');
                }

                $items = AdPayoutItem::query()
                    ->where('user_id', $userId)
                    ->where('source', 'rewarded')
                    ->where('status', 'completed')
                    ->whereNull('meta->withdrawal_reference')
                    ->orderBy('created_at')
                    ->lockForUpdate()
                    ->get();

                $running = 0.0;
                foreach ($items as $item) {
                    if ($running >= $amount) {
                        break;
                    }
                    $meta = is_array($item->meta) ? $item->meta : [];
                    $itemAmount = (float) $item->amount;
                    $remainingNeeded = round($amount - $running, 6);

                    if ($itemAmount - $remainingNeeded > 0.000001) {
                        $processingMeta = $meta;
                        $processingMeta['withdrawal_reference'] = $reference;
                        $processingMeta['withdrawal_provider'] = 'interface_api';
                        $processingMeta['withdrawal_execution_mode'] = 'synchronous';
                        $processingMeta['withdrawal_idempotency_key'] = $idempotencyKey;
                        $processingMeta['withdrawal_request_fingerprint'] = $requestFingerprint;
                        $processingMeta['withdrawal_requested_at'] = now()->toIso8601String();
                        $processingMeta['bank_code'] = $validated['bank_code'];
                        $processingMeta['account_number'] = $validated['account_number'];
                        $processingMeta['withdrawal_gross_amount'] = $amount;
                        $processingMeta['withdrawal_fee_amount'] = $feeAmount;
                        $processingMeta['withdrawal_net_amount'] = $netAmount;

                        $splitItem = AdPayoutItem::create([
                            'batch_id' => $item->batch_id,
                            'user_id' => $item->user_id,
                            'source' => $item->source,
                            'amount' => $remainingNeeded,
                            'status' => 'processing',
                            'reference_type' => $item->reference_type,
                            'reference_id' => $item->reference_id,
                            'meta' => $processingMeta,
                            'paid_at' => $item->paid_at,
                        ]);

                        $selectedIds[] = $splitItem->id;
                        $item->amount = round($itemAmount - $remainingNeeded, 6);
                        $item->save();
                        $running += $remainingNeeded;
                        break;
                    }

                    $running += $itemAmount;
                    $selectedIds[] = $item->id;
                    $meta['withdrawal_reference'] = $reference;
                    $meta['withdrawal_provider'] = 'interface_api';
                    $meta['withdrawal_execution_mode'] = 'synchronous';
                    $meta['withdrawal_idempotency_key'] = $idempotencyKey;
                    $meta['withdrawal_request_fingerprint'] = $requestFingerprint;
                    $meta['withdrawal_requested_at'] = now()->toIso8601String();
                    $meta['bank_code'] = $validated['bank_code'];
                    $meta['account_number'] = $validated['account_number'];
                    $meta['withdrawal_gross_amount'] = $amount;
                    $meta['withdrawal_fee_amount'] = $feeAmount;
                    $meta['withdrawal_net_amount'] = $netAmount;
                    $item->status = 'processing';
                    $item->meta = $meta;
                    $item->save();
                }

                if ($running + 0.000001 < $amount) {
                    $remainingNeeded = round($amount - $running, 6);

                    $syntheticItem = AdPayoutItem::create([
                        'user_id' => $userId,
                        'source' => 'rewarded',
                        'amount' => $remainingNeeded,
                        'status' => 'processing',
                        'reference_type' => 'wallet_withdrawal',
                        'reference_id' => $reference,
                        'meta' => [
                            'withdrawal_reference' => $reference,
                            'withdrawal_provider' => 'interface_api',
                            'withdrawal_execution_mode' => 'synchronous',
                            'withdrawal_idempotency_key' => $idempotencyKey,
                            'withdrawal_request_fingerprint' => $requestFingerprint,
                            'withdrawal_requested_at' => now()->toIso8601String(),
                            'bank_code' => $validated['bank_code'],
                            'account_number' => $validated['account_number'],
                            'withdrawal_gross_amount' => $amount,
                            'withdrawal_fee_amount' => $feeAmount,
                            'withdrawal_net_amount' => $netAmount,
                            'synthetic_withdrawal_allocation' => true,
                        ],
                    ]);

                    $selectedIds[] = $syntheticItem->id;
                    $running += $remainingNeeded;
                }

                if ($running + 0.000001 < $amount) {
                    abort(422, 'Unable to match withdrawal amount with available balance.');
                }

                $selectedAmount = round($running, 2);
                $wallet->balance = (float) $wallet->balance - $selectedAmount;
                $wallet->pending_withdrawal = (float) $wallet->pending_withdrawal + $selectedAmount;
                $wallet->currency = strtoupper((string) ($wallet->currency ?: 'NGN'));
                if ($wallet->currency === '' || $wallet->currency === 'USD') {
                    $wallet->currency = 'NGN';
                }
                $wallet->save();
            });

            $payload = $this->interfaceApiService->buildTransferPayload(
                $validated['account_number'],
                $validated['bank_code'],
                $netAmount,
                $narration,
                $reference,
            );

            $transfer = $this->interfaceApiService->bankTransfer($payload);
        } catch (HttpExceptionInterface $exception) {
            return response()->json(['message' => $exception->getMessage()], $exception->getStatusCode());
        } catch (\InvalidArgumentException $exception) {
            if ($reference && ! empty($selectedIds) && $selectedAmount > 0) {
                return $this->returnSelectedWithdrawalToWallet(
                    $userId,
                    $reference,
                    $selectedIds,
                    $selectedAmount,
                    $this->withdrawalFailurePayload($reference, $exception->getMessage(), 422),
                    'Withdrawal could not be completed. The money has been returned to your Kara Ads balance.',
                    422,
                );
            }

            DB::transaction(function () use ($selectedIds, $selectedAmount, $userId, $reference, $exception) {
                if (! empty($selectedIds)) {
                    $items = AdPayoutItem::query()
                        ->whereIn('id', $selectedIds)
                        ->get();

                    foreach ($items as $item) {
                        $meta = is_array($item->meta) ? $item->meta : [];
                        $meta['withdrawal_response'] = $this->withdrawalFailurePayload(
                            $reference,
                            $exception->getMessage(),
                            422,
                        );
                        $meta['withdrawal_status'] = 'returned';
                        $meta['withdrawal_failed'] = true;
                        $meta['withdrawal_returned_at'] = now()->toIso8601String();
                        $meta['withdrawal_return_reason'] = $exception->getMessage();
                        $meta['failed_withdrawal_reference'] = $reference;
                        $item->status = 'completed';
                        $item->meta = $meta;
                        $item->save();
                    }
                }

                if ($selectedAmount > 0) {
                    $wallet = UserWallet::query()
                        ->where('user_id', $userId)
                        ->lockForUpdate()
                        ->first();
                    if ($wallet) {
                        $wallet->balance = (float) $wallet->balance + $selectedAmount;
                        $wallet->pending_withdrawal = max(0, (float) $wallet->pending_withdrawal - $selectedAmount);
                        $wallet->save();
                    }
                }
            });

            return response()->json(['message' => $exception->getMessage()], 422);
        } catch (\RuntimeException $exception) {
            if ($reference && ! empty($selectedIds) && $selectedAmount > 0) {
                    return $this->returnSelectedWithdrawalToWallet(
                        $userId,
                        $reference,
                        $selectedIds,
                        $selectedAmount,
                        $this->withdrawalFailurePayload(
                            $reference,
                            'Service is unavailable. Please try again later.',
                            503,
                            $exception->getMessage(),
                        ),
                    'Withdrawal could not be completed. The money has been returned to your Kara Ads balance.',
                    200,
                );
            }

            DB::transaction(function () use ($selectedIds, $selectedAmount, $userId, $reference, $exception) {
                if (! empty($selectedIds)) {
                    $items = AdPayoutItem::query()
                        ->whereIn('id', $selectedIds)
                        ->get();

                    foreach ($items as $item) {
                        $meta = is_array($item->meta) ? $item->meta : [];
                        $meta['withdrawal_response'] = $this->withdrawalFailurePayload(
                            $reference,
                            'Service is unavailable. Please try again later.',
                            503,
                            $exception->getMessage(),
                        );
                        $meta['withdrawal_status'] = 'returned';
                        $meta['withdrawal_failed'] = true;
                        $meta['withdrawal_returned_at'] = now()->toIso8601String();
                        $meta['withdrawal_return_reason'] = $this->withdrawalReturnReason([
                            'message' => $exception->getMessage(),
                            'provider_message' => $exception->getMessage(),
                        ]);
                        $meta['failed_withdrawal_reference'] = $reference;
                        $item->status = 'completed';
                        $item->meta = $meta;
                        $item->save();
                    }
                }

                if ($selectedAmount > 0) {
                    $wallet = UserWallet::query()
                        ->where('user_id', $userId)
                        ->lockForUpdate()
                        ->first();
                    if ($wallet) {
                        $wallet->balance = (float) $wallet->balance + $selectedAmount;
                        $wallet->pending_withdrawal = max(0, (float) $wallet->pending_withdrawal - $selectedAmount);
                        $wallet->save();
                    }
                }
            });

            return response()->json(['message' => 'Service is unavailable. Please try again later.'], 503);
        } finally {
            $cache->forget($lockKey);
            $cache->forget('rewarded-withdraw-global-gate');
        }

        $transferStatus = $this->normalizeTransferStatus($transfer);

        if ($transferStatus !== 'success') {
            return $this->returnSelectedWithdrawalToWallet(
                $userId,
                $reference,
                $selectedIds,
                $selectedAmount,
                $transfer,
                'Withdrawal was not confirmed successful. The money has been returned to your Kara Ads balance.',
                200,
            );
        }

        $wallet = $this->markSelectedWithdrawalSuccessful(
            $userId,
            $reference,
            $selectedIds,
            $transfer,
        );

        return $this->buildWithdrawalResponse(
            $userId,
            $reference,
            $transfer,
            $wallet,
            201,
            sprintf(
                'Withdrawal successful. %s charge applied. You will receive %s.',
                $this->formatNgnAmount($feeAmount),
                $this->formatNgnAmount($netAmount),
            ),
            false,
            'success',
        );
    }

    private function markSelectedWithdrawalSuccessful(
        string $userId,
        string $reference,
        array $selectedIds,
        array $transfer,
    ): ?UserWallet {
        return DB::transaction(function () use ($userId, $reference, $selectedIds, $transfer): ?UserWallet {
            $items = AdPayoutItem::query()
                ->whereIn('id', $selectedIds)
                ->where('user_id', $userId)
                ->where('source', 'rewarded')
                ->where('status', 'processing')
                ->where('meta->withdrawal_reference', $reference)
                ->lockForUpdate()
                ->get();

            $affectedAmount = (float) $items->sum('amount');

            foreach ($items as $item) {
                $meta = is_array($item->meta) ? $item->meta : [];
                $meta['withdrawal_response'] = $transfer;
                $meta['withdrawal_status'] = 'success';
                $meta['withdrawal_completed_at'] = now()->toIso8601String();
                $item->status = 'completed';
                $item->paid_at = now();
                $item->meta = $meta;
                $item->save();
            }

            $wallet = UserWallet::query()
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->first();

            if ($wallet && $affectedAmount > 0) {
                $wallet->pending_withdrawal = max(0, (float) $wallet->pending_withdrawal - $affectedAmount);
                $wallet->total_withdrawn = (float) $wallet->total_withdrawn + $affectedAmount;
                $wallet->save();
            }

            return $wallet?->fresh();
        });
    }

    private function returnSelectedWithdrawalToWallet(
        string $userId,
        string $reference,
        array $selectedIds,
        float $selectedAmount,
        array $transfer,
        string $message,
        int $statusCode,
    ): JsonResponse {
        $wallet = $this->returnSelectedWithdrawalFunds($userId, $reference, $selectedIds, $selectedAmount, $transfer);

        return $this->buildWithdrawalResponse(
            $userId,
            $reference,
            $transfer,
            $wallet,
            $statusCode,
            $message,
            false,
            'returned',
        );
    }

    private function returnSelectedWithdrawalFunds(
        string $userId,
        string $reference,
        array $selectedIds,
        float $selectedAmount,
        array $transfer,
    ): ?UserWallet {
        return DB::transaction(function () use ($userId, $reference, $selectedIds, $selectedAmount, $transfer): ?UserWallet {
            $items = AdPayoutItem::query()
                ->whereIn('id', $selectedIds)
                ->where('user_id', $userId)
                ->where('source', 'rewarded')
                ->lockForUpdate()
                ->get();

            $affectedAmount = 0.0;
            $returnReason = $this->withdrawalReturnReason($transfer);

            foreach ($items as $item) {
                $meta = is_array($item->meta) ? $item->meta : [];
                $affectedAmount += (float) $item->amount;
                $meta['withdrawal_response'] = $transfer;
                $meta['withdrawal_status'] = 'returned';
                $meta['withdrawal_failed'] = true;
                $meta['withdrawal_returned_at'] = now()->toIso8601String();
                $meta['withdrawal_return_reason'] = $returnReason;
                $meta['failed_withdrawal_reference'] = $reference;

                if (($meta['synthetic_withdrawal_allocation'] ?? false) === true) {
                    $item->status = 'completed';
                    $item->meta = $meta;
                    $item->save();
                    continue;
                }

                $item->status = 'completed';
                $item->meta = $meta;
                $item->save();
            }

            if ($affectedAmount <= 0 && $selectedAmount > 0) {
                $affectedAmount = $selectedAmount;
            }

            $wallet = UserWallet::query()
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->first();

            if ($wallet && $affectedAmount > 0) {
                $wallet->balance = (float) $wallet->balance + $affectedAmount;
                $wallet->pending_withdrawal = max(0, (float) $wallet->pending_withdrawal - $affectedAmount);
                $wallet->save();
            }

            return $wallet?->fresh();
        });
    }

    private function withdrawalFailurePayload(
        string $reference,
        string $message,
        int $statusCode,
        ?string $providerMessage = null,
    ): array {
        $payload = [
            'status' => 'failed',
            'status_code' => $statusCode,
            'message' => $message,
            'reference' => $reference,
        ];

        if ($providerMessage !== null && trim($providerMessage) !== '') {
            $payload['provider_message'] = $providerMessage;
        }

        return $payload;
    }

    private function withdrawalReturnReason(array $transfer): string
    {
        $message = trim((string) (
            $transfer['message']
            ?? $transfer['provider_message']
            ?? data_get($transfer, 'data.message')
            ?? ''
        ));

        return $message !== '' ? $message : 'Transfer was not confirmed successful.';
    }

    private function resolveWithdrawalIdempotencyKey(Request $request, array $validated): ?string
    {
        $headerKey = trim((string) $request->header('Idempotency-Key', ''));
        $bodyKey = trim((string) ($validated['idempotency_key'] ?? ''));

        $key = $headerKey !== '' ? $headerKey : $bodyKey;

        return $key !== '' ? $key : null;
    }

    private function withdrawalRequestFingerprint(float $amount, string $accountNumber, string $bankCode, string $narration): string
    {
        return hash('sha256', implode('|', [
            $this->normalizeMoney($amount),
            trim($accountNumber),
            trim($bankCode),
            trim($narration),
        ]));
    }

    private function existingWithdrawalResponse(string $userId, string $idempotencyKey, string $requestFingerprint): ?JsonResponse
    {
        $items = AdPayoutItem::query()
            ->where('user_id', $userId)
            ->where('source', 'rewarded')
            ->where(function ($query) use ($idempotencyKey): void {
                $query->where('meta->withdrawal_idempotency_key', $idempotencyKey)
                    ->orWhere('meta->withdrawal_reference', $this->buildWithdrawalReference($idempotencyKey));
            })
            ->orderBy('created_at')
            ->get();

        if ($items->isEmpty()) {
            return null;
        }

        $latestItem = $items->sortByDesc('updated_at')->first();
        if (! $latestItem instanceof AdPayoutItem) {
            return null;
        }

        $latestMeta = is_array($latestItem->meta) ? $latestItem->meta : [];
        $storedFingerprint = (string) ($latestMeta['withdrawal_request_fingerprint'] ?? '');
        if ($storedFingerprint !== '' && ! hash_equals($storedFingerprint, $requestFingerprint)) {
            return response()->json([
                'message' => 'Idempotency key reuse detected with a different withdrawal payload.',
                'reason' => 'idempotency_payload_mismatch',
            ], 409);
        }

        $wallet = UserWallet::query()->where('user_id', $userId)->first();
        $reference = (string) (
            $latestMeta['withdrawal_reference']
            ?? $latestMeta['failed_withdrawal_reference']
            ?? $this->buildWithdrawalReference($idempotencyKey)
        );
        $transfer = is_array($latestMeta['withdrawal_response'] ?? null) ? $latestMeta['withdrawal_response'] : [];
        $outcome = $this->withdrawalReplayOutcome($latestItem, $latestMeta, $transfer);

        if ($outcome !== null) {
            return $this->buildWithdrawalResponse(
                $userId,
                $reference,
                $transfer,
                $wallet,
                200,
                $outcome === 'success'
                    ? 'Withdrawal request already processed successfully.'
                    : 'Withdrawal request was not completed and the money was returned to your Kara Ads balance.',
                true,
                $outcome,
            );
        }

        return response()->json([
            'message' => 'Withdrawal request is already being processed.',
            'reference' => $reference,
            'replayed' => true,
            'wallet' => $this->withdrawalWalletPayload($userId, $wallet),
        ], 202);
    }

    private function buildWithdrawalReference(?string $idempotencyKey): string
    {
        if ($idempotencyKey === null || trim($idempotencyKey) === '') {
            return 'rw_' . Str::uuid();
        }

        return 'rw_' . substr(hash('sha256', trim($idempotencyKey)), 0, 24);
    }

    private function buildWithdrawalResponse(
        string $userId,
        string $reference,
        array $transfer,
        ?UserWallet $wallet,
        int $statusCode,
        string $message,
        bool $replayed,
        string $outcome = 'processing',
    ): JsonResponse {
        return response()->json([
            'message' => $message,
            'outcome' => $outcome,
            'reference' => $reference,
            'replayed' => $replayed,
            'transfer' => $transfer,
            'withdrawal' => $this->withdrawalBreakdownPayload($reference),
            'wallet' => $this->withdrawalWalletPayload($userId, $wallet),
        ], $statusCode);
    }

    private function withdrawalBreakdownPayload(string $reference): array
    {
        $item = AdPayoutItem::query()
            ->where('source', 'rewarded')
            ->where(function ($query) use ($reference): void {
                $query->where('meta->withdrawal_reference', $reference)
                    ->orWhere('meta->failed_withdrawal_reference', $reference);
            })
            ->orderBy('created_at')
            ->first();

        $meta = is_array($item?->meta) ? $item->meta : [];
        $grossAmount = (float) ($meta['withdrawal_gross_amount'] ?? 0);
        $feeAmount = (float) ($meta['withdrawal_fee_amount'] ?? self::WITHDRAWAL_FLAT_FEE);
        $netAmount = (float) ($meta['withdrawal_net_amount'] ?? max(0, $grossAmount - $feeAmount));

        return [
            'gross_amount' => round($grossAmount, 2),
            'fee_amount' => round($feeAmount, 2),
            'net_amount' => round($netAmount, 2),
            'base_currency' => 'NGN',
            'currency' => 'NGN',
        ];
    }

    private function withdrawalWalletPayload(string $userId, ?UserWallet $wallet): array
    {
        $user = User::query()->find($userId);

        return $this->displayWalletPayload($user, $wallet, $userId);
    }

    private function displayWalletPayload(?User $user, ?UserWallet $wallet, ?string $fallbackUserId = null): array
    {
        $money = app(CountryCurrency::class);
        $displayCurrency = $money->forUser($user);
        $exchangeRate = $money->rateFromNgn($displayCurrency);
        $walletCurrency = strtoupper((string) ($wallet?->currency ?: 'NGN'));
        if ($walletCurrency === '' || $walletCurrency === 'USD') {
            $walletCurrency = 'NGN';
        }

        $balance = (float) ($wallet?->balance ?? 0);
        $totalEarned = (float) ($wallet?->total_earned ?? 0);
        $totalWithdrawn = (float) ($wallet?->total_withdrawn ?? 0);
        $pendingWithdrawal = (float) ($wallet?->pending_withdrawal ?? 0);

        return [
            'id' => $wallet?->id ?? '',
            'user_id' => $wallet?->user_id ?? $user?->id ?? $fallbackUserId ?? '',
            'balance' => $balance,
            'balance_display' => $money->convertFromNgn($balance, $displayCurrency),
            'balance_formatted' => $money->formatFromNgn($balance, $displayCurrency),
            'total_earned' => $totalEarned,
            'total_earned_display' => $money->convertFromNgn($totalEarned, $displayCurrency),
            'total_earned_formatted' => $money->formatFromNgn($totalEarned, $displayCurrency),
            'total_withdrawn' => $totalWithdrawn,
            'total_withdrawn_display' => $money->convertFromNgn($totalWithdrawn, $displayCurrency),
            'total_withdrawn_formatted' => $money->formatFromNgn($totalWithdrawn, $displayCurrency),
            'pending_withdrawal' => $pendingWithdrawal,
            'pending_withdrawal_display' => $money->convertFromNgn($pendingWithdrawal, $displayCurrency),
            'pending_withdrawal_formatted' => $money->formatFromNgn($pendingWithdrawal, $displayCurrency),
            'base_currency' => 'NGN',
            'currency' => $displayCurrency,
            'wallet_currency' => $walletCurrency,
            'display_currency' => $displayCurrency,
            'exchange_rate' => $exchangeRate,
            'is_active' => (bool) ($wallet?->is_active ?? true),
        ];
    }

    private function rewardedEarningsPayload(array $summary, ?User $user): array
    {
        $money = app(CountryCurrency::class);
        $displayCurrency = $money->forUser($user);
        $exchangeRate = $money->rateFromNgn($displayCurrency);

        foreach ([
            'total_earned',
            'pending',
            'processing',
            'available_balance',
            'today_earnings',
            'week_earnings',
            'month_earnings',
            'average_earning_per_ad',
            'total_withdrawn',
        ] as $key) {
            if (! array_key_exists($key, $summary)) {
                continue;
            }

            $amount = (float) $summary[$key];
            $summary[$key . '_display'] = $money->convertFromNgn($amount, $displayCurrency);
            $summary[$key . '_formatted'] = $money->formatFromNgn($amount, $displayCurrency);
        }

        $summary['base_currency'] = 'NGN';
        $summary['currency'] = $displayCurrency;
        $summary['display_currency'] = $displayCurrency;
        $summary['exchange_rate'] = $exchangeRate;

        return $summary;
    }

    private function withdrawalLockKey(string $userId): string
    {
        return 'rewarded-withdrawal-lock:' . $userId;
    }

    private function normalizeMoney(float $amount): string
    {
        $normalized = rtrim(rtrim(sprintf('%.8F', $amount), '0'), '.');

        return $normalized === '' ? '0' : $normalized;
    }

    private function formatNgnAmount(float $amount): string
    {
        return 'NGN ' . number_format($amount, 2);
    }

    private function todaysRewardedWithdrawalAmount(string $userId): float
    {
        $today = now()->toDateString();

        $items = AdPayoutItem::query()
            ->where('user_id', $userId)
            ->where('source', 'rewarded')
            ->whereNotNull('meta->withdrawal_reference')
            ->get(['amount', 'meta', 'updated_at']);

        $sum = 0.0;
        $grouped = $items->groupBy(function (AdPayoutItem $item): string {
            $meta = is_array($item->meta) ? $item->meta : [];

            return (string) ($meta['withdrawal_reference'] ?? '');
        });

        foreach ($grouped as $reference => $group) {
            if ($reference === '') {
                continue;
            }

            $latest = $group->sortByDesc('updated_at')->first();
            if (! $latest instanceof AdPayoutItem) {
                continue;
            }

            $meta = is_array($latest->meta) ? $latest->meta : [];
            $transfer = is_array($meta['withdrawal_response'] ?? null) ? $meta['withdrawal_response'] : [];
            $status = $this->withdrawalHistoryStatus($latest, $meta, $transfer);
            if ($status === null) {
                continue;
            }

            $requestedAt = (string) ($meta['withdrawal_requested_at'] ?? '');
            $requestDate = $requestedAt !== ''
                ? Carbon::parse($requestedAt)->toDateString()
                : optional($latest->updated_at)->toDateString();

            if ($requestDate !== $today) {
                continue;
            }

            $sum += (float) $group->sum('amount');
        }

        return round($sum, 2);
    }

    private function withdrawalHistoryStatus(?AdPayoutItem $item, array $meta, array $transfer): ?string
    {
        $withdrawalStatus = strtolower((string) ($meta['withdrawal_status'] ?? ''));
        if (
            in_array($withdrawalStatus, ['returned', 'failed', 'cancelled'], true)
            || filter_var($meta['withdrawal_failed'] ?? false, FILTER_VALIDATE_BOOLEAN)
        ) {
            return null;
        }

        if (in_array($withdrawalStatus, ['success', 'completed'], true)) {
            return 'success';
        }

        $tsqStatus = strtolower((string) ($meta['tsq_status'] ?? ''));
        if ($tsqStatus === 'success') {
            return 'success';
        }

        if (in_array($tsqStatus, ['processing', 'pending'], true)) {
            return $tsqStatus;
        }

        $transferStatus = strtolower((string) ($transfer['status'] ?? ''));
        $transferCode = (int) ($transfer['status_code'] ?? 0);
        $transferMessage = strtolower((string) ($transfer['message'] ?? ''));

        if ($transferStatus === 'success' || $transferCode === 200 || str_contains($transferMessage, 'completed')) {
            return 'success';
        }

        if (
            in_array($transferStatus, ['failed', 'error'], true)
            || str_contains($transferMessage, 'failed')
            || str_contains($transferMessage, 'unavailable')
        ) {
            return null;
        }

        return $item?->status === 'processing' ? 'processing' : 'pending';
    }

    public function interfaceBalance(): JsonResponse
    {
        try {
            $balance = $this->interfaceApiService->balance();
        } catch (\RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        return response()->json($balance);
    }

    public function withdrawalStatus(Request $request, string $reference): JsonResponse
    {
        try {
            $statusPayload = $this->interfaceApiService->tsq($reference);
        } catch (\RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        $status = $this->normalizeTransferStatus($statusPayload);
        $userId = $request->user()->id;
        DB::transaction(function () use ($reference, $status, $statusPayload, $userId) {
            $items = AdPayoutItem::query()
                ->where('user_id', $userId)
                ->where('source', 'rewarded')
                ->where('status', 'processing')
                ->where('meta->withdrawal_reference', $reference)
                ->lockForUpdate()
                ->get();

            if ($items->isEmpty()) {
                return;
            }

            $affectedAmount = (float) $items->sum('amount');
            $userId = $items->first()->user_id;

            foreach ($items as $item) {
                $meta = is_array($item->meta) ? $item->meta : [];
                $meta['tsq_response'] = $statusPayload;
                $meta['withdrawal_response'] = $statusPayload;
                $meta['tsq_status'] = $status;

                if ($status === 'success') {
                    $item->status = 'completed';
                    $item->paid_at = now();
                    $meta['withdrawal_status'] = 'success';
                    $meta['withdrawal_completed_at'] = now()->toIso8601String();
                } elseif ($status === 'failed') {
                    if (($meta['synthetic_withdrawal_allocation'] ?? false) === true) {
                        $item->status = 'completed';
                        $meta['failed_withdrawal_reference'] = $reference;
                        $meta['withdrawal_failed'] = true;
                        $meta['withdrawal_status'] = 'returned';
                        $meta['withdrawal_returned_at'] = now()->toIso8601String();
                        $meta['withdrawal_return_reason'] = $this->withdrawalReturnReason($statusPayload);
                    } else {
                        // Return funds to wallet and keep the original withdrawal record visible for admin review.
                        $item->status = 'completed';
                        $meta['failed_withdrawal_reference'] = $reference;
                        $meta['withdrawal_failed'] = true;
                        $meta['withdrawal_status'] = 'returned';
                        $meta['withdrawal_returned_at'] = now()->toIso8601String();
                        $meta['withdrawal_return_reason'] = $this->withdrawalReturnReason($statusPayload);
                    }
                } else {
                    $item->status = 'processing';
                }

                $item->meta = $meta;
                $item->save();
            }

            if (($status === 'success' || $status === 'failed') && $affectedAmount > 0) {
                $wallet = UserWallet::query()
                    ->where('user_id', $userId)
                    ->lockForUpdate()
                    ->first();

                if ($wallet) {
                    $wallet->pending_withdrawal = max(0, (float) $wallet->pending_withdrawal - $affectedAmount);
                    if ($status === 'success') {
                        $wallet->total_withdrawn = (float) $wallet->total_withdrawn + $affectedAmount;
                    } else {
                        $wallet->balance = (float) $wallet->balance + $affectedAmount;
                    }
                    $wallet->save();
                }
            }
        });

        return response()->json([
            'reference' => $reference,
            'status' => $status,
            'response' => $statusPayload,
        ]);
    }

    private function withdrawalReplayOutcome(?AdPayoutItem $item, array $meta, array $transfer): ?string
    {
        $withdrawalStatus = strtolower((string) ($meta['withdrawal_status'] ?? ''));
        if (in_array($withdrawalStatus, ['success', 'completed'], true)) {
            return 'success';
        }

        if (
            in_array($withdrawalStatus, ['returned', 'failed', 'cancelled'], true)
            || filter_var($meta['withdrawal_failed'] ?? false, FILTER_VALIDATE_BOOLEAN)
        ) {
            return 'returned';
        }

        $tsqStatus = strtolower((string) ($meta['tsq_status'] ?? ''));
        if ($tsqStatus === 'success') {
            return 'success';
        }

        if (in_array($tsqStatus, ['failed', 'error'], true)) {
            return 'returned';
        }

        $transferStatus = strtolower((string) ($transfer['status'] ?? ''));
        $transferCode = (int) ($transfer['status_code'] ?? 0);
        $transferMessage = strtolower((string) ($transfer['message'] ?? ''));

        if ($transferStatus === 'success' || $transferCode === 200 || str_contains($transferMessage, 'completed')) {
            return 'success';
        }

        if (
            in_array($transferStatus, ['failed', 'error'], true)
            || str_contains($transferMessage, 'failed')
            || str_contains($transferMessage, 'unavailable')
        ) {
            return 'returned';
        }

        $historyStatus = $this->withdrawalHistoryStatus($item, $meta, $transfer);

        return $historyStatus === 'success' ? 'success' : null;
    }

    private function extractResolvedAccountName(array $payload): string
    {
        $paths = [
            'account_name',
            'accountName',
            'accountname',
            'AccountName',
            'name',
            'data.account_name',
            'data.accountName',
            'data.accountname',
            'data.AccountName',
            'data.name',
            'result.account_name',
            'result.accountName',
            'result.AccountName',
            'response.account_name',
            'response.accountName',
            'response.AccountName',
        ];

        foreach ($paths as $path) {
            $value = data_get($payload, $path);
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return '';
    }

    private function normalizeTransferStatus(array $payload): string
    {
        $status = strtolower((string) ($payload['status'] ?? ''));
        $statusCode = (int) ($payload['status_code'] ?? 0);
        $data = is_array($payload['data'] ?? null) ? $payload['data'] : [];

        $dataStatus = strtolower((string) ($data['status'] ?? ''));
        $responseCode = (string) ($data['response_code'] ?? $payload['response_code'] ?? '');
        $success = $payload['success'] ?? $data['success'] ?? null;

        if ($statusCode === 200 && ($status === 'success' || $dataStatus === 'success')) {
            return 'success';
        }

        if (in_array($responseCode, ['00', '0', 'SUCCESS'], true)) {
            return 'success';
        }

        if ($success === true) {
            return 'success';
        }

        if (in_array($status, ['failed', 'error'], true) || in_array($dataStatus, ['failed', 'error'], true)) {
            return 'failed';
        }

        return 'pending';
    }

    private function campaignHasRewardCapacity(AdCampaign $campaign, ?string $mediaType): bool
    {
        $remainingBudget = (float) $campaign->budget_total - (float) $campaign->spent;
        if ($remainingBudget <= 0.000001) {
            return false;
        }

        $wallet = $campaign->account?->wallet;
        if (! $wallet) {
            return false;
        }

        $availableCash = (float) $wallet->balance;
        $creditRoom = (bool) $wallet->is_credit_approved
            ? max(0.0, (float) $wallet->credit_limit - (float) $wallet->credit_used)
            : 0.0;
        $availableFunds = $availableCash + $creditRoom;
        $chargeRate = max(0.001, $this->pricing->chargeRateForMediaType($mediaType));

        return $availableFunds + 0.000001 >= $chargeRate;
    }

    private function acquireActiveWatcherLease(Request $request, string $userId): bool
    {
        if (! $this->activeWatcherLockEnabled()) {
            return true;
        }

        $cacheKey = $this->activeWatcherLeaseKey($userId);
        $actor = $this->resolveWatcherActor($request);
        $cache = Cache::store('database');
        $current = $cache->get($cacheKey);

        if (is_string($current) && $current !== '' && ! hash_equals($current, $actor)) {
            return false;
        }

        $cache->put($cacheKey, $actor, now()->addSeconds(self::ACTIVE_WATCHER_LEASE_SECONDS));

        return true;
    }

    private function activeWatcherLockEnabled(): bool
    {
        return (bool) config('services.rewarded.enforce_single_active_watcher', false);
    }

    private function activeWatcherLeaseKey(string $userId): string
    {
        return 'rewarded-active-watcher:' . $userId;
    }

    private function resolveWatcherActor(Request $request): string
    {
        $clientId = trim((string) $request->header('X-Rewarded-Client-Id', ''));
        $sessionId = (string) $request->session()->getId();
        $ip = (string) $request->ip();
        $agent = (string) $request->userAgent();

        return hash('sha256', implode('|', [
            $sessionId,
            $ip,
            $agent,
            $clientId,
        ]));
    }
}
