import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    CheckCircle,
    AlertCircle,
    Clock,
    Trash2,
    Eye,
    Download,
    RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Execution {
    id: string;
    workflow_id: string;
    workflow_name: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    input: any;
    output: any;
    error: string | null;
    started_at: string;
    completed_at: string | null;
    duration_ms?: number;
}

interface ExecutionHistoryProps {
    teamId: string;
    workflowId?: string;
}

export function ExecutionHistory({ teamId, workflowId }: ExecutionHistoryProps) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Fetch execution history
    const { data: executionsData, isLoading, refetch } = useQuery({
        queryKey: ['execution-history', workflowId, page, perPage, statusFilter],
        queryFn: async () => {
            let url = `/api/workflows/${workflowId || ''}/executions`;
            if (!workflowId) {
                url = `/api/teams/${teamId}/executions`;
            }

            const res = await axios.get(url, {
                params: {
                    page,
                    per_page: perPage,
                    status: statusFilter || undefined,
                },
            });
            return res.data.data;
        },
    });

    // Delete execution mutation
    const deleteExecutionMutation = useMutation({
        mutationFn: async (executionId: string) => {
            await axios.delete(`/api/workflows/${workflowId}/executions/${executionId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['execution-history', workflowId, page, perPage, statusFilter],
            });
            toast.success('Execution deleted');
            setDeleteTarget(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete');
        },
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'running':
                return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            running: 'secondary',
            completed: 'default',
            failed: 'destructive',
            cancelled: 'secondary',
        };

        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (ms?: number | null) => {
        if (!ms) return '—';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const downloadExecution = (execution: Execution) => {
        const data = {
            id: execution.id,
            workflow: execution.workflow_name,
            status: execution.status,
            input: execution.input,
            output: execution.output,
            error: execution.error,
            started_at: execution.started_at,
            completed_at: execution.completed_at,
            duration_ms: execution.duration_ms,
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `execution-${execution.id}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const stats = executionsData
        ? {
            total: executionsData.total || 0,
            completed: executionsData.stats?.completed || 0,
            failed: executionsData.stats?.failed || 0,
            avgDuration: executionsData.stats?.avg_duration_ms || 0,
        }
        : { total: 0, completed: 0, failed: 0, avgDuration: 0 };

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-gray-600">Total Executions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <p className="text-xs text-gray-600">Successful</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                        <p className="text-xs text-gray-600">Failed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {formatDuration(stats.avgDuration)}
                        </div>
                        <p className="text-xs text-gray-600">Avg Duration</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Statuses</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="running">Running</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        size="sm"
                    >
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                    </Button>
                </CardContent>
            </Card>

            {/* Execution Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Execution History</CardTitle>
                    <CardDescription>
                        {executionsData?.total || 0} total executions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : executionsData?.data?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No executions found
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Workflow</TableHead>
                                            <TableHead>Started</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Result</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {executionsData?.data?.map((execution: Execution) => (
                                            <TableRow key={execution.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(execution.status)}
                                                        {getStatusBadge(execution.status)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {execution.workflow_name}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {formatDate(execution.started_at)}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {formatDuration(execution.duration_ms)}
                                                </TableCell>
                                                <TableCell>
                                                    {execution.status === 'failed' && execution.error ? (
                                                        <span className="text-xs text-red-600 truncate max-w-xs">
                                                            {execution.error}
                                                        </span>
                                                    ) : execution.status === 'completed' ? (
                                                        <span className="text-xs text-green-600">Success</span>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedExecution(execution)}
                                                        >
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => downloadExecution(execution)}
                                                        >
                                                            <Download size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteTarget(execution.id)}
                                                        >
                                                            <Trash2 size={16} className="text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {executionsData?.last_page > 1 && (
                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        Page {page} of {executionsData?.last_page}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === executionsData?.last_page}
                                            onClick={() => setPage(page + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Execution Details Dialog */}
            {selectedExecution && (
                <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
                    <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Execution Details</DialogTitle>
                            <DialogDescription>{selectedExecution.id}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium mb-2">Status</div>
                                {getStatusBadge(selectedExecution.status)}
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-2">Input</div>
                                <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                                    <pre>{JSON.stringify(selectedExecution.input, null, 2)}</pre>
                                </div>
                            </div>
                            {selectedExecution.output && (
                                <div>
                                    <div className="text-sm font-medium mb-2">Output</div>
                                    <div className="bg-green-50 border border-green-200 p-3 rounded text-xs font-mono overflow-x-auto">
                                        <pre>{JSON.stringify(selectedExecution.output, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                            {selectedExecution.error && (
                                <div>
                                    <div className="text-sm font-medium mb-2">Error</div>
                                    <div className="bg-red-50 border border-red-200 p-3 rounded text-xs text-red-800">
                                        {selectedExecution.error}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteTarget && (
                <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Execution?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. The execution record will be permanently deleted.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-2 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteExecutionMutation.mutate(deleteTarget)}
                                disabled={deleteExecutionMutation.isPending}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete
                            </AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}

export default ExecutionHistory;
