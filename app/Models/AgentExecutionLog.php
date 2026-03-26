<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentExecutionLog extends Model
{
    use HasUlids;

    protected $fillable = [
        'agent_id',
        'conversation_id',
        'status',
        'trigger_type',
        'trigger_data',
        'input_data',
        'output_data',
        'error_message',
        'execution_time_ms',
    ];

    protected $casts = [
        'input_data' => 'json',
        'output_data' => 'json',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Check if execution was successful
     */
    public function isSuccessful(): bool
    {
        return in_array($this->status, ['success', 'completed']);
    }

    /**
     * Check if execution failed
     */
    public function isFailed(): bool
    {
        return in_array($this->status, ['failed', 'error']);
    }

    /**
     * Get readable status label
     */
    public function getStatusLabel(): string
    {
        return match($this->status) {
            'pending' => 'Pending',
            'running' => 'Running',
            'success' => 'Success',
            'failed' => 'Failed',
            'error' => 'Error',
            default => 'Unknown',
        };
    }
}
