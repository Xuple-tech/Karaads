<?php

namespace App\Policies;

use App\Models\Projects;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ProjectPolicy
{
    /**
     * Determine if the user can view any projects
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can view the project
     */
    public function view(User $user, Projects $project): bool
    {
        Log::info("Checking view permission for user {$user->id} on project {$project->id}" . json_encode($project));
        // Owner can view
        if ($project->isOwner($user->id)) {
            return true;
        }

        // Team members can view
        if ($project->hasMember($user->id)) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can create projects
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can update the project
     */
    public function update(User $user, Projects $project): bool
    {
        // Only owner and admins can update
        if ($project->isOwner($user->id)) {
            return true;
        }

        $role = $project->getMemberRole($user->id);
        return in_array($role, ['admin']);
    }

    /**
     * Determine if the user can delete the project
     */
    public function delete(User $user, Projects $project): bool
    {
        // Only owner can delete
        return $project->isOwner($user->id);
    }

    /**
     * Determine if the user can manage project members
     */
    public function manageMembersAndSharing(User $user, Projects $project): bool
    {
        if ($project->isOwner($user->id)) {
            return true;
        }

        $role = $project->getMemberRole($user->id);
        return in_array($role, ['admin']);
    }

    /**
     * Determine if the user can manage agents
     */
    public function manageAgents(User $user, Projects $project): bool
    {
        if ($project->isOwner($user->id)) {
            return true;
        }

        $role = $project->getMemberRole($user->id);
        return in_array($role, ['admin', 'member']);
    }

    /**
     * Determine if the user can chat in project
     */
    public function chat(User $user, Projects $project): bool
    {
        return $this->view($user, $project);
    }

    /**
     * Determine if the user can export project data
     */
    public function export(User $user, Projects $project): bool
    {
        return $this->view($user, $project);
    }
}
