<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'owner_id',
        'type',
        'metadata',
        'settings',
        'status',
    ];

    protected $casts = [
        'metadata' => 'array',
        'settings' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the owner of the team
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all members of the team
     */
    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    /**
     * Get all pending invitations
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(TeamInvitation::class);
    }

    /**
     * Get team activity logs
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(TeamActivityLog::class);
    }

    /**
     * Get all workflows in team
     */
    public function workflows(): HasMany
    {
        return $this->hasMany(Workflow::class);
    }

    /**
     * Check if user is member
     */
    public function hasMember(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Get user's role in team
     */
    public function getMemberRole(User $user): ?string
    {
        return $this->members()
            ->where('user_id', $user->id)
            ->value('role');
    }

    /**
     * Check user permission
     */
    public function userCan(User $user, string $permission): bool
    {
        $role = $this->getMemberRole($user);
        if (!$role) {
            return false;
        }

        $permissions = [
            'admin' => ['create', 'read', 'update', 'delete', 'manage_members', 'manage_workflows'],
            'manager' => ['create', 'read', 'update', 'manage_workflows'],
            'member' => ['create', 'read', 'update'],
            'viewer' => ['read'],
        ];

        return in_array($permission, $permissions[$role] ?? []);
    }

    /**
     * Add member to team
     */
    public function addMember(User $user, string $role = 'member'): TeamMember
    {
        return $this->members()->create([
            'user_id' => $user->id,
            'role' => $role,
            'joined_at' => now(),
        ]);
    }

    /**
     * Remove member from team
     */
    public function removeMember(User $user): bool
    {
        if ($user->id === $this->owner_id) {
            return false; // Cannot remove owner
        }
        return $this->members()->where('user_id', $user->id)->delete();
    }

    /**
     * Log activity
     */
    public function logActivity(User $user, string $action, string $entityType, ?int $entityId = null, ?array $changes = null): TeamActivityLog
    {
        return $this->activityLogs()->create([
            'user_id' => $user->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'changes' => $changes,
        ]);
    }
}
