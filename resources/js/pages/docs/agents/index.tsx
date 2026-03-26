// app/docs/agents/widget/page.tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocsLayout } from '@/layouts/docs-layout';
import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Bot,
    CheckCircle,
    Code2,
    Copy,
    Cpu,
    ExternalLink,
    Eye,
    FileCode,
    LayoutDashboard,
    Plus,
    Settings,
    Shield,
    Sliders,
    Sparkles,
    Terminal,
    ToggleRight,
    Zap,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function WidgetDocumentation() {
    const integrationSteps = [
        {
            step: 1,
            title: 'Create a Site',
            description: 'Go to AI Agents Dashboard and create your site',
            icon: Plus,
            color: 'text-blue-600',
            path: '/ai-agents/dashboard',
        },
        {
            step: 2,
            title: 'Enable Widget',
            description: 'Toggle the widget to enable it for your site',
            icon: ToggleRight,
            color: 'text-green-600',
        },
        {
            step: 3,
            title: 'Create Agent',
            description: 'Set up your AI agent with name, personality, and settings',
            icon: Cpu,
            color: 'text-purple-600',
        },
        {
            step: 4,
            title: 'Configure Widget',
            description: 'Customize appearance and behavior',
            icon: Sliders,
            color: 'text-amber-600',
        },
        {
            step: 5,
            title: 'Get Integration Code',
            description: 'Copy and paste the widget code into your website',
            icon: Code2,
            color: 'text-emerald-600',
        },
    ];

    const widgetCode = `<!-- AI Agent Widget Embed Code -->
<script src="https://kwatiai.com/widget/v1/script.js"></script>
<script>
    window.AIChatWidget.init({
        agentSlug: "your-agent-slug-here",
        position: "bottom-right",
        botName: "Your Agent Name",
        primaryColor: "#3b82f6",
        autoOpen: false,
        debug: false
    });
</script>`;

    const quickInstallCode = `<!-- Quick Install - Add before closing </body> tag -->
<script src="https://kwatiai.com/widget/v1/script.js"></script>
<script>
    window.AIChatWidget.init({
        agentSlug: "your-agent-slug-here",
        position: "bottom-right",
        botName: "Your Agent"
    });
</script>`;

    const reactIntegration = `// React Component Integration
import { useEffect } from 'react';

export default function AIChatWidget() {
  useEffect(() => {
    // Load widget script
    const script = document.createElement('script');
    script.src = 'https://kwatiai.com/widget/v1/script.js';
    script.async = true;
    
    // Initialize widget after script loads
    script.onload = () => {
      window.AIChatWidget.init({
        agentSlug: 'your-agent-slug-here',
        position: 'bottom-right',
        botName: 'Your Agent Name',
        primaryColor: '#3b82f6',
        autoOpen: false,
        debug: false
      });
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup if needed
      const widget = document.getElementById('ai-chat-widget');
      if (widget) widget.remove();
    };
  }, []);
  
  return null; // Widget is injected into DOM
}`;

    const nextjsIntegration = `// Next.js Integration (app router)
'use client';

import { useEffect } from 'react';

export function AIChatWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://kwatiai.com/widget/v1/script.js';
    script.async = true;
    script.onload = () => {
      window.AIChatWidget.init({
        agentSlug: process.env.NEXT_PUBLIC_AGENT_SLUG,
        position: 'bottom-right',
        botName: process.env.NEXT_PUBLIC_AGENT_NAME || 'AI Assistant',
        primaryColor: '#3b82f6'
      });
    };
    document.head.appendChild(script);
  }, []);
  
  return null;
}`;

    const apiMethods = `// Widget API Methods (available after initialization)
const widget = window.AIChatWidget;

// Open the widget
widget.open();

// Close the widget
widget.close();

// Toggle widget visibility
widget.toggle();

// Send a message programmatically
widget.sendMessage('Hello, I need help!');

// Update widget configuration
widget.updateConfig({
  primaryColor: '#000000',
  botName: 'New Name'
});

// Get current conversation
const conversation = widget.getConversation();

// Clear current conversation
widget.clearConversation();

// Destroy widget (remove from page)
widget.destroy();

// Check if widget is open
const isOpen = widget.isOpen();

// Event Listeners
document.addEventListener('ai-widget:opened', () => {
  console.log('Widget opened');
});

document.addEventListener('ai-widget:closed', () => {
  console.log('Widget closed');
});

document.addEventListener('ai-widget:message', (event) => {
  console.log('New message:', event.detail);
});`;

    const CopyCodeButton = ({ code }: { code: string }) => (
        <Button variant="ghost" size="sm" className="absolute top-2 right-2 z-10" onClick={() => navigator.clipboard.writeText(code)}>
            <Copy className="h-4 w-4" />
        </Button>
    );

    return (
        <DocsLayout>
            <div className="mx-auto max-w-6xl space-y-12">
                {/* Hero Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-3">
                            <Bot className="text-primary h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">AI Chat Widget Integration</h1>
                            <p className="text-muted-foreground mt-2 text-xl">Add an intelligent AI chat widget to your website in 2 minutes</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Zap className="h-5 w-5 text-emerald-600" />
                                    2-Minute Setup
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Copy-paste two lines of code. No complex configuration needed.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Settings className="h-5 w-5 text-blue-600" />
                                    Fully Customizable
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Control colors, position, behavior, and appearance.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                    Production Ready
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">Lightweight, fast, and works on all modern browsers.</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <Separator />

                {/* Quick Start Section */}
                <section>
                    <div className="mb-8 text-center">
                        <Badge className="mb-4 gap-2">
                            <Sparkles className="h-3 w-3" />
                            Quick Start
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight">Add Widget to Your Site</h2>
                        <p className="text-muted-foreground mx-auto mt-2 max-w-2xl">
                            Copy this code and paste it before the closing <code>&lt;/body&gt;</code> tag of your website
                        </p>
                    </div>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code2 className="h-5 w-5" />
                                Your Integration Code
                            </CardTitle>
                            <CardDescription>
                                Replace <code>your-agent-slug-here</code> with your actual agent slug
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Important</AlertTitle>
                                <AlertDescription className="flex items-center gap-2">
                                    Use <code className="bg-muted rounded px-2 py-1 text-sm">window.location.origin</code> for automatic URL detection
                                </AlertDescription>
                            </Alert>

                            <div className="relative">
                                <CopyCodeButton code={widgetCode} />
                                <SyntaxHighlighter language="html" style={oneDark} customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                    {widgetCode}
                                </SyntaxHighlighter>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h4 className="mb-3 font-semibold">Configuration Options</h4>
                                    <div className="space-y-3">
                                        {[
                                            { option: 'agentSlug', required: true, desc: 'Your agent slug from dashboard' },
                                            { option: 'position', default: 'bottom-right', desc: 'bottom-right, bottom-left, top-right, top-left' },
                                            { option: 'botName', default: 'AI Assistant', desc: 'Display name for your agent' },
                                            { option: 'primaryColor', default: '#3b82f6', desc: 'Primary color for widget UI' },
                                            { option: 'autoOpen', default: 'false', desc: 'Auto open widget on page load' },
                                            { option: 'debug', default: 'false', desc: 'Enable debug mode in console' },
                                        ].map((config, index) => (
                                            <div key={index} className="bg-card flex items-start gap-3 rounded-lg border p-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-sm font-semibold">{config.option}</code>
                                                        {config.required && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Required
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground mt-1 text-xs">{config.desc}</p>
                                                </div>
                                                {config.default && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Default: {config.default}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="mb-3 font-semibold">Live Example</h4>
                                    <Card className="border-dashed">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
                                                        <Bot className="text-primary h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Your Agent Name</p>
                                                        <p className="text-muted-foreground text-sm">AI Assistant</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-sm">
                                                        <span className="font-medium">Position:</span> bottom-right
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-medium">Color:</span>{' '}
                                                        <span className="bg-primary ml-1 inline-block h-4 w-4 rounded-full align-middle"></span>{' '}
                                                        #3b82f6
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-medium">Auto Open:</span> Disabled
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <Separator />

                {/* Dashboard Instructions */}
                <section>
                    <h2 className="mb-6 text-3xl font-bold tracking-tight">Getting Your Agent Slug</h2>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LayoutDashboard className="h-5 w-5" />
                                    Dashboard Walkthrough
                                </CardTitle>
                                <CardDescription>Follow these steps to get your integration code</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {[
                                        {
                                            step: '1',
                                            title: 'Navigate to Dashboard',
                                            desc: 'Go to http://127.0.0.1:8000/ai-agents/dashboard',
                                            icon: LayoutDashboard,
                                        },
                                        {
                                            step: '2',
                                            title: 'Create Site',
                                            desc: "Click 'Create Site' button at top right",
                                            icon: Plus,
                                        },
                                        {
                                            step: '3',
                                            title: 'Enable Widget',
                                            desc: "Toggle 'Enable Widget' switch to ON",
                                            icon: ToggleRight,
                                        },
                                        {
                                            step: '4',
                                            title: 'Create Agent',
                                            desc: 'Go to Agents → Create Agent',
                                            icon: Cpu,
                                        },
                                        {
                                            step: '5',
                                            title: 'Copy Integration Code',
                                            desc: 'Go to Widget Config → Copy the code',
                                            icon: Copy,
                                        },
                                    ].map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={index} className="flex items-start gap-4">
                                                <div className="flex-shrink-0">
                                                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                                        <span className="font-semibold">{item.step}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="text-muted-foreground h-4 w-4" />
                                                        <h4 className="font-semibold">{item.title}</h4>
                                                    </div>
                                                    <p className="text-muted-foreground mt-1 text-sm">{item.desc}</p>

                                                    {item.step === '5' && (
                                                        <div className="bg-muted mt-3 rounded-lg p-3">
                                                            <p className="text-xs font-medium">Your integration code will look like:</p>
                                                            <code className="bg-background mt-1 block rounded p-2 text-xs">
                                                                agentSlug: "your-unique-agent-slug"
                                                            </code>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Terminal className="h-5 w-5" />
                                    JavaScript API
                                </CardTitle>
                                <CardDescription>Control the widget programmatically</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <CopyCodeButton code={apiMethods} />
                                        <SyntaxHighlighter
                                            language="javascript"
                                            style={oneDark}
                                            customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem', maxHeight: '400px' }}
                                        >
                                            {apiMethods}
                                        </SyntaxHighlighter>
                                    </div>

                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertTitle>Usage Example</AlertTitle>
                                        <AlertDescription>
                                            <code className="bg-muted rounded px-1 text-sm">window.AIChatWidget.open()</code> will programmatically
                                            open the widget
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Framework Integration */}
                <section>
                    <h2 className="mb-6 text-3xl font-bold tracking-tight">Framework Integration</h2>

                    <Tabs defaultValue="react" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="react">React</TabsTrigger>
                            <TabsTrigger value="nextjs">Next.js</TabsTrigger>
                            <TabsTrigger value="quick">Quick Install</TabsTrigger>
                        </TabsList>

                        <TabsContent value="quick">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-600" />
                                        Quick Installation (Plain HTML)
                                    </CardTitle>
                                    <CardDescription>Minimal setup for basic HTML websites</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative">
                                        <CopyCodeButton code={quickInstallCode} />
                                        <SyntaxHighlighter
                                            language="html"
                                            style={oneDark}
                                            customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                        >
                                            {quickInstallCode}
                                        </SyntaxHighlighter>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="react">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="rounded bg-blue-100 p-1 dark:bg-blue-900">
                                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 14.942c1.071 0 1.94-.868 1.94-1.94 0-1.071-.869-1.94-1.94-1.94-1.072 0-1.94.869-1.94 1.94 0 1.072.868 1.94 1.94 1.94zM12 5.86c-3.332 0-6.14 2.808-6.14 6.14s2.808 6.14 6.14 6.14 6.14-2.808 6.14-6.14-2.808-6.14-6.14-6.14z" />
                                            </svg>
                                        </div>
                                        React Integration
                                    </CardTitle>
                                    <CardDescription>Component-based integration for React applications</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative">
                                        <CopyCodeButton code={reactIntegration} />
                                        <SyntaxHighlighter
                                            language="javascript"
                                            style={oneDark}
                                            customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                        >
                                            {reactIntegration}
                                        </SyntaxHighlighter>
                                    </div>

                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Important for React</AlertTitle>
                                        <AlertDescription>
                                            Use <code className="bg-muted rounded px-1">useEffect</code> to ensure widget loads on client-side only
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="nextjs">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="rounded bg-black p-1 dark:bg-white">
                                            <span className="font-bold text-white dark:text-black">N</span>
                                        </div>
                                        Next.js Integration
                                    </CardTitle>
                                    <CardDescription>Server-side rendering compatible integration</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative">
                                        <CopyCodeButton code={nextjsIntegration} />
                                        <SyntaxHighlighter
                                            language="javascript"
                                            style={oneDark}
                                            customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                        >
                                            {nextjsIntegration}
                                        </SyntaxHighlighter>
                                    </div>

                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Environment Variables</AlertTitle>
                                        <AlertDescription>
                                            Store sensitive data in <code className="bg-muted rounded px-1">.env.local</code>
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </section>

                {/* Testing & Troubleshooting */}
                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Testing & Troubleshooting
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">✅ Script Loading</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-xs">Open browser console, check for "AI Chat Widget initialized"</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">✅ Widget Button</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-xs">
                                            Look for chat button at configured position (default: bottom-right)
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">✅ Chat Functionality</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-xs">Click button, send test message, verify AI response</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Common Issues</AlertTitle>
                                <AlertDescription className="space-y-2">
                                    <div>
                                        <strong>Widget not showing?</strong>
                                        <ul className="mt-1 list-disc pl-5 text-sm">
                                            <li>Check agent slug is correct</li>
                                            <li>Verify widget is enabled in dashboard</li>
                                            <li>Check browser console for errors</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <strong>403 or CORS errors?</strong>
                                        <ul className="mt-1 list-disc pl-5 text-sm">
                                            <li>
                                                Ensure using <code>window.location.origin</code>
                                            </li>
                                            <li>Check if widget domain is allowed in dashboard</li>
                                        </ul>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </section>

                {/* Final CTA */}
                <section className="from-primary/10 to-primary/5 rounded-2xl bg-gradient-to-r p-8 text-center">
                    <div className="mx-auto max-w-2xl space-y-6">
                        <div className="bg-primary/20 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                            <Sparkles className="h-4 w-4" />
                            Ready to Integrate
                        </div>
                        <h3 className="text-2xl font-bold">Get Your Integration Code Now</h3>
                        <p className="text-muted-foreground">Follow the dashboard instructions to get your personalized widget code</p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link href="http://127.0.0.1:8000/ai-agents/dashboard">
                                <Button size="lg" className="gap-2">
                                    <LayoutDashboard className="h-5 w-5" />
                                    Go to Dashboard
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="gap-2">
                                <ExternalLink className="h-5 w-5" />
                                View Live Demo
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Related Documentation */}
                <section>
                    <h2 className="mb-6 text-3xl font-bold tracking-tight">Learn More</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileCode className="h-5 w-5 text-blue-600" />
                                    Knowledge Base
                                </CardTitle>
                                <CardDescription>Build a knowledge bank for your AI agent</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4 text-sm">
                                    Learn how to create and manage a knowledge base that gives your agent access to domain-specific information and
                                    documentation.
                                </p>
                                <Button asChild variant="outline" className="w-full gap-2">
                                    <Link href={route('docs.agents.knowledge-base')}>
                                        Explore Knowledge Base
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-600" />
                                    Tools & Integrations
                                </CardTitle>
                                <CardDescription>Extend your agent with tools and APIs</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4 text-sm">
                                    Discover how to add tools to your agent, from built-in options like calculators and booking systems to custom API
                                    integrations.
                                </p>
                                <Button asChild variant="outline" className="w-full gap-2">
                                    <Link href={route('docs.agents.tools')}>
                                        Explore Tools
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </DocsLayout>
    );
}
