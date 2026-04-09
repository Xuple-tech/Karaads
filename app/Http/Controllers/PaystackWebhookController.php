<?php

namespace App\Http\Controllers;

use App\Services\DeveloperApiBillingService;
use App\Services\PaystackService;
use App\Services\SubscriptionService;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaystackWebhookController extends Controller
{
    public function __construct(
        private readonly PaystackService $paystackService,
        private readonly DeveloperApiBillingService $billingService,
        private readonly SubscriptionService $subscriptionService,
    ) {
    }

    public function callback(Request $request): RedirectResponse
    {
        $reference = (string) ($request->query('reference') ?: $request->query('trxref'));

        if ($reference === '') {
            return redirect()->to('/subscription');
        }

        try {
            $payload = $this->paystackService->verifyTransaction($reference);
            $redirect = $this->handleTransactionPayload(data_get($payload, 'data', []));

            if ($redirect) {
                return redirect()->to($redirect);
            }
        } catch (\Throwable $exception) {
            Log::error('Paystack callback verification failed: ' . $exception->getMessage(), [
                'reference' => $reference,
            ]);

            return redirect()->to('/subscription?payment=failed&provider=paystack');
        }

        return redirect()->to('/subscription?payment=success&provider=paystack');
    }

    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('x-paystack-signature');

        if (! $this->paystackService->hasValidSignature($payload, $signature)) {
            return response()->json(['success' => false], 400);
        }

        $event = $request->json()->all();

        if (($event['event'] ?? null) !== 'charge.success') {
            return response()->json(['success' => true]);
        }

        try {
            $this->handleTransactionPayload($event['data'] ?? []);
        } catch (\Throwable $exception) {
            Log::error('Paystack webhook handling failed: ' . $exception->getMessage(), [
                'reference' => data_get($event, 'data.reference'),
            ]);

            return response()->json(['success' => false], 500);
        }

        return response()->json(['success' => true]);
    }

    private function handleTransactionPayload(array $transaction): ?string
    {
        if (($transaction['status'] ?? null) !== 'success') {
            return null;
        }

        $metadata = $transaction['metadata'] ?? [];

        return match ($metadata['purpose'] ?? null) {
            'developer_wallet_topup' => $this->creditFromTransactionPayload($transaction),
            'subscription_checkout' => $this->activateSubscriptionFromTransactionPayload($transaction),
            default => null,
        };
    }

    private function creditFromTransactionPayload(array $transaction): ?string
    {
        $metadata = $transaction['metadata'] ?? [];

        $userId    = $metadata['user_id'] ?? null;
        $reference = $transaction['reference'] ?? null;

        if (! $userId || ! $reference) {
            return null;
        }

        $amountUsd = (float) ($metadata['amount_usd'] ?? 0);
        if ($amountUsd <= 0) {
            $amountUsd = $this->paystackService->convertCheckoutMinorAmountToUsd(
                (float) ($transaction['amount'] ?? 0),
                (string) ($transaction['currency'] ?? $metadata['checkout_currency'] ?? $this->paystackService->getCheckoutCurrency()),
                isset($metadata['checkout_exchange_rate']) ? (float) $metadata['checkout_exchange_rate'] : null,
            );
        }

        if ($amountUsd <= 0) {
            Log::warning('Paystack top-up: could not determine USD amount', [
                'reference' => $reference,
                'metadata'  => $metadata,
            ]);
            return null;
        }

        $user = User::find($userId);
        if (! $user) {
            Log::warning('Paystack top-up: user not found', ['user_id' => $userId, 'reference' => $reference]);
            return null;
        }

        $this->billingService->creditWallet(
            $user,
            $amountUsd,
            'topup',
            'Paystack top-up $' . number_format($amountUsd, 2),
            ['paystack_reference' => $reference, 'metadata' => $metadata],
            $reference,
        );

        Log::info('Developer wallet credited via Paystack', [
            'user_id'    => $userId,
            'amount_usd' => $amountUsd,
            'reference'  => $reference,
        ]);

        return route('developer-api.billing.index');
    }

    private function activateSubscriptionFromTransactionPayload(array $transaction): ?string
    {
        $metadata = $transaction['metadata'] ?? [];
        $userId = $metadata['user_id'] ?? null;
        $planId = $metadata['plan_id'] ?? null;
        $reference = $transaction['reference'] ?? null;
        $billingPeriod = in_array(($metadata['billing_period'] ?? 'monthly'), ['monthly', 'yearly'], true)
            ? $metadata['billing_period']
            : 'monthly';

        if (! $userId || ! $planId || ! $reference) {
            return '/subscription?payment=failed&provider=paystack';
        }

        $user = User::find($userId);
        $plan = SubscriptionPlan::find($planId);

        if (! $user || ! $plan) {
            Log::warning('Paystack subscription activation missing user or plan', [
                'user_id' => $userId,
                'plan_id' => $planId,
                'reference' => $reference,
            ]);

            return '/subscription?payment=failed&provider=paystack';
        }

        $existing = Subscription::query()
            ->where('user_id', $user->id)
            ->where('external_subscription_id', $reference)
            ->latest()
            ->first();

        if (! $existing) {
            $subscription = $this->subscriptionService->upgradePlan($user, $plan, 'paystack', $billingPeriod);
            $amountUsd = (float) ($metadata['amount_usd'] ?? 0);

            $subscription->update([
                'external_subscription_id' => $reference,
                'amount_paid' => $amountUsd > 0
                    ? $amountUsd
                    : $this->paystackService->convertCheckoutMinorAmountToUsd(
                        (float) ($transaction['amount'] ?? 0),
                        (string) ($transaction['currency'] ?? $metadata['checkout_currency'] ?? $this->paystackService->getCheckoutCurrency()),
                        isset($metadata['checkout_exchange_rate']) ? (float) $metadata['checkout_exchange_rate'] : null,
                    ),
                'billing_period' => $billingPeriod,
            ]);

            Log::info('Subscription activated via Paystack', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'reference' => $reference,
                'billing_period' => $billingPeriod,
            ]);
        }

        return '/subscription?payment=success&provider=paystack&plan=' . urlencode($plan->slug);
    }
}
