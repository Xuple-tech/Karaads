<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Services\PlanEntitlementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionPlanController extends Controller
{
    public function __construct(
        private readonly PlanEntitlementService $entitlements
    ) {
    }

    public function index(Request $request): Response|\Illuminate\Http\JsonResponse
    {
        $plans = SubscriptionPlan::withCount(['activeSubscriptions', 'subscriptions'])
            ->with('planFeatures')
            ->orderBy('display_order')
            ->get()
            ->map(function (SubscriptionPlan $plan) {
                $activeSubscriptions = (int) ($plan->active_subscriptions_count ?? 0);

                return array_merge($this->entitlements->serializePlanForAdmin($plan), [
                    'active_subscriptions_count' => $activeSubscriptions,
                    'subscriptions_count' => (int) ($plan->subscriptions_count ?? 0),
                    'monthly_revenue_estimate' => $activeSubscriptions * (float) $plan->monthly_price,
                    'yearly_revenue_estimate' => $activeSubscriptions * (float) ($plan->yearly_price ?? 0),
                ]);
            });

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'plans' => $plans]);
        }

        return Inertia::render('Admin/Subscriptions/Index', [
            'plans' => $plans,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Subscriptions/Form', [
            'isEditing' => false,
            'capabilityDefinitions' => $this->formatCapabilityDefinitions(),
            'quotaDefinitions' => $this->formatQuotaDefinitions(),
            'plan' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $validated = $this->validatePlan($request);

        try {
            $plan = SubscriptionPlan::create($validated['plan']);
            $this->entitlements->syncPlanEntitlements($plan, $validated['capabilities'], $validated['quotas']);
            $plan->refresh()->load('planFeatures');

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subscription plan created successfully.',
                    'plan' => $this->entitlements->serializePlanForAdmin($plan),
                ]);
            }

            return to_route('admin.subscriptions.plans.show', $plan);
        } catch (\Throwable $e) {
            Log::error('Error creating subscription plan: ' . $e->getMessage(), ['exception' => $e]);

            return back()->withErrors([
                'subscription' => 'Failed to create subscription plan.',
            ]);
        }
    }

    public function show(Request $request, SubscriptionPlan $subscriptionPlan): Response|\Illuminate\Http\JsonResponse
    {
        $subscriptionPlan->load(['planFeatures', 'subscriptions.user']);
        $stats = $this->buildStats($subscriptionPlan);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'plan' => $this->entitlements->serializePlanForAdmin($subscriptionPlan),
                'stats' => $stats,
            ]);
        }

        return Inertia::render('Admin/Subscriptions/Show', [
            'plan' => $this->entitlements->serializePlanForAdmin($subscriptionPlan),
            'stats' => $stats,
        ]);
    }

    public function edit(SubscriptionPlan $subscriptionPlan): Response
    {
        $subscriptionPlan->load('planFeatures');

        return Inertia::render('Admin/Subscriptions/Form', [
            'plan' => $this->entitlements->serializePlanForAdmin($subscriptionPlan),
            'isEditing' => true,
            'capabilityDefinitions' => $this->formatCapabilityDefinitions(),
            'quotaDefinitions' => $this->formatQuotaDefinitions(),
        ]);
    }

    public function update(Request $request, SubscriptionPlan $subscriptionPlan): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $validated = $this->validatePlan($request, $subscriptionPlan);

        try {
            $subscriptionPlan->update($validated['plan']);
            $this->entitlements->syncPlanEntitlements($subscriptionPlan, $validated['capabilities'], $validated['quotas']);
            $subscriptionPlan->refresh()->load('planFeatures');

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Subscription plan updated successfully.',
                    'plan' => $this->entitlements->serializePlanForAdmin($subscriptionPlan),
                ]);
            }

            return to_route('admin.subscriptions.plans.show', $subscriptionPlan);
        } catch (\Throwable $e) {
            Log::error('Error updating subscription plan: ' . $e->getMessage(), ['exception' => $e]);

            return back()->withErrors([
                'subscription' => 'Failed to update subscription plan.',
            ]);
        }
    }

    public function destroy(Request $request, SubscriptionPlan $subscriptionPlan): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        try {
            if ($subscriptionPlan->activeSubscriptions()->count() > 0) {
                $message = 'Cannot delete a plan with active subscriptions.';

                if ($request->expectsJson()) {
                    return response()->json(['success' => false, 'error' => $message], 400);
                }

                return back()->withErrors(['subscription' => $message]);
            }

            $subscriptionPlan->planFeatures()->delete();
            $subscriptionPlan->delete();

            if ($request->expectsJson()) {
                return response()->json(['success' => true, 'message' => 'Subscription plan deleted successfully.']);
            }

            return to_route('admin.subscriptions.plans.index');
        } catch (\Throwable $e) {
            Log::error('Error deleting subscription plan: ' . $e->getMessage(), ['exception' => $e]);

            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'error' => 'Failed to delete subscription plan.'], 500);
            }

            return back()->withErrors(['subscription' => 'Failed to delete subscription plan.']);
        }
    }

    public function deactivate(Request $request, SubscriptionPlan $subscriptionPlan): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        try {
            $subscriptionPlan->update([
                'is_active' => (bool) $request->boolean('is_active'),
            ]);

            $message = $subscriptionPlan->is_active ? 'Plan activated successfully.' : 'Plan hidden from new subscriptions.';

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'plan' => $this->entitlements->serializePlanForAdmin($subscriptionPlan->fresh('planFeatures')),
                ]);
            }

            return back()->with('success', $message);
        } catch (\Throwable $e) {
            Log::error('Error toggling plan status: ' . $e->getMessage(), ['exception' => $e]);

            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'error' => 'Failed to update plan status.'], 500);
            }

            return back()->withErrors(['subscription' => 'Failed to update plan status.']);
        }
    }

    public function getStats(SubscriptionPlan $subscriptionPlan): \Illuminate\Http\JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'stats' => $this->buildStats($subscriptionPlan->load('subscriptions.user')),
            ]);
        } catch (\Throwable $e) {
            Log::error('Error getting plan stats: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to get plan statistics.',
            ], 500);
        }
    }

    private function validatePlan(Request $request, ?SubscriptionPlan $subscriptionPlan = null): array
    {
        $capabilityRules = [];
        foreach (array_keys($this->entitlements->getCapabilityDefinitions()) as $key) {
            $capabilityRules["capabilities.$key"] = 'nullable|boolean';
        }

        $quotaRules = [];
        foreach (array_keys($this->entitlements->getQuotaDefinitions()) as $key) {
            $quotaRules["quotas.$key.daily"] = 'nullable|integer|min:1';
            $quotaRules["quotas.$key.monthly"] = 'nullable|integer|min:1';
            $quotaRules["quotas.$key.total"] = 'nullable|integer|min:1';
        }

        $validated = $request->validate(array_merge([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('subscription_plans', 'slug')->ignore($subscriptionPlan?->id)],
            'description' => 'nullable|string',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'stripe_product_id' => 'nullable|string|max:255',
            'stripe_monthly_price_id' => 'nullable|string|max:255',
            'stripe_yearly_price_id' => 'nullable|string|max:255',
            'is_active' => 'required|boolean',
            'display_order' => 'nullable|integer|min:0',
            'capabilities' => 'array',
            'quotas' => 'array',
        ], $capabilityRules, $quotaRules));

        $capabilities = [];
        foreach (array_keys($this->entitlements->getCapabilityDefinitions()) as $key) {
            $capabilities[$key] = (bool) data_get($validated, "capabilities.$key", false);
        }

        $quotas = [];
        foreach (array_keys($this->entitlements->getQuotaDefinitions()) as $key) {
            $quotas[$key] = [
                'daily' => data_get($validated, "quotas.$key.daily"),
                'monthly' => data_get($validated, "quotas.$key.monthly"),
                'total' => data_get($validated, "quotas.$key.total"),
            ];
        }

        return [
            'plan' => [
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'] ?? null,
                'monthly_price' => $validated['monthly_price'],
                'yearly_price' => $validated['yearly_price'] ?? null,
                'stripe_product_id' => $validated['stripe_product_id'] ?? null,
                'stripe_monthly_price_id' => $validated['stripe_monthly_price_id'] ?? null,
                'stripe_yearly_price_id' => $validated['stripe_yearly_price_id'] ?? null,
                'is_active' => (bool) $validated['is_active'],
                'display_order' => $validated['display_order'] ?? 0,
            ],
            'capabilities' => $capabilities,
            'quotas' => $quotas,
        ];
    }

    private function buildStats(SubscriptionPlan $plan): array
    {
        $activeSubscriptions = $plan->activeSubscriptions()->count();
        $totalSubscriptions = $plan->subscriptions()->count();
        $monthlyUsage = $plan->usageQuotas()
            ->whereYear('date', now()->year)
            ->whereMonth('date', now()->month)
            ->get();

        return [
            'active_subscriptions' => $activeSubscriptions,
            'total_subscriptions' => $totalSubscriptions,
            'monthly_revenue_estimate' => $activeSubscriptions * (float) $plan->monthly_price,
            'yearly_revenue_estimate' => $activeSubscriptions * (float) ($plan->yearly_price ?? 0),
                'usage' => [
                    'requests' => $monthlyUsage->sum('requests_used'),
                    'tokens' => $monthlyUsage->sum('tokens_used'),
                    'images' => $monthlyUsage->sum('images_generated'),
                    'voice_messages' => $monthlyUsage->sum('voice_messages'),
                    'emails_processed' => $monthlyUsage->sum('emails_processed'),
                    'widget_requests' => $monthlyUsage->sum('widget_requests_used'),
                ],
        ];
    }

    private function formatCapabilityDefinitions(): array
    {
        $definitions = [];
        foreach ($this->entitlements->getCapabilityDefinitions() as $key => $definition) {
            $definitions[] = array_merge(['key' => $key], $definition);
        }

        return $definitions;
    }

    private function formatQuotaDefinitions(): array
    {
        $definitions = [];
        foreach ($this->entitlements->getQuotaDefinitions() as $key => $definition) {
            $definitions[] = array_merge(['key' => $key], $definition);
        }

        return $definitions;
    }
}
