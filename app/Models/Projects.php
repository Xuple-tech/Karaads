<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Projects extends Model
{
    use HasUlids;
    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'title',
        'project_type',
        'settings',
        'description',
        'category_id',
        'template_id',
        'logo',
        'visibility',
        'status',
        'ai_model',
        'coding_framework',
        'analytics_enabled',
        'auto_deploy',
        'repository_url',
        'deployment_url',
        'environment_variables',
        'dependencies',
        'build_status',
        'last_build_at',
        'performance_metrics',
        'code_quality_score',
    ];

    protected $casts = [
        'settings' => 'array',
        'environment_variables' => 'array',
        'dependencies' => 'array',
        'performance_metrics' => 'array',
        'analytics_enabled' => 'boolean',
        'auto_deploy' => 'boolean',
        'last_build_at' => 'datetime',
        'code_quality_score' => 'float',
    ];

    /**
     * Get the user who created this project
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get conversations linked to this project
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'projects_id');
    }

    /**
     * Get files in this project
     */
    public function files(): HasMany
    {
        return $this->hasMany(ProjectFiles::class, 'project_id');
    }

    /**
     * Get category for this project
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProjectCategory::class, 'category_id');
    }

    /**
     * Get team members
     */
    public function members(): HasMany
    {
        return $this->hasMany(ProjectMember::class, 'project_id');
    }

    /**
     * Get agents working in this project (legacy relationship - deprecated)
     */
    public function agents(): HasMany
    {
        return $this->hasMany(Agent::class, 'project_id');
    }

    /**
     * Many-to-many relationship with agents
     */
    public function assignedAgents(): BelongsToMany
    {
        return $this->belongsToMany(Agent::class, 'project_agent', 'project_id', 'agent_id')
                    ->withPivot(['agent_configuration', 'project_instructions', 'is_active'])
                    ->withTimestamps();
    }

    /**
     * Get only active assigned agents
     */
    public function activeAgents(): BelongsToMany
    {
        return $this->assignedAgents()->wherePivot('is_active', true);
    }

    /**
     * Get files shared with others
     */
    public function sharedFiles()
    {
        return ProjectFileShare::whereIn('project_file_id', $this->files()->pluck('id'));
    }

    /**
     * Get project template
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(ProjectTemplate::class, 'template_id');
    }

    /**
     * Get project versions
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ProjectVersion::class,'project_id');
    }

    /**
     * Get project activity logs
     */
    public function activities(): HasMany
    {
        return $this->hasMany(ProjectActivity::class,'project_id');
    }

    /**
     * Check if user is member of this project
     */
    public function hasMember(string $userId): bool
    {
        return $this->members()
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Check if user is owner
     */
    public function isOwner(string $userId): bool
    {
        return $this->user_id === $userId;
    }

    /**
     * Get member role
     */
    public function getMemberRole(string $userId): ?string
    {
        return $this->members()
            ->where('user_id', $userId)
            ->value('role');
    }

    /**
     * Add member to project
     */
    public function addMember(string $userId, string $role = 'member'): ProjectMember
    {
        return $this->members()->create([
            'user_id' => $userId,
            'role' => $role,
        ]);
    }

    /**
     * Remove member from project
     */
    public function removeMember(string $userId): bool
    {
        return $this->members()
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    /**
     * Get project analytics data
     */
    public function getAnalyticsData(): array
    {
        return [
            'conversations_count' => $this->conversations()->count(),
            'files_count' => $this->files()->count(),
            'members_count' => $this->members()->count() + 1, // +1 for owner
            'agents_count' => $this->assignedAgents()->count(),
            'active_agents_count' => $this->activeAgents()->count(),
            'last_activity' => $this->activities()->latest()->first()?->created_at,
            'build_status' => $this->build_status,
            'code_quality_score' => $this->code_quality_score,
            'performance_metrics' => $this->performance_metrics ?? [],
        ];
    }

    /**
     * Check if project uses AI coding assistant
     */
    public function hasAICoding(): bool
    {
        return !empty($this->ai_model) && !empty($this->coding_framework);
    }

    /**
     * Check if project has analytics enabled
     */
    public function hasAnalytics(): bool
    {
        return $this->analytics_enabled === true;
    }

    /**
     * Get project health score
     */
    public function getHealthScore(): float
    {
        $score = 0;
        $factors = 0;

        // Code quality factor (40%)
        if ($this->code_quality_score !== null) {
            $score += $this->code_quality_score * 0.4;
            $factors += 0.4;
        }

        // Activity factor (30%)
        $lastActivity = $this->activities()->latest()->first();
        if ($lastActivity) {
            $daysSinceActivity = now()->diffInDays($lastActivity->created_at);
            $activityScore = max(0, 100 - ($daysSinceActivity * 2)); // Decrease by 2 points per day
            $score += $activityScore * 0.3;
            $factors += 0.3;
        }

        // Build status factor (20%)
        if ($this->build_status) {
            $buildScore = $this->build_status === 'success' ? 100 :
                         ($this->build_status === 'warning' ? 70 : 30);
            $score += $buildScore * 0.2;
            $factors += 0.2;
        }

        // Team collaboration factor (10%)
        $memberCount = $this->members()->count();
        $collaborationScore = min(100, $memberCount * 25); // Max 100 for 4+ members
        $score += $collaborationScore * 0.1;
        $factors += 0.1;

        return $factors > 0 ? round($score / $factors, 1) : 0;
    }

    /**
     * Get project complexity level
     */
    public function getComplexityLevel(): string
    {
        $filesCount = $this->files()->count();
        $membersCount = $this->members()->count();
        $conversationsCount = $this->conversations()->count();

        $complexityScore = ($filesCount * 2) + ($membersCount * 5) + ($conversationsCount * 1);

        if ($complexityScore < 20) return 'Simple';
        if ($complexityScore < 50) return 'Moderate';
        if ($complexityScore < 100) return 'Complex';
        return 'Enterprise';
    }

    /**
     * Get recent activity summary
     */
    public function getRecentActivity(int $limit = 5): array
    {
        return $this->activities()
            ->with('user')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'type' => $activity->activity_type,
                    'description' => $activity->description,
                    'user' => $activity->user?->name ?? 'System',
                    'created_at' => $activity->created_at,
                    'metadata' => $activity->metadata ?? []
                ];
            })
            ->toArray();
    }

    /**
     * Update project metrics
     */
    public function updateMetrics(array $metrics): void
    {
        $currentMetrics = $this->performance_metrics ?? [];
        $updatedMetrics = array_merge($currentMetrics, $metrics);

        $this->update([
            'performance_metrics' => $updatedMetrics,
            'last_build_at' => now()
        ]);
    }

    /**
     * Get deployment status
     */
    public function getDeploymentStatus(): array
    {
        return [
            'is_deployed' => !empty($this->deployment_url),
            'deployment_url' => $this->deployment_url,
            'repository_url' => $this->repository_url,
            'auto_deploy' => $this->auto_deploy,
            'last_build' => $this->last_build_at,
            'build_status' => $this->build_status
        ];
    }

    /**
     * Assign an agent to this project
     */
    public function assignAgent(string $agentId, array $configuration = [], ?string $instructions = null): void
    {
        $this->assignedAgents()->attach($agentId, [
            'agent_configuration' => $configuration,
            'project_instructions' => $instructions,
            'is_active' => true,
        ]);
    }

    /**
     * Remove an agent from this project
     */
    public function removeAgent(string $agentId): void
    {
        $this->assignedAgents()->detach($agentId);
    }

    /**
     * Update agent configuration for this project
     */
    public function updateAgentConfiguration(string $agentId, array $configuration = [], ?string $instructions = null): void
    {
        $this->assignedAgents()->updateExistingPivot($agentId, [
            'agent_configuration' => $configuration,
            'project_instructions' => $instructions,
        ]);
    }

    /**
     * Toggle agent active status for this project
     */
    public function toggleAgentStatus(string $agentId): void
    {
        $pivot = $this->assignedAgents()->where('agent_id', $agentId)->first()?->pivot;
        if ($pivot) {
            $this->assignedAgents()->updateExistingPivot($agentId, [
                'is_active' => !$pivot->is_active,
            ]);
        }
    }

    /**
     * Check if agent is assigned to this project
     */
    public function hasAgent(string $agentId): bool
    {
        return $this->assignedAgents()->where('agent_id', $agentId)->exists();
    }

    /**
     * Get available agents for this project (visible to project owner/members)
     */
    public function getAvailableAgents(): \Illuminate\Database\Eloquent\Collection
    {
        return Agent::visibleTo($this->user_id)
                   ->where(function ($query) {
                       $query->where('is_system_agent', true)
                             ->orWhere('user_id', $this->user_id);
                   })
                   ->get();
    }
}
