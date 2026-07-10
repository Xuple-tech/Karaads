<?php

namespace App\Http\Controllers\Admin;

use App\Models\Earning;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class EarningsSettingsController extends Controller
{
    /**
     * Display earnings settings
     */
    public function index(): Response
    {
        $settings = [
            'earnings_per_second' => 0.001,
            'min_completed_view_earnings' => 0.10,
            'min_partial_view_earnings' => 0.0001,
            'min_view_duration' => 30,
            'max_daily_earnings' => 1000,
            'ads_per_user_per_day' => 50,
            'withdrawal_minimum' => 5.00,
            'withdrawal_fee_percentage' => 2.5,
            'currency' => 'USD',
            'payment_methods' => ['paypal', 'stripe', 'bank_transfer'],
        ];

        return Inertia::render('Admin/EarningsSettings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update earnings settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'earnings_per_second' => 'required|numeric|min:0|max:1',
            'min_completed_view_earnings' => 'required|numeric|min:0|max:10',
            'min_partial_view_earnings' => 'required|numeric|min:0|max:1',
            'min_view_duration' => 'required|integer|min:5|max:300',
            'max_daily_earnings' => 'required|numeric|min:0',
            'ads_per_user_per_day' => 'required|integer|min:1|max:500',
            'withdrawal_minimum' => 'required|numeric|min:0|max:100',
            'withdrawal_fee_percentage' => 'required|numeric|min:0|max:100',
        ]);

        // Store in cache or database as needed
        // For now, just return success
        return redirect()->back()->with('success', 'Earnings settings updated successfully');
    }

    /**
     * Show user earnings analytics
     */
    public function analytics(): Response
    {
        $totalDistributed = Earning::query()
            ->where('status', Earning::STATUS_PAID)
            ->sum('amount');

        $activeEarners = User::query()
            ->whereHas('earnings')
            ->count();

        $todayDistributed = Earning::query()
            ->where('status', Earning::STATUS_PAID)
            ->whereDate('paid_at', now()->toDateString())
            ->sum('amount');

        $avgEarningsPerUser = $activeEarners > 0
            ? $totalDistributed / $activeEarners
            : 0.0;

        return Inertia::render('Admin/EarningsSettings/Analytics', [
            'stats' => [
                'total_distributed' => (float) $totalDistributed,
                'active_earners' => $activeEarners,
                'today_distributed' => (float) $todayDistributed,
                'avg_earnings_per_user' => round($avgEarningsPerUser, 2),
            ],
        ]);
    }
}
