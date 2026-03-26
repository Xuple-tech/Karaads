<?php

namespace App\Services;

use App\Models\Projects;
use App\Models\ProjectMember;
use App\Models\ProjectTemplate;
use App\Models\ProjectVersion;
use App\Models\ProjectActivity;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    /**
     * Create a new project
     */
    public function createProject(array $data): Projects
    {
        $project = Projects::create([
            'user_id' => Auth::id(),
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'visibility' => $data['visibility'] ?? 'private',
            'status' => 'active',
            'settings' => $data['settings'] ?? [],
        ]);

        ProjectActivity::log($project->id, Auth::id(), 'project_created', "Project '{$project->title}' created");

        return $project;
    }

    /**
     * Update project details
     */
    public function updateProject(Projects $project, array $data): Projects
    {
        $changes = [];

        if (isset($data['title']) && $data['title'] !== $project->title) {
            $changes['title'] = ['old' => $project->title, 'new' => $data['title']];
        }

        if (isset($data['visibility']) && $data['visibility'] !== $project->visibility) {
            $changes['visibility'] = ['old' => $project->visibility, 'new' => $data['visibility']];
        }

        $project->update($data);

        if (!empty($changes)) {
            ProjectActivity::log($project->id, Auth::id(), 'project_updated', "Project updated", $changes);
        }

        return $project;
    }

    /**
     * Delete a project
     */
    public function deleteProject(Projects $project): bool
    {
        // Delete all files
        foreach ($project->files as $file) {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
        }

        // Delete all members
        $project->members()->delete();

        // Delete all versions
        $project->versions()->delete();

        // Delete activity logs
        $project->activities()->delete();

        ProjectActivity::log($project->id, Auth::id(), 'project_deleted', "Project '{$project->title}' deleted");

        return $project->delete();
    }

    /**
     * Add a member to project
     */
    public function addMember(Projects $project, string $email, string $role = 'member'): ProjectMember
    {
        $user = User::where('email', $email)->firstOrFail();

        if ($project->hasMember($user->id)) {
            throw new \Exception("User is already a member of this project");
        }

        $member = $project->addMember($user->id, $role);

        ProjectActivity::log($project->id, Auth::id(), 'member_added', "{$user->name} added as {$role}");

        return $member;
    }

    /**
     * Update member role
     */
    public function updateMemberRole(Projects $project, ProjectMember $member, string $role): ProjectMember
    {
        $oldRole = $member->role;
        $member->update(['role' => $role]);

        ProjectActivity::log($project->id, Auth::id(), 'member_role_updated', "{$member->user->name}'s role changed from {$oldRole} to {$role}");

        return $member;
    }

    /**
     * Remove member from project
     */
    public function removeMember(Projects $project, ProjectMember $member): bool
    {
        ProjectActivity::log($project->id, Auth::id(), 'member_removed', "{$member->user->name} removed from project");

        return $member->delete();
    }

    /**
     * Create a new version
     */
    public function createVersion(Projects $project, array $data): ProjectVersion
    {
        $versionNumber = ProjectVersion::getNextVersion($project->id);

        $version = ProjectVersion::create([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            'version_number' => $versionNumber,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'changes' => $data['changes'] ?? [],
            'data' => [
                'title' => $project->title,
                'description' => $project->description,
                'settings' => $project->settings,
            ],
        ]);

        ProjectActivity::log($project->id, Auth::id(), 'version_created', "Version {$versionNumber} created");

        return $version;
    }

    /**
     * Save project as template
     */
    public function saveAsTemplate(Projects $project, array $data): ProjectTemplate
    {
        $slug = Str::slug($data['name']);

        $template = ProjectTemplate::create([
            'user_id' => Auth::id(),
            'name' => $data['name'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'category' => $data['category'] ?? 'general',
            'is_public' => $data['is_public'] ?? false,
            'config' => $project->settings,
        ]);

        ProjectActivity::log($project->id, Auth::id(), 'template_created', "Project saved as template: {$template->name}");

        return $template;
    }

    /**
     * Create project from template
     */
    public function createFromTemplate(ProjectTemplate $template, array $data): Projects
    {
        $project = Projects::create([
            'user_id' => Auth::id(),
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'template_id' => $template->id,
            'visibility' => 'private',
            'status' => 'active',
            'settings' => $template->config,
        ]);

        $template->increment('usage_count');

        ProjectActivity::log($project->id, Auth::id(), 'project_created_from_template', "Project created from template: {$template->name}");

        return $project;
    }

    /**
     * Archive a project
     */
    public function archiveProject(Projects $project): Projects
    {
        $project->update(['status' => 'archived']);

        ProjectActivity::log($project->id, Auth::id(), 'project_archived', 'Project archived');

        return $project;
    }

    /**
     * Restore archived project
     */
    public function restoreProject(Projects $project): Projects
    {
        $project->update(['status' => 'active']);

        ProjectActivity::log($project->id, Auth::id(), 'project_restored', 'Project restored');

        return $project;
    }

    /**
     * Get project statistics
     */
    public function getProjectStats(Projects $project): array
    {
        return [
            'conversations' => $project->conversations()->count(),
            'files' => $project->files()->count(),
            'members' => $project->members()->count() + 1, // +1 for owner
            'activities' => $project->activities()->count(),
            'versions' => $project->versions()->count(),
        ];
    }

    /**
     * Get project with all relations
     */
    public function getProjectWithRelations(Projects $project)
    {
        return $project->load([
            'user',
            'members.user',
            'conversations',
            'files',
            'versions',
            'activities.user',
            'template',
        ]);
    }

    /**
     * Get user projects with filters
     */
    public function getUserProjects(array $filters = [], int $perPage = 15)
    {
        $query = Projects::where('user_id', Auth::id())
            ->orWhereHas('members', function ($q) {
                $q->where('user_id', Auth::id());
            });

        // Filter by status
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Filter by visibility
        if (isset($filters['visibility']) && $filters['visibility'] !== 'all') {
            $query->where('visibility', $filters['visibility']);
        }

        // Search
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->latest()
            ->withCount('conversations', 'files', 'members')
            ->paginate($perPage);
    }

    /**
     * Get user projects with enhanced analytics
     */
    public function getUserProjectsWithAnalytics(array $filters = [], int $perPage = 15)
    {
        $query = Projects::where('user_id', Auth::id())
            ->orWhereHas('members', function ($q) {
                $q->where('user_id', Auth::id());
            });

        // Filter by status
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Filter by visibility
        if (isset($filters['visibility']) && $filters['visibility'] !== 'all') {
            $query->where('visibility', $filters['visibility']);
        }

        // Filter by AI model
        if (isset($filters['ai_model']) && $filters['ai_model'] !== 'all') {
            $query->where('ai_model', $filters['ai_model']);
        }

        // Filter by framework
        if (isset($filters['framework']) && $filters['framework'] !== 'all') {
            $query->where('coding_framework', $filters['framework']);
        }

        // Filter by complexity
        if (isset($filters['complexity']) && $filters['complexity'] !== 'all') {
            // This would require a more complex query based on project metrics
            // For now, we'll skip this filter
        }

        // Search
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('coding_framework', 'like', "%{$search}%")
                    ->orWhere('ai_model', 'like', "%{$search}%");
            });
        }

        $projects = $query->latest()
            ->withCount('conversations', 'files', 'members')
            ->paginate($perPage);

        // Add enhanced analytics to each project
        $projects->getCollection()->transform(function ($project) {
            $project->health_score = $project->getHealthScore();
            $project->complexity = $project->getComplexityLevel();
            $project->analytics_data = $project->getAnalyticsData();
            return $project;
        });

        return $projects;
    }

    /**
     * Create AI-powered project with enhanced features
     */
    public function createAIProject(array $data): Projects
    {
        DB::beginTransaction();
        try {
            $project = Projects::create([
                'user_id' => Auth::id(),
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'project_type' => $data['project_type'],
                'ai_model' => $data['ai_model'] ?? null,
                'coding_framework' => $data['coding_framework'] ?? null,
                'analytics_enabled' => $data['analytics_enabled'] ?? false,
                'auto_deploy' => $data['auto_deploy'] ?? false,
                'repository_url' => $data['repository_url'] ?? null,
                'environment_variables' => $data['environment_variables'] ?? [],
                'dependencies' => $data['dependencies'] ?? [],
                'visibility' => $data['visibility'] ?? 'private',
                'template_id' => $data['template_id'] ?? null,
                'category_id' => $data['category_id'] ?? null,
                'status' => 'active',
                'build_status' => 'pending',
            ]);

            // Log project creation with AI features
            ProjectActivity::create([
                'project_id' => $project->id,
                'user_id' => Auth::id(),
                'activity_type' => 'ai_project_created',
                'description' => 'AI-powered project created',
                'metadata' => [
                    'ai_model' => $data['ai_model'],
                    'framework' => $data['coding_framework'],
                    'analytics_enabled' => $data['analytics_enabled'] ?? false,
                    'auto_deploy' => $data['auto_deploy'] ?? false,
                ]
            ]);

            DB::commit();
            return $project;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update project AI settings
     */
    public function updateAISettings(Projects $project, array $data): Projects
    {
        $oldSettings = [
            'ai_model' => $project->ai_model,
            'coding_framework' => $project->coding_framework,
            'analytics_enabled' => $project->analytics_enabled,
            'auto_deploy' => $project->auto_deploy,
        ];

        $project->update([
            'ai_model' => $data['ai_model'] ?? $project->ai_model,
            'coding_framework' => $data['coding_framework'] ?? $project->coding_framework,
            'analytics_enabled' => $data['analytics_enabled'] ?? $project->analytics_enabled,
            'auto_deploy' => $data['auto_deploy'] ?? $project->auto_deploy,
            'repository_url' => $data['repository_url'] ?? $project->repository_url,
            'deployment_url' => $data['deployment_url'] ?? $project->deployment_url,
            'environment_variables' => $data['environment_variables'] ?? $project->environment_variables,
            'dependencies' => $data['dependencies'] ?? $project->dependencies,
        ]);

        // Log AI settings update
        ProjectActivity::create([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            'activity_type' => 'ai_settings_updated',
            'description' => 'AI settings updated',
            'metadata' => [
                'old_settings' => $oldSettings,
                'new_settings' => [
                    'ai_model' => $project->ai_model,
                    'coding_framework' => $project->coding_framework,
                    'analytics_enabled' => $project->analytics_enabled,
                    'auto_deploy' => $project->auto_deploy,
                ]
            ]
        ]);

        return $project;
    }

    /**
     * Get project dashboard data with AI insights
     */
    public function getProjectDashboardData(Projects $project): array
    {
        return [
            'project' => $project->load(['user', 'category', 'template']),
            'analytics' => $project->getAnalyticsData(),
            'health_score' => $project->getHealthScore(),
            'complexity' => $project->getComplexityLevel(),
            'recent_activity' => $project->getRecentActivity(10),
            'deployment_status' => $project->getDeploymentStatus(),
            'ai_capabilities' => [
                'has_coding' => $project->hasAICoding(),
                'has_analytics' => $project->hasAnalytics(),
                'model_info' => $this->getModelInfo($project->ai_model),
                'framework_info' => $this->getFrameworkInfo($project->coding_framework),
            ],
            'performance_metrics' => $project->performance_metrics ?? [],
            'build_history' => $this->getBuildHistory($project),
        ];
    }

    /**
     * Get AI model information
     */
    private function getModelInfo(?string $model): ?array
    {
        if (!$model) return null;

        $models = [
            'deepseek-chat' => [
                'name' => 'DeepSeek Chat',
                'capabilities' => ['general', 'reasoning', 'coding'],
                'description' => 'General purpose conversational AI'
            ],
            'deepseek-coder' => [
                'name' => 'DeepSeek Coder',
                'capabilities' => ['coding', 'debugging', 'optimization'],
                'description' => 'Specialized coding assistant'
            ],
            'deepseek-reasoner' => [
                'name' => 'DeepSeek Reasoner',
                'capabilities' => ['reasoning', 'analysis', 'problem-solving'],
                'description' => 'Advanced reasoning model'
            ],
        ];

        return $models[$model] ?? null;
    }

    /**
     * Get framework information
     */
    private function getFrameworkInfo(?string $framework): ?array
    {
        if (!$framework) return null;

        $frameworks = [
            'react' => ['name' => 'React', 'type' => 'frontend', 'language' => 'JavaScript'],
            'vue' => ['name' => 'Vue.js', 'type' => 'frontend', 'language' => 'JavaScript'],
            'laravel' => ['name' => 'Laravel', 'type' => 'backend', 'language' => 'PHP'],
            'django' => ['name' => 'Django', 'type' => 'backend', 'language' => 'Python'],
            'express' => ['name' => 'Express.js', 'type' => 'backend', 'language' => 'JavaScript'],
            'fastapi' => ['name' => 'FastAPI', 'type' => 'backend', 'language' => 'Python'],
            'streamlit' => ['name' => 'Streamlit', 'type' => 'data', 'language' => 'Python'],
        ];

        return $frameworks[$framework] ?? null;
    }

    /**
     * Get build history for project
     */
    private function getBuildHistory(Projects $project): array
    {
        return $project->activities()
            ->whereIn('activity_type', ['deployment_started', 'deployment_completed', 'deployment_failed'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'type' => $activity->activity_type,
                    'status' => $this->getBuildStatusFromActivity($activity->activity_type),
                    'created_at' => $activity->created_at,
                    'metadata' => $activity->metadata ?? []
                ];
            })
            ->toArray();
    }

    /**
     * Get build status from activity type
     */
    private function getBuildStatusFromActivity(string $activityType): string
    {
        return match($activityType) {
            'deployment_started' => 'building',
            'deployment_completed' => 'success',
            'deployment_failed' => 'failed',
            default => 'pending'
        };
    }
}
