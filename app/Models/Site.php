<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Site extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'domain',
        'subdomain',
        'url',
        'site_type', // 'website', 'web_app', 'mobile_app', 'ecommerce', 'saas'
        'industry',
        'description',
        'logo_url',
        'favicon_url',
        'primary_color',
        'secondary_color',
        'language',
        'timezone',
        'is_active',
        'widget_enabled',
        'max_agents',
        'current_agents_count',
        'site_settings',
        'verification_token',
        'verified_at',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'widget_enabled' => 'boolean',
        'site_settings' => 'array',
        'metadata' => 'array',
        'verified_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function agents(): HasMany
    {
        return $this->hasMany(AIAgent::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(SiteSubscription::class);
    }

    // For eager loading with 'with()'
    public function activeSubscriptionRelation()
    {
        return $this->hasOne(SiteSubscription::class)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderBy('created_at', 'desc');
    }

    // For getting the actual instance (your current method)
    public function activeSubscription()
    {
        return $this->hasOne(SiteSubscription::class)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderBy('created_at', 'desc')
            ->first(); // Keep this for when you need the actual model
    }

    public function canAddMoreAgents(): bool
    {
        $subscription = $this->activeSubscription();
        $maxAgents = $subscription ? $subscription->plan->max_agents_per_site : 1;
        return $this->current_agents_count < $maxAgents;
    }
}
