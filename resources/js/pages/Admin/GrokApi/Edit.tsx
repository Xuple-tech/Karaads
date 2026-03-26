import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowLeft, TestTube } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface GrokConfig {
    id: number;
    name: string;
    api_key: string;
    base_url: string;
    model: string;
    max_tokens: number;
    temperature: number;
    is_active: boolean;
}

interface Props {
    config: GrokConfig;
}

const AVAILABLE_MODELS = [
    'grok-4',
    'grok-4-fast-non-reasoning',
    'grok-4-fast-reasoning',
];

export default function Edit({ config }: Props) {
    const [formData, setFormData] = useState({
        name: config.name,
        api_key: config.api_key,
        base_url: config.base_url,
        model: config.model,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        is_active: config.is_active,
    });

    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.api_key || !formData.base_url || !formData.model) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSaving(true);

        try {
            await router.put(route('admin.grok-api.update', config.id), formData, {
                onSuccess: () => {
                    toast.success('Grok API config updated successfully');
                },
                onError: (errors) => {
                    toast.error('Failed to update Grok API config');
                    console.error('Errors:', errors);
                },
                onFinish: () => {
                    setSaving(false);
                }
            });
        } catch (error) {
            console.error('Error updating Grok API config:', error);
            toast.error('Failed to update Grok API config');
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);

        try {
            await router.post(route('admin.grok-api.test', config.id), {}, {
                onSuccess: (response) => {
                    if (response.props?.success) {
                        toast.success('API connection test successful');
                    } else {
                        toast.error('API connection test failed');
                    }
                },
                onError: (errors) => {
                    toast.error('API connection test failed');
                    console.error('Test errors:', errors);
                },
                onFinish: () => {
                    setTesting(false);
                }
            });
        } catch (error) {
            console.error('Error testing API:', error);
            toast.error('Failed to test API connection');
            setTesting(false);
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
                        onClick={() => router.visit(route('admin.grok-api.show', config.id))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Config
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={testing}
                    >
                        {testing ? (
                            <>
                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Testing...
                            </>
                        ) : (
                            <>
                                <TestTube className="w-4 h-4 mr-2" />
                                Test Connection
                            </>
                        )}
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Edit Grok API Config</h1>
                        <p className="text-gray-500 mt-1">Update the Grok API configuration settings</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>API Configuration</CardTitle>
                        <CardDescription>
                            Configure the connection settings for the Grok API
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Configuration Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="e.g., Primary Grok API, Backup API"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api_key">API Key *</Label>
                                <Input
                                    id="api_key"
                                    type="password"
                                    value={formData.api_key}
                                    onChange={(e) => handleInputChange('api_key', e.target.value)}
                                    placeholder="Enter your Grok API key"
                                    required
                                />
                                <p className="text-sm text-gray-500">
                                    Your API key will be encrypted and stored securely
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="base_url">Base URL *</Label>
                                    <Input
                                        id="base_url"
                                        value={formData.base_url}
                                        onChange={(e) => handleInputChange('base_url', e.target.value)}
                                        placeholder="https://api.x.ai/v1"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="model">Model *</Label>
                                    <Select
                                        value={formData.model}
                                        onValueChange={(value) => handleInputChange('model', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AVAILABLE_MODELS.map((model) => (
                                                <SelectItem key={model} value={model}>
                                                    {model}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="max_tokens">Max Tokens</Label>
                                    <Input
                                        id="max_tokens"
                                        type="number"
                                        value={formData.max_tokens}
                                        onChange={(e) => handleInputChange('max_tokens', parseInt(e.target.value) || 4096)}
                                        min="1"
                                        max="32768"
                                    />
                                    <p className="text-sm text-gray-500">Maximum tokens per request (1-32768)</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="temperature">Temperature</Label>
                                    <Input
                                        id="temperature"
                                        type="number"
                                        step="0.1"
                                        value={formData.temperature}
                                        onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value) || 0.7)}
                                        min="0"
                                        max="2"
                                    />
                                    <p className="text-sm text-gray-500">Creativity level (0-2)</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center space-x-2 pt-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                            className="rounded"
                                        />
                                        <span>Active Configuration</span>
                                    </Label>
                                    <p className="text-sm text-gray-500">Inactive configs won't be used</p>
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
                                            Update Config
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('admin.grok-api.show', config.id))}
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
