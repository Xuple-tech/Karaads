<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowExecution extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'executed_by',
        'input_data',
        'status',
        'execution_log',
        'output',
        'error_message',
        'steps_executed',
        'steps_failed',
        'duration_ms',
    ];

    protected $casts = [
        'input_data' => 'array',
        'execution_log' => 'array',
        'output' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the workflow
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    /**
     * Get the executor
     */
    public function executor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'executed_by');
    }

    /**
     * Log step execution
     */
    public function logStepExecution(WorkflowStep $step, $result, $duration = null, $error = null): void
    {
        $log = $this->execution_log ?? [];
        $log[] = [
            'step_id' => $step->id,
            'step_name' => $step->step_name,
            'tool_id' => $step->tool_id,
            'status' => $error ? 'failed' : 'completed',
            'result' => $result,
            'error' => $error,
            'duration_ms' => $duration,
            'timestamp' => now()->toIso8601String(),
        ];

        $this->update([
            'execution_log' => $log,
            'steps_executed' => count($log),
            'steps_failed' => collect($log)->where('status', 'failed')->count(),
        ]);
    }

    /**
     * Mark as completed
     */
    public function markCompleted(array $output, int $durationMs): bool
    {
        return $this->update([
            'status' => 'completed',
            'output' => $output,
            'duration_ms' => $durationMs,
        ]);
    }

    /**
     * Mark as failed
     */
    public function markFailed(string $errorMessage, int $durationMs): bool
    {
        return $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'duration_ms' => $durationMs,
        ]);
    }

    /**
     * Mark as running
     */
    public function markRunning(): bool
    {
        return $this->update(['status' => 'running']);
    }

    /**
     * Get execution details for display
     */
    public function getDetails(): array
    {
        return [
            'id' => $this->id,
            'workflow_id' => $this->workflow_id,
            'status' => $this->status,
            'started_at' => $this->created_at->toIso8601String(),
            'completed_at' => $this->updated_at->toIso8601String(),
            'duration_ms' => $this->duration_ms,
            'steps_executed' => $this->steps_executed,
            'steps_failed' => $this->steps_failed,
            'execution_log' => $this->execution_log,
            'output' => $this->output,
            'error_message' => $this->error_message,
        ];
    }
}
