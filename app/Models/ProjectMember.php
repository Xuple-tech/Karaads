<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMember extends Model
{
    use HasUlids;

    protected $fillable = [
        'project_id',
        'user_id',
        'role',
        'permissions',
        'joined_at',
    ];

    protected $casts = [
        'permissions' => 'json',
        'joined_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class, 'project_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if member has permission
     */
    public function hasPermission(string $permission): bool
    {
        // Owner and admin have all permissions
        if (in_array($this->role, ['owner', 'admin'])) {
            return true;
        }

        if ($this->role === 'viewer') {
            return $permission === 'view';
        }

        if ($this->role === 'member') {
            return in_array($permission, ['view', 'comment', 'upload']);
        }

        return false;
    }

    /**
     * Get role level (for comparison)
     */
    public function getRoleLevel(): int
    {
        return match($this->role) {
            'owner' => 4,
            'admin' => 3,
            'member' => 2,
            'viewer' => 1,
            default => 0,
        };
    }
}
