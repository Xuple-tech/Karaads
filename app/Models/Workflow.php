<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Workflow extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'project_id',
        'created_by',
        'name',
        'slug',
        'description',
        'type',
        'definition',
        'metadata',
        'status',
        'version',
    ];

    protected $casts = [
        'definition' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the team
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the project
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class);
    }

    /**
     * Get the creator
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all workflow steps
     */
    public function steps(): HasMany
    {
        return $this->hasMany(WorkflowStep::class)->orderBy('order');
    }

    /**
     * Get all connections between steps
     */
    public function connections(): HasMany
    {
        return $this->hasMany(WorkflowConnection::class);
    }

    /**
     * Get all executions
     */
    public function executions(): HasMany
    {
        return $this->hasMany(WorkflowExecution::class)->latest();
    }

    /**
     * Get all triggers
     */
    public function triggers(): HasMany
    {
        return $this->hasMany(WorkflowTrigger::class);
    }

    /**
     * Get all versions
     */
    public function versions(): HasMany
    {
        return $this->hasMany(WorkflowVersion::class)->orderByDesc('version_number');
    }

    /**
     * Add a step to workflow
     */
    public function addStep(Tool $tool, int $order, string $stepName, array $parameters = []): WorkflowStep
    {
        return $this->steps()->create([
            'tool_id' => $tool->id,
            'order' => $order,
            'step_name' => $stepName,
            'parameters' => $parameters,
        ]);
    }

    /**
     * Connect two steps
     */
    public function connectSteps(WorkflowStep $fromStep, WorkflowStep $toStep, array $mapping = []): WorkflowConnection
    {
        return $this->connections()->create([
            'from_step_id' => $fromStep->id,
            'to_step_id' => $toStep->id,
            'mapping' => $mapping,
        ]);
    }

    /**
     * Execute workflow
     */
    public function execute(User $user, array $inputData = []): WorkflowExecution
    {
        return $this->executions()->create([
            'executed_by' => $user->id,
            'input_data' => $inputData,
            'status' => 'pending',
            'execution_log' => [],
        ]);
    }

    /**
     * Get execution statistics
     */
    public function getExecutionStats(): array
    {
        $executions = $this->executions()->get();
        $total = $executions->count();
        $successful = $executions->where('status', 'completed')->count();
        $failed = $executions->where('status', 'failed')->count();

        return [
            'total_executions' => $total,
            'successful' => $successful,
            'failed' => $failed,
            'success_rate' => $total > 0 ? round(($successful / $total) * 100, 2) : 0,
            'average_duration_ms' => $executions->average('duration_ms') ?? 0,
        ];
    }

    /**
     * Publish workflow (create new version)
     */
    public function publish(User $user, string $changelog = ''): WorkflowVersion
    {
        $nextVersion = $this->versions()->max('version_number') ?? 0;
        $nextVersion++;

        $version = $this->versions()->create([
            'version_number' => $nextVersion,
            'definition' => $this->definition,
            'created_by' => $user->id,
            'changelog' => $changelog,
            'status' => 'published',
        ]);

        $this->update([
            'version' => $nextVersion,
            'status' => 'published',
        ]);

        return $version;
    }

    /**
     * Revert to previous version
     */
    public function revertToVersion(int $versionNumber, User $user): bool
    {
        $version = $this->versions()->where('version_number', $versionNumber)->first();
        if (!$version) {
            return false;
        }

        $this->update([
            'definition' => $version->definition,
            'version' => $versionNumber,
        ]);

        return true;
    }
}
