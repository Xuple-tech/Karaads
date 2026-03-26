<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\ToolChain;
use Illuminate\Support\Collection;

/**
 * ToolCompositionService - Orchestrates tool chains
 *
 * Handles:
 * - Sequential execution (tool1 → tool2 → tool3)
 * - Parallel execution (all tools at once)
 * - Conditional execution (if/else logic)
 * - Parameter resolution and passing between tools
 */
class ToolCompositionService
{
    public function __construct(
        protected ToolExecutorService $executor
    ) {}

    /**
     * Execute a tool chain
     */
    public function execute(ToolChain $chain, array $initialInput = [], ?Agent $agent = null): array
    {
        if (!$chain->canExecute()) {
            return [
                'success' => false,
                'error' => 'Tool chain is not valid or inactive',
            ];
        }

        try {
            return match ($chain->execution_mode) {
                'sequential' => $this->executeSequential($chain, $initialInput, $agent),
                'parallel' => $this->executeParallel($chain, $initialInput, $agent),
                'conditional' => $this->executeConditional($chain, $initialInput, $agent),
                default => ['success' => false, 'error' => 'Unknown execution mode'],
            };
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        } finally {
            $chain->recordExecution();
        }
    }

    /**
     * Sequential execution: Tool 1 → Tool 2 → Tool 3
     */
    protected function executeSequential(ToolChain $chain, array $initialInput, ?Agent $agent): array
    {
        $steps = $chain->steps;
        $context = $initialInput;
        $results = [];

        foreach ($steps as $step) {
            if (!$step->isValid()) {
                return [
                    'success' => false,
                    'error' => "Step {$step->sequence}: Tool '{$step->tool_name}' not found or inactive",
                ];
            }

            // Resolve parameters with context from previous steps
            $params = $step->resolveParameters($context);

            $result = $this->executor->execute($step->tool_name, $params, $agent);
            $results[$step->tool_name] = $result;

            // If tool execution failed, optionally stop or continue
            if (!$result['success']) {
                if ($step->next_step_on_failure) {
                    // Jump to failure handler step
                    continue;
                }

                // Return error
                return [
                    'success' => false,
                    'error' => "Step {$step->sequence} ({$step->tool_name}) failed: " . ($result['error'] ?? 'Unknown error'),
                    'partial_results' => $results,
                ];
            }

            // Add result to context for next step
            $context[$step->tool_name . '_result'] = $result['data'] ?? $result;
        }

        return [
            'success' => true,
            'message' => 'All tools executed successfully',
            'results' => $results,
        ];
    }

    /**
     * Parallel execution: Run all tools concurrently
     */
    protected function executeParallel(ToolChain $chain, array $initialInput, ?Agent $agent): array
    {
        $steps = $chain->steps;
        $results = [];
        $errors = [];

        foreach ($steps as $step) {
            if (!$step->isValid()) {
                $errors[$step->tool_name] = "Tool not found or inactive";
                continue;
            }

            $params = $step->resolveParameters($initialInput);
            $result = $this->executor->execute($step->tool_name, $params, $agent);

            if ($result['success']) {
                $results[$step->tool_name] = $result;
            } else {
                $errors[$step->tool_name] = $result['error'] ?? 'Unknown error';
            }
        }

        return [
            'success' => empty($errors),
            'message' => count($errors) > 0 ? 'Some tools failed' : 'All tools executed successfully',
            'results' => $results,
            'errors' => $errors,
        ];
    }

    /**
     * Conditional execution: If/Else logic
     */
    protected function executeConditional(ToolChain $chain, array $initialInput, ?Agent $agent): array
    {
        $steps = $chain->steps;
        $context = $initialInput;
        $results = [];
        $currentStep = 0;

        while ($currentStep < count($steps)) {
            $step = $steps[$currentStep];

            if (!$step->isValid()) {
                return [
                    'success' => false,
                    'error' => "Step {$currentStep}: Tool '{$step->tool_name}' not found",
                ];
            }

            // Check condition if this is a conditional step
            if ($step->is_conditional && $step->condition_logic) {
                $conditionMet = $this->evaluateCondition($step->condition_logic, $context);
                $nextStep = $conditionMet ? $step->next_step_on_success : $step->next_step_on_failure;

                if ($nextStep) {
                    $currentStep = $this->findStepByName($steps, $nextStep);
                    continue;
                }
            }

            // Execute tool
            $params = $step->resolveParameters($context);
            $result = $this->executor->execute($step->tool_name, $params, $agent);
            $results[$step->tool_name] = $result;

            // Determine next step
            $nextStep = $result['success'] ? $step->next_step_on_success : $step->next_step_on_failure;

            if ($nextStep) {
                $currentStep = $this->findStepByName($steps, $nextStep);
            } else {
                $currentStep++;
            }

            // Add result to context
            $context[$step->tool_name . '_result'] = $result['data'] ?? $result;
        }

        return [
            'success' => true,
            'message' => 'Conditional chain executed successfully',
            'results' => $results,
        ];
    }

    /**
     * Evaluate a condition
     */
    protected function evaluateCondition(array $logic, array $context): bool
    {
        $operator = $logic['operator'] ?? 'and';
        $conditions = $logic['conditions'] ?? [];

        foreach ($conditions as $condition) {
            $field = $condition['field'] ?? null;
            $comparator = $condition['comparator'] ?? 'equals';
            $value = $condition['value'] ?? null;

            $contextValue = $context[$field] ?? null;

            $conditionMet = match ($comparator) {
                'equals' => $contextValue === $value,
                'not_equals' => $contextValue !== $value,
                'contains' => str_contains((string) $contextValue, (string) $value),
                'greater_than' => (int) $contextValue > (int) $value,
                'less_than' => (int) $contextValue < (int) $value,
                default => false,
            };

            if ($operator === 'or' && $conditionMet) {
                return true;
            }

            if ($operator === 'and' && !$conditionMet) {
                return false;
            }
        }

        return $operator === 'and'; // If all conditions passed (AND) or no conditions (OR would return false)
    }

    /**
     * Find step index by name
     */
    protected function findStepByName(Collection $steps, string $stepName): int
    {
        foreach ($steps as $index => $step) {
            if ($step->tool_name === $stepName || $step->id === $stepName) {
                return $index;
            }
        }

        return count($steps); // Move to end if not found
    }

    /**
     * Validate chain structure
     */
    public function validateChain(ToolChain $chain): array
    {
        $errors = [];

        if ($chain->steps->isEmpty()) {
            $errors[] = 'Tool chain must have at least one step';
        }

        foreach ($chain->steps as $step) {
            if (!$step->tool()->exists()) {
                $errors[] = "Step {$step->sequence}: Tool '{$step->tool_name}' not found";
            }

            // Validate parameter resolution
            foreach ($step->parameters ?? [] as $key => $value) {
                if (is_string($value) && str_starts_with($value, '{{')) {
                    // This would need to be resolved at runtime
                }
            }
        }

        return $errors;
    }

    /**
     * Get chain execution plan
     */
    public function getExecutionPlan(ToolChain $chain): array
    {
        $steps = $chain->steps->map(function ($step) {
            return [
                'sequence' => $step->sequence,
                'tool' => $step->tool_name,
                'parameters' => $step->parameters,
                'mode' => $chain->execution_mode,
            ];
        });

        return [
            'mode' => $chain->execution_mode,
            'steps' => $steps->toArray(),
        ];
    }
}
