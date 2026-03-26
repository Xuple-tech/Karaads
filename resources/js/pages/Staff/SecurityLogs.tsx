import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, Clock } from 'lucide-react';

interface SecurityLogsPageProps {
    loginLogs: {
        data: Array<{
            id: number;
            email: string;
            ip_address: string;
            status: string;
            user_agent: string;
            created_at: string;
            country: string;
        }>;
        current_page: number;
        last_page: number;
    };
    suspiciousActivity: Array<{
        email: string;
        count: number;
    }>;
}

const SecurityLogs: React.FC<SecurityLogsPageProps> = ({ loginLogs, suspiciousActivity }) => {
    return (
        <>
            <Head title="Security Logs" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Security Logs</h1>
                    <Badge variant="outline" className="text-sm">
                        Real-time Monitoring
                    </Badge>
                </div>

                {/* Suspicious Activity Alert */}
                {suspiciousActivity.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-800">
                                <AlertTriangle className="h-5 w-5" />
                                Suspicious Activity Detected
                            </CardTitle>
                            <CardDescription className="text-orange-700">
                                Multiple failed login attempts detected in the last 24 hours
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {suspiciousActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                        <div>
                                            <span className="font-medium">{activity.email}</span>
                                            <span className="text-sm text-muted-foreground ml-2">
                                                {activity.count} failed attempts
                                            </span>
                                        </div>
                                        <Badge variant="destructive">High Risk</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Login Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Login Activity
                        </CardTitle>
                        <CardDescription>
                            Recent authentication attempts and login patterns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loginLogs.data.length > 0 ? (
                            <div className="space-y-4">
                                {loginLogs.data.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium">{log.email}</span>
                                                <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                                    {log.status}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    {log.country}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Eye className="h-3 w-3" />
                                                    <span className="font-mono text-xs">{log.ip_address}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                                </div>
                                                {log.user_agent && (
                                                    <div className="text-xs truncate max-w-md">
                                                        {log.user_agent}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination Info */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <span className="text-sm text-muted-foreground">
                                        Page {loginLogs.current_page} of {loginLogs.last_page}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {loginLogs.data.length} entries shown
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No login activity found.</p>
                                <p className="text-sm mt-2">
                                    Login logs will appear here as users authenticate.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Security Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Logins (24h)</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loginLogs.data.filter(log => log.created_at >= new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Successful authentications
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {loginLogs.data.filter(log => log.status === 'failed').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Last 24 hours
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(loginLogs.data.map(log => log.ip_address)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Different locations
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default SecurityLogs;
