import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2, Wrench } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Tool {
    id: string;
    tool_key: string;
    tool_name: string;
    description: string;
    tool_category: string;
    category_label: string;
    is_enabled: boolean;
    usage_limit: number | null;
    limit_period: string | null;
    usage_limit_text: string;
}

interface PlanToolsManagerProps {
    planId: string;
    planName: string;
}

export const PlanToolsManager: React.FC<PlanToolsManagerProps> = ({ planId, planName }) => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<Tool | null>(null);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        tool_key: '',
        tool_name: '',
        description: '',
        tool_category: 'built_in_tool' as 'built_in_tool' | 'mcp_server' | 'integration',
        is_enabled: true,
        usage_limit: null as number | null,
        limit_period: 'monthly' as 'daily' | 'monthly' | 'total' | null,
    });

    const { data: tools = [], isLoading } = useQuery({
        queryKey: ['plan-tools', planId],
        queryFn: async () => {
            const { data } = await axios.get(`/admin/subscriptions/plans/${planId}/tools`);
            return data.tools || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { data: response } = await axios.post(`/admin/subscriptions/plans/${planId}/tools`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-tools', planId] });
            toast.success('Tool added successfully');
            setIsOpen(false);
            resetForm();
        },
        onError: () => {
            toast.error('Failed to add tool');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { data: response } = await axios.put(
                `/admin/subscriptions/plans/${planId}/tools/${editingTool!.id}`,
                data
            );
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-tools', planId] });
            toast.success('Tool updated successfully');
            setIsOpen(false);
            resetForm();
        },
        onError: () => {
            toast.error('Failed to update tool');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (toolId: string) => {
            const { data } = await axios.delete(`/admin/subscriptions/plans/${planId}/tools/${toolId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-tools', planId] });
            toast.success('Tool deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete tool');
        },
    });

    const bulkToggleMutation = useMutation({
        mutationFn: async (isEnabled: boolean) => {
            const { data } = await axios.post(`/admin/subscriptions/plans/${planId}/tools/bulk-toggle`, {
                tool_ids: selectedTools,
                is_enabled: isEnabled,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-tools', planId] });
            setSelectedTools([]);
            toast.success('Tools updated successfully');
        },
        onError: () => {
            toast.error('Failed to update tools');
        },
    });

    const resetForm = () => {
        setFormData({
            tool_key: '',
            tool_name: '',
            description: '',
            tool_category: 'built_in_tool',
            is_enabled: true,
            usage_limit: null,
            limit_period: 'monthly',
        });
        setEditingTool(null);
    };

    const handleOpenDialog = (tool?: Tool) => {
        if (tool) {
            setEditingTool(tool);
            setFormData({
                tool_key: tool.tool_key,
                tool_name: tool.tool_name,
                description: tool.description || '',
                tool_category: tool.tool_category as any,
                is_enabled: tool.is_enabled,
                usage_limit: tool.usage_limit,
                limit_period: tool.limit_period as any,
            });
        } else {
            resetForm();
        }
        setIsOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.tool_key || !formData.tool_name) {
            toast.error('Tool key and name are required');
            return;
        }

        if (editingTool) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const toggleToolSelection = (toolId: string) => {
        setSelectedTools(prev =>
            prev.includes(toolId)
                ? prev.filter(id => id !== toolId)
                : [...prev, toolId]
        );
    };

    const categories = ['mcp_server', 'integration', 'built_in_tool'];

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="w-5 h-5" />
                            Tools - {planName}
                        </CardTitle>
                        <CardDescription>Manage available tools for this subscription plan</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tool
                    </Button>
                </CardHeader>
                <CardContent>
                    {selectedTools.length > 0 && (
                        <div className="mb-4 flex gap-2 p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium">{selectedTools.length} selected</p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => bulkToggleMutation.mutate(true)}
                                disabled={bulkToggleMutation.isPending}
                            >
                                Enable
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => bulkToggleMutation.mutate(false)}
                                disabled={bulkToggleMutation.isPending}
                            >
                                Disable
                            </Button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center p-8">Loading tools...</div>
                    ) : tools.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <Wrench className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No tools added yet</p>
                            <Button className="mt-4" onClick={() => handleOpenDialog()}>
                                Add First Tool
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedTools.length === tools.length && tools.length > 0}
                                                onChange={(e) => {
                                                    if (e) {
                                                        setSelectedTools(tools.map(t => t.id));
                                                    } else {
                                                        setSelectedTools([]);
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>Tool Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Usage Limit</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tools.map((tool: Tool) => (
                                        <TableRow key={tool.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedTools.includes(tool.id)}
                                                    onChange={() => toggleToolSelection(tool.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{tool.tool_name}</p>
                                                    <p className="text-xs text-muted-foreground">{tool.tool_key}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{tool.category_label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{tool.usage_limit_text}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={tool.is_enabled ? 'default' : 'secondary'}>
                                                    {tool.is_enabled ? 'Enabled' : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenDialog(tool)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deleteMutation.mutate(tool.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTool ? 'Edit Tool' : 'Add Tool'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTool ? 'Update tool details' : 'Add a new tool to this plan'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Tool Key *</label>
                            <Input
                                value={formData.tool_key}
                                onChange={(e) => setFormData(prev => ({ ...prev, tool_key: e.target.value }))}
                                placeholder="e.g., web_search_google"
                                disabled={!!editingTool}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Tool Name *</label>
                            <Input
                                value={formData.tool_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, tool_name: e.target.value }))}
                                placeholder="e.g., Google Web Search"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Tool description"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Category</label>
                            <select
                                value={formData.tool_category}
                                onChange={(e) => setFormData(prev => ({ ...prev, tool_category: e.target.value as any }))}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat.replace('_', ' ').toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Usage Limit</label>
                            <Input
                                type="number"
                                value={formData.usage_limit || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value ? parseInt(e.target.value) : null }))}
                                placeholder="Leave empty for unlimited"
                                min="1"
                            />
                        </div>

                        {formData.usage_limit && (
                            <div>
                                <label className="text-sm font-medium">Limit Period</label>
                                <select
                                    value={formData.limit_period || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, limit_period: e.target.value as any }))}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="total">Total</option>
                                </select>
                            </div>
                        )}

                        <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
                            <Checkbox
                                checked={formData.is_enabled}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_enabled: e }))}
                            />
                            <span className="text-sm font-medium">Enabled</span>
                        </label>

                        <div className="flex gap-2 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleSubmit}
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {editingTool ? 'Update' : 'Add'} Tool
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlanToolsManager;
