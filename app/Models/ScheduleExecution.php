<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleExecution extends Model
{
    use HasUlids;

    protected $fillable = [
        'agent_schedule_id',
        'status',
        'input_data',
        'output_data',
        'error_message',
        'duration_ms',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'input_data' => 'json',
        'output_data' => 'json',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(AgentSchedule::class, 'agent_schedule_id');
    }

    /**
     * Mark execution as started
     */
    public function markStarted(): void
    {
        $this->update(['started_at' => now(), 'status' => 'running']);
    }

    /**
     * Mark execution as completed
     */
    public function markCompleted(string $status = 'success', array $data = []): void
    {
        $duration = $this->started_at ? now()->diffInMilliseconds($this->started_at) : null;

        $this->update([
            'status' => $status,
            'output_data' => $data['output'] ?? null,
            'error_message' => $data['error'] ?? null,
            'duration_ms' => $duration,
            'completed_at' => now(),
        ]);
    }

    /**
     * Get status badge color
     */
    public function getStatusColor(): string
    {
        return match ($this->status) {
            'success' => 'green',
            'failed' => 'red',
            'timeout' => 'orange',
            'running' => 'blue',
            'pending' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get human-readable duration
     */
    public function getFormattedDuration(): string
    {
        if (!$this->duration_ms) {
            return '—';
        }

        if ($this->duration_ms < 1000) {
            return $this->duration_ms . 'ms';
        }

        return round($this->duration_ms / 1000, 2) . 's';
    }
}
