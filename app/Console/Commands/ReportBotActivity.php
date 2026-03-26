<?php

namespace App\Console\Commands;

use App\Models\RequestLog;
use Illuminate\Console\Command;

class ReportBotActivity extends Command
{
    protected $signature = 'report:bots {--days=7 : Number of days to analyze}';
    protected $description = 'Generate a report of bot activity';

    public function handle(): int
    {
        $days = $this->option('days');
        $fromDate = now()->subDays($days);

        $this->info("=== Bot Activity Report (Last {$days} Days) ===\n");

        // Total requests
        $totalRequests = RequestLog::where('created_at', '>=', $fromDate)->count();
        $this->line("Total Requests: {$totalRequests}");

        // Bot requests
        $botRequests = RequestLog::bot()
            ->where('created_at', '>=', $fromDate)
            ->count();
        $botPercentage = $totalRequests > 0 ? round(($botRequests / $totalRequests) * 100, 2) : 0;
        $this->line("Bot Requests: {$botRequests} ({$botPercentage}%)");

        // Top bot IPs
        $this->line("\n--- Top 10 Bot IP Addresses ---");
        RequestLog::bot()
            ->where('created_at', '>=', $fromDate)
            ->selectRaw('ip_address, COUNT(*) as count, AVG(bot_score) as avg_score')
            ->groupBy('ip_address')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->each(fn ($ip) =>
                $this->line("  {$ip->ip_address}: {$ip->count} requests (avg score: {$ip->avg_score})")
            );

        // Bot score distribution
        $this->line("\n--- Bot Score Distribution ---");
        RequestLog::where('created_at', '>=', $fromDate)
            ->selectRaw('ROUND(bot_score, 0) as score, COUNT(*) as count')
            ->groupBy('score')
            ->orderByDesc('score')
            ->limit(10)
            ->get()
            ->each(fn ($row) =>
                $this->line("  Score {$row->score}: {$row->count} requests")
            );

        return self::SUCCESS;
    }
}
