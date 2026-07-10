<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Domain\AdsV2\Services\AdPricingService;
use App\Models\AdsV2\AdAccount;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdWallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdsCampaignController extends Controller
{
    public function __construct(private readonly AdPricingService $pricing) {}

    public function index(Request $request): JsonResponse
    {
        $account = $this->resolveInternalAccount($request);

        $campaigns = AdCampaign::query()
            ->where('ad_account_id', $account->id)
            ->latest()
            ->paginate(20);

        return response()->json($campaigns);
    }

    public function store(Request $request): JsonResponse
    {
        $account = $this->resolveInternalAccount($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'objective' => 'required|in:awareness,traffic,conversions,rewarded',
            'billing_model' => 'nullable|in:cpm,cpc,cpv,cpa',
            'pricing_media_type' => 'required|in:image,video',
            'daily_target_views' => 'required|integer|min:1|max:100000000',
            'promotion_type' => 'required|in:standard,boosted',
            'post_id' => 'nullable|uuid',
            'budget_total' => 'nullable|numeric|min:1',
            'budget_daily' => 'nullable|numeric|min:0.01',
            'bid_amount' => 'nullable|numeric|min:0.0001',
            'pacing_type' => 'required|in:standard,accelerated',
            'targeting' => 'nullable|array',
            'start_at' => 'required|date',
            'end_at' => 'nullable|date',
        ]);

        $startAt = Carbon::parse($validated['start_at']);
        $endAt = isset($validated['end_at']) ? Carbon::parse($validated['end_at']) : $startAt->copy()->addDay();
        $durationDays = $this->resolveDurationDays($startAt, $endAt);
        $computed = $this->pricing->budgetFromDailyViews(
            $validated['pricing_media_type'],
            (int) $validated['daily_target_views'],
            $durationDays,
        );

        $this->enforceBudgetCaps($computed['budget_total']);

        $this->validateTargeting($validated['targeting'] ?? []);

        $billingModel = $validated['pricing_media_type'] === 'video' ? 'cpv' : 'cpm';

        $campaign = AdCampaign::create([
            ...$validated,
            'ad_account_id' => $account->id,
            'user_id' => $request->user()?->id,
            'status' => 'draft',
            'spent' => 0,
            'currency' => 'NGN',
            'billing_model' => $billingModel,
            'bid_amount' => $computed['rate'],
            'budget_daily' => $computed['budget_daily'],
            'budget_total' => $computed['budget_total'],
            'reach_estimate' => $computed['reach_estimate'],
            'start_at' => $startAt,
            'end_at' => $endAt,
        ]);

        return response()->json([
            'message' => 'Campaign created.',
            'campaign' => $campaign,
        ], 201);
    }

    public function update(Request $request, AdCampaign $campaign): JsonResponse
    {
        $this->authorizeCampaign($request, $campaign);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'objective' => 'sometimes|in:awareness,traffic,conversions,rewarded',
            'billing_model' => 'nullable|in:cpm,cpc,cpv,cpa',
            'pricing_media_type' => 'sometimes|in:image,video',
            'daily_target_views' => 'sometimes|integer|min:1|max:100000000',
            'status' => 'sometimes|in:draft,in_review,paused',
            'promotion_type' => 'sometimes|in:standard,boosted',
            'post_id' => 'nullable|uuid',
            'budget_total' => 'nullable|numeric|min:1',
            'budget_daily' => 'nullable|numeric|min:0.01',
            'bid_amount' => 'sometimes|numeric|min:0.0001',
            'pacing_type' => 'sometimes|in:standard,accelerated',
            'targeting' => 'nullable|array',
            'start_at' => 'sometimes|date',
            'end_at' => 'nullable|date',
        ]);

        $this->validateTargeting($validated['targeting'] ?? []);

        $mediaType = (string) ($validated['pricing_media_type'] ?? $campaign->pricing_media_type ?? 'image');
        $dailyTargetViews = (int) ($validated['daily_target_views'] ?? $campaign->daily_target_views ?? 1);

        $startAt = array_key_exists('start_at', $validated)
            ? Carbon::parse((string) $validated['start_at'])
            : ($campaign->start_at ? Carbon::parse($campaign->start_at) : now());

        $endAt = array_key_exists('end_at', $validated)
            ? ($validated['end_at'] ? Carbon::parse((string) $validated['end_at']) : $startAt->copy()->addDay())
            : ($campaign->end_at ? Carbon::parse($campaign->end_at) : $startAt->copy()->addDay());

        $durationDays = $this->resolveDurationDays($startAt, $endAt);
        $computed = $this->pricing->budgetFromDailyViews($mediaType, $dailyTargetViews, $durationDays);
        $this->enforceBudgetCaps($computed['budget_total']);

        $validated['pricing_media_type'] = $mediaType;
        $validated['daily_target_views'] = $dailyTargetViews;
        $validated['billing_model'] = $mediaType === 'video' ? 'cpv' : 'cpm';
        $validated['bid_amount'] = $computed['rate'];
        $validated['budget_daily'] = $computed['budget_daily'];
        $validated['budget_total'] = $computed['budget_total'];
        $validated['reach_estimate'] = $computed['reach_estimate'];
        $validated['start_at'] = $startAt;
        $validated['end_at'] = $endAt;

        $requestKeys = collect(array_keys($request->except(['_token', '_method'])));
        $statusOnlyPause = $requestKeys->count() === 1
            && $requestKeys->contains('status')
            && $request->input('status') === 'paused';
        if (! $statusOnlyPause && $campaign->isAdminApproved()) {
            $validated['status'] = 'in_review';
            $validated['approved_at'] = null;
            $validated['approved_by'] = null;
            $validated['rejected_at'] = null;
            $validated['rejection_reason'] = null;
            $validated['review_submitted_at'] = now();
        }

        $campaign->update($validated);

        return response()->json([
            'message' => 'Campaign updated.',
            'campaign' => $campaign->fresh(),
        ]);
    }

    public function pause(Request $request, AdCampaign $campaign): JsonResponse
    {
        $this->authorizeCampaign($request, $campaign);
        $campaign->update(['status' => 'paused']);

        return response()->json(['message' => 'Campaign paused.', 'campaign' => $campaign]);
    }

    public function resume(Request $request, AdCampaign $campaign): JsonResponse
    {
        $this->authorizeCampaign($request, $campaign);
        if (! $campaign->isAdminApproved()) {
            return response()->json([
                'message' => 'Campaign must be approved by admin before it can resume.',
            ], 422);
        }

        $campaign->update(['status' => 'active']);

        return response()->json(['message' => 'Campaign resumed.', 'campaign' => $campaign]);
    }

    public function reviewSubmit(Request $request, AdCampaign $campaign): JsonResponse
    {
        $this->authorizeCampaign($request, $campaign);

        if (! $campaign->last_funded_at) {
            return response()->json([
                'message' => 'Campaign must be funded before it can be submitted for review.',
            ], 422);
        }

        $campaign->status = 'in_review';
        $campaign->review_submitted_at = now();
        $campaign->rejected_at = null;
        $campaign->rejection_reason = null;
        $campaign->save();

        // Also submit any draft or rejected creatives so admin can review them
        $campaign->creatives()
            ->whereIn('status', ['draft', 'rejected'])
            ->update(['status' => 'in_review']);

        return response()->json([
            'message' => 'Campaign submitted for review.',
            'campaign' => $campaign,
        ]);
    }

    private function resolveInternalAccount(Request $request): AdAccount
    {
        $user = $request->user();

        $account = AdAccount::firstOrCreate(
            ['user_id' => $user->id, 'source_type' => 'internal'],
            ['name' => $user->name . ' Ads Account', 'status' => 'active'],
        );

        AdWallet::firstOrCreate(
            ['ad_account_id' => $account->id],
            ['currency' => 'NGN', 'balance' => 0, 'credit_limit' => 0, 'credit_used' => 0, 'is_credit_approved' => false],
        );

        return $account;
    }

    private function authorizeCampaign(Request $request, AdCampaign $campaign): void
    {
        if ($campaign->user_id !== $request->user()?->id) {
            abort(403, 'Unauthorized campaign access.');
        }
    }

    private function enforceBudgetCaps(float $budget): void
    {
        $min = $this->pricing->minBudget();
        $max = $this->pricing->maxBudget();

        if ($budget < $min) {
            abort(422, "Budget must be at least {$min} NGN.");
        }
        if ($budget > $max) {
            abort(422, "Budget cannot exceed {$max} NGN.");
        }
    }

    private function validateTargeting(array $targeting): void
    {
        if ($targeting === []) {
            return;
        }

        $optionsRow = DB::table('monetization_settings')->where('key', 'ad_targeting_options')->first();
        $options = $optionsRow?->value ? json_decode($optionsRow->value, true) : [];

        foreach (['demographics', 'interests', 'locations'] as $bucket) {
            if (! isset($targeting[$bucket])) {
                continue;
            }
            $allowed = (array) ($options[$bucket] ?? []);
            $values = (array) $targeting[$bucket];
            foreach ($values as $value) {
                if (! in_array($value, $allowed, true)) {
                    abort(422, "Invalid targeting value {$value} for {$bucket}");
                }
            }
        }
    }

    private function resolveDurationDays(Carbon $startAt, Carbon $endAt): int
    {
        if ($endAt->lessThanOrEqualTo($startAt)) {
            abort(422, 'Campaign end date must be after start date.');
        }

        $seconds = max(1, $endAt->diffInSeconds($startAt));

        return max(1, (int) ceil($seconds / 86400));
    }
}
