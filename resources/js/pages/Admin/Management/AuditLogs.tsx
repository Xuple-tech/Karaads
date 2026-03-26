import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Shield, ArrowLeft, User, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';

interface AuditLog {
    id: string;
    action: string;
    description: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface AuditLogsPageProps {
    logs: {
        data: AuditLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function AuditLogs({ logs }: AuditLogsPageProps) {
    const getActionColor = (action: string) => {
        if (action.includes('create') || action.includes('store')) {
            return 'bg-green-100 text-green-800';
        }
        if (action.includes('update') || action.includes('edit')) {
            return 'bg-blue-100 text-blue-800';
        }
        if (action.includes('delete') || action.includes('destroy')) {
            return 'bg-red-100 text-red-800';
        }
        if (action.includes('login') || action.includes('auth')) {
            return 'bg-purple-100 text-purple-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout>
            <Head title="Audit Logs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('admin.management-dashboard')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                        <p className="text-muted-foreground">
                            Complete log of system activities and user actions
                        </p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{logs.total.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                All time activity
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Page</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{logs.data.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Logs shown
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {logs.data.length > 0
                                    ? new Date(logs.data[0].created_at).toLocaleDateString()
                                    : 'N/A'
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Most recent
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Logs List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {logs.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity</h3>
                                    <p className="text-muted-foreground">No audit logs found.</p>
                                </div>
                            ) : (
                                logs.data.map((log) => (
                                    <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Badge className={getActionColor(log.action)}>
                                                    {log.action}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </span>
                                            </div>

                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                {log.description}
                                            </p>

                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                <span className="flex items-center space-x-1">
                                                    <User className="h-3 w-3" />
                                                    <span>{log.user.name} ({log.user.email})</span>
                                                </span>

                                                {log.ip_address && (
                                                    <span className="flex items-center space-x-1">
                                                        <span>IP: {log.ip_address}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {log.user_agent && (
                                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                                    {log.user_agent}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {logs.data.length} of {logs.total} logs
                        </p>
                        <div className="flex space-x-2">
                            {/* Add pagination component here if needed */}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
