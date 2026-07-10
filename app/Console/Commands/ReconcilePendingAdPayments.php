<?php

namespace App\Console\Commands;

use App\Domain\AdsV2\Services\AdPaymentService;
use App\Models\AdsV2\AdPayment;
use Illuminate\Console\Command;
use Throwable;

class ReconcilePendingAdPayments extends Command
{
    protected $signature = 'ads:payments:reconcile-pending
        {--older-than=2 : Minimum payment age in minutes before attempting reconciliation}
        {--limit=100 : Maximum number of pending records to process per run}';

    protected $description = 'Verify and reconcile pending Ads Paystack top-up payments';

    public function __construct(private readonly AdPaymentService $adPaymentService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $olderThanMinutes = max(0, (int) $this->option('older-than'));
        $limit = max(1, min(1000, (int) $this->option('limit')));
        $cutoff = now()->subMinutes($olderThanMinutes);

        $pendingPayments = AdPayment::query()
            ->where('provider', 'paystack')
            ->where('status', 'pending')
            ->where('created_at', '<=', $cutoff)
            ->orderBy('created_at')
            ->limit($limit)
            ->get();

        $stats = [
            'checked' => 0,
            'successful' => 0,
            'failed' => 0,
            'still_pending' => 0,
            'errors' => 0,
        ];

        foreach ($pendingPayments as $payment) {
            $stats['checked']++;

            try {
                $this->adPaymentService->verifyAndProcessPayment($payment);
                $status = $payment->fresh()?->status;

                if ($status === 'successful') {
                    $stats['successful']++;
                    continue;
                }

                if ($status === 'failed') {
                    $stats['failed']++;
                    continue;
                }

                $stats['still_pending']++;
            } catch (Throwable $e) {
                $stats['errors']++;
                $this->warn("payment_reconcile_error reference={$payment->reference} error={$e->getMessage()}");
            }
        }

        $this->info(
            'ads:payments:reconcile-pending complete ' .
            "checked={$stats['checked']} successful={$stats['successful']} " .
            "failed={$stats['failed']} still_pending={$stats['still_pending']} errors={$stats['errors']}"
        );

        return self::SUCCESS;
    }
}

