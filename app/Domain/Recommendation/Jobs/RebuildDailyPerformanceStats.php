<?php

namespace App\Domain\Recommendation\Jobs;

use App\Domain\Recommendation\Services\BehaviorSignalService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RebuildDailyPerformanceStats implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly ?string $date = null) {}

    public function handle(BehaviorSignalService $behaviorSignalService): void
    {
        $behaviorSignalService->rebuildDailyStats($this->date ?? now()->toDateString());
    }
}

