<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = [
        'name',
        'slug',
        'description',
        'monthly_price',
        'yearly_price',
        'requests_per_day',
        'requests_per_month',
        'tokens_per_day',
        'tokens_per_month',
        'images_per_day',
        'images_per_month',
        'features',
        'supports_api',
        'supports_voice',
        'supports_email_automation',
        'supports_projects',
        'priority_support',
        'is_active',
        'display_order',
        'stripe_product_id',
        'stripe_monthly_price_id',
        'stripe_yearly_price_id',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'supports_api' => 'boolean',
        'supports_voice' => 'boolean',
        'supports_email_automation' => 'boolean',
        'supports_projects' => 'boolean',
        'priority_support' => 'boolean',
    ];

    /**
     * Get subscriptions for this plan
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    /**
     * Get active users on this plan
     */
    public function activeSubscriptions(): HasMany
    {
        return $this->subscriptions()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Get usage quotas for this plan
     */
    public function usageQuotas(): HasMany
    {
        return $this->hasMany(UsageQuota::class, 'plan_id');
    }

    /**
     * Check if a limit is set for daily requests
     */
    public function hasRequestLimit(): bool
    {
        return !is_null($this->requests_per_day) || !is_null($this->requests_per_month);
    }

    /**
     * Check if a limit is set for tokens
     */
    public function hasTokenLimit(): bool
    {
        return !is_null($this->tokens_per_day) || !is_null($this->tokens_per_month);
    }

    /**
     * Check if a limit is set for image generations
     */
    public function hasImageLimit(): bool
    {
        return !is_null($this->images_per_day) || !is_null($this->images_per_month);
    }

    /**
     * Get all active plans
     */
    public static function getActivePlans()
    {
        return self::where('is_active', true)
            ->orderBy('display_order')
            ->get();
    }

    /**
     * Get free plan
     */
    public static function getFreePlan()
    {
        return self::where('slug', 'free')->first();
    }

    /**
     * Check if this is the free plan
     */
    public function isFree(): bool
    {
        return $this->slug === 'free' && $this->monthly_price == 0;
    }

    /**
     * Get features for this plan
     */
    public function planFeatures(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SubscriptionPlanFeature::class, 'plan_id');
    }

    /**
     * Get only enabled features
     */
    public function enabledFeatures(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->planFeatures()->where('is_enabled', true);
    }

}
