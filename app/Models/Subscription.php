<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'plan_id',
        'status',
        'started_at',
        'renews_at',
        'expires_at',
        'cancelled_at',
        'payment_method',
        'external_subscription_id',
        'amount_paid',
        'is_trial',
        'trial_ends_at',
    ];

    protected $casts = [
        'is_trial' => 'boolean',
        'started_at' => 'datetime',
        'renews_at' => 'datetime',
        'expires_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'trial_ends_at' => 'datetime',
    ];

    /**
     * Get the user for this subscription
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan for this subscription
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Check if subscription is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && (
            is_null($this->expires_at) || $this->expires_at > now()
        );
    }

    /**
     * Check if subscription is expired
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired' || (
            !is_null($this->expires_at) && $this->expires_at <= now()
        );
    }

    /**
     * Check if subscription is in trial period
     */
    public function isInTrial(): bool
    {
        return $this->is_trial && (
            is_null($this->trial_ends_at) || $this->trial_ends_at > now()
        );
    }

    /**
     * Check if trial has ended
     */
    public function hasTrialEnded(): bool
    {
        return $this->is_trial && !is_null($this->trial_ends_at) && $this->trial_ends_at <= now();
    }

    /**
     * Get the subscription status label
     */
    public function getStatusLabel(): string
    {
        return match ($this->status) {
            'active' => 'Active',
            'cancelled' => 'Cancelled',
            'expired' => 'Expired',
            'pending_payment' => 'Pending Payment',
            default => 'Unknown',
        };
    }

    /**
     * Renew the subscription
     */
    public function renew(): bool
    {
        return $this->update([
            'status' => 'active',
            'started_at' => now(),
            'renews_at' => now()->addMonth(),
            'expires_at' => null,
            'cancelled_at' => null,
        ]);
    }

    /**
     * Cancel the subscription
     */
    public function cancel(): bool
    {
        return $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

    /**
     * Mark as expired
     */
    public function markExpired(): bool
    {
        return $this->update([
            'status' => 'expired',
            'expires_at' => now(),
        ]);
    }

    /**
     * Get active subscription for user
     */
    public static function getActiveSubscriptionForUser($userId)
    {
        return self::where('user_id', $userId)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->first();
    }

    /**
     * Get current subscription for user (or free plan if none exists)
     */
    public static function getCurrentSubscriptionForUser($userId)
    {
        $subscription = self::getActiveSubscriptionForUser($userId);

        if ($subscription) {
            return $subscription;
        }

        // Return a free subscription
        $freePlan = SubscriptionPlan::getFreePlan();
        if ($freePlan) {
            return self::firstOrCreate(
                [
                    'user_id' => $userId,
                    'plan_id' => $freePlan->id,
                    'status' => 'active',
                ],
                [
                    'started_at' => now(),
                ]
            );
        }

        return null;
    }

    /**
     * Scope: only active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Scope: only cancelled subscriptions
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope: only expired subscriptions
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
            ->orWhere(function ($q) {
                $q->where('status', 'active')
                    ->where('expires_at', '<=', now());
            });
    }

    /**
     * Scope: trial subscriptions
     */
    public function scopeOnTrial($query)
    {
        return $query->where('is_trial', true)
            ->where(function ($q) {
                $q->whereNull('trial_ends_at')
                    ->orWhere('trial_ends_at', '>', now());
            });
    }
    public function agentPlans(){
        return $this->hasOne(AgentPlan::class,'subscription_id','id');
    }
}
