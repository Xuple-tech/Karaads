<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionPlanTool extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = [
        'plan_id',
        'tool_id',
        'tool_key',
        'tool_name',
        'description',
        'tool_category',
        'is_enabled',
        'usage_limit',
        'limit_period',
        'configuration',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'configuration' => 'array',
    ];

    /**
     * Get the subscription plan that owns this tool
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Get the tool model if it exists
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class, 'tool_id');
    }

    /**
     * Scope: only enabled tools
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope: filter by category
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('tool_category', $category);
    }

    /**
     * Check if tool has usage limit
     */
    public function hasUsageLimit(): bool
    {
        return !is_null($this->usage_limit);
    }

    /**
     * Get tool category display name
     */
    public function getCategoryLabel(): string
    {
        return match ($this->tool_category) {
            'mcp_server' => 'MCP Server',
            'integration' => 'Integration',
            'built_in_tool' => 'Built-in Tool',
            default => str()->title(str_replace('_', ' ', $this->tool_category)),
        };
    }

    /**
     * Get usage limit display text
     */
    public function getUsageLimitText(): string
    {
        if (!$this->hasUsageLimit()) {
            return 'Unlimited';
        }

        return match ($this->limit_period) {
            'daily' => "{$this->usage_limit} per day",
            'monthly' => "{$this->usage_limit} per month",
            'total' => "{$this->usage_limit} total",
            default => "{$this->usage_limit}",
        };
    }
}
