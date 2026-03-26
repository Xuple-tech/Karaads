<?php

namespace App\Console\Commands;

use App\Services\SecurityAuditService;
use App\Models\SecurityAuditLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

class SecurityHealthCheck extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'security:health-check
                            {--detailed : Show detailed security analysis}
                            {--days=7 : Number of days to analyze}';

    /**
     * The console command description.
     */
    protected $description = 'Perform a comprehensive security health check';

    /**
     * Execute the console command.
     */
    public function handle(SecurityAuditService $auditService): int
    {
        $days = (int) $this->option('days');
        $detailed = $this->option('detailed');

        $this->info("Performing security health check for the last {$days} days...");
        $this->newLine();

        // Get security statistics
        $stats = $auditService->getSecurityStatistics($days);

        // Overall health score
        $healthScore = $this->calculateHealthScore($stats);
        $this->displayHealthScore($healthScore);

        // Security metrics
        $this->displaySecurityMetrics($stats);

        // Threat analysis
        $this->displayThreatAnalysis($stats, $days);

        // Configuration check
        $this->checkSecurityConfiguration();

        if ($detailed) {
            $this->displayDetailedAnalysis($stats, $auditService, $days);
        }

        // Recommendations
        $this->displayRecommendations($stats, $healthScore);

        return 0;
    }

    /**
     * Calculate overall health score
     */
    private function calculateHealthScore(array $stats): int
    {
        $score = 100;

        // Deduct points for security violations
        $score -= min($stats['security_violations'] * 5, 30);
        $score -= min($stats['unauthorized_access'] * 3, 20);
        $score -= min($stats['suspicious_activity'] * 2, 15);
        $score -= min($stats['rate_limit_exceeded'] * 1, 10);

        return max($score, 0);
    }

    /**
     * Display health score
     */
    private function displayHealthScore(int $score): void
    {
        $color = match (true) {
            $score >= 90 => 'green',
            $score >= 70 => 'yellow',
            $score >= 50 => 'orange',
            default => 'red'
        };

        $status = match (true) {
            $score >= 90 => 'EXCELLENT',
            $score >= 70 => 'GOOD',
            $score >= 50 => 'FAIR',
            default => 'POOR'
        };

        $this->line("Security Health Score: <fg={$color}>{$score}/100 ({$status})</>");
        $this->newLine();
    }

    /**
     * Display security metrics
     */
    private function displaySecurityMetrics(array $stats): void
    {
        $this->info('Security Metrics:');
        $this->table(
            ['Metric', 'Count', 'Status'],
            [
                ['Total Events', $stats['total_events'], $this->getStatusIcon($stats['total_events'] < 10000)],
                ['Security Violations', $stats['security_violations'], $this->getStatusIcon($stats['security_violations'] == 0)],
                ['Unauthorized Access', $stats['unauthorized_access'], $this->getStatusIcon($stats['unauthorized_access'] < 5)],
                ['Suspicious Activity', $stats['suspicious_activity'], $this->getStatusIcon($stats['suspicious_activity'] < 10)],
                ['Rate Limit Exceeded', $stats['rate_limit_exceeded'], $this->getStatusIcon($stats['rate_limit_exceeded'] < 50)],
            ]
        );
        $this->newLine();
    }

    /**
     * Display threat analysis
     */
    private function displayThreatAnalysis(array $stats, int $days): void
    {
        $this->info('Threat Analysis:');

        // Calculate threat levels
        $threatLevel = $this->calculateThreatLevel($stats);
        $this->line("Current Threat Level: <fg={$threatLevel['color']}>{$threatLevel['level']}</>");

        // Top IPs
        if (!empty($stats['top_ips'])) {
            $this->info('Top Active IP Addresses:');
            $this->table(
                ['IP Address', 'Request Count', 'Risk Level'],
                collect($stats['top_ips'])->take(5)->map(function ($ip) {
                    $riskLevel = $ip->count > 1000 ? 'HIGH' : ($ip->count > 500 ? 'MEDIUM' : 'LOW');
                    $color = $ip->count > 1000 ? 'red' : ($ip->count > 500 ? 'yellow' : 'green');
                    return [$ip->ip_address, $ip->count, "<fg={$color}>{$riskLevel}</>"];
                })->toArray()
            );
        }

        $this->newLine();
    }

    /**
     * Check security configuration
     */
    private function checkSecurityConfiguration(): void
    {
        $this->info('Security Configuration Check:');

        $checks = [
            'HTTPS Enabled' => config('app.url', '')->startsWith('https://'),
            'Secure Routing Enabled' => config('secure-routing.enabled', false),
            'Bot Detection Enabled' => config('secure-routing.middleware.bot_detection.enabled', false),
            'UUID Validation Enabled' => config('secure-routing.uuid_validation.enabled', false),
            'Audit Logging Enabled' => config('secure-routing.audit_logging.enabled', false),
            'Rate Limiting Configured' => !empty(config('secure-routing.middleware.rate_limits', [])),
            'Security Tokens Enabled' => config('secure-routing.security_tokens.enabled', false),
        ];

        $this->table(
            ['Configuration', 'Status'],
            collect($checks)->map(function ($status, $check) {
                return [$check, $this->getStatusIcon($status)];
            })->toArray()
        );

        $this->newLine();
    }

    /**
     * Display detailed analysis
     */
    private function displayDetailedAnalysis(array $stats, SecurityAuditService $auditService, int $days): void
    {
        $this->info('Detailed Security Analysis:');

        // Events by day
        if (!empty($stats['events_by_day'])) {
            $this->info('Daily Event Trends:');
            $this->table(
                ['Date', 'Event Count'],
                collect($stats['events_by_day'])->map(function ($day) {
                    return [$day->date, $day->count];
                })->toArray()
            );
        }

        // Recent critical events
        $criticalEvents = SecurityAuditLog::where('severity', 'critical')
            ->where('created_at', '>=', now()->subDays($days))
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['action', 'resource', 'ip_address', 'created_at']);

        if ($criticalEvents->isNotEmpty()) {
            $this->warn('Recent Critical Events:');
            $this->table(
                ['Action', 'Resource', 'IP Address', 'Time'],
                $criticalEvents->map(function ($event) {
                    return [
                        $event->action,
                        $event->resource,
                        $event->ip_address,
                        $event->created_at->diffForHumans()
                    ];
                })->toArray()
            );
        }

        $this->newLine();
    }

    /**
     * Display recommendations
     */
    private function displayRecommendations(array $stats, int $healthScore): void
    {
        $this->info('Security Recommendations:');

        $recommendations = [];

        if ($stats['security_violations'] > 0) {
            $recommendations[] = 'Investigate and address security violations immediately';
        }

        if ($stats['unauthorized_access'] > 5) {
            $recommendations[] = 'Review access controls and authentication mechanisms';
        }

        if ($stats['suspicious_activity'] > 10) {
            $recommendations[] = 'Enhance monitoring and implement additional security measures';
        }

        if ($stats['rate_limit_exceeded'] > 100) {
            $recommendations[] = 'Review and adjust rate limiting configurations';
        }

        if ($healthScore < 70) {
            $recommendations[] = 'Conduct a comprehensive security audit';
        }

        if (!config('secure-routing.enabled')) {
            $recommendations[] = 'Enable secure routing system for enhanced protection';
        }

        if (empty($recommendations)) {
            $recommendations[] = 'Security posture is good. Continue monitoring.';
        }

        foreach ($recommendations as $index => $recommendation) {
            $this->line(($index + 1) . '. ' . $recommendation);
        }

        $this->newLine();
    }

    /**
     * Calculate threat level
     */
    private function calculateThreatLevel(array $stats): array
    {
        $totalThreats = $stats['security_violations'] + $stats['unauthorized_access'] + $stats['suspicious_activity'];

        return match (true) {
            $totalThreats == 0 => ['level' => 'LOW', 'color' => 'green'],
            $totalThreats < 10 => ['level' => 'MODERATE', 'color' => 'yellow'],
            $totalThreats < 50 => ['level' => 'HIGH', 'color' => 'orange'],
            default => ['level' => 'CRITICAL', 'color' => 'red']
        };
    }

    /**
     * Get status icon
     */
    private function getStatusIcon(bool $isGood): string
    {
        return $isGood ? '<fg=green>✓</>' : '<fg=red>✗</>';
    }
}
