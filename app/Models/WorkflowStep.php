<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'tool_id',
        'order',
        'step_name',
        'input_mapping',
        'parameters',
        'conditions',
        'error_handling',
        'enabled',
    ];

    protected $casts = [
        'input_mapping' => 'array',
        'parameters' => 'array',
        'conditions' => 'array',
        'error_handling' => 'array',
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
     * Get the tool
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    /**
     * Get incoming connections
     */
    public function incomingConnections(): HasMany
    {
        return $this->hasMany(WorkflowConnection::class, 'to_step_id');
    }

    /**
     * Get outgoing connections
     */
    public function outgoingConnections(): HasMany
    {
        return $this->hasMany(WorkflowConnection::class, 'from_step_id');
    }

    /**
     * Get next steps
     */
    public function getNextSteps()
    {
        return $this->outgoingConnections()
            ->with('toStep')
            ->get()
            ->pluck('toStep');
    }

    /**
     * Update parameters
     */
    public function updateParameters(array $parameters): bool
    {
        return $this->update(['parameters' => $parameters]);
    }

    /**
     * Set conditional execution
     */
    public function setConditions(array $conditions): bool
    {
        return $this->update(['conditions' => $conditions]);
    }

    /**
     * Set error handling strategy
     */
    public function setErrorHandling(string $strategy = 'abort', ?int $retries = null): bool
    {
        $errorHandling = [
            'strategy' => $strategy, // abort, skip, retry
            'retries' => $retries,
        ];
        return $this->update(['error_handling' => $errorHandling]);
    }
}
