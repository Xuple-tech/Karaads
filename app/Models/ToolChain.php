<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ToolChain extends Model
{
    use HasUlids;

    protected $fillable = [
        'agent_id',
        'project_id',
        'name',
        'description',
        'execution_mode',
        'is_active',
        'execution_count',
        'last_executed_at',
    ];

    protected $casts = [
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

    public function steps(): HasMany
    {
        return $this->hasMany(ToolChainStep::class)->orderBy('sequence');
    }

    /**
     * Record execution
     */
    public function recordExecution(): void
    {
        $this->increment('execution_count');
        $this->update(['last_executed_at' => now()]);
    }

    /**
     * Get execution mode label
     */
    public function getExecutionModeLabel(): string
    {
        return match ($this->execution_mode) {
            'sequential' => 'Sequential (Tool 1 → Tool 2 → Tool 3)',
            'parallel' => 'Parallel (All tools at once)',
            'conditional' => 'Conditional (If/Else logic)',
            default => 'Unknown',
        };
    }

    /**
     * Check if chain can be executed
     */
    public function canExecute(): bool
    {
        return $this->is_active && $this->steps()->count() > 0;
    }
}
