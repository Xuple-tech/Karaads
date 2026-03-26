import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Plus, Key, Settings } from 'lucide-react';

interface GrokConfig {
    id: string;
    api_key: string;
    model: string;
    is_active: boolean;
    rate_limit: number;
    last_verified_at: string | null;
    created_by: { name: string };
}

interface GrokApiIndexProps {
    configs: {
        data: GrokConfig[];
        current_page: number;
        last_page: number;
    };
}

export default function GrokApiIndex({ configs }: GrokApiIndexProps) {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Grok API Management</h1>
                        <p className="text-gray-500 mt-1">Manage Grok API keys and configurations</p>
                    </div>
                    <Link href={route('admin.grok-api.create')}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add API Key
                        </Button>
                    </Link>
                </div>

                {configs.data.length === 0 ? (
                    <Card>
                        <CardContent className="pt-12">
                            <div className="text-center">
                                <Key className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium mb-2">No API Keys</h3>
                                <p className="text-gray-500 mb-4">Configure your first Grok API key to get started</p>
                                <Link href={route('admin.grok-api.create')}>
                                    <Button>Add First API Key</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {configs.data.map((config) => (
                            <Card key={config.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {config.model}
                                                {config.is_active ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Inactive</span>
                                                )}
                                            </CardTitle>
                                            <CardDescription>Created by {config.created_by.name}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={route('admin.grok-api.edit', config.id)}>
                                                <Button size="sm" variant="outline">
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.grok-api.show', config.id)}>
                                                <Button size="sm">View Details</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Rate Limit</p>
                                            <p className="font-semibold">{config.rate_limit.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <p className="font-semibold">{config.is_active ? '✓ Active' : '✗ Inactive'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Last Verified</p>
                                            <p className="font-semibold text-sm">
                                                {config.last_verified_at
                                                    ? new Date(config.last_verified_at).toLocaleDateString()
                                                    : 'Never'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Key (masked)</p>
                                            <p className="font-mono text-sm">****...{config.api_key?.slice(-4)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
