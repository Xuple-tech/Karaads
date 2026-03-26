import React, { useState } from 'react';
import { Plus, Trash2, Play, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface WorkflowStep {
    sequence: number;
    tool_name: string;
    parameters: Record<string, any>;
    next_step_on_success?: string;
    next_step_on_failure?: string;
}

interface WorkflowBuilderProps {
    projectId: string;
    agentId: string;
    onSave?: (workflow: any) => void;
}

export default function WorkflowBuilder({ projectId, agentId, onSave }: WorkflowBuilderProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [mode, setMode] = useState<'sequential' | 'parallel' | 'conditional'>('sequential');
    const [steps, setSteps] = useState<WorkflowStep[]>([]);
    const [selectedTool, setSelectedTool] = useState('');
    const [params, setParams] = useState('{}');
    const [saving, setSaving] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const commonTools = [
        'web_search',
        'web_fetch',
        'file_read',
        'file_create',
        'file_delete',
        'api_call',
        'code_execute',
        'send_email',
        'get_weather',
        'database_query'
    ];

    const addStep = () => {
        if (!selectedTool) {
            toast.error('Select a tool');
            return;
        }

        try {
            const parsedParams = JSON.parse(params);
            const newStep: WorkflowStep = {
                sequence: steps.length + 1,
                tool_name: selectedTool,
                parameters: parsedParams
            };

            setSteps([...steps, newStep]);
            setSelectedTool('');
            setParams('{}');
            toast.success('Step added');
        } catch (error) {
            toast.error('Invalid JSON parameters');
        }
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const validateWorkflow = async () => {
        const errors: string[] = [];

        if (!name.trim()) errors.push('Workflow name is required');
        if (steps.length === 0) errors.push('Add at least one step');

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const saveWorkflow = async () => {
        if (!(await validateWorkflow())) return;

        try {
            setSaving(true);
            const response = await axios.post(
                `/api/projects/${projectId}/agents/${agentId}/workflows`,
                {
                    name,
                    description,
                    execution_mode: mode,
                    steps
                }
            );

            toast.success('Workflow saved');
            onSave?.(response.data.chain);

            // Reset form
            setName('');
            setDescription('');
            setMode('sequential');
            setSteps([]);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save workflow');
        } finally {
            setSaving(false);
        }
    };

    const executeWorkflow = async () => {
        if (!(await validateWorkflow())) return;

        try {
            setExecuting(true);
            const response = await axios.post(
                `/api/projects/${projectId}/agents/${agentId}/workflows`,
                {
                    name: `${name} (Test)`,
                    description: description,
                    execution_mode: mode,
                    steps
                }
            );

            const chainId = response.data.chain.id;

            // Execute immediately
            const execResponse = await axios.post(
                `/api/projects/${projectId}/agents/${agentId}/workflows/${chainId}/execute`,
                { input_data: {} }
            );

            toast.success('Workflow executed');
            console.log('Execution result:', execResponse.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Execution failed');
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div className="space-y-4 max-w-4xl mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg border">
            <h2 className="text-xl font-bold">Workflow Builder</h2>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded flex gap-2">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-red-700 dark:text-red-300">
                        {validationErrors.map((err, i) => <div key={i}>• {err}</div>)}
                    </div>
                </div>
            )}

            {/* Config Section */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                    <label className="block text-sm font-medium mb-1">Workflow Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Web Research Pipeline"
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What does this workflow do?"
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        rows={2}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Execution Mode</label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="sequential">Sequential (Tool 1 → Tool 2 → Tool 3)</option>
                        <option value="parallel">Parallel (All tools at once)</option>
                        <option value="conditional">Conditional (If/Else)</option>
                    </select>
                </div>
            </div>

            {/* Add Step Section */}
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded">
                <h3 className="font-semibold flex items-center gap-2">
                    <Plus size={18} /> Add Step
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tool</label>
                        <select
                            value={selectedTool}
                            onChange={(e) => setSelectedTool(e.target.value)}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                        >
                            <option value="">Select a tool...</option>
                            {commonTools.map(tool => (
                                <option key={tool} value={tool}>{tool}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Parameters (JSON)</label>
                        <input
                            type="text"
                            value={params}
                            onChange={(e) => setParams(e.target.value)}
                            placeholder='{"key": "value"}'
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 font-mono text-xs"
                        />
                    </div>
                </div>

                <button
                    onClick={addStep}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Add Step
                </button>
            </div>

            {/* Steps List */}
            <div className="space-y-2">
                <h3 className="font-semibold">Workflow Steps ({steps.length})</h3>
                {steps.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No steps added yet. Add one above.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="p-3 bg-gray-50 dark:bg-gray-800 border rounded flex items-center justify-between gap-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">
                                            {step.sequence}
                                        </span>
                                        <span className="font-medium">{step.tool_name}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 break-words">
                                        Params: {JSON.stringify(step.parameters).substring(0, 50)}...
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeStep(index)}
                                    className="p-2 hover:bg-red-200 dark:hover:bg-red-900 rounded text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
                <button
                    onClick={executeWorkflow}
                    disabled={saving || executing || steps.length === 0}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Play size={18} /> Test Execute
                </button>
                <button
                    onClick={saveWorkflow}
                    disabled={saving || executing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Check size={18} /> Save Workflow
                </button>
            </div>
        </div>
    );
}
