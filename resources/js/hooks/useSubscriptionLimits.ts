import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface SubscriptionLimits {
    user_id: string;
    plan_name: string;
    agent_limits: {
        max_concurrent_agents: number | null;
        current_concurrent_agents: number;
        max_agents_per_team: number | null;
        max_active_agents: number | null;
        current_total_agents: number;
    };
    tool_limits: {
        max_mcp_servers: number | null;
        max_tools_per_workflow: number | null;
        supports_custom_tools: boolean;
        supports_mcp_integration: boolean;
    };
    enabled_features: Array<{
        key: string;
        name: string;
        limit: number | null;
        limit_type: string | null;
    }>;
    available_tools: Array<{
        key: string;
        name: string;
        category: string;
    }>;
}

/**
 * Hook for accessing and managing subscription limits
 *
 * Provides information about the current user's subscription limits
 * and available features/tools
 */
export const useSubscriptionLimits = () => {
    const { data: limits, isLoading, error } = useQuery({
        queryKey: ['subscription-limits'],
        queryFn: async () => {
            const { data } = await axios.get('/api/subscription/limits');
            return data.limits as SubscriptionLimits;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Helper functions to check specific limits
    const canCreateAgent = (teamId?: string): boolean => {
        if (!limits) return false;

        const { max_concurrent_agents, current_concurrent_agents, max_agents_per_team } = limits.agent_limits;

        // Check concurrent limit
        if (max_concurrent_agents !== null && current_concurrent_agents >= max_concurrent_agents) {
            return false;
        }

        return true;
    };

    const canActivateAgent = (): boolean => {
        if (!limits) return false;

        const { max_active_agents, current_concurrent_agents } = limits.agent_limits;

        if (max_active_agents !== null && current_concurrent_agents >= max_active_agents) {
            return false;
        }

        return true;
    };

    const getRemainingConcurrentAgents = (): number | null => {
        if (!limits) return null;

        const { max_concurrent_agents, current_concurrent_agents } = limits.agent_limits;

        if (max_concurrent_agents === null) return null;
        return Math.max(0, max_concurrent_agents - current_concurrent_agents);
    };

    const getRemainingTotalAgents = (): number | null => {
        if (!limits) return null;

        const { max_agents_per_team, current_total_agents } = limits.agent_limits;

        if (max_agents_per_team === null) return null;
        return Math.max(0, max_agents_per_team - current_total_agents);
    };

    const hasFeature = (featureKey: string): boolean => {
        if (!limits) return false;
        return limits.enabled_features.some(f => f.key === featureKey);
    };

    const getFeatureLimit = (featureKey: string): number | null => {
        if (!limits) return null;
        const feature = limits.enabled_features.find(f => f.key === featureKey);
        return feature?.limit ?? null;
    };

    const hasFeatureUnlimited = (featureKey: string): boolean => {
        if (!limits) return false;
        const feature = limits.enabled_features.find(f => f.key === featureKey);
        return feature?.limit === null;
    };

    const hasToolAvailable = (toolKey: string): boolean => {
        if (!limits) return false;
        return limits.available_tools.some(t => t.key === toolKey);
    };

    const getAvailableToolsByCategory = (category: string) => {
        if (!limits) return [];
        return limits.available_tools.filter(t => t.category === category);
    };

    const canUseTools = (count: number = 1): boolean => {
        if (!limits) return false;

        const { max_tools_per_workflow } = limits.tool_limits;

        if (max_tools_per_workflow === null) return true;
        return count <= max_tools_per_workflow;
    };

    const getRemainingToolSlots = (): number | null => {
        if (!limits) return null;

        const { max_tools_per_workflow } = limits.tool_limits;

        if (max_tools_per_workflow === null) return null;
        return max_tools_per_workflow; // You might track used tools per workflow separately
    };

    const supportsMCPIntegration = (): boolean => {
        if (!limits) return false;
        return limits.tool_limits.supports_mcp_integration;
    };

    const supportsCustomTools = (): boolean => {
        if (!limits) return false;
        return limits.tool_limits.supports_custom_tools;
    };

    return {
        // Raw limits data
        limits,
        isLoading,
        error,

        // Agent limit helpers
        canCreateAgent,
        canActivateAgent,
        getRemainingConcurrentAgents,
        getRemainingTotalAgents,

        // Feature helpers
        hasFeature,
        getFeatureLimit,
        hasFeatureUnlimited,

        // Tool helpers
        hasToolAvailable,
        getAvailableToolsByCategory,
        canUseTools,
        getRemainingToolSlots,
        supportsMCPIntegration,
        supportsCustomTools,

        // Info
        planName: limits?.plan_name,
        totalAgents: limits?.agent_limits.current_total_agents,
        concurrentAgents: limits?.agent_limits.current_concurrent_agents,
    };
};

/**
 * Hook for checking if a specific feature is available
 */
export const useFeatureAvailable = (featureKey: string) => {
    const { hasFeature, getFeatureLimit, hasFeatureUnlimited } = useSubscriptionLimits();

    return {
        available: hasFeature(featureKey),
        limit: getFeatureLimit(featureKey),
        unlimited: hasFeatureUnlimited(featureKey),
    };
};

/**
 * Hook for checking agent creation limits
 */
export const useAgentLimits = () => {
    const {
        canCreateAgent,
        canActivateAgent,
        getRemainingConcurrentAgents,
        getRemainingTotalAgents,
        limits,
    } = useSubscriptionLimits();

    return {
        canCreateAgent: canCreateAgent(),
        canActivateAgent: canActivateAgent(),
        remainingConcurrent: getRemainingConcurrentAgents(),
        remainingTotal: getRemainingTotalAgents(),
        maxConcurrent: limits?.agent_limits.max_concurrent_agents,
        maxTotal: limits?.agent_limits.max_agents_per_team,
        currentConcurrent: limits?.agent_limits.current_concurrent_agents,
        currentTotal: limits?.agent_limits.current_total_agents,
    };
};

/**
 * Hook for checking tool/workflow limits
 */
export const useToolLimits = () => {
    const {
        canUseTools,
        getRemainingToolSlots,
        supportsMCPIntegration,
        supportsCustomTools,
        limits,
    } = useSubscriptionLimits();

    return {
        canUseTools,
        remainingToolSlots: getRemainingToolSlots(),
        maxToolsPerWorkflow: limits?.tool_limits.max_tools_per_workflow,
        supportsMCP: supportsMCPIntegration(),
        supportsCustom: supportsCustomTools(),
        maxMCPServers: limits?.tool_limits.max_mcp_servers,
    };
};
