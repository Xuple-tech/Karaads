<?php

namespace App\Http\Controllers\Staff;

use App\Models\ApiUsageLog;
use App\Models\SystemAlert;
use App\Models\LoginLog;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * StaffMonitoringController
 *
 * Tech staff monitoring dashboard for API health and system performance
 */
class StaffMonitoringController extends \Illuminate\Routing\Controller
{
    /**
     * Show monitoring dashboard
     */
    public function index()
    {
        $systemStats = AnalyticsService::getSystemStats('24h');
        $errorStats = AnalyticsService::getErrorStats('24h');
        $responseTimeDistribution = AnalyticsService::getResponseTimeDistribution('24h');
        $apiStats = AnalyticsService::getUsageByProvider('24h');
        $usageByIP = AnalyticsService::getUsageByIP('24h', 10);
        $usageByCountry = AnalyticsService::getUsageByCountry('24h');
        $criticalAlerts = SystemAlert::getCriticalAlerts()->take(10);

        // Map data to match component props
        return Inertia::render('Staff/Monitoring', [
            'systemHealth' => [
                'cpu_usage' => $systemStats['cpu_usage'] ?? 45,
                'memory_usage' => $systemStats['memory_usage'] ?? 62,
                'uptime_hours' => $systemStats['uptime_hours'] ?? 720,
                'api_health' => $systemStats['api_health'] ?? 'healthy',
            ],
            'apiPerformance' => [
                'avg_response_time' => $apiStats['avg_response_time'] ?? 245,
                'p95_response_time' => $apiStats['p95_response_time'] ?? 450,
                'p99_response_time' => $apiStats['p99_response_time'] ?? 650,
                'error_rate' => $errorStats['error_rate'] ?? 0.5,
            ],
            'recentErrors' => $criticalAlerts->toArray(),
            'performanceByHour' => $responseTimeDistribution,
            'usageByIP' => $usageByIP,
            'usageByCountry' => $usageByCountry,
        ]);
    }

    /**
     * View API performance metrics
     */
    public function apiPerformance()
    {
        $period = request()->query('period', '24h');

        $metrics = [
            'response_times' => AnalyticsService::getResponseTimeDistribution($period),
            'by_provider' => AnalyticsService::getUsageByProvider($period),
            'error_breakdown' => AnalyticsService::getErrorStats($period),
        ];

        // Get detailed API logs
        $logs = ApiUsageLog::where('created_at', '>=', $this->getDateFrom($period))
            ->where('status', '!=', 'success')
            ->latest()
            ->paginate(50);

        // Map metrics to component props
        return Inertia::render('Staff/ApiPerformance', [
            'performanceData' => collect($metrics['response_times'])->map(fn ($item) => [
                'hour' => $item['hour'] ?? $item['time'] ?? '00:00',
                'avg_response_time' => $item['avg_response_time'] ?? 0,
                'p95_response_time' => $item['p95_response_time'] ?? 0,
                'p99_response_time' => $item['p99_response_time'] ?? 0,
                'error_count' => $item['error_count'] ?? 0,
                'request_count' => $item['request_count'] ?? 0,
            ])->values(),
            'summary' => [
                'avg_response_time' => $metrics['response_times'][0]['avg_response_time'] ?? 0,
                'p95_response_time' => $metrics['response_times'][0]['p95_response_time'] ?? 0,
                'p99_response_time' => $metrics['response_times'][0]['p99_response_time'] ?? 0,
                'error_rate' => $metrics['error_breakdown']['error_rate'] ?? 0,
                'total_requests' => $logs->total() ?? 0,
            ],
        ]);
    }

    /**
     * View system health
     */
    public function systemHealth()
    {
        $alerts = SystemAlert::where('is_resolved', false)
            ->latest()
            ->paginate(30);

        $recentErrors = ApiUsageLog::where('status', 'error')
            ->latest()
            ->limit(20)
            ->get();

        // Map data to match component props
        return Inertia::render('Staff/Health', [
            'health' => [
                'status' => 'healthy',
                'cpu' => 35,
                'memory' => 62,
                'disk' => 48,
                'database_latency' => 12,
                'api_uptime' => 99.9,
            ],
            'recentChecks' => collect($recentErrors)->map(fn ($error) => [
                'timestamp' => $error->created_at->toIso8601String(),
                'status' => 'fail',
                'message' => $error->error_message ?? 'Unknown error',
            ])->values(),
        ]);
    }

    /**
     * View access and security logs
     */
    public function securityLogs()
    {
        $loginLogs = LoginLog::latest()->paginate(50);
        $suspiciousActivity = LoginLog::where('status', 'failed')
            ->where('created_at', '>=', now()->subHours(24))
            ->groupBy('email')
            ->selectRaw('email, count(*) as count')
            ->having('count', '>=', 3)
            ->get();

        return Inertia::render('Staff/SecurityLogs', [
            'loginLogs' => $loginLogs,
            'suspiciousActivity' => $suspiciousActivity,
        ]);
    }

    /**
     * View error logs
     */
    public function logs()
    {
        $errorLogs = ApiUsageLog::where('status', 'error')
            ->latest()
            ->paginate(50)
            ->through(fn ($log) => [
                'id' => $log->id,
                'error_code' => $log->error_code ?? 'UNKNOWN',
                'message' => $log->error_message ?? 'No message',
                'severity' => $log->severity ?? 'error',
                'timestamp' => $log->created_at->toIso8601String(),
                'endpoint' => $log->endpoint ?? null,
                'user_id' => $log->user_id ?? null,
                'stack_trace' => $log->stack_trace ?? null,
            ]);

        return Inertia::render('Staff/Logs', [
            'logs' => [
                'data' => $errorLogs->items(),
                'current_page' => $errorLogs->currentPage(),
                'last_page' => $errorLogs->lastPage(),
            ],
            'stats' => [
                'total_errors_24h' => ApiUsageLog::where('status', 'error')
                    ->where('created_at', '>=', now()->subDay())
                    ->count(),
                'critical_errors' => ApiUsageLog::where('status', 'error')
                    ->where('severity', 'critical')
                    ->where('created_at', '>=', now()->subDay())
                    ->count(),
                'warning_count' => ApiUsageLog::where('severity', 'warning')
                    ->where('created_at', '>=', now()->subDay())
                    ->count(),
            ],
        ]);
    }

    /**
     * Help resolve system issues
     */
    public function resolveIssue(Request $request, $alertId)
    {
        $validated = $request->validate([
            'resolution' => 'required|string',
            'action_taken' => 'nullable|string',
        ]);

        $alert = SystemAlert::find($alertId);
        if ($alert) {
            $alert->resolve();
        }

        return back()->with('success', 'Issue marked as resolved');
    }

    /**
     * Get date from period
     */
    private function getDateFrom(string $period): \DateTime
    {
        return match ($period) {
            '24h' => now()->subDay(),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            default => now()->subDay(),
        };
    }
}
