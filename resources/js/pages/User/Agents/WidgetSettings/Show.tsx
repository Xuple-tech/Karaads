import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import Layout from '@/layouts/UserLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Code,
  Settings,
  Eye,
  Copy,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  MousePointer,
  Navigation,
  MapPin,
  Languages,
  MoreVertical,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface AIAgent {
  id: number;
  name: string;
  slug: string;
  widget_position: string;
  primary_color: string;
  secondary_color: string;
  welcome_message: string;
}

interface WidgetSettings {
  id: number;
  widget_script_url: string | null;
  injection_method: string;
  auto_inject_selector: string | null;
  trigger_method: string;
  trigger_delay_seconds: number;
  show_on_mobile: boolean;
  show_on_desktop: boolean;
  language_detection: boolean;
  geolocation_enabled: boolean;
  custom_css: string | null;
  custom_js: string | null;
  widget_config: Record<string, any> | null;
}

interface WidgetSettingsShowProps {
  agent: AIAgent;
  widgetSettings: WidgetSettings;
}

export default function WidgetSettingsShow() {
  const { props } = usePage<{ props: WidgetSettingsShowProps }>();
  const { agent, widgetSettings } = props;
  const [previewCode, setPreviewCode] = useState<string>('');

  const getTriggerMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      click: 'Click to Open',
      hover: 'Hover to Open',
      delay: 'Delay Auto-open',
      scroll: 'Scroll Trigger',
      exit_intent: 'Exit Intent',
    };
    return labels[method] || method;
  };

  const getInjectionMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      manual: 'Manual Injection',
      auto_inject: 'Auto-inject',
    };
    return labels[method] || method;
  };

  const generateEmbedCode = () => {
    const code = `<!-- AI Agent Widget Embed Code -->
<script src="${widgetSettings.widget_script_url ||  location.origin + '/widget/v1/script.js'}"></script>
<script>
  window.AIChatWidget.init({
    agentSlug: "${agent.slug}",
    position: "${agent.widget_position}",
    botName: "${agent.name}",
    primaryColor: "${agent.primary_color}",
    autoOpen: false,
    debug: false
  });
</script>`;

    return code;
  };

  const handlePreview = async () => {
    try {
      const response = await fetch(`/ai-agents/agents/${agent.id}/widget-settings/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      const data = await response.json();
      if (data.success) {
        setPreviewCode(data.preview_code);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset widget settings to defaults?')) {
      router.post(`/ai-agents/agents/${agent.id}/widget-settings/reset`);
    }
  };

  return (
    <Layout>
      <Head title={`Widget Settings - ${agent.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Widget Settings for {agent.name}
            </h1>
            <p className="text-muted-foreground">
              Configure how the AI agent widget appears on your website
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            <Link href={`/ai-agents/agents/${agent.id}/widget-settings/edit`}>
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Edit Settings
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="configuration" className="space-y-6">
          <TabsList>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Basic Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Settings</CardTitle>
                  <CardDescription>
                    Core widget configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Injection Method
                      </p>
                      <p className="font-medium capitalize">
                        {getInjectionMethodLabel(widgetSettings.injection_method)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Trigger Method
                      </p>
                      <p className="font-medium capitalize">
                        {getTriggerMethodLabel(widgetSettings.trigger_method)}
                      </p>
                    </div>
                    {widgetSettings.trigger_method === 'delay' && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Trigger Delay
                        </p>
                        <p className="font-medium">
                          {widgetSettings.trigger_delay_seconds} seconds
                        </p>
                      </div>
                    )}
                    {widgetSettings.injection_method === 'auto_inject' && widgetSettings.auto_inject_selector && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Auto-inject Selector
                        </p>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {widgetSettings.auto_inject_selector}
                        </code>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Display Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Display Settings</CardTitle>
                  <CardDescription>
                    Where and when the widget appears
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span>Show on Mobile</span>
                      </div>
                      {widgetSettings.show_on_mobile ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span>Show on Desktop</span>
                      </div>
                      {widgetSettings.show_on_desktop ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <span>Language Detection</span>
                      </div>
                      {widgetSettings.language_detection ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Geolocation</span>
                      </div>
                      {widgetSettings.geolocation_enabled ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Script URL */}
            <Card>
              <CardHeader>
                <CardTitle>Script URL</CardTitle>
                <CardDescription>
                  The JavaScript file that powers the widget
                </CardDescription>
              </CardHeader>
              <CardContent>
                {widgetSettings.widget_script_url ? (
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-3 py-2 rounded flex-1 truncate">
                      {widgetSettings.widget_script_url}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(widgetSettings.widget_script_url!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Using default widget script</p>
                )}
              </CardContent>
            </Card>

            {/* Custom Code */}
            <div className="grid gap-6 lg:grid-cols-2">
              {widgetSettings.custom_css && (
                <Card>
                  <CardHeader>
                    <CardTitle>Custom CSS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                        {widgetSettings.custom_css}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(widgetSettings.custom_css!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {widgetSettings.custom_js && (
                <Card>
                  <CardHeader>
                    <CardTitle>Custom JavaScript</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                        {widgetSettings.custom_js}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(widgetSettings.custom_js!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Embed Code Tab */}
          <TabsContent value="embed">
            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
                <CardDescription>
                  Add this code to your website to display the AI agent widget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                    {generateEmbedCode()}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateEmbedCode())}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Installation Instructions</h4>
                      <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                        <li>Copy the code above</li>
                        <li>Paste it just before the closing &lt;/body&gt; tag on your website</li>
                        <li>The widget will appear based on your trigger settings</li>
                        <li>For auto-injection, ensure the target element exists</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Widget Preview</CardTitle>
                <CardDescription>
                  Preview how your widget will appear to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between">
                    <Button onClick={handlePreview} variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Generate Preview
                    </Button>
                    {previewCode && (
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(previewCode)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Preview Code
                      </Button>
                    )}
                  </div>

                  {previewCode ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 border-b">
                          <h4 className="font-medium">Preview</h4>
                        </div>
                        <div className="p-4">
                          <div className="aspect-video bg-white border rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="h-8 w-8 text-white" />
                              </div>
                              <h3 className="font-medium">{agent.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Widget preview for {agent.widget_position}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                          {previewCode}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium">No Preview Generated</h3>
                      <p className="text-muted-foreground mt-2">
                        Click "Generate Preview" to see how your widget will look
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// Helper Info component
function Info(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}