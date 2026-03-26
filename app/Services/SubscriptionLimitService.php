<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Team;
use Illuminate\Database\Eloquent\Collection;

/**
 * Service for enforcing subscription-based limits on agents and tools
 *
 * This service validates that users and teams stay within their subscription limits
 * for agents, tools, and other premium features.
 */
class SubscriptionLimitService
{
    /**
     * Check if a user can create a new agent
     */
    public function canCreateAgent(User $user, ?Team $team = null): array
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return [
                'allowed' => false,
                'reason' => 'No active subscription found',
                'limit_type' => 'subscription',
            ];
        }

        $plan = $subscription->plan;

        // Check concurrent agents limit
        if ($plan->max_concurrent_agents !== null) {
            $concurrentCount = Agent::where('user_id', $user->id)
                ->where('is_active', true)
                ->count();

            if ($concurrentCount >= $plan->max_concurrent_agents) {
                return [
                    'allowed' => false,
                    'reason' => "You've reached the limit of {$plan->max_concurrent_agents} concurrent agents",
                    'limit_type' => 'concurrent_agents',
                    'current' => $concurrentCount,
                    'limit' => $plan->max_concurrent_agents,
                ];
            }
        }

        // Check team agents limit
        if ($team && $plan->max_agents_per_team !== null) {
            $teamAgentCount = Agent::where('team_id', $team->id)
                ->count();

            if ($teamAgentCount >= $plan->max_agents_per_team) {
                return [
                    'allowed' => false,
                    'reason' => "This team has reached the limit of {$plan->max_agents_per_team} agents",
                    'limit_type' => 'agents_per_team',
                    'current' => $teamAgentCount,
                    'limit' => $plan->max_agents_per_team,
                    'team_id' => $team->id,
                ];
            }
        }

        return [
            'allowed' => true,
            'subscription' => $subscription,
            'plan' => $plan,
        ];
    }

    /**
     * Check if a user can activate an agent
     */
    public function canActivateAgent(User $user, Agent $agent, ?Team $team = null): array
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return [
                'allowed' => false,
                'reason' => 'No active subscription found',
                'limit_type' => 'subscription',
            ];
        }

        $plan = $subscription->plan;

        // Check active agents limit
        if ($plan->max_active_agents !== null) {
            $activeCount = Agent::where('user_id', $user->id)
                ->where('is_active', true)
                ->where('id', '!=', $agent->id)
                ->count();

            if ($activeCount >= $plan->max_active_agents) {
                return [
                    'allowed' => false,
                    'reason' => "You can only have {$plan->max_active_agents} active agents at a time",
                    'limit_type' => 'active_agents',
                    'current' => $activeCount,
                    'limit' => $plan->max_active_agents,
                ];
            }
        }

        return [
            'allowed' => true,
            'subscription' => $subscription,
            'plan' => $plan,
        ];
    }

    /**
     * Check if a user can add tools to an agent/workflow
     */
    public function canAddToolsToWorkflow(User $user, int $toolCount = 1): array
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return [
                'allowed' => false,
                'reason' => 'No active subscription found',
                'limit_type' => 'subscription',
            ];
        }

        $plan = $subscription->plan;

        if ($plan->max_tools_per_workflow !== null && $toolCount > $plan->max_tools_per_workflow) {
            return [
                'allowed' => false,
                'reason' => "You can add a maximum of {$plan->max_tools_per_workflow} tools per workflow",
                'limit_type' => 'tools_per_workflow',
                'requested' => $toolCount,
                'limit' => $plan->max_tools_per_workflow,
            ];
        }

        return [
            'allowed' => true,
            'subscription' => $subscription,
            'plan' => $plan,
        ];
    }

    /**
     * Check if a feature is enabled for a user's subscription
     */
    public function isFeatureEnabled(User $user, string $featureKey): bool
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return false;
        }

        $feature = $subscription->plan->enabledFeatures()
            ->where('feature_key', $featureKey)
            ->first();

        return $feature !== null;
    }

    /**
     * Get feature limit for a user
     */
    public function getFeatureLimit(User $user, string $featureKey): ?int
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return null;
        }

        $feature = $subscription->plan->planFeatures()
            ->where('feature_key', $featureKey)
            ->where('is_enabled', true)
            ->first();

        return $feature?->limit;
    }

    /**
     * Get all enabled features for a user
     */
    public function getEnabledFeatures(User $user): Collection
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return collect([]);
        }

        return $subscription->plan->enabledFeatures()->get();
    }

    /**
     * Check if a tool is available for a user's subscription
     */
    public function isToolAvailable(User $user, string $toolKey): bool
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return false;
        }

        $tool = $subscription->plan->enabledTools()
            ->where('tool_key', $toolKey)
            ->first();

        return $tool !== null;
    }

    /**
     * Get available tools for a user
     */
    public function getAvailableTools(User $user): Collection
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return collect([]);
        }

        return $subscription->plan->enabledTools()->get();
    }

    /**
     * Check if MCP servers are supported
     */
    public function supportsMCPIntegration(User $user): bool
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return false;
        }

        return $subscription->plan->supports_mcp_integration;
    }

    /**
     * Check if custom tools are supported
     */
    public function supportsCustomTools(User $user): bool
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return false;
        }

        return $subscription->plan->supports_custom_tools;
    }

    /**
     * Get MCP server limit for a user
     */
    public function getMCPServerLimit(User $user): ?int
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return null;
        }

        return $subscription->plan->max_mcp_servers;
    }

    /**
     * Check if user can add another MCP server
     */
    public function canAddMCPServer(User $user): array
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return [
                'allowed' => false,
                'reason' => 'MCP integration not available with your subscription',
            ];
        }

        if (!$subscription->plan->supports_mcp_integration) {
            return [
                'allowed' => false,
                'reason' => 'MCP integration not available with your subscription',
            ];
        }

        if ($subscription->plan->max_mcp_servers !== null) {
            // Count existing MCP servers for user (implement based on your model structure)
            // This is a placeholder - adjust based on your actual model relationships
            $serverCount = 0; // Get from database based on your implementation

            if ($serverCount >= $subscription->plan->max_mcp_servers) {
                return [
                    'allowed' => false,
                    'reason' => "You've reached the limit of {$subscription->plan->max_mcp_servers} MCP servers",
                    'limit' => $subscription->plan->max_mcp_servers,
                ];
            }
        }

        return [
            'allowed' => true,
        ];
    }

    /**
     * Get subscription statistics for a plan
     */
    public function getPlanStatistics($planId): array
    {
        $plan = \App\Models\SubscriptionPlan::find($planId);

        if (!$plan) {
            return [];
        }

        $subscriptions = $plan->subscriptions()->where('status', 'active')->get();
        $totalUsers = $subscriptions->count();
        $totalAgents = 0;

        foreach ($subscriptions as $subscription) {
            $agents = Agent::where('user_id', $subscription->user_id)->count();
            $totalAgents += $agents;
        }

        return [
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'total_subscriptions' => $totalUsers,
            'total_agents' => $totalAgents,
            'avg_agents_per_user' => $totalUsers > 0 ? round($totalAgents / $totalUsers, 2) : 0,
            'agent_limits' => [
                'max_concurrent_agents' => $plan->max_concurrent_agents,
                'max_agents_per_team' => $plan->max_agents_per_team,
                'max_active_agents' => $plan->max_active_agents,
            ],
            'tool_limits' => [
                'max_mcp_servers' => $plan->max_mcp_servers,
                'max_tools_per_workflow' => $plan->max_tools_per_workflow,
                'supports_custom_tools' => $plan->supports_custom_tools,
                'supports_mcp_integration' => $plan->supports_mcp_integration,
            ],
            'features_enabled_count' => $plan->planFeatures()->where('is_enabled', true)->count(),
            'tools_available_count' => $plan->planTools()->where('is_enabled', true)->count(),
        ];
    }

    /**
     * Get detailed limits for a user
     */
    public function getUserLimits(User $user): array
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->plan) {
            return [];
        }

        $plan = $subscription->plan;

        $concurrentAgents = Agent::where('user_id', $user->id)
            ->where('is_active', true)
            ->count();

        $totalAgents = Agent::where('user_id', $user->id)->count();

        return [
            'user_id' => $user->id,
            'plan_name' => $plan->name,
            'agent_limits' => [
                'max_concurrent_agents' => $plan->max_concurrent_agents,
                'current_concurrent_agents' => $concurrentAgents,
                'max_agents_per_team' => $plan->max_agents_per_team,
                'max_active_agents' => $plan->max_active_agents,
                'current_total_agents' => $totalAgents,
            ],
            'tool_limits' => [
                'max_mcp_servers' => $plan->max_mcp_servers,
                'max_tools_per_workflow' => $plan->max_tools_per_workflow,
                'supports_custom_tools' => $plan->supports_custom_tools,
                'supports_mcp_integration' => $plan->supports_mcp_integration,
            ],
            'enabled_features' => $plan->enabledFeatures()
                ->get()
                ->map(fn($f) => [
                    'key' => $f->feature_key,
                    'name' => $f->feature_name,
                    'limit' => $f->limit,
                    'limit_type' => $f->limit_type,
                ])
                ->toArray(),
            'available_tools' => $plan->enabledTools()
                ->get()
                ->map(fn($t) => [
                    'key' => $t->tool_key,
                    'name' => $t->tool_name,
                    'category' => $t->tool_category,
                ])
                ->toArray(),
        ];
    }
}
