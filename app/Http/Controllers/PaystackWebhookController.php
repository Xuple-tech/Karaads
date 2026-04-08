<?php

namespace App\Http\Controllers;

use App\Services\DeveloperApiBillingService;
use App\Services\PaystackService;
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
    ) {
    }

    public function callback(Request $request): RedirectResponse
    {
        $reference = (string) ($request->query('reference') ?: $request->query('trxref'));

        if ($reference === '') {
            return redirect()->route('developer-api.billing.index');
        }

        try {
            $payload = $this->paystackService->verifyTransaction($reference);
            $this->creditFromTransactionPayload(data_get($payload, 'data', []));
        } catch (\Throwable $exception) {
            Log::error('Paystack callback verification failed: ' . $exception->getMessage(), [
                'reference' => $reference,
            ]);
        }

        return redirect()->route('developer-api.billing.index');
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
            $this->creditFromTransactionPayload($event['data'] ?? []);
        } catch (\Throwable $exception) {
            Log::error('Paystack webhook handling failed: ' . $exception->getMessage(), [
                'reference' => data_get($event, 'data.reference'),
            ]);

            return response()->json(['success' => false], 500);
        }

        return response()->json(['success' => true]);
    }

    private function creditFromTransactionPayload(array $transaction): void
    {
        if (($transaction['status'] ?? null) !== 'success') {
            return;
        }

        $metadata = $transaction['metadata'] ?? [];
        if (($metadata['purpose'] ?? null) !== 'developer_wallet_topup') {
            return;
        }

        $userId    = $metadata['user_id'] ?? null;
        $reference = $transaction['reference'] ?? null;

        if (! $userId || ! $reference) {
            return;
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
            return;
        }

        $user = User::find($userId);
        if (! $user) {
            Log::warning('Paystack top-up: user not found', ['user_id' => $userId, 'reference' => $reference]);
            return;
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
    }
}
