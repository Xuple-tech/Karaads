<?php

namespace App\Services;

use App\Jobs\ExecuteScheduledAgentJob;
use App\Models\AgentSchedule;
use Cron\CronExpression;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;

/**
 * AgentSchedulerService - Manages agent scheduling and execution
 *
 * Handles:
 * - Cron-based scheduling
 * - Webhook triggers
 * - Manual execution
 * - Job queuing and tracking
 */
class AgentSchedulerService
{
    public function __construct(
        protected ToolCompositionService $composition,
        protected AgentMemoryService $memory
    ) {}

    /**
     * Schedule an agent to run on a cron expression
     */
    public function createSchedule(
        string $agentId,
        string $projectId,
        string $name,
        string $cronExpression,
        ?string $toolChainId = null,
        array $inputData = [],
        string $description = ''
    ): AgentSchedule {
        // Validate cron expression
        if (!$this->isValidCron($cronExpression)) {
            throw new \InvalidArgumentException("Invalid cron expression: {$cronExpression}");
        }

        return AgentSchedule::create([
            'agent_id' => $agentId,
            'project_id' => $projectId,
            'tool_chain_id' => $toolChainId,
            'name' => $name,
            'description' => $description,
            'cron_expression' => $cronExpression,
            'trigger_type' => 'cron',
            'input_data' => $inputData,
        ]);
    }

    /**
     * Create a webhook trigger
     */
    public function createWebhookTrigger(
        string $agentId,
        string $projectId,
        string $name,
        ?string $toolChainId = null,
        array $inputData = [],
        string $description = ''
    ): AgentSchedule {
        return AgentSchedule::create([
            'agent_id' => $agentId,
            'project_id' => $projectId,
            'tool_chain_id' => $toolChainId,
            'name' => $name,
            'description' => $description,
            'trigger_type' => 'webhook',
            'input_data' => $inputData,
        ]);
    }

    /**
     * Queue execution for a schedule
     */
    public function queueExecution(AgentSchedule $schedule, array $inputData = []): void
    {
        // Merge input data with schedule defaults
        $finalInput = array_merge($schedule->input_data ?? [], $inputData);

        // Create execution record
        $execution = $schedule->executions()->create([
            'status' => 'pending',
            'input_data' => $finalInput,
        ]);

        // Queue job
        ExecuteScheduledAgentJob::dispatch($schedule, $execution, $finalInput);

        Log::info("Queued execution for schedule: {$schedule->name}", [
            'schedule_id' => $schedule->id,
            'execution_id' => $execution->id,
        ]);
    }

    /**
     * Execute a schedule immediately
     */
    public function execute(AgentSchedule $schedule, array $inputData = []): array
    {
        if (!$schedule->canRun()) {
            return [
                'success' => false,
                'error' => 'Schedule is not active or tool chain is invalid',
            ];
        }

        $execution = $schedule->recordExecution('pending');
        $finalInput = array_merge($schedule->input_data ?? [], $inputData);

        $execution->markStarted();

        try {
            $result = $this->executeSchedule($schedule, $finalInput);
            $execution->markCompleted($result['success'] ? 'success' : 'failed', $result);

            return $result;
        } catch (\Exception $e) {
            $execution->markCompleted('failed', ['error' => $e->getMessage()]);

            Log::error("Schedule execution failed: {$schedule->name}", [
                'schedule_id' => $schedule->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Actually execute the schedule logic
     */
    protected function executeSchedule(AgentSchedule $schedule, array $inputData): array
    {
        $agent = $schedule->agent;

        // If tool chain exists, execute it
        if ($schedule->toolChain) {
            return $this->composition->execute($schedule->toolChain, $inputData, $agent);
        }

        // Otherwise just execute agent
        return [
            'success' => true,
            'message' => 'Agent activated via schedule',
            'agent_id' => $agent->id,
        ];
    }

    /**
     * Check if any schedules should run and queue them
     */
    public function processSchedules(): int
    {
        $schedules = AgentSchedule::where('is_active', true)
            ->where('trigger_type', 'cron')
            ->get();

        $queued = 0;

        foreach ($schedules as $schedule) {
            if ($this->shouldRun($schedule)) {
                $this->queueExecution($schedule);
                $queued++;
            }
        }

        return $queued;
    }

    /**
     * Check if schedule should run now
     */
    protected function shouldRun(AgentSchedule $schedule): bool
    {
        try {
            $cron = CronExpression::factory($schedule->cron_expression);
            return $cron->isDue();
        } catch (\Exception $e) {
            Log::error("Invalid cron expression: {$schedule->cron_expression}", [
                'schedule_id' => $schedule->id,
            ]);

            return false;
        }
    }

    /**
     * Get next run time for a schedule
     */
    public function getNextRunTime(AgentSchedule $schedule): ?\DateTime
    {
        if ($schedule->trigger_type !== 'cron') {
            return null;
        }

        try {
            $cron = CronExpression::factory($schedule->cron_expression);
            return $cron->getNextRunDate();
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Validate cron expression
     */
    public function isValidCron(string $expression): bool
    {
        try {
            CronExpression::factory($expression);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get execution history
     */
    public function getExecutionHistory(AgentSchedule $schedule, int $limit = 20)
    {
        return $schedule->executions()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Get execution statistics
     */
    public function getExecutionStats(AgentSchedule $schedule): array
    {
        $executions = $schedule->executions();

        return [
            'total' => $executions->count(),
            'successful' => $executions->where('status', 'success')->count(),
            'failed' => $executions->where('status', 'failed')->count(),
            'success_rate' => $executions->where('status', 'success')->count() / max(1, $executions->count()),
            'avg_duration_ms' => (int) $executions->whereNotNull('duration_ms')->avg('duration_ms') ?? 0,
        ];
    }

    /**
     * Trigger schedule by webhook
     */
    public function triggerByWebhook(string $token, array $payload = []): array
    {
        $schedule = AgentSchedule::where('webhook_token', $token)
            ->where('is_active', true)
            ->first();

        if (!$schedule) {
            return [
                'success' => false,
                'error' => 'Webhook not found or inactive',
            ];
        }

        return $this->execute($schedule, $payload);
    }

    /**
     * Deactivate schedule
     */
    public function deactivate(AgentSchedule $schedule): void
    {
        $schedule->update(['is_active' => false]);
    }

    /**
     * Activate schedule
     */
    public function activate(AgentSchedule $schedule): void
    {
        $schedule->update(['is_active' => true]);
    }

    /**
     * Delete schedule
     */
    public function delete(AgentSchedule $schedule): void
    {
        $schedule->delete();
    }
}
