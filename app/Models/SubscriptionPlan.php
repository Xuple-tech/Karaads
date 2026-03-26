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
        'max_concurrent_agents',
        'max_agents_per_team',
        'max_active_agents',
        'max_mcp_servers',
        'max_tools_per_workflow',
        'allowed_tool_categories',
        'supports_custom_tools',
        'supports_mcp_integration',
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
        'allowed_tool_categories' => 'array',
        'supports_custom_tools' => 'boolean',
        'supports_mcp_integration' => 'boolean',
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

    /**
     * Get tools for this plan
     */
    public function planTools(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SubscriptionPlanTool::class, 'plan_id');
    }

    /**
     * Get only enabled tools
     */
    public function enabledTools(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->planTools()->where('is_enabled', true);
    }

    /**
     * Get agent templates for this plan
     */
    public function agentTemplates(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SubscriptionPlanAgentTemplate::class, 'plan_id');
    }

    /**
     * Get only enabled agent templates
     */
    public function enabledAgentTemplates(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->agentTemplates()->where('is_enabled', true);
    }

    /**
     * Check if plan has unlimited concurrent agents
     */
    public function hasUnlimitedConcurrentAgents(): bool
    {
        return is_null($this->max_concurrent_agents);
    }

    /**
     * Check if plan has unlimited agents per team
     */
    public function hasUnlimitedAgentsPerTeam(): bool
    {
        return is_null($this->max_agents_per_team);
    }

    /**
     * Check if plan has unlimited active agents
     */
    public function hasUnlimitedActiveAgents(): bool
    {
        return is_null($this->max_active_agents);
    }

    /**
     * Check if plan has unlimited MCP servers
     */
    public function hasUnlimitedMCPServers(): bool
    {
        return is_null($this->max_mcp_servers);
    }

    /**
     * Check if plan has unlimited tools per workflow
     */
    public function hasUnlimitedToolsPerWorkflow(): bool
    {
        return is_null($this->max_tools_per_workflow);
    }

    /**
     * Get all agent limits
     */
    public function getAgentLimits(): array
    {
        return [
            'max_concurrent_agents' => $this->max_concurrent_agents,
            'max_agents_per_team' => $this->max_agents_per_team,
            'max_active_agents' => $this->max_active_agents,
        ];
    }

    /**
     * Get all tool limits
     */
    public function getToolLimits(): array
    {
        return [
            'max_mcp_servers' => $this->max_mcp_servers,
            'max_tools_per_workflow' => $this->max_tools_per_workflow,
            'allowed_tool_categories' => $this->allowed_tool_categories ?? [],
            'supports_custom_tools' => $this->supports_custom_tools,
            'supports_mcp_integration' => $this->supports_mcp_integration,
        ];
    }
}
