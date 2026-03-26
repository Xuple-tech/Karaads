import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const Edit = ({ apiKey, agents, permissionOptions }) => {
    const { data, setData, put, errors, processing } = useForm({
        name: apiKey.name,
        expires_at: apiKey.expires_at,
        permissions: apiKey.permissions || [],
        is_active: apiKey.is_active,
    });

    const [selectedPermissions, setSelectedPermissions] = useState(apiKey.permissions || []);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.agent-api-keys.update', apiKey.id));
    };

    const handlePermissionChange = (permission) => {
        const newPermissions = selectedPermissions.includes(permission)
            ? selectedPermissions.filter(p => p !== permission)
            : [...selectedPermissions, permission];

        setSelectedPermissions(newPermissions);
        setData('permissions', newPermissions);
    };

    useEffect(() => {
        if (data.permissions.length > 0) {
            setSelectedPermissions(data.permissions);
        }
    }, [data.permissions]);

    return (
        <AdminLayout>
            <Head title={`Edit API Key - ${apiKey.name}`} />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit API Key</h1>
                    <p className="text-muted-foreground">
                        Update the configuration for {apiKey.name}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>API Key Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="agent">Agent</Label>
                                <Input
                                    id="agent"
                                    value={apiKey.agent?.name || 'N/A'}
                                    disabled
                                    className="bg-gray-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Key Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter a name for this API key"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expires_at">Expiration Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !data.expires_at && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {data.expires_at ? new Date(data.expires_at).toLocaleDateString() : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={data.expires_at ? new Date(data.expires_at) : undefined}
                                            onSelect={(date) => setData('expires_at', date ? date.toISOString().split('T')[0] : '')}
                                            initialFocus
                                            min={new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.expires_at && <p className="text-sm text-red-600">{errors.expires_at}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.entries(permissionOptions).map(([key, label]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={key}
                                                checked={selectedPermissions.includes(key)}
                                                onCheckedChange={() => handlePermissionChange(key)}
                                            />
                                            <Label htmlFor={key}>{label}</Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.permissions && <p className="text-sm text-red-600">{errors.permissions}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="is_active">Active</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <span>Keep this API key active</span>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button variant="outline" asChild>
                                    <a href={route('admin.agent-api-keys.index')}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update API Key'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Edit;
