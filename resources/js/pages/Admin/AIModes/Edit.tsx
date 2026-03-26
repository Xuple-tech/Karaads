import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, ArrowLeft } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface AIMode {
    id: number;
    name: string;
    description: string;
    emoji: string;
    system_prompt: string;
    is_active: boolean;
    display_order: number;
}

interface Props {
    mode: AIMode;
}

export default function EditAIMode({ mode }: Props) {
    const [formData, setFormData] = useState({
        name: mode.name,
        description: mode.description,
        emoji: mode.emoji,
        system_prompt: mode.system_prompt,
        display_order: mode.display_order,
        is_active: mode.is_active,
    });

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.emoji || !formData.system_prompt) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSaving(true);

        try {
            await router.put(route('admin.ai-modes.update', mode.id), formData, {
                onSuccess: () => {
                    toast.success('AI mode updated successfully');
                },
                onError: (errors) => {
                    toast.error('Failed to update AI mode');
                    console.error('Errors:', errors);
                },
                onFinish: () => {
                    setSaving(false);
                }
            });
        } catch (error) {
            console.error('Error updating AI mode:', error);
            toast.error('Failed to update AI mode');
            setSaving(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(route('admin.ai-modes.index'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to AI Modes
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Edit AI Mode</h1>
                        <p className="text-gray-500 mt-1">Update the AI mode configuration</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Mode Details</CardTitle>
                        <CardDescription>
                            Modify how the AI should behave in this mode
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Mode Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="e.g., Professional, Creative, Casual"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="emoji">Emoji *</Label>
                                    <Input
                                        id="emoji"
                                        value={formData.emoji}
                                        onChange={(e) => handleInputChange('emoji', e.target.value)}
                                        placeholder="e.g., 💼, 🎨, 😊"
                                        maxLength={10}
                                        required
                                    />
                                    <p className="text-sm text-gray-500">Choose an emoji that represents this mode</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Brief description of this AI mode"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="system_prompt">System Prompt *</Label>
                                <textarea
                                    id="system_prompt"
                                    value={formData.system_prompt}
                                    onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                                    placeholder="Define how the AI should behave in this mode. Be specific about personality, tone, and response style..."
                                    rows={8}
                                    className="w-full px-3 py-2 border rounded-md font-mono text-sm resize-vertical"
                                    required
                                />
                                <p className="text-sm text-gray-500">
                                    This prompt defines the AI's personality and behavior. Include instructions about tone, style, and any specific guidelines.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="display_order">Display Order</Label>
                                    <Input
                                        id="display_order"
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 1)}
                                        min="1"
                                    />
                                    <p className="text-sm text-gray-500">Order in which this mode appears in lists</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                            className="rounded"
                                        />
                                        <span>Active</span>
                                    </Label>
                                    <p className="text-sm text-gray-500">Inactive modes won't be available to users</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="min-w-32"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Update Mode
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('admin.ai-modes.index'))}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
