import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User, Clock, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

const Dashboard = ({ todayStats, weeklyStats, topAgents, commonQuestions }) => {
    const formatTrend = (value, previousValue) => {
        if (!previousValue) return null;
        const change = value - previousValue;
        const percentChange = ((change / previousValue) * 100).toFixed(1);
        return {
            value: change,
            percent: percentChange,
            trend: change >= 0 ? 'up' : 'down'
        };
    };

    const todayStatsCards = [
        {
            title: 'Today\'s Conversations',
            value: todayStats.conversations?.toLocaleString() || 0,
            icon: MessageSquare,
            trend: formatTrend(todayStats.conversations, 0), // No previous comparison
            color: 'blue'
        },
        {
            title: 'Today\'s Messages',
            value: todayStats.messages?.toLocaleString() || 0,
            icon: MessageSquare,
            trend: formatTrend(todayStats.messages, 0),
            color: 'green'
        },
        {
            title: 'Today\'s Users',
            value: todayStats.users?.toLocaleString() || 0,
            icon: User,
            trend: formatTrend(todayStats.users, 0),
            color: 'purple'
        },
        {
            title: 'Avg Satisfaction',
            value: todayStats.avg_satisfaction ? todayStats.avg_satisfaction.toFixed(1) : 0,
            icon: Star,
            trend: formatTrend(todayStats.avg_satisfaction, 0),
            color: 'yellow'
        },
    ];

    const weeklyConversationsData = weeklyStats?.map(stat => ({
        date: new Date(stat.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        conversations: stat.conversations,
        messages: stat.messages,
        users: stat.users
    }));

    return (
        <AdminLayout>
            <Head title="Usage Dashboard" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Usage Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of agent usage statistics and performance metrics
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {todayStatsCards?.map((stat, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    {React.createElement(stat.icon, {
                                        className: `h-8 w-8 text-${stat.color}-500`
                                    })}
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        {stat.trend && (
                                            <div className={`text-xs flex items-center ${
                                                stat.trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {stat.trend.trend === 'up' ? (
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <TrendingDown className="h-3 w-3 mr-1" />
                                                )}
                                                {Math.abs(stat.trend.percent)}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Weekly Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Usage Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={weeklyConversationsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="conversations" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <Area type="monotone" dataKey="messages" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                <Area type="monotone" dataKey="users" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performing Agents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performing Agents (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topAgents.length > 0 ? (
                                <div className="space-y-4">
                                    {topAgents?.map((agent, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{agent.agent?.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {agent.total_conversations?.toLocaleString()} conversations
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{agent.avg_satisfaction?.toFixed(1)}/5</p>
                                                <p className="text-sm text-gray-500">avg satisfaction</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No top performing agents data available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Common Questions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Common Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {commonQuestions.length > 0 ? (
                                <div className="space-y-3">
                                    {commonQuestions?.map((question, index) => (
                                        <div key={index} className="flex items-start justify-between">
                                            <div className="flex-1 pr-2">
                                                <p className="text-sm font-medium">{question.question}</p>
                                            </div>
                                            <span className="text-sm font-bold text-blue-600">{question.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No common questions data available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-800">Avg Response Time</h4>
                                <p className="text-2xl font-bold text-blue-900">
                                    {todayStats.avg_response_time ? todayStats.avg_response_time.toFixed(2) + 's' : 'N/A'}
                                </p>
                                <p className="text-sm text-blue-600">Today's average</p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-green-800">Engagement Rate</h4>
                                <p className="text-2xl font-bold text-green-900">
                                    {todayStats.conversations && todayStats.users
                                        ? ((todayStats.conversations / todayStats.users) * 100).toFixed(2) + '%'
                                        : 'N/A'}
                                </p>
                                <p className="text-sm text-green-600">Conversations per user</p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="font-medium text-purple-800">User Satisfaction</h4>
                                <p className="text-2xl font-bold text-purple-900">
                                    {todayStats.avg_satisfaction ? todayStats.avg_satisfaction.toFixed(1) + '/5' : 'N/A'}
                                </p>
                                <p className="text-sm text-purple-600">Today's average</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
