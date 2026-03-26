import React from 'react';
import { X, Copy, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface WorkflowStep {
    sequence: number;
    tool_name: string;
    parameters: Record<string, any>;
    status?: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
    error?: string;
}

interface ExecutionDetailsProps {
    workflow: {
        id: string;
        name: string;
        description: string;
        execution_mode: 'sequential' | 'parallel' | 'conditional';
        steps: WorkflowStep[];
    };
    execution?: {
        status: string;
        started_at: string;
        completed_at?: string;
        duration_ms?: number;
        result?: any;
        error_message?: string;
    };
    onClose: () => void;
}

export default function WorkflowExecutionDetails({ workflow, execution, onClose }: ExecutionDetailsProps) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const getExecutionModeLabel = () => {
        const modes = {
            sequential: '→ Sequential Execution',
            parallel: '∥ Parallel Execution',
            conditional: 'if/else Conditional Logic'
        };
        return modes[workflow.execution_mode];
    };

    const getStepStatusColor = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'failed':
                return 'text-red-600';
            case 'running':
                return 'text-blue-600 animate-pulse';
            case 'pending':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full my-8">
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{workflow.name}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Overview */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Overview</h3>
                        <div className="space-y-2 text-sm">
                            <p><strong>Description:</strong> {workflow.description || 'N/A'}</p>
                            <p><strong>Execution Mode:</strong> {getExecutionModeLabel()}</p>
                            <p><strong>Total Steps:</strong> {workflow.steps.length}</p>
                        </div>
                    </div>

                    {/* Execution Status */}
                    {execution && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Execution Status</h3>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <strong>Status:</strong>{' '}
                                    <span className={`capitalize font-semibold ${
                                        execution.status === 'completed'
                                            ? 'text-green-600'
                                            : execution.status === 'failed'
                                            ? 'text-red-600'
                                            : execution.status === 'running'
                                            ? 'text-blue-600'
                                            : 'text-yellow-600'
                                    }`}>
                                        {execution.status}
                                    </span>
                                </p>
                                <p><strong>Started:</strong> {new Date(execution.started_at).toLocaleString()}</p>
                                {execution.completed_at && (
                                    <p><strong>Completed:</strong> {new Date(execution.completed_at).toLocaleString()}</p>
                                )}
                                {execution.duration_ms && (
                                    <p>
                                        <strong>Duration:</strong>{' '}
                                        {execution.duration_ms < 1000
                                            ? `${execution.duration_ms}ms`
                                            : `${(execution.duration_ms / 1000).toFixed(2)}s`}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Steps */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Workflow Steps</h3>
                        <div className="space-y-3">
                            {workflow.steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-gray-50 dark:bg-gray-800 border rounded"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-500 text-white text-xs font-bold rounded-full">
                                                {step.sequence}
                                            </span>
                                            <span className="font-semibold">{step.tool_name}</span>
                                        </div>
                                        {step.status && (
                                            <span className={`text-sm font-semibold capitalize ${getStepStatusColor(step.status)}`}>
                                                {step.status === 'completed' && '✓'}
                                                {step.status === 'failed' && '✗'}
                                                {step.status === 'running' && '⟳'}
                                                {step.status === 'pending' && '◯'}
                                                {' '}{step.status}
                                            </span>
                                        )}
                                    </div>

                                    {/* Parameters */}
                                    <div className="mb-2">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Parameters:</p>
                                        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs font-mono overflow-x-auto flex justify-between items-start">
                                            <pre>{JSON.stringify(step.parameters, null, 2)}</pre>
                                            <button
                                                onClick={() => copyToClipboard(JSON.stringify(step.parameters))}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded flex-shrink-0 ml-2"
                                                title="Copy parameters"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Result */}
                                    {step.result && (
                                        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 p-2 rounded text-xs">
                                            <p className="font-semibold text-green-800 dark:text-green-200 mb-1">Result:</p>
                                            <pre className="text-green-700 dark:text-green-300 overflow-x-auto">
                                                {JSON.stringify(step.result, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    {/* Error */}
                                    {step.error && (
                                        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-2 rounded text-xs">
                                            <p className="font-semibold text-red-800 dark:text-red-200 mb-1 flex items-center gap-1">
                                                <AlertCircle size={14} /> Error:
                                            </p>
                                            <p className="text-red-700 dark:text-red-300">{step.error}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final Result */}
                    {execution?.result && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Final Result</h3>
                            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 p-4 rounded">
                                <pre className="text-green-700 dark:text-green-300 text-xs overflow-x-auto">
                                    {JSON.stringify(execution.result, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {execution?.error_message && (
                        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 p-4 rounded">
                            <p className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-2 mb-2">
                                <AlertCircle size={18} /> Execution Error
                            </p>
                            <p className="text-red-700 dark:text-red-300 text-sm">{execution.error_message}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-800 border-t p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
