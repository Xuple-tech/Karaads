<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\PlanEntitlementService;
use App\Services\SubscriptionService;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    protected $subscriptionService;
    protected $stripeService;
    protected $entitlements;

    public function __construct(SubscriptionService $subscriptionService, StripeService $stripeService, PlanEntitlementService $entitlements)
    {
        $this->subscriptionService = $subscriptionService;
        $this->stripeService = $stripeService;
        $this->entitlements = $entitlements;
    }

    /**
     * Show subscription/pricing page
     */
    public function index(): RedirectResponse
    {
        return redirect()->to('/subscription');
    }

    /**
     * Show detailed pricing page
     */
    public function pricing(): RedirectResponse
    {
        return redirect()->to('/pricing');
    }

    /**
     * Get available plans (API)
     */
    public function getPlans()
    {
        $plans = SubscriptionPlan::getActivePlans()->load('planFeatures')->map(
            fn (SubscriptionPlan $plan) => array_merge($plan->toArray(), [
                'features' => $this->entitlements->getDisplayFeatures($plan),
                'capabilities' => collect($this->entitlements->getPlanEntitlements($plan)['capabilities'])
                    ->where('enabled', true)
                    ->values()
                    ->all(),
            ])
        );
        $userSubscription = null;

        if (Auth::check()) {
            $userSubscription = $this->subscriptionService->getUserSubscription(Auth::user());
        }

        return response()->json([
            'success' => true,
            'plans' => $plans,
            'userSubscription' => $userSubscription,
        ]);
    }

    /**
     * Get current user's subscription details
     */
    public function getMySubscription()
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $user = Auth::user();
        $subscription = $this->subscriptionService->getUserSubscription($user);
        $plan = $this->subscriptionService->getUserPlan($user);
        $usage = $this->subscriptionService->getUserUsageStats($user);

        return response()->json([
            'success' => true,
            'subscription' => $subscription,
            'plan' => $plan ? array_merge($plan->toArray(), [
                'features' => $this->entitlements->getDisplayFeatures($plan->loadMissing('planFeatures')),
                'entitlements' => $this->entitlements->getPlanEntitlements($plan),
            ]) : null,
            'usage' => $usage,
        ]);
    }

    /**
     * Create checkout session for upgrading to a plan
     */
    public function upgrade(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'plan_id' => 'required|uuid|exists:subscription_plans,id',
            'billing_period' => 'nullable|in:monthly,yearly',
        ]);

        try {
            $user = Auth::user();
            $plan = SubscriptionPlan::findOrFail($request->plan_id);
            $billingPeriod = $request->billing_period ?? 'monthly';

            // Create checkout session
            $checkoutUrl = $this->stripeService->createCheckoutSession($user, $plan, $billingPeriod);

            return response()->json([
                'success' => true,
                'message' => 'Checkout session created',
                'checkout_url' => $checkoutUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('Subscription upgrade error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create checkout session: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle successful checkout
     */
    public function handleCheckoutSuccess(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);

        try {
            // Verify the session with Stripe
            $session = \Stripe\Checkout\Session::retrieve($request->session_id);

            if ($session->payment_status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'error' => 'Payment not completed',
                ], 400);
            }

            // Get user and plan from session metadata
            $userId = $session->metadata['user_id'] ?? null;
            $planId = $session->metadata['plan_id'] ?? null;

            if (!$userId || !$planId) {
                Log::warning('Missing metadata in checkout session', ['session_id' => $request->session_id]);
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid session metadata',
                ], 400);
            }

            // Find user and plan
            $user = \App\Models\User::find($userId);
            $plan = SubscriptionPlan::find($planId);

            if (!$user || !$plan) {
                return response()->json([
                    'success' => false,
                    'error' => 'User or plan not found',
                ], 404);
            }

            // Update user subscription with the paid plan
            $subscription = $this->subscriptionService->upgradePlan($user, $plan, 'stripe');

            // Store the Stripe subscription ID for webhook sync
            if ($session->subscription) {
                $subscription->update([
                    'external_subscription_id' => $session->subscription,
                    'amount_paid' => ($session->amount_total / 100) ?? 0,
                ]);
            }

            Log::info("Payment successful for user {$userId}, upgraded to plan {$plan->slug}");

            return response()->json([
                'success' => true,
                'message' => 'Payment successful! Your plan has been activated.',
                'subscription' => $subscription,
                'plan' => $plan,
            ]);
        } catch (\Exception $e) {
            Log::error('Checkout success handling error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to process checkout success: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Downgrade to a plan
     */
    public function downgrade(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'plan_id' => 'required|uuid|exists:subscription_plans,id',
        ]);

        try {
            $user = Auth::user();
            $plan = SubscriptionPlan::findOrFail($request->plan_id);

            $subscription = $this->subscriptionService->downgradePlan($user, $plan);

            return response()->json([
                'success' => true,
                'message' => 'Successfully downgraded to ' . $plan->name,
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            Log::error('Subscription downgrade error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to downgrade subscription',
            ], 500);
        }
    }

    /**
     * Cancel subscription
     */
    public function cancel(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        try {
            $user = Auth::user();
            $subscription = $this->subscriptionService->getUserSubscription($user);

            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'error' => 'No active subscription found',
                ], 404);
            }

            $subscription->cancel();

            return response()->json([
                'success' => true,
                'message' => 'Subscription cancelled successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Subscription cancellation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to cancel subscription',
            ], 500);
        }
    }

    /**
     * Start trial
     */
    public function startTrial(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'plan_id' => 'required|uuid|exists:subscription_plans,id',
        ]);

        try {
            $user = Auth::user();
            $plan = SubscriptionPlan::findOrFail($request->plan_id);

            // Check if user already has a trial
            if ($user->subscriptions()->where('is_trial', true)->exists()) {
                return response()->json([
                    'success' => false,
                    'error' => 'You can only use one trial per account',
                ], 400);
            }

            $subscription = $this->subscriptionService->startTrial($user, $plan, 7);

            return response()->json([
                'success' => true,
                'message' => '7-day trial started for ' . $plan->name,
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            Log::error('Trial start error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to start trial',
            ], 500);
        }
    }

    /**
     * Get usage statistics
     */
    public function getUsageStats()
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $user = Auth::user();
        $plan = $this->subscriptionService->getUserPlan($user);
        $today = \App\Models\UsageQuota::getTodayQuota($user->id);
        $monthly = \App\Models\UsageQuota::getAggregatedMonthlyUsage($user->id);

        return response()->json([
            'success' => true,
            'daily' => [
                'requests_used' => $today?->requests_used ?? 0,
                'requests_limit' => $plan ? $this->entitlements->getDailyLimitForUsage($plan, 'requests') : null,
                'tokens_used' => $today?->tokens_used ?? 0,
                'tokens_limit' => $plan ? $this->entitlements->getDailyLimitForUsage($plan, 'tokens') : null,
                'images_generated' => $today?->images_generated ?? 0,
                'images_limit' => $plan ? $this->entitlements->getDailyLimitForUsage($plan, 'images') : null,
                'voice_messages' => $today?->voice_messages ?? 0,
                'voice_limit' => $plan ? $this->entitlements->getDailyLimitForUsage($plan, 'voice_messages') : null,
                'emails_processed' => $today?->emails_processed ?? 0,
                'emails_limit' => $plan ? $this->entitlements->getDailyLimitForUsage($plan, 'emails_processed') : null,
            ],
            'monthly' => [
                'requests_used' => $monthly['requests_used'] ?? 0,
                'requests_limit' => $plan ? $this->entitlements->getMonthlyLimitForUsage($plan, 'requests') : null,
                'tokens_used' => $monthly['tokens_used'] ?? 0,
                'tokens_limit' => $plan ? $this->entitlements->getMonthlyLimitForUsage($plan, 'tokens') : null,
                'images_generated' => $monthly['images_generated'] ?? 0,
                'images_limit' => $plan ? $this->entitlements->getMonthlyLimitForUsage($plan, 'images') : null,
                'voice_messages' => $monthly['voice_messages'] ?? 0,
                'voice_limit' => $plan ? $this->entitlements->getMonthlyLimitForUsage($plan, 'voice_messages') : null,
                'emails_processed' => $monthly['emails_processed'] ?? 0,
                'emails_limit' => $plan ? $this->entitlements->getMonthlyLimitForUsage($plan, 'emails_processed') : null,
            ],
        ]);
    }

    public function billingPortal(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            Log::warning('SPA billing portal access denied: unauthenticated request', [
                'path' => $request->path(),
                'ip' => $request->ip(),
            ]);

            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        try {
            return response()->json([
                'success' => true,
                'portal_url' => $this->stripeService->createBillingPortalSession($user),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create SPA billing portal session: ' . $e->getMessage(), [
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to access billing portal',
            ], 500);
        }
    }

    /**
     * Show billing management page
     */
    public function billing(): RedirectResponse
    {
        return redirect()->to(Auth::check() ? '/billing' : '/login');
    }
}
