import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeft } from 'lucide-react';

interface Plan {
    id?: string;
    name: string;
    slug: string;
    description: string;
    monthly_price: number;
    yearly_price?: number;
    requests_per_day?: number;
    requests_per_month?: number;
    tokens_per_day?: number;
    tokens_per_month?: number;
    features?: string[];
    supports_api: boolean;
    supports_voice: boolean;
    supports_email_automation: boolean;
    supports_projects: boolean;
    priority_support: boolean;
    is_active: boolean;
    display_order: number;
    images_per_day:number;
    images_per_month:number;
}

interface PlanFormProps {
    plan?: Plan;
    isEditing?: boolean;
}

export default function PlanForm({ plan, isEditing = false }: PlanFormProps) {
    const [featureInput, setFeatureInput] = useState('');
    const [features, setFeatures] = useState<string[]>(plan?.features || []);

    const form = useForm({
        name: plan?.name || '',
        slug: plan?.slug || '',
        description: plan?.description || '',
        monthly_price: plan?.monthly_price || 0,
        yearly_price: plan?.yearly_price || null,
        requests_per_day: plan?.requests_per_day || null,
        requests_per_month: plan?.requests_per_month || null,
        tokens_per_day: plan?.tokens_per_day || null,
        tokens_per_month: plan?.tokens_per_month || null,
        features,
        supports_api: plan?.supports_api || false,
        supports_voice: plan?.supports_voice || false,
        supports_email_automation: plan?.supports_email_automation || false,
        supports_projects: plan?.supports_projects || false,
        priority_support: plan?.priority_support || false,
        is_active: plan?.is_active !== false,
        display_order: plan?.display_order || 0,
        images_per_day: plan?.images_per_day,
        images_per_month: plan?.images_per_month,

    });

    const addFeature = () => {
        if (featureInput.trim()) {
            setFeatures([...features, featureInput.trim()]);
            setFeatureInput('');
            form.setData('features', [...features, featureInput.trim()]);
        }
    };

    const removeFeature = (index: number) => {
        const newFeatures = features.filter((_, i) => i !== index);
        setFeatures(newFeatures);
        form.setData('features', newFeatures);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...form.data,
            features,
        };

        if (isEditing && plan?.id) {
            router.put(`/admin/subscriptions/plans/${plan.id}`, data);
        } else {
            router.post('/admin/subscriptions/plans', data);
        }
    };

    return (
        <AdminLayout>
            <Head title={isEditing ? 'Edit Plan' : 'Create Plan'} />
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit('/admin/subscriptions/plans')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing ? 'Edit Plan' : 'Create New Plan'}
                        </h1>
                    </div>
                </div>

                {/* Form */}
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="name">Plan Name *</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="e.g., Premium"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="slug">Slug *</Label>
                                    <Input
                                        id="slug"
                                        value={form.data.slug}
                                        onChange={(e) => form.setData('slug', e.target.value.toLowerCase())}
                                        placeholder="e.g., premium"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Lowercase, no spaces</p>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        placeholder="Plan description"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="monthly_price">Monthly Price ($) *</Label>
                                    <Input
                                        id="monthly_price"
                                        type="number"
                                        step="0.01"
                                        value={form.data.monthly_price}
                                        onChange={(e) => form.setData('monthly_price', parseFloat(e.target.value))}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="yearly_price">Yearly Price ($)</Label>
                                    <Input
                                        id="yearly_price"
                                        type="number"
                                        step="0.01"
                                        value={form.data.yearly_price || ''}
                                        onChange={(e) =>
                                            form.setData('yearly_price', e.target.value ? parseFloat(e.target.value) : null)
                                        }
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Usage Limits */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Usage Limits</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="requests_per_day">Requests per Day</Label>
                                    <Input
                                        id="requests_per_day"
                                        type="number"
                                        value={form.data.requests_per_day || ''}
                                        onChange={(e) =>
                                            form.setData(
                                                'requests_per_day',
                                                e.target.value ? parseInt(e.target.value) : null
                                            )
                                        }
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="requests_per_month">Requests per Month</Label>
                                    <Input
                                        id="requests_per_month"
                                        type="number"
                                        value={form.data.requests_per_month || ''}
                                        onChange={(e) =>
                                            form.setData(
                                                'requests_per_month',
                                                e.target.value ? parseInt(e.target.value) : null
                                            )
                                        }
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
                                 <div>
                                    <Label htmlFor="images_per_day">Images Per Day</Label>
                                    <Input
                                        id="images_per_day"
                                        type="number"
                                        value={form.data.images_per_day || ''}
                                        onChange={(e) =>
                                            form.setData(
                                                'images_per_day',
                                                e.target.value ? parseInt(e.target.value) : null
                                            )
                                        }
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="images_per_month">Images Per Month</Label>
                                    <Input
                                        id="images_per_month"
                                        type="number"
                                        value={form.data.images_per_month || ''}
                                        onChange={(e) =>
                                            form.setData(
                                                'images_per_month',
                                                e.target.value ? parseInt(e.target.value) : null
                                            )
                                        }
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tokens_per_day">Tokens per Day</Label>
                                    <Input
                                        id="tokens_per_day"
                                        type="number"
                                        value={form.data.tokens_per_day || ''}
                                        onChange={(e) =>
                                            form.setData(
                                                'tokens_per_day',
                                                e.target.value ? parseInt(e.target.value) : null
                                            )
                                        }
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tokens_per_month">Tokens per Month</Label>
                                    <Input
                                        id="tokens_per_month"
                                        type="number"
                                        value={form.data.tokens_per_month || ''}
                                        onChange={(e) =>
                                            form.setData(
                                                'tokens_per_month',
                                                e.target.value ? parseInt(e.target.value) : null
                                            )
                                        }
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Features</h2>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={featureInput}
                                        onChange={(e) => setFeatureInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                        placeholder="Add a feature..."
                                    />
                                    <Button type="button" onClick={addFeature} variant="outline">
                                        Add
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded"
                                        >
                                            <span>{feature}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFeature(index)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Capabilities */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Capabilities</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="supports_api"
                                        checked={form.data.supports_api}
                                        onCheckedChange={(checked) => form.setData('supports_api', checked as boolean)}
                                    />
                                    <Label htmlFor="supports_api" className="cursor-pointer">
                                        API Support
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="supports_voice"
                                        checked={form.data.supports_voice}
                                        onCheckedChange={(checked) => form.setData('supports_voice', checked as boolean)}
                                    />
                                    <Label htmlFor="supports_voice" className="cursor-pointer">
                                        Voice Support
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="supports_email_automation"
                                        checked={form.data.supports_email_automation}
                                        onCheckedChange={(checked) =>
                                            form.setData('supports_email_automation', checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="supports_email_automation" className="cursor-pointer">
                                        Email Automation
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="supports_projects"
                                        checked={form.data.supports_projects}
                                        onCheckedChange={(checked) => form.setData('supports_projects', checked as boolean)}
                                    />
                                    <Label htmlFor="supports_projects" className="cursor-pointer">
                                        Projects Support
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="priority_support"
                                        checked={form.data.priority_support}
                                        onCheckedChange={(checked) => form.setData('priority_support', checked as boolean)}
                                    />
                                    <Label htmlFor="priority_support" className="cursor-pointer">
                                        Priority Support
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Status</h2>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) => form.setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active (visible to users)
                                </Label>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {form.processing ? 'Saving...' : isEditing ? 'Update Plan' : 'Create Plan'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/admin/subscriptions/plans')}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AdminLayout>
    );
}
