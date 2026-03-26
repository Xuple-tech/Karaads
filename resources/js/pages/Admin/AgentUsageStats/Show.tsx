import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, Clock, Star, BarChart3, Edit, Trash2 } from 'lucide-react';

const Show = ({ stat }) => {
    const handleEdit = () => {
        window.location.href = route('admin.agent-usage-stats.edit', stat.id);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this usage statistic?')) {
            window.location.href = route('admin.agent-usage-stats.destroy', {
                agentUsageStat: stat.id,
                _method: 'DELETE'
            });
        }
    };

    return (
        <AdminLayout>
            <Head title={`Statistics - ${stat.date}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Usage Statistics for {stat.agent?.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Statistics for {new Date(stat.date).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.agent-usage-stats.report')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Generate Report
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        <Button onClick={handleEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <MessageSquare className="h-8 w-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Conversations</p>
                                    <p className="text-2xl font-bold">{stat.conversations_count?.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <MessageSquare className="h-8 w-8 text-green-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Messages</p>
                                    <p className="text-2xl font-bold">{stat.messages_count?.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <User className="h-8 w-8 text-purple-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                                    <p className="text-2xl font-bold">{stat.users_count?.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-orange-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                                    <p className="text-2xl font-bold">
                                        {stat.avg_response_time ? `${stat.avg_response_time.toFixed(2)}s` : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Star className="h-8 w-8 text-yellow-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                                    <p className="text-2xl font-bold">
                                        {stat.satisfaction_score ? `${stat.satisfaction_score.toFixed(1)}/5` : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">Agent</h3>
                                <p className="text-muted-foreground mt-1">{stat.agent?.name}</p>
                            </div>

                            <div>
                                <h3 className="font-medium">Date</h3>
                                <p className="text-muted-foreground mt-1">
                                    {new Date(stat.date).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Knowledge Base Hits</h3>
                                <p className="text-muted-foreground mt-1">
                                    {stat.knowledge_base_hits?.toLocaleString() || 0}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Created At</h3>
                                <p className="text-muted-foreground mt-1">
                                    {new Date(stat.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Updated At</h3>
                                <p className="text-muted-foreground mt-1">
                                    {new Date(stat.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">Common Questions</h3>
                                <ul className="mt-2 space-y-1">
                                    {stat.common_questions && stat.common_questions.length > 0 ? (
                                        stat.common_questions.map((question, index) => (
                                            <li key={index} className="text-sm text-muted-foreground pl-2 border-l-2 border-gray-200">
                                                {question.question} ({question.count} times)
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-muted-foreground">No common questions recorded</li>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium">Peak Hours</h3>
                                <ul className="mt-2 space-y-1">
                                    {stat.peak_hours && stat.peak_hours.length > 0 ? (
                                        stat.peak_hours.map((hour, index) => (
                                            <li key={index} className="text-sm text-muted-foreground pl-2 border-l-2 border-gray-200">
                                                {hour.hour}:00 - {hour.count} interactions
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-muted-foreground">No peak hours recorded</li>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium">Tool Usage</h3>
                                <ul className="mt-2 space-y-1">
                                    {stat.tool_usage && Object.keys(stat.tool_usage).length > 0 ? (
                                        Object.entries(stat.tool_usage).map(([tool, count], index) => (
                                            <li key={index} className="text-sm text-muted-foreground pl-2 border-l-2 border-gray-200">
                                                {tool}: {count} times
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-muted-foreground">No tool usage recorded</li>
                                    )}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-800">Engagement Rate</h4>
                                <p className="text-2xl font-bold text-blue-900">
                                    {stat.conversations_count && stat.users_count
                                        ? ((stat.conversations_count / stat.users_count) * 100).toFixed(2) + '%'
                                        : 'N/A'}
                                </p>
                                <p className="text-sm text-blue-600">Conversations per user</p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-green-800">Message Density</h4>
                                <p className="text-2xl font-bold text-green-900">
                                    {stat.messages_count && stat.conversations_count
                                        ? Math.round(stat.messages_count / stat.conversations_count)
                                        : 'N/A'}
                                </p>
                                <p className="text-sm text-green-600">Messages per conversation</p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="font-medium text-purple-800">Efficiency Score</h4>
                                <p className="text-2xl font-bold text-purple-900">
                                    {stat.avg_response_time && stat.satisfaction_score
                                        ? (stat.satisfaction_score / (stat.avg_response_time || 1)).toFixed(2)
                                        : 'N/A'}
                                </p>
                                <p className="text-sm text-purple-600">Satisfaction/response time ratio</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Show;
