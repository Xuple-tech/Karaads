import React from 'react';
import StaffLayout from '@/layouts/StaffLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface ApiPerformanceData {
    hour: string;
    avg_response_time: number;
    p95_response_time: number;
    p99_response_time: number;
    error_count: number;
    request_count: number;
}

interface StaffApiPerformanceProps {
    performanceData: ApiPerformanceData[];
    summary: {
        avg_response_time: number;
        p95_response_time: number;
        p99_response_time: number;
        error_rate: number;
        total_requests: number;
    };
}

export default function StaffApiPerformance({ performanceData, summary }: StaffApiPerformanceProps) {
    return (
        <StaffLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">API Performance</h1>
                    <p className="text-gray-500 mt-1">Detailed performance metrics and analytics</p>
                </div>

                {/* Performance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.avg_response_time.toFixed(0)}ms</div>
                            <p className="text-xs text-gray-500 mt-1">Mean response time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">P95 Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.p95_response_time.toFixed(0)}ms</div>
                            <p className="text-xs text-gray-500 mt-1">95th percentile</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">P99 Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.p99_response_time.toFixed(0)}ms</div>
                            <p className="text-xs text-gray-500 mt-1">99th percentile</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${summary.error_rate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                {summary.error_rate.toFixed(2)}%
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Last hour</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_requests.toLocaleString()}</div>
                            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts */}
                {summary.error_rate > 5 && (
                    <Card className="bg-red-50 border-red-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-red-900 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                High Error Rate Alert
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-red-800">
                            <p>Error rate is above 5%. Please investigate recent changes or system issues.</p>
                        </CardContent>
                    </Card>
                )}

                {summary.p99_response_time > 5000 && (
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-yellow-900 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                High Latency Alert
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-yellow-800">
                            <p>P99 response time exceeds 5 seconds. Consider scaling or optimization.</p>
                        </CardContent>
                    </Card>
                )}

                {/* Response Time Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Response Time Trends</CardTitle>
                        <CardDescription>Last 24 hours performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value.toFixed(0)}ms`} />
                                <Legend />
                                <Line type="monotone" dataKey="avg_response_time" stroke="#3b82f6" name="Average" />
                                <Line type="monotone" dataKey="p95_response_time" stroke="#f59e0b" name="P95" />
                                <Line type="monotone" dataKey="p99_response_time" stroke="#ef4444" name="P99" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Request Volume */}
                <Card>
                    <CardHeader>
                        <CardTitle>Request Volume & Errors</CardTitle>
                        <CardDescription>Requests and error count by hour</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="request_count" fill="#3b82f6" name="Requests" />
                                <Bar yAxisId="right" dataKey="error_count" fill="#ef4444" name="Errors" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </StaffLayout>
    );
}
