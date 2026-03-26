<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSubscription;
use App\Models\Site;
use App\Models\AgentPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SiteSubscriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = SiteSubscription::with(['site', 'plan', 'user']);

        if ($request->has('site_id')) {
            $query->where('site_id', $request->site_id);
        }

        if ($request->has('plan_id')) {
            $query->where('plan_id', $request->plan_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('billing_cycle')) {
            $query->where('billing_cycle', $request->billing_cycle);
        }

        if ($request->has('search')) {
            $query->whereHas('site', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('domain', 'like', '%' . $request->search . '%');
            });
        }

        $subscriptions = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        // Calculate metrics
        $metrics = [
            'total' => SiteSubscription::count(),
            'active' => SiteSubscription::where('status', 'active')->count(),
            'monthly_recurring' => SiteSubscription::where('status', 'active')
                ->where('billing_cycle', 'monthly')
                ->sum('price'),
            'yearly_recurring' => SiteSubscription::where('status', 'active')
                ->where('billing_cycle', 'yearly')
                ->sum('price'),
            'trial' => SiteSubscription::where('status', 'trialing')->count(),
        ];

        return Inertia::render('Admin/SiteSubscriptions/Index', [
            'subscriptions' => $subscriptions,
            'metrics' => $metrics,
            'filters' => $request->only(['search', 'site_id', 'plan_id', 'status', 'billing_cycle']),
            'sites' => Site::select('id', 'name', 'domain')->get(),
            'plans' => AgentPlan::select('id', 'name')->where('is_active', true)->get(),
            'statuses' => ['active', 'canceled', 'past_due', 'trialing', 'incomplete', 'paused'],
            'billingCycles' => ['monthly', 'yearly'],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/SiteSubscriptions/Create', [
            'sites' => Site::select('id', 'name', 'domain')->get(),
            'plans' => AgentPlan::select('id', 'name', 'monthly_price', 'yearly_price')->where('is_active', true)->get(),
            'users' => User::select('id', 'name', 'email')->get(),
            'statuses' => ['active', 'canceled', 'past_due', 'trialing', 'incomplete', 'paused'],
            'billingCycles' => ['monthly', 'yearly'],
            'currencies' => ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'plan_id' => 'required|exists:agent_plans,id',
            'user_id' => 'required|exists:users,id',
            'stripe_subscription_id' => 'nullable|string',
            'stripe_customer_id' => 'nullable|string',
            'status' => 'required|string',
            'billing_cycle' => 'required|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'starts_at' => 'required|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'canceled_at' => 'nullable|date',
            'trial_ends_at' => 'nullable|date|after:starts_at',
            'metadata' => 'nullable|array',
        ]);

        // Get plan price if not provided
        if ($validated['price'] == 0) {
            $plan = AgentPlan::find($validated['plan_id']);
            $validated['price'] = $validated['billing_cycle'] === 'yearly'
                ? $plan->yearly_price
                : $plan->monthly_price;
        }

        // Cancel existing active subscription for this site
        SiteSubscription::where('site_id', $validated['site_id'])
            ->where('status', 'active')
            ->update([
                'status' => 'canceled',
                'canceled_at' => now(),
            ]);

        $subscription = SiteSubscription::create($validated);

        return redirect()->route('admin.site-subscriptions.show', $subscription)
            ->with('success', 'Subscription created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SiteSubscription $siteSubscription)
    {
        $siteSubscription->load(['site', 'plan', 'user']);

        // Get subscription history for this site
        $history = SiteSubscription::where('site_id', $siteSubscription->site_id)
            ->where('id', '!=', $siteSubscription->id)
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/SiteSubscriptions/Show', [
            'subscription' => $siteSubscription,
            'history' => $history,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SiteSubscription $siteSubscription)
    {
        $siteSubscription->load(['site', 'plan', 'user']);

        return Inertia::render('Admin/SiteSubscriptions/Edit', [
            'subscription' => $siteSubscription,
            'sites' => Site::select('id', 'name', 'domain')->get(),
            'plans' => AgentPlan::select('id', 'name', 'monthly_price', 'yearly_price')->where('is_active', true)->get(),
            'users' => User::select('id', 'name', 'email')->get(),
            'statuses' => ['active', 'canceled', 'past_due', 'trialing', 'incomplete', 'paused'],
            'billingCycles' => ['monthly', 'yearly'],
            'currencies' => ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SiteSubscription $siteSubscription)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'plan_id' => 'required|exists:agent_plans,id',
            'user_id' => 'required|exists:users,id',
            'stripe_subscription_id' => 'nullable|string',
            'stripe_customer_id' => 'nullable|string',
            'status' => 'required|string',
            'billing_cycle' => 'required|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'starts_at' => 'required|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'canceled_at' => 'nullable|date',
            'trial_ends_at' => 'nullable|date|after:starts_at',
            'metadata' => 'nullable|array',
        ]);

        // If changing to active, cancel other active subscriptions for this site
        if ($validated['status'] === 'active' && $siteSubscription->status !== 'active') {
            SiteSubscription::where('site_id', $validated['site_id'])
                ->where('id', '!=', $siteSubscription->id)
                ->where('status', 'active')
                ->update([
                    'status' => 'canceled',
                    'canceled_at' => now(),
                ]);
        }

        $siteSubscription->update($validated);

        return redirect()->route('admin.site-subscriptions.show', $siteSubscription)
            ->with('success', 'Subscription updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SiteSubscription $siteSubscription)
    {
        $siteSubscription->delete();

        return redirect()->route('admin.site-subscriptions.index')
            ->with('success', 'Subscription deleted successfully.');
    }

    /**
     * Cancel subscription
     */
    public function cancel(SiteSubscription $siteSubscription)
    {
        $siteSubscription->update([
            'status' => 'canceled',
            'canceled_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Subscription canceled successfully.');
    }

    /**
     * Reactivate subscription
     */
    public function reactivate(SiteSubscription $siteSubscription)
    {
        // Cancel other active subscriptions for this site
        SiteSubscription::where('site_id', $siteSubscription->site_id)
            ->where('id', '!=', $siteSubscription->id)
            ->where('status', 'active')
            ->update([
                'status' => 'canceled',
                'canceled_at' => now(),
            ]);

        $siteSubscription->update([
            'status' => 'active',
            'canceled_at' => null,
            'expires_at' => $siteSubscription->billing_cycle === 'yearly'
                ? now()->addYear()
                : now()->addMonth(),
        ]);

        return redirect()->back()
            ->with('success', 'Subscription reactivated successfully.');
    }

    /**
     * Renew subscription
     */
    public function renew(SiteSubscription $siteSubscription)
    {
        $newExpiry = $siteSubscription->billing_cycle === 'yearly'
            ? now()->addYear()
            : now()->addMonth();

        $siteSubscription->update([
            'expires_at' => $newExpiry,
            'status' => 'active',
        ]);

        return redirect()->back()
            ->with('success', 'Subscription renewed successfully.');
    }

    /**
     * Change plan
     */
    public function changePlan(Request $request, SiteSubscription $siteSubscription)
    {
        $request->validate([
            'plan_id' => 'required|exists:agent_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'prorate' => 'boolean',
        ]);

        $newPlan = AgentPlan::find($request->plan_id);
        $newPrice = $request->billing_cycle === 'yearly'
            ? $newPlan->yearly_price
            : $newPlan->monthly_price;

        $siteSubscription->update([
            'plan_id' => $newPlan->id,
            'billing_cycle' => $request->billing_cycle,
            'price' => $newPrice,
            'expires_at' => $request->billing_cycle === 'yearly'
                ? now()->addYear()
                : now()->addMonth(),
        ]);

        return redirect()->back()
            ->with('success', 'Plan changed successfully.');
    }

    /**
     * Extend trial
     */
    public function extendTrial(Request $request, SiteSubscription $siteSubscription)
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:30',
        ]);

        $newTrialEnds = now()->addDays($request->days);

        $siteSubscription->update([
            'trial_ends_at' => $newTrialEnds,
            'status' => 'trialing',
        ]);

        return redirect()->back()
            ->with('success', "Trial extended by {$request->days} days.");
    }

    /**
     * Sync with Stripe
     */
    public function syncStripe(SiteSubscription $siteSubscription)
    {
        // Here you would implement Stripe synchronization logic
        // This is a placeholder for Stripe integration

        return redirect()->back()
            ->with('success', 'Subscription synchronized with Stripe.');
    }

    /**
     * Get subscription analytics
     */
    public function analytics()
    {
        // Monthly revenue trend
        $revenueTrend = SiteSubscription::where('status', 'active')
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month,
                        SUM(CASE WHEN billing_cycle = "yearly" THEN price / 12 ELSE price END) as mrr')
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        // Plan distribution
        $planDistribution = SiteSubscription::where('status', 'active')
            ->join('agent_plans', 'site_subscriptions.plan_id', '=', 'agent_plans.id')
            ->selectRaw('agent_plans.name, COUNT(*) as count')
            ->groupBy('agent_plans.name')
            ->orderBy('count', 'desc')
            ->get();

        // Churn rate (last 30 days)
        $thirtyDaysAgo = now()->subDays(30);
        $totalActiveMonthAgo = SiteSubscription::where('status', 'active')
            ->where('created_at', '<', $thirtyDaysAgo)
            ->count();

        $churnedThisMonth = SiteSubscription::where('status', 'canceled')
            ->where('canceled_at', '>=', $thirtyDaysAgo)
            ->count();

        $churnRate = $totalActiveMonthAgo > 0
            ? ($churnedThisMonth / $totalActiveMonthAgo) * 100
            : 0;

        // New subscriptions (last 30 days)
        $newSubscriptions = SiteSubscription::where('created_at', '>=', $thirtyDaysAgo)
            ->count();

        return Inertia::render('Admin/SiteSubscriptions/Analytics', [
            'revenueTrend' => $revenueTrend,
            'planDistribution' => $planDistribution,
            'metrics' => [
                'mrr' => SiteSubscription::where('status', 'active')
                    ->sum(DB::raw('CASE WHEN billing_cycle = "yearly" THEN price / 12 ELSE price END')),
                'arr' => SiteSubscription::where('status', 'active')
                    ->where('billing_cycle', 'yearly')
                    ->sum('price'),
                'totalCustomers' => SiteSubscription::where('status', 'active')
                    ->distinct('site_id')
                    ->count('site_id'),
                'churnRate' => round($churnRate, 2),
                'newSubscriptions' => $newSubscriptions,
            ],
        ]);
    }
}
