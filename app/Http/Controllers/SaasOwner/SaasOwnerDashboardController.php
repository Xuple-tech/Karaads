<?php

namespace App\Http\Controllers\SaasOwner;

use App\Models\SaasInstanceSettings;
use App\Models\SaasTeamMember;
use App\Models\Chat;
use App\Models\Conversation;
use App\Services\AnalyticsService;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * SaasOwnerDashboardController
 *
 * Dashboard for SaaS owners to manage their instances
 */
class SaasOwnerDashboardController extends \Illuminate\Routing\Controller
{
    /**
     * Show SaaS owner dashboard
     */
    public function index()
    {
        $user = auth()->user();
        $settings = SaasInstanceSettings::where('saas_owner_id', $user->id)->first();
        $stats = AnalyticsService::getSaasOwnerStats($user->id, '30d');
        $teamMembers = SaasTeamMember::where('saas_owner_id', $user->id)
            ->with('user')
            ->get();

        $responseTimeDistribution = AnalyticsService::getResponseTimeDistribution('30d');

        return Inertia::render('SaasOwner/Dashboard', [
            'instanceSettings' => $settings,
            'stats' => [
                'instance_name' => $settings->name ?? 'My Instance',
                'subscription_plan' => $settings->plan ?? 'Pro',
                'messages_this_month' => $stats['messages_this_month'] ?? 0,
                'message_limit' => $settings->message_limit ?? 100000,
                'usage_percentage' => ($stats['messages_this_month'] ?? 0) / ($settings->message_limit ?? 100000) * 100,
                'total_messages_period' => $stats['total_messages'] ?? 0,
                'api_tokens_used' => $stats['api_tokens_used'] ?? 0,
                'api_requests' => $stats['api_requests'] ?? 0,
                'avg_response_time_ms' => $stats['avg_response_time_ms'] ?? 0,
                'period' => '30d',
            ],
            'teamMembers' => $teamMembers,
            'responseTimeDistribution' => $responseTimeDistribution,
        ]);
    }

    /**
     * View usage analytics
     */
    public function analytics()
    {
        $user = auth()->user();
        $stats = AnalyticsService::getSaasOwnerStats($user->id, '30d');
        $usageByIP = AnalyticsService::getSaasOwnerUsageByIP($user->id, '30d', 10);
        $usageByCountry = AnalyticsService::getSaasOwnerUsageByCountry($user->id, '30d');

        // Get daily usage data
        $dailyUsage = Chat::whereHas('conversation', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();

        return Inertia::render('SaasOwner/Analytics', [
            'stats' => $stats,
            'dailyUsage' => $dailyUsage,
            'usageByIP' => $usageByIP,
            'usageByCountry' => $usageByCountry,
        ]);
    }

    /**
     * View subscription and billing
     */
    public function subscription()
    {
        $user = auth()->user();
        $settings = SaasInstanceSettings::where('saas_owner_id', $user->id)->first();

        return Inertia::render('SaasOwner/Subscription', [
            'settings' => $settings,
            'plans' => [
                'basic' => ['name' => 'Basic', 'price' => 29, 'messages' => 10000],
                'pro' => ['name' => 'Pro', 'price' => 99, 'messages' => 100000],
                'enterprise' => ['name' => 'Enterprise', 'price' => 'Custom', 'messages' => 'Unlimited'],
            ],
        ]);
    }

    /**
     * View billing and subscription management
     */
    public function billing()
    {
        $user = auth()->user();
        $settings = SaasInstanceSettings::where('saas_owner_id', $user->id)->first();

        return Inertia::render('SaasOwner/Billing', [
            'settings' => $settings,
            'plans' => [
                'basic' => ['name' => 'Basic', 'price' => 29, 'messages' => 10000],
                'pro' => ['name' => 'Pro', 'price' => 99, 'messages' => 100000],
                'enterprise' => ['name' => 'Enterprise', 'price' => 'Custom', 'messages' => 'Unlimited'],
            ],
        ]);
    }

    /**
     * View SaaS owner settings
     */
    public function settings()
    {
        $user = auth()->user();
        $settings = SaasInstanceSettings::where('saas_owner_id', $user->id)->first();

        return Inertia::render('SaasOwner/Settings', [
            'settings' => $settings,
        ]);
    }
}
