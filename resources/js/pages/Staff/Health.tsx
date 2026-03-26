import React from 'react';
import StaffLayout from '@/layouts/StaffLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface SystemHealth {
    status: 'healthy' | 'degraded' | 'critical';
    cpu: number;
    memory: number;
    disk: number;
    database_latency: number;
    api_uptime: number;
}

interface StaffSystemHealthProps {
    health: SystemHealth;
    recentChecks: Array<{
        timestamp: string;
        status: 'pass' | 'fail';
        message: string;
    }>;
}

export default function StaffSystemHealth({ health, recentChecks }: StaffSystemHealthProps) {
    const statusIcon = {
        healthy: <CheckCircle className="w-6 h-6 text-green-600" />,
        degraded: <AlertCircle className="w-6 h-6 text-yellow-600" />,
        critical: <XCircle className="w-6 h-6 text-red-600" />,
    };

    const statusColor = {
        healthy: 'bg-green-50 border-green-200',
        degraded: 'bg-yellow-50 border-yellow-200',
        critical: 'bg-red-50 border-red-200',
    };

    const getHealthColor = (value: number) => {
        if (value > 80) return 'bg-red-600';
        if (value > 60) return 'bg-yellow-600';
        return 'bg-green-600';
    };

    return (
        <StaffLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">System Health</h1>
                    <p className="text-gray-500 mt-1">Infrastructure and service health status</p>
                </div>

                {/* Overall Status */}
                <Card className={`border-2 ${statusColor[health.status]}`}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {statusIcon[health.status]}
                                <div>
                                    <h2 className="text-2xl font-bold capitalize">{health.status}</h2>
                                    <p className="text-gray-600">
                                        {health.status === 'healthy' && 'All systems operating normally'}
                                        {health.status === 'degraded' && 'Some services are experiencing issues'}
                                        {health.status === 'critical' && 'Critical issues detected - immediate action required'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Last updated</p>
                                <p className="font-medium">{new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resource Usage */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{health.cpu}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div
                                    className={`h-2 rounded-full ${getHealthColor(health.cpu)}`}
                                    style={{ width: `${Math.min(health.cpu, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {health.cpu > 80 ? 'Critical' : health.cpu > 60 ? 'Elevated' : 'Normal'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{health.memory}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div
                                    className={`h-2 rounded-full ${getHealthColor(health.memory)}`}
                                    style={{ width: `${Math.min(health.memory, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {health.memory > 80 ? 'Critical' : health.memory > 60 ? 'Elevated' : 'Normal'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{health.disk}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div
                                    className={`h-2 rounded-full ${getHealthColor(health.disk)}`}
                                    style={{ width: `${Math.min(health.disk, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {health.disk > 80 ? 'Critical' : health.disk > 60 ? 'Elevated' : 'Normal'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">API Uptime</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{health.api_uptime.toFixed(2)}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div
                                    className={`h-2 rounded-full ${health.api_uptime > 99.5 ? 'bg-green-600' : 'bg-yellow-600'}`}
                                    style={{ width: `${Math.min(health.api_uptime, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Service Latencies */}
                <Card>
                    <CardHeader>
                        <CardTitle>Service Latencies</CardTitle>
                        <CardDescription>Current response times by service</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Database Query Time</span>
                                <span className="font-bold text-sm">{health.database_latency}ms</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${health.database_latency > 100 ? 'bg-red-600' : 'bg-green-600'}`}
                                    style={{ width: `${Math.min((health.database_latency / 200) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Health Checks */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Health Checks</CardTitle>
                        <CardDescription>Last 20 system checks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recentChecks.map((check, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg flex items-center gap-3 ${
                                        check.status === 'pass'
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-red-50 border border-red-200'
                                    }`}
                                >
                                    {check.status === 'pass' ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{check.message}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(check.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StaffLayout>
    );
}
