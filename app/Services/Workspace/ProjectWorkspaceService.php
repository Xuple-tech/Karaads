<?php

namespace App\Services\Workspace;

use App\Models\User;
use App\Models\Workspace\Project;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProjectWorkspaceService
{
    public function listProjectsFor(User $user): Collection
    {
        return Project::query()
            ->visibleTo($user)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createProject(User $user, array $data): Project
    {
        return Project::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'project_type' => $data['project_type'] ?? 'workspace',
            'status' => $data['status'] ?? 'active',
            'visibility' => $data['visibility'] ?? 'private',
            'settings' => $data['settings'] ?? [],
        ]);
    }

    public function viewableProject(Project $project, User $user): Project
    {
        if ($project->isOwnedBy($user) || $project->hasMember($user)) {
            return $project;
        }

        throw new AuthorizationException('You do not have access to this workspace project.');
    }

    public function manageableProject(Project $project, User $user): Project
    {
        if ($project->isOwnedBy($user)) {
            return $project;
        }

        $role = $project->members()->where('user_id', $user->id)->value('role');
        if (in_array($role, ['admin'], true)) {
            return $project;
        }

        throw new AuthorizationException('You do not have permission to manage this workspace project.');
    }

    public function collaborativeProject(Project $project, User $user): Project
    {
        if ($project->isOwnedBy($user)) {
            return $project;
        }

        $role = $project->members()->where('user_id', $user->id)->value('role');
        if (in_array($role, ['admin', 'member'], true)) {
            return $project;
        }

        throw new AuthorizationException('You do not have permission to collaborate in this workspace project.');
    }

    public function updateProject(Project $project, User $user, array $data): Project
    {
        $this->manageableProject($project, $user);

        $project->update([
            'title' => $data['title'] ?? $project->title,
            'description' => array_key_exists('description', $data) ? $data['description'] : $project->description,
            'status' => $data['status'] ?? $project->status,
            'visibility' => $data['visibility'] ?? $project->visibility,
            'settings' => $data['settings'] ?? $project->settings,
        ]);

        return $project->refresh();
    }
}
