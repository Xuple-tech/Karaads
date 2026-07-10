<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Admin extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'phone',
        'is_active',
        'last_login_at',
        'permissions',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'permissions' => 'json',
            'email_verified_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    const ROLE_SUPER_ADMIN = 'super_admin';

    const ROLE_ADMIN = 'admin';

    const ROLE_MODERATOR = 'moderator';

    const ROLE_AD_MANAGER = 'ad_manager';

    const ROLE_FINANCE_MANAGER = 'finance_manager';

    public function hasRole($role): bool
    {
        return $this->role === $role;
    }

    public function hasPermission($permission): bool
    {
        if ($this->role === self::ROLE_SUPER_ADMIN) {
            return true;
        }

        $permissions = $this->permissions ?? [];
        
        // Ensure permissions is an array
        if (is_string($permissions)) {
            $permissions = json_decode($permissions, true) ?? [];
        }
        
        if (!is_array($permissions)) {
            $permissions = [];
        }

        return in_array($permission, $permissions);
    }

    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->role === self::ROLE_SUPER_ADMIN) {
            return true;
        }

        $userPermissions = $this->permissions ?? [];
        
        // Ensure userPermissions is an array
        if (is_string($userPermissions)) {
            $userPermissions = json_decode($userPermissions, true) ?? [];
        }
        
        if (!is_array($userPermissions)) {
            $userPermissions = [];
        }

        return count(array_intersect($permissions, $userPermissions)) > 0;
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [self::ROLE_SUPER_ADMIN, self::ROLE_ADMIN]);
    }

    public function isAdManager(): bool
    {
        return $this->hasRole(self::ROLE_AD_MANAGER) || $this->isAdmin();
    }

    public function isFinanceManager(): bool
    {
        return $this->hasRole(self::ROLE_FINANCE_MANAGER) || $this->isAdmin();
    }

    public function isModerator(): bool
    {
        return $this->hasRole(self::ROLE_MODERATOR) || $this->isAdmin();
    }
     public function hasCompletedOnboarding(): bool
    {
        return true;
    }
}
