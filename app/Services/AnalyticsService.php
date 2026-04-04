<?php

namespace App\Services;

use App\Models\ApiUsageLog;
use App\Models\Chat;
use App\Models\Conversation;
use App\Models\SaasInstanceSettings;
use Illuminate\Support\Facades\DB;

/**
 * AnalyticsService
 *
 * Provides analytics and statistics for dashboards
 */
class AnalyticsService
{
    /**
     * Get system-wide statistics
     */
    public static function getSystemStats(string $period = '7d'): array
    {
        $dateFrom = self::getDateFrom($period);

        $chatStats = Chat::where('created_at', '>=', $dateFrom)
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->get();

        $apiStats = ApiUsageLog::where('created_at', '>=', $dateFrom)
            ->selectRaw('sum(tokens_used) as total_tokens, count(*) as request_count, avg(response_time_ms) as avg_response_time, count(case when status = "error" then 1 end) as error_count')
            ->first();

        $totalUsers = DB::table('users')->count();
        $totalConversations = Conversation::count();
        $totalChats = Chat::count();

        return [
            'period' => $period,
            'total_users' => $totalUsers,
            'total_conversations' => $totalConversations,
            'total_messages' => $totalChats,
            'api_stats' => [
                'total_tokens_used' => $apiStats->total_tokens ?? 0,
                'total_api_requests' => $apiStats->request_count ?? 0,
                'average_response_time_ms' => $apiStats->avg_response_time ?? 0,
                'total_errors' => $apiStats->error_count ?? 0,
            ],
            'chat_by_date' => $chatStats,
        ];
    }

    /**
     * Get usage by API provider
     */
    public static function getUsageByProvider(string $period = '7d'): array
    {
        $dateFrom = self::getDateFrom($period);

        return ApiUsageLog::where('created_at', '>=', $dateFrom)
            ->selectRaw('api_provider, count(*) as request_count, sum(tokens_used) as total_tokens, avg(response_time_ms) as avg_response_time')
            ->groupBy('api_provider')
            ->get()
            ->toArray();
    }

    /**
     * Get error statistics
     */
    public static function getErrorStats(string $period = '7d'): array
    {
        $dateFrom = self::getDateFrom($period);

        return ApiUsageLog::where('created_at', '>=', $dateFrom)
            ->where('status', 'error')
            ->selectRaw('error_message, count(*) as count')
            ->groupBy('error_message')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->toArray();
    }

    /**
     * Get SaaS owner usage statistics
     */
    public static function getSaasOwnerStats(string $saasOwnerId, string $period = '7d'): array
    {
        $dateFrom = self::getDateFrom($period);
        $settings = SaasInstanceSettings::where('saas_owner_id', $saasOwnerId)->first();

        $messageCount = Chat::whereHas('conversation', function ($query) use ($saasOwnerId) {
            $query->where('user_id', $saasOwnerId);
        })
            ->where('created_at', '>=', $dateFrom)
            ->count();

        $apiUsage = ApiUsageLog::where('saas_owner_id', $saasOwnerId)
            ->where('created_at', '>=', $dateFrom)
            ->selectRaw('sum(tokens_used) as total_tokens, count(*) as request_count, avg(response_time_ms) as avg_response_time')
            ->first();

        return [
            'instance_name' => $settings?->instance_name,
            'subscription_plan' => $settings?->subscription_plan,
            'messages_this_month' => $settings?->current_month_messages ?? 0,
            'message_limit' => $settings?->monthly_message_limit ?? 0,
            'usage_percentage' => $settings ? round(($settings->current_month_messages / $settings->monthly_message_limit) * 100, 2) : 0,
            'total_messages_period' => $messageCount,
            'api_tokens_used' => $apiUsage?->total_tokens ?? 0,
            'api_requests' => $apiUsage?->request_count ?? 0,
            'avg_response_time_ms' => $apiUsage?->avg_response_time ?? 0,
            'period' => $period,
        ];
    }

