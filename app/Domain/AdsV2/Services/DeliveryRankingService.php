<?php

namespace App\Domain\AdsV2\Services;

use App\Domain\Recommendation\Fallback\SafePopularFallback;
use App\Domain\Recommendation\RecommendationConfigService;
use App\Domain\Recommendation\RecommendationContext;
use App\Domain\Recommendation\Scoring\FeatureExtractor;
use App\Domain\Recommendation\Scoring\WeightedScorer;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdCreative;
use App\Models\AdsV2\AdEvent;
use App\Models\AdsV2\AdPlacement;
use Illuminate\Support\Collection;

class DeliveryRankingService
{
    private const SERVABLE_CAMPAIGN_STATUSES = ['active'];
    private const SERVABLE_CREATIVE_STATUSES = ['active'];
    private const START_TIME_GRACE_MINUTES = 60;
    private const FUNDING_EPSILON = 0.000001;
    /** @var array<string, Collection<int, AdCreative>> */
    private array $candidatePoolCache = [];

    public function __construct(
        private readonly RecommendationConfigService $configService,
        private readonly FeatureExtractor $featureExtractor,
        private readonly WeightedScorer $weightedScorer,
        private readonly SafePopularFallback $fallback,
        private readonly AdPricingService $pricing,
    ) {}

    public function selectCreative(AdPlacement $placement, array $context = []): ?array
    {
        $surface = $placement->surface;
        $now = now();
        $excludedCreativeIds = $this->excludedCreativeIds($context);
        $recoContext = RecommendationContext::fromArray([
            'entity_type' => 'ad',
            'surface' => $surface,
            'slot' => $placement->slot,
            'user_id' => $context['viewer']['id'] ?? null,
            'context' => $context['context'] ?? [],
            'viewer' => $context['viewer'] ?? [],
            'device' => $context['device'] ?? [],
        ]);
        $config = $this->configService->runtimeConfig('ad', $surface, $placement->slot, $recoContext->userId);
        $weights = (array) ($config['weights'] ?? []);
        $thresholds = (array) ($config['thresholds'] ?? []);
        $minScore = (float) ($thresholds['min_score'] ?? 0.10);
        $maxFreq = (int) ($thresholds['max_freq_per_user_24h'] ?? 8);

        $candidates = $this->candidateCreatives($now);
        if ($candidates->isEmpty()) {
            $candidates = $this->candidateCreatives($now, true);
        }

        $eligible = [];

        foreach ($candidates as $creative) {
            if ($excludedCreativeIds->contains((string) $creative->id)) {
                continue;
            }

            $campaign = $creative->campaign;
            if (! $campaign instanceof AdCampaign) {
                continue;
            }

            $funding = $this->campaignFunding($campaign);
            if (! $this->campaignCanCoverDelivery($campaign, $creative, $funding)) {
                continue;
            }

            if (! $this->campaignHasRemainingGoal($campaign)) {
                $this->markCampaignCompleted($campaign);
                continue;
            }

            $targeting = (array) ($campaign->targeting ?? []);
            if (! empty($targeting['surface']) && ! in_array($surface, (array) $targeting['surface'], true)) {
                continue;
            }

            $features = $this->featureExtractor->forAd($campaign, $creative, $recoContext);
            // frequency cap: score feature "pacing" contains fatigue penalty, and we also enforce a hard floor.
            if (($features['pacing'] ?? 0) <= max(0, 1 - ($maxFreq / 10))) {
                continue;
            }

            $scorePayload = $this->weightedScorer->score($features, $weights);
            if ($scorePayload['score'] < $minScore) {
                continue;
            }

            $eligible[] = [
                'creative' => $creative,
                'campaign' => $campaign,
                'score' => $scorePayload['score'],
                'breakdown' => $scorePayload['breakdown'],
                'features' => $features,
                'funding' => $funding,
            ];
        }

        if ($eligible === []) {
            $fallbackCreative = $this->fallback->ad($surface);
            $fallbackCreative?->loadMissing('campaign.account.wallet');
            $fallbackCampaign = $fallbackCreative?->campaign;
            if ($fallbackCreative && $fallbackCampaign instanceof AdCampaign) {
                if (! in_array($fallbackCampaign->status, self::SERVABLE_CAMPAIGN_STATUSES, true)) {
                    return null;
                }

                if (! in_array($fallbackCreative->status, self::SERVABLE_CREATIVE_STATUSES, true)) {
                    return null;
                }

                $funding = $this->campaignFunding($fallbackCampaign);
                if (! $this->campaignCanCoverDelivery($fallbackCampaign, $fallbackCreative, $funding)) {
                    return null;
                }

                if (! $this->campaignHasRemainingGoal($fallbackCampaign)) {
                    $this->markCampaignCompleted($fallbackCampaign);

                    return null;
                }

                return [
                    'creative' => $fallbackCreative,
                    'campaign' => $fallbackCampaign,
                    'score' => 0.0,
                    'breakdown' => [],
                    'features' => [],
                    'fallback_used' => 'safe_popular',
                ];
            }

            return null;
        }

        usort($eligible, function ($a, $b) use ($surface) {
            // Serve cash-funded campaigns first, then use credit-only campaigns as fallback.
            $aHasPaidBalance = (bool) ($a['funding']['has_paid_balance'] ?? false);
            $bHasPaidBalance = (bool) ($b['funding']['has_paid_balance'] ?? false);
            if ($aHasPaidBalance !== $bHasPaidBalance) {
                return $aHasPaidBalance ? -1 : 1;
            }

            // Prefer boosted campaigns on feed surface
            $aBoost = ($a['campaign']->promotion_type ?? 'standard') === 'boosted' && $surface === 'feed';
            $bBoost = ($b['campaign']->promotion_type ?? 'standard') === 'boosted' && $surface === 'feed';

            if ($aBoost !== $bBoost) {
                return $aBoost ? -1 : 1;
            }

            return $b['score'] <=> $a['score'];
        });
        $eligible[0]['fallback_used'] = null;

        return $eligible[0];
    }

