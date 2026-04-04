<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubscriptionPlanController extends Controller
{
    /**
     * Display a listing of all subscription plans
     */
    public function index()
    {
        $plans = SubscriptionPlan::orderBy('display_order')->get()->map(function ($plan) {
            return array_merge($plan->toArray(), [
                'active_subscriptions_count' => $plan->activeSubscriptions()->count(),
            ]);
        });

        return Inertia::render('Admin/Subscriptions/Index', [
            'plans' => $plans,
        ]);
    }

    /**
     * Show the form for creating a new subscription plan
     */
    public function create()
    {
        return Inertia::render('Admin/Subscriptions/Form', [
            'isEditing' => false,
        ]);
    }

    /**
     * Store a newly created subscription plan
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:subscription_plans,slug|max:255',
            'description' => 'nullable|string',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'requests_per_day' => 'nullable|integer|min:1',
            'requests_per_month' => 'nullable|integer|min:1',
            'tokens_per_day' => 'nullable|integer|min:1',
            'tokens_per_month' => 'nullable|integer|min:1',
            'images_per_day' => 'nullable|integer|min:1',
            'images_per_month' => 'nullable|integer|min:1',
            'features' => 'nullable|array',
            'supports_api' => 'boolean',
            'supports_voice' => 'boolean',
            'supports_email_automation' => 'boolean',
            'supports_projects' => 'boolean',
            'priority_support' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer',
        ]);

        try {
            $plan = SubscriptionPlan::create($validated);

            // return response()->json([
            //     'success' => true,
            //     'message' => 'Subscription plan created successfully',
            //     'plan' => $plan,
            // ]);
            return to_route('admin.subscriptions.plans.index');
        } catch (\Exception $e) {
            Log::error('Error creating subscription plan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create subscription plan',
            ], 500);
        }
    }

    /**
     * Show the form for editing a subscription plan
     */
    public function edit(SubscriptionPlan $subscriptionPlan)
    {
        return Inertia::render('Admin/Subscriptions/Form', [
            'plan' => $subscriptionPlan,
            'isEditing' => true,
        ]);
    }

    /**
     * Update the specified subscription plan
     */
    public function update(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:subscription_plans,slug,' . $subscriptionPlan->id . '|max:255',
            'description' => 'nullable|string',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'requests_per_day' => 'nullable|integer|min:1',
            'requests_per_month' => 'nullable|integer|min:1',
            'tokens_per_day' => 'nullable|integer|min:1',
            'tokens_per_month' => 'nullable|integer|min:1',
            'images_per_day' => 'nullable|integer|min:1',
            'images_per_month' => 'nullable|integer|min:1',
            'features' => 'nullable|array',
            'supports_api' => 'boolean',
            'supports_voice' => 'boolean',
            'supports_email_automation' => 'boolean',
            'supports_projects' => 'boolean',
            'priority_support' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer',
        ]);

        try {
            $subscriptionPlan->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Subscription plan updated successfully',
                'plan' => $subscriptionPlan,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating subscription plan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update subscription plan',
            ], 500);
        }
    }

    /**
     * Delete the specified subscription plan
     */
    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        try {
            // Check if plan has active subscriptions
            if ($subscriptionPlan->activeSubscriptions()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'Cannot delete a plan with active subscriptions',
                ], 400);
            }

            $subscriptionPlan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Subscription plan deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting subscription plan: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete subscription plan',
            ], 500);
        }
    }

    /**
     * Toggle plan active status
     */
    public function deactivate(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        try {
            $subscriptionPlan->update([
                'is_active' => $request->input('is_active', false),
            ]);

            return response()->json([
                'success' => true,
                'message' => $subscriptionPlan->is_active ? 'Plan activated' : 'Plan deactivated',
                'plan' => $subscriptionPlan,
            ]);
        } catch (\Exception $e) {
            Log::error('Error toggling plan status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update plan status',
            ], 500);
        }
    }

    /**
     * Get statistics for a plan
     */
    public function getStats(SubscriptionPlan $subscriptionPlan)
    {
        try {
            $activeSubscriptions = $subscriptionPlan->activeSubscriptions()->count();
            $totalSubscriptions = $subscriptionPlan->subscriptions()->count();
            $totalUsage = $subscriptionPlan->usageQuotas()
                ->sum('requests_used');
            return to_route('admin.subscriptions.plans.index');
            return response()->json([
                'success' => true,
                'stats' => [
                    'active_subscriptions' => $activeSubscriptions,
                    'total_subscriptions' => $totalSubscriptions,
                    'total_requests_made' => $totalUsage,
                    'plan_details' => [
                        'name' => $subscriptionPlan->name,
                        'slug' => $subscriptionPlan->slug,
                        'monthly_price' => $subscriptionPlan->monthly_price,
                        'requests_per_day' => $subscriptionPlan->requests_per_day,
                        'requests_per_month' => $subscriptionPlan->requests_per_month,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting plan stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get plan statistics',
            ], 500);
        }
    }
}
