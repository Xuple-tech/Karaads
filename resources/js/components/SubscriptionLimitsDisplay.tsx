import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Lock, Zap } from 'lucide-react';
import { useSubscriptionLimits, useAgentLimits } from '@/hooks/useSubscriptionLimits';

interface SubscriptionLimitsDisplayProps {
    compact?: boolean;
    showFeatures?: boolean;
    showTools?: boolean;
}

export const SubscriptionLimitsDisplay: React.FC<SubscriptionLimitsDisplayProps> = ({
    compact = false,
    showFeatures = true,
    showTools = true,
}) => {
    const {
        limits,
        isLoading,
        hasFeature,
        supportsMCPIntegration,
        supportsCustomTools,
    } = useSubscriptionLimits();

    const {
        canCreateAgent,
        remainingConcurrent,
        remainingTotal,
        maxConcurrent,
        maxTotal,
        currentConcurrent,
        currentTotal,
    } = useAgentLimits();

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Loading limits...</p>
                </CardContent>
            </Card>
        );
    }

    if (!limits) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Unable to load subscription information</AlertDescription>
            </Alert>
        );
    }

    if (compact) {
        return (
            <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                    <div className="text-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Plan:</span>
                            <Badge variant="outline">{limits.plan_name}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Agents:</span>
                            <span className="font-medium">
                                {currentTotal}/{maxTotal ?? '∞'}
                            </span>
                        </div>
                        {currentConcurrent !== undefined && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Active:</span>
                                <span className="font-medium">
                                    {currentConcurrent}/{maxConcurrent ?? '∞'}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Plan Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Current Plan
                    </CardTitle>
                    <CardDescription>View your subscription details and usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Plan Tier:</span>
                        <Badge>{limits.plan_name}</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Agent Limits */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Agent Limits</CardTitle>
                    <CardDescription>Monitor your agent creation and activation limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Concurrent Agents */}
                    {maxConcurrent !== null && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Concurrent Agents</span>
                                <span className="text-sm">
                                    {currentConcurrent || 0}/{maxConcurrent}
                                </span>
                            </div>
                            <Progress
                                value={Math.round(((currentConcurrent || 0) / maxConcurrent) * 100)}
                                className="h-2"
                            />
                            {remainingConcurrent !== null && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {remainingConcurrent} agent{remainingConcurrent !== 1 ? 's' : ''} remaining
                                </p>
                            )}
                        </div>
                    )}

                    {maxConcurrent === null && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-green-900">Concurrent Agents</span>
                            <Badge variant="outline" className="bg-green-100 text-green-900 border-green-200">
                                Unlimited
                            </Badge>
                        </div>
                    )}

                    {/* Total Agents */}
                    {maxTotal !== null && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Total Agents</span>
                                <span className="text-sm">
                                    {currentTotal || 0}/{maxTotal}
                                </span>
                            </div>
                            <Progress
                                value={Math.round(((currentTotal || 0) / maxTotal) * 100)}
                                className="h-2"
                            />
                            {remainingTotal !== null && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {remainingTotal} agent{remainingTotal !== 1 ? 's' : ''} remaining
                                </p>
                            )}
                        </div>
                    )}

                    {maxTotal === null && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-green-900">Total Agents</span>
                            <Badge variant="outline" className="bg-green-100 text-green-900 border-green-200">
                                Unlimited
                            </Badge>
                        </div>
                    )}

                    {/* Creation Status */}
                    {!canCreateAgent && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                You've reached your agent creation limit. Please upgrade your plan or delete unused agents.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Tool Limits */}
            {showTools && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Tool & Integration Capabilities</CardTitle>
                        <CardDescription>Check available tools and integration support</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {limits.tool_limits.max_tools_per_workflow !== null && (
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <span className="text-sm font-medium">Tools per Workflow</span>
                                <Badge variant="outline">{limits.tool_limits.max_tools_per_workflow}</Badge>
                            </div>
                        )}

                        {limits.tool_limits.max_tools_per_workflow === null && (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-medium text-green-900">Tools per Workflow</span>
                                <Badge variant="outline" className="bg-green-100 text-green-900 border-green-200">
                                    Unlimited
                                </Badge>
                            </div>
                        )}

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">MCP Integration</span>
                                {supportsMCPIntegration() ? (
                                    <Badge className="bg-green-100 text-green-900 border-green-200">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Enabled
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        <Lock className="w-3 h-3 mr-1" />
                                        Disabled
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Custom Tools</span>
                                {supportsCustomTools() ? (
                                    <Badge className="bg-green-100 text-green-900 border-green-200">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Enabled
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        <Lock className="w-3 h-3 mr-1" />
                                        Disabled
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {limits.tool_limits.max_mcp_servers !== null && (
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">MCP Server Limit</span>
                                    <Badge variant="outline">{limits.tool_limits.max_mcp_servers}</Badge>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Features */}
            {showFeatures && limits.enabled_features.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Enabled Features</CardTitle>
                        <CardDescription>
                            {limits.enabled_features.length} feature{limits.enabled_features.length !== 1 ? 's' : ''} available
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {limits.enabled_features.map((feature) => (
                                <div
                                    key={feature.key}
                                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{feature.name}</p>
                                        {feature.limit && (
                                            <p className="text-xs text-muted-foreground">
                                                Limit: {feature.limit} {feature.limit_type ? `per ${feature.limit_type}` : ''}
                                            </p>
                                        )}
                                    </div>
                                    {!feature.limit && (
                                        <Badge variant="outline" className="text-xs">
                                            Unlimited
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SubscriptionLimitsDisplay;
