<?php

namespace App\Traits;

use App\Services\SubscriptionLimitService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Trait for models that should enforce subscription limits
 *
 * Automatically validates limits before creating or updating records
 * Usage: Add to Agent or other models that have subscription-based limits
 */
trait EnforcesSubscriptionLimits
{
    /**
     * Boot the trait
     */
    public static function bootEnforcesSubscriptionLimits()
    {
        static::creating(function ($model) {
            // Check limits before creating
            if (method_exists($model, 'checkSubscriptionLimits')) {
                $model->checkSubscriptionLimits();
            }
        });

        static::updating(function ($model) {
            // Check limits if changing relevant fields
            if (method_exists($model, 'checkSubscriptionLimitsOnUpdate')) {
                $model->checkSubscriptionLimitsOnUpdate();
            }
        });
    }

    /**
     * Get the subscription limit service
     */
    protected function getSubscriptionLimitService(): SubscriptionLimitService
    {
        return app(SubscriptionLimitService::class);
    }

    /**
     * Check if user can create this type of record
     */
    protected function validateAgentCreation(?\App\Models\Team $team = null): void
    {
        if (!isset($this->user_id)) {
            throw new \InvalidArgumentException('User ID must be set');
        }

        $user = \App\Models\User::findOrFail($this->user_id);
        $limitService = $this->getSubscriptionLimitService();

        $result = $limitService->canCreateAgent($user, $team);

        if (!$result['allowed']) {
            throw new \App\Exceptions\SubscriptionLimitExceededException(
                $result['reason'] ?? 'Subscription limit exceeded',
                $result['limit_type'] ?? 'unknown',
                $result
            );
        }
    }

    /**
     * Validate that activation is allowed
     */
    protected function validateAgentActivation(): void
    {
        if (!$this->is_active || !$this->isDirty('is_active')) {
            return;
        }

        if (!isset($this->user_id)) {
            throw new \InvalidArgumentException('User ID must be set');
        }

        $user = \App\Models\User::findOrFail($this->user_id);
        $limitService = $this->getSubscriptionLimitService();

        $result = $limitService->canActivateAgent($user, $this);

        if (!$result['allowed']) {
            throw new \App\Exceptions\SubscriptionLimitExceededException(
                $result['reason'] ?? 'Cannot activate agent',
                $result['limit_type'] ?? 'unknown',
                $result
            );
        }
    }
}
