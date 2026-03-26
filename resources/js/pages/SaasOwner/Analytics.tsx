import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Activity, Users, Clock, TrendingUp } from 'lucide-react';

interface AnalyticsPageProps {
    stats: {
        messages_this_month: number;
        total_messages: number;
        api_tokens_used: number;
        api_requests: number;
        avg_response_time_ms: number;
        period: string;
    };
    dailyUsage: Array<{
        date: string;
        count: number;
    }>;
    usageByIP: Array<{
        ip_address: string;
        total_tokens: number;
        total_requests: number;
        last_used: string;
        country: string;
    }>;
    usageByCountry: Array<{
        country: string;
        total_tokens: number;
        total_requests: number;
        unique_ips: number;
    }>;
}

const Analytics: React.FC<AnalyticsPageProps> = ({
    stats,
    dailyUsage,
    usageByIP,
    usageByCountry
}) => {
    return (
        <>
            <Head title="Analytics" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <Badge variant="outline" className="text-sm">
                        Last {stats.period}
                    </Badge>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Messages This Month</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.messages_this_month.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Total: {stats.total_messages.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">API Tokens Used</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.api_tokens_used.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Across {stats.api_requests.toLocaleString()} requests
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avg_response_time_ms.toFixed(0)}ms</div>
                            <p className="text-xs text-muted-foreground">
                                Per request
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{usageByIP.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Active this period
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Usage by IP Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Top IP Addresses by Usage
                            </CardTitle>
                            <CardDescription>
                                IP addresses with the highest token consumption
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {usageByIP.length > 0 ? (
                                <div className="space-y-4">
                                    {usageByIP.map((ip, index) => (
                                        <div key={ip.ip_address} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm">{ip.ip_address}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {ip.country}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Last used: {new Date(ip.last_used).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">{ip.total_tokens.toLocaleString()} tokens</div>
                                                <div className="text-xs text-muted-foreground">{ip.total_requests} requests</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No IP usage data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Usage by Country */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Usage by Country
                            </CardTitle>
                            <CardDescription>
                                Geographic distribution of your API usage
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {usageByCountry.length > 0 ? (
                                <div className="space-y-4">
                                    {usageByCountry.map((country) => (
                                        <div key={country.country} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium">{country.country}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {country.unique_ips} unique IPs
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">{country.total_tokens.toLocaleString()} tokens</div>
                                                <div className="text-xs text-muted-foreground">{country.total_requests} requests</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No country usage data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Usage Chart Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Usage Trend</CardTitle>
                        <CardDescription>
                            Messages per day over the last 30 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dailyUsage.length > 0 ? (
                            <div className="space-y-2">
                                {dailyUsage.slice(0, 7).map((day) => (
                                    <div key={day.date} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                        <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                                        <span className="font-medium">{day.count} messages</span>
                                    </div>
                                ))}
                                {dailyUsage.length > 7 && (
                                    <div className="text-center text-sm text-muted-foreground pt-2">
                                        And {dailyUsage.length - 7} more days...
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No daily usage data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Analytics;
