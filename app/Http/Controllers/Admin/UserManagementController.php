<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ImportUsersFromCsv;
use App\Models\Earning;
use App\Models\AdsV2\AdPayoutItem;
use App\Models\User;
use App\Models\UserWallet;
use App\Models\VerificationRequest;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();
        $verificationFilter = $request->query('verification');

        if ($verificationFilter === 'requests') {
            $verificationCutoff = now()->subDay()->startOfDay();

            $query->where(function ($verificationQuery) use ($verificationCutoff) {
                $verificationQuery
                    ->whereHas('verificationRequests', function ($requestQuery) use ($verificationCutoff) {
                        $requestQuery->where('created_at', '>=', $verificationCutoff);
                    })
                    // Older profile builds did not persist the Verify click, so keep recent users visible
                    // for manual review instead of losing requests from yesterday.
                    ->orWhere('created_at', '>=', $verificationCutoff);
            });
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'verification']),
            'title' => $verificationFilter === 'requests' ? 'Verification Requests' : 'Users',
            'description' => $verificationFilter === 'requests'
                ? 'Users who submitted a Kara Verified request from yesterday onward are shown here, plus recent fallback candidates while request tracking is repaired.'
                : null,
            'isVerificationPage' => $verificationFilter === 'requests',
        ]);
    }

    public function creators(Request $request)
    {
        // Assuming creators are users who have posted content or have earnings
        $query = User::whereHas('posts')
            ->orWhereHas('earnings');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
            'title' => 'Content Creators',
        ]);
    }

    public function viewers(Request $request)
    {
        // Assuming viewers are users who haven't posted content
        $query = User::doesntHave('posts');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
            'title' => 'Viewers',
        ]);
    }

    public function show(User $user)
    {
        $user->loadCount(['posts', 'followers', 'following', 'comments', 'likes']);
        $user->loadMissing(['wallet']);

        $earningsHistory = $this->safeAdminUserData(
            fn () => $this->allEarningsHistory($user),
            'earnings history',
            $user,
            []
        );
        $transactions = $this->safeAdminUserData(
            fn () => $this->recentMoneyMovementsForUser($user),
            'recent money movements',
            $user,
            []
        );
        $withdrawals = $this->safeAdminUserData(
            fn () => $this->rewardedWithdrawalsForUser($user),
            'rewarded withdrawals',
            $user,
            []
        );
        $platformWithdrawals = $this->safeAdminUserData(
            fn () => $this->recentPlatformWithdrawals(),
            'platform withdrawals',
            $user,
            []
        );
        $verificationRequest = $this->safeAdminUserData(
            fn () => $this->latestVerificationRequestForUser($user),
            'verification request',
            $user,
            null
        );
        
        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'earningsHistory' => $earningsHistory,
            'transactions' => $transactions,
            'withdrawals' => $withdrawals,
            'platformWithdrawals' => $platformWithdrawals,
            'verificationRequest' => $verificationRequest,
            'isKaraVerified' => $user->kara_verified_at !== null,
            'karaVerifiedAt' => $user->kara_verified_at?->toIso8601String(),
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'username' => 'required|string|unique:users,username,' . $user->id,
            'bio' => 'nullable|string|max:1000',
        ]);

        $user->update($validated);

        return redirect()->route('admin.users.show', $user->id)
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    public function toggleStatus(User $user)
    {
        $transitions = [
            'active' => 'suspended',
            'suspended' => 'active',
            'inactive' => 'active',
            'banned' => 'active',
        ];

        $nextStatus = $transitions[$user->status] ?? 'suspended';

        $user->update(['status' => $nextStatus]);

        return back()->with('success', "User status changed to {$nextStatus}.");
    }

    public function disable(User $user)
    {
        if ($user->status === 'suspended' || $user->status === 'banned') {
            return back()->with('info', 'User is already disabled.');
        }

        $user->update(['status' => 'suspended']);

        return back()->with('success', 'User disabled successfully.');
    }

    public function enable(User $user)
    {
        if ($user->status === 'active') {
            return back()->with('info', 'User is already active.');
        }

        $user->update(['status' => 'active']);

        return back()->with('success', 'User enabled successfully.');
    }

    public function earnings(User $user)
    {
        $earnings = $user->earnings()->latest()->paginate(15);
        
        return Inertia::render('Admin/Users/Earnings', [
            'user' => $user,
            'earnings' => $earnings,
        ]);
    }

    public function posts(User $user)
    {
        $posts = $user->posts()->latest()->paginate(15);
        
        return Inertia::render('Admin/Users/Posts', [
            'user' => $user,
            'posts' => $posts,
        ]);
    }

    public function wallet(User $user)
    {
        $wallet = $user->wallet ?? $user->wallet()->create();
        
        return Inertia::render('Admin/Users/Wallet', [
            'user' => $user,
            'wallet' => array_merge($wallet->toArray(), [
                'post_earnings' => $this->postEarningsForUser($user),
            ]),
            'withdrawals' => $this->rewardedWithdrawalsForUser($user),
        ]);
    }

    public function adjustWallet(Request $request, User $user)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'type' => 'required|in:credit,debit',
            'description' => 'required|string',
        ]);

        $wallet = $user->wallet ?? $user->wallet()->create();
        
        if ($request->type === 'credit') {
            $wallet->balance += $request->amount;
        } else {
            if ((float) $wallet->balance < (float) $request->amount) {
                return back()->withErrors([
                    'amount' => 'Debit amount exceeds current balance.',
                ]);
            }
            $wallet->balance -= $request->amount;
        }
        
        $wallet->save();

        // Log the transaction (if we had a transaction log model, which we should)
        // For now just update the wallet

        return back()->with('success', 'Wallet adjusted successfully.');
    }

    public function resetPassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password reset successfully.');
    }

    public function grantKaraVerified(User $user)
    {
        $user->forceFill([
            'kara_verified_at' => now(),
            'kara_verified_expires_at' => now()->addDays(30),
        ])->save();

        return back()->with('success', 'Kara Verified granted for 30 days.');
    }

    public function revokeKaraVerified(User $user)
    {
        $user->forceFill([
            'kara_verified_at' => null,
            'kara_verified_expires_at' => null,
        ])->save();

        return back()->with('success', 'Kara Verified removed successfully.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);

        $storedPath = $request->file('csv_file')->store('admin-imports', 'local');

        ImportUsersFromCsv::dispatch($storedPath, $request->user()?->id);

        return back()->with('success', 'User import has been queued and will be processed by a worker.');
    }

    private function recentMoneyMovementsForUser(User $user): array
    {
        $earnings = Earning::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(8)
            ->get()
            ->map(function (Earning $earning): array {
                return [
                    'id' => 'earning-' . $earning->id,
                    'type' => 'earning',
                    'label' => 'Earning',
                    'reference' => (string) ($earning->transaction_id ?: $earning->id),
                    'amount' => round((float) $earning->amount, 2),
                    'status' => strtolower((string) ($earning->status ?: 'pending')),
                    'note' => trim(implode(' ', array_filter([
                        (string) ($earning->earning_type ?: ''),
                        (string) ($earning->description ?: ''),
                    ]))),
                    'occurred_at' => $earning->paid_at?->toIso8601String() ?? $earning->created_at?->toIso8601String(),
                ];
            });

        $rewardedWithdrawals = collect($this->rewardedWithdrawalsForUser($user))
            ->take(8)
            ->map(function (array $withdrawal): array {
                return [
                    'id' => 'rewarded-withdrawal-' . ($withdrawal['reference'] ?? ''),
                    'type' => 'rewarded_withdrawal',
                    'label' => 'Rewarded withdrawal',
                    'reference' => (string) ($withdrawal['reference'] ?? ''),
                    'amount' => round((float) ($withdrawal['amount'] ?? 0), 2),
                    'status' => strtolower((string) ($withdrawal['status'] ?? 'pending')),
                    'note' => trim((string) ($withdrawal['provider_message'] ?? '')),
                    'occurred_at' => (string) ($withdrawal['updated_at'] ?? $withdrawal['created_at'] ?? ''),
                ];
            });

        $withdrawalRequests = $user->withdrawalRequests()
            ->latest()
            ->limit(8)
            ->get()
            ->map(function (WithdrawalRequest $withdrawal): array {
                return [
                    'id' => 'withdrawal-request-' . $withdrawal->id,
                    'type' => 'withdrawal_request',
                    'label' => 'Wallet withdrawal',
                    'reference' => (string) ($withdrawal->transaction_id ?: $withdrawal->id),
                    'amount' => round((float) $withdrawal->amount, 2),
                    'status' => strtolower((string) ($withdrawal->status ?: 'pending')),
                    'note' => trim(implode(' ', array_filter([
                        (string) ($withdrawal->payout_method ?: ''),
                        (string) ($withdrawal->rejection_reason ?: ''),
                    ]))),
                    'occurred_at' => $withdrawal->completed_at?->toIso8601String()
                        ?? $withdrawal->processed_at?->toIso8601String()
                        ?? $withdrawal->created_at?->toIso8601String(),
                ];
            });

        return collect()
            ->concat($earnings)
            ->concat($rewardedWithdrawals)
            ->concat($withdrawalRequests)
            ->sortByDesc(fn (array $transaction) => (string) ($transaction['occurred_at'] ?? ''))
            ->take(10)
            ->values()
            ->all();
    }

    private function allEarningsHistory(User $user): array
    {
        return Earning::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(200)
            ->get()
            ->map(function (Earning $earning): array {
                return [
                    'id' => 'earning-history-' . $earning->id,
                    'type' => (string) ($earning->earning_type ?: 'earning'),
                    'reference' => (string) ($earning->transaction_id ?: $earning->id),
                    'amount' => round((float) $earning->amount, 2),
                    'status' => strtolower((string) ($earning->status ?: 'pending')),
                    'description' => trim((string) ($earning->description ?: '')),
                    'post_id' => (string) ($earning->post_id ?: ''),
                    'paid_at' => $earning->paid_at?->toIso8601String(),
                    'created_at' => $earning->created_at?->toIso8601String(),
                ];
            })
            ->values()
            ->all();
    }

    private function recentPlatformWithdrawals(): array
    {
        $manual = WithdrawalRequest::query()
            ->with('user')
            ->latest()
            ->limit(25)
            ->get()
            ->map(function (WithdrawalRequest $withdrawal): array {
                try {
                    $detailUrl = route('admin.withdrawals.show', $withdrawal);
                } catch (\Throwable) {
                    $detailUrl = null;
                }

                return [
                    'id' => 'manual-' . $withdrawal->id,
                    'type' => 'manual',
                    'label' => 'Manual withdrawal',
                    'reference' => (string) ($withdrawal->transaction_id ?: $withdrawal->id),
                    'amount' => round((float) $withdrawal->amount, 2),
                    'currency' => (string) ($withdrawal->currency ?: 'NGN'),
                    'status' => strtolower((string) ($withdrawal->status ?: 'pending')),
                    'method' => (string) ($withdrawal->payout_method ?: ''),
                    'user' => [
                        'id' => (string) ($withdrawal->user?->id ?: ''),
                        'name' => (string) ($withdrawal->user?->name ?: 'Unknown user'),
                        'email' => (string) ($withdrawal->user?->email ?: ''),
                    ],
                    'note' => trim((string) ($withdrawal->rejection_reason ?: '')),
                    'occurred_at' => $withdrawal->updated_at?->toIso8601String()
                        ?? $withdrawal->created_at?->toIso8601String(),
                    'detail_url' => $withdrawal->user ? $detailUrl : null,
                ];
            });

        $rewarded = AdPayoutItem::query()
            ->with('user')
            ->where('source', 'rewarded')
            ->whereNotNull('meta->withdrawal_reference')
            ->latest()
            ->limit(50)
            ->get()
            ->groupBy(fn (AdPayoutItem $item) => (string) ((is_array($item->meta) ? ($item->meta['withdrawal_reference'] ?? '') : '') ?: ''))
            ->filter(fn ($items, $reference) => $reference !== '')
            ->map(function ($items, string $reference): array {
                /** @var \Illuminate\Support\Collection<int, AdPayoutItem> $items */
                $latest = $items->sortByDesc('updated_at')->first();
                $meta = $latest && is_array($latest->meta) ? $latest->meta : [];
                $transfer = is_array($meta['withdrawal_response'] ?? null) ? $meta['withdrawal_response'] : [];
                $user = $latest?->user;

                return [
                    'id' => 'rewarded-' . $reference,
                    'type' => 'rewarded',
                    'label' => 'Kara Ads withdrawal',
                    'reference' => $reference,
                    'amount' => round((float) ($meta['withdrawal_gross_amount'] ?? $items->sum('amount')), 2),
                    'currency' => 'NGN',
                    'status' => $this->rewardedWithdrawalStatus($latest?->status, $meta, $transfer),
                    'method' => 'interface_api',
                    'user' => [
                        'id' => (string) ($user?->id ?: ''),
                        'name' => (string) ($user?->name ?: 'Unknown user'),
                        'email' => (string) ($user?->email ?: ''),
                    ],
                    'note' => (string) ($transfer['message'] ?? ''),
                    'occurred_at' => ($meta['withdrawal_requested_at'] ?? null)
                        ?: $items->sortBy('created_at')->first()?->created_at?->toIso8601String(),
                    'detail_url' => $user ? route('admin.users.show', $user) : null,
                ];
            });

        return collect()
            ->concat($manual)
            ->concat($rewarded)
            ->sortByDesc(fn (array $withdrawal) => (string) ($withdrawal['occurred_at'] ?? ''))
            ->take(10)
            ->values()
            ->all();
    }

    private function rewardedWithdrawalsForUser(User $user): array
    {
        $bankNames = $this->interfaceBankNameMap();

        return AdPayoutItem::query()
            ->where('user_id', $user->id)
            ->where('source', 'rewarded')
            ->whereNotNull('meta->withdrawal_reference')
            ->orderByDesc('updated_at')
            ->limit(50)
            ->get()
            ->groupBy(fn (AdPayoutItem $item) => (string) (is_array($item->meta) ? ($item->meta['withdrawal_reference'] ?? '') : ''))
            ->filter(fn ($items, $reference) => $reference !== '')
            ->map(function ($items, string $reference) use ($bankNames) {
                /** @var \Illuminate\Support\Collection<int, AdPayoutItem> $items */
                $latest = $items->sortByDesc('updated_at')->first();
                $meta = $latest && is_array($latest->meta) ? $latest->meta : [];
                $transfer = is_array($meta['withdrawal_response'] ?? null) ? $meta['withdrawal_response'] : [];
                $status = $this->rewardedWithdrawalStatus($latest?->status, $meta, $transfer);

                return [
                    'reference' => $reference,
                    'amount' => round((float) $items->sum('amount'), 2),
                    'status' => $status,
                    'account_number' => (string) ($meta['account_number'] ?? ''),
                    'bank_code' => (string) ($meta['bank_code'] ?? ''),
                    'bank_name' => $this->rewardedWithdrawalBankName((string) ($meta['bank_code'] ?? ''), $meta, $transfer, $bankNames),
                    'account_name' => $this->rewardedWithdrawalAccountName($meta, $transfer),
                    'provider_reference' => (string) ($transfer['refrence'] ?? $transfer['reference'] ?? ''),
                    'provider_message' => (string) ($transfer['message'] ?? ''),
                    'created_at' => $items->sortBy('created_at')->first()?->created_at?->toISOString(),
                    'updated_at' => $items->sortByDesc('updated_at')->first()?->updated_at?->toISOString(),
                ];
            })
            ->values()
            ->all();
    }

    private function rewardedWithdrawalBankName(string $bankCode, array $meta, array $transfer, array $bankNames): string
    {
        foreach ([
            'bank_name',
            'data.bank_name',
            'result.bank_name',
            'response.bank_name',
        ] as $path) {
            $value = data_get($transfer, $path);
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        foreach ([
            'bank_name',
            'bankName',
            'InstitutionName',
        ] as $key) {
            $value = $meta[$key] ?? null;
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        $bankCode = trim($bankCode);

        return $bankCode !== '' && isset($bankNames[$bankCode])
            ? $bankNames[$bankCode]
            : $bankCode;
    }

    private function rewardedWithdrawalAccountName(array $meta, array $transfer): string
    {
        foreach ([
            'account_name',
            'data.account_name',
            'result.account_name',
            'response.account_name',
            'beneficiary_name',
            'data.beneficiary_name',
            'result.beneficiary_name',
            'response.beneficiary_name',
            'name',
            'data.name',
        ] as $path) {
            $value = data_get($transfer, $path);
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        foreach (['account_name', 'accountName'] as $key) {
            $value = $meta[$key] ?? null;
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return '';
    }

    private function interfaceBankNameMap(): array
    {
        try {
            $banks = app(\App\Services\InterfaceApiService::class)->bankList();
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
            return 'success';
        }

        $tsqStatus = strtolower((string) ($meta['tsq_status'] ?? ''));
        if (in_array($tsqStatus, ['success', 'failed', 'pending'], true)) {
            return $tsqStatus;
        }

        $transferStatus = strtolower((string) ($transfer['status'] ?? ''));
        $transferCode = (int) ($transfer['status_code'] ?? 0);
        $transferMessage = strtolower((string) ($transfer['message'] ?? ''));

        if ($transferStatus === 'success' || $transferCode === 200 || str_contains($transferMessage, 'completed')) {
            return 'success';
        }

        if (in_array($transferStatus, ['failed', 'error'], true)
            || str_contains($transferMessage, 'failed')
            || str_contains($transferMessage, 'unavailable')
        ) {
            return 'failed';
        }

        return $itemStatus === 'processing' ? 'pending' : ($itemStatus ?: 'pending');
    }

    private function postEarningsForUser(User $user): float
    {
        return round((float) $user->posts()
            ->where('reward_status', 'credited')
            ->sum('reward_amount'), 2);
    }

    private function latestVerificationRequestForUser(User $user): ?array
    {
        /** @var VerificationRequest|null $request */
        $request = $user->verificationRequests()
            ->with('reviewer')
            ->latest()
            ->first();

        if (! $request) {
            return null;
        }

        return [
            'id' => $request->id,
            'status' => $request->status,
            'category' => $request->category,
            'full_name' => $request->full_name,
            'contact_email' => $request->contact_email,
            'reason' => $request->reason,
            'portfolio_url' => $request->portfolio_url,
            'social_url' => $request->social_url,
            'followers_count_snapshot' => $request->followers_count_snapshot,
            'review_notes' => $request->review_notes,
            'reviewed_at' => $request->reviewed_at?->toIso8601String(),
            'reviewer_name' => $request->reviewer?->name,
            'created_at' => $request->created_at?->toIso8601String(),
        ];
    }

    private function safeAdminUserData(callable $callback, string $label, User $user, mixed $fallback = []): mixed
    {
        try {
            return $callback();
        } catch (\Throwable $exception) {
            Log::warning('Admin user detail data load failed', [
                'label' => $label,
                'user_id' => $user->id,
                'email' => $user->email,
                'message' => $exception->getMessage(),
            ]);

            return $fallback;
        }
    }
}
