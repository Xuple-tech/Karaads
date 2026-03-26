<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionPlanAgentTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = [
        'plan_id',
        'template_name',
        'description',
        'agent_config',
        'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'agent_config' => 'array',
    ];

    /**
     * Get the subscription plan that owns this template
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Scope: only enabled templates
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Get template configuration
     */
    public function getConfig(): array
    {
        return $this->agent_config ?? [];
    }

    /**
     * Update template configuration
     */
    public function updateConfig(array $config): bool
    {
        return $this->update(['agent_config' => $config]);
    }
}
