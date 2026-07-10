<?php

namespace App\Domain\AdsV2\Services;

use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdPayment;
use App\Models\AdsV2\AdWallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AdPaymentService
{
    public function __construct(private readonly WalletLedgerService $walletLedgerService) {}

    /**
     * @return array<string, mixed>
     */
    public function verifyPaystackReference(string $reference): array
    {
        $request = Http::withToken(config('services.paystack.secret_key'))
            ->acceptJson();

        if (! (bool) config('services.paystack.verify_ssl', true)) {
            $request = $request->withoutVerifying();
        }

        $verify = $request->get("https://api.paystack.co/transaction/verify/{$reference}");

        if (! $verify->ok()) {
            throw new RuntimeException('Unable to verify payment');
        }

        $payload = $verify->json();
        if (! is_array($payload)) {
            throw new RuntimeException('Invalid payment verification response');
        }

        return $payload;
    }

    /**
     * @return array{message:string,wallet:?AdWallet}
     */
    public function verifyAndProcessPayment(AdPayment $payment): array
    {
        $payload = $this->verifyPaystackReference($payment->reference);

        return $this->processPaymentOutcome($payment, $payload);
    }

    /**
     * Handle wallet crediting from a Paystack outcome.
     *
     * @param  array<string, mixed>  $payload The Paystack response or webhook payload.
     * @return array{message:string,wallet:?AdWallet}
     */
    public function processPaymentOutcome(AdPayment $payment, array $payload): array
    {
        $status = $this->normalizeProviderStatus($payload);
        $fees = (float) ($payload['data']['fees'] ?? $payload['data']['authorization']['fees'] ?? 0);

        if ($status === null) {
            $payment->raw_payload = $payload;
            $payment->save();

            return ['message' => 'Missing payment status', 'wallet' => $payment->wallet?->fresh()];
        }

        return DB::transaction(function () use ($payment, $payload, $status, $fees): array {
            $lockedPayment = AdPayment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedPayment->status === 'successful') {
                return ['message' => 'Payment already processed', 'wallet' => $lockedPayment->wallet?->fresh()];
            }

            if ($status === 'pending') {
                $lockedPayment->raw_payload = $payload;
                $lockedPayment->save();

                return ['message' => 'Payment is still pending confirmation', 'wallet' => $lockedPayment->wallet?->fresh()];
            }

            if ($status === 'failed') {
                $lockedPayment->status = 'failed';
                $lockedPayment->raw_payload = $payload;
                $lockedPayment->save();

                return ['message' => 'Payment marked as failed', 'wallet' => $lockedPayment->wallet?->fresh()];
            }

            $lockedPayment->status = 'successful';
            $lockedPayment->fees = $fees;
            $lockedPayment->raw_payload = $payload;
            $lockedPayment->save();

            $wallet = AdWallet::query()->whereKey($lockedPayment->ad_wallet_id)->lockForUpdate()->first();
            if ($wallet) {
                $wallet->balance = (float) $wallet->balance + (float) $lockedPayment->amount;
                $wallet->save();

                $this->walletLedgerService->deposit(
                    $wallet,
                    (float) $lockedPayment->amount,
                    $lockedPayment->reference,
                    ['source' => 'paystack', 'fees' => $lockedPayment->fees],
                );
            }

            $campaignId = $lockedPayment->meta['campaign_id'] ?? ($payload['data']['metadata']['campaign_id'] ?? null);
            if (is_string($campaignId) && $campaignId !== '') {
                $campaign = AdCampaign::find($campaignId);
                if ($campaign && ! in_array($campaign->status, ['archived'], true)) {
                    $campaign->last_funded_at = now();

                    // Auto-submit for admin review on payment — only paid campaigns reach the queue
                    if (in_array($campaign->status, ['draft', 'rejected'], true)) {
                        $campaign->status = 'in_review';
                        $campaign->review_submitted_at = now();
                        $campaign->rejected_at = null;
                        $campaign->rejection_reason = null;
                    }

                    if (
                        $campaign->status === 'paused'
                        && $campaign->approved_at !== null
                        && ((float) $campaign->budget_total - (float) $campaign->spent) > 0.000001
                    ) {
                        $campaign->status = 'active';
                    }

                    $campaign->save();

                    // Also submit any draft/rejected creatives so admin can approve them
                    $campaign->creatives()
                        ->whereIn('status', ['draft', 'rejected'])
                        ->update([
                            'status' => 'in_review',
                        ]);
                }
            }

            return ['message' => 'Wallet funded. Your campaign has been submitted for review.', 'wallet' => $wallet?->fresh()];
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function normalizeProviderStatus(array $payload): ?string
    {
        $status = strtolower((string) ($payload['data']['status'] ?? ''));
        if ($status === '') {
            $status = strtolower((string) ($payload['status'] ?? ''));
        }

        if ($status === '' && isset($payload['event'])) {
            $event = strtolower((string) $payload['event']);
            if ($event === 'charge.success') {
                $status = 'success';
            } elseif ($event === 'charge.failed') {
                $status = 'failed';
            }
        }

        if (in_array($status, ['success', 'successful'], true)) {
            return 'successful';
        }

        if (in_array($status, ['failed', 'abandoned', 'reversed', 'cancelled'], true)) {
            return 'failed';
        }

        if (in_array($status, ['pending', 'ongoing', 'processing', 'queued'], true)) {
            return 'pending';
        }

        return null;
    }
}
