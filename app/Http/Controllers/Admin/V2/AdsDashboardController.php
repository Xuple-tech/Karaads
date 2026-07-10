<?php

namespace App\Http\Controllers\Admin\V2;

use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdCreative;
use App\Models\AdsV2\AdEvent;
use App\Models\AdsV2\AdPayment;
use App\Models\AdsV2\AdWallet;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdsDashboardController extends Controller
{
    private const PAID_STATUSES = ['successful', 'success', 'paid'];

    public function index(): Response
    {
        $campaigns = AdCampaign::query();
        $events = AdEvent::query()->where('invalidated', false);
        $paidPayments = AdPayment::query()->whereIn('status', self::PAID_STATUSES);

        $totalBudget = (float) (clone $campaigns)->sum('budget_total');
        $totalSpent = (float) (clone $campaigns)->sum('spent');
        $billableRevenue = (float) (clone $events)->where('is_billable', true)->sum('billed_amount');
        $impressions = (int) (clone $events)->where('event_type', 'impression')->count();
        $clicks = (int) (clone $events)->where('event_type', 'click')->count();

        return Inertia::render('Admin/V2/Ads/Dashboard/Index', [
            'summary' => [
                'campaigns_total' => (clone $campaigns)->count(),
                'campaigns_active' => (clone $campaigns)->where('status', 'active')->count(),
                'campaigns_review' => (clone $campaigns)->where('status', 'in_review')->count(),
                'creatives_total' => AdCreative::count(),
                'creatives_active' => AdCreative::where('status', 'active')->count(),
                'payments_total' => AdPayment::count(),
                'payments_successful' => (clone $paidPayments)->count(),
                'payments_pending' => AdPayment::where('status', 'pending')->count(),
                'wallet_balance' => (float) AdWallet::sum('balance'),
                'total_budget' => $totalBudget,
                'total_spent' => $totalSpent,
                'remaining_budget' => max(0, $totalBudget - $totalSpent),
                'paid_amount' => (float) (clone $paidPayments)->sum('amount'),
                'billable_revenue' => $billableRevenue,
                'impressions' => $impressions,
                'clicks' => $clicks,
                'ctr' => $impressions > 0 ? round(($clicks / $impressions) * 100, 2) : 0,
            ],
            'statusBreakdown' => $this->statusBreakdown(),
            'dailyPerformance' => $this->dailyPerformance(),
            'recentCampaigns' => $this->recentCampaigns(),
            'recentPayments' => $this->recentPayments(),
        ]);
    }

    private function statusBreakdown(): array
    {
        return AdCampaign::query()
            ->select('status', DB::raw('COUNT(*) as total'), DB::raw('SUM(budget_total) as budget'), DB::raw('SUM(spent) as spent'))
            ->groupBy('status')
            ->orderByDesc('total')
            ->get()
            ->map(fn (AdCampaign $row) => [
                'status' => $row->status,
                'total' => (int) $row->total,
                'budget' => (float) $row->budget,
                'spent' => (float) $row->spent,
            ])
            ->values()
            ->all();
    }

    private function dailyPerformance(): array
    {
        $from = now()->subDays(13)->startOfDay();
        $rows = AdEvent::query()
            ->where('invalidated', false)
            ->where('created_at', '>=', $from)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw("SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END) as impressions"),
                DB::raw("SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks"),
                DB::raw("SUM(CASE WHEN is_billable = 1 THEN billed_amount ELSE 0 END) as revenue"),
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        return collect(range(13, 0))
            ->map(function (int $daysAgo) use ($rows) {
                $date = now()->subDays($daysAgo)->toDateString();
                $row = $rows->get($date);

                return [
                    'date' => $date,
                    'impressions' => (int) ($row->impressions ?? 0),
                    'clicks' => (int) ($row->clicks ?? 0),
                    'revenue' => (float) ($row->revenue ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    private function recentCampaigns(): array
    {
        return AdCampaign::query()
            ->with('user:id,name,email,username')
            ->withCount('creatives')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (AdCampaign $campaign) => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'status' => $campaign->status,
                'objective' => $campaign->objective,
                'budget_total' => (float) $campaign->budget_total,
                'spent' => (float) $campaign->spent,
                'creatives_count' => (int) $campaign->creatives_count,
                'advertiser' => $campaign->user ? [
                    'name' => $campaign->user->name,
                    'email' => $campaign->user->email,
                    'username' => $campaign->user->username,
                ] : null,
                'created_at' => $campaign->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    private function recentPayments(): array
    {
        return AdPayment::query()
            ->with('wallet.account.user:id,name,email,username')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (AdPayment $payment) => [
                'id' => $payment->id,
                'reference' => $payment->reference,
                'amount' => (float) $payment->amount,
                'status' => $payment->status,
                'provider' => $payment->provider,
                'created_at' => $payment->created_at?->toIso8601String(),
                'advertiser' => $payment->wallet?->account?->user ? [
                    'name' => $payment->wallet->account->user->name,
                    'email' => $payment->wallet->account->user->email,
                    'username' => $payment->wallet->account->user->username,
                ] : null,
            ])
            ->values()
            ->all();
    }
}
