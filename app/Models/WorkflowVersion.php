<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'version_number',
        'definition',
        'created_by',
        'changelog',
        'status',
    ];

    protected $casts = [
        'definition' => 'array',
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
     * Get the creator
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Publish this version
     */
    public function publish(): bool
    {
        return $this->update(['status' => 'published']);
    }

    /**
     * Get version summary
     */
    public function getSummary(): array
    {
        $steps = collect($this->definition['steps'] ?? [])->count();
        $connections = collect($this->definition['connections'] ?? [])->count();

        return [
            'version' => $this->version_number,
            'created_by' => $this->creator->name,
            'created_at' => $this->created_at->toIso8601String(),
            'status' => $this->status,
            'steps_count' => $steps,
            'connections_count' => $connections,
            'changelog' => $this->changelog,
        ];
    }
}
