<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanFeature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubscriptionPlanFeaturesController extends Controller
{
    /**
     * Display features for a subscription plan
     */
    public function index(SubscriptionPlan $plan)
    {
        $features = $plan->planFeatures()
            ->orderBy('feature_key')
            ->get()
            ->map(fn($feature) => [
                'id' => $feature->id,
                'feature_key' => $feature->feature_key,
                'feature_name' => $feature->feature_name,
                'description' => $feature->description,
                'limit' => $feature->limit,
                'limit_type' => $feature->limit_type,
                'is_enabled' => $feature->is_enabled,
                'limit_text' => $feature->getLimitText(),
            ]);

        return Inertia::render('Admin/Subscriptions/PlanFeatures', [
            'plan' => $plan,
            'features' => $features,
        ]);
    }

    /**
     * Store a new feature for a plan
     */
    public function store(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'feature_key' => 'required|string|max:100|unique:subscription_plan_features,feature_key,null,id,plan_id,' . $plan->id,
            'feature_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'limit' => 'nullable|integer|min:1',
            'limit_type' => 'nullable|in:daily,monthly,total',
            'is_enabled' => 'boolean',
        ]);

        try {
            $feature = $plan->planFeatures()->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Feature added successfully',
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
        } catch (\Exception $e) {
            Log::error('Error adding feature: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to add feature',
            ], 500);
        }
    }

    /**
     * Update a feature
     */
    public function update(Request $request, SubscriptionPlan $plan, SubscriptionPlanFeature $feature)
    {
        // Verify feature belongs to plan
        if ($feature->plan_id !== $plan->id) {
            return response()->json([
                'success' => false,
                'error' => 'Feature does not belong to this plan',
            ], 404);
        }

        $validated = $request->validate([
            'feature_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'limit' => 'nullable|integer|min:1',
            'limit_type' => 'nullable|in:daily,monthly,total',
            'is_enabled' => 'boolean',
        ]);

        try {
            $feature->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Feature updated successfully',
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
        } catch (\Exception $e) {
            Log::error('Error updating feature: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update feature',
            ], 500);
        }
    }

    /**
     * Delete a feature
     */
    public function destroy(SubscriptionPlan $plan, SubscriptionPlanFeature $feature)
    {
        if ($feature->plan_id !== $plan->id) {
            return response()->json([
                'success' => false,
                'error' => 'Feature does not belong to this plan',
            ], 404);
        }

        try {
            $feature->delete();

            return response()->json([
                'success' => true,
                'message' => 'Feature deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting feature: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete feature',
            ], 500);
        }
    }

    /**
     * Bulk enable/disable features
     */
    public function bulkToggle(Request $request, SubscriptionPlan $plan)
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

            return response()->json([
                'success' => true,
                'message' => $validated['is_enabled'] ? 'Features enabled' : 'Features disabled',
                'updated_count' => $updated,
            ]);
        } catch (\Exception $e) {
            Log::error('Error bulk toggling features: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update features',
            ], 500);
        }
    }
}
