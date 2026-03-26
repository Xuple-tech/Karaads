<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Agent extends Model
{
    use HasUlids;

    protected $fillable = [
        'project_id',
        'user_id',
        'name',
        'description',
        'avatar_url',
        'type',
        'status',
        'configuration',
        'capabilities',
        'available_tools',
        'custom_instructions',
        'visibility',
        'is_system_agent',
        'execution_count',
        'last_executed_at',
    ];

    protected $casts = [
        'configuration' => 'json',
        'capabilities' => 'json',
        'available_tools' => 'json',
        'is_system_agent' => 'boolean',
        'last_executed_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class);
    }

    /**
     * Many-to-many relationship with projects
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Projects::class, 'project_agent', 'agent_id', 'project_id')
                    ->withPivot(['agent_configuration', 'project_instructions', 'is_active'])
                    ->withTimestamps();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function triggers(): HasMany
    {
        return $this->hasMany(AgentTrigger::class);
    }

    public function actions(): HasMany
    {
        return $this->hasMany(AgentAction::class)->orderBy('sequence');
    }

    public function executionLogs(): HasMany
    {
        return $this->hasMany(AgentExecutionLog::class);
    }

    public function memories(): HasMany
    {
        return $this->hasMany(AgentMemory::class);
    }

    public function toolChains(): HasMany
    {
        return $this->hasMany(ToolChain::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(AgentSchedule::class);
    }

    /**
     * Check if agent is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if agent can execute based on trigger
     */
    public function canExecute(string $triggerType, string $triggerData): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        return $this->triggers()
            ->where('is_active', true)
            ->where('trigger_type', $triggerType)
            ->where('trigger_value', 'like', "%{$triggerData}%")
            ->exists();
    }

    /**
     * Record execution
     */
    public function recordExecution(string $status = 'success', array $data = []): AgentExecutionLog
    {
        $this->increment('execution_count');
        $this->update(['last_executed_at' => now()]);

        return $this->executionLogs()->create([
            'status' => $status,
            'input_data' => $data['input'] ?? null,
            'output_data' => $data['output'] ?? null,
            'error_message' => $data['error'] ?? null,
        ]);
    }

    /**
     * Get response template if configured
     */
    public function getResponseTemplate(): ?string
    {
        return $this->configuration['response_template'] ?? null;
    }

    /**
     * Get capabilities
     */
    public function getCapabilities(): array
    {
        return $this->capabilities ?? [];
    }

    /**
     * Check if agent has specific capability
     */
    public function hasCapability(string $capability): bool
    {
        return in_array($capability, $this->getCapabilities());
    }

    /**
     * Check if agent is a system agent
     */
    public function isSystemAgent(): bool
    {
        return $this->is_system_agent === true;
    }

    /**
     * Check if agent is visible to user
     */
    public function isVisibleTo(?string $userId = null): bool
    {
        // System agents are visible to everyone
        if ($this->visibility === 'system') {
            return true;
        }

        // Public agents are visible to everyone
        if ($this->visibility === 'public') {
            return true;
        }

        // Private agents are only visible to their creator
        if ($this->visibility === 'private') {
            return $this->user_id === $userId;
        }

        return false;
    }

    /**
     * Get available tools for this agent
     */
    public function getAvailableTools(): array
    {
        return $this->available_tools ?? [];
    }

    /**
     * Check if agent has specific tool
     */
    public function hasTool(string $tool): bool
    {
        return in_array($tool, $this->getAvailableTools());
    }

    /**
     * Get custom instructions
     */
    public function getCustomInstructions(): ?string
    {
        return $this->custom_instructions;
    }

    /**
     * Scope for system agents
     */
    public function scopeSystemAgents($query)
    {
        return $query->where('is_system_agent', true);
    }

    /**
     * Scope for user agents
     */
    public function scopeUserAgents($query)
    {
        return $query->where('is_system_agent', false);
    }

    /**
     * Scope for visible agents to a user
     */
    public function scopeVisibleTo($query, ?string $userId = null)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('visibility', 'system')
              ->orWhere('visibility', 'public')
              ->orWhere(function ($subQ) use ($userId) {
                  $subQ->where('visibility', 'private')
                       ->where('user_id', $userId);
              });
        });
    }
}
