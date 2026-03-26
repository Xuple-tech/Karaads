// @/Pages/Demo/Index.tsx
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Bot,
    Code,
    Eye,
    Smartphone,
    Monitor,
    Settings,
    Copy,
    Check,
    Download,
    Globe,
    MessageSquare,
    Zap
} from 'lucide-react';

const DemoIndex = ({
    agents = [],
    initialAgentId = null,
    widgetSettings = {}
}) => {
    const [selectedAgentId, setSelectedAgentId] = useState(initialAgentId);
    const [device, setDevice] = useState('desktop');
    const [showWidget, setShowWidget] = useState(true);
    const [customConfig, setCustomConfig] = useState({
        position: 'bottom-right',
        theme: 'light',
        language: 'en',
        autoOpen: false,
        showAvatar: true,
        soundEnabled: true,
        notificationCount: 0
    });
    const [copied, setCopied] = useState(false);
    const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [userMessage, setUserMessage] = useState('');

    const selectedAgent = agents.find(a => a.id === parseInt(selectedAgentId)) || agents[0];

    // Load widget script
    const loadWidget = () => {
        if (!selectedAgent) return;

        // Remove existing widget if any
        const existingScript = document.getElementById('kwati-widget-script');
        if (existingScript) existingScript.remove();

        // Load new widget
        const script = document.createElement('script');
        script.id = 'kwati-widget-script';
        script.src = widgetSettings.scriptUrl || `https://cdn.kwati.ai/widget/v1/script.js?agent=${selectedAgent.id}`;
        script.async = true;

        script.onload = () => {
            if (window.KwatiAI) {
                window.KwatiAI.init({
                    agentId: selectedAgent.id,
                    agentName: selectedAgent.name,
                    position: customConfig.position,
                    theme: customConfig.theme,
                    language: customConfig.language,
                    autoOpen: customConfig.autoOpen,
                    showAvatar: customConfig.showAvatar,
                    soundEnabled: customConfig.soundEnabled,
                    ...customConfig
                });
                setIsWidgetLoaded(true);
            }
        };

        document.head.appendChild(script);
        setShowWidget(true);
    };

    // Unload widget
    const unloadWidget = () => {
        const script = document.getElementById('kwati-widget-script');
        if (script) script.remove();

        if (window.KwatiAI) {
            window.KwatiAI.destroy();
        }

        setIsWidgetLoaded(false);
        setShowWidget(false);
    };

    // Generate embed code
    const generateEmbedCode = () => {
        return `<script>
    (function() {
        var kwatiWidget = document.createElement('script');
        kwatiWidget.src = '${widgetSettings.scriptUrl || `https://cdn.kwati.ai/widget/v1/script.js?agent=${selectedAgent?.id}`}';
        kwatiWidget.async = true;
        kwatiWidget.onload = function() {
            window.KwatiAI.init({
                agentId: '${selectedAgent?.id}',
                agentName: '${selectedAgent?.name}',
                position: '${customConfig.position}',
                theme: '${customConfig.theme}',
                language: '${customConfig.language}',
                autoOpen: ${customConfig.autoOpen},
                showAvatar: ${customConfig.showAvatar},
                soundEnabled: ${customConfig.soundEnabled}
            });
        };
        document.head.appendChild(kwatiWidget);
    })();
