import React, { useState } from 'react';
import StaffLayout from '@/layouts/StaffLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Filter, Download, Search } from 'lucide-react';

interface ErrorLog {
    id: string;
    error_code: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    timestamp: string;
    endpoint?: string;
    user_id?: string;
    stack_trace?: string;
}

interface StaffLogsProps {
    logs: {
        data: ErrorLog[];
        current_page: number;
        last_page: number;
    };
    stats: {
        total_errors_24h: number;
        critical_errors: number;
        warning_count: number;
    };
}

export default function StaffLogs({ logs, stats }: StaffLogsProps) {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'error':
                return '🔴';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '•';
        }
    };

    const filteredLogs = logs.data.filter((log) => {
        if (filter !== 'all' && log.severity !== filter) return false;
        if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <StaffLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Error Logs</h1>
                    <p className="text-gray-500 mt-1">System and API error tracking</p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Errors (24h)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{stats.total_errors_24h}</div>
                            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Critical</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-900">{stats.critical_errors}</div>
                            <p className="text-xs text-gray-500 mt-1">Requires immediate attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{stats.warning_count}</div>
                            <p className="text-xs text-gray-500 mt-1">Potential issues</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-3 items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-2 block">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search error messages..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value="all">All Severities</option>
                                    <option value="error">Errors Only</option>
                                    <option value="warning">Warnings Only</option>
                                    <option value="info">Info Only</option>
                                </select>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Error Logs</CardTitle>
                        <CardDescription>
                            Showing {filteredLogs.length} of {logs.data.length} logs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredLogs.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No logs found matching your criteria
                                </div>
                            ) : (
                                filteredLogs.map((log) => (
                                    <details
                                        key={log.id}
                                        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${getSeverityColor(
                                            log.severity
                                        )}`}
                                    >
                                        <summary className="flex items-center justify-between font-medium">
                                            <div className="flex items-center gap-2 flex-1">
                                                <span>{getSeverityIcon(log.severity)}</span>
                                                <span>{log.message}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-normal text-gray-600">
                                                <span className="px-2 py-1 bg-black bg-opacity-10 rounded">
                                                    {log.error_code}
                                                </span>
                                                <span>
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </summary>
                                        <div className="mt-3 space-y-2 text-sm">
                                            {log.endpoint && (
                                                <div>
                                                    <span className="font-medium">Endpoint: </span>
                                                    <code className="bg-black bg-opacity-5 px-2 py-1 rounded">
                                                        {log.endpoint}
                                                    </code>
                                                </div>
                                            )}
                                            {log.user_id && (
                                                <div>
                                                    <span className="font-medium">User ID: </span>
                                                    {log.user_id}
                                                </div>
                                            )}
                                            {log.stack_trace && (
                                                <div>
                                                    <span className="font-medium block mb-1">Stack Trace:</span>
                                                    <pre className="bg-black bg-opacity-5 p-2 rounded overflow-x-auto text-xs">
                                                        {log.stack_trace}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: Math.min(logs.last_page, 5) }).map((_, i) => (
                            <Button
                                key={i + 1}
                                variant={logs.current_page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
