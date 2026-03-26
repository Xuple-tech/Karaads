import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Download, Calendar, TrendingUp, MessageSquare, User, Star } from 'lucide-react';

const Report = ({ stats, metrics, agent }) => {
    const handleExport = (format) => {
        const params = new URLSearchParams({
            date_from: metrics.period.from,
            date_to: metrics.period.to,
            format: format
        });
        if (agent) {
            params.append('agent_id', agent.id);
        }
        window.location.href = `${route('admin.agent-usage-stats.report')}?${params.toString()}`;
    };

    return (
        <AdminLayout>
            <Head title="Usage Statistics Report" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Usage Statistics Report</h1>
                        <p className="text-muted-foreground">
                            {agent ? `Report for ${agent.name}` : 'Overall Report'} - {metrics.period.from} to {metrics.period.to}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => handleExport('csv')}>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('pdf')}>
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <MessageSquare className="h-8 w-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                                    <p className="text-2xl font-bold">{metrics.total_conversations?.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <MessageSquare className="h-8 w-8 text-green-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                                    <p className="text-2xl font-bold">{metrics.total_messages?.toLocaleString()}</p>
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
                                    <p className="text-2xl font-bold">{metrics.unique_users?.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Star className="h-8 w-8 text-yellow-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Avg Satisfaction</p>
                                    <p className="text-2xl font-bold">
                                        {metrics.avg_satisfaction ? metrics.avg_satisfaction.toFixed(2) : 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Peak Hours Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(metrics.peak_hours).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(metrics.peak_hours).map(([hour, count], index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{hour}:00</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${Math.min((count / Math.max(...Object.values(metrics.peak_hours))) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No peak hours data available</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Common Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {metrics.common_questions && metrics.common_questions.length > 0 ? (
                                <ul className="space-y-2">
                                    {metrics.common_questions.slice(0, 10).map((question, index) => (
                                        <li key={index} className="flex items-start justify-between">
                                            <div className="flex-1 pr-2">
                                                <p className="text-sm font-medium">{question.question}</p>
                                                <p className="text-xs text-gray-500">{question.count} occurrences</p>
                                            </div>
                                            <Badge variant="secondary">{question.count}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">No common questions data available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tool Usage Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(metrics.tool_usage).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Object.entries(metrics.tool_usage).map(([tool, count], index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="font-medium text-sm">{tool}</p>
                                        <p className="text-2xl font-bold text-blue-600">{count}</p>
                                        <p className="text-xs text-gray-500">uses</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No tool usage data available</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daily Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Date</th>
                                            <th className="text-left py-2">Conversations</th>
                                            <th className="text-left py-2">Messages</th>
                                            <th className="text-left py-2">Users</th>
                                            <th className="text-left py-2">Avg Response Time</th>
                                            <th className="text-left py-2">Satisfaction</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.map((stat, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="py-2">{new Date(stat.date).toLocaleDateString()}</td>
                                                <td className="py-2">{stat.conversations_count?.toLocaleString()}</td>
                                                <td className="py-2">{stat.messages_count?.toLocaleString()}</td>
                                                <td className="py-2">{stat.users_count?.toLocaleString()}</td>
                                                <td className="py-2">{stat.avg_response_time ? stat.avg_response_time.toFixed(2) + 's' : 'N/A'}</td>
                                                <td className="py-2">{stat.satisfaction_score ? stat.satisfaction_score.toFixed(1) + '/5' : 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No daily statistics data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Report;
