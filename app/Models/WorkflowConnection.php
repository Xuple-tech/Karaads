<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'from_step_id',
        'to_step_id',
        'connection_type',
        'mapping',
    ];

    protected $casts = [
        'mapping' => 'array',
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
     * Get the from step
     */
    public function fromStep(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'from_step_id');
    }

    /**
     * Get the to step
     */
    public function toStep(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'to_step_id');
    }

    /**
     * Update mapping
     */
    public function updateMapping(array $mapping): bool
    {
        return $this->update(['mapping' => $mapping]);
    }
}
