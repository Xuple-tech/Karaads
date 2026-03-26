import React from 'react';
import { Head } from '@inertiajs/react';
import {
    BarChart3,
    Users,
    MessageSquare,
    AlertTriangle,
    MapPin,
    Globe,
    Shield,
    Database,
    Cpu,
    Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AdminLayout from '@/layouts/AdminLayout';
import { Link } from '@inertiajs/react';

interface SystemStats {
    period: string;
    total_users: number;
    total_conversations: number;
    total_messages: number;
    api_stats: {
        total_tokens_used: string;
        total_api_requests: number;
        average_response_time_ms: number;
        total_errors: number;
    };
    chat_by_date: Array<{
        date: string;
        count: number;
    }>;
}

interface ApiStats {
    api_provider: string;
    request_count: number;
    total_tokens: string;
    avg_response_time: number;
}

interface ErrorStats {
    error_message: string;
    count: number;
}

interface TopUser {
    user_id: string | null;
    request_count: number;
    total_tokens: string;
    user: {
        id: string;
        name: string;
        email: string;
    } | null;
}

interface UsageByIP {
    ip_address: string;
    country: string | null;
    request_count: number;
    total_tokens: string;
    avg_response_time: number;
}

interface UsageByCountry {
    country: string;
    total_tokens: number;
    total_requests: number;
    unique_ips: number;
}

interface ManagementDashboardProps {
    systemStats: SystemStats;
    apiStats: ApiStats[];
    errorStats: ErrorStats[];
    topUsers: TopUser[];
    usageByIP: UsageByIP[];
    usageByCountry: UsageByCountry[];
    criticalAlerts: any[];
}

export default function ManagementDashboard({
    systemStats,
    apiStats = [],
    errorStats = [],
    topUsers = [],
    usageByIP = [],
    usageByCountry = [],
    criticalAlerts = []
}: ManagementDashboardProps) {
    // Calculate error rate
    const errorRate = systemStats?.api_stats?.total_errors
        ? (systemStats.api_stats.total_errors / systemStats.api_stats.total_api_requests) * 100
        : 0;

    // Calculate success rate for API providers
    const getSuccessRate = (provider: ApiStats) => {
        const totalRequests = provider.request_count;
        const errors = errorStats.find(err => err.error_message.includes(provider.api_provider))?.count || 0;
        return ((totalRequests - errors) / totalRequests) * 100;
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <Head title="Management Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Management Dashboard</h1>
                        <p className="text-muted-foreground">
                            Advanced system analytics and monitoring for KWati AI
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.management.alerts')}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Alerts
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('admin.management.audit-logs')}>
                                <Shield className="h-4 w-4 mr-2" />
                                Audit Logs
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* System Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{systemStats?.total_users?.toLocaleString() ?? 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {systemStats?.total_conversations?.toLocaleString() ?? 0} conversations
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{systemStats?.total_messages?.toLocaleString() ?? 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all conversations
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tokens Used</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{systemStats?.api_stats?.total_tokens_used?.toLocaleString() ?? 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {systemStats?.api_stats?.total_api_requests?.toLocaleString() ?? 0} API requests
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{errorRate.toFixed(1)}%</div>
                            <Progress value={errorRate} className="mt-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                                {systemStats?.api_stats?.total_errors ?? 0} errors
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* API Performance */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* API Provider Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cpu className="h-5 w-5" />
                                API Provider Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {apiStats.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No API provider data available</p>
                                ) : (
                                    apiStats.map((provider) => {
                                        const successRate = getSuccessRate(provider);
                                        return (
                                            <div key={provider.api_provider} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                                        <Zap className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium capitalize">{provider.api_provider}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {provider.request_count} requests
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant={successRate > 95 ? "default" : "destructive"}>
                                                        {successRate.toFixed(1)}% success
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {provider.avg_response_time.toFixed(0)}ms avg
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Error Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {errorStats.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No errors recorded</p>
                                ) : (
                                    errorStats.map((error, index) => (
                                        <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-red-600">
                                                    {error.error_message.length > 80
                                                        ? `${error.error_message.substring(0, 80)}...`
                                                        : error.error_message
                                                    }
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Occurred {error.count} time{error.count > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <Badge variant="destructive" className="ml-2">
                                                {error.count}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* IP and Country Analytics */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Top IPs by Usage */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Top IPs by Token Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {usageByIP.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No IP usage data available</p>
                                ) : (
                                    usageByIP.slice(0, 5).map((ip, index) => (
                                        <div key={ip.ip_address} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{ip.ip_address}</p>
                                                    {ip.country && (
                                                        <p className="text-xs text-muted-foreground">{ip.country}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        {ip.request_count} requests
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="secondary">
                                                    {parseInt(ip.total_tokens).toLocaleString()} tokens
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {ip.avg_response_time.toFixed(0)}ms avg
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage by Country */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Usage by Country
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {usageByCountry.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No country data available</p>
                                ) : (
                                    usageByCountry.map((country, index) => (
                                        <div key={country.country} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{country.country}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {country.unique_ips} unique IPs
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline">
                                                    {country.total_tokens.toLocaleString()} tokens
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {country.total_requests} requests
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Users */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Top Users by Token Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No user data available</p>
                            ) : (
                                topUsers.map((user, index) => (
                                    <div key={user.user_id || index} className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {user.user?.name || 'Anonymous User'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {user.user?.email || 'No email'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary">
                                                {parseInt(user.total_tokens).toLocaleString()} tokens
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {user.request_count} requests
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Alerts */}
                {criticalAlerts.length > 0 && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <AlertTriangle className="h-5 w-5" />
                                Critical Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {criticalAlerts.map((alert, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-red-200">
                                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-800">{alert.title || 'System Alert'}</p>
                                            <p className="text-xs text-red-600 mt-1">
                                                {alert.message || 'Critical issue detected'}
                                            </p>
                                        </div>
                                        <Badge variant="destructive">Critical</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
