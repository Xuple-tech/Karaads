<?php

namespace App\Http\Controllers\SaasOwner;

use App\Models\User;
use App\Models\Chat;
use App\Models\Conversation;
use App\Models\Subscription;
use App\Models\UsageQuota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * UserStatsController
 *
 * SaaS Owner can view detailed user statistics and analytics
 * Only SaaS Owner role can access these features
 */
class UserStatsController extends \Illuminate\Routing\Controller
{
    /**
     * Show overall user statistics
     */
    public function index(Request $request)
    {
        $period = $request->get('period', '30d');
        $fromDate = $this->getFromDate($period);

        // Overall stats
        $totalUsers = User::count();
        $newUsersThisPeriod = User::where('created_at', '>=', $fromDate)->count();
        $activeUsersThisPeriod = Chat::where('created_at', '>=', $fromDate)
            ->distinct('conversation_id')
            ->count();

        // Subscription stats
        $totalActiveSubscriptions = Subscription::where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })->count();

        $totalCancelledSubscriptions = Subscription::where('status', 'cancelled')
            ->count();

        // Chat and conversation stats
        $totalConversations = Conversation::count();
        $totalChats = Chat::count();
        $chatsThisPeriod = Chat::where('created_at', '>=', $fromDate)->count();

        // Plan distribution
        $planDistribution = Subscription::with('plan')
            ->where('status', 'active')
            ->get()
            ->groupBy('plan.name')
            ->map(fn ($group) => $group->count());

        // Daily activity
        $dailyActivity = Chat::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $fromDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top active users
        $topUsers = User::withCount([
            'chats' => fn ($q) => $q->where('created_at', '>=', $fromDate)
        ])
            ->orderByDesc('chats_count')
            ->limit(10)
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'chats_count' => $user->chats_count,
                'subscription' => $user->activeSubscription?->plan->name ?? 'None',
            ]);

        // User growth
        $userGrowth = User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $fromDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('SaasOwner/Stats/Overview', [
            'stats' => [
                'total_users' => $totalUsers,
                'new_users_period' => $newUsersThisPeriod,
                'active_users_period' => $activeUsersThisPeriod,
                'total_active_subscriptions' => $totalActiveSubscriptions,
                'total_cancelled_subscriptions' => $totalCancelledSubscriptions,
                'total_conversations' => $totalConversations,
                'total_chats' => $totalChats,
                'chats_period' => $chatsThisPeriod,
            ],
            'period' => $period,
            'plan_distribution' => $planDistribution,
            'daily_activity' => $dailyActivity,
            'top_users' => $topUsers,
            'user_growth' => $userGrowth,
        ]);
    }

    /**
     * Show detailed stats for specific user
     */
    public function userDetails(User $user, Request $request)
    {
        $period = $request->get('period', '30d');
        $fromDate = $this->getFromDate($period);

        // User basic info
        $activeSubscription = $user->activeSubscription;

        // Conversation stats
        $totalConversations = $user->conversations()->count();
        $conversationsThisPeriod = $user->conversations()
            ->where('created_at', '>=', $fromDate)
            ->count();

        // Chat stats
        $totalChats = $user->chats()->count();
        $chatsThisPeriod = $user->chats()
            ->where('created_at', '>=', $fromDate)
            ->count();

        // Message stats
        $totalMessages = Chat::whereHas('conversation', fn ($q) => $q->where('user_id', $user->id))
            ->count();

        $messagesThisPeriod = Chat::whereHas('conversation', fn ($q) => $q->where('user_id', $user->id))
            ->where('created_at', '>=', $fromDate)
            ->count();

        // Activity timeline
        $dailyActivity = Chat::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereHas('conversation', fn ($q) => $q->where('user_id', $user->id))
            ->where('created_at', '>=', $fromDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Last conversations
        $lastConversations = $user->conversations()
            ->with('chats')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($conv) => [
                'id' => $conv->id,
                'title' => $conv->title,
                'messages_count' => $conv->chats->count(),
                'created_at' => $conv->created_at,
            ]);

        // Usage by day
        $usageByDay = Chat::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereHas('conversation', fn ($q) => $q->where('user_id', $user->id))
            ->where('created_at', '>=', $fromDate)
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();

        return Inertia::render('SaasOwner/Stats/UserDetails', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'created_at' => $user->created_at,
            ],
            'stats' => [
                'total_conversations' => $totalConversations,
                'conversations_period' => $conversationsThisPeriod,
                'total_chats' => $totalChats,
                'chats_period' => $chatsThisPeriod,
                'total_messages' => $totalMessages,
                'messages_period' => $messagesThisPeriod,
            ],
            'subscription' => $activeSubscription ? [
                'plan_name' => $activeSubscription->plan->name,
                'status' => $activeSubscription->status,
                'renews_at' => $activeSubscription->renews_at,
                'created_at' => $activeSubscription->created_at,
            ] : null,
            'period' => $period,
            'daily_activity' => $dailyActivity,
            'last_conversations' => $lastConversations,
            'usage_by_day' => $usageByDay,
        ]);
    }

    /**
     * Get subscription statistics
     */
    public function subscriptionStats(Request $request)
    {
        $period = $request->get('period', '30d');
        $fromDate = $this->getFromDate($period);

        // Overall subscription stats
        $totalSubscriptions = Subscription::count();
        $activeSubscriptions = Subscription::where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })->count();

        $trialSubscriptions = Subscription::where('is_trial', true)
            ->where('trial_ends_at', '>', now())
            ->count();

        $cancelledSubscriptions = Subscription::where('status', 'cancelled')->count();

        // Plan stats
        $planStats = Subscription::with('plan')
            ->where('status', 'active')
            ->get()
            ->groupBy('plan.name')
            ->map(function ($group) {
                $total = $group->count();
                $revenue = $group->sum('amount_paid');
                return [
                    'count' => $total,
                    'revenue' => $revenue,
                ];
            });

        // Revenue stats
        $totalRevenue = Subscription::sum('amount_paid');
        $revenueThisPeriod = Subscription::where('created_at', '>=', $fromDate)
            ->sum('amount_paid');

        // Churn stats
        $cancelledThisPeriod = Subscription::where('cancelled_at', '>=', $fromDate)
            ->count();

        // Renewal stats
        $upcomingRenewals = Subscription::where('renews_at', '>=', now())
            ->where('renews_at', '<=', now()->addDays(7))
            ->count();

        // Daily revenue
        $dailyRevenue = Subscription::selectRaw('DATE(created_at) as date, SUM(amount_paid) as revenue, COUNT(*) as count')
            ->where('created_at', '>=', $fromDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('SaasOwner/Stats/Subscriptions', [
            'stats' => [
                'total_subscriptions' => $totalSubscriptions,
                'active_subscriptions' => $activeSubscriptions,
                'trial_subscriptions' => $trialSubscriptions,
                'cancelled_subscriptions' => $cancelledSubscriptions,
                'total_revenue' => $totalRevenue,
                'revenue_period' => $revenueThisPeriod,
                'cancelled_period' => $cancelledThisPeriod,
                'upcoming_renewals' => $upcomingRenewals,
            ],
            'plan_stats' => $planStats,
            'daily_revenue' => $dailyRevenue,
            'period' => $period,
        ]);
    }

    /**
     * Get engagement statistics
     */
    public function engagementStats(Request $request)
    {
        $period = $request->get('period', '30d');
        $fromDate = $this->getFromDate($period);

        // Active users
        $activeUsers = Chat::where('created_at', '>=', $fromDate)
            ->distinct('conversation_id')
            ->count();

        // User segments
        $veryActiveUsers = User::withCount([
            'chats' => fn ($q) => $q->where('created_at', '>=', $fromDate)
        ])
            ->having('chats_count', '>=', 100)
            ->count();

        $activeUsers_count = User::withCount([
            'chats' => fn ($q) => $q->where('created_at', '>=', $fromDate)
        ])
            ->having('chats_count', '>=', 10)
            ->having('chats_count', '<', 100)
            ->count();

        $moderateUsers = User::withCount([
            'chats' => fn ($q) => $q->where('created_at', '>=', $fromDate)
        ])
            ->having('chats_count', '>=', 1)
            ->having('chats_count', '<', 10)
            ->count();

        $inactiveUsers = User::withCount([
            'chats' => fn ($q) => $q->where('created_at', '>=', $fromDate)
        ])
            ->having('chats_count', '=', 0)
            ->count();

        // Retention stats
        $returningUsers = User::whereHas('conversations', fn ($q) => $q->where('created_at', '<', $fromDate))
            ->whereHas('conversations', fn ($q) => $q->where('created_at', '>=', $fromDate))
            ->count();

        // Churn rate
        $totalUsersLastPeriod = User::where('created_at', '<', $fromDate)->count();
        $churnedUsers = $totalUsersLastPeriod - $returningUsers;
        $churnRate = $totalUsersLastPeriod > 0 ? ($churnedUsers / $totalUsersLastPeriod) * 100 : 0;

        // Hourly activity
        $hourlyActivity = Chat::selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->where('created_at', '>=', $fromDate)
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return Inertia::render('SaasOwner/Stats/Engagement', [
            'stats' => [
                'active_users' => $activeUsers,
                'very_active_users' => $veryActiveUsers,
                'active_users_count' => $activeUsers_count,
                'moderate_users' => $moderateUsers,
                'inactive_users' => $inactiveUsers,
                'returning_users' => $returningUsers,
                'churn_rate' => number_format($churnRate, 2),
            ],
            'hourly_activity' => $hourlyActivity,
            'period' => $period,
        ]);
    }

    /**
     * Helper function to get from date based on period
     */
    private function getFromDate(string $period)
    {
        return match ($period) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(30),
        };
    }
}
