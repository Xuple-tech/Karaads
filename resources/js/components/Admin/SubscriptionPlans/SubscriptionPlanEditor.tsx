import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { PlanAgentLimitsPanel } from './PlanAgentLimitsPanel';
import { PlanToolLimitsPanel } from './PlanToolLimitsPanel';
import { PlanFeaturesPanel } from './PlanFeaturesPanel';
import { PlanToolsManager } from './PlanToolsManager';

interface SubscriptionPlan {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    billing_cycle: string;
    status: string;
    max_concurrent_agents: number | null;
    max_agents_per_team: number | null;
    max_active_agents: number | null;
    max_mcp_servers: number | null;
    max_tools_per_workflow: number | null;
    supports_custom_tools: boolean;
    supports_mcp_integration: boolean;
}

interface SubscriptionPlanEditorProps {
    planId: string;
    onBack?: () => void;
}

export const SubscriptionPlanEditor: React.FC<SubscriptionPlanEditorProps> = ({ planId, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const { data: plan, isLoading, error } = useQuery({
        queryKey: ['subscription-plan', planId],
        queryFn: async () => {
            const { data } = await axios.get(`/admin/subscriptions/plans/${planId}`);
            return data.plan as SubscriptionPlan;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Loading plan details...</p>
                </div>
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-red-500 text-center">Failed to load subscription plan</p>
                        {onBack && (
                            <Button className="w-full mt-4" onClick={onBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        {onBack && (
                            <Button variant="ghost" size="sm" onClick={onBack}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        <h1 className="text-3xl font-bold">{plan.name}</h1>
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                            {plan.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold">${plan.price}</p>
                    <p className="text-sm text-muted-foreground">/{plan.billing_cycle}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Max Concurrent Agents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {plan.max_concurrent_agents ?? '∞'}
                        </p>
                        <p className="text-xs text-muted-foreground">concurrent</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Agents Per Team</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {plan.max_agents_per_team ?? '∞'}
                        </p>
                        <p className="text-xs text-muted-foreground">per team</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {plan.max_active_agents ?? '∞'}
                        </p>
                        <p className="text-xs text-muted-foreground">active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tools/Workflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {plan.max_tools_per_workflow ?? '∞'}
                        </p>
                        <p className="text-xs text-muted-foreground">per workflow</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for different management sections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="agents">Agent Limits</TabsTrigger>
                    <TabsTrigger value="tools">Tools</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Overview</CardTitle>
                            <CardDescription>General information about this subscription tier</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium mb-2">Basic Information</h3>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Plan ID:</dt>
                                            <dd className="font-mono">{plan.id}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Slug:</dt>
                                            <dd className="font-mono">{plan.slug}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Billing Cycle:</dt>
                                            <dd>{plan.billing_cycle}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Status:</dt>
                                            <dd>
                                                <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                                                    {plan.status}
                                                </Badge>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Feature Flags</h3>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Custom Tools:</dt>
                                            <dd>
                                                <Badge variant={plan.supports_custom_tools ? 'default' : 'secondary'}>
                                                    {plan.supports_custom_tools ? 'Enabled' : 'Disabled'}
                                                </Badge>
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">MCP Integration:</dt>
                                            <dd>
                                                <Badge variant={plan.supports_mcp_integration ? 'default' : 'secondary'}>
                                                    {plan.supports_mcp_integration ? 'Enabled' : 'Disabled'}
                                                </Badge>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="font-medium mb-4">Agent Limits Summary</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Concurrent Agents</p>
                                        <p className="text-lg font-bold">
                                            {plan.max_concurrent_agents ?? 'Unlimited'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Per Team</p>
                                        <p className="text-lg font-bold">
                                            {plan.max_agents_per_team ?? 'Unlimited'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Active Agents</p>
                                        <p className="text-lg font-bold">
                                            {plan.max_active_agents ?? 'Unlimited'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="font-medium mb-4">Tools Limits Summary</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">MCP Servers</p>
                                        <p className="text-lg font-bold">
                                            {plan.max_mcp_servers ?? 'Unlimited'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Tools Per Workflow</p>
                                        <p className="text-lg font-bold">
                                            {plan.max_tools_per_workflow ?? 'Unlimited'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Agent Limits Tab */}
                <TabsContent value="agents" className="space-y-6">
                    <PlanAgentLimitsPanel planId={planId} planName={plan.name} />
                </TabsContent>

                {/* Tools Tab */}
                <TabsContent value="tools" className="space-y-6">
                    <PlanToolLimitsPanel planId={planId} planName={plan.name} />
                    <PlanToolsManager planId={planId} planName={plan.name} />
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="space-y-6">
                    <PlanFeaturesPanel planId={planId} planName={plan.name} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SubscriptionPlanEditor;
