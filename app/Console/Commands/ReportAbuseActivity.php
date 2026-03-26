<?php

namespace App\Console\Commands;

use App\Models\PromptLog;
use Illuminate\Console\Command;

class ReportAbuseActivity extends Command
{
    protected $signature = 'report:abuse {--days=7 : Number of days to analyze}';
    protected $description = 'Generate a report of abusive prompt activity';

    public function handle(): int
    {
        $days = $this->option('days');
        $fromDate = now()->subDays($days);

        $this->info("=== Prompt Abuse Report (Last {$days} Days) ===\n");

        // Total prompts
        $totalPrompts = PromptLog::where('created_at', '>=', $fromDate)->count();
        $this->line("Total Prompts: {$totalPrompts}");

        // Abusive prompts
        $abusePrompts = PromptLog::where('is_likely_abuse', true)
            ->where('created_at', '>=', $fromDate)
            ->count();
        $abusePercentage = $totalPrompts > 0 ? round(($abusePrompts / $totalPrompts) * 100, 2) : 0;
        $this->line("Flagged as Abuse: {$abusePrompts} ({$abusePercentage}%)");

        // Abuse reasons
        $this->line("\n--- Abuse Reasons ---");
        PromptLog::where('is_likely_abuse', true)
            ->where('created_at', '>=', $fromDate)
            ->selectRaw('abuse_reason, COUNT(*) as count')
            ->groupBy('abuse_reason')
            ->orderByDesc('count')
            ->get()
            ->each(fn ($row) =>
                $this->line("  {$row->abuse_reason}: {$row->count}")
            );

        // Top offending IPs
        $this->line("\n--- Top 10 Offending IP Addresses ---");
        PromptLog::where('is_likely_abuse', true)
            ->where('created_at', '>=', $fromDate)
            ->selectRaw('ip_address, COUNT(*) as count')
            ->groupBy('ip_address')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->each(fn ($ip) =>
                $this->line("  {$ip->ip_address}: {$ip->count} abuse attempts")
            );

        // Prompt length categories of abusive content
        $this->line("\n--- Abusive Content by Length ---");
        PromptLog::where('is_likely_abuse', true)
            ->where('created_at', '>=', $fromDate)
            ->selectRaw('prompt_length, COUNT(*) as count')
            ->groupBy('prompt_length')
            ->get()
            ->each(fn ($row) =>
                $this->line("  {$row->prompt_length}: {$row->count}")
            );

        return self::SUCCESS;
    }
}
