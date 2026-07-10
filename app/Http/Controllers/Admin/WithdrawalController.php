<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdPayoutItem;
use App\Models\WithdrawalRequest;
use App\Services\InterfaceApiService;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Withdrawals/Index', $this->withdrawalIndexProps($request));
    }

    public function pending(Request $request)
    {
        $request->merge(['status' => WithdrawalRequest::STATUS_PENDING]);

        return Inertia::render('Admin/Withdrawals/Index', $this->withdrawalIndexProps($request));
    }

    public function completed(Request $request)
    {
        $request->merge(['status' => WithdrawalRequest::STATUS_COMPLETED]);

        return Inertia::render('Admin/Withdrawals/Index', $this->withdrawalIndexProps($request));
    }

    public function rejected(Request $request)
    {
        $request->merge(['status' => WithdrawalRequest::STATUS_REJECTED]);

        return Inertia::render('Admin/Withdrawals/Index', $this->withdrawalIndexProps($request));
    }

    public function show(WithdrawalRequest $withdrawalRequest)
    {
        $withdrawalRequest->load(['user', 'wallet']);
        
        return Inertia::render('Admin/Withdrawals/Show', [
            'withdrawal' => $withdrawalRequest,
        ]);
    }

    public function approve(Request $request, WithdrawalRequest $withdrawalRequest)
    {
        $request->validate([
            'transaction_id' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        if ($withdrawalRequest->status !== WithdrawalRequest::STATUS_PENDING) {
            return back()->withErrors(['error' => 'Only pending withdrawals can be approved.']);
        }

        $withdrawalRequest->approve($request->transaction_id);
        
        if ($request->admin_notes) {
            $withdrawalRequest->update(['admin_notes' => $request->admin_notes]);
        }

        return redirect()->route('admin.withdrawals.show', $withdrawalRequest->id)
            ->with('success', 'Withdrawal request approved and processing.');
    }

    public function reject(Request $request, WithdrawalRequest $withdrawalRequest)
    {
        $request->validate([
            'rejection_reason' => 'required|string',
            'admin_notes' => 'nullable|string',
        ]);

        if ($withdrawalRequest->status !== WithdrawalRequest::STATUS_PENDING) {
            return back()->withErrors(['error' => 'Only pending withdrawals can be rejected.']);
        }

        $withdrawalRequest->reject($request->rejection_reason);
        
        if ($request->admin_notes) {
            $withdrawalRequest->update(['admin_notes' => $request->admin_notes]);
        }

        return redirect()->route('admin.withdrawals.show', $withdrawalRequest->id)
            ->with('success', 'Withdrawal request rejected.');
    }

    public function complete(Request $request, WithdrawalRequest $withdrawalRequest)
    {
        $request->validate([
            'transaction_id' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        if ($withdrawalRequest->status !== WithdrawalRequest::STATUS_PROCESSING) {
            return back()->withErrors(['error' => 'Only processing withdrawals can be completed.']);
        }

        $withdrawalRequest->complete();
        
        if ($request->transaction_id) {
            $withdrawalRequest->update(['transaction_id' => $request->transaction_id]);
        }
        
        if ($request->admin_notes) {
            $withdrawalRequest->update(['admin_notes' => $request->admin_notes]);
        }

        return redirect()->route('admin.withdrawals.show', $withdrawalRequest->id)
            ->with('success', 'Withdrawal marked as completed.');
    }

    public function transactions(WithdrawalRequest $withdrawalRequest)
    {
        // This might be for showing transaction history related to a withdrawal or user
        // For now, let's just redirect to show
        return redirect()->route('admin.withdrawals.show', $withdrawalRequest->id);
    }

    public function process(WithdrawalRequest $withdrawalRequest)
    {
        if ($withdrawalRequest->status !== WithdrawalRequest::STATUS_PENDING) {
            return back()->withErrors(['error' => 'Only pending withdrawals can be moved to processing.']);
        }

        $withdrawalRequest->update([
            'status' => WithdrawalRequest::STATUS_PROCESSING,
            'processed_at' => now(),
        ]);

        return redirect()->route('admin.withdrawals.show', $withdrawalRequest->id)
            ->with('success', 'Withdrawal moved to processing.');
    }

    private function withdrawalIndexProps(Request $request): array
    {
        return [
            'withdrawals' => $this->combinedWithdrawals($request),
            'summary' => $this->withdrawalSummary(),
            'filters' => $request->only(['search', 'status', 'method', 'source']),
            'statuses' => [
                WithdrawalRequest::STATUS_PENDING,
                WithdrawalRequest::STATUS_PROCESSING,
                WithdrawalRequest::STATUS_COMPLETED,
                WithdrawalRequest::STATUS_REJECTED,
                WithdrawalRequest::STATUS_FAILED,
                'success',
            ],
            'methods' => [
                WithdrawalRequest::PAYOUT_PAYPAL,
                WithdrawalRequest::PAYOUT_BANK,
                WithdrawalRequest::PAYOUT_CRYPTO,
                WithdrawalRequest::PAYOUT_PAYONEER,
                'interface_api',
            ],
            'sources' => [
                'manual',
                'rewarded',
            ],
        ];
    }

    private function combinedWithdrawals(Request $request): LengthAwarePaginator
    {
        $bankNames = $this->interfaceBankNameMap();

        $manual = WithdrawalRequest::with('user')->get()->map(function (WithdrawalRequest $withdrawal) use ($bankNames) {
            $details = is_array($withdrawal->payout_details ?? null) ? $withdrawal->payout_details : [];

            return [
                'id' => (string) $withdrawal->id,
                'amount' => (string) $withdrawal->amount,
                'currency' => (string) ($withdrawal->currency ?: 'NGN'),
                'payout_method' => (string) $withdrawal->payout_method,
                'status' => (string) $withdrawal->status,
                'created_at' => optional($withdrawal->created_at)?->toISOString(),
                'account_number' => (string) ($details['account_number'] ?? ''),
                'bank_code' => (string) ($details['bank_code'] ?? ''),
                'bank_name' => $this->withdrawalBankName($details, [], $bankNames),
                'account_name' => $this->withdrawalAccountName($details, []),
                'user' => [
                    'id' => (string) $withdrawal->user?->id,
                    'name' => (string) ($withdrawal->user?->name ?: 'Unknown user'),
                    'email' => (string) ($withdrawal->user?->email ?: ''),
                ],
                'source' => 'manual',
                'detail_url' => route('admin.withdrawals.show', $withdrawal),
            ];
        });

        $rewarded = AdPayoutItem::query()
            ->with('user')
            ->where('source', 'rewarded')
            ->whereNotNull('meta->withdrawal_reference')
            ->get()
            ->groupBy(fn (AdPayoutItem $item) => (string) ((is_array($item->meta) ? ($item->meta['withdrawal_reference'] ?? '') : '') ?: ''))
            ->filter(fn (Collection $items, string $reference) => $reference !== '')
            ->map(function (Collection $items, string $reference) use ($bankNames) {
                /** @var AdPayoutItem|null $latest */
                $latest = $items->sortByDesc('updated_at')->first();
                $meta = $latest && is_array($latest->meta) ? $latest->meta : [];
                $transfer = is_array($meta['withdrawal_response'] ?? null) ? $meta['withdrawal_response'] : [];
                $user = $latest?->user;

                return [
                    'id' => $reference,
                    'amount' => (string) round((float) ($meta['withdrawal_gross_amount'] ?? $items->sum('amount')), 2),
                    'net_amount' => (string) round((float) ($meta['withdrawal_net_amount'] ?? max(0, (float) $items->sum('amount'))), 2),
                    'fee_amount' => (string) round((float) ($meta['withdrawal_fee_amount'] ?? 0), 2),
                    'currency' => 'NGN',
                    'payout_method' => 'interface_api',
                    'status' => $this->rewardedWithdrawalStatus($latest?->status, $meta, $transfer),
                    'created_at' => ($meta['withdrawal_requested_at'] ?? null)
                        ?: $items->sortBy('created_at')->first()?->created_at?->toISOString(),
                    'reference' => $reference,
                    'account_number' => (string) ($meta['account_number'] ?? ''),
                    'bank_code' => (string) ($meta['bank_code'] ?? ''),
                    'bank_name' => $this->withdrawalBankName($meta, $transfer, $bankNames),
                    'account_name' => $this->withdrawalAccountName($meta, $transfer),
                    'provider_reference' => (string) ($transfer['refrence'] ?? $transfer['reference'] ?? ''),
                    'provider_message' => trim((string) (
                        $transfer['provider_message']
                        ?? $transfer['message']
                        ?? data_get($transfer, 'data.message', '')
                    )),
                    'user' => [
                        'id' => (string) ($user?->id ?: ''),
                        'name' => (string) ($user?->name ?: 'Unknown user'),
                        'email' => (string) ($user?->email ?: ''),
                    ],
                    'source' => 'rewarded',
                    'detail_url' => $user ? route('admin.users.show', $user) : null,
                ];
            })
            ->values();

        $combined = $manual->concat($rewarded)->filter(function (array $withdrawal) use ($request) {
            $search = trim((string) $request->string('search'));
            $status = trim((string) $request->string('status'));
            $method = trim((string) $request->string('method'));
            $source = trim((string) $request->string('source'));

            if ($search !== '') {
                $haystack = strtolower(implode(' ', [
                    $withdrawal['id'],
                    $withdrawal['user']['name'] ?? '',
                    $withdrawal['user']['email'] ?? '',
                ]));

                if (! str_contains($haystack, strtolower($search))) {
                    return false;
                }
            }

            if ($status !== '' && $withdrawal['status'] !== $status) {
                return false;
            }

            if ($method !== '' && $withdrawal['payout_method'] !== $method) {
                return false;
            }

            if ($source !== '' && $withdrawal['source'] !== $source) {
                return false;
            }

            return true;
        })->sortByDesc('created_at')->values();

        $page = max(1, (int) $request->integer('page', 1));
        $perPage = 15;
        $items = $combined->slice(($page - 1) * $perPage, $perPage)->values();

        return new LengthAwarePaginator(
            $items,
            $combined->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ],
        );
    }

    private function withdrawalBankName(array $details, array $transfer, array $bankNames): string
    {
        $bankName = $this->detailValue($transfer, ['bank_name', 'bank', 'bankName', 'InstitutionName']);
        if ($bankName !== '') {
            return $bankName;
        }

        $bankName = $this->detailValue($details, ['bank_name', 'bank', 'bankName', 'InstitutionName']);
        if ($bankName !== '') {
            return $bankName;
        }

        $bankCode = $this->detailValue($details, ['bank_code', 'bankCode', 'InstitutionCode', 'sort_code']);
        if ($bankCode === '') {
            $bankCode = $this->detailValue($transfer, ['bank_code', 'bankCode', 'InstitutionCode', 'sort_code']);
        }

        return $bankCode !== '' && isset($bankNames[$bankCode])
            ? $bankNames[$bankCode]
            : $bankCode;
    }

    private function withdrawalAccountName(array $details, array $transfer): string
    {
        return $this->detailValue($transfer, [
            'account_name',
            'accountName',
            'beneficiary_name',
            'beneficiaryName',
            'name',
            'data.account_name',
            'data.accountName',
            'result.account_name',
            'result.accountName',
            'response.account_name',
            'response.accountName',
        ]) ?: $this->detailValue($details, ['account_name', 'accountName', 'beneficiary_name', 'beneficiaryName', 'name']);
    }

    private function detailValue(array $source, array $paths): string
    {
        foreach ($paths as $path) {
            $value = data_get($source, $path);
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }

            if (is_numeric($value)) {
                return (string) $value;
            }
        }

        return '';
    }

    private function interfaceBankNameMap(): array
    {
        try {
            $banks = app(InterfaceApiService::class)->bankList();
        } catch (\Throwable) {
            return [];
        }

        $bankList = is_array(data_get($banks, 'data')) ? data_get($banks, 'data') : (is_array($banks) ? $banks : []);
        $map = [];

        foreach ($bankList as $bank) {
            if (! is_array($bank)) {
                continue;
            }

            $code = trim((string) (
                $bank['bank_code']
                ?? $bank['code']
                ?? $bank['InstitutionCode']
                ?? $bank['sort_code']
                ?? ''
            ));
            $name = trim((string) (
                $bank['bank_name']
                ?? $bank['name']
                ?? $bank['bank']
                ?? $bank['InstitutionName']
                ?? ''
            ));

            if ($code !== '' && $name !== '') {
                $map[$code] = $name;
            }
        }

        return $map;
    }

    private function rewardedWithdrawalStatus(?string $itemStatus, array $meta, array $transfer): string
    {
        $withdrawalStatus = strtolower((string) ($meta['withdrawal_status'] ?? ''));
        if (in_array($withdrawalStatus, ['returned', 'failed', 'cancelled'], true)
            || filter_var($meta['withdrawal_failed'] ?? false, FILTER_VALIDATE_BOOLEAN)
        ) {
            return 'failed';
        }
        if (in_array($withdrawalStatus, ['success', 'completed'], true)) {
            return 'completed';
        }

        $tsqStatus = strtolower((string) ($meta['tsq_status'] ?? ''));
        if (in_array($tsqStatus, ['success', 'failed', 'pending'], true)) {
            return $tsqStatus;
        }

        $transferStatus = strtolower((string) ($transfer['status'] ?? ''));
        $transferCode = (int) ($transfer['status_code'] ?? 0);
        $transferMessage = strtolower((string) ($transfer['message'] ?? ''));

        if ($transferStatus === 'success' || $transferCode === 200 || str_contains($transferMessage, 'completed')) {
            return 'completed';
        }

        if (in_array($transferStatus, ['failed', 'error'], true)
            || str_contains($transferMessage, 'failed')
            || str_contains($transferMessage, 'unavailable')
        ) {
            return 'failed';
        }

        return $itemStatus === 'processing' ? 'pending' : ($itemStatus ?: 'pending');
    }

    private function withdrawalSummary(): array
    {
        $manual = WithdrawalRequest::query()
            ->selectRaw('COUNT(*) as count, COUNT(DISTINCT user_id) as users, COALESCE(SUM(amount), 0) as amount')
            ->first();

        $rewardedGroups = AdPayoutItem::query()
            ->with('user')
            ->where('source', 'rewarded')
            ->whereNotNull('meta->withdrawal_reference')
            ->get()
            ->groupBy(fn (AdPayoutItem $item) => (string) ((is_array($item->meta) ? ($item->meta['withdrawal_reference'] ?? '') : '') ?: ''))
            ->filter(fn (Collection $items, string $reference) => $reference !== '');

        $rewardedAmount = 0.0;
        $rewardedUsers = collect();

        foreach ($rewardedGroups as $items) {
            /** @var Collection<int, AdPayoutItem> $items */
            $latest = $items->sortByDesc('updated_at')->first();
            $meta = $latest && is_array($latest->meta) ? $latest->meta : [];
            $rewardedAmount += (float) ($meta['withdrawal_gross_amount'] ?? $items->sum('amount'));
            if ($latest?->user_id) {
                $rewardedUsers->push((string) $latest->user_id);
            }
        }

        return [
            'manual' => [
                'count' => (int) ($manual?->count ?? 0),
                'users' => (int) ($manual?->users ?? 0),
                'amount' => round((float) ($manual?->amount ?? 0), 2),
            ],
            'kara_ads_balance' => [
                'count' => $rewardedGroups->count(),
                'users' => $rewardedUsers->unique()->count(),
                'amount' => round($rewardedAmount, 2),
            ],
        ];
    }
}
