import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, Eye, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Execution {
    id: string;
    schedule_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    started_at: string;
    completed_at?: string;
    duration_ms?: number;
    result?: any;
    error_message?: string;
}

interface ExecutionMonitorProps {
    projectId: string;
    agentId: string;
}

export default function ExecutionMonitor({ projectId, agentId }: ExecutionMonitorProps) {
    const [executions, setExecutions] = useState<Execution[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'running' | 'completed' | 'failed'>('all');
    const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadExecutions();
        const interval = autoRefresh ? setInterval(loadExecutions, 3000) : null;
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const loadExecutions = async () => {
        try {
            const response = await axios.get(
                `/api/projects/${projectId}/agents/${agentId}/schedules/history`
            );
            setExecutions(response.data.executions || []);
        } catch (error) {
            console.error('Failed to load executions');
        } finally {
            setLoading(false);
        }
    };

    const filteredExecutions = executions.filter(ex =>
        filter === 'all' ? true : ex.status === filter
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="text-yellow-600" size={18} />;
            case 'running':
                return <Zap className="text-blue-600 animate-pulse" size={18} />;
            case 'completed':
                return <CheckCircle className="text-green-600" size={18} />;
            case 'failed':
                return <AlertCircle className="text-red-600" size={18} />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700';
            case 'running':
                return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700';
            case 'completed':
                return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700';
            case 'failed':
                return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700';
            default:
                return 'bg-gray-50 dark:bg-gray-800';
        }
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return '-';
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="space-y-4 max-w-6xl mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg border">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Execution Monitor</h2>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        Auto-refresh
                    </label>
                    <button
                        onClick={loadExecutions}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'running', 'completed', 'failed'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${
                            filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)} ({executions.filter(e => e.status === status).length})
                    </button>
                ))}
            </div>

            {/* Executions List */}
            <div className="grid grid-cols-1 gap-2">
                {loading ? (
                    <div className="text-center py-8">Loading executions...</div>
                ) : filteredExecutions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No executions found.
                    </div>
                ) : (
                    filteredExecutions.map(execution => (
                        <div
                            key={execution.id}
                            className={`p-4 border rounded cursor-pointer hover:shadow-md transition ${getStatusColor(execution.status)}`}
                            onClick={() => setSelectedExecution(execution)}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {getStatusIcon(execution.status)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold capitalize">{execution.status}</span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(execution.started_at)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Duration: {formatDuration(execution.duration_ms)}
                                        </div>
                                        {execution.error_message && (
                                            <div className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">
                                                Error: {execution.error_message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedExecution(execution);
                                    }}
                                    className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded flex-shrink-0"
                                >
                                    <Eye size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            {selectedExecution && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                {getStatusIcon(selectedExecution.status)}
                                Execution Details
                            </h3>
                            <button
                                onClick={() => setSelectedExecution(null)}
                                className="text-2xl font-bold text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-semibold">Status:</span>
                                <span className="ml-2 capitalize">{selectedExecution.status}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Started:</span>
                                <span className="ml-2">{formatDate(selectedExecution.started_at)}</span>
                            </div>
                            {selectedExecution.completed_at && (
                                <div>
                                    <span className="font-semibold">Completed:</span>
                                    <span className="ml-2">{formatDate(selectedExecution.completed_at)}</span>
                                </div>
                            )}
                            <div>
                                <span className="font-semibold">Duration:</span>
                                <span className="ml-2">{formatDuration(selectedExecution.duration_ms)}</span>
                            </div>

                            {selectedExecution.error_message && (
                                <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded mt-4">
                                    <span className="font-semibold text-red-800 dark:text-red-200">Error:</span>
                                    <p className="text-red-700 dark:text-red-300 mt-1 break-words">
                                        {selectedExecution.error_message}
                                    </p>
                                </div>
                            )}

                            {selectedExecution.result && (
                                <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded mt-4">
                                    <span className="font-semibold text-green-800 dark:text-green-200">Result:</span>
                                    <pre className="text-green-700 dark:text-green-300 mt-1 overflow-x-auto text-xs">
                                        {JSON.stringify(selectedExecution.result, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
