import React from 'react';
import StaffLayout from '@/layouts/StaffLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Activity, Zap, TrendingDown, RefreshCw, MapPin, Globe } from 'lucide-react';

interface UsageByIP {
    ip_address: string;
    total_tokens: number;
    total_requests: number;
    last_used: string;
    country?: string;
}

interface UsageByCountry {
    country: string;
    total_tokens: number;
    total_requests: number;
    unique_ips: number;
}

interface StaffMonitoringProps {
    systemHealth: {
        cpu_usage: number;
        memory_usage: number;
        uptime_hours: number;
        api_health: 'healthy' | 'degraded' | 'critical';
    };
    apiPerformance: {
        avg_response_time: number;
        p95_response_time: number;
        p99_response_time: number;
        error_rate: number;
    };
    recentErrors: any[];
    performanceByHour: any[];
    usageByIP: UsageByIP[];
    usageByCountry: UsageByCountry[];
}

export default function StaffMonitoringDashboard({
    systemHealth,
    apiPerformance,
    recentErrors,
    performanceByHour,
    usageByIP,
    usageByCountry,
}: StaffMonitoringProps) {
    const healthColor = {
        healthy: 'text-green-600',
        degraded: 'text-yellow-600',
        critical: 'text-red-600',
    };

    return (
        <StaffLayout>
            <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
                    <p className="text-gray-500 mt-1">System health and API performance</p>
                </div>
                <Button size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Critical Alerts */}
            {systemHealth.api_health === 'critical' && (
                <Card className="bg-red-50 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-red-900">Critical Alert</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-800">
                            API health is critical. Error rate is above threshold. Immediate action required.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* System Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Health</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${healthColor[systemHealth.api_health]}`}>
                            {systemHealth.api_health.toUpperCase()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Current status</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemHealth.cpu_usage.toFixed(1)}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className={`h-2 rounded-full ${
                                    systemHealth.cpu_usage > 80 ? 'bg-red-600' : 'bg-green-600'
                                }`}
                                style={{ width: `${Math.min(systemHealth.cpu_usage, 100)}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemHealth.memory_usage.toFixed(1)}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className={`h-2 rounded-full ${
                                    systemHealth.memory_usage > 80 ? 'bg-red-600' : 'bg-green-600'
                                }`}
                                style={{ width: `${Math.min(systemHealth.memory_usage, 100)}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${apiPerformance.error_rate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                            {apiPerformance.error_rate.toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Last hour</p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Response Time Percentiles</CardTitle>
                        <CardDescription>API latency analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Average</span>
                                    <span className="font-bold">{apiPerformance.avg_response_time.toFixed(0)}ms</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${Math.min((apiPerformance.avg_response_time / 3000) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">P95</span>
                                    <span className="font-bold">{apiPerformance.p95_response_time.toFixed(0)}ms</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-600 h-2 rounded-full"
                                        style={{ width: `${Math.min((apiPerformance.p95_response_time / 5000) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">P99</span>
                                    <span className="font-bold">{apiPerformance.p99_response_time.toFixed(0)}ms</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-600 h-2 rounded-full"
                                        style={{ width: `${Math.min((apiPerformance.p99_response_time / 10000) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Over Time</CardTitle>
                        <CardDescription>Last 24 hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={performanceByHour}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="avg_response_time" stroke="#3b82f6" />
                                <Line type="monotone" dataKey="error_count" stroke="#ef4444" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* IP Analytics */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Top IPs by Usage */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Top IPs by Token Usage
                        </CardTitle>
                        <CardDescription>Monitor API usage patterns by IP address</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {usageByIP.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No IP usage data available</p>
                            ) : (
                                usageByIP.map((ip, index) => (
                                    <div key={ip.ip_address} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{ip.ip_address}</p>
                                                {ip.country && (
                                                    <p className="text-xs text-muted-foreground">{ip.country}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary" className="mb-1">
                                                {ip.total_tokens.toLocaleString()} tokens
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {ip.total_requests} requests
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
                        <CardDescription>Geographic distribution of API usage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {usageByCountry.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No country data available</p>
                            ) : (
                                usageByCountry.map((country, index) => (
                                    <div key={country.country} className="flex items-center justify-between p-3 border rounded-lg">
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

            {/* Recent Errors */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Errors</CardTitle>
                    <CardDescription>Last 10 errors from the API</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentErrors.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No errors recorded</p>
                        ) : (
                            recentErrors.map((error: any, index: number) => (
                                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-mono text-sm text-red-800">{error.message}</p>
                                            <p className="text-xs text-red-600 mt-1">
                                                Occurred {new Date(error.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-red-100 rounded">
                                            {error.error_code}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
            </div>
        </StaffLayout>
    );
}
