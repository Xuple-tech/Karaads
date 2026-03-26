import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';

interface Alert {
    id: string;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    created_at: string;
    is_resolved: boolean;
    resolved_at?: string;
}

interface AlertsPageProps {
    alerts: {
        data: Alert[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function Alerts({ alerts }: AlertsPageProps) {
    const { post } = useForm();

    const handleResolve = (alertId: string) => {
        post(route('admin.management.alerts.resolve', alertId), {
            onSuccess: () => {
                // Alert will be refreshed
            }
        });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    return (
        <AdminLayout>
            <Head title="System Alerts" />

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
                        <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
                        <p className="text-muted-foreground">
                            Monitor and manage system alerts and notifications
                        </p>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    {alerts.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear</h3>
                                    <p className="text-muted-foreground">No active alerts at this time.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        alerts.data.map((alert) => (
                            <Card key={alert.id} className={`border-l-4 ${alert.is_resolved ? 'opacity-60' : ''}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            {getSeverityIcon(alert.severity)}
                                            <div>
                                                <CardTitle className="text-lg">{alert.title}</CardTitle>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Badge className={getSeverityColor(alert.severity)}>
                                                        {alert.severity.toUpperCase()}
                                                    </Badge>
                                                    {!alert.is_resolved && (
                                                        <Badge variant="outline" className="text-red-600 border-red-600">
                                                            ACTIVE
                                                        </Badge>
                                                    )}
                                                    {alert.is_resolved && (
                                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                                            RESOLVED
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {!alert.is_resolved && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleResolve(alert.id)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Resolve
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-3">{alert.message}</p>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>
                                            Created: {new Date(alert.created_at).toLocaleString()}
                                        </span>
                                        {alert.resolved_at && (
                                            <span>
                                                Resolved: {new Date(alert.resolved_at).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {alerts.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {alerts.data.length} of {alerts.total} alerts
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
