<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionPlanFeature extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = [
        'plan_id',
        'feature_key',
        'feature_name',
        'description',
        'limit',
        'limit_type',
        'is_enabled',
        'metadata',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Get the subscription plan that owns this feature
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Scope: only enabled features
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Check if feature has a usage limit
     */
    public function hasLimit(): bool
    {
        return !is_null($this->limit);
    }

    /**
     * Get feature label
     */
    public function getLabel(): string
    {
        return $this->feature_name ?? str()->title(str_replace('_', ' ', $this->feature_key));
    }

    /**
     * Get limit display text
     */
    public function getLimitText(): string
    {
        if (!$this->hasLimit()) {
            return 'Unlimited';
        }

        return match ($this->limit_type) {
            'daily' => "{$this->limit} per day",
            'monthly' => "{$this->limit} per month",
            'total' => "{$this->limit} total",
            default => "{$this->limit}",
        };
    }
}
