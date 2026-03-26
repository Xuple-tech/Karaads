<?php

namespace App\Policies;

use App\Models\Workflow;
use App\Models\User;

class WorkflowPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Workflow $workflow): bool
    {
        $team = $workflow->team;
        if (!$team) {
            return $workflow->created_by === $user->id;
        }

        return $team->hasMember($user) &&
               $team->getMember($user)->can('view', 'workflows');
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Workflow $workflow): bool
    {
        return $workflow->created_by === $user->id ||
               ($workflow->team && $workflow->team->isManagerOrAbove($user));
    }

    public function delete(User $user, Workflow $workflow): bool
    {
        return $workflow->created_by === $user->id ||
               ($workflow->team && $workflow->team->isAdmin($user));
    }

    public function execute(User $user, Workflow $workflow): bool
    {
        $team = $workflow->team;
        if (!$team) {
            return $workflow->created_by === $user->id;
        }

        return $team->hasMember($user) &&
               $team->getMember($user)->can('execute', 'workflows');
    }

    public function publish(User $user, Workflow $workflow): bool
    {
        return $this->update($user, $workflow);
    }
}
