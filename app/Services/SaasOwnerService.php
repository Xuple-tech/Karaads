<?php

namespace App\Services;

use App\Models\User;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Chat;
use App\Models\Conversation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * SaasOwnerService
 *
 * Handles business logic for SaaS Owner operations including:
 * - Subscription management
 * - User management
 * - Statistics and analytics
 * - Reporting
 */
class SaasOwnerService
{
    /**
     * Get overall SaaS statistics
     */
    public static function getOverallStats(string $period = '30d'): array
    {
        $fromDate = self::getFromDate($period);

        return [
            'total_users' => User::count(),
            'active_users' => Chat::where('created_at', '>=', $fromDate)->distinct('conversation_id')->count(),
            'new_users_period' => User::where('created_at', '>=', $fromDate)->count(),
            'total_subscriptions' => Subscription::count(),
            'active_subscriptions' => Subscription::where('status', 'active')
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })->count(),
            'total_conversations' => Conversation::count(),
            'total_messages' => Chat::count(),
            'messages_period' => Chat::where('created_at', '>=', $fromDate)->count(),
        ];
    }

    /**
     * Get user subscription info
     */
    public static function getUserSubscriptionInfo(User $user): array
    {
        $activeSubscription = $user->activeSubscription;

        return [
            'has_subscription' => $activeSubscription !== null,
            'plan_name' => $activeSubscription?->plan->name,
            'plan_slug' => $activeSubscription?->plan->slug,
            'status' => $activeSubscription?->status,
            'is_trial' => $activeSubscription?->is_trial,
            'started_at' => $activeSubscription?->started_at,
            'renews_at' => $activeSubscription?->renews_at,
            'trial_ends_at' => $activeSubscription?->trial_ends_at,
            'expires_at' => $activeSubscription?->expires_at,
        ];
    }

    /**
     * Create subscription for user
     */
    public static function createSubscription(User $user, SubscriptionPlan $plan, array $options = []): Subscription
    {
        try {
            DB::beginTransaction();

            // Cancel existing active subscriptions
            Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->update(['status' => 'cancelled', 'cancelled_at' => now()]);

            // Create new subscription
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'started_at' => $options['started_at'] ?? now(),
                'renews_at' => $options['renews_at'] ?? now()->addMonth(),
                'is_trial' => $options['is_trial'] ?? false,
                'trial_ends_at' => $options['is_trial'] ? now()->addDays($options['trial_duration_days'] ?? 14) : null,
                'amount_paid' => $options['amount_paid'] ?? $plan->monthly_price,
                'payment_method' => $options['payment_method'] ?? 'manual',
            ]);

            DB::commit();

            Log::info("Subscription created for user {$user->email}", [
                'subscription_id' => $subscription->id,
                'plan' => $plan->name,
            ]);

            return $subscription;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to create subscription", ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Get subscription revenue for period
     */
    public static function getRevenueStats(string $period = '30d'): array
    {
        $fromDate = self::getFromDate($period);

        $totalRevenue = Subscription::sum('amount_paid');
        $periodRevenue = Subscription::where('created_at', '>=', $fromDate)->sum('amount_paid');

        $revenueByPlan = Subscription::with('plan')
            ->get()
            ->groupBy('plan.name')
            ->map(fn ($group) => [
                'count' => $group->count(),
                'revenue' => $group->sum('amount_paid'),
                'average' => $group->count() > 0 ? $group->sum('amount_paid') / $group->count() : 0,
            ]);

        return [
            'total_revenue' => $totalRevenue,
            'period_revenue' => $periodRevenue,
            'revenue_by_plan' => $revenueByPlan,
            'average_subscription_value' => Subscription::where('status', 'active')->avg('amount_paid') ?? 0,
        ];
    }

    /**
     * Get user engagement metrics
     */
    public static function getUserEngagement(string $period = '30d'): array
    {
        $fromDate = self::getFromDate($period);

        $activeUsersThisPeriod = Chat::where('created_at', '>=', $fromDate)
            ->distinct('conversation_id')
            ->count();

        $newUsersThatConverted = User::where('created_at', '>=', $fromDate)
            ->whereHas('chats', fn ($q) => $q->where('created_at', '>=', $fromDate))
            ->count();

        $userEngagement = User::withCount([
            'chats' => fn ($q) => $q->where('created_at', '>=', $fromDate)
        ])
            ->get()
            ->groupBy(function ($user) {
                if ($user->chats_count >= 100) return 'very_active';
                if ($user->chats_count >= 10) return 'active';
                if ($user->chats_count >= 1) return 'moderate';
                return 'inactive';
            })
            ->map(fn ($group) => $group->count());

        return [
            'active_users_period' => $activeUsersThisPeriod,
            'new_users_converted' => $newUsersThatConverted,
            'engagement_breakdown' => $userEngagement,
        ];
    }

    /**
     * Get churn metrics
     */
    public static function getChurnMetrics(string $period = '30d'): array
    {
        $fromDate = self::getFromDate($period);

        $totalCancellations = Subscription::where('cancelled_at', '>=', $fromDate)->count();
        $activeSubscriptionsStart = Subscription::where('created_at', '<', $fromDate)
            ->where('status', 'active')
            ->count();

        $churnRate = $activeSubscriptionsStart > 0
            ? ($totalCancellations / $activeSubscriptionsStart) * 100
            : 0;

        return [
            'cancellations' => $totalCancellations,
            'churn_rate' => number_format($churnRate, 2),
            'active_at_start' => $activeSubscriptionsStart,
        ];
    }

    /**
     * Get user by email
     */
    public static function findUserByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Get top users by activity
     */
    public static function getTopUsers(int $limit = 10, string $period = '30d'): array
    {
        $fromDate = self::getFromDate($period);

        return User::withCount([
            'chats' => fn ($q) => $q->where('created_at', '>=', $fromDate)
        ])
            ->with(['activeSubscription', 'activeSubscription.plan'])
            ->orderByDesc('chats_count')
            ->limit($limit)
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'chats_count' => $user->chats_count,
                'subscription' => [
                    'plan' => $user->activeSubscription?->plan->name ?? 'None',
                    'status' => $user->activeSubscription?->status ?? 'inactive',
                ],
                'created_at' => $user->created_at,
            ])->toArray();
    }

    /**
     * Export users to CSV
     */
    public static function exportUsersCSV(array $filters = []): string
    {
        $query = User::query();

        if (isset($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        $users = $query->with(['activeSubscription', 'activeSubscription.plan'])->get();

        $csv = "Name,Email,Role,Created At,Subscription Plan,Status\n";

        foreach ($users as $user) {
            $subscription = $user->activeSubscription;
            $plan = $subscription?->plan->name ?? 'None';
            $status = $subscription?->status ?? 'inactive';

            $csv .= "\"{$user->name}\",\"{$user->email}\",\"{$user->role}\",\"{$user->created_at}\",\"{$plan}\",\"{$status}\"\n";
        }

        return $csv;
    }

    /**
     * Export subscriptions to CSV
     */
    public static function exportSubscriptionsCSV(array $filters = []): string
    {
        $query = Subscription::with(['user', 'plan']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['plan_id'])) {
            $query->where('plan_id', $filters['plan_id']);
        }

        $subscriptions = $query->get();

        $csv = "User Name,Email,Plan,Status,Started At,Renews At,Amount Paid\n";

        foreach ($subscriptions as $subscription) {
            $csv .= "\"{$subscription->user->name}\",\"{$subscription->user->email}\",\"{$subscription->plan->name}\",\"{$subscription->status}\",\"{$subscription->started_at}\",\"{$subscription->renews_at}\",\"{$subscription->amount_paid}\"\n";
        }

        return $csv;
    }

    /**
     * Helper function to get from date based on period string
     */
    private static function getFromDate(string $period)
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
