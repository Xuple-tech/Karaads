<?php

namespace App\Http\Controllers\SaasOwner;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * SubscriptionManagementController
 *
 * SaaS Owner can create, manage, and view user subscriptions
 * Only SaaS Owner role can access these features
 */
class SubscriptionManagementController extends \Illuminate\Routing\Controller
{
    /**
     * List all subscriptions
     */
    public function index(Request $request)
    {
        $saasOwnerId = auth()->id();

        $query = Subscription::with(['user', 'plan']);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by plan
        if ($request->has('plan_id') && $request->plan_id) {
            $query->where('plan_id', $request->plan_id);
        }

        // Search by user email or name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('email', 'like', "%$search%")
                  ->orWhere('name', 'like', "%$search%");
            });
        }

        // Sort options
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $subscriptions = $query->paginate(50)->through(function ($subscription) {
            return [
                'id' => $subscription->id,
                'user' => [
                    'id' => $subscription->user->id,
                    'name' => $subscription->user->name,
                    'email' => $subscription->user->email,
                    'avatar' => $subscription->user->avatar,
                ],
                'plan' => [
                    'id' => $subscription->plan->id,
                    'name' => $subscription->plan->name,
                    'monthly_price' => $subscription->plan->monthly_price,
                ],
                'status' => $subscription->status,
                'started_at' => $subscription->started_at?->format('Y-m-d H:i:s'),
                'renews_at' => $subscription->renews_at?->format('Y-m-d H:i:s'),
                'expires_at' => $subscription->expires_at?->format('Y-m-d H:i:s'),
                'is_trial' => $subscription->is_trial,
                'trial_ends_at' => $subscription->trial_ends_at?->format('Y-m-d H:i:s'),
                'amount_paid' => $subscription->amount_paid,
            ];
        });

        $plans = SubscriptionPlan::where('is_active', true)->get();

        return Inertia::render('SaasOwner/Subscriptions/Index', [
            'subscriptions' => [
                'data' => $subscriptions->items(),
                'current_page' => $subscriptions->currentPage(),
                'last_page' => $subscriptions->lastPage(),
                'per_page' => $subscriptions->perPage(),
                'total' => $subscriptions->total(),
            ],
            'plans' => $plans,
            'filters' => [
                'status' => $request->status,
                'plan_id' => $request->plan_id,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Show create subscription form
     */
    public function create()
    {
        $plans = SubscriptionPlan::where('is_active', true)->get();
        $users = User::where('role', 'user')
            ->orderBy('name')
            ->limit(100)
            ->get();

        return Inertia::render('SaasOwner/Subscriptions/Create', [
            'plans' => $plans,
            'users' => $users,
        ]);
    }

    /**
     * Store new subscription
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:subscription_plans,id',
            'is_trial' => 'boolean',
            'trial_duration_days' => 'nullable|integer|min:1|max:90',
            'started_at' => 'nullable|date|after_or_equal:today',
            'amount_paid' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $user = User::findOrFail($validated['user_id']);
            $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

            // Cancel existing active subscriptions
            Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->update(['status' => 'cancelled', 'cancelled_at' => now()]);

            // Create new subscription
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'started_at' => $validated['started_at'] ?? now(),
                'renews_at' => ($validated['started_at'] ?? now())->addMonth(),
                'is_trial' => $validated['is_trial'] ?? false,
                'trial_ends_at' => $validated['is_trial']
                    ? now()->addDays($validated['trial_duration_days'] ?? 14)
                    : null,
                'amount_paid' => $validated['amount_paid'] ?? $plan->monthly_price,
                'payment_method' => 'manual',
            ]);

            // Log audit
            AuditLog::logAction(
                'create',
                'Subscription',
                $subscription->id,
                null,
                $subscription->toArray(),
                "SaaS Owner created subscription for {$user->email} on {$plan->name} plan"
            );

            DB::commit();

            return redirect()->route('saas-owner.subscriptions.show', $subscription->id)
                ->with('success', 'Subscription created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create subscription', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to create subscription: ' . $e->getMessage());
        }
    }

    /**
     * Show subscription details
     */
    public function show(Subscription $subscription)
    {
        $subscription->load(['user', 'plan']);

        return Inertia::render('SaasOwner/Subscriptions/Show', [
            'subscription' => [
                'id' => $subscription->id,
                'user' => [
                    'id' => $subscription->user->id,
                    'name' => $subscription->user->name,
                    'email' => $subscription->user->email,
                    'avatar' => $subscription->user->avatar,
                    'created_at' => $subscription->user->created_at,
                ],
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'started_at' => $subscription->started_at,
                'renews_at' => $subscription->renews_at,
                'expires_at' => $subscription->expires_at,
                'cancelled_at' => $subscription->cancelled_at,
                'is_trial' => $subscription->is_trial,
                'trial_ends_at' => $subscription->trial_ends_at,
                'amount_paid' => $subscription->amount_paid,
                'payment_method' => $subscription->payment_method,
                'created_at' => $subscription->created_at,
                'updated_at' => $subscription->updated_at,
            ],
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(Subscription $subscription)
    {
        $subscription->load(['user', 'plan']);
        $plans = SubscriptionPlan::where('is_active', true)->get();

        return Inertia::render('SaasOwner/Subscriptions/Edit', [
            'subscription' => $subscription,
            'plans' => $plans,
        ]);
    }

    /**
     * Update subscription
     */
    public function update(Request $request, Subscription $subscription)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'status' => 'required|in:active,cancelled,expired,paused',
            'renews_at' => 'nullable|date|after:started_at',
            'expires_at' => 'nullable|date|after:started_at',
            'amount_paid' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $oldValues = $subscription->toArray();

            // If plan is changed, adjust renewal date
            if ($subscription->plan_id !== $validated['plan_id']) {
                $validated['renews_at'] = now()->addMonth();
            }

            $subscription->update($validated);

            AuditLog::logAction(
                'update',
                'Subscription',
                $subscription->id,
                $oldValues,
                $validated,
                "SaaS Owner updated subscription {$subscription->id}"
            );

            DB::commit();

            return redirect()->route('saas-owner.subscriptions.show', $subscription->id)
                ->with('success', 'Subscription updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update subscription', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to update subscription: ' . $e->getMessage());
        }
    }

    /**
     * Cancel subscription
     */
    public function cancel(Request $request, Subscription $subscription)
    {
        try {
            $oldValues = $subscription->toArray();

            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            AuditLog::logAction(
                'cancel',
                'Subscription',
                $subscription->id,
                $oldValues,
                $subscription->toArray(),
                "SaaS Owner cancelled subscription for user {$subscription->user->email}"
            );

            return back()->with('success', 'Subscription cancelled successfully');
        } catch (\Exception $e) {
            Log::error('Failed to cancel subscription', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to cancel subscription: ' . $e->getMessage());
        }
    }

    /**
     * Pause subscription
     */
    public function pause(Request $request, Subscription $subscription)
    {
        try {
            $oldValues = $subscription->toArray();

            $subscription->update(['status' => 'paused']);

            AuditLog::logAction(
                'pause',
                'Subscription',
                $subscription->id,
                $oldValues,
                ['status' => 'paused'],
                "SaaS Owner paused subscription for user {$subscription->user->email}"
            );

            return back()->with('success', 'Subscription paused successfully');
        } catch (\Exception $e) {
            Log::error('Failed to pause subscription', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to pause subscription: ' . $e->getMessage());
        }
    }

    /**
     * Resume paused subscription
     */
    public function resume(Request $request, Subscription $subscription)
    {
        if ($subscription->status !== 'paused') {
            return back()->with('error', 'Only paused subscriptions can be resumed');
        }

        try {
            $oldValues = $subscription->toArray();

            $subscription->update([
                'status' => 'active',
                'renews_at' => now()->addMonth(),
            ]);

            AuditLog::logAction(
                'resume',
                'Subscription',
                $subscription->id,
                $oldValues,
                $subscription->toArray(),
                "SaaS Owner resumed subscription for user {$subscription->user->email}"
            );

            return back()->with('success', 'Subscription resumed successfully');
        } catch (\Exception $e) {
            Log::error('Failed to resume subscription', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to resume subscription: ' . $e->getMessage());
        }
    }

    /**
     * Export subscriptions
     */
    public function export(Request $request)
    {
        $query = Subscription::with(['user', 'plan']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->get();

        $csvData = "User Name,Email,Plan,Status,Started At,Renews At,Amount Paid\n";

        foreach ($subscriptions as $subscription) {
            $csvData .= "\"{$subscription->user->name}\",\"{$subscription->user->email}\",\"{$subscription->plan->name}\",\"{$subscription->status}\",\"{$subscription->started_at}\",\"{$subscription->renews_at}\",\"{$subscription->amount_paid}\"\n";
        }

        return response($csvData, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="subscriptions_export.csv"',
        ]);
    }
}
