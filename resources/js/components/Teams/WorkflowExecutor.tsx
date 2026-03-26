import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Clock, Play, Square, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkflowInput {
    [key: string]: any;
}

interface StepExecution {
    id: string;
    step_id: string;
    step_name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    input: WorkflowInput;
    output: any;
    error: string | null;
    started_at: string | null;
    completed_at: string | null;
    duration_ms?: number;
}

interface ExecutionRun {
    id: string;
    workflow_id: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    input: WorkflowInput;
    output: any;
    error: string | null;
    steps: StepExecution[];
    started_at: string;
    completed_at: string | null;
}

interface WorkflowExecutorProps {
    teamId: string;
    workflowId: string;
}

export function WorkflowExecutor({ teamId, workflowId }: WorkflowExecutorProps) {
    const [executionInput, setExecutionInput] = useState<WorkflowInput>({});
    const [isExecuting, setIsExecuting] = useState(false);
    const [currentExecution, setCurrentExecution] = useState<ExecutionRun | null>(null);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Fetch workflow details
    const { data: workflow, isLoading: workflowLoading } = useQuery({
        queryKey: ['workflow', workflowId],
        queryFn: async () => {
            const res = await axios.get(`/api/workflows/${workflowId}`);
            return res.data.data;
        },
    });

    // Execute workflow mutation
    const executeMutation = useMutation({
        mutationFn: async (input: WorkflowInput) => {
            const res = await axios.post(`/api/workflows/${workflowId}/execute`, {
                input,
            });
            return res.data.data;
        },
        onSuccess: (execution) => {
            setCurrentExecution(execution);
            queryClient.invalidateQueries({ queryKey: ['execution-history', workflowId] });

            if (execution.status === 'completed') {
                toast.success('Workflow execution completed');
            } else if (execution.status === 'failed') {
                toast.error('Workflow execution failed: ' + execution.error);
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Execution failed');
        },
    });

    // Poll for execution updates
    useEffect(() => {
        if (!isExecuting || !currentExecution) return;

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`/api/workflows/${workflowId}/executions/${currentExecution.id}`);
                const updated = res.data.data;
                setCurrentExecution(updated);

                if (updated.status !== 'running') {
                    setIsExecuting(false);
                }
            } catch (error) {
                console.error('Failed to poll execution:', error);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isExecuting, currentExecution, workflowId]);

    const handleExecute = () => {
        setIsExecuting(true);
        executeMutation.mutate(executionInput);
    };

    const handleCancel = async () => {
        if (!currentExecution) return;
        try {
            await axios.post(`/api/workflows/${workflowId}/executions/${currentExecution.id}/cancel`);
            setIsExecuting(false);
            toast.success('Execution cancelled');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'running':
                return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            running: 'default',
            completed: 'default',
            failed: 'destructive',
            cancelled: 'secondary',
        };

        const labels: Record<string, string> = {
            running: 'Running',
            completed: 'Completed',
            failed: 'Failed',
            cancelled: 'Cancelled',
        };

        return <Badge variant={variants[status] || 'secondary'}>{labels[status]}</Badge>;
    };

    if (workflowLoading) {
        return <div className="text-center py-8">Loading workflow...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Workflow Input</CardTitle>
                    <CardDescription>Provide input parameters for workflow execution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Enter input as JSON (optional)"
                        value={JSON.stringify(executionInput, null, 2)}
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value);
                                setExecutionInput(parsed);
                            } catch {
                                // Allow invalid JSON while typing
                            }
                        }}
                        className="font-mono text-sm min-h-32"
                    />
                    <div className="flex gap-2">
                        <Button
                            onClick={handleExecute}
                            disabled={isExecuting || executeMutation.isPending}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            {isExecuting ? 'Executing...' : 'Execute Workflow'}
                        </Button>
                        {isExecuting && (
                            <Button onClick={handleCancel} variant="destructive">
                                <Square className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Execution Progress */}
            {currentExecution && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Execution Progress</CardTitle>
                                <CardDescription className="text-xs mt-1">
                                    ID: {currentExecution.id}
                                </CardDescription>
                            </div>
                            {getStatusBadge(currentExecution.status)}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Execution Timeline */}
                        <div className="space-y-3">
                            {currentExecution.steps.map((step, index) => (
                                <div key={step.id} className="space-y-2">
                                    <div
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition"
                                        onClick={() =>
                                            setExpandedStep(expandedStep === step.id ? null : step.id)
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(step.status)}
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{step.step_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    Step {index + 1} • {step.status}
                                                </div>
                                            </div>
                                        </div>
                                        {step.duration_ms && (
                                            <div className="text-xs text-gray-600">
                                                {(step.duration_ms / 1000).toFixed(2)}s
                                            </div>
                                        )}
                                        {step.status !== 'pending' && (
                                            <div className="text-gray-400">
                                                {expandedStep === step.id ? (
                                                    <ChevronUp size={16} />
                                                ) : (
                                                    <ChevronDown size={16} />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedStep === step.id && (
                                        <div className="ml-8 space-y-3 pb-3">
                                            {/* Input */}
                                            <div>
                                                <div className="text-xs font-medium text-gray-600 mb-1">
                                                    Input
                                                </div>
                                                <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                                                    <pre>{JSON.stringify(step.input, null, 2)}</pre>
                                                </div>
                                            </div>

                                            {/* Output */}
                                            {step.output && (
                                                <div>
                                                    <div className="text-xs font-medium text-gray-600 mb-1">
                                                        Output
                                                    </div>
                                                    <div className="bg-green-50 border border-green-200 p-3 rounded text-xs font-mono overflow-x-auto">
                                                        <pre>{JSON.stringify(step.output, null, 2)}</pre>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error */}
                                            {step.error && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>{step.error}</AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Summary Statistics */}
                        <div className="border-t pt-4 grid grid-cols-3 gap-4">
                            <div>
                                <div className="text-xs text-gray-600">Total Duration</div>
                                <div className="text-lg font-semibold">
                                    {currentExecution.completed_at
                                        ? (
                                            (new Date(currentExecution.completed_at).getTime() -
                                                new Date(currentExecution.started_at).getTime()) /
                                            1000
                                        ).toFixed(2) + 's'
                                        : '—'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-600">Steps Completed</div>
                                <div className="text-lg font-semibold">
                                    {currentExecution.steps.filter((s) => s.status === 'completed').length} /
                                    {currentExecution.steps.length}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-600">Status</div>
                                <div className="mt-1">{getStatusBadge(currentExecution.status)}</div>
                            </div>
                        </div>

                        {/* Final Output */}
                        {currentExecution.status === 'completed' && currentExecution.output && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                                <div className="text-sm font-medium text-blue-900 mb-2">Final Output</div>
                                <div className="bg-white p-3 rounded text-xs font-mono overflow-x-auto">
                                    <pre>{JSON.stringify(currentExecution.output, null, 2)}</pre>
                                </div>
                            </div>
                        )}

                        {/* Error Alert */}
                        {currentExecution.status === 'failed' && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{currentExecution.error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default WorkflowExecutor;
