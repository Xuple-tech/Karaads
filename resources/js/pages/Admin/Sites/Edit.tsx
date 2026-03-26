// @/Pages/Admin/Sites/Edit.tsx
import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Globe, Palette, Settings, Trash2 } from 'lucide-react';

const Edit = ({ site, users, siteTypes, industries, timezones }) => {
    const { data, setData, errors, processing, put, delete: destroy } = useForm({
        user_id: site.user_id || '',
        name: site.name || '',
        domain: site.domain || '',
        subdomain: site.subdomain || '',
        url: site.url || 'https://',
        site_type: site.site_type || 'website',
        industry: site.industry || '',
        description: site.description || '',
        logo_url: site.logo_url || '',
        favicon_url: site.favicon_url || '',
        primary_color: site.primary_color || '#3B82F6',
        secondary_color: site.secondary_color || '#10B981',
        language: site.language || 'en',
        timezone: site.timezone || 'UTC',
        is_active: site.is_active || true,
        widget_enabled: site.widget_enabled || true,
        max_agents: site.max_agents || 3,
        site_settings: site.site_settings || {},
        metadata: site.metadata || {},
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.sites.update', site.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this site?')) {
            destroy(route('admin.sites.destroy', site.id));
        }
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${site.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.sites.show', site.id)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Site
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Site</h1>
                            <p className="text-muted-foreground">
                                Update settings and configuration for {site.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="basic" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="basic">
                                <Globe className="h-4 w-4 mr-2" />
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger value="appearance">
                                <Palette className="h-4 w-4 mr-2" />
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger value="settings">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Info Tab */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Site Information</CardTitle>
                                    <CardDescription>
                                        Update the basic details of the site
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Site Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="My Awesome Website"
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="user_id">Owner *</Label>
                                            <Select
                                                value={data.user_id?.toString()}
                                                onValueChange={(value) => setData('user_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an owner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id.toString()}>
                                                            {user.name} ({user.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.user_id && <p className="text-sm text-red-500">{errors.user_id}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="domain">Domain *</Label>
                                            <Input
                                                id="domain"
                                                value={data.domain}
                                                onChange={(e) => setData('domain', e.target.value)}
                                                placeholder="example.com"
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Main domain of your site
                                            </p>
                                            {errors.domain && <p className="text-sm text-red-500">{errors.domain}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subdomain">Subdomain (Optional)</Label>
                                            <Input
                                                id="subdomain"
                                                value={data.subdomain}
                                                onChange={(e) => setData('subdomain', e.target.value)}
                                                placeholder="chat"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                For custom subdomain installation
                                            </p>
                                            {errors.subdomain && <p className="text-sm text-red-500">{errors.subdomain}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="url">Site URL *</Label>
                                        <Input
                                            id="url"
                                            value={data.url}
                                            onChange={(e) => setData('url', e.target.value)}
                                            placeholder="https://example.com"
                                            type="url"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Full URL of your website
                                        </p>
                                        {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe your website or business..."
                                            rows={3}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="site_type">Site Type *</Label>
                                            <Select
                                                value={data.site_type}
                                                onValueChange={(value) => setData('site_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {siteTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type.split('_').map(word =>
                                                                word.charAt(0).toUpperCase() + word.slice(1)
                                                            ).join(' ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.site_type && (
                                                <p className="text-sm text-red-500">{errors.site_type}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="industry">Industry (Optional)</Label>
                                            <Select
                                                value={data.industry}
                                                onValueChange={(value) => setData('industry', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select industry" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Not specified</SelectItem>
                                                    {industries.map((industry) => (
                                                        <SelectItem key={industry} value={industry}>
                                                            {industry.split('_').map(word =>
                                                                word.charAt(0).toUpperCase() + word.slice(1)
                                                            ).join(' ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Appearance Tab */}
                        <TabsContent value="appearance" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Appearance Settings</CardTitle>
                                    <CardDescription>
                                        Customize the visual identity of the site
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="logo_url">Logo URL</Label>
                                            <Input
                                                id="logo_url"
                                                value={data.logo_url}
                                                onChange={(e) => setData('logo_url', e.target.value)}
                                                placeholder="https://example.com/logo.png"
                                                type="url"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                URL to your site's logo
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="favicon_url">Favicon URL</Label>
                                            <Input
                                                id="favicon_url"
                                                value={data.favicon_url}
                                                onChange={(e) => setData('favicon_url', e.target.value)}
                                                placeholder="https://example.com/favicon.ico"
                                                type="url"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                URL to your site's favicon
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="primary_color">Primary Color</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="primary_color"
                                                    type="color"
                                                    value={data.primary_color}
                                                    onChange={(e) => setData('primary_color', e.target.value)}
                                                    className="w-16 h-10 p-1"
                                                />
                                                <Input
                                                    value={data.primary_color}
                                                    onChange={(e) => setData('primary_color', e.target.value)}
                                                    placeholder="#3B82F6"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Used for widget primary color
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="secondary_color">Secondary Color</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id="secondary_color"
                                                    type="color"
                                                    value={data.secondary_color}
                                                    onChange={(e) => setData('secondary_color', e.target.value)}
                                                    className="w-16 h-10 p-1"
                                                />
                                                <Input
                                                    value={data.secondary_color}
                                                    onChange={(e) => setData('secondary_color', e.target.value)}
                                                    placeholder="#10B981"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Used for widget secondary color
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Site Settings</CardTitle>
                                    <CardDescription>
                                        Configure site preferences and limits
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="language">Default Language</Label>
                                            <Select
                                                value={data.language}
                                                onValueChange={(value) => setData('language', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="es">Spanish</SelectItem>
                                                    <SelectItem value="fr">French</SelectItem>
                                                    <SelectItem value="de">German</SelectItem>
                                                    <SelectItem value="it">Italian</SelectItem>
                                                    <SelectItem value="pt">Portuguese</SelectItem>
                                                    <SelectItem value="ja">Japanese</SelectItem>
                                                    <SelectItem value="ko">Korean</SelectItem>
                                                    <SelectItem value="zh">Chinese</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">Timezone</Label>
                                            <Select
                                                value={data.timezone}
                                                onValueChange={(value) => setData('timezone', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    {timezones.map((tz) => (
                                                        <SelectItem key={tz} value={tz}>
                                                            {tz}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="max_agents">Maximum Agents</Label>
                                            <Input
                                                id="max_agents"
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={data.max_agents}
                                                onChange={(e) => setData('max_agents', parseInt(e.target.value))}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Maximum number of agents allowed on this site
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Features</Label>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label htmlFor="is_active" className="font-normal">
                                                        Site Active
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Enable or disable the site
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="is_active"
                                                    checked={data.is_active}
                                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label htmlFor="widget_enabled" className="font-normal">
                                                        Widget Enabled
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Allow widget installation on this site
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="widget_enabled"
                                                    checked={data.widget_enabled}
                                                    onCheckedChange={(checked) => setData('widget_enabled', checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.sites.show', site.id)}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default Edit;
