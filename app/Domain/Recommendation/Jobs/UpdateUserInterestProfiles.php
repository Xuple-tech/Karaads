<?php

namespace App\Domain\Recommendation\Jobs;

use App\Domain\Recommendation\Services\BehaviorSignalService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class UpdateUserInterestProfiles implements ShouldQueue
{
    use Queueable;

    public function handle(BehaviorSignalService $behaviorSignalService): void
    {
        $behaviorSignalService->rebuildUserInterestProfiles();
    }
}

