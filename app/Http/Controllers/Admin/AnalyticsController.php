<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdCreative;
use App\Models\AdsV2\AdPayment;
use App\Models\AdsV2\AdEvent;
use App\Models\User;
use App\Models\Post;
use App\Models\VerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    private const MONETIZATION_FEE_AMOUNT = 5000.00;

    public function index()
    {
        // Summary Stats
        $totalUsers = User::count();
        $newUsersToday = User::whereDate('created_at', Carbon::today())->count();
        
        $totalRevenue = AdEvent::where('is_billable', true)->sum('billed_amount');
        $revenueToday = AdEvent::where('is_billable', true)
            ->whereDate('created_at', Carbon::today())
            ->sum('billed_amount');
        
        $totalPosts = Post::count();
        $postsToday = Post::whereDate('created_at', Carbon::today())->count();
        
        $activeAds = AdCreative::where('status', 'active')->count();

        // Revenue Chart Data (Last 30 days)
        $revenueData = AdEvent::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(billed_amount) as total')
        )
        ->where('is_billable', true)
        ->where('created_at', '>=', Carbon::now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // User Growth Chart Data (Last 30 days)
        $userGrowthData = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', Carbon::now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        return Inertia::render('Admin/Analytics/Index', [
            'stats' => [
                'total_users' => $totalUsers,
                'new_users_today' => $newUsersToday,
                'total_revenue' => $totalRevenue,
                'revenue_today' => $revenueToday,
                'total_posts' => $totalPosts,
                'posts_today' => $postsToday,
                'active_ads' => $activeAds,
            ],
            'charts' => [
                'revenue' => $revenueData,
                'user_growth' => $userGrowthData,
            ],
        ]);
    }

    public function revenue(Request $request)
    {
        $period = $request->get('period', '30_days');
        $startDate = $this->getStartDate($period);

        $revenueData = AdEvent::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(billed_amount) as total'),
            DB::raw('event_type as earning_type')
        )
        ->where('is_billable', true)
        ->where('created_at', '>=', $startDate)
        ->groupBy('date', 'event_type')
        ->orderBy('date')
        ->get();

        $revenueByType = AdEvent::select(
            'event_type as earning_type',
            DB::raw('SUM(billed_amount) as total')
        )
        ->where('is_billable', true)
        ->where('created_at', '>=', $startDate)
        ->groupBy('event_type')
        ->get();

        return Inertia::render('Admin/Analytics/Revenue', [
            'revenueData' => $revenueData,
            'revenueByType' => $revenueByType,
            'period' => $period,
        ]);
    }

    public function users(Request $request)
    {
        $period = $request->get('period', '30_days');
        $startDate = $this->getStartDate($period);

        $userGrowth = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', $startDate)
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        return Inertia::render('Admin/Analytics/Users', [
            'userGrowth' => $userGrowth,
            'period' => $period,
        ]);
    }

    public function engagement(Request $request)
    {
        $period = $request->get('period', '30_days');
        $startDate = $this->getStartDate($period);

        // This would ideally aggregate likes, comments, shares, etc.
        // For now, let's just count posts created
        $postsCreated = Post::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', $startDate)
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        return Inertia::render('Admin/Analytics/Engagement', [
            'postsCreated' => $postsCreated,
            'period' => $period,
        ]);
    }

    public function adsPerformance(Request $request)
    {
        $period = $request->get('period', '30_days');
        $startDate = $this->getStartDate($period);

        $adStats = AdEvent::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('event_type as interaction_type'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', $startDate)
        ->groupBy('date', 'event_type')
        ->orderBy('date')
        ->get();

        return Inertia::render('Admin/Analytics/AdsPerformance', [
            'adStats' => $adStats,
            'period' => $period,
        ]);
    }

    private function getStartDate($period)
    {
        switch ($period) {
            case '7_days':
                return Carbon::now()->subDays(7);
            case '30_days':
                return Carbon::now()->subDays(30);
            case '90_days':
                return Carbon::now()->subDays(90);
            case '1_year':
                return Carbon::now()->subYear();
            default:
                return Carbon::now()->subDays(30);
        }
    }

    // ... other methods can remain as placeholders or be implemented similarly
    
    public function topCreators()
    {
        $topCreators = User::query()
            ->withCount('posts')
            ->withSum('earnings', 'amount')
            ->orderByDesc('earnings_sum_amount')
            ->limit(50)
            ->get();

        return Inertia::render('Admin/Analytics/TopCreators', [
            'topCreators' => $topCreators,
        ]);
    }

    public function topPosts()
    {
        $topPosts = Post::query()
            ->with('user')
            ->withSum('earnings', 'amount')
            ->withCount(['likes', 'comments'])
            ->orderByDesc('earnings_sum_amount')
            ->limit(50)
            ->get();

        return Inertia::render('Admin/Analytics/TopPosts', [
            'topPosts' => $topPosts,
        ]);
    }

    public function platformEarnings()
    {
        return Inertia::render('Admin/Analytics/PlatformEarnings');
    }

    public function export()
    {
        return back()->with('success', 'Analytics export started. You will receive a notification when it is ready.');
    }

    public function realTime()
    {
        return Inertia::render('Admin/Analytics/RealTime');
    }

    public function financialReport()
    {
        return Inertia::render('Admin/Reports/Financial');
    }

    public function monthlyReport()
    {
        return Inertia::render('Admin/Reports/Monthly', [
            'monthlyPlatformReport' => $this->monthlyPlatformReport(),
        ]);
    }

    public function userGrowthReport()
    {
        return Inertia::render('Admin/Reports/UserGrowth');
    }

    public function contentPerformanceReport()
    {
        return Inertia::render('Admin/Reports/ContentPerformance');
    }

    public function adPerformanceReport()
    {
        return Inertia::render('Admin/Reports/AdPerformance');
    }

    private function monthlyPlatformReport(): array
    {
        $startMonth = $this->earliestReportMonth();
        $endMonth = now()->startOfMonth();
        $monthKeys = [];
        $cursor = $startMonth->copy();

        while ($cursor->lte($endMonth)) {
            $monthKeys[] = $cursor->format('Y-m');
            $cursor->addMonthNoOverflow();
        }

        $userRows = User::query()
            ->selectRaw($this->monthExpression('created_at') . ' as month')
            ->selectRaw('COUNT(*) as onboarded_users')
            ->selectRaw("SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_accounts")
            ->selectRaw("SUM(CASE WHEN status <> 'active' THEN 1 ELSE 0 END) as inactive_accounts")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $activeUserRows = User::query()
            ->where('status', 'active')
            ->whereNotNull('last_login_at')
            ->selectRaw($this->monthExpression('last_login_at') . ' as month')
            ->selectRaw('COUNT(*) as active_users')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $badgeRevenueRows = VerificationRequest::query()
            ->where('payment_status', 'paid')
            ->whereNotNull('paid_at')
            ->selectRaw($this->monthExpression('COALESCE(paid_at, updated_at)') . ' as month')
            ->selectRaw('SUM(COALESCE(payment_amount, 0)) as amount')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monetizationRevenueRows = User::query()
            ->where(function ($query) {
                $query->whereNotNull('monetization_paid_at')
                    ->orWhereNotNull('monetization_activated_at');
            })
            ->selectRaw($this->monthExpression('COALESCE(monetization_paid_at, monetization_activated_at)') . ' as month')
            ->selectRaw('SUM(COALESCE(monetization_payment_amount, ' . self::MONETIZATION_FEE_AMOUNT . ')) as amount')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $adWalletRevenueRows = AdPayment::query()
            ->whereIn('status', ['successful', 'success', 'paid'])
            ->selectRaw($this->monthExpression('created_at') . ' as month')
            ->selectRaw('SUM(amount) as amount')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $months = [];
        $cumulativeOnboarded = 0;
        $totalBadgeRevenue = 0.0;
        $totalMonetizationRevenue = 0.0;
        $totalAdWalletRevenue = 0.0;

        foreach ($monthKeys as $monthKey) {
            $userRow = $userRows->get($monthKey);
            $activeUserRow = $activeUserRows->get($monthKey);
            $badgeRevenueRow = $badgeRevenueRows->get($monthKey);
            $monetizationRevenueRow = $monetizationRevenueRows->get($monthKey);
            $adWalletRevenueRow = $adWalletRevenueRows->get($monthKey);

            $onboardedUsers = (int) ($userRow->onboarded_users ?? 0);
            $activeAccounts = (int) ($userRow->active_accounts ?? 0);
            $inactiveAccounts = (int) ($userRow->inactive_accounts ?? 0);
            $activeUsers = (int) ($activeUserRow->active_users ?? 0);
            $badgeRevenue = round((float) ($badgeRevenueRow->amount ?? 0), 2);
            $monetizationRevenue = round((float) ($monetizationRevenueRow->amount ?? 0), 2);
            $adWalletRevenue = round((float) ($adWalletRevenueRow->amount ?? 0), 2);
            $monthRevenue = round($badgeRevenue + $monetizationRevenue + $adWalletRevenue, 2);

            $cumulativeOnboarded += $onboardedUsers;
            $totalBadgeRevenue += $badgeRevenue;
            $totalMonetizationRevenue += $monetizationRevenue;
            $totalAdWalletRevenue += $adWalletRevenue;

            $months[] = [
                'month' => $monthKey,
                'label' => Carbon::createFromFormat('Y-m', $monthKey)->format('M Y'),
                'onboarded_users' => $onboardedUsers,
                'cumulative_users' => $cumulativeOnboarded,
                'active_accounts' => $activeAccounts,
                'inactive_accounts' => $inactiveAccounts,
                'active_users' => $activeUsers,
                'badge_revenue' => $badgeRevenue,
                'monetization_revenue' => $monetizationRevenue,
                'ad_wallet_revenue' => $adWalletRevenue,
                'total_revenue' => $monthRevenue,
            ];
        }

        return [
            'months' => $months,
            'summary' => [
                'total_onboarded' => User::count(),
                'active_accounts' => User::where('status', 'active')->count(),
                'inactive_accounts' => User::where('status', '!=', 'active')->count(),
                'active_users' => User::where('status', 'active')->whereNotNull('last_login_at')->count(),
                'badge_revenue' => round($totalBadgeRevenue, 2),
                'monetization_revenue' => round($totalMonetizationRevenue, 2),
                'ad_wallet_revenue' => round($totalAdWalletRevenue, 2),
                'total_revenue' => round($totalBadgeRevenue + $totalMonetizationRevenue + $totalAdWalletRevenue, 2),
            ],
        ];
    }

    private function earliestReportMonth(): Carbon
    {
        $dates = collect([
            User::query()->selectRaw('MIN(created_at) as earliest')->value('earliest'),
            User::query()->whereNotNull('last_login_at')->selectRaw('MIN(last_login_at) as earliest')->value('earliest'),
            VerificationRequest::query()->where('payment_status', 'paid')->selectRaw('MIN(COALESCE(paid_at, updated_at)) as earliest')->value('earliest'),
            User::query()
                ->where(function ($query) {
                    $query->whereNotNull('monetization_paid_at')
                        ->orWhereNotNull('monetization_activated_at');
                })
                ->selectRaw('MIN(COALESCE(monetization_paid_at, monetization_activated_at)) as earliest')
                ->value('earliest'),
            AdPayment::query()->selectRaw('MIN(created_at) as earliest')->value('earliest'),
        ])
            ->filter()
            ->map(fn ($date) => Carbon::parse((string) $date)->startOfMonth())
            ->sort()
            ->values();

        return $dates->first() ?: now()->startOfMonth();
    }

    private function monthExpression(string $columnExpression): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', {$columnExpression})",
            'pgsql' => "to_char({$columnExpression}, 'YYYY-MM')",
            default => "DATE_FORMAT({$columnExpression}, '%Y-%m')",
        };
    }
}
