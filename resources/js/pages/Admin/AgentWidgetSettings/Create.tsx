// @/Pages/Admin/AgentWidgetSettings/Create.tsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Code, Settings, Smartphone, Monitor, Globe } from 'lucide-react';

const Create = ({ agents, injectionMethods, triggerMethods }) => {
    const { data, setData, errors, processing, post } = useForm({
        agent_id: '',
        widget_script_url: 'https://cdn.kwati.ai/widget/v1/script.js',
        injection_method: 'auto_inject',
        auto_inject_selector: 'body',
        trigger_method: 'click',
        trigger_delay_seconds: 0,
        show_on_mobile: true,
        show_on_desktop: true,
        language_detection: true,
        geolocation_enabled: false,
        custom_css: '',
        custom_js: '',
        widget_config: {},
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.agent-widget-settings.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Widget Settings" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.agent-widget-settings.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create Widget Settings</h1>
                            <p className="text-muted-foreground">
                                Configure how the AI agent widget appears on websites
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="basic" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="basic">
                                <Settings className="h-4 w-4 mr-2" />
                                Basic Settings
                            </TabsTrigger>
                            <TabsTrigger value="injection">
                                <Code className="h-4 w-4 mr-2" />
                                Injection
                            </TabsTrigger>
                            <TabsTrigger value="advanced">
                                <Settings className="h-4 w-4 mr-2" />
                                Advanced
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Settings Tab */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Widget Configuration</CardTitle>
                                    <CardDescription>
                                        Select agent and basic widget settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="agent_id">Agent *</Label>
                                        <Select
                                            value={data.agent_id}
                                            onValueChange={(value) => setData('agent_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an agent" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {agents.map((agent) => (
                                                    <SelectItem key={agent.id} value={agent.id.toString()}>
                                                        {agent.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.agent_id && <p className="text-sm text-red-500">{errors.agent_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="widget_script_url">Widget Script URL</Label>
                                        <Input
                                            id="widget_script_url"
                                            value={data.widget_script_url}
                                            onChange={(e) => setData('widget_script_url', e.target.value)}
                                            placeholder="https://cdn.kwati.ai/widget/v1/script.js"
                                            type="url"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            URL to the widget JavaScript file
                                        </p>
                                        {errors.widget_script_url && (
                                            <p className="text-sm text-red-500">{errors.widget_script_url}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="trigger_method">Trigger Method *</Label>
                                            <Select
                                                value={data.trigger_method}
                                                onValueChange={(value) => setData('trigger_method', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {triggerMethods.map((method) => (
                                                        <SelectItem key={method} value={method}>
                                                            {method.split('_').map(word =>
                                                                word.charAt(0).toUpperCase() + word.slice(1)
                                                            ).join(' ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.trigger_method && (
                                                <p className="text-sm text-red-500">{errors.trigger_method}</p>
                                            )}
                                        </div>

                                        {data.trigger_method === 'delay' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="trigger_delay_seconds">Delay (seconds)</Label>
                                                <Input
                                                    id="trigger_delay_seconds"
                                                    type="number"
                                                    min="0"
                                                    max="60"
                                                    value={data.trigger_delay_seconds}
                                                    onChange={(e) => setData('trigger_delay_seconds', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Device Support</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <Label htmlFor="show_on_mobile" className="font-normal">
                                                            Show on Mobile
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            Display widget on mobile devices
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    id="show_on_mobile"
                                                    checked={data.show_on_mobile}
                                                    onCheckedChange={(checked) => setData('show_on_mobile', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Monitor className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <Label htmlFor="show_on_desktop" className="font-normal">
                                                            Show on Desktop
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            Display widget on desktop devices
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    id="show_on_desktop"
                                                    checked={data.show_on_desktop}
                                                    onCheckedChange={(checked) => setData('show_on_desktop', checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Injection Tab */}
                        <TabsContent value="injection" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Injection Settings</CardTitle>
                                    <CardDescription>
                                        Configure how the widget is injected into websites
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="injection_method">Injection Method *</Label>
                                        <Select
                                            value={data.injection_method}
                                            onValueChange={(value) => setData('injection_method', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {injectionMethods.map((method) => (
                                                    <SelectItem key={method} value={method}>
                                                        {method.split('_').map(word =>
                                                            word.charAt(0).toUpperCase() + word.slice(1)
                                                        ).join(' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.injection_method && (
                                            <p className="text-sm text-red-500">{errors.injection_method}</p>
                                        )}
                                    </div>

                                    {data.injection_method === 'auto_inject' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="auto_inject_selector">Auto Inject Selector</Label>
                                            <Input
                                                id="auto_inject_selector"
                                                value={data.auto_inject_selector}
                                                onChange={(e) => setData('auto_inject_selector', e.target.value)}
                                                placeholder="body, #container, .widget-area"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                CSS selector where widget should be auto-injected
                                            </p>
                                            {errors.auto_inject_selector && (
                                                <p className="text-sm text-red-500">{errors.auto_inject_selector}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <Label>Advanced Features</Label>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label htmlFor="language_detection" className="font-normal">
                                                        Language Detection
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Automatically detect user's language
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="language_detection"
                                                    checked={data.language_detection}
                                                    onCheckedChange={(checked) => setData('language_detection', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label htmlFor="geolocation_enabled" className="font-normal">
                                                        Geolocation
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Enable location-based features
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="geolocation_enabled"
                                                    checked={data.geolocation_enabled}
                                                    onCheckedChange={(checked) => setData('geolocation_enabled', checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Advanced Tab */}
                        <TabsContent value="advanced" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Advanced Customization</CardTitle>
                                    <CardDescription>
                                        Custom CSS, JavaScript, and widget configuration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="custom_css">Custom CSS</Label>
                                        <Textarea
                                            id="custom_css"
                                            value={data.custom_css}
                                            onChange={(e) => setData('custom_css', e.target.value)}
                                            placeholder=".kwati-widget { /* custom styles */ }"
                                            rows={4}
                                            className="font-mono text-sm"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Custom CSS to style the widget
                                        </p>
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
                                        <p className="text-xs text-muted-foreground">
                                            Custom JavaScript for widget behavior
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="widget_config">Widget Configuration (JSON)</Label>
                                        <Textarea
                                            id="widget_config"
                                            value={JSON.stringify(data.widget_config, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    setData('widget_config', JSON.parse(e.target.value));
                                                } catch (e) {
                                                    // Invalid JSON, keep as is
                                                }
                                            }}
                                            placeholder='{"theme": "dark", "position": "bottom-right"}'
                                            rows={4}
                                            className="font-mono text-sm"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Advanced widget configuration in JSON format
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.agent-widget-settings.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Widget Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default Create;
