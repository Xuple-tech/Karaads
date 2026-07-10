<?php

namespace App\Http\Controllers\Api;

use App\Models\Ad;
use App\Models\AdView;
use App\Models\UserEarning;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class EarnController extends Controller
{
    /**
     * Get available ads for the user to watch
     * Excludes ads watched in the last 24 hours to prevent repetition
     */
    public function getAvailableAds(Request $request): array
    {
        $limit = $request->query('limit', 10);
        $userId = $request->user()->id;

        // Get ads that the user hasn't watched in the last 24 hours
        $ads = Ad::where('status', 'active')
            ->whereDoesntHave('views', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->where('created_at', '>=', now()->subHours(24));
            })
            ->inRandomOrder()
            ->limit($limit)
            ->get(['id', 'title', 'media_url', 'media_type', 'description', 'ad_type', 'earnings_per_view'])
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'image' => $ad->media_url,
                    'video' => $ad->media_type === 'video' ? $ad->media_url : null,
                    'media_url' => $ad->media_url,
                    'media_type' => $ad->media_type,
                    'description' => $ad->description,
                    'type' => $ad->ad_type,
                    'ad_type' => $ad->ad_type,
                    'reward' => $ad->earnings_per_view ?? 0.10,
                    'earnings' => $ad->earnings_per_view ?? 0.10,
                ];
            });

        return [
            'ads' => $ads,
            'count' => $ads->count(),
        ];
    }

    /**
     * Record an ad view and calculate earnings
     */
    public function recordView(Request $request, Ad $ad): array
    {
        $validated = $request->validate([
            'view_duration' => 'required|integer|min:1',
            'completed' => 'required|boolean',
        ]);

        $user = $request->user();

        // Calculate earnings based on ad's earnings_per_view rate
        $baseEarnings = $ad->earnings_per_view ?? 0.10;

        $earnings = 0;
        if ($validated['completed']) {
            // Full earnings for completed views
            $earnings = $baseEarnings;
        } else {
            // Partial earnings for skipped views (20% of base)
            $earnings = $baseEarnings * 0.2;
        }

        // Ensure minimum earnings
        $earnings = max(0.01, round($earnings, 2));

        // Create ad view record
        $view = AdView::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'ad_id' => $ad->id,
            'ad_title' => $ad->title,
            'earnings' => $earnings,
            'view_duration' => $validated['view_duration'],
            'completed' => $validated['completed'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Update user earnings
        $userEarning = UserEarning::firstOrCreate(
            ['user_id' => $user->id],
            [
                'id' => (string) Str::uuid(),
                'total_earned' => 0,
                'available_balance' => 0,
                'total_withdrawn' => 0,
                'ads_watched' => 0,
                'ads_completed' => 0,
                'average_earning_per_ad' => 0,
            ]
        );

        $userEarning->increment('total_earned', $earnings);
        $userEarning->increment('available_balance', $earnings);
        $userEarning->increment('ads_watched');

        if ($validated['completed']) {
            $userEarning->increment('ads_completed');
        }

        // Recalculate average
        $userEarning->average_earning_per_ad = $userEarning->ads_watched > 0
            ? round($userEarning->total_earned / $userEarning->ads_watched, 2)
            : 0;
        $userEarning->save();

        \Illuminate\Support\Facades\Log::info('Ad view recorded', [
            'user_id' => $user->id,
            'ad_id' => $ad->id,
            'completed' => $validated['completed'],
            'earnings' => $earnings,
            'total_balance' => $userEarning->available_balance,
        ]);

        return [
            'view_id' => $view->id,
            'earnings' => round($earnings, 2),
            'total_earned' => round($userEarning->total_earned, 2),
            'available_balance' => round($userEarning->available_balance, 2),
            'ads_completed' => $userEarning->ads_completed,
            'completed' => $validated['completed'],
        ];
    }

    /**
     * Get user's earnings summary
     */
    public function getEarnings(Request $request): array
    {
        $userId = $request->user()->id;
        $timeframe = $request->query('timeframe', 'all'); // all, today, week, month

        $earning = UserEarning::where('user_id', $userId)->first();

        if (!$earning) {
            return [
                'total_earned' => 0,
                'available_balance' => 0,
                'total_withdrawn' => 0,
                'ads_watched' => 0,
                'ads_completed' => 0,
                'average_earning_per_ad' => 0,
                'today_earnings' => 0,
                'week_earnings' => 0,
                'month_earnings' => 0,
                'ads_available_today' => true,
            ];
        }

        // Calculate timeframe earnings
        $today = AdView::where('user_id', $userId)
            ->whereDate('created_at', today())
            ->where('completed', true)
            ->sum('earnings');

        $week = AdView::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->where('completed', true)
            ->sum('earnings');

        $month = AdView::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->where('completed', true)
            ->sum('earnings');

        // Check if user has reached daily limit (e.g., 20 ads per day)
        $dailyWatchedCount = AdView::where('user_id', $userId)
            ->whereDate('created_at', today())
            ->where('completed', true)
            ->count();

        $dailyLimit = 20;
        $adsAvailableToday = $dailyWatchedCount < $dailyLimit;

        return [
            'total_earned' => round($earning->total_earned, 2),
            'available_balance' => round($earning->available_balance, 2),
            'total_withdrawn' => round($earning->total_withdrawn ?? 0, 2),
            'ads_watched' => $earning->ads_watched,
            'ads_completed' => $earning->ads_completed,
            'average_earning_per_ad' => round($earning->average_earning_per_ad, 2),
            'today_earnings' => round($today, 2),
            'week_earnings' => round($week, 2),
            'month_earnings' => round($month, 2),
            'ads_available_today' => $adsAvailableToday,
            'daily_watched_count' => $dailyWatchedCount,
            'daily_limit' => $dailyLimit,
        ];
    }

    /**
     * Get user's ad viewing history
     */
    public function getHistory(Request $request): array
    {
        $userId = $request->user()->id;
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 20);

        $views = AdView::where('user_id', $userId)
            ->with('ad')
            ->orderByDesc('created_at')
            ->paginate($limit, ['*'], 'page', $page);

        return [
            'data' => $views->items(),
            'pagination' => [
                'total' => $views->total(),
                'per_page' => $views->perPage(),
                'current_page' => $views->currentPage(),
                'last_page' => $views->lastPage(),
            ],
        ];
    }

    /**
     * Request a withdrawal
     */
    public function requestWithdrawal(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:5',
            'method' => 'required|in:bank_transfer,paypal,stripe',
            'account_details' => 'required|array',
        ]);

        $user = $request->user();
        $earning = UserEarning::where('user_id', $user->id)->first();

        if (!$earning || $earning->available_balance < $validated['amount']) {
            return response()->json([
                'success' => false,
                'error' => 'Insufficient balance for withdrawal',
            ], 422);
        }

        // Create withdrawal record
        $withdrawal = $user->withdrawals()->create([
            'id' => (string) Str::uuid(),
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'status' => 'pending',
            'account_details' => json_encode($validated['account_details']),
        ]);

        // Deduct from available balance
        $earning->decrement('available_balance', $validated['amount']);

        \Illuminate\Support\Facades\Log::info('Withdrawal requested', [
            'user_id' => $user->id,
            'withdrawal_id' => $withdrawal->id,
            'amount' => $validated['amount'],
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'withdrawal_id' => $withdrawal->id,
                'amount' => $withdrawal->amount,
                'method' => $withdrawal->method,
                'status' => $withdrawal->status,
                'created_at' => $withdrawal->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Get user's withdrawals
     */
    public function getWithdrawals(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status', null);
        $page = $request->query('page', 1);
        $limit = $request->query('limit', 20);

        $query = $user->withdrawals();

        if ($status) {
            $query->where('status', $status);
        }

        $withdrawals = $query->orderByDesc('created_at')
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json([
            'data' => $withdrawals->items(),
            'pagination' => [
                'total' => $withdrawals->total(),
                'per_page' => $withdrawals->perPage(),
                'current_page' => $withdrawals->currentPage(),
                'last_page' => $withdrawals->lastPage(),
            ],
        ]);
    }

    /**
     * Get a specific withdrawal details
     */
    public function getWithdrawalDetail(Request $request, $id)
    {
        $user = $request->user();
        $withdrawal = $user->withdrawals()->where('id', $id)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'withdrawal_id' => $withdrawal->id,
                'amount' => $withdrawal->amount,
                'method' => $withdrawal->method,
                'status' => $withdrawal->status,
                'created_at' => $withdrawal->created_at->toIso8601String(),
                'updated_at' => $withdrawal->updated_at->toIso8601String(),
            ],
        ]);
    }
}
