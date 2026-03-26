<?php

namespace App\Http\Controllers\Admin;

use App\Models\GrokApiConfig;
use App\Models\SystemAlert;
use App\Models\AuditLog;
use App\Models\ApiUsageLog;
use App\Models\Subscription;
use App\Models\User;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

/**
 * AdminDashboardController
 *
 * Main admin dashboard with system overview
 */
class AdminDashboardController extends \Illuminate\Routing\Controller
{
    /**
     * Show admin dashboard
     */
    public function index()
    {
        $systemStats = AnalyticsService::getSystemStats('7d');
        $apiStats = AnalyticsService::getUsageByProvider('7d');
        $errorStats = AnalyticsService::getErrorStats('7d');
        $topUsers = AnalyticsService::getTopUsersByUsage(5, '7d');
        $usageByIP = AnalyticsService::getUsageByIP('7d', 10);
        $usageByCountry = AnalyticsService::getUsageByCountry('7d');
        $criticalAlerts = SystemAlert::getCriticalAlerts()->take(5);

        return to_route('admin.dashboard');
        return Inertia::render('Admin/Management/Dashboard', [
            'systemStats' => $systemStats,
            'apiStats' => $apiStats,
            'errorStats' => $errorStats,
            'topUsers' => $topUsers,
            'usageByIP' => $usageByIP,
            'usageByCountry' => $usageByCountry,
            'criticalAlerts' => $criticalAlerts,
        ]);
    }

    /**
     * View system alerts
     */
    public function alerts()
    {
        $alerts = SystemAlert::where('is_resolved', false)
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Management/Alerts', ['alerts' => $alerts]);
    }

    /**
     * Resolve an alert
     */
    public function resolveAlert($id)
    {
        $alert = SystemAlert::find($id);
        if ($alert) {
            $alert->resolve();
        }

        return back()->with('success', 'Alert resolved');
    }

    /**
     * View audit logs
     */
    public function auditLogs()
    {
        $logs = AuditLog::with('user')
            ->latest()
            ->paginate(50);

        return Inertia::render('Admin/Management/AuditLogs', ['logs' => $logs]);
    }

    /**
     * Management dashboard with advanced analytics
     */
    public function managementDashboard()
    {
        $systemStats = AnalyticsService::getSystemStats('30d');
        $apiStats = AnalyticsService::getUsageByProvider('30d');
        $errorStats = AnalyticsService::getErrorStats('30d');
        $topUsers = AnalyticsService::getTopUsersByUsage(10, '30d');
        $usageByIP = AnalyticsService::getUsageByIP('30d', 15);
        $usageByCountry = AnalyticsService::getUsageByCountry('30d');
        $recentAlerts = SystemAlert::latest()->take(10)->get();
        $auditLogs = AuditLog::with('user')->latest()->take(5)->get();

        // Get trial analytics
        $trialAnalytics = [
            'totalTrialUsers' => Subscription::where('status', 'trial')->count(),
            'activeTrialUsers' => Subscription::where('status', 'trial')
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->count(),
            'expiringSoonTrials' => Subscription::where('status', 'trial')
                ->whereBetween('expires_at', [Carbon::now(), Carbon::now()->addDays(3)])
                ->count(),
            'expiredTrials' => Subscription::where('status', 'expired')
                ->where('updated_at', '>=', Carbon::now()->subDays(30))
                ->count(),
            'trialToUpgradeRate' => $this->calculateTrialToUpgradeRate(),
            'trialAgentsCreated' => $this->getTrialAgentsCount(),
            'expiredTrialsThisMonth' => Subscription::where('status', 'expired')
                ->whereMonth('updated_at', Carbon::now()->month)
                ->whereYear('updated_at', Carbon::now()->year)
                ->count(),
        ];

        // Transform system stats to match component expectations
        $transformedSystemStats = [
            'totalUsers' => $systemStats['total_users'] ?? 0,
            'activeUsers' => $systemStats['total_users'] ?? 0, // TODO: Calculate active users
            'totalTokensUsed' => $systemStats['api_stats']['total_tokens_used'] ?? 0,
            'totalRequests' => $systemStats['api_stats']['total_api_requests'] ?? 0,
            'averageTokensPerRequest' => $systemStats['api_stats']['total_api_requests'] > 0
                ? round(($systemStats['api_stats']['total_tokens_used'] ?? 0) / $systemStats['api_stats']['total_api_requests'])
                : 0,
            'errorRate' => $systemStats['api_stats']['total_api_requests'] > 0
                ? round(($systemStats['api_stats']['total_errors'] ?? 0) / $systemStats['api_stats']['total_api_requests'] * 100, 2)
                : 0,
        ];

        return Inertia::render('Admin/Management/Dashboard', [
            'systemStats' => $transformedSystemStats,
            'apiStats' => $apiStats,
            'errorStats' => $errorStats,
            'topUsers' => $topUsers,
            'usageByIP' => $usageByIP,
            'usageByCountry' => $usageByCountry,
            'recentAlerts' => $recentAlerts,
            'auditLogs' => $auditLogs,
            'trial' => $trialAnalytics,
        ]);
    }

    /**
     * Calculate trial to upgrade conversion rate
     */
    private function calculateTrialToUpgradeRate()
    {
        $totalTrialsEver = Subscription::where('status', '!=', 'trial')->count();
        if ($totalTrialsEver === 0) {
            return 0;
        }

        $upgradedFromTrial = Subscription::where('status', '!=', 'trial')
            ->where('was_trial', true)
            ->count();

        return round(($upgradedFromTrial / $totalTrialsEver) * 100, 1);
    }

    /**
     * Get total agents created by trial users
     */
    private function getTrialAgentsCount()
    {
        $trialUserIds = Subscription::where('status', 'trial')->pluck('user_id');
        return \App\Models\AIAgent::whereIn('user_id', $trialUserIds)->count();
    }

    /**
     * View system configuration
     */
    public function configuration()
    {
        return Inertia::render('Admin/Configuration', [
            'configs' => \App\Models\SystemConfig::all(),
        ]);
    }

    /**
     * Update system configuration
     */
    public function updateConfiguration(Request $request, \App\Models\SystemConfig $config)
    {
        $validated = $request->validate([
            'value' => 'required',
            'type' => 'required|in:string,number,boolean,json',
        ]);

        $config->update([
            'value' => $validated['value'],
            'type' => $validated['type'],
        ]);

        return response()->json(['success' => true, 'config' => $config]);
    }
}
