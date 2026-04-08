<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanFeature;
use App\Services\PlanEntitlementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SubscriptionPlanFeaturesController extends Controller
{
    public function __construct(
        private readonly PlanEntitlementService $entitlements
    ) {
    }

    public function index(SubscriptionPlan $plan): \Illuminate\Http\JsonResponse
    {
        $features = $plan->planFeatures()
            ->orderBy('feature_key')
            ->orderByRaw("CASE WHEN limit_type IS NULL THEN 0 ELSE 1 END")
            ->get()
            ->map(fn (SubscriptionPlanFeature $feature) => [
                'id' => $feature->id,
                'feature_key' => $feature->feature_key,
                'feature_name' => $feature->feature_name,
                'description' => $feature->description,
                'limit' => $feature->limit,
                'limit_type' => $feature->limit_type,
                'is_enabled' => $feature->is_enabled,
                'limit_text' => $feature->getLimitText(),
            ]);

        return response()->json([
            'success' => true,
            'features' => $features,
            'definitions' => [
                'capabilities' => $this->entitlements->getCapabilityDefinitions(),
                'quotas' => $this->entitlements->getQuotaDefinitions(),
            ],
        ]);
    }

    public function store(Request $request, SubscriptionPlan $plan): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'feature_key' => 'required|string|max:100',
            'feature_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'limit' => 'nullable|integer|min:1',
            'limit_type' => 'nullable|in:daily,monthly,total',
            'is_enabled' => 'required|boolean',
        ]);

        try {
            $feature = $plan->planFeatures()->create($validated);
            $this->entitlements->syncCompatibilityMirrors($plan->fresh('planFeatures'));

            return response()->json([
                'success' => true,
                'message' => 'Entitlement added successfully.',
                'feature' => [
                    'id' => $feature->id,
                    'feature_key' => $feature->feature_key,
                    'feature_name' => $feature->feature_name,
                    'description' => $feature->description,
                    'limit' => $feature->limit,
                    'limit_type' => $feature->limit_type,
                    'is_enabled' => $feature->is_enabled,
                    'limit_text' => $feature->getLimitText(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Error adding entitlement: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to add entitlement.',
            ], 500);
        }
    }

    public function update(Request $request, SubscriptionPlan $plan, SubscriptionPlanFeature $feature): \Illuminate\Http\JsonResponse
    {
        if ($feature->plan_id !== $plan->id) {
            return response()->json([
                'success' => false,
                'error' => 'Entitlement does not belong to this plan.',
            ], 404);
        }

        $validated = $request->validate([
            'feature_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'limit' => 'nullable|integer|min:1',
            'limit_type' => 'nullable|in:daily,monthly,total',
            'is_enabled' => 'required|boolean',
        ]);

        try {
            $feature->update($validated);
            $this->entitlements->syncCompatibilityMirrors($plan->fresh('planFeatures'));

            return response()->json([
                'success' => true,
                'message' => 'Entitlement updated successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Error updating entitlement: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to update entitlement.',
            ], 500);
        }
    }

    public function destroy(SubscriptionPlan $plan, SubscriptionPlanFeature $feature): \Illuminate\Http\JsonResponse
    {
        if ($feature->plan_id !== $plan->id) {
            return response()->json([
                'success' => false,
                'error' => 'Entitlement does not belong to this plan.',
            ], 404);
        }

        try {
            $feature->delete();
            $this->entitlements->syncCompatibilityMirrors($plan->fresh('planFeatures'));

            return response()->json([
                'success' => true,
                'message' => 'Entitlement deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Error deleting entitlement: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to delete entitlement.',
            ], 500);
        }
    }

    public function bulkToggle(Request $request, SubscriptionPlan $plan): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'feature_ids' => 'required|array|min:1',
            'feature_ids.*' => 'string',
            'is_enabled' => 'required|boolean',
        ]);

        try {
            $updated = $plan->planFeatures()
                ->whereIn('id', $validated['feature_ids'])
                ->update(['is_enabled' => $validated['is_enabled']]);

            $this->entitlements->syncCompatibilityMirrors($plan->fresh('planFeatures'));

            return response()->json([
                'success' => true,
                'message' => $validated['is_enabled'] ? 'Entitlements enabled.' : 'Entitlements disabled.',
                'updated_count' => $updated,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error bulk toggling entitlements: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to update entitlements.',
            ], 500);
        }
    }
}
