import React, { useState } from 'react';
import SaasOwnerLayout from '@/layouts/SaasOwnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Users, TrendingUp, DollarSign, Activity, ChevronUp, ChevronDown } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';

interface OverviewStats {
    total_users: number;
    active_users: number;
    new_users: number;
    total_conversations: number;
    total_chats: number;
    plans_distribution: Array<{ name: string; count: number }>;
    daily_activity: Array<{ date: string; users: number; chats: number }>;
    top_users: Array<{ id: string; name: string; conversations: number; chats: number }>;
    user_growth: Array<{ date: string; total: number }>;
}

interface SubscriptionStats {
    active_subscriptions: number;
    trial_subscriptions: number;
    cancelled_subscriptions: number;
    paused_subscriptions: number;
    total_revenue: number;
    period_revenue: number;
    mrr: number;
    plan_distribution: Array<{ name: string; count: number; revenue: number }>;
    daily_revenue: Array<{ date: string; revenue: number }>;
    churn_rate: number;
    renewal_dates: Array<{ user: string; plan: string; date: string }>;
}

interface EngagementStats {
    very_active_users: number;
    active_users: number;
    moderate_users: number;
    inactive_users: number;
    retention_rate: number;
    churn_rate: number;
    hourly_activity: Array<{ hour: number; users: number }>;
}

interface StatisticsPageProps {
    overviewStats: OverviewStats;
    subscriptionStats: SubscriptionStats;
    engagementStats: EngagementStats;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function StatisticsPage({
    overviewStats,
    subscriptionStats,
    engagementStats,
}: StatisticsPageProps) {
    const [period, setPeriod] = useState('30d');

    const handlePeriodChange = (value: string) => {
        setPeriod(value);
        router.get(route('saas-owner.stats.index'), { period: value });
    };

    return (
        <SaasOwnerLayout>
            <div className="space-y-6">
                {/* Header with Period Selector */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Statistics & Analytics</h1>
                        <p className="text-gray-500 mt-1">
                            Platform metrics and performance insights
                        </p>
                    </div>
                    <div className="w-32">
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="1y">Last year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {overviewStats.total_users}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {overviewStats.active_users} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                New Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {overviewStats.new_users}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                This period
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Conversations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {overviewStats.total_conversations}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                All time
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Active Subscriptions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {subscriptionStats.active_subscriptions}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                MRR: ${subscriptionStats.mrr.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Churn Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {engagementStats.churn_rate.toFixed(1)}%
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Period churn
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                        <TabsTrigger value="engagement">Engagement</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        {/* Daily Activity Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Daily Activity</CardTitle>
                                <CardDescription>
                                    User activity and chat volume over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={overviewStats.daily_activity}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#3b82f6"
                                            fill="#3b82f6"
                                            name="Active Users"
                                            isAnimationActive={false}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="chats"
                                            stroke="#10b981"
                                            fill="#10b981"
                                            name="Chat Messages"
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* User Growth Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Growth</CardTitle>
                                <CardDescription>
                                    Cumulative user growth over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={overviewStats.user_growth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            name="Total Users"
                                            isAnimationActive={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Plans Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plan Distribution</CardTitle>
                                    <CardDescription>
                                        Users per subscription plan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={overviewStats.plans_distribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, count }) => `${name}: ${count}`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {overviewStats.plans_distribution.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Top Users */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Users</CardTitle>
                                    <CardDescription>
                                        Most active users this period
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {overviewStats.top_users.map((user, index) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between pb-2 border-b last:border-b-0"
                                            >
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {user.conversations} conversations
                                                    </p>
                                                </div>
                                                <Badge variant="outline">
                                                    {user.chats} chats
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Subscriptions Tab */}
                    <TabsContent value="subscriptions" className="space-y-4">
                        {/* Subscription Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-gray-600">Active</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {subscriptionStats.active_subscriptions}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-gray-600">Trial</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {subscriptionStats.trial_subscriptions}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-gray-600">Paused</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {subscriptionStats.paused_subscriptions}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-gray-600">
                                        Cancelled
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {subscriptionStats.cancelled_subscriptions}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Revenue Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Daily Revenue</CardTitle>
                                <CardDescription>
                                    Revenue tracking: Total ${subscriptionStats.total_revenue.toFixed(2)}
                                    | Period ${subscriptionStats.period_revenue.toFixed(2)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={subscriptionStats.daily_revenue}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#10b981"
                                            name="Revenue"
                                            isAnimationActive={false}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Plan Distribution with Revenue */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Plans Performance</CardTitle>
                                <CardDescription>
                                    Subscriptions and revenue by plan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {subscriptionStats.plan_distribution.map((plan) => (
                                        <div key={plan.name} className="pb-4 border-b last:border-b-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium">{plan.name}</p>
                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        ${plan.revenue.toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {plan.count} subscriptions
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${(plan.revenue / subscriptionStats.period_revenue) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Engagement Tab */}
                    <TabsContent value="engagement" className="space-y-4">
                        {/* Engagement Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-gray-600">
                                        Very Active
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {engagementStats.very_active_users}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Heavy users
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-gray-600">Active</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {engagementStats.active_users}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Regular users
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-gray-600">Moderate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {engagementStats.moderate_users}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Occasional users
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-gray-600">Inactive</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {engagementStats.inactive_users}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        At risk
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Retention & Churn */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Retention Rate</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="text-5xl font-bold text-green-600">
                                            {engagementStats.retention_rate.toFixed(1)}%
                                        </div>
                                        <p className="text-gray-600 mt-2">Users retained</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Churn Rate</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="text-5xl font-bold text-red-600">
                                            {engagementStats.churn_rate.toFixed(1)}%
                                        </div>
                                        <p className="text-gray-600 mt-2">Users churned</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Hourly Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hourly Activity Pattern</CardTitle>
                                <CardDescription>
                                    When users are most active during the day
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={engagementStats.hourly_activity}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="hour"
                                            label={{ value: 'Hour of Day (UTC)', position: 'insideBottom', offset: -5 }}
                                        />
                                        <YAxis label={{ value: 'Users', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Bar
                                            dataKey="users"
                                            fill="#3b82f6"
                                            name="Active Users"
                                            isAnimationActive={false}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </SaasOwnerLayout>
    );
}