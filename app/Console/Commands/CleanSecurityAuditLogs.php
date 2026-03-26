<?php

namespace App\Console\Commands;

use App\Services\SecurityAuditService;
use Illuminate\Console\Command;

class CleanSecurityAuditLogs extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'security:clean-audit-logs
                            {--days=90 : Number of days to keep logs}
                            {--keep-critical=365 : Days to keep critical logs}
                            {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     */
    protected $description = 'Clean old security audit logs while preserving critical events';

    /**
     * Execute the console command.
     */
    public function handle(SecurityAuditService $auditService): int
    {
        $days = (int) $this->option('days');
        $keepCriticalDays = (int) $this->option('keep-critical');
        $dryRun = $this->option('dry-run');

        $this->info("Cleaning security audit logs older than {$days} days...");
        $this->info("Keeping critical logs for {$keepCriticalDays} days...");

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No logs will be actually deleted');
        }

        // Get statistics before cleanup
        $stats = $auditService->getSecurityStatistics($days + 30);
        $this->info("Current total events: {$stats['total_events']}");

        if (!$dryRun) {
            // Clean regular logs
            $deletedCount = $auditService->cleanOldLogs($days);
            $this->info("Deleted {$deletedCount} regular audit log entries");

            // Clean critical logs (older than keepCriticalDays)
            $criticalDeletedCount = $auditService->cleanOldLogs($keepCriticalDays, ['critical', 'high']);
            $this->info("Deleted {$criticalDeletedCount} old critical audit log entries");

            $totalDeleted = $deletedCount + $criticalDeletedCount;
            $this->info("Total deleted: {$totalDeleted} audit log entries");
        } else {
            // Simulate cleanup for dry run
            $this->info("Would delete approximately " . ($stats['total_events'] * 0.7) . " log entries");
        }

        // Show current statistics
        $currentStats = $auditService->getSecurityStatistics(30);
        $this->table(
            ['Metric', 'Count (Last 30 days)'],
            [
                ['Total Events', $currentStats['total_events']],
                ['Security Violations', $currentStats['security_violations']],
                ['Unauthorized Access', $currentStats['unauthorized_access']],
                ['Suspicious Activity', $currentStats['suspicious_activity']],
                ['Rate Limit Exceeded', $currentStats['rate_limit_exceeded']],
            ]
        );

        $this->info('Security audit log cleanup completed!');

        return 0;
    }
}
