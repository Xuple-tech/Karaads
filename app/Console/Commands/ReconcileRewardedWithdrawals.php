<?php

namespace App\Console\Commands;

use App\Models\AdsV2\AdPayoutItem;
use App\Models\UserWallet;
use App\Services\InterfaceApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

class ReconcileRewardedWithdrawals extends Command
{
    protected $signature = 'rewarded:withdrawals:reconcile
        {--apply : Persist successful/failed provider status changes}
        {--limit=100 : Maximum withdrawal references to check}
        {--older-than=0 : Only check withdrawals requested at least this many minutes ago}
        {--reference= : Check one withdrawal reference}
        {--return-manual-pending : Return queued manual-processing withdrawals to users when stored provider message is a failure/unavailable state}
        {--only-return-manual-pending : Only include queued manual-processing withdrawals that are safe to return}';

    protected $description = 'Reconcile pending rewarded withdrawal groups against Interface TSQ status';

    public function __construct(private readonly InterfaceApiService $interfaceApiService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $limit = max(1, (int) $this->option('limit'));
        $olderThanMinutes = max(0, (int) $this->option('older-than'));
        $referenceFilter = trim((string) $this->option('reference'));
        $returnManualPending = (bool) $this->option('return-manual-pending');
        $onlyReturnManualPending = (bool) $this->option('only-return-manual-pending');

        $groups = $this->pendingGroups($referenceFilter, $olderThanMinutes)
            ->when($onlyReturnManualPending, fn (Collection $items) => $items->filter(function (Collection $group): bool {
                $latest = $group->sortByDesc('updated_at')->first();
                $meta = is_array($latest?->meta) ? $latest->meta : [];
                $transfer = is_array($meta['withdrawal_response'] ?? null) ? $meta['withdrawal_response'] : [];

                return $this->isReturnableManualPending($meta, $transfer);
            }))
            ->take($limit);

        if ($groups->isEmpty()) {
            $this->info('No pending rewarded withdrawals matched.');

            return self::SUCCESS;
        }

        $summary = [
            'checked' => 0,
            'success' => 0,
            'failed' => 0,
            'pending' => 0,
            'errors' => 0,
            'completed_amount' => 0.0,
            'returned_amount' => 0.0,
            'pending_amount' => 0.0,
        ];

        $this->info(($apply ? 'Applying' : 'Dry-running') . " rewarded withdrawal reconciliation for {$groups->count()} reference(s).");
        $this->newLine();

        foreach ($groups as $reference => $items) {
            /** @var Collection<int, AdPayoutItem> $items */
            $summary['checked']++;
            $amount = round((float) $items->sum('amount'), 2);

            $resolved = $this->resolveStatus((string) $reference, $items, $returnManualPending);

            if ($resolved['error'] !== null) {
                $summary['errors']++;
                $this->warn("{$reference}: {$resolved['error']}");
                continue;
            }

            $status = $resolved['status'];
            $payload = $resolved['payload'];

            $summary[$status] = ($summary[$status] ?? 0) + 1;

            if ($status === 'success') {
                $summary['completed_amount'] += $amount;
            } elseif ($status === 'failed') {
                $summary['returned_amount'] += $amount;
            } else {
                $summary['pending_amount'] += $amount;
            }

            $this->line(sprintf(
                '%s: %s %s%s',
                $reference,
                strtoupper($status),
                number_format($amount, 2),
                ($resolved['source'] ? " via {$resolved['source']}" : '') . ($apply ? '' : ' (dry-run)')
            ));

            if ($apply) {
                $this->applyStatus((string) $reference, $status, $payload, (string) $resolved['source']);
            }
        }

        $this->newLine();
        $this->table(
            ['Checked', 'Success', 'Failed', 'Pending', 'Errors', 'Completed amount', 'Returned amount', 'Still pending amount'],
            [[
                $summary['checked'],
                $summary['success'],
                $summary['failed'],
                $summary['pending'],
                $summary['errors'],
                number_format($summary['completed_amount'], 2),
                number_format($summary['returned_amount'], 2),
                number_format($summary['pending_amount'], 2),
            ]]
        );

        if (! $apply) {
            $this->comment('Dry-run only. Re-run with --apply to update wallet balances and payout item statuses.');
        }

        return $summary['errors'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * @param Collection<int, AdPayoutItem> $items
     * @return array{status:string,payload:array<string,mixed>,source:string,error:?string}
     */
    private function resolveStatus(string $reference, Collection $items, bool $returnManualPending): array
    {
        $latest = $items->sortByDesc('updated_at')->first();
        $meta = is_array($latest?->meta) ? $latest->meta : [];
        $transfer = is_array($meta['withdrawal_response'] ?? null) ? $meta['withdrawal_response'] : [];
        $storedStatus = $this->normalizeTransferStatus($transfer);

        if (in_array($storedStatus, ['success', 'failed'], true)) {
            return [
                'status' => $storedStatus,
                'payload' => $transfer,
                'source' => 'stored-response',
                'error' => null,
            ];
        }

        if ($returnManualPending && $this->isReturnableManualPending($meta, $transfer)) {
            $transfer['forced_return_reason'] = 'manual-pending-provider-unavailable';

            return [
                'status' => 'failed',
                'payload' => $transfer,
                'source' => 'manual-pending-return',
                'error' => null,
            ];
        }

        try {
            $payload = $this->interfaceApiService->tsq($reference);

            return [
                'status' => $this->normalizeTransferStatus($payload),
                'payload' => $payload,
                'source' => 'tsq',
                'error' => null,
            ];
        } catch (Throwable $exception) {
            return [
                'status' => 'pending',
                'payload' => [],
                'source' => 'tsq',
                'error' => 'unable to fetch TSQ status (' . $exception->getMessage() . ')',
            ];
        }
    }

    private function isReturnableManualPending(array $meta, array $transfer): bool
    {
        if (($meta['withdrawal_manual_processing'] ?? false) !== true) {
            return false;
        }

        $message = strtolower(trim(implode(' ', [
            (string) ($transfer['message'] ?? ''),
            (string) ($transfer['provider_message'] ?? ''),
            (string) ($meta['withdrawal_provider_message'] ?? ''),
        ])));

        if ($message === '') {
            return false;
        }

        return str_contains($message, 'service is unavailable')
            || str_contains($message, 'transfer failed')
            || str_contains($message, 'bank transfer request failed');
    }

    /**
     * @return Collection<string, Collection<int, AdPayoutItem>>
     */
    private function pendingGroups(string $referenceFilter, int $olderThanMinutes): Collection
    {
        $cutoff = $olderThanMinutes > 0 ? now()->subMinutes($olderThanMinutes) : null;

        return AdPayoutItem::query()
            ->with('user:id,email,name')
            ->where('source', 'rewarded')
            ->where('status', 'processing')
            ->whereNotNull('meta->withdrawal_reference')
            ->get()
            ->groupBy(fn (AdPayoutItem $item) => (string) ((is_array($item->meta) ? ($item->meta['withdrawal_reference'] ?? '') : '') ?: ''))
            ->filter(function (Collection $items, string $reference) use ($referenceFilter, $cutoff): bool {
                if ($reference === '') {
                    return false;
                }

                if ($referenceFilter !== '' && $reference !== $referenceFilter) {
                    return false;
                }

                if ($cutoff === null) {
                    return true;
                }

                $latest = $items->sortByDesc('updated_at')->first();
                $meta = is_array($latest?->meta) ? $latest->meta : [];
                $requestedAt = (string) ($meta['withdrawal_requested_at'] ?? '');
                $timestamp = $requestedAt !== ''
                    ? Carbon::parse($requestedAt)
                    : ($latest?->updated_at ?? $latest?->created_at);

                return $timestamp !== null && $timestamp->lessThanOrEqualTo($cutoff);
            })
            ->sortBy(function (Collection $items): string {
                $latest = $items->sortByDesc('updated_at')->first();
                $meta = is_array($latest?->meta) ? $latest->meta : [];

                return (string) ($meta['withdrawal_requested_at'] ?? $latest?->created_at?->toIso8601String() ?? '');
            });
    }

    private function applyStatus(string $reference, string $status, array $statusPayload, string $source): void
    {
        DB::transaction(function () use ($reference, $status, $statusPayload, $source): void {
            $items = AdPayoutItem::query()
                ->where('source', 'rewarded')
                ->where('status', 'processing')
                ->where('meta->withdrawal_reference', $reference)
                ->lockForUpdate()
                ->get();

            if ($items->isEmpty()) {
                return;
            }

            $affectedAmount = (float) $items->sum('amount');
            $userId = (string) $items->first()->user_id;

            foreach ($items as $item) {
                $meta = is_array($item->meta) ? $item->meta : [];
                $meta['tsq_response'] = $statusPayload;
                $meta['tsq_status'] = $status;
                $meta['tsq_checked_at'] = now()->toIso8601String();
                $meta['reconciled_from'] = $source;

                if ($status === 'success') {
                    $item->status = 'completed';
                    $item->paid_at = now();
                    $meta['withdrawal_status'] = 'success';
                    $meta['withdrawal_completed_at'] = now()->toIso8601String();
                } elseif ($status === 'failed') {
                    if (($meta['synthetic_withdrawal_allocation'] ?? false) === true) {
                        $item->delete();
                        continue;
                    }

                    $item->status = 'completed';
                    $meta['failed_withdrawal_reference'] = $reference;
                    $meta['withdrawal_failed'] = true;
                    $meta['withdrawal_status'] = 'returned';
                    $meta['withdrawal_returned_at'] = now()->toIso8601String();
                    $meta['withdrawal_return_reason'] = $this->withdrawalReturnReason($statusPayload);
                    unset($meta['withdrawal_reference'], $meta['bank_code'], $meta['account_number']);
                } else {
                    $item->status = 'processing';
                }

                $item->meta = $meta;
                $item->save();
            }

            if (! in_array($status, ['success', 'failed'], true) || $affectedAmount <= 0) {
                return;
            }

            $wallet = UserWallet::query()
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->first();

            if (! $wallet) {
                return;
            }

            $wallet->pending_withdrawal = max(0, (float) $wallet->pending_withdrawal - $affectedAmount);

            if ($status === 'success') {
                $wallet->total_withdrawn = (float) $wallet->total_withdrawn + $affectedAmount;
            } else {
                $wallet->balance = (float) $wallet->balance + $affectedAmount;
            }

            $wallet->save();
        });
    }

    private function withdrawalReturnReason(array $transfer): string
    {
        $message = trim((string) (
            $transfer['message']
            ?? $transfer['provider_message']
            ?? data_get($transfer, 'data.message')
            ?? ''
        ));

        return $message !== '' ? $message : 'Transfer was not confirmed successful.';
    }

    private function normalizeTransferStatus(array $payload): string
    {
        $status = strtolower((string) ($payload['status'] ?? ''));
        $statusCode = (int) ($payload['status_code'] ?? 0);
        $data = is_array($payload['data'] ?? null) ? $payload['data'] : [];

        $dataStatus = strtolower((string) ($data['status'] ?? ''));
        $responseCode = (string) ($data['response_code'] ?? $payload['response_code'] ?? '');
        $success = $payload['success'] ?? $data['success'] ?? null;

        if ($statusCode === 200 && ($status === 'success' || $dataStatus === 'success')) {
            return 'success';
        }

        if (in_array($responseCode, ['00', '0', 'SUCCESS'], true)) {
            return 'success';
        }

        if ($success === true) {
            return 'success';
        }

        if (in_array($status, ['failed', 'error'], true) || in_array($dataStatus, ['failed', 'error'], true)) {
            return 'failed';
        }

        return 'pending';
    }
}
