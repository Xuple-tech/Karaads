<?php

namespace App\Console\Commands;

use App\Domain\Recommendation\Jobs\RebuildDailyPerformanceStats;
use App\Domain\Recommendation\Jobs\UpdateUserInterestProfiles;
use Illuminate\Console\Command;

class RecoRebuildDailyStats extends Command
{
    protected $signature = 'reco:rebuild {--date=} {--sync}';

    protected $description = 'Rebuild recommendation performance aggregates and user interest profiles.';

    public function handle(): int
    {
        $date = $this->option('date') ?: now()->toDateString();
        $sync = (bool) $this->option('sync');

        if ($sync) {
            app(RebuildDailyPerformanceStats::class, ['date' => $date])->handle(app(\App\Domain\Recommendation\Services\BehaviorSignalService::class));
            app(UpdateUserInterestProfiles::class)->handle(app(\App\Domain\Recommendation\Services\BehaviorSignalService::class));
        } else {
            RebuildDailyPerformanceStats::dispatch($date);
            UpdateUserInterestProfiles::dispatch();
        }

        $this->info('Recommendation rebuild queued/executed.');

        return self::SUCCESS;
    }
}

