<?php

namespace App\Http\Controllers;

use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    protected $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Handle Stripe webhooks
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sig_header,
                config('services.stripe.webhook_secret')
            );
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['success' => false], 400);
        }

        try {
            match ($event['type']) {
                'customer.subscription.updated' => $this->handleSubscriptionUpdated($event),
                'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event),
                'customer.subscription.created' => $this->handleSubscriptionCreated($event),
                'invoice.payment_succeeded' => $this->handlePaymentSucceeded($event),
                'invoice.payment_failed' => $this->handlePaymentFailed($event),
                default => Log::info('Unhandled Stripe event: ' . $event['type']),
            };

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Stripe webhook handling error: ' . $e->getMessage());
            return response()->json(['success' => false], 500);
        }
    }

    /**
     * Handle subscription.updated event
     */
    protected function handleSubscriptionUpdated(array $event): void
    {
        Log::info('Processing subscription.updated event');
        $this->stripeService->syncSubscriptionFromWebhook($event);
    }

    /**
     * Handle subscription.created event
     */
    protected function handleSubscriptionCreated(array $event): void
    {
        Log::info('Processing subscription.created event');
        $this->stripeService->syncSubscriptionFromWebhook($event);
    }

    /**
     * Handle subscription.deleted event
     */
    protected function handleSubscriptionDeleted(array $event): void
    {
        Log::info('Processing subscription.deleted event');
        $data = $event['data']['object'];

        if (isset($data['metadata']['user_id'])) {
            $this->stripeService->syncSubscriptionFromWebhook($event);
        }
    }

    /**
     * Handle invoice.payment_succeeded event
     */
    protected function handlePaymentSucceeded(array $event): void
    {
        Log::info('Processing invoice.payment_succeeded event');
        $invoice = $event['data']['object'];

        // Note: The subscription sync should handle the payment status
        if (isset($invoice['subscription'])) {
            Log::info('Payment succeeded for subscription: ' . $invoice['subscription']);
        }
    }

    /**
     * Handle invoice.payment_failed event
     */
    protected function handlePaymentFailed(array $event): void
    {
        Log::info('Processing invoice.payment_failed event');
        $invoice = $event['data']['object'];

        // Note: Update subscription to pending_payment status
        if (isset($invoice['subscription'])) {
            Log::warning('Payment failed for subscription: ' . $invoice['subscription']);
        }
    }
}
