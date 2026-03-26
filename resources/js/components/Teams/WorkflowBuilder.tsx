import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Play, Save, Settings, Trash2, Copy, ArrowRight } from 'lucide-react';

interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    parameters: Record<string, any>;
    return_schema: Record<string, any>;
}

interface WorkflowStep {
    id: string;
    tool_id: string;
    name: string;
    input_mapping: Record<string, any>;
    output_key: string;
    error_handling: 'abort' | 'skip' | 'retry';
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    type: 'visual' | 'code';
    status: 'draft' | 'published';
    definition: any;
    created_at: string;
    updated_at: string;
}

interface WorkflowBuilderProps {
    teamId?: string;
    workflowId?: string;
    onSave?: (workflow: Workflow) => void;
}

export function WorkflowBuilder({ teamId, workflowId, onSave }: WorkflowBuilderProps) {
    const [workflowName, setWorkflowName] = useState('');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [workflowType, setWorkflowType] = useState<'visual' | 'code'>('visual');
    const [steps, setSteps] = useState<WorkflowStep[]>([]);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const queryClient = useQueryClient();

    // Fetch available tools
    const { data: tools } = useQuery({
        queryKey: ['available-tools'],
        queryFn: async () => {
            const res = await axios.get('/api/tools/available');
            return res.data.data;
        },
    });

    // Fetch existing workflow if editing
    const { data: existingWorkflow, isLoading } = useQuery({
        queryKey: ['workflow', workflowId],
        queryFn: async () => {
            if (!workflowId) return null;
            const res = await axios.get(`/api/workflows/${workflowId}`);
            return res.data.data;
        },
        enabled: !!workflowId,
    });

    // Initialize with existing workflow
    useEffect(() => {
        if (existingWorkflow) {
            setWorkflowName(existingWorkflow.name);
            setWorkflowDescription(existingWorkflow.description);
            setWorkflowType(existingWorkflow.type);
            if (existingWorkflow.definition?.steps) {
                setSteps(existingWorkflow.definition.steps);
            }
        }
    }, [existingWorkflow]);

    // Save workflow mutation
    const saveWorkflowMutation = useMutation({
        mutationFn: async (data: any) => {
            if (workflowId) {
                const res = await axios.put(`/api/workflows/${workflowId}`, data);
                return res.data.data;
            } else if (teamId) {
                const res = await axios.post(`/api/teams/${teamId}/workflows`, data);
                return res.data.data;
            }
        },
        onSuccess: (workflow) => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            setIsDirty(false);
            toast.success(workflowId ? 'Workflow updated' : 'Workflow created');
            onSave?.(workflow);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to save workflow');
        },
    });

    const handleSaveWorkflow = () => {
        if (!workflowName.trim()) {
            toast.error('Workflow name is required');
            return;
        }

        saveWorkflowMutation.mutate({
            name: workflowName,
            description: workflowDescription,
            type: workflowType,
            definition: {
                steps,
                connections: generateConnections(),
                triggers: [],
            },
        });
    };

    const generateConnections = () => {
        // Generate connections between sequential steps
        const connections = [];
        for (let i = 0; i < steps.length - 1; i++) {
            connections.push({
                from_step_id: steps[i].id,
                to_step_id: steps[i + 1].id,
            });
        }
        return connections;
    };

    const addStep = (toolId: string) => {
        const tool = tools?.find((t: Tool) => t.id === toolId);
        if (!tool) return;

        const newStep: WorkflowStep = {
            id: `step-${Date.now()}`,
            tool_id: toolId,
            name: tool.name,
            input_mapping: {},
            output_key: 'output',
            error_handling: 'abort',
        };

        setSteps([...steps, newStep]);
        setIsDirty(true);
    };

    const removeStep = (stepId: string) => {
        setSteps(steps.filter((s) => s.id !== stepId));
        if (selectedStepId === stepId) {
            setSelectedStepId(null);
        }
        setIsDirty(true);
    };

    const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
        setSteps(steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)));
        setIsDirty(true);
    };

    const selectedStep = steps.find((s) => s.id === selectedStepId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <Input
                        placeholder="Workflow Name"
                        value={workflowName}
                        onChange={(e) => {
                            setWorkflowName(e.target.value);
                            setIsDirty(true);
                        }}
                        className="text-2xl font-bold border-0 focus-visible:ring-0 pl-0 h-auto mb-2"
                    />
                    <Textarea
                        placeholder="Workflow description"
                        value={workflowDescription}
                        onChange={(e) => {
                            setWorkflowDescription(e.target.value);
                            setIsDirty(true);
                        }}
                        className="resize-none text-sm text-gray-600"
                        rows={2}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={!isDirty}>
                        <Save size={16} className="mr-2" />
                        Save
                    </Button>
                    <Button variant="outline">
                        <Play size={16} className="mr-2" />
                        Test
                    </Button>
                </div>
            </div>

            {/* Workflow Type Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Workflow Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={workflowType} onValueChange={(v: any) => setWorkflowType(v)}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="visual">Visual Builder</SelectItem>
                            <SelectItem value="code">Code Editor</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-6">
                {/* Available Tools */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Available Tools</CardTitle>
                        <CardDescription>Drag or click to add to workflow</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                        {tools?.map((tool: Tool) => (
                            <div
                                key={tool.id}
                                className="p-2 bg-gray-50 rounded border cursor-pointer hover:bg-blue-50 transition"
                                onClick={() => addStep(tool.id)}
                            >
                                <div className="font-medium text-sm">{tool.name}</div>
                                <div className="text-xs text-gray-500">{tool.category}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Workflow Canvas */}
                <div className="col-span-2 space-y-4">
                    {/* Step List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Workflow Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {steps.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No steps added yet. Select a tool to begin.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {steps.map((step, index) => (
                                        <div key={step.id} className="space-y-2">
                                            <div
                                                className={`p-4 border rounded cursor-pointer transition ${
                                                    selectedStepId === step.id
                                                        ? 'bg-blue-50 border-blue-300'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                                onClick={() => setSelectedStepId(step.id)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            Step {index + 1}: {step.name}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            Output: {step.output_key}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeStep(step.id);
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div className="flex justify-center">
                                                    <ArrowRight size={16} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step Configuration */}
                    {selectedStep && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Step Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Error Handling</label>
                                    <Select
                                        value={selectedStep.error_handling}
                                        onValueChange={(v: any) =>
                                            updateStep(selectedStep.id, { error_handling: v })
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="abort">Abort Workflow</SelectItem>
                                            <SelectItem value="skip">Skip Step</SelectItem>
                                            <SelectItem value="retry">Retry (Exponential Backoff)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Output Key</label>
                                    <Input
                                        value={selectedStep.output_key}
                                        onChange={(e) =>
                                            updateStep(selectedStep.id, { output_key: e.target.value })
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
                <Button
                    variant="outline"
                    onClick={handleSaveWorkflow}
                    disabled={saveWorkflowMutation.isPending || !isDirty}
                >
                    {saveWorkflowMutation.isPending ? 'Saving...' : 'Save Workflow'}
                </Button>
            </div>
        </div>
    );
}

export default WorkflowBuilder;
