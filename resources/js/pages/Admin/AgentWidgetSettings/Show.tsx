// @/Pages/Admin/AgentWidgetSettings/Show.tsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Code,
    Eye,
    Settings,
    Bot,
    Smartphone,
    Monitor,
    Globe,
    Clock,
    Calendar,
    CheckCircle,
    XCircle
} from 'lucide-react';

const Show = ({ widgetSetting }) => {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete these widget settings?')) {
            router.delete(route('admin.agent-widget-settings.destroy', widgetSetting.id));
        }
    };

    const handleGetScript = () => {
        window.open(route('admin.agent-widget-settings.script', widgetSetting.id), '_blank');
    };

    const handlePreview = () => {
        router.visit(route('admin.agent-widget-settings.preview', widgetSetting.id));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Head title={`${widgetSetting.agent?.name} - Widget Settings`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.agent-widget-settings.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-3xl font-bold tracking-tight">{widgetSetting.agent?.name} Widget Settings</h1>
                                <Badge variant="outline">
                                    {widgetSetting.injection_method.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </Badge>
                                <Badge variant="outline">
                                    {widgetSetting.trigger_method.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                Configuration for embedding the AI agent widget
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handlePreview}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleGetScript}>
                            <Code className="h-4 w-4 mr-2" />
                            Get Script
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('admin.agent-widget-settings.edit', widgetSetting.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Agent & Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Agent Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Agent Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Bot className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{widgetSetting.agent?.name}</p>
                                        <p className="text-sm text-muted-foreground">Assigned Agent</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <Link href={route('admin.ai-agents.show', widgetSetting.agent_id)}>
                                        View Agent Details
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Widget Script */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Widget Script</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Script URL</h4>
                                    <a
                                        href={widgetSetting.widget_script_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm truncate block"
                                    >
                                        {widgetSetting.widget_script_url}
                                    </a>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleGetScript} className="w-full">
                                    <Code className="h-4 w-4 mr-2" />
                                    Get Embed Code
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span className="text-sm">{formatDate(widgetSetting.created_at)}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span className="text-sm">{formatDate(widgetSetting.updated_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Configuration */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Injection & Trigger Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Injection & Trigger Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Injection Method</h4>
                                            <Badge variant="outline" className="mt-1">
                                                {widgetSetting.injection_method.split('_').map(word =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </Badge>
                                            {widgetSetting.injection_method === 'auto_inject' && widgetSetting.auto_inject_selector && (
                                                <p className="text-sm mt-2">
                                                    Selector: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{widgetSetting.auto_inject_selector}</code>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Trigger Method</h4>
                                            <Badge variant="outline" className="mt-1">
                                                {widgetSetting.trigger_method.split('_').map(word =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </Badge>
                                            {widgetSetting.trigger_method === 'delay' && (
                                                <div className="flex items-center mt-2">
                                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                                    <span className="text-sm">Delay: {widgetSetting.trigger_delay_seconds} seconds</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Device Support</h4>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <div className="flex items-center space-x-1">
                                                    <Smartphone className={`h-5 w-5 ${widgetSetting.show_on_mobile ? 'text-green-500' : 'text-gray-300'}`} />
                                                    <span className="text-sm">Mobile</span>
                                                    {widgetSetting.show_on_mobile ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Monitor className={`h-5 w-5 ${widgetSetting.show_on_desktop ? 'text-green-500' : 'text-gray-300'}`} />
                                                    <span className="text-sm">Desktop</span>
                                                    {widgetSetting.show_on_desktop ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-gray-300" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Advanced Features</h4>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <div className="flex items-center space-x-1">
                                                    <Globe className={`h-5 w-5 ${widgetSetting.language_detection ? 'text-green-500' : 'text-gray-300'}`} />
                                                    <span className="text-sm">Language Detection</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Globe className={`h-5 w-5 ${widgetSetting.geolocation_enabled ? 'text-green-500' : 'text-gray-300'}`} />
                                                    <span className="text-sm">Geolocation</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Custom Code */}
                        {(widgetSetting.custom_css || widgetSetting.custom_js || widgetSetting.widget_config) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Custom Code & Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {widgetSetting.custom_css && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Custom CSS</h4>
                                            <div className="bg-gray-50 rounded p-3">
                                                <pre className="text-xs overflow-auto max-h-32 font-mono">
                                                    {widgetSetting.custom_css}
                                                </pre>
                                            </div>
                                        </div>
                                    )}

                                    {widgetSetting.custom_js && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Custom JavaScript</h4>
                                            <div className="bg-gray-50 rounded p-3">
                                                <pre className="text-xs overflow-auto max-h-32 font-mono">
                                                    {widgetSetting.custom_js}
                                                </pre>
                                            </div>
                                        </div>
                                    )}

                                    {widgetSetting.widget_config && Object.keys(widgetSetting.widget_config).length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Widget Configuration</h4>
                                            <div className="bg-gray-50 rounded p-3">
                                                <pre className="text-xs overflow-auto max-h-32 font-mono">
                                                    {JSON.stringify(widgetSetting.widget_config, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Button variant="outline" onClick={handleGetScript}>
                                        <Code className="h-4 w-4 mr-2" />
                                        Get Script
                                    </Button>
                                    <Button variant="outline" onClick={handlePreview}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Preview
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={route('admin.agent-widget-settings.edit', widgetSetting.id)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Settings
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild className="md:col-span-3">
                                        <Link href={route('admin.ai-agents.show', widgetSetting.agent_id)}>
                                            <Bot className="h-4 w-4 mr-2" />
                                            View Agent Details
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Show;
