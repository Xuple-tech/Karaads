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
import { Plus, Trash2, Edit2, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Feature {
    id: string;
    feature_key: string;
    feature_name: string;
    description: string;
    limit: number | null;
    limit_type: 'daily' | 'monthly' | 'total' | null;
    is_enabled: boolean;
    limit_text: string;
}

interface PlanFeaturesPanelProps {
    planId: string;
    planName: string;
}

const COMMON_FEATURES = [
    {
        key: 'web_search',
        name: 'Web Search',
        description: 'Access to search the web for real-time information',
    },
    {
        key: 'image_generation',
        name: 'Image Generation',
        description: 'Create and generate images using AI models',
    },
    {
        key: 'image_analysis',
        name: 'Image Analysis',
        description: 'Analyze and understand images provided by users',
    },
    {
        key: 'code_execution',
        name: 'Code Execution',
        description: 'Execute and run code in a sandboxed environment',
    },
    {
        key: 'file_upload',
        name: 'File Upload',
        description: 'Allow users to upload and process files',
    },
    {
        key: 'voice_input',
        name: 'Voice Input',
        description: 'Support for speech-to-text voice conversations',
    },
    {
        key: 'voice_output',
        name: 'Voice Output',
        description: 'Text-to-speech audio output capabilities',
    },
    {
        key: 'document_analysis',
        name: 'Document Analysis',
        description: 'Analyze PDFs, documents, and structured data',
    },
    {
        key: 'video_analysis',
        name: 'Video Analysis',
        description: 'Extract insights from video content',
    },
    {
        key: 'api_integration',
        name: 'API Integration',
        description: 'Connect to external APIs and services',
    },
    {
        key: 'custom_knowledge_base',
        name: 'Custom Knowledge Base',
        description: 'Allow custom document uploads for RAG',
    },
    {
        key: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Detailed usage and performance analytics',
    },
];

export const PlanFeaturesPanel: React.FC<PlanFeaturesPanelProps> = ({ planId, planName }) => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        feature_key: '',
        feature_name: '',
        description: '',
        limit: null as number | null,
        limit_type: 'monthly' as 'daily' | 'monthly' | 'total' | null,
        is_enabled: true,
    });

    const { data: features = [], isLoading } = useQuery({
        queryKey: ['plan-features', planId],
        queryFn: async () => {
            const { data } = await axios.get(`/admin/subscriptions/plans/${planId}/features`);
            return data.features || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { data: response } = await axios.post(`/admin/subscriptions/plans/${planId}/features`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-features', planId] });
            toast.success('Feature added successfully');
            setIsOpen(false);
            resetForm();
        },
        onError: () => {
            toast.error('Failed to add feature');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { data: response } = await axios.put(
                `/admin/subscriptions/plans/${planId}/features/${editingFeature!.id}`,
                data
            );
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-features', planId] });
            toast.success('Feature updated successfully');
            setIsOpen(false);
            resetForm();
        },
        onError: () => {
            toast.error('Failed to update feature');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (featureId: string) => {
            const { data } = await axios.delete(`/admin/subscriptions/plans/${planId}/features/${featureId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-features', planId] });
            toast.success('Feature deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete feature');
        },
    });

    const bulkToggleMutation = useMutation({
        mutationFn: async (isEnabled: boolean) => {
            const { data } = await axios.post(`/admin/subscriptions/plans/${planId}/features/bulk-toggle`, {
                feature_ids: selectedFeatures,
                is_enabled: isEnabled,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plan-features', planId] });
            setSelectedFeatures([]);
            toast.success('Features updated successfully');
        },
        onError: () => {
            toast.error('Failed to update features');
        },
    });

    const resetForm = () => {
        setFormData({
            feature_key: '',
            feature_name: '',
            description: '',
            limit: null,
            limit_type: 'monthly',
            is_enabled: true,
        });
        setEditingFeature(null);
    };

    const handleOpenDialog = (feature?: Feature) => {
        if (feature) {
            setEditingFeature(feature);
            setFormData({
                feature_key: feature.feature_key,
                feature_name: feature.feature_name,
                description: feature.description || '',
                limit: feature.limit,
                limit_type: feature.limit_type,
                is_enabled: feature.is_enabled,
            });
        } else {
            resetForm();
        }
        setIsOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.feature_key || !formData.feature_name) {
            toast.error('Feature key and name are required');
            return;
        }

        if (editingFeature) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const toggleFeatureSelection = (featureId: string) => {
        setSelectedFeatures(prev =>
            prev.includes(featureId)
                ? prev.filter(id => id !== featureId)
                : [...prev, featureId]
        );
    };

    const handleAddCommonFeature = (feature: (typeof COMMON_FEATURES)[0]) => {
        const exists = features.some((f: Feature) => f.feature_key === feature.key);
        if (exists) {
            toast.error('This feature already exists');
            return;
        }

        setFormData({
            feature_key: feature.key,
            feature_name: feature.name,
            description: feature.description,
            limit: null,
            limit_type: 'monthly',
            is_enabled: true,
        });
        setEditingFeature(null);
        setIsOpen(true);
    };

    const addedFeatureKeys = new Set(features.map((f: Feature) => f.feature_key));
    const availableCommonFeatures = COMMON_FEATURES.filter(f => !addedFeatureKeys.has(f.key));

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Features - {planName}
                        </CardTitle>
                        <CardDescription>Manage available features for this subscription plan</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {availableCommonFeatures.length > 0 && (
                            <Button variant="outline" onClick={() => setIsOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Quick Add
                            </Button>
                        )}
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Custom Feature
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {selectedFeatures.length > 0 && (
                        <div className="mb-4 flex gap-2 p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium">{selectedFeatures.length} selected</p>
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
                        <div className="flex justify-center p-8">Loading features...</div>
                    ) : features.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No features added yet</p>
                            <div className="mt-6 space-y-2">
                                <p className="text-xs text-muted-foreground mb-3">Add common features quickly:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableCommonFeatures.slice(0, 4).map(feature => (
                                        <Button
                                            key={feature.key}
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAddCommonFeature(feature)}
                                            className="text-xs"
                                        >
                                            {feature.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={selectedFeatures.length === features.length && features.length > 0}
                                                    onChange={(e) => {
                                                        if (e) {
                                                            setSelectedFeatures(features.map((f: Feature) => f.id));
                                                        } else {
                                                            setSelectedFeatures([]);
                                                        }
                                                    }}
                                                />
                                            </TableHead>
                                            <TableHead>Feature</TableHead>
                                            <TableHead>Usage Limit</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {features.map((feature: Feature) => (
                                            <TableRow key={feature.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedFeatures.includes(feature.id)}
                                                        onChange={() => toggleFeatureSelection(feature.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{feature.feature_name}</p>
                                                        <p className="text-xs text-muted-foreground">{feature.feature_key}</p>
                                                        {feature.description && (
                                                            <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{feature.limit_text}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={feature.is_enabled ? 'default' : 'secondary'}>
                                                        {feature.is_enabled ? 'Enabled' : 'Disabled'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleOpenDialog(feature)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => deleteMutation.mutate(feature.id)}
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

                            {availableCommonFeatures.length > 0 && (
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium mb-3">Quick add remaining common features:</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {availableCommonFeatures.map(feature => (
                                            <Button
                                                key={feature.key}
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleAddCommonFeature(feature)}
                                                className="text-xs"
                                            >
                                                + {feature.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingFeature ? 'Edit Feature' : 'Add Feature'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingFeature ? 'Update feature details' : 'Add a new feature to this plan'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Feature Key *</label>
                            <Input
                                value={formData.feature_key}
                                onChange={(e) => setFormData(prev => ({ ...prev, feature_key: e.target.value }))}
                                placeholder="e.g., web_search"
                                disabled={!!editingFeature}
                            />
                            {!editingFeature && availableCommonFeatures.length > 0 && (
                                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                                    {availableCommonFeatures.map(feature => (
                                        <button
                                            key={feature.key}
                                            className="w-full text-left px-3 py-2 text-xs rounded hover:bg-muted"
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    feature_key: feature.key,
                                                    feature_name: feature.name,
                                                    description: feature.description,
                                                });
                                            }}
                                        >
                                            <p className="font-medium">{feature.name}</p>
                                            <p className="text-muted-foreground text-xs">{feature.key}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium">Feature Name *</label>
                            <Input
                                value={formData.feature_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, feature_name: e.target.value }))}
                                placeholder="e.g., Web Search"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Feature description"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Usage Limit</label>
                            <Input
                                type="number"
                                value={formData.limit || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value ? parseInt(e.target.value) : null }))}
                                placeholder="Leave empty for unlimited"
                                min="1"
                            />
                        </div>

                        {formData.limit && (
                            <div>
                                <label className="text-sm font-medium">Limit Period</label>
                                <select
                                    value={formData.limit_type || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, limit_type: e.target.value as any }))}
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
                                {editingFeature ? 'Update' : 'Add'} Feature
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlanFeaturesPanel;
