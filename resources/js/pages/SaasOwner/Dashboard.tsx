import React from 'react';
import SaasOwnerLayout from '@/layouts/SaasOwnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { MessageSquare, Users, Zap, TrendingUp, AlertCircle, Plus, Settings, BarChart3 } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface SaasStats {
    instance_name: string;
    subscription_plan: string;
    messages_this_month: number;
    message_limit: number;
    usage_percentage: number;
    total_messages_period: number;
    api_tokens_used: number;
    api_requests: number;
    avg_response_time_ms: number;
    period: string;
}

interface SaasOwnerDashboardProps {
    instanceSettings: any;
    stats: SaasStats;
    teamMembers: any[];
    responseTimeDistribution: any[];
}

export default function SaasOwnerDashboard({
    instanceSettings,
    stats,
    teamMembers,
    responseTimeDistribution,
}: SaasOwnerDashboardProps) {
    const usagePercentage = Math.min(stats.usage_percentage, 100);

    return (
        <SaasOwnerLayout>
            <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-gray-500 mt-1">{stats.instance_name} - {stats.subscription_plan} Plan</p>
            </div>

            {/* Usage Alert if near limit */}
            {usagePercentage > 80 && (
                <Card className="bg-orange-50 border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-orange-900">Usage Alert</CardTitle>
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-orange-800">
                            You're using {usagePercentage.toFixed(1)}% of your monthly message limit.
                            Consider upgrading your plan.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages This Month</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.messages_this_month}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.message_limit - stats.messages_this_month} remaining
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamMembers.length}</div>
                        <p className="text-xs text-muted-foreground">Active members</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.api_requests}</div>
                        <p className="text-xs text-muted-foreground">
                            Avg response: {stats.avg_response_time_ms.toFixed(0)}ms
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usage</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usagePercentage.toFixed(1)}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Message Trends</CardTitle>
                        <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart
                                data={[
                                    { date: '1', messages: 120 },
                                    { date: '5', messages: 240 },
                                    { date: '10', messages: 221 },
                                    { date: '15', messages: 229 },
                                    { date: '20', messages: 200 },
                                    { date: '25', messages: 250 },
                                    { date: '30', messages: 280 },
                                ]}
                            >
                                <defs>
                                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="messages"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorMessages)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Response Time Distribution</CardTitle>
                        <CardDescription>API performance analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={responseTimeDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="bucket" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>Manage your team</CardDescription>
                        </div>
                        <Link href={route('saas-owner.team-members.create')}>
                            <Button size="sm">Add Member</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {teamMembers.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No team members yet</p>
                        ) : (
                            teamMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <div>
                                        <p className="font-medium">{member.user.name}</p>
                                        <p className="text-sm text-gray-500">{member.user.email}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {member.role}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Link href={route('saas-owner.team-members.index')}>
                            <Button variant="outline" className="w-full">
                                <Users className="w-4 h-4 mr-2" />
                                Manage Team
                            </Button>
                        </Link>
                        <Link href={route('saas-owner.analytics')}>
                            <Button variant="outline" className="w-full">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                            </Button>
                        </Link>
                        <Link href={route('saas-owner.settings')}>
                            <Button variant="outline" className="w-full">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
            </div>
        </SaasOwnerLayout>
    );
}