</script>`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Handle chat messages
    const sendMessage = async () => {
        if (!userMessage.trim()) return;

        const newConversation = [
            ...conversation,
            { role: 'user', content: userMessage, timestamp: new Date() }
        ];
        setConversation(newConversation);
        setUserMessage('');

        // Simulate AI response
        setTimeout(() => {
            setConversation(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: `This is a demo response from ${selectedAgent?.name}. In production, this would be a real AI response.`,
                    timestamp: new Date()
                }
            ]);
        }, 1000);
    };

    useEffect(() => {
        if (selectedAgent && showWidget) {
            loadWidget();
        } else {
            unloadWidget();
        }

        return () => {
            unloadWidget();
        };
    }, [selectedAgent, showWidget, customConfig]);

    return (
        <>
            <Head title="Kwati AI - Widget Demo" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                {/* Header */}
                <header className="border-b bg-white">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    <span className="text-blue-600">Kwati AI</span> Widget Demo
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Test and customize AI agent widgets in real-time
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <Button variant="outline" className="mr-2">
                                    <Download className="h-4 w-4 mr-2" />
                                    Documentation
                                </Button>
                                <Button>
                                    <Zap className="h-4 w-4 mr-2" />
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Controls */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Agent Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Bot className="h-5 w-5 mr-2" />
                                        Select AI Agent
                                    </CardTitle>
                                    <CardDescription>
                                        Choose an agent to test in the widget
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="agent">Agent</Label>
                                        <Select
                                            value={selectedAgentId?.toString()}
                                            onValueChange={setSelectedAgentId}
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
                                    </div>

                                    {selectedAgent && (
                                        <div className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Bot className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{selectedAgent.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {selectedAgent.description || 'AI Assistant'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Type:</span>
                                                    <span className="ml-2 capitalize">{selectedAgent.agent_type?.replace('_', ' ')}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Status:</span>
                                                    <span className={`ml-2 ${selectedAgent.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {selectedAgent.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="show-widget" className="font-normal">
                                                Show Widget
                                            </Label>
                                            <p className="text-xs text-gray-500">
                                                Toggle widget visibility
                                            </p>
                                        </div>
                                        <Switch
                                            id="show-widget"
                                            checked={showWidget}
                                            onCheckedChange={setShowWidget}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Widget Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Settings className="h-5 w-5 mr-2" />
                                        Widget Settings
                                    </CardTitle>
                                    <CardDescription>
                                        Customize widget appearance and behavior
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="position">Position</Label>
                                            <Select
                                                value={customConfig.position}
                                                onValueChange={(value) => setCustomConfig({...customConfig, position: value})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                                    <SelectItem value="top-right">Top Right</SelectItem>
                                                    <SelectItem value="top-left">Top Left</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="theme">Theme</Label>
                                            <Select
                                                value={customConfig.theme}
                                                onValueChange={(value) => setCustomConfig({...customConfig, theme: value})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="dark">Dark</SelectItem>
                                                    <SelectItem value="auto">Auto</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="language">Language</Label>
                                        <Select
                                            value={customConfig.language}
                                            onValueChange={(value) => setCustomConfig({...customConfig, language: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                                <SelectItem value="de">German</SelectItem>
                                                <SelectItem value="zh">Chinese</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="autoOpen" className="font-normal">
                                                    Auto Open
                                                </Label>
                                                <p className="text-xs text-gray-500">
                                                    Open widget automatically
                                                </p>
                                            </div>
                                            <Switch
                                                id="autoOpen"
                                                checked={customConfig.autoOpen}
                                                onCheckedChange={(checked) => setCustomConfig({...customConfig, autoOpen: checked})}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="showAvatar" className="font-normal">
                                                    Show Avatar
                                                </Label>
                                                <p className="text-xs text-gray-500">
                                                    Display agent avatar
                                                </p>
                                            </div>
                                            <Switch
                                                id="showAvatar"
                                                checked={customConfig.showAvatar}
                                                onCheckedChange={(checked) => setCustomConfig({...customConfig, showAvatar: checked})}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="soundEnabled" className="font-normal">
                                                    Sound Effects
                                                </Label>
                                                <p className="text-xs text-gray-500">
                                                    Enable notification sounds
                                                </p>
                                            </div>
                                            <Switch
                                                id="soundEnabled"
                                                checked={customConfig.soundEnabled}
                                                onCheckedChange={(checked) => setCustomConfig({...customConfig, soundEnabled: checked})}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Device Toggle */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preview Device</CardTitle>
                                    <CardDescription>
                                        Test widget on different screen sizes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant={device === 'desktop' ? 'default' : 'outline'}
                                            className="flex-1"
                                            onClick={() => setDevice('desktop')}
                                        >
                                            <Monitor className="h-4 w-4 mr-2" />
                                            Desktop
                                        </Button>
                                        <Button
                                            variant={device === 'mobile' ? 'default' : 'outline'}
                                            className="flex-1"
                                            onClick={() => setDevice('mobile')}
                                        >
                                            <Smartphone className="h-4 w-4 mr-2" />
                                            Mobile
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Middle Column - Preview */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Preview Area */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center">
                                                <Eye className="h-5 w-5 mr-2" />
                                                Live Preview
                                            </CardTitle>
                                            <CardDescription>
                                                Real-time widget preview with custom settings
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-sm ${isWidgetLoaded ? 'text-green-600' : 'text-gray-500'}`}>
                                                {isWidgetLoaded ? 'Widget Loaded' : 'Widget Not Loaded'}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className={`border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden ${
                                        device === 'mobile' ? 'max-w-sm mx-auto' : ''
                                    }`}>
                                        {/* Website Mockup */}
                                        <div className="p-6 bg-gradient-to-b from-white to-gray-50 min-h-[500px]">
                                            {/* Website Header */}
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-600 rounded"></div>
                                                    <div>
                                                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
                                                    </div>
                                                </div>
                                                <div className="hidden md:flex space-x-4">
                                                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                                                </div>
                                            </div>

                                            {/* Website Content */}
                                            <div className="space-y-4">
                                                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>

                                                <div className="h-40 bg-gray-100 rounded-lg mt-8"></div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                                    <div className="h-32 bg-gray-100 rounded-lg"></div>
                                                    <div className="h-32 bg-gray-100 rounded-lg"></div>
                                                    <div className="h-32 bg-gray-100 rounded-lg"></div>
                                                </div>

                                                <div className="h-4 bg-gray-200 rounded w-1/2 mt-8"></div>
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            </div>

                                            {/* Widget will be injected here by the script */}
                                            <div id="kwati-widget-container"></div>
                                        </div>

                                        {/* Widget Status Overlay */}
                                        {!showWidget && (
                                            <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg">
                                                <div className="text-center p-8">
                                                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                    <h3 className="text-xl font-semibold text-white mb-2">Widget Hidden</h3>
                                                    <p className="text-gray-300 mb-4">
                                                        Enable "Show Widget" in controls to display the AI assistant
                                                    </p>
                                                    <Button onClick={() => setShowWidget(true)}>
                                                        Show Widget
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-gray-600">
                                            This is a simulated website environment. The widget behavior matches production.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Embed Code */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Code className="h-5 w-5 mr-2" />
                                        Embed Code
                                    </CardTitle>
                                    <CardDescription>
                                        Copy this code to integrate the widget on your website
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto text-sm">
                                                {generateEmbedCode()}
                                            </pre>
                                            <Button
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={copyToClipboard}
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy Code
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button variant="outline" asChild>
                                                <a href={`/demo/script/${selectedAgent?.id}`} target="_blank">
                                                    Get Script URL
                                                </a>
                                            </Button>
                                            <Button variant="outline" onClick={loadWidget}>
                                                Reload Widget
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Test Chat Interface */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                Test Chat Interface
                            </CardTitle>
                            <CardDescription>
                                Test conversations with the selected AI agent
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg">
                                {/* Chat Header */}
                                <div className="bg-gray-50 px-4 py-3 border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{selectedAgent?.name || 'AI Assistant'}</h4>
                                                <p className="text-xs text-gray-500">Demo Conversation</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {conversation.length} messages
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div className="h-64 overflow-y-auto p-4 space-y-4">
                                    {conversation.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-600 mb-2">Start a conversation</h3>
                                            <p className="text-gray-500">
                                                Send a message to test the AI agent's response
                                            </p>
                                        </div>
                                    ) : (
                                        conversation.map((msg, index) => (
                                            <div
                                                key={index}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                                        msg.role === 'user'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    <p>{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${
                                                        msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                                                    }`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Chat Input */}
                                <div className="border-t p-4">
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="Type your message..."
                                            value={userMessage}
                                            onChange={(e) => setUserMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        />
                                        <Button onClick={sendMessage} disabled={!userMessage.trim()}>
                                            Send
                                        </Button>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setUserMessage("What can you help me with?")}
                                        >
                                            Example 1
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setUserMessage("Tell me about your features")}
                                        >
                                            Example 2
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setUserMessage("How do I get started?")}
                                        >
                                            Example 3
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main>

                {/* Footer */}
                <footer className="border-t bg-white mt-12">
                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Kwati AI</h3>
                                <p className="text-gray-600">
                                    Powerful AI agent widgets for modern websites.
                                    Easy integration, customizable, and enterprise-ready.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Resources</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li><a href="#" className="hover:text-blue-600">Documentation</a></li>
                                    <li><a href="#" className="hover:text-blue-600">API Reference</a></li>
                                    <li><a href="#" className="hover:text-blue-600">Examples</a></li>
                                    <li><a href="#" className="hover:text-blue-600">Support</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Get Started</h3>
                                <p className="text-gray-600 mb-4">
                                    Ready to integrate AI into your website?
                                </p>
                                <Button>
                                    Start Free Trial
                                </Button>
                            </div>
                        </div>
                        <div className="border-t mt-8 pt-8 text-center text-gray-500">
                            <p>© {new Date().getFullYear()} Kwati AI. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Global KwatiAI object */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        window.KwatiAI = window.KwatiAI || {};
                        window.KwatiAI.init = function(config) {
                            console.log('KwatiAI Widget initialized:', config);
                            // Widget initialization logic would go here
                        };
                        window.KwatiAI.destroy = function() {
                            console.log('KwatiAI Widget destroyed');
                            // Widget cleanup logic would go here
                        };
                    `
                }}
            />
        </>
    );
};

export default DemoIndex;
