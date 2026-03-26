import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Wrench, X, Plus, Info } from 'lucide-react';

interface PlanToolLimitsPanelProps {
    planId: string;
    planName: string;
}

export const PlanToolLimitsPanel: React.FC<PlanToolLimitsPanelProps> = ({ planId, planName }) => {
    const [newCategory, setNewCategory] = useState('');
    const [formData, setFormData] = useState({
        max_mcp_servers: null as number | null,
        max_tools_per_workflow: null as number | null,
        supports_custom_tools: false,
        supports_mcp_integration: false,
        allowed_tool_categories: [] as string[],
    });

    const { data: plan, isLoading } = useQuery({
        queryKey: ['tool-limits', planId],
        queryFn: async () => {
            const { data } = await axios.get(`/admin/subscriptions/plans/${planId}/tool-limits`);
            return data.plan;
        },
        onSuccess: (data) => {
            setFormData({
                max_mcp_servers: data.max_mcp_servers,
                max_tools_per_workflow: data.max_tools_per_workflow,
                supports_custom_tools: data.supports_custom_tools,
                supports_mcp_integration: data.supports_mcp_integration,
                allowed_tool_categories: data.allowed_tool_categories || [],
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { data: response } = await axios.put(`/admin/subscriptions/plans/${planId}/tool-limits`, data);
            return response;
        },
        onSuccess: () => {
            toast.success('Tool limits updated successfully');
        },
        onError: () => {
            toast.error('Failed to update tool limits');
        },
    });

    const addCategoryMutation = useMutation({
        mutationFn: async (category: string) => {
            const { data } = await axios.post(`/admin/subscriptions/plans/${planId}/tool-limits/add-category`, { category });
            return data;
        },
        onSuccess: (data) => {
            setFormData(prev => ({
                ...prev,
                allowed_tool_categories: data.allowed_tool_categories || [],
            }));
            setNewCategory('');
            toast.success('Category added successfully');
        },
        onError: () => {
            toast.error('Failed to add category');
        },
    });

    const removeCategoryMutation = useMutation({
        mutationFn: async (category: string) => {
            const { data } = await axios.post(`/admin/subscriptions/plans/${planId}/tool-limits/remove-category`, { category });
            return data;
        },
        onSuccess: (data) => {
            setFormData(prev => ({
                ...prev,
                allowed_tool_categories: data.allowed_tool_categories || [],
            }));
            toast.success('Category removed successfully');
        },
        onError: () => {
            toast.error('Failed to remove category');
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (value ? parseInt(value) : null),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            addCategoryMutation.mutate(newCategory.trim());
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="w-5 h-5" />
                        Tool Limits - {planName}
                    </CardTitle>
                    <CardDescription>
                        Configure tool and MCP server access for this plan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* MCP Servers Limit */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <label className="block text-sm font-medium">Max MCP Servers</label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Maximum MCP servers that can be connected
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {plan?.max_mcp_servers ? `${plan.max_mcp_servers} servers` : 'Unlimited'}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    name="max_mcp_servers"
                                    value={formData.max_mcp_servers || ''}
                                    onChange={handleInputChange}
                                    placeholder="Leave empty for unlimited"
                                    min="1"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setFormData(prev => ({ ...prev, max_mcp_servers: null }))}
                                >
                                    Unlimited
                                </Button>
                            </div>
                        </div>

                        {/* Tools Per Workflow Limit */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <label className="block text-sm font-medium">Max Tools Per Workflow</label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Maximum tools that can be added to a single workflow
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {plan?.max_tools_per_workflow ? `${plan.max_tools_per_workflow} tools` : 'Unlimited'}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    name="max_tools_per_workflow"
                                    value={formData.max_tools_per_workflow || ''}
                                    onChange={handleInputChange}
                                    placeholder="Leave empty for unlimited"
                                    min="1"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setFormData(prev => ({ ...prev, max_tools_per_workflow: null }))}
                                >
                                    Unlimited
                                </Button>
                            </div>
                        </div>

                        {/* Feature Toggles */}
                        <div className="space-y-3 border-t pt-6">
                            <h3 className="font-medium">Tool Features</h3>

                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                <Checkbox
                                    name="supports_mcp_integration"
                                    checked={formData.supports_mcp_integration}
                                    onChange={handleInputChange}
                                />
                                <div>
                                    <p className="text-sm font-medium">MCP Integration Support</p>
                                    <p className="text-xs text-muted-foreground">Allow users to integrate MCP servers</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                <Checkbox
                                    name="supports_custom_tools"
                                    checked={formData.supports_custom_tools}
                                    onChange={handleInputChange}
                                />
                                <div>
                                    <p className="text-sm font-medium">Custom Tools Support</p>
                                    <p className="text-xs text-muted-foreground">Allow users to create custom tools</p>
                                </div>
                            </label>
                        </div>

                        {/* Allowed Tool Categories */}
                        <div className="space-y-3 border-t pt-6">
                            <div>
                                <h3 className="font-medium mb-3">Allowed Tool Categories</h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Whitelist specific tool categories for this plan
                                </p>
                            </div>

                            {/* Current Categories */}
                            {formData.allowed_tool_categories.length > 0 && (
                                <div className="space-y-2">
                                    {formData.allowed_tool_categories.map((category) => (
                                        <div key={category} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                                            <span className="text-sm font-medium">{category}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeCategoryMutation.mutate(category)}
                                                disabled={removeCategoryMutation.isPending}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add New Category */}
                            <div className="flex gap-2">
                                <Input
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="e.g., web_search, image_generation"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCategory();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddCategory}
                                    disabled={addCategoryMutation.isPending || !newCategory.trim()}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">About Tool Limits</p>
                                <p className="text-xs text-blue-800 mt-1">
                                    Configure what tools and integrations are available to users on this plan. You can set per-tool limits separately in the Tools section.
                                </p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Save Tool Limits'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PlanToolLimitsPanel;
