<?php

namespace App\Services;

use App\Models\Workflow;
use App\Models\WorkflowExecution;
use App\Models\WorkflowStep;
use App\Models\User;
use Exception;

class WorkflowExecutionService
{
    protected ToolExecutorService $toolExecutor;
    protected AgentExecutionService $agentExecutor;

    public function __construct(
        ToolExecutorService $toolExecutor,
        AgentExecutionService $agentExecutor
    ) {
        $this->toolExecutor = $toolExecutor;
        $this->agentExecutor = $agentExecutor;
    }

    /**
     * Execute a workflow
     */
    public function executeWorkflow(Workflow $workflow, User $user, array $inputData = []): WorkflowExecution
    {
        $execution = $workflow->execute($user, $inputData);
        $execution->markRunning();

        try {
            $startTime = microtime(true);

            // Get all workflow steps ordered
            $steps = $workflow->steps()->where('enabled', true)->orderBy('order')->get();

            if ($steps->isEmpty()) {
                throw new Exception('Workflow has no enabled steps');
            }

            $context = [
                'inputs' => $inputData,
                'step_outputs' => [],
                'workflow_id' => $workflow->id,
                'execution_id' => $execution->id,
            ];

            // Execute each step
            foreach ($steps as $step) {
                try {
                    $stepResult = $this->executeStep($step, $context, $user);

                    // Store step output
                    $context['step_outputs'][$step->id] = $stepResult;

                    // Log step execution
                    $execution->logStepExecution($step, $stepResult);

                } catch (Exception $e) {
                    // Handle error based on error_handling config
                    $handled = $this->handleStepError($step, $e, $execution, $context);

                    if (!$handled) {
                        throw $e;
                    }
                }
            }

            // Mark completed
            $duration = (microtime(true) - $startTime) * 1000;
            $execution->markCompleted($context['step_outputs'], (int)$duration);

            return $execution;

        } catch (Exception $e) {
            $duration = (microtime(true) - $startTime) * 1000;
            $execution->markFailed($e->getMessage(), (int)$duration);
            throw $e;
        }
    }

    /**
     * Execute a single workflow step
     */
    protected function executeStep(WorkflowStep $step, array &$context, User $user): mixed
    {
        // Check if step conditions are met
        if (!$this->checkConditions($step, $context)) {
            return ['skipped' => true, 'reason' => 'conditions_not_met'];
        }

        // Map inputs from previous steps
        $stepInput = $this->mapInputs($step, $context);

        // Execute the tool
        $result = $this->toolExecutor->execute(
            $step->tool->name,
            $stepInput,
            $user
        );

        return $result;
    }

    /**
     * Check if step conditions are met
     */
    protected function checkConditions(WorkflowStep $step, array $context): bool
    {
        if (!$step->conditions) {
            return true;
        }

        // Implement condition logic
        // Example: check if previous step output meets criteria
        foreach ($step->conditions as $condition) {
            $stepId = $condition['step_id'] ?? null;
            $field = $condition['field'] ?? null;
            $operator = $condition['operator'] ?? '==';
            $value = $condition['value'] ?? null;

            if (!isset($context['step_outputs'][$stepId])) {
                return false;
            }

            $outputValue = $context['step_outputs'][$stepId][$field] ?? null;

            if (!$this->evaluateCondition($outputValue, $operator, $value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Evaluate a single condition
     */
    protected function evaluateCondition($actual, string $operator, $expected): bool
    {
        return match($operator) {
            '==' => $actual == $expected,
            '!=' => $actual != $expected,
            '>' => $actual > $expected,
            '<' => $actual < $expected,
            '>=' => $actual >= $expected,
            '<=' => $actual <= $expected,
            'contains' => str_contains((string)$actual, (string)$expected),
            'in' => in_array($actual, (array)$expected),
            default => false,
        };
    }

    /**
     * Map inputs from previous step outputs
     */
    protected function mapInputs(WorkflowStep $step, array $context): array
    {
        $stepInput = [];

        if (!$step->input_mapping) {
            return $step->parameters;
        }

        foreach ($step->input_mapping as $inputKey => $mapping) {
            if (is_string($mapping)) {
                // Direct value from parameters
                $stepInput[$inputKey] = $step->parameters[$mapping] ?? $mapping;
            } elseif (is_array($mapping)) {
                // Map from previous step output
                $fromStepId = $mapping['from_step_id'] ?? null;
                $fromField = $mapping['from_field'] ?? null;

                if ($fromStepId && isset($context['step_outputs'][$fromStepId])) {
                    $stepInput[$inputKey] = $context['step_outputs'][$fromStepId][$fromField] ?? null;
                }
            }
        }

        return array_merge($step->parameters, $stepInput);
    }

    /**
     * Handle step errors
     */
    protected function handleStepError(WorkflowStep $step, Exception $e, WorkflowExecution $execution, array &$context): bool
    {
        $errorHandling = $step->error_handling ?? ['strategy' => 'abort'];

        match($errorHandling['strategy']) {
            'skip' => $execution->logStepExecution($step, [], 0, 'Step skipped due to error: ' . $e->getMessage()),
            'retry' => $this->retryStep($step, $errorHandling['retries'] ?? 3, $context),
            'abort' => throw $e,
        };

        return $errorHandling['strategy'] !== 'abort';
    }

    /**
     * Retry a step
     */
    protected function retryStep(WorkflowStep $step, int $maxRetries, array &$context): bool
    {
        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                sleep(pow(2, $attempt - 1)); // Exponential backoff
                $result = $this->executeStep($step, $context, auth()->user());
                $context['step_outputs'][$step->id] = $result;
                return true;
            } catch (Exception $e) {
                if ($attempt === $maxRetries) {
                    throw $e;
                }
            }
        }
        return false;
    }

    /**
     * Get execution history
     */
    public function getExecutionHistory(Workflow $workflow, int $limit = 50)
    {
        return $workflow->executions()
            ->with('executor')
            ->limit($limit)
            ->get()
            ->map(fn($execution) => $execution->getDetails());
    }

    /**
     * Get execution details
     */
    public function getExecutionDetails(WorkflowExecution $execution): array
    {
        return [
            'id' => $execution->id,
            'workflow' => [
                'id' => $execution->workflow->id,
                'name' => $execution->workflow->name,
            ],
            'executor' => $execution->executor->name,
            'status' => $execution->status,
            'started_at' => $execution->created_at->toIso8601String(),
            'completed_at' => $execution->updated_at->toIso8601String(),
            'duration_ms' => $execution->duration_ms,
            'steps' => $execution->steps_executed,
            'steps_failed' => $execution->steps_failed,
            'execution_log' => $execution->execution_log,
            'output' => $execution->output,
            'error' => $execution->error_message,
        ];
    }

    /**
     * Get workflow statistics
     */
    public function getWorkflowStats(Workflow $workflow): array
    {
        $stats = $workflow->getExecutionStats();
        $recentExecutions = $workflow->executions()->limit(10)->get();

        return [
            'total_executions' => $stats['total_executions'],
            'successful' => $stats['successful'],
            'failed' => $stats['failed'],
            'success_rate' => $stats['success_rate'],
            'average_duration_ms' => $stats['average_duration_ms'],
            'total_steps' => $workflow->steps()->count(),
            'enabled_steps' => $workflow->steps()->where('enabled', true)->count(),
            'recent_executions' => $recentExecutions->map(fn($e) => $e->getDetails()),
        ];
    }
}
