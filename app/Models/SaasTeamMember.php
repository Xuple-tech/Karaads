<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaasTeamMember extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = ['saas_owner_id', 'user_id', 'role', 'permissions', 'is_active'];
    protected $casts = [
        'permissions' => 'json',
        'is_active' => 'boolean',
    ];

    /**
     * SaaS owner
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'saas_owner_id');
    }

    /**
     * Team member user
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
        // Admin role has all permissions
        if ($this->role === 'admin') {
            return true;
        }

        if (!$this->permissions) {
            return false;
        }

        return in_array($permission, $this->permissions);
    }
}