    public function selectAnyCreative(AdPlacement $placement, array $context = []): ?array
    {
        $surface = $placement->surface;
        $now = now();
        $excludedCreativeIds = $this->excludedCreativeIds($context);
        $candidates = $this->candidateCreatives($now);
        if ($candidates->isEmpty()) {
            $candidates = $this->candidateCreatives($now, true);
        }

        $candidates = $candidates
            ->sort(function (AdCreative $a, AdCreative $b) {
                $qualityComparison = (float) $b->quality_score <=> (float) $a->quality_score;
                if ($qualityComparison !== 0) {
                    return $qualityComparison;
                }

                return ($b->created_at?->getTimestamp() ?? 0) <=> ($a->created_at?->getTimestamp() ?? 0);
            })
            ->values();

        $paidSurfaceMatched = [];
        $paidCrossSurface = [];
        $creditSurfaceMatched = [];
        $creditCrossSurface = [];

        foreach ($candidates as $creative) {
            if ($excludedCreativeIds->contains((string) $creative->id)) {
                continue;
            }

            $campaign = $creative->campaign;
            if (! $campaign instanceof AdCampaign) {
                continue;
            }

            $funding = $this->campaignFunding($campaign);
            if (! $this->campaignCanCoverDelivery($campaign, $creative, $funding)) {
                continue;
            }

            if (! $this->campaignHasRemainingGoal($campaign)) {
                $this->markCampaignCompleted($campaign);
                continue;
            }

            $targeting = (array) ($campaign->targeting ?? []);
            $targetedSurfaces = (array) ($targeting['surface'] ?? []);
            $isSurfaceMatch = $targetedSurfaces === [] || in_array($surface, $targetedSurfaces, true);

            if ($isSurfaceMatch) {
                if ($funding['has_paid_balance']) {
                    $paidSurfaceMatched[] = ['creative' => $creative, 'campaign' => $campaign];
                } else {
                    $creditSurfaceMatched[] = ['creative' => $creative, 'campaign' => $campaign];
                }
            } else {
                if ($funding['has_paid_balance']) {
                    $paidCrossSurface[] = ['creative' => $creative, 'campaign' => $campaign];
                } else {
                    $creditCrossSurface[] = ['creative' => $creative, 'campaign' => $campaign];
                }
            }
        }

        $selected = $paidSurfaceMatched[0]
            ?? $paidCrossSurface[0]
            ?? $creditSurfaceMatched[0]
            ?? $creditCrossSurface[0]
            ?? null;
        if (! $selected) {
            return null;
        }

        return [
            'creative' => $selected['creative'],
            'campaign' => $selected['campaign'],
            'score' => 0.0,
            'breakdown' => [],
            'features' => [],
            'fallback_used' => 'hard_any_inventory',
        ];
    }

