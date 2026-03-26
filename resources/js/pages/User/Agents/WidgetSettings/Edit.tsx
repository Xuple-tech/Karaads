import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Layout from '@/layouts/UserLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ArrowLeft, Code, Settings, Eye, Copy } from 'lucide-react';

interface AIAgent {
  id: number;
  name: string;
  slug: string;
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

interface WidgetSettingsEditProps {
  agent: AIAgent;
  widgetSettings: WidgetSettings;
}

export default function WidgetSettingsEdit() {
  const { props } = usePage<{ props: WidgetSettingsEditProps }>();
  const { agent, widgetSettings } = props;

  const { data, setData, put, processing, errors } = useForm({
    widget_script_url: widgetSettings.widget_script_url || '',
    injection_method: widgetSettings.injection_method,
    auto_inject_selector: widgetSettings.auto_inject_selector || '',
    trigger_method: widgetSettings.trigger_method,
    trigger_delay_seconds: widgetSettings.trigger_delay_seconds,
    show_on_mobile: widgetSettings.show_on_mobile,
    show_on_desktop: widgetSettings.show_on_desktop,
    language_detection: widgetSettings.language_detection,
    geolocation_enabled: widgetSettings.geolocation_enabled,
    custom_css: widgetSettings.custom_css || '',
    custom_js: widgetSettings.custom_js || '',
    widget_config: widgetSettings.widget_config || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/agents/agents/${agent.id}/widget-settings`);
  };

  const injectionMethods = [
    { value: 'manual', label: 'Manual Injection', description: 'Add embed code manually to your site' },
    { value: 'auto_inject', label: 'Auto-inject', description: 'Automatically inject into target element' },
  ];

  const triggerMethods = [
    { value: 'click', label: 'Click to Open', description: 'User clicks widget to open' },
    { value: 'hover', label: 'Hover to Open', description: 'Widget opens on hover' },
    { value: 'delay', label: 'Delay Auto-open', description: 'Opens automatically after delay' },
    { value: 'scroll', label: 'Scroll Trigger', description: 'Opens when user scrolls' },
    { value: 'exit_intent', label: 'Exit Intent', description: 'Opens when user tries to leave' },
  ];

  return (
    <Layout>
      <Head title={`Edit Widget Settings - ${agent.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/agents/agents/${agent.id}/widget-settings`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Widget Settings
            </h1>
            <p className="text-muted-foreground">
              Configure how {agent.name} appears on your website
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Widget Configuration</CardTitle>
                  <CardDescription>
                    Configure how the widget appears and behaves
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="injection" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="injection">Injection</TabsTrigger>
                      <TabsTrigger value="triggers">Triggers</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    {/* Injection Tab */}
                    <TabsContent value="injection" className="space-y-6 pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="widget_script_url">Widget Script URL</Label>
                          <Input
                            id="widget_script_url"
                            value={data.widget_script_url}
                            onChange={(e) => setData('widget_script_url', e.target.value)}
                            placeholder="https://cdn.example.com/widget.js"
                            type="url"
                            className="mt-2"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            URL of the widget JavaScript file
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="injection_method">Injection Method</Label>
                          <Select
                            value={data.injection_method}
                            onValueChange={(value) => setData('injection_method', value)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select injection method" />
                            </SelectTrigger>
                            <SelectContent>
                              {injectionMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  <div>
                                    <div className="font-medium">{method.label}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {method.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {data.injection_method === 'auto_inject' && (
                          <div>
                            <Label htmlFor="auto_inject_selector">CSS Selector</Label>
                            <Input
                              id="auto_inject_selector"
                              value={data.auto_inject_selector}
                              onChange={(e) => setData('auto_inject_selector', e.target.value)}
                              placeholder="#widget-container, .chat-widget, body"
                              className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              CSS selector where the widget should be injected
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Triggers Tab */}
                    <TabsContent value="triggers" className="space-y-6 pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="trigger_method">Trigger Method</Label>
                          <Select
                            value={data.trigger_method}
                            onValueChange={(value) => setData('trigger_method', value)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select trigger method" />
                            </SelectTrigger>
                            <SelectContent>
                              {triggerMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  <div>
                                    <div className="font-medium">{method.label}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {method.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {data.trigger_method === 'delay' && (
                          <div>
                            <Label htmlFor="trigger_delay_seconds">Delay (seconds)</Label>
                            <Input
                              id="trigger_delay_seconds"
                              type="number"
                              min="0"
                              max="60"
                              value={data.trigger_delay_seconds}
                              onChange={(e) => setData('trigger_delay_seconds', parseInt(e.target.value) || 0)}
                              className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              Delay before widget automatically opens
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="show_on_mobile">Show on Mobile</Label>
                            <p className="text-sm text-muted-foreground">
                              Display widget on mobile devices
                            </p>
                          </div>
                          <Switch
                            id="show_on_mobile"
                            checked={data.show_on_mobile}
                            onCheckedChange={(checked) => setData('show_on_mobile', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="show_on_desktop">Show on Desktop</Label>
                            <p className="text-sm text-muted-foreground">
                              Display widget on desktop devices
                            </p>
                          </div>
                          <Switch
                            id="show_on_desktop"
                            checked={data.show_on_desktop}
                            onCheckedChange={(checked) => setData('show_on_desktop', checked)}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Advanced Tab */}
                    <TabsContent value="advanced" className="space-y-6 pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="language_detection">Language Detection</Label>
                            <p className="text-sm text-muted-foreground">
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
                            <Label htmlFor="geolocation_enabled">Geolocation</Label>
                            <p className="text-sm text-muted-foreground">
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

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="custom_css">Custom CSS</Label>
                          <Textarea
                            id="custom_css"
                            value={data.custom_css}
                            onChange={(e) => setData('custom_css', e.target.value)}
                            placeholder=".ai-widget { /* custom styles */ }"
                            rows={6}
                            className="mt-2 font-mono text-sm"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Custom CSS to style the widget
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="custom_js">Custom JavaScript</Label>
                          <Textarea
                            id="custom_js"
                            value={data.custom_js}
                            onChange={(e) => setData('custom_js', e.target.value)}
                            placeholder="// Custom JavaScript logic"
                            rows={6}
                            className="mt-2 font-mono text-sm"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Custom JavaScript for advanced functionality
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex items-center justify-between pt-6 border-t">
                    <Link href={`/agents/agents/${agent.id}/widget-settings`}>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Widget behavior preview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Injection:</span>
                      <span className="font-medium capitalize">
                        {injectionMethods.find(m => m.value === data.injection_method)?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Trigger:</span>
                      <span className="font-medium capitalize">
                        {triggerMethods.find(m => m.value === data.trigger_method)?.label}
                      </span>
                    </div>
                    {data.trigger_method === 'delay' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delay:</span>
                        <span className="font-medium">{data.trigger_delay_seconds}s</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mobile:</span>
                      <span className="font-medium">
                        {data.show_on_mobile ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Desktop:</span>
                      <span className="font-medium">
                        {data.show_on_desktop ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• Use manual injection for full control</p>
                  <p>• Auto-inject is easier but requires specific selectors</p>
                  <p>• Test triggers on different devices</p>
                  <p>• Custom CSS/JS can override default styles</p>
                  <p>• Preview changes before saving</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}