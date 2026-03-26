<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeamMember extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'user_id',
        'role',
        'permissions',
        'invited_at',
        'joined_at',
    ];

    protected $casts = [
        'permissions' => 'array',
        'invited_at' => 'datetime',
        'joined_at' => 'datetime',
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
     * Get the user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if member has permission
     */
    public function hasPermission(string $permission): bool
    {
        // Role-based permissions
        $rolePermissions = [
            'admin' => ['*'], // All permissions
            'manager' => ['create', 'read', 'update', 'manage_workflows', 'manage_tools'],
            'member' => ['create', 'read', 'update'],
            'viewer' => ['read'],
        ];

        $allowed = $rolePermissions[$this->role] ?? [];

        if (in_array('*', $allowed)) {
            return true;
        }

        // Check custom permissions
        if ($this->permissions && in_array($permission, $this->permissions)) {
            return true;
        }

        return in_array($permission, $allowed);
    }

    /**
     * Update member role
     */
    public function updateRole(string $newRole): bool
    {
        $validRoles = ['admin', 'manager', 'member', 'viewer'];
        if (!in_array($newRole, $validRoles)) {
            return false;
        }
        return $this->update(['role' => $newRole]);
    }
}
