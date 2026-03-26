<?php

namespace App\Jobs;

use App\Models\AgentSchedule;
use App\Models\ScheduleExecution;
use App\Services\ToolCompositionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExecuteScheduledAgentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes

    public function __construct(
        protected AgentSchedule $schedule,
        protected ScheduleExecution $execution,
        protected array $inputData = []
    ) {}

    public function handle(ToolCompositionService $composition): void
    {
        try {
            $this->execution->markStarted();

            if (!$this->schedule->canRun()) {
                $this->execution->markCompleted('failed', [
                    'error' => 'Schedule is not active or tool chain is invalid',
                ]);

                return;
            }

            // Execute tool chain if exists
            if ($this->schedule->toolChain) {
                $result = $composition->execute(
                    $this->schedule->toolChain,
                    $this->inputData,
                    $this->schedule->agent
                );
            } else {
                // Just mark agent as executed
                $result = [
                    'success' => true,
                    'message' => 'Agent triggered via schedule',
                ];
            }

            $this->execution->markCompleted(
                $result['success'] ? 'success' : 'failed',
                $result
            );

            Log::info("Scheduled execution completed: {$this->schedule->name}", [
                'schedule_id' => $this->schedule->id,
                'execution_id' => $this->execution->id,
                'success' => $result['success'],
            ]);
        } catch (\Exception $e) {
            $this->execution->markCompleted('failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            Log::error("Scheduled execution failed: {$this->schedule->name}", [
                'schedule_id' => $this->schedule->id,
                'execution_id' => $this->execution->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
