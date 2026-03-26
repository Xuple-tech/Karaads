<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\AddOllamaApiKey::class,
        \App\Console\Commands\ListOllamaApiKeys::class,
        \App\Console\Commands\ResetOllamaKeyCounts::class,
        \App\Console\Commands\TestOllamaConnection::class,
        \App\Console\Commands\GenerateConversationTitles::class,
        \App\Console\Commands\ListConversations::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Generate conversation titles using Gemini AI daily at 2 AM
        $schedule->command('conversations:generate-titles --limit=50')
                 ->dailyAt('02:00')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Reset Gemini API key request counts daily at midnight
        $schedule->command('gemini:keys reset')
                 ->daily()
                 ->withoutOverlapping();

        // $schedule->command('inspire')->hourly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
