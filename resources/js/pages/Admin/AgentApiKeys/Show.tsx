import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeyRound, Eye, Edit, Trash2, RotateCcw, ToggleLeft, Calendar, Clock } from 'lucide-react';

const Show = ({ apiKey }) => {
    const handleEdit = () => {
        window.location.href = route('admin.agent-api-keys.edit', apiKey.id);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
            window.location.href = route('admin.agent-api-keys.destroy', {
                agentApiKey: apiKey.id,
                _method: 'DELETE'
            });
        }
    };

    const handleRegenerateKey = () => {
        if (confirm('Are you sure you want to regenerate this API key? The old key will be invalidated.')) {
            window.location.href = route('admin.agent-api-keys.regenerate', apiKey.id);
        }
    };

    const handleRegenerateSecret = () => {
        if (confirm('Are you sure you want to regenerate this secret key? The old secret will be invalidated.')) {
            window.location.href = route('admin.agent-api-keys.regenerate-secret', apiKey.id);
        }
    };

    const handleRevoke = () => {
        if (confirm('Are you sure you want to revoke this API key? It will no longer be usable.')) {
            window.location.href = route('admin.agent-api-keys.revoke', apiKey.id);
        }
    };

    return (
        <AdminLayout>
            <Head title={`API Key - ${apiKey.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            API Key Details
                        </h1>
                        <p className="text-muted-foreground">
                            Details for {apiKey.name}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleRegenerateKey}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Regenerate Key
                        </Button>
                        <Button variant="outline" onClick={handleRegenerateSecret}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Regenerate Secret
                        </Button>
                        <Button variant="outline" onClick={handleRevoke}>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            Revoke
                        </Button>
                        <Button onClick={handleEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <KeyRound className="h-8 w-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant={apiKey.is_active ? 'default' : 'secondary'}>
                                        {apiKey.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Eye className="h-8 w-8 text-green-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Agent</p>
                                    <p className="text-xl font-bold truncate">{apiKey.agent?.name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Calendar className="h-8 w-8 text-purple-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Expires</p>
                                    <p className="text-xl font-bold">
                                        {apiKey.expires_at ? new Date(apiKey.expires_at).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-orange-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Last Used</p>
                                    <p className="text-xl font-bold">
                                        {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Key Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">Name</h3>
                                <p className="text-muted-foreground mt-1">{apiKey.name}</p>
                            </div>

                            <div>
                                <h3 className="font-medium">API Key</h3>
                                <div className="bg-accent truncate p-3 flex-nowrap flex-col rounded mt-1 font-mono text-sm">
                                    {apiKey.api_key}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="ml-2 h-6 text-xs"
                                        onClick={() => navigator.clipboard.writeText(apiKey.api_key)}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium">Secret Key</h3>
                                <div className="bg-accent truncate flex flex-nowrap flex-col p-3 rounded mt-1 font-mono text-sm">
                                    {apiKey.secret_key}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="ml-2 h-6 text-xs"
                                        onClick={() => navigator.clipboard.writeText(apiKey.secret_key)}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium">Created At</h3>
                                <p className="text-muted-foreground mt-1">
                                    {new Date(apiKey.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Updated At</h3>
                                <p className="text-muted-foreground mt-1">
                                    {new Date(apiKey.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {apiKey.permissions && apiKey.permissions.length > 0 ? (
                                apiKey.permissions.map((permission, index) => (
                                    <Badge key={index} variant="outline" className="mr-2 mb-1">
                                        {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No specific permissions granted</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Usage Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-800">Last Used</h4>
                                <p className="text-2xl font-bold text-blue-900">
                                    {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : 'Never'}
                                </p>
                                <p className="text-sm text-blue-600">Last API call</p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-green-800">Uses</h4>
                                <p className="text-2xl font-bold text-green-900">
                                    {apiKey.usage_count || 0}
                                </p>
                                <p className="text-sm text-green-600">Total API calls</p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="font-medium text-purple-800">Expiration</h4>
                                <p className="text-2xl font-bold text-purple-900">
                                    {apiKey.expires_at ? new Date(apiKey.expires_at).toLocaleDateString() : 'Never'}
                                </p>
                                <p className="text-sm text-purple-600">Key validity</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Security Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={handleRegenerateKey}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Regenerate API Key
                            </Button>
                            <Button variant="outline" onClick={handleRegenerateSecret}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Regenerate Secret Key
                            </Button>
                            <Button variant="outline" onClick={handleRevoke}>
                                <ToggleLeft className="h-4 w-4 mr-2" />
                                Revoke Key
                            </Button>
                            <Button variant="outline" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Key
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Show;
