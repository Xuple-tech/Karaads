// @/Pages/Admin/AgentWidgetSettings/Preview.tsx
import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Code,
    Eye,
    Smartphone,
    Monitor,
    Globe,
    Copy,
    Check,
    Bot,
    Settings,
    ExternalLink
} from 'lucide-react';

const Preview = ({ widgetSetting }) => {
    const [copied, setCopied] = useState(false);
    const [device, setDevice] = useState('desktop');

    const generateScript = () => {
        const agent = widgetSetting.agent;
        return `<script>
    (function() {
        var kwatiWidget = document.createElement('script');
        kwatiWidget.src = '${widgetSetting.widget_script_url}';
        kwatiWidget.async = true;
        kwatiWidget.onload = function() {
            window.KwatiAI.init({
                agentId: '${agent?.id}',
                agentName: '${agent?.name}',
                injectionMethod: '${widgetSetting.injection_method}',
                triggerMethod: '${widgetSetting.trigger_method}',
                triggerDelay: ${widgetSetting.trigger_delay_seconds},
                config: ${JSON.stringify(widgetSetting.widget_config)}
            });
        };
        document.head.appendChild(kwatiWidget);
    })();
</script>`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateScript());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openDemoPage = () => {
        // This would open a demo page with the widget
        const demoUrl = `/demo/widget/${widgetSetting.id}`;
        window.open(demoUrl, '_blank');
    };

    return (
        <AdminLayout>
            <Head title={`Preview - ${widgetSetting.agent?.name} Widget`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.agent-widget-settings.show', widgetSetting.id)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Settings
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Widget Preview</h1>
                            <p className="text-muted-foreground">
                                Preview and test the widget for {widgetSetting.agent?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={openDemoPage}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Demo
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Script & Info */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Widget Script */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Embed Script</CardTitle>
                                <CardDescription>
                                    Copy this script to embed the widget
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 rounded p-3">
                                    <pre className="text-xs overflow-auto max-h-48 font-mono">
                                        {generateScript()}
                                    </pre>
                                </div>
                                <Button
                                    onClick={copyToClipboard}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Script
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <Link href={route('admin.agent-widget-settings.script', widgetSetting.id)}>
                                        <Code className="h-4 w-4 mr-2" />
                                        Get Script URL
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Widget Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Widget Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Bot className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{widgetSetting.agent?.name}</p>
                                        <p className="text-sm text-muted-foreground">AI Agent</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Injection</p>
                                        <Badge variant="outline">
                                            {widgetSetting.injection_method.split('_').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Trigger</p>
                                        <Badge variant="outline">
                                            {widgetSetting.trigger_method.split('_').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </Badge>
                                    </div>
                                </div>

                                {widgetSetting.injection_method === 'auto_inject' && widgetSetting.auto_inject_selector && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Auto Inject Selector</p>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                            {widgetSetting.auto_inject_selector}
                                        </code>
                                    </div>
                                )}

                                {widgetSetting.trigger_method === 'delay' && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Trigger Delay</p>
                                        <p className="text-sm">{widgetSetting.trigger_delay_seconds} seconds</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Preview */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Device Toggle */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant={device === 'desktop' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setDevice('desktop')}
                                        >
                                            <Monitor className="h-4 w-4 mr-2" />
                                            Desktop
                                        </Button>
                                        <Button
                                            variant={device === 'mobile' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setDevice('mobile')}
                                        >
                                            <Smartphone className="h-4 w-4 mr-2" />
                                            Mobile
                                        </Button>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {device === 'desktop' ? 'Previewing on desktop' : 'Previewing on mobile'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preview Area */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Widget Preview</CardTitle>
                                <CardDescription>
                                    This is how the widget will appear on websites
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className={`border-2 border-dashed border-gray-300 rounded-lg bg-white ${
                                    device === 'mobile' ? 'max-w-sm mx-auto' : ''
                                }`}>
                                    <div className={`p-8 bg-gradient-to-br from-gray-50 to-white min-h-[400px] ${
                                        device === 'mobile' ? 'max-w-[375px] mx-auto' : ''
                                    }`}>
                                        {/* Website Content */}
                                        <div className="space-y-4">
                                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>

                                            <div className="h-32 bg-gray-100 rounded mt-6"></div>

                                            <div className="h-4 bg-gray-200 rounded w-1/2 mt-6"></div>
                                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        </div>

                                        {/* Widget Mockup */}
                                        <div className={`fixed ${
                                            device === 'mobile' ? 'bottom-4 right-4' : 'bottom-6 right-6'
                                        }`}>
                                            <div className={`bg-blue-600 rounded-full shadow-lg ${
                                                device === 'mobile' ? 'w-12 h-12' : 'w-14 h-14'
                                            } flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors`}>
                                                <Bot className="h-6 w-6 text-white" />
                                            </div>
                                        </div>

                                        {/* Widget Chat Window (Mockup) */}
                                        {widgetSetting.trigger_method !== 'click' && (
                                            <div className={`fixed ${
                                                device === 'mobile' ? 'bottom-20 right-4 w-[calc(100%-2rem)]' : 'bottom-24 right-6 w-80'
                                            } bg-white rounded-lg shadow-xl border`}>
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <Bot className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{widgetSetting.agent?.name}</p>
                                                                <p className="text-xs text-muted-foreground">AI Assistant</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="bg-blue-50 rounded-lg p-3">
                                                            <p className="text-sm">Hello! How can I help you today?</p>
                                                        </div>
                                                        <div className="bg-gray-100 rounded-lg p-3">
                                                            <p className="text-sm">What are your business hours?</p>
                                                        </div>
                                                        <div className="bg-blue-50 rounded-lg p-3">
                                                            <p className="text-sm">We're open Monday to Friday, 9am to 5pm.</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex">
                                                        <input
                                                            type="text"
                                                            placeholder="Type your message..."
                                                            className="flex-1 border rounded-l-lg px-3 py-2 text-sm"
                                                            disabled
                                                        />
                                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg text-sm">
                                                            Send
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        This is a mockup. The actual widget appearance may vary based on website styling.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Configuration Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                                            widgetSetting.show_on_mobile ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <Smartphone className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm mt-2">Mobile</p>
                                        <p className={`text-xs ${widgetSetting.show_on_mobile ? 'text-green-600' : 'text-gray-400'}`}>
                                            {widgetSetting.show_on_mobile ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                                            widgetSetting.show_on_desktop ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <Monitor className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm mt-2">Desktop</p>
                                        <p className={`text-xs ${widgetSetting.show_on_desktop ? 'text-green-600' : 'text-gray-400'}`}>
                                            {widgetSetting.show_on_desktop ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                                            widgetSetting.language_detection ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <Globe className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm mt-2">Language</p>
                                        <p className={`text-xs ${widgetSetting.language_detection ? 'text-green-600' : 'text-gray-400'}`}>
                                            {widgetSetting.language_detection ? 'Detection On' : 'Off'}
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                                            widgetSetting.geolocation_enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <Settings className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm mt-2">Location</p>
                                        <p className={`text-xs ${widgetSetting.geolocation_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                            {widgetSetting.geolocation_enabled ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Preview;