    private function candidateCreatives(\Illuminate\Support\Carbon $now, bool $allowStartGrace = false): Collection
    {
        $cacheKey = $allowStartGrace ? 'grace' : 'strict';
        if (isset($this->candidatePoolCache[$cacheKey])) {
            return $this->candidatePoolCache[$cacheKey];
        }

        $this->candidatePoolCache[$cacheKey] = AdCreative::query()
            ->with('campaign.account.wallet')
            ->adminApproved()
            ->whereIn('status', self::SERVABLE_CREATIVE_STATUSES)
            ->whereHas('campaign', function ($query) {
                $query->adminApproved()
                    ->whereIn('status', self::SERVABLE_CAMPAIGN_STATUSES);
            })
            ->get();

        return $this->candidatePoolCache[$cacheKey];
    }

    private function excludedCreativeIds(array $context): Collection
    {
        return collect((array) ($context['exclude_creative_ids'] ?? []))
            ->filter(fn ($id) => is_string($id) && $id !== '')
            ->values();
    }

    /**
     * @return array{cash: float, credit: float, total: float, has_paid_balance: bool}
     */
    private function campaignFunding(AdCampaign $campaign): array
    {
        $wallet = $campaign->account?->wallet;
        $cash = max(0.0, (float) ($wallet?->balance ?? 0.0));
        $creditRoom = (bool) ($wallet?->is_credit_approved ?? false)
            ? max(0.0, (float) ($wallet?->credit_limit ?? 0.0) - (float) ($wallet?->credit_used ?? 0.0))
            : 0.0;

        return [
            'cash' => $cash,
            'credit' => $creditRoom,
            'total' => $cash + $creditRoom,
            'has_paid_balance' => $cash > self::FUNDING_EPSILON,
        ];
    }

    /**
     * @param array{cash: float, credit: float, total: float, has_paid_balance: bool} $funding
     */
    private function campaignCanCoverDelivery(AdCampaign $campaign, AdCreative $creative, array $funding): bool
    {
        $remainingBudget = max(0.0, (float) $campaign->budget_total - (float) $campaign->spent);
        $chargeRate = max(0.001, (float) $this->pricing->chargeRateForMediaType($creative->media_type));

        return $funding['total'] + self::FUNDING_EPSILON >= $chargeRate
            && $remainingBudget + self::FUNDING_EPSILON >= $chargeRate;
    }

    private function campaignHasRemainingGoal(AdCampaign $campaign): bool
    {
        // Delivery should continue until the funded campaign budget is exhausted.
        // Budget and wallet coverage are already checked before this method runs.
        return true;
    }

    private function markCampaignCompleted(AdCampaign $campaign): void
    {
        if ($campaign->status === 'completed') {
            return;
        }

        $campaign->status = 'completed';
        $campaign->save();
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
