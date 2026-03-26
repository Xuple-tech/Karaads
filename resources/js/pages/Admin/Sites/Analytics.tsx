// @/Pages/Admin/Sites/Analytics.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    BarChart3,
    MessageSquare,
    Users,
    Bot,
    Clock,
    TrendingUp,
    Calendar,
    Globe,
    Download
} from 'lucide-react';

const Analytics = ({ site, usageStats, topAgents, timeRange }) => {
    const [timeRangeValue, setTimeRangeValue] = React.useState(timeRange);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateStats = () => {
        if (!usageStats || usageStats.length === 0) {
            return {
                totalConversations: 0,
                totalMessages: 0,
                avgResponseTime: 0,
                peakDay: null,
                trend: 'stable'
            };
        }

        const totalConversations = usageStats.reduce((sum, day) => sum + (day.conversations || 0), 0);
        const totalMessages = usageStats.reduce((sum, day) => sum + (day.messages || 0), 0);
        const avgResponseTime = usageStats.reduce((sum, day) => sum + (day.avg_response_time || 0), 0) / usageStats.length;

        // Find peak day
        const peakDay = usageStats.reduce((max, day) =>
            (day.conversations || 0) > (max.conversations || 0) ? day : max
        , { conversations: 0 });

        // Calculate trend (simple comparison of first and last half)
        const half = Math.floor(usageStats.length / 2);
        const firstHalf = usageStats.slice(0, half);
        const secondHalf = usageStats.slice(-half);

        const firstHalfAvg = firstHalf.reduce((sum, day) => sum + (day.conversations || 0), 0) / firstHalf.length || 0;
        const secondHalfAvg = secondHalf.reduce((sum, day) => sum + (day.conversations || 0), 0) / secondHalf.length || 0;

        let trend = 'stable';
        if (secondHalfAvg > firstHalfAvg * 1.1) trend = 'up';
        else if (secondHalfAvg < firstHalfAvg * 0.9) trend = 'down';

        return {
            totalConversations,
            totalMessages,
            avgResponseTime: avgResponseTime.toFixed(1),
            peakDay: peakDay.day ? formatDate(peakDay.day) : null,
            peakDayConversations: peakDay.conversations,
            trend
        };
    };

    const stats = calculateStats();

    return (
        <AdminLayout>
            <Head title={`${site.name} - Analytics`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.sites.show', site.id)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Site
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{site.name} Analytics</h1>
                            <p className="text-muted-foreground">
                                Performance metrics and usage statistics
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Select value={timeRangeValue} onValueChange={setTimeRangeValue}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select time range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="1y">Last year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                                    <p className="text-2xl font-bold">{stats.totalConversations}</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="mt-4">
                                <div className="flex items-center">
                                    {stats.trend === 'up' ? (
                                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                    ) : stats.trend === 'down' ? (
                                        <TrendingUp className="h-4 w-4 text-red-500 mr-1 transform rotate-180" />
                                    ) : (
                                        <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                                    )}
                                    <span className={`text-xs ${
                                        stats.trend === 'up' ? 'text-green-500' :
                                        stats.trend === 'down' ? 'text-red-500' :
                                        'text-gray-500'
                                    }`}>
                                        {stats.trend === 'up' ? 'Growing' : stats.trend === 'down' ? 'Declining' : 'Stable'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                                    <p className="text-2xl font-bold">{stats.totalMessages}</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="mt-4">
                                <p className="text-xs text-muted-foreground">
                                    Avg {stats.totalConversations > 0 ?
                                        Math.round(stats.totalMessages / stats.totalConversations) : 0
                                    } messages per conversation
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                                    <p className="text-2xl font-bold">{stats.avgResponseTime}s</p>
                                </div>
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="mt-4">
                                <p className="text-xs text-muted-foreground">
                                    Average agent response time
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Peak Day</p>
                                    <p className="text-2xl font-bold">{stats.peakDayConversations || 0}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="mt-4">
                                <p className="text-xs text-muted-foreground">
                                    {stats.peakDay ? `on ${stats.peakDay}` : 'No data'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="usage" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="usage">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Usage Trends
                        </TabsTrigger>
                        <TabsTrigger value="agents">
                            <Bot className="h-4 w-4 mr-2" />
                            Top Agents
                        </TabsTrigger>
                        <TabsTrigger value="details">
                            <Globe className="h-4 w-4 mr-2" />
                            Site Details
                        </TabsTrigger>
                    </TabsList>

                    {/* Usage Trends Tab */}
                    <TabsContent value="usage">
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversation Trends</CardTitle>
                                <CardDescription>
                                    Daily conversation volume over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {usageStats && usageStats.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="h-64 flex items-end space-x-1">
                                            {usageStats.map((day, index) => {
                                                const maxConversations = Math.max(...usageStats.map(d => d.conversations || 0));
                                                const height = maxConversations > 0 ?
                                                    ((day.conversations || 0) / maxConversations) * 100 : 0;

                                                return (
                                                    <div key={index} className="flex-1 flex flex-col items-center">
                                                        <div className="flex flex-col items-center">
                                                            <div
                                                                className="w-full bg-blue-500 rounded-t"
                                                                style={{ height: `${height}%`, minHeight: '2px' }}
                                                                title={`${day.conversations || 0} conversations`}
                                                            />
                                                            <span className="text-xs text-muted-foreground mt-2">
                                                                {formatDate(day.day)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="border-t pt-4">
                                            <h4 className="text-sm font-medium mb-2">Daily Breakdown</h4>
                                            <div className="space-y-2">
                                                {usageStats.map((day, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <span className="text-sm">{formatDate(day.day)}</span>
                                                        <div className="flex items-center space-x-4">
                                                            <span className="text-sm">
                                                                {day.conversations || 0} conversations
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {day.messages || 0} messages
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {(day.avg_response_time || 0).toFixed(1)}s avg
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No usage data available</h3>
                                        <p className="text-muted-foreground">
                                            Usage statistics will appear here once the site's agents start having conversations.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Top Agents Tab */}
                    <TabsContent value="agents">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Agents</CardTitle>
                                <CardDescription>
                                    Agents with the most conversations
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topAgents && topAgents.length > 0 ? (
                                    <div className="space-y-4">
                                        {topAgents.map((agent, index) => (
                                            <div key={agent.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{agent.name}</h4>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant="outline">{agent.agent_type}</Badge>
                                                                <Badge variant={agent.is_active ? "success" : "secondary"}>
                                                                    {agent.is_active ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold">{agent.conversations_count || 0}</p>
                                                        <p className="text-xs text-muted-foreground">conversations</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {agent.description || 'No description'}
                                                </p>
                                                <div className="mt-3 flex justify-end">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('admin.ai-agents.show', agent.id)}>
                                                            View Agent
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No agent data available</h3>
                                        <p className="text-muted-foreground">
                                            Agent statistics will appear here once they start having conversations.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Site Details Tab */}
                    <TabsContent value="details">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Site Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Domain</h4>
                                        <p className="text-base">{site.domain}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">URL</h4>
                                        <a
                                            href={site.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {site.url}
                                        </a>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Site Type</h4>
                                        <Badge variant="outline">
                                            {site.site_type.split('_').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={site.is_active ? "success" : "secondary"}>
                                                {site.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Badge variant={site.widget_enabled ? "success" : "secondary"}>
                                                Widget {site.widget_enabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Agent Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Total Agents</h4>
                                        <p className="text-2xl font-bold">{site.agents?.length || 0}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Active Agents</h4>
                                        <p className="text-2xl font-bold">
                                            {site.agents?.filter(a => a.is_active).length || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Agent Limit</h4>
                                        <p className="text-base">
                                            {site.agents?.length || 0} / {site.max_agents || 3}
                                        </p>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{
                                                    width: `${Math.min(((site.agents?.length || 0) / (site.max_agents || 3)) * 100, 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default Analytics;
