<?php

namespace App\Services;

use App\Models\VerificationRequest;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class KaraVerifiedBadgePaymentService
{
    public const RETRYABLE_PAYMENT_STATUSES = [
        'failed',
        'abandoned',
        'reversed',
        'cancelled',
        'canceled',
        'declined',
        'expired',
        'timeout',
    ];

    public const ACTIVE_PAYMENT_STATUSES = [
        null,
        '',
        'pending',
        'ongoing',
        'processing',
    ];

    public function markPaystackPaymentIfSuccessful(VerificationRequest $verificationRequest): VerificationRequest
    {
        if ($verificationRequest->payment_status === 'paid') {
            return $this->approvePaidVerificationRequest($verificationRequest);
        }

        $payload = $this->verifyPaystackReference((string) $verificationRequest->payment_reference);

        return $this->processPaystackPayload($verificationRequest, $payload);
    }

    /**
     * @return array<string, mixed>
     */
    public function verifyPaystackReference(string $reference): array
    {
        if ($reference === '') {
            throw new RuntimeException('Missing Paystack reference.');
        }

        $verify = $this->paystackClient()
            ->get('https://api.paystack.co/transaction/verify/' . rawurlencode($reference));

        if (! $verify->ok() || $verify->json('status') !== true) {
            throw new RuntimeException('Unable to verify Paystack payment.');
        }

        $payload = $verify->json('data');
        if (! is_array($payload)) {
            throw new RuntimeException('Invalid Paystack verification response.');
        }

        return $payload;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function processPaystackPayload(VerificationRequest $verificationRequest, array $payload): VerificationRequest
    {
        $status = $this->normalizePaystackStatus((string) ($payload['status'] ?? 'pending'));

        if ($status !== 'success') {
            if ($this->isRetryablePaymentStatus($status)) {
                return $this->markPaymentFailed(
                    $verificationRequest,
                    $status,
                    'Paystack payment was not completed. The user can start a new badge payment.'
                );
            }

            $verificationRequest->forceFill([
                'payment_status' => $status ?: 'pending',
            ])->save();

            return $verificationRequest->fresh();
        }

        $paidAt = $payload['paid_at'] ?? $payload['created_at'] ?? null;

        $verificationRequest->forceFill([
            'payment_status' => 'paid',
            'paid_at' => $paidAt ? \Illuminate\Support\Carbon::parse((string) $paidAt) : now(),
        ])->save();

        return $this->approvePaidVerificationRequest($verificationRequest->fresh());
    }

    public function markPaymentFailed(VerificationRequest $verificationRequest, string $paymentStatus = 'failed', ?string $notes = null): VerificationRequest
    {
        $paymentStatus = $this->normalizePaystackStatus($paymentStatus);
        if ($paymentStatus === 'success' || $paymentStatus === 'paid') {
            return $this->approvePaidVerificationRequest($verificationRequest);
        }

        $verificationRequest->forceFill([
            'status' => VerificationRequest::STATUS_REJECTED,
            'payment_status' => $paymentStatus ?: 'failed',
            'review_notes' => $notes ?: 'Badge payment failed or was abandoned. The user can start a new payment.',
            'reviewed_at' => now(),
        ])->save();

        return $verificationRequest->fresh();
    }

    public function isRetryablePaymentStatus(?string $status): bool
    {
        return in_array($this->normalizePaystackStatus((string) $status), self::RETRYABLE_PAYMENT_STATUSES, true);
    }

    public function isActivePaymentStatus(?string $status): bool
    {
        return in_array($this->normalizePaystackStatus((string) $status), self::ACTIVE_PAYMENT_STATUSES, true);
    }

    public function approvePaidVerificationRequest(VerificationRequest $verificationRequest): VerificationRequest
    {
        if ($verificationRequest->payment_status !== 'paid') {
            return $verificationRequest;
        }

        $verificationRequest->loadMissing('user');

        DB::transaction(function () use ($verificationRequest) {
            $verificationRequest->forceFill([
                'status' => VerificationRequest::STATUS_APPROVED,
                'review_notes' => $verificationRequest->review_notes ?: 'Automatically approved after successful badge payment.',
                'reviewed_by' => null,
                'reviewed_at' => $verificationRequest->reviewed_at ?: now(),
            ])->save();

            if ($verificationRequest->user) {
                $verificationRequest->user->forceFill([
                    'kara_verified_at' => now(),
                    'kara_verified_expires_at' => now()->addDays(30),
                ])->save();
            }
        });

        return $verificationRequest->fresh();
    }

    private function paystackClient(): PendingRequest
    {
        $request = Http::withToken(config('services.paystack.secret_key'))
            ->acceptJson();

        if (! (bool) config('services.paystack.verify_ssl', true)) {
            $request = $request->withoutVerifying();
        }

        return $request;
    }

    private function normalizePaystackStatus(string $status): string
    {
        $status = strtolower(trim($status));

        return match ($status) {
            'success' => 'success',
            'paid' => 'paid',
            'cancelled' => 'cancelled',
            'canceled' => 'cancelled',
            default => $status ?: 'pending',
        };
    }
}
