<?php

namespace App\Services;

use App\Models\Team;
use App\Models\TeamMember;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Support\Str;

class TeamManagementService
{
    /**
     * Create a new team
     */
    public function createTeam(User $owner, string $name, string $type = 'enterprise', string $description = ''): Team
    {
        $team = Team::create([
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $description,
            'owner_id' => $owner->id,
            'type' => $type,
            'status' => 'active',
        ]);

        // Add owner as admin member
        $team->addMember($owner, 'admin');

        return $team;
    }

    /**
     * Get user's teams
     */
    public function getUserTeams(User $user)
    {
        return Team::whereHas('members', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->orWhere('owner_id', $user->id)->get();
    }

    /**
     * Invite user to team
     */
    public function inviteToTeam(Team $team, string $email, string $role = 'member', ?User $invitedBy = null): TeamInvitation
    {
        // Check if already a member
        if ($team->members()->whereHas('user', function ($query) use ($email) {
            $query->where('email', $email);
        })->exists()) {
            throw new \Exception('User is already a member of this team');
        }

        $invitation = TeamInvitation::create([
            'team_id' => $team->id,
            'email' => $email,
            'role' => $role,
            'token' => TeamInvitation::generateToken(),
            'expires_at' => now()->addDays(7),
        ]);

        // Log activity
        if ($invitedBy) {
            $team->logActivity($invitedBy, 'invite', 'User', null, [
                'email' => $email,
                'role' => $role,
            ]);
        }

        return $invitation;
    }

    /**
     * Accept team invitation
     */
    public function acceptInvitation(TeamInvitation $invitation, User $user): TeamMember
    {
        if ($invitation->isExpired()) {
            throw new \Exception('Invitation has expired');
        }

        if ($invitation->isAccepted()) {
            throw new \Exception('Invitation already accepted');
        }

        if ($user->email !== $invitation->email) {
            throw new \Exception('Invitation email does not match user email');
        }

        return $invitation->accept($user);
    }

    /**
     * Update member role
     */
    public function updateMemberRole(TeamMember $member, string $newRole, ?User $updatedBy = null): bool
    {
        if ($member->user_id === $member->team->owner_id && $newRole !== 'admin') {
            throw new \Exception('Cannot change owner role');
        }

        $success = $member->updateRole($newRole);

        if ($success && $updatedBy) {
            $member->team->logActivity($updatedBy, 'update', 'TeamMember', $member->id, [
                'role' => $newRole,
            ]);
        }

        return $success;
    }

    /**
     * Remove member from team
     */
    public function removeMember(Team $team, User $user, ?User $removedBy = null): bool
    {
        if ($user->id === $team->owner_id) {
            throw new \Exception('Cannot remove team owner');
        }

        $success = $team->removeMember($user);

        if ($success && $removedBy) {
            $team->logActivity($removedBy, 'remove', 'TeamMember', $user->id);
        }

        return $success;
    }

    /**
     * Get team members with roles
     */
    public function getTeamMembers(Team $team)
    {
        return $team->members()
            ->with('user')
            ->get()
            ->map(function (TeamMember $member) {
                return [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                    'role' => $member->role,
                    'joined_at' => $member->joined_at->toIso8601String(),
                ];
            });
    }

    /**
     * Get team statistics
     */
    public function getTeamStats(Team $team): array
    {
        return [
            'team_id' => $team->id,
            'name' => $team->name,
            'total_members' => $team->members()->count(),
            'admins' => $team->members()->where('role', 'admin')->count(),
            'managers' => $team->members()->where('role', 'manager')->count(),
            'members' => $team->members()->where('role', 'member')->count(),
            'viewers' => $team->members()->where('role', 'viewer')->count(),
            'workflows' => $team->workflows()->count(),
            'pending_invitations' => $team->invitations()->whereNull('accepted_at')->count(),
            'created_at' => $team->created_at->toIso8601String(),
            'updated_at' => $team->updated_at->toIso8601String(),
        ];
    }

    /**
     * Transfer team ownership
     */
    public function transferOwnership(Team $team, User $newOwner, ?User $transferredBy = null): bool
    {
        if (!$team->hasMember($newOwner)) {
            throw new \Exception('New owner must be a team member');
        }

        $team->update(['owner_id' => $newOwner->id]);

        // Update roles
        $team->members()->where('user_id', $team->owner_id)->first()?->updateRole('admin');
        $team->members()->where('user_id', $newOwner->id)->first()?->updateRole('admin');

        if ($transferredBy) {
            $team->logActivity($transferredBy, 'transfer_ownership', 'Team', $team->id, [
                'new_owner' => $newOwner->id,
            ]);
        }

        return true;
    }

    /**
     * Get team activity logs
     */
    public function getActivityLogs(Team $team, int $limit = 50)
    {
        return $team->activityLogs()
            ->with('user')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'entity_type' => $log->entity_type,
                    'entity_id' => $log->entity_id,
                    'performed_by' => $log->user?->name,
                    'changes' => $log->changes,
                    'timestamp' => $log->created_at->toIso8601String(),
                ];
            });
    }
}
