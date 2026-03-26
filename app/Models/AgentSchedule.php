<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class AgentSchedule extends Model
{
    use HasUlids;

    protected $fillable = [
        'agent_id',
        'project_id',
        'tool_chain_id',
        'name',
        'description',
        'cron_expression',
        'trigger_type',
        'webhook_token',
        'is_active',
        'input_data',
        'last_executed_at',
        'execution_count',
    ];

    protected $casts = [
        'input_data' => 'json',
        'last_executed_at' => 'datetime',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class);
    }

    public function toolChain(): BelongsTo
    {
        return $this->belongsTo(ToolChain::class);
    }

    public function executions(): HasMany
    {
        return $this->hasMany(ScheduleExecution::class);
    }

    /**
     * Generate webhook token
     */
    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if ($model->trigger_type === 'webhook' && !$model->webhook_token) {
                $model->webhook_token = Str::random(32);
            }
        });
    }

    /**
     * Record execution
     */
    public function recordExecution(string $status = 'success', array $data = []): ScheduleExecution
    {
        $this->increment('execution_count');
        $this->update(['last_executed_at' => now()]);

        return $this->executions()->create([
            'status' => $status,
            'input_data' => $data['input'] ?? null,
            'output_data' => $data['output'] ?? null,
            'error_message' => $data['error'] ?? null,
            'duration_ms' => $data['duration'] ?? null,
        ]);
    }

    /**
     * Check if schedule can run
     */
    public function canRun(): bool
    {
        return $this->is_active && ($this->toolChain?->canExecute() || $this->agent->isActive());
    }

    /**
     * Get next execution time
     */
    public function getNextExecutionTime(): ?\DateTime
    {
        if ($this->trigger_type !== 'cron') {
            return null;
        }

        try {
            $cron = \Cron\CronExpression::factory($this->cron_expression);
            return $cron->getNextRunDate();
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get trigger type label
     */
    public function getTriggerTypeLabel(): string
    {
        return match ($this->trigger_type) {
            'cron' => 'Scheduled (Cron)',
            'webhook' => 'Webhook',
            'manual' => 'Manual',
            default => 'Unknown',
        };
    }
}
