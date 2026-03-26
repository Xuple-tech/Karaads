<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SaasInstanceSettings extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = [
        'saas_owner_id', 'instance_name', 'description', 'custom_prompts',
        'conversation_settings', 'features_enabled', 'monthly_message_limit',
        'current_month_messages', 'subscription_plan', 'subscription_expires_at', 'is_active'
    ];
    protected $casts = [
        'custom_prompts' => 'json',
        'conversation_settings' => 'json',
        'features_enabled' => 'json',
        'is_active' => 'boolean',
        'subscription_expires_at' => 'datetime',
    ];

    /**
     * SaaS owner
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'saas_owner_id');
    }

    /**
     * Team members
     */
    public function teamMembers(): HasMany
    {
        return $this->hasMany(SaasTeamMember::class, 'saas_owner_id', 'saas_owner_id');
    }

    /**
     * Check if feature is enabled
     */
    public function isFeatureEnabled(string $feature): bool
    {
        if (!$this->features_enabled) {
            return true;
        }
        return in_array($feature, $this->features_enabled);
    }

    /**
     * Check if under message limit
     */
    public function canSendMessage(): bool
    {
        return $this->current_month_messages < $this->monthly_message_limit;
    }

    /**
     * Check if subscription is active
     */
    public function isSubscriptionActive(): bool
    {
        if (!$this->subscription_expires_at) {
            return true;
        }
        return $this->subscription_expires_at->isFuture();
    }

    /**
     * Increment message count
     */
    public function incrementMessageCount()
    {
        $this->increment('current_month_messages');
    }

    /**
     * Reset monthly count (call from scheduler)
     */
    public static function resetMonthlyCounts()
    {
        self::query()->update(['current_month_messages' => 0]);
    }
}
