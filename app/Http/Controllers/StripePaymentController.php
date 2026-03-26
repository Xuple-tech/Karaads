<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class StripePaymentController extends Controller
{
    protected $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
        $this->middleware('auth');
    }

    /**
     * Show checkout page
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|uuid|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $plan = SubscriptionPlan::findOrFail($request->plan_id);
        $user = Auth::user();

        return Inertia::render('Stripe/Checkout', [
            'plan' => $plan,
            'billingCycle' => $request->billing_cycle,
            'stripePublishableKey' => config('services.stripe.public'),
            'clientSecret' => null, // Will be set in frontend
        ]);
    }

    /**
     * Create payment intent
     */
    public function createPaymentIntent(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'plan_id' => 'required|uuid|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        try {
            $user = Auth::user();
            $plan = SubscriptionPlan::findOrFail($request->plan_id);

            // Calculate amount
            $amount = $request->billing_cycle === 'yearly' ? $plan->yearly_price : $plan->monthly_price;

            if ($amount <= 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid plan price',
                ], 400);
            }

            $intent = $this->stripeService->createPaymentIntent(
                $user,
                $amount,
                'Payment for ' . $plan->name . ' - ' . ucfirst($request->billing_cycle)
            );

            return response()->json([
                'success' => true,
                'clientSecret' => $intent->client_secret,
                'intentId' => $intent->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create payment intent: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create payment intent',
            ], 500);
        }
    }

    /**
     * Confirm subscription after payment
     */
    public function confirmSubscription(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'plan_id' => 'required|uuid|exists:subscription_plans,id',
            'payment_method_id' => 'required|string',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        try {
            $user = Auth::user();
            $plan = SubscriptionPlan::findOrFail($request->plan_id);

            $result = $this->stripeService->createSubscription(
                $user,
                $plan,
                $request->payment_method_id,
                $request->billing_cycle
            );

            return response()->json([
                'success' => true,
                'message' => 'Subscription created successfully',
                'subscription' => $result['subscription'],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to confirm subscription: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage() ?? 'Failed to create subscription',
            ], 500);
        }
    }

    /**
     * Update payment method
     */
    public function updatePaymentMethod(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'payment_method_id' => 'required|string',
        ]);

        try {
            $user = Auth::user();
            $subscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'error' => 'No active subscription found',
                ], 404);
            }

            $this->stripeService->updatePaymentMethod(
                $subscription,
                $request->payment_method_id
            );

            return response()->json([
                'success' => true,
                'message' => 'Payment method updated successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update payment method: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update payment method',
            ], 500);
        }
    }

    /**
     * Get payment methods
     */
    public function getPaymentMethods()
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        try {
            $user = Auth::user();
            $paymentMethods = $this->stripeService->getPaymentMethods($user);

            // Format payment methods
            $formatted = array_map(function ($pm) {
                return [
                    'id' => $pm['id'],
                    'brand' => $pm['card']['brand'] ?? null,
                    'last4' => $pm['card']['last4'] ?? null,
                    'expMonth' => $pm['card']['exp_month'] ?? null,
                    'expYear' => $pm['card']['exp_year'] ?? null,
                ];
            }, $paymentMethods);

            return response()->json([
                'success' => true,
                'paymentMethods' => $formatted,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get payment methods: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get payment methods',
            ], 500);
        }
    }

    /**
     * Delete payment method
     */
    public function deletePaymentMethod(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'payment_method_id' => 'required|string',
        ]);

        try {
            $this->stripeService->deletePaymentMethod($request->payment_method_id);

            return response()->json([
                'success' => true,
                'message' => 'Payment method deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete payment method: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete payment method',
            ], 500);
        }
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'immediate' => 'sometimes|boolean',
        ]);

        try {
            $user = Auth::user();
            $subscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'error' => 'No active subscription found',
                ], 404);
            }

            $immediate = $request->get('immediate', false);
            $this->stripeService->cancelSubscription($subscription, $immediate);

            return response()->json([
                'success' => true,
                'message' => $immediate
                    ? 'Subscription cancelled immediately'
                    : 'Subscription will be cancelled at the end of the billing period',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to cancel subscription: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to cancel subscription',
            ], 500);
        }
    }

    /**
     * Reactivate subscription
     */
    public function reactivateSubscription(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        try {
            $user = Auth::user();
            $subscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'error' => 'No active subscription found',
                ], 404);
            }

            $this->stripeService->reactivateSubscription($subscription);

            return response()->json([
                'success' => true,
                'message' => 'Subscription reactivated successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to reactivate subscription: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to reactivate subscription',
            ], 500);
        }
    }

    /**
     * Access Stripe billing portal
     */
    public function billingPortal()
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        try {
            $user = Auth::user();
            $portalUrl = $this->stripeService->createBillingPortalSession($user);

            return response()->json([
                'success' => true,
                'portal_url' => $portalUrl,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create billing portal session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to access billing portal',
            ], 500);
        }
    }
}
