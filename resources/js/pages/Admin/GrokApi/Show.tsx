import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit2, TestTube, CheckCircle, XCircle, Calendar, Hash } from 'lucide-react';
import { router } from '@inertiajs/react';
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
    created_at: string;
    updated_at: string;
    last_tested_at: string | null;
    test_status: string | null;
    test_error: string | null;
}

interface Props {
    config: GrokConfig;
}

export default function Show({ config }: Props) {
    const [testing, setTesting] = useState(false);

    const handleTestConnection = async () => {
        setTesting(true);

        try {
            await router.post(route('admin.grok-api.test', config.id), {}, {
                onSuccess: (response) => {
                    if (response.props?.success) {
                        toast.success('API connection test successful');
                        // Reload to show updated test status
                        window.location.reload();
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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const maskApiKey = (key: string) => {
        if (key.length <= 8) return key;
        return key.substring(0, 4) + '...' + key.substring(key.length - 4);
    };

    const getTestStatusBadge = () => {
        if (!config.last_tested_at) {
            return <Badge className="bg-gray-100 text-gray-800">Not Tested</Badge>;
        }

        if (config.test_status === 'success') {
            return <Badge className="bg-green-100 text-green-800">Success</Badge>;
        } else if (config.test_status === 'failed') {
            return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
        }

        return <Badge className="bg-yellow-100 text-yellow-800">Unknown</Badge>;
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(route('admin.grok-api.index'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Grok API
                    </Button>
                    <div className="flex gap-2">
                        <Button onClick={handleTestConnection} disabled={testing}>
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
                        <Button onClick={() => router.visit(route('admin.grok-api.edit', config.id))}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Config
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{config.name}</h1>
                        <p className="text-gray-500 mt-1">Grok API Configuration</p>
                    </div>
                    <Badge className={config.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {getTestStatusBadge()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Hash className="w-5 h-5 text-gray-500" />
                                <div>
                                    <div className="text-sm text-gray-500">Config ID</div>
                                    <div className="font-medium">{config.id}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                                    🤖
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Model</div>
                                    <div className="font-medium">{config.model}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <div>
                                    <div className="text-sm text-gray-500">Created</div>
                                    <div className="font-medium">{formatDate(config.created_at)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>API Configuration</CardTitle>
                        <CardDescription>
                            Technical details for the Grok API integration
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label className="text-sm text-gray-500">API Key</Label>
                                <div className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">
                                    {maskApiKey(config.api_key)}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">Base URL</Label>
                                <div className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">
                                    {config.base_url}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">Model</Label>
                                <div className="font-medium mt-1">{config.model}</div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">Max Tokens</Label>
                                <div className="font-medium mt-1">{config.max_tokens.toLocaleString()}</div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">Temperature</Label>
                                <div className="font-medium mt-1">{config.temperature}</div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">Status</Label>
                                <div className="mt-1">
                                    <Badge className={config.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                        {config.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Test Results</CardTitle>
                        <CardDescription>
                            Last API connection test status and details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-sm text-gray-500">Last Tested</Label>
                                    <div className="font-medium mt-1">{formatDate(config.last_tested_at)}</div>
                                </div>
                                <div>
                                    <Label className="text-sm text-gray-500">Test Status</Label>
                                    <div className="mt-1">{getTestStatusBadge()}</div>
                                </div>
                                <div>
                                    <Label className="text-sm text-gray-500">Test Result</Label>
                                    <div className="mt-1">
                                        {config.test_status === 'success' ? (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Success</span>
                                            </div>
                                        ) : config.test_status === 'failed' ? (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <XCircle className="w-4 h-4" />
                                                <span>Failed</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">Not tested</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {config.test_error && (
                                <div>
                                    <Label className="text-sm text-gray-500">Error Details</Label>
                                    <div className="bg-red-50 border border-red-200 rounded p-3 mt-1">
                                        <pre className="text-sm text-red-800 whitespace-pre-wrap">
                                            {config.test_error}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-gray-500">Created At</Label>
                                <div className="font-medium mt-1">{formatDate(config.created_at)}</div>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500">Last Updated</Label>
                                <div className="font-medium mt-1">{formatDate(config.updated_at)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
