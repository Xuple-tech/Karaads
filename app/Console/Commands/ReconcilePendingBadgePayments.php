<?php

namespace App\Console\Commands;

use App\Models\VerificationRequest;
use App\Services\KaraVerifiedBadgePaymentService;
use Illuminate\Console\Command;
use Throwable;

class ReconcilePendingBadgePayments extends Command
{
    protected $signature = 'badge:payments:reconcile-pending
        {--older-than=1 : Minimum payment age in minutes before attempting reconciliation}
        {--limit=100 : Maximum number of pending records to process per run}
        {--fail-stale-after=30 : Mark still-pending payments failed after this many minutes; use 0 to clear all pending payments}
        {--clear-on-error : Admin cleanup mode: mark unverifiable pending payments failed so users can restart}';

    protected $description = 'Verify and reconcile pending Kara Verified Paystack badge payments';

    public function __construct(private readonly KaraVerifiedBadgePaymentService $badgePaymentService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $olderThanMinutes = max(0, (int) $this->option('older-than'));
        $failStaleAfterMinutes = max(0, (int) $this->option('fail-stale-after'));
        $clearOnError = (bool) $this->option('clear-on-error');
        $limit = max(1, min(1000, (int) $this->option('limit')));
        $cutoff = now()->subMinutes($olderThanMinutes);
        $staleCutoff = now()->subMinutes($failStaleAfterMinutes);

        $requests = VerificationRequest::query()
            ->where('payment_provider', 'paystack')
            ->where('status', VerificationRequest::STATUS_PENDING)
            ->where(function ($query): void {
                $query->whereNull('payment_status')
                    ->orWhereIn('payment_status', array_filter(KaraVerifiedBadgePaymentService::ACTIVE_PAYMENT_STATUSES))
                    ->orWhereIn('payment_status', KaraVerifiedBadgePaymentService::RETRYABLE_PAYMENT_STATUSES);
            })
            ->where('created_at', '<=', $cutoff)
            ->orderBy('created_at')
            ->limit($limit)
            ->get();

        $stats = [
            'checked' => 0,
            'approved' => 0,
            'failed' => 0,
            'still_pending' => 0,
            'errors' => 0,
        ];

        foreach ($requests as $request) {
            $stats['checked']++;

            try {
                if ($this->badgePaymentService->isRetryablePaymentStatus($request->payment_status)) {
                    $this->badgePaymentService->markPaymentFailed(
                        $request,
                        (string) $request->payment_status,
                        'Paystack payment was not completed. The user can start a new badge payment.'
                    );
                    $stats['failed']++;
                    continue;
                }

                if (! $request->payment_reference) {
                    if ($clearOnError && $request->created_at?->lte($staleCutoff)) {
                        $this->badgePaymentService->markPaymentFailed(
                            $request,
                            'failed',
                            'Pending badge payment had no Paystack reference during admin cleanup. The user can start a new payment.'
                        );
                        $stats['failed']++;
                        continue;
                    }

                    throw new \RuntimeException('Missing Paystack reference.');
                }

                $fresh = $this->badgePaymentService->markPaystackPaymentIfSuccessful($request);

                if ($fresh->payment_status === 'paid' && $fresh->status === VerificationRequest::STATUS_APPROVED) {
                    $stats['approved']++;
                    continue;
                }

                if (in_array($fresh->payment_status, ['failed', 'abandoned', 'reversed'], true)) {
                    $stats['failed']++;
                    continue;
                }

                if ($this->badgePaymentService->isActivePaymentStatus($fresh->payment_status) && $fresh->created_at?->lte($staleCutoff)) {
                    $this->badgePaymentService->markPaymentFailed(
                        $fresh,
                        'failed',
                        'Pending badge payment expired before completion. The user can start a new payment.'
                    );
                    $stats['failed']++;
                    continue;
                }

                $stats['still_pending']++;
            } catch (Throwable $exception) {
                if ($clearOnError && $request->created_at?->lte($staleCutoff)) {
                    $this->badgePaymentService->markPaymentFailed(
                        $request,
                        'failed',
                        'Pending badge payment could not be verified during admin cleanup. The user can start a new payment.'
                    );
                    $stats['failed']++;
                    $this->warn("badge_payment_reconcile_cleared reference={$request->payment_reference} error={$exception->getMessage()}");
                    continue;
                }

                $stats['errors']++;
                $this->warn("badge_payment_reconcile_error reference={$request->payment_reference} error={$exception->getMessage()}");
            }
        }

        $this->info(
            'badge:payments:reconcile-pending complete ' .
            "checked={$stats['checked']} approved={$stats['approved']} " .
            "failed={$stats['failed']} still_pending={$stats['still_pending']} errors={$stats['errors']}"
        );

        return self::SUCCESS;
    }
}
