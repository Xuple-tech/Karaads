<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdPayoutItem;
use App\Models\Earning;
use App\Models\Post;
use App\Models\PostMonetization;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EarningController extends Controller
{
    public function index(Request $request)
    {
        $query = Earning::with(['user', 'post']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('earning_type', $request->type);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $earnings = $query->latest()->paginate(15)->withQueryString();
        [$withdrawals, $totalWithdrawals] = $this->combinedWithdrawals($request);

        return Inertia::render('Admin/Earnings/Index', [
            'earnings' => $earnings,
            'withdrawals' => $withdrawals,
            'filters' => $request->only(['search', 'status', 'type', 'date_from', 'date_to']),
            'statuses' => [
                Earning::STATUS_PENDING,
                Earning::STATUS_PROCESSING,
                Earning::STATUS_PAID,
                Earning::STATUS_FAILED,
            ],
            'types' => [
                Earning::TYPE_AD_IMPRESSION,
                Earning::TYPE_AD_CLICK,
                Earning::TYPE_AD_CONVERSION,
                Earning::TYPE_CONTENT_CREATOR,
                Earning::TYPE_REFERRAL,
                Earning::TYPE_BONUS,
            ],
            'financialSummary' => [
                'total_earnings' => (float) Earning::query()->sum('amount'),
                'paid_earnings' => (float) Earning::query()->where('status', Earning::STATUS_PAID)->sum('amount'),
                'total_withdrawals' => $totalWithdrawals,
            ],
        ]);
    }

    public function daily(Request $request)
    {
        $query = Earning::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(amount) as total_amount'),
            DB::raw('COUNT(*) as count')
        )
        ->groupBy('date')
        ->orderBy('date', 'desc');

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $dailyEarnings = $query->paginate(30)->withQueryString();

        return Inertia::render('Admin/Earnings/Daily', [
            'dailyEarnings' => $dailyEarnings,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function monthly(Request $request)
    {
        $query = Earning::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('SUM(amount) as total_amount'),
            DB::raw('COUNT(*) as count')
        )
        ->groupBy('month')
        ->orderBy('month', 'desc');

        if ($request->has('year')) {
            $query->whereYear('created_at', $request->year);
        }

        $monthlyEarnings = $query->paginate(12)->withQueryString();

        return Inertia::render('Admin/Earnings/Monthly', [
            'monthlyEarnings' => $monthlyEarnings,
            'filters' => $request->only(['year']),
        ]);
    }

    public function byUser(Request $request)
    {
        $query = Earning::select(
            'user_id',
            DB::raw('SUM(amount) as total_amount'),
            DB::raw('COUNT(*) as count')
        )
        ->with('user')
        ->groupBy('user_id')
        ->orderByDesc('total_amount');

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $userEarnings = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Earnings/ByUser', [
            'userEarnings' => $userEarnings,
            'filters' => $request->only(['search']),
        ]);
    }

    public function byPost(Request $request, ?Post $post = null)
    {
        $query = Earning::select(
            'post_id',
            DB::raw('SUM(amount) as total_amount'),
            DB::raw('COUNT(*) as count')
        )
        ->with(['post.user', 'post.monetization'])
        ->whereNotNull('post_id')
        ->groupBy('post_id')
        ->orderByDesc('total_amount');

        $postEarnings = $query->paginate(15)->withQueryString();
        $selectedPost = $post?->load(['user', 'monetization']);
        $selectedPostStats = null;

        if ($selectedPost) {
            $selectedPostStats = [
                'total_amount' => (float) $selectedPost->earnings()->sum('amount'),
                'transactions' => $selectedPost->earnings()->count(),
                'pending_amount' => (float) $selectedPost->earnings()->where('status', Earning::STATUS_PENDING)->sum('amount'),
                'paid_amount' => (float) $selectedPost->earnings()->where('status', Earning::STATUS_PAID)->sum('amount'),
            ];
        }

        return Inertia::render('Admin/Earnings/ByPost', [
            'postEarnings' => $postEarnings,
            'selectedPost' => $selectedPost,
            'selectedPostStats' => $selectedPostStats,
            'statusOptions' => [
                PostMonetization::STATUS_ACTIVE,
                PostMonetization::STATUS_PAUSED,
                PostMonetization::STATUS_BLOCKED,
            ],
        ]);
    }

    public function updatePostMonetization(Request $request, Post $post)
    {
        $validated = $request->validate([
            'is_monetized' => ['required', 'boolean'],
            'ad_integration' => ['required', 'boolean'],
            'monetization_status' => ['required', 'in:active,paused,blocked'],
            'cpm_rate' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'cpc_rate' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'revenue_share' => ['required', 'numeric', 'min:0', 'max:1'],
            'total_earnings' => ['required', 'numeric', 'min:0'],
            'estimated_earnings' => ['required', 'numeric', 'min:0'],
            'total_impressions' => ['required', 'integer', 'min:0'],
            'total_clicks' => ['required', 'integer', 'min:0'],
        ]);

        if ($validated['monetization_status'] === PostMonetization::STATUS_BLOCKED) {
            $validated['is_monetized'] = false;
            $validated['ad_integration'] = false;
        }

        if ($validated['monetization_status'] === PostMonetization::STATUS_ACTIVE) {
            $validated['is_monetized'] = true;
        }

        PostMonetization::query()->updateOrCreate(
            ['post_id' => $post->id],
            [
                'id' => $post->monetization?->id ?? (string) Str::uuid(),
                'user_id' => $post->user_id,
                ...$validated,
            ],
        );

        return back()->with('success', 'Post earnings controls updated.');
    }

    public function reports()
    {
        $statusBreakdown = Earning::query()
            ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total_amount'))
            ->groupBy('status')
            ->get();

        $typeBreakdown = Earning::query()
            ->select('earning_type', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total_amount'))
            ->groupBy('earning_type')
            ->orderByDesc('total_amount')
            ->get();

        return Inertia::render('Admin/Earnings/Reports', [
            'statusBreakdown' => $statusBreakdown,
            'typeBreakdown' => $typeBreakdown,
            'totals' => [
                'pending' => Earning::query()->where('status', Earning::STATUS_PENDING)->sum('amount'),
                'processing' => Earning::query()->where('status', Earning::STATUS_PROCESSING)->sum('amount'),
                'paid' => Earning::query()->where('status', Earning::STATUS_PAID)->sum('amount'),
                'failed' => Earning::query()->where('status', Earning::STATUS_FAILED)->sum('amount'),
            ],
        ]);
    }
    
    public function export(Request $request)
    {
        // Implementation for export would go here
        // For now just redirect back with message
        return back()->with('success', 'Export started. You will receive an email when it is ready.');
    }

    public function processPayout(Request $request, Earning $earning)
    {
        $validated = $request->validate([
            'transaction_id' => ['required', 'string', 'max:191'],
            'payout_method' => ['required', 'string', 'max:100'],
        ]);

        if ($earning->status === Earning::STATUS_PAID) {
            return back()->with('info', 'This earning is already paid.');
        }

        $earning->markAsPaid($validated['transaction_id'], $validated['payout_method']);

        return back()->with('success', 'Earning payout processed successfully.');
    }

    public function batchProcess(Request $request)
    {
        $validated = $request->validate([
            'earning_ids' => ['required', 'array', 'min:1'],
            'earning_ids.*' => ['string', 'exists:earnings,id'],
            'payout_method' => ['required', 'string', 'max:100'],
        ]);

        $earnings = Earning::query()
            ->whereIn('id', $validated['earning_ids'])
            ->whereIn('status', [Earning::STATUS_PENDING, Earning::STATUS_PROCESSING])
            ->get();

        foreach ($earnings as $earning) {
            $earning->markAsPaid('batch-' . $earning->id, $validated['payout_method']);
        }

        return back()->with('success', $earnings->count() . ' earnings marked as paid.');
    }

    private function combinedWithdrawals(Request $request): array
    {
        $manual = WithdrawalRequest::with('user')->get()->map(function (WithdrawalRequest $withdrawal) {
            return [
                'id' => (string) $withdrawal->id,
                'amount' => (string) $withdrawal->amount,
                'currency' => (string) ($withdrawal->currency ?: 'NGN'),
                'payout_method' => (string) $withdrawal->payout_method,
                'status' => (string) $withdrawal->status,
                'created_at' => optional($withdrawal->created_at)?->toISOString(),
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
            ->map(function (Collection $items, string $reference) {
                /** @var AdPayoutItem|null $latest */
                $latest = $items->sortByDesc('updated_at')->first();
                $meta = $latest && is_array($latest->meta) ? $latest->meta : [];
                $transfer = is_array($meta['withdrawal_response'] ?? null) ? $meta['withdrawal_response'] : [];
                $user = $latest?->user;

                return [
                    'id' => $reference,
                    'amount' => (string) round((float) $items->sum('amount'), 2),
                    'currency' => 'NGN',
                    'payout_method' => 'interface_api',
                    'status' => $this->rewardedWithdrawalStatus($latest?->status, $meta, $transfer),
                    'created_at' => $items->sortBy('created_at')->first()?->created_at?->toISOString(),
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

        $combined = $manual
            ->concat($rewarded)
            ->sortByDesc('created_at')
            ->values();

        $page = max(1, (int) $request->integer('withdrawals_page', 1));
        $perPage = 10;
        $items = $combined->slice(($page - 1) * $perPage, $perPage)->values();

        return [
            new LengthAwarePaginator(
                $items,
                $combined->count(),
                $perPage,
                $page,
                [
                    'path' => $request->url(),
                    'pageName' => 'withdrawals_page',
                    'query' => $request->query(),
                ],
            ),
            (float) $combined->sum(fn (array $withdrawal) => (float) $withdrawal['amount']),
        ];
    }

    private function rewardedWithdrawalStatus(?string $itemStatus, array $meta, array $transfer): string
    {
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

        if (in_array($transferStatus, ['failed', 'error'], true)) {
            return 'failed';
        }

        return $itemStatus === 'processing' ? 'pending' : ($itemStatus ?: 'pending');
    }
}
