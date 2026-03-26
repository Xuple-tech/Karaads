// @/Pages/Admin/AIAgents/Edit.tsx
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
import { ArrowLeft, Save, Bot, Palette, Globe, Code, Settings, Trash2 } from 'lucide-react';

const Edit = ({ agent, users, sites, templates, agentTypes, widgetPositions, languages }) => {
    const { data, setData, errors, processing, put, delete: destroy } = useForm({
        user_id: agent.user_id || '',
        site_id: agent.site_id || '',
        name: agent.name || '',
        slug: agent.slug || '',
        description: agent.description || '',
        agent_type: agent.agent_type || 'widget',
        behavior_profile: agent.behavior_profile || '',
        welcome_message: agent.welcome_message || '',
        primary_color: agent.primary_color || '#3B82F6',
        secondary_color: agent.secondary_color || '#10B981',
        logo_url: agent.logo_url || '',
        is_active: agent.is_active || true,
        max_context_length: agent.max_context_length || 4000,
        response_temperature: agent.response_temperature || 0.7,
        knowledge_base_enabled: agent.knowledge_base_enabled || false,
        web_search_enabled: agent.web_search_enabled || false,
        file_upload_enabled: agent.file_upload_enabled || false,
        voice_enabled: agent.voice_enabled || false,
        default_language: agent.default_language || 'en',
        supported_languages: agent.supported_languages || ['en'],
        working_hours: agent.working_hours || {},
        offline_message: agent.offline_message || 'Sorry, I am currently offline. Please try again during working hours.',
        widget_position: agent.widget_position || 'bottom-right',
        widget_icon: agent.widget_icon || 'message-circle',
        template_id: agent.template_id || '',
        custom_css: agent.custom_css || '',
        custom_js: agent.custom_js || '',
        metadata: agent.metadata || {},
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.ai-agents.update', agent.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this agent?')) {
            destroy(route('admin.ai-agents.destroy', agent.id));
        }
    };

    const generateSlug = () => {
        if (data.name) {
            setData('slug', data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${agent.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.ai-agents.show', agent.id)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Agent
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit AI Agent</h1>
                            <p className="text-muted-foreground">
                                Update settings and configuration for {agent.name}
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
                                <Bot className="h-4 w-4 mr-2" />
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger value="appearance">
                                <Palette className="h-4 w-4 mr-2" />
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger value="behavior">
                                <Settings className="h-4 w-4 mr-2" />
                                Behavior
                            </TabsTrigger>
                            <TabsTrigger value="advanced">
                                <Code className="h-4 w-4 mr-2" />
                                Advanced
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Info Tab */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Update the basic details of your AI agent
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Agent Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Customer Support Assistant"
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="slug">
                                                URL Slug *
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-2"
                                                    onClick={generateSlug}
                                                >
                                                    Generate
                                                </Button>
                                            </Label>
                                            <Input
                                                id="slug"
                                                value={data.slug}
                                                onChange={(e) => setData('slug', e.target.value)}
                                                placeholder="customer-support"
                                                required
                                            />
                                            {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="A helpful assistant for customer support inquiries..."
                                            rows={3}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                        <div className="space-y-2">
                                            <Label htmlFor="site_id">Site (Optional)</Label>
                                            <Select
                                                value={data.site_id?.toString()}
                                                onValueChange={(value) => setData('site_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a site" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem >No Site</SelectItem>
                                                    {sites.map((site) => (
                                                        <SelectItem key={site.id} value={site.id.toString()}>
                                                            {site.name} ({site.domain})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.site_id && <p className="text-sm text-red-500">{errors.site_id}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="agent_type">Agent Type *</Label>
                                            <Select
                                                value={data.agent_type}
                                                onValueChange={(value) => setData('agent_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {agentTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type.split('_').map(word =>
                                                                word.charAt(0).toUpperCase() + word.slice(1)
                                                            ).join(' ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.agent_type && (
                                                <p className="text-sm text-red-500">{errors.agent_type}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="template_id">Template (Optional)</Label>
                                            <Select
                                                value={data.template_id?.toString()}
                                                onValueChange={(value) => setData('template_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a template" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem>No Template</SelectItem>
                                                    {templates.map((template) => (
                                                        <SelectItem key={template.id} value={template.id.toString()}>
                                                            {template.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <Label htmlFor="is_active">Active</Label>
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
                                        Customize the look and feel of your agent
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="logo_url">Logo URL</Label>
                                        <Input
                                            id="logo_url"
                                            value={data.logo_url}
                                            onChange={(e) => setData('logo_url', e.target.value)}
                                            placeholder="https://example.com/logo.png"
                                            type="url"
                                        />
                                    </div>

                                    {data.agent_type === 'widget' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="widget_position">Widget Position</Label>
                                                    <Select
                                                        value={data.widget_position}
                                                        onValueChange={(value) => setData('widget_position', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {widgetPositions.map((position) => (
                                                                <SelectItem key={position} value={position}>
                                                                    {position.split('-').map(word =>
                                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                                    ).join(' ')}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="widget_icon">Widget Icon</Label>
                                                    <Select
                                                        value={data.widget_icon}
                                                        onValueChange={(value) => setData('widget_icon', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="message-circle">Message</SelectItem>
                                                            <SelectItem value="help-circle">Help</SelectItem>
                                                            <SelectItem value="chat">Chat</SelectItem>
                                                            <SelectItem value="robot">Robot</SelectItem>
                                                            <SelectItem value="headphones">Headphones</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Behavior Tab */}
                        <TabsContent value="behavior" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Behavior Settings</CardTitle>
                                    <CardDescription>
                                        Configure how your agent behaves and responds
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="behavior_profile">Behavior Profile</Label>
                                        <Textarea
                                            id="behavior_profile"
                                            value={data.behavior_profile}
                                            onChange={(e) => setData('behavior_profile', e.target.value)}
                                            placeholder="You are a helpful customer support assistant. Be polite, professional, and concise..."
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="welcome_message">Welcome Message</Label>
                                        <Textarea
                                            id="welcome_message"
                                            value={data.welcome_message}
                                            onChange={(e) => setData('welcome_message', e.target.value)}
                                            placeholder="Hello! How can I help you today?"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="max_context_length">Max Context Length</Label>
                                            <Input
                                                id="max_context_length"
                                                type="number"
                                                min="100"
                                                max="8000"
                                                value={data.max_context_length}
                                                onChange={(e) => setData('max_context_length', parseInt(e.target.value))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="response_temperature">
                                                Response Temperature: {data.response_temperature}
                                            </Label>
                                            <Input
                                                id="response_temperature"
                                                type="range"
                                                min="0"
                                                max="2"
                                                step="0.1"
                                                value={data.response_temperature}
                                                onChange={(e) => setData('response_temperature', parseFloat(e.target.value))}
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>More Focused</span>
                                                <span>More Creative</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Capabilities</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="knowledge_base_enabled"
                                                    checked={data.knowledge_base_enabled}
                                                    onCheckedChange={(checked) => setData('knowledge_base_enabled', checked)}
                                                />
                                                <Label htmlFor="knowledge_base_enabled">Knowledge Base</Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="web_search_enabled"
                                                    checked={data.web_search_enabled}
                                                    onCheckedChange={(checked) => setData('web_search_enabled', checked)}
                                                />
                                                <Label htmlFor="web_search_enabled">Web Search</Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="file_upload_enabled"
                                                    checked={data.file_upload_enabled}
                                                    onCheckedChange={(checked) => setData('file_upload_enabled', checked)}
                                                />
                                                <Label htmlFor="file_upload_enabled">File Upload</Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="voice_enabled"
                                                    checked={data.voice_enabled}
                                                    onCheckedChange={(checked) => setData('voice_enabled', checked)}
                                                />
                                                <Label htmlFor="voice_enabled">Voice</Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="default_language">Default Language</Label>
                                            <Select
                                                value={data.default_language}
                                                onValueChange={(value) => setData('default_language', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {languages.map((lang) => (
                                                        <SelectItem key={lang} value={lang}>
                                                            {lang.toUpperCase()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Advanced Tab */}
                        <TabsContent value="advanced" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Advanced Settings</CardTitle>
                                    <CardDescription>
                                        Custom CSS, JavaScript, and other advanced options
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="custom_css">Custom CSS</Label>
                                        <Textarea
                                            id="custom_css"
                                            value={data.custom_css}
                                            onChange={(e) => setData('custom_css', e.target.value)}
                                            placeholder=".chat-widget { /* custom styles */ }"
                                            rows={4}
                                            className="font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="custom_js">Custom JavaScript</Label>
                                        <Textarea
                                            id="custom_js"
                                            value={data.custom_js}
                                            onChange={(e) => setData('custom_js', e.target.value)}
                                            placeholder="// Custom JavaScript logic"
                                            rows={4}
                                            className="font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="offline_message">Offline Message</Label>
                                        <Textarea
                                            id="offline_message"
                                            value={data.offline_message}
                                            onChange={(e) => setData('offline_message', e.target.value)}
                                            placeholder="Sorry, I am currently offline. Please try again during working hours."
                                            rows={2}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.ai-agents.show', agent.id)}>Cancel</Link>
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
