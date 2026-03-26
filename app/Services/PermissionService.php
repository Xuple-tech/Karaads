<?php

namespace App\Services;

use App\Models\User;
use App\Models\SaasTeamMember;
use Illuminate\Support\Facades\Cache;

/**
 * PermissionService
 *
 * Centralized permission and authorization checking for all roles
 */
class PermissionService
{
    /**
     * Check if user can access admin features
     */
    public static function canAccessAdmin(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Check if user is tech staff
     */
    public static function isTechStaff(User $user): bool
    {
        return $user->isStaff();
    }

    /**
     * Check if user is SaaS owner
     */
    public static function isSaasOwner(User $user): bool
    {
        return $user->isSaasOwner();
    }

    /**
     * Check if user can manage SaaS instance
     */
    public static function canManageSaasInstance(User $user, string $saasOwnerId): bool
    {
        if ($user->isAdmin()) {
            return true; // Admins can manage any instance
        }

        if ($user->id === $saasOwnerId) {
            return true; // Owner can manage their own
        }

        // Check if user is manager in the team
        $member = SaasTeamMember::where('saas_owner_id', $saasOwnerId)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return $member && in_array($member->role, ['admin', 'manager']);
    }

    /**
     * Check if user can view SaaS analytics
     */
    public static function canViewSaasAnalytics(User $user, string $saasOwnerId): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $saasOwnerId) {
            return true;
        }

        $member = SaasTeamMember::where('saas_owner_id', $saasOwnerId)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return $member && ($member->role === 'admin' || $member->hasPermission('view_analytics'));
    }

    /**
     * Check if user can edit prompts
     */
    public static function canEditPrompts(User $user, string $saasOwnerId = null): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if (!$saasOwnerId) {
            return false;
        }

        $member = SaasTeamMember::where('saas_owner_id', $saasOwnerId)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return $member && ($member->role === 'admin' || $member->hasPermission('edit_prompts'));
    }

    /**
     * Check if user can manage API keys
     */
    public static function canManageApiKeys(User $user): bool
    {
        return $user->isAdmin() || $user->isStaff();
    }

    /**
     * Check if user can view system logs
     */
    public static function canViewSystemLogs(User $user): bool
    {
        return $user->isAdmin() || $user->isStaff();
    }

    /**
     * Check if user can access monitoring dashboard
     */
    public static function canAccessMonitoring(User $user): bool
    {
        return $user->isAdmin() || $user->isStaff();
    }

    /**
     * Get all permissions for a user
     */
    public static function getUserPermissions(User $user): array
    {
        $permissions = [
            'admin' => self::canAccessAdmin($user),
            'staff' => self::isTechStaff($user),
            'saas_owner' => self::isSaasOwner($user),
            'manage_api_keys' => self::canManageApiKeys($user),
            'view_system_logs' => self::canViewSystemLogs($user),
            'access_monitoring' => self::canAccessMonitoring($user),
        ];

        return $permissions;
    }

    /**
     * Cache permission check results
     */
    public static function checkCached(string $permission, User $user, $resourceId = null): bool
    {
        $cacheKey = "permission:{$user->id}:{$permission}:{$resourceId}";

        return Cache::remember($cacheKey, 3600, function () use ($permission, $user, $resourceId) {
            return match ($permission) {
                'admin' => self::canAccessAdmin($user),
                'staff' => self::isTechStaff($user),
                'saas_owner' => self::isSaasOwner($user),
                'manage_api_keys' => self::canManageApiKeys($user),
                'view_system_logs' => self::canViewSystemLogs($user),
                'access_monitoring' => self::canAccessMonitoring($user),
                'manage_saas_instance' => self::canManageSaasInstance($user, $resourceId),
                'view_saas_analytics' => self::canViewSaasAnalytics($user, $resourceId),
                'edit_prompts' => self::canEditPrompts($user, $resourceId),
                default => false,
            };
        });
    }

    /**
     * Clear permission cache for user
     */
    public static function clearCache(User $user): void
    {
        Cache::forget("user_permissions:{$user->id}");
    }
}
