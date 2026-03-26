<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\SiteSubscription;
use App\Models\AgentPlan;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $subscriptions = $user->agentSubscriptions()
            ->with(['site', 'plan'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('User/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
        ]);
    }

    public function plans(Request $request)
    {
        $plans = AgentPlan::where('is_active', true)
            ->orderBy('display_order')
            ->get();

        $user = $request->user();
        $currentSubscription = $user->activeSubscription();

        return Inertia::render('User/Subscriptions/Plans', [
            'plans' => $plans,
            'currentSubscription' => $currentSubscription,
        ]);
    }

    public function show(SiteSubscription $subscription, Request $request)
    {
        // $this->authorize('view', $subscription);

        $subscription->load(['site', 'plan']);

        return Inertia::render('User/Subscriptions/Show', [
            'subscription' => $subscription,
        ]);
    }

    public function subscribe(Request $request, AgentPlan $plan)
    {
        $request->validate([
            'site_id' => 'required|exists:sites,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $site = Site::findOrFail($request->site_id);
        $this->authorize('update', $site);

        // Check if site already has an active subscription
        $existingSubscription = $site->activeSubscription();
        if ($existingSubscription) {
            return back()->withErrors(['subscription' => 'This site already has an active subscription.']);
        }

        // In a real app, you would integrate with Stripe here
        // This is a simplified example

        $price = $request->billing_cycle === 'yearly' ? $plan->yearly_price : $plan->monthly_price;

        $subscription = SiteSubscription::create([
            'site_id' => $site->id,
            'plan_id' => $plan->id,
            'user_id' => $request->user()->id,
            'status' => 'active',
            'billing_cycle' => $request->billing_cycle,
            'price' => $price,
            'currency' => 'USD',
            'starts_at' => now(),
            'expires_at' => $request->billing_cycle === 'yearly' ? now()->addYear() : now()->addMonth(),
        ]);

        return redirect()->route('user.subscriptions.show', $subscription)
            ->with('success', 'Subscription created successfully.');
    }

    public function cancel(Request $request, SiteSubscription $subscription)
    {
        // $this->authorize('update', $subscription);

        // In a real app, you would cancel with Stripe
        $subscription->update([
            'status' => 'canceled',
            'canceled_at' => now(),
        ]);

        return back()->with('success', 'Subscription cancelled successfully.');
    }

    public function resume(Request $request, SiteSubscription $subscription)
    {
        // $this->authorize('update', $subscription);

        // In a real app, you would resume with Stripe
        $subscription->update([
            'status' => 'active',
            'canceled_at' => null,
        ]);

        return back()->with('success', 'Subscription resumed successfully.');
    }

    public function upgrade(Request $request, SiteSubscription $subscription)
    {
        // $this->authorize('update', $subscription);

        $request->validate([
            'plan_id' => 'required|exists:agent_plans,id',
        ]);

        $newPlan = AgentPlan::findOrFail($request->plan_id);

        // In a real app, you would handle upgrade with Stripe

        $subscription->update([
            'plan_id' => $newPlan->id,
            'price' => $subscription->billing_cycle === 'yearly' ? $newPlan->yearly_price : $newPlan->monthly_price,
        ]);

        return back()->with('success', 'Subscription upgraded successfully.');
    }
}
