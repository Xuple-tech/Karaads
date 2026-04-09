<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Price;
use Stripe\Product;
use Stripe\Subscription as StripeSubscription;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session as CheckoutSession;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function isConfigured(): bool
    {
        return filled(config('services.stripe.secret')) && filled(config('services.stripe.public'));
    }

    /**
     * Create or retrieve Stripe customer for user
     */
    public function getOrCreateCustomer(User $user): Customer
    {
        if ($user->stripe_id) {
            return Customer::retrieve($user->stripe_id);
        }

        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        $user->update(['stripe_id' => $customer->id]);

        return $customer;
    }

    /**
     * Create a Stripe product for a plan (if it doesn't exist)
     */
    public function getOrCreateProduct(SubscriptionPlan $plan): Product
    {
        if ($plan->stripe_product_id) {
            return Product::retrieve($plan->stripe_product_id);
        }

        $product = Product::create([
            'name' => $plan->name,
            'description' => $plan->description,
            'metadata' => [
                'plan_id' => $plan->id,
            ],
        ]);

        $plan->update(['stripe_product_id' => $product->id]);

        return $product;
    }

    /**
     * Create monthly and yearly prices for a plan
     */
    public function ensurePlanPrices(SubscriptionPlan $plan): array
    {
        $product = $this->getOrCreateProduct($plan);

        $prices = [
            'monthly' => null,
            'yearly' => null,
        ];

        // Monthly price
        if ($plan->monthly_price > 0) {
            if ($plan->stripe_monthly_price_id) {
                $prices['monthly'] = Price::retrieve($plan->stripe_monthly_price_id);
            } else {
                $monthlyPrice = Price::create([
                    'product' => $product->id,
                    'unit_amount' => (int)($plan->monthly_price * 100),
                    'currency' => 'usd',
                    'recurring' => [
                        'interval' => 'month',
                        'interval_count' => 1,
                    ],
                ]);
                $plan->update(['stripe_monthly_price_id' => $monthlyPrice->id]);
                $prices['monthly'] = $monthlyPrice;
            }
        }

        // Yearly price
        if ($plan->yearly_price > 0) {
            if ($plan->stripe_yearly_price_id) {
                $prices['yearly'] = Price::retrieve($plan->stripe_yearly_price_id);
            } else {
                $yearlyPrice = Price::create([
                    'product' => $product->id,
                    'unit_amount' => (int)($plan->yearly_price * 100),
                    'currency' => 'usd',
                    'recurring' => [
                        'interval' => 'year',
                        'interval_count' => 1,
                    ],
                ]);
                $plan->update(['stripe_yearly_price_id' => $yearlyPrice->id]);
                $prices['yearly'] = $yearlyPrice;
            }
        }

        return $prices;
    }

    /**
     * Create Stripe checkout session for subscription
     */
    public function createCheckoutSession(User $user, SubscriptionPlan $plan, string $billingPeriod = 'monthly'): string
    {
        if (! $this->isConfigured()) {
            throw new \RuntimeException('Stripe is not configured.');
        }

        $customer = $this->getOrCreateCustomer($user);
        $prices = $this->ensurePlanPrices($plan);

        $priceId = $billingPeriod === 'yearly' ? $prices['yearly']?->id : $prices['monthly']?->id;

        if (!$priceId) {
            throw new \Exception('Price not available for this plan and billing period');
        }

        $session = \Stripe\Checkout\Session::create([
            'customer' => $customer->id,
            'payment_method_types' => ['card'],
            'line_items' => [
                [
                    'price' => $priceId,
                    'quantity' => 1,
                ],
            ],
            'mode' => 'subscription',
            'success_url' => route('subscription.success', [], true) . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('subscription.pricing', [], true),
            'metadata' => [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'billing_period' => $billingPeriod,
            ],
        ]);

        return $session->url;
    }

    public function createOneTimeCheckoutSession(User $user, float $amountUsd, string $successUrl, string $cancelUrl, array $metadata = []): string
    {
        $customer = $this->getOrCreateCustomer($user);

        $session = CheckoutSession::create([
            'customer' => $customer->id,
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => 'Developer API Wallet Top-Up',
                    ],
                    'unit_amount' => (int) round($amountUsd * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'metadata' => $metadata,
        ]);

        return $session->url;
    }

    /**
     * Create a subscription in Stripe
     */
    public function createSubscription(User $user, SubscriptionPlan $plan, string $billingPeriod = 'monthly'): StripeSubscription
    {
        $customer = $this->getOrCreateCustomer($user);
        $prices = $this->ensurePlanPrices($plan);

        $priceId = $billingPeriod === 'yearly' ? $prices['yearly']?->id : $prices['monthly']?->id;

        if (!$priceId) {
            throw new \Exception('Price not available for this plan and billing period');
        }

        $stripeSubscription = StripeSubscription::create([
            'customer' => $customer->id,
            'items' => [
                [
                    'price' => $priceId,
                ],
            ],
            'metadata' => [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
            ],
        ]);

        return $stripeSubscription;
    }

    /**
     * Update subscription to a new plan
     */
    public function updateSubscription(Subscription $subscription, SubscriptionPlan $newPlan, string $billingPeriod = 'monthly'): StripeSubscription
    {
        if (!$subscription->external_subscription_id) {
            throw new \Exception('No Stripe subscription found');
        }

        $stripeSubscription = StripeSubscription::retrieve($subscription->external_subscription_id);
        $prices = $this->ensurePlanPrices($newPlan);

        $priceId = $billingPeriod === 'yearly' ? $prices['yearly']?->id : $prices['monthly']?->id;

        if (!$priceId) {
            throw new \Exception('Price not available for this plan and billing period');
        }

        $updated = StripeSubscription::update(
            $subscription->external_subscription_id,
            [
                'items' => [
                    [
                        'id' => $stripeSubscription->items->data[0]->id,
                        'price' => $priceId,
                    ],
                ],
            ]
        );

        return $updated;
    }

    /**
     * Cancel Stripe subscription
     */
    public function cancelSubscription(Subscription $subscription): void
    {
        if (!$subscription->external_subscription_id) {
            return;
        }

        try {
            StripeSubscription::update(
                $subscription->external_subscription_id,
                ['cancel_at_period_end' => true]
            );
        } catch (\Exception $e) {
            Log::error('Failed to cancel Stripe subscription: ' . $e->getMessage());
        }
    }

    /**
     * Create a payment intent
     */
    public function createPaymentIntent(User $user, float $amount, string $description = ''): \Stripe\PaymentIntent
    {
        $customer = $this->getOrCreateCustomer($user);

        return \Stripe\PaymentIntent::create([
            'customer' => $customer->id,
            'amount' => (int)($amount * 100),
            'currency' => 'usd',
            'description' => $description,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);
    }

    /**
     * Get payment methods for user
     */
    public function getPaymentMethods(User $user): array
    {
        $customer = $this->getOrCreateCustomer($user);

        $paymentMethods = \Stripe\PaymentMethod::all([
            'customer' => $customer->id,
            'type' => 'card',
        ]);

        return $paymentMethods->data;
    }

    /**
     * Update subscription payment method
     */
    public function updatePaymentMethod(Subscription $subscription, string $paymentMethodId): void
    {
        if (!$subscription->external_subscription_id) {
            throw new \Exception('No Stripe subscription found');
        }

        StripeSubscription::update(
            $subscription->external_subscription_id,
            [
                'default_payment_method' => $paymentMethodId,
            ]
        );
    }

    /**
     * Delete a payment method
     */
    public function deletePaymentMethod(string $paymentMethodId): void
    {
        $paymentMethod = \Stripe\PaymentMethod::retrieve($paymentMethodId);
        $paymentMethod->detach();
    }

    /**
     * Reactivate a cancelled subscription
     */
    public function reactivateSubscription(Subscription $subscription): void
    {
        if (!$subscription->external_subscription_id) {
            throw new \Exception('No Stripe subscription found');
        }

        try {
            StripeSubscription::update(
                $subscription->external_subscription_id,
                ['cancel_at_period_end' => false]
            );
        } catch (\Exception $e) {
            Log::error('Failed to reactivate Stripe subscription: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create billing portal session for customer
     */
    public function createBillingPortalSession(User $user): string
    {
        $customer = $this->getOrCreateCustomer($user);

        $session = \Stripe\BillingPortal\Session::create([
            'customer' => $customer->id,
            'return_url' => route('user.subscription', [], true),
        ]);

        return $session->url;
    }

    /**
     * Sync subscription from Stripe webhook
     */
    public function syncSubscriptionFromWebhook(array $data): void
    {
        $stripeSubscription = $data['data']['object'];
        $userId = $stripeSubscription['metadata']['user_id'] ?? null;
        $planId = $stripeSubscription['metadata']['plan_id'] ?? null;

        if (!$userId || !$planId) {
            Log::warning('Missing metadata in Stripe webhook', $stripeSubscription);
            return;
        }

        $user = User::find($userId);
        $plan = SubscriptionPlan::find($planId);

        if (!$user || !$plan) {
            Log::warning('User or plan not found for webhook', compact('userId', 'planId'));
            return;
        }

        $subscription = Subscription::where('user_id', $userId)
            ->where('external_subscription_id', $stripeSubscription['id'])
            ->first();

        if (!$subscription) {
            $subscription = new Subscription([
                'user_id' => $userId,
                'plan_id' => $planId,
                'external_subscription_id' => $stripeSubscription['id'],
            ]);
        }

        // Update subscription status
        $status = match ($stripeSubscription['status']) {
            'active' => 'active',
            'past_due' => 'pending_payment',
            'canceled' => 'cancelled',
            'unpaid' => 'cancelled',
            default => $stripeSubscription['status'],
        };

        $subscription->update([
            'status' => $status,
            'started_at' => \Carbon\Carbon::createFromTimestamp($stripeSubscription['start_date']),
            'renews_at' => \Carbon\Carbon::createFromTimestamp($stripeSubscription['current_period_end']),
            'payment_method' => 'stripe',
            'amount_paid' => ($stripeSubscription['items']['data'][0]['price']['unit_amount'] ?? 0) / 100,
        ]);

        if ($stripeSubscription['status'] === 'canceled') {
            $subscription->update([
                'cancelled_at' => now(),
                'status' => 'cancelled',
            ]);
        }
    }
}