    /**
     * Get SaaS owner usage by IP
     */
    public static function getSaasOwnerUsageByIP(string $saasOwnerId, string $period = '7d', int $limit = 10): array
    {
        $dateFrom = self::getDateFrom($period);

        return ApiUsageLog::where('saas_owner_id', $saasOwnerId)
            ->where('created_at', '>=', $dateFrom)
            ->whereNotNull('ip_address')
            ->selectRaw('ip_address, country, count(*) as request_count, sum(tokens_used) as total_tokens, avg(response_time_ms) as avg_response_time')
            ->groupBy('ip_address', 'country')
            ->orderBy('total_tokens', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get SaaS owner usage by country
     */
    public static function getSaasOwnerUsageByCountry(string $saasOwnerId, string $period = '7d'): array
    {
        $dateFrom = self::getDateFrom($period);

        return ApiUsageLog::where('saas_owner_id', $saasOwnerId)
            ->where('created_at', '>=', $dateFrom)
            ->whereNotNull('country')
            ->selectRaw('country, count(*) as request_count, sum(tokens_used) as total_tokens, avg(response_time_ms) as avg_response_time')
            ->groupBy('country')
            ->orderBy('total_tokens', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get top users by API usage
     */
    public static function getTopUsersByUsage(int $limit = 10, string $period = '7d'): array
    {
        $dateFrom = self::getDateFrom($period);

        return ApiUsageLog::where('created_at', '>=', $dateFrom)
            ->selectRaw('user_id, count(*) as request_count, sum(tokens_used) as total_tokens')
            ->groupBy('user_id')
            ->orderBy('total_tokens', 'desc')
            ->limit($limit)
            ->with('user:id,name,email')
            ->get()
            ->toArray();
    }

    /**
     * Get response time distribution
     */
    public static function getResponseTimeDistribution(string $period = '7d'): array
    {
        $dateFrom = self::getDateFrom($period);

        return ApiUsageLog::where('created_at', '>=', $dateFrom)
            ->selectRaw('
                CASE
                    WHEN response_time_ms < 100 THEN "< 100ms"
                    WHEN response_time_ms < 500 THEN "100-500ms"
                    WHEN response_time_ms < 1000 THEN "500ms-1s"
                    WHEN response_time_ms < 3000 THEN "1-3s"
                    ELSE "> 3s"
                END as bucket,
                count(*) as count
            ')
            ->groupBy('bucket')
            ->get()
            ->toArray();
    }

    /**
     * Get usage statistics by IP address
     */
    public static function getUsageByIP(string $period = '7d', int $limit = 20): array
    {
        $dateFrom = self::getDateFrom($period);

        return ApiUsageLog::where('created_at', '>=', $dateFrom)
            ->whereNotNull('ip_address')
            ->selectRaw('ip_address, country, count(*) as request_count, sum(tokens_used) as total_tokens, avg(response_time_ms) as avg_response_time')
            ->groupBy('ip_address', 'country')
            ->orderBy('total_tokens', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get usage statistics by country
     */
    public static function getUsageByCountry(string $period = '7d'): array
    {
        $dateFrom = self::getDateFrom($period);

        return ApiUsageLog::where('created_at', '>=', $dateFrom)
            ->whereNotNull('country')
            ->selectRaw('country, count(*) as request_count, sum(tokens_used) as total_tokens, avg(response_time_ms) as avg_response_time')
            ->groupBy('country')
            ->orderBy('total_tokens', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get cost estimation (example: $0.001 per 1000 tokens)
     */
    public static function getCostEstimate(int $totalTokens, string $provider = 'grok'): float
    {
        $rates = [
            'grok' => 0.001 / 1000,
            'ollama' => 0, // Self-hosted, no cost
        ];

        return round(($totalTokens * ($rates[$provider] ?? 0)), 4);
    }

    /**
     * Get date from period string
     */
    private static function getDateFrom(string $period): \DateTime
    {
        return match ($period) {
            '24h' => now()->subDay(),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(7),
        };
    }
}
