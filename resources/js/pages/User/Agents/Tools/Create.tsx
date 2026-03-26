import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/layouts/UserLayout';
import user from '@/routes/user';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
  AlertCircle, 
  ArrowLeft, 
  Calculator, 
  Calendar, 
  CheckCircle, 
  Copy, 
  Database, 
  Info, 
  Save, 
  Search,
  Settings,
  Shield,
  Terminal,
  Ticket,
  Wand2
} from 'lucide-react';
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';

interface AIAgent {
  id: number;
  name: string;
}

interface CreateProps {
  agent: AIAgent;
}

// Tool templates for different types
const TOOL_TEMPLATES = {
  calculator: {
    name: 'Calculator',
    description: 'Perform basic mathematical calculations and conversions',
    icon: Calculator,
    configuration: {
      operations: ['add', 'subtract', 'multiply', 'divide', 'percentage', 'square_root'],
      precision: 2,
      allow_negative_results: true
    },
  },
  booking: {
    name: 'Booking Manager',
    description: 'Schedule and manage appointments, meetings, and reservations',
    icon: Calendar,
    configuration: {
      api_endpoint: '',
      api_key: '',
      timeout_seconds: 30,
      allowed_durations: [15, 30, 45, 60],
      timezone: 'UTC',
      buffer_time_minutes: 5
    },
  },
  product_search: {
    name: 'Product Search',
    description: 'Search and retrieve product information from your catalog',
    icon: Search,
    configuration: {
      api_endpoint: '',
      api_key: '',
      timeout_seconds: 15,
      max_results: 10,
      fields: ['name', 'price', 'description', 'category'],
      sort_by: 'relevance'
    },
  },
  support_ticket: {
    name: 'Support Ticket System',
    description: 'Create and track customer support tickets',
    icon: Ticket,
    configuration: {
      api_endpoint: '',
      api_key: '',
      priority_levels: ['low', 'medium', 'high', 'urgent'],
      categories: ['technical', 'billing', 'account', 'general'],
      auto_assign: true
    },
  },
  custom: {
    name: 'Custom Integration',
    description: 'Connect to any external API or service',
    icon: Terminal,
    configuration: {
      api_endpoint: '',
      api_key: '',
      request_method: 'GET',
      timeout_seconds: 30,
      headers: {},
      parameters: {}
    },
  },
};

export default function ToolsCreate() {
  const { props } = usePage<{ props: CreateProps }>();
  const { agent } = props;
  const [configJSON, setConfigJSON] = useState('{\n  \n}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    tool_type: 'custom',
    description: '',
    configuration: {},
    is_active: true,
  });

  // Update template when tool type changes
  const handleToolTypeChange = (value: string) => {
    setData('tool_type', value as any);
    const template = TOOL_TEMPLATES[value as keyof typeof TOOL_TEMPLATES];
    if (template) {
      setData('name', data.name || template.name);
      setData('description', template.description);
      setData('configuration', template.configuration);
      setConfigJSON(JSON.stringify(template.configuration, null, 2));
      setJsonError(null);
    }
  };

  const handleConfigChange = (value: string) => {
    setConfigJSON(value);
    try {
      const parsed = JSON.parse(value);
      setData('configuration', parsed);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(configJSON);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jsonError) {
      alert('Please fix configuration errors before submitting');
      return;
    }
    post(user.agents.tools.store.url(agent.id));
  };

  const template = TOOL_TEMPLATES[data.tool_type as keyof typeof TOOL_TEMPLATES];
  const IconComponent = template?.icon || Terminal;

  return (
    <Layout>
      <Head title="Add New Tool" />

      <div className="container max-w-4xl py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link href={user.agents.tools.index.url(agent.id)}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tools
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Tool</h1>
            <p className="text-muted-foreground">
              Extend <span className="font-medium text-primary">{agent.name}</span>'s capabilities with a new tool
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Info Card */}
          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-blue-900">About Tools</p>
                  <p className="text-sm text-blue-700">
                    Tools allow your AI agent to perform actions like calculations, data lookups, and API calls.
                    Choose a template or create a custom integration.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tool Configuration</CardTitle>
              <CardDescription>
                Configure your tool's settings and behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tool Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Tool Type</Label>
                  <Select value={data.tool_type} onValueChange={handleToolTypeChange}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a tool type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TOOL_TEMPLATES).map(([key, template]) => {
                        const Icon = template.icon;
                        return (
                          <SelectItem key={key} value={key} className="py-3">
                            <div className="flex items-center gap-3">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{template.name}</p>
                                <p className="text-xs text-muted-foreground">{template.description}</p>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.tool_type && (
                    <p className="text-sm text-destructive">{errors.tool_type}</p>
                  )}
                </div>

                {/* Tool Details */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="font-medium">
                      Tool Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Product Catalog Search"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      A clear name helps identify this tool
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="font-medium">
                      Tool Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this tool does..."
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      rows={3}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Configuration</Label>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconComponent className="h-4 w-4" />
                      <span>{template?.name} Settings</span>
                    </div>
                  </div>

                  <Tabs defaultValue="form" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="form" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Form Editor
                      </TabsTrigger>
                      <TabsTrigger value="json" className="gap-2">
                        <Terminal className="h-4 w-4" />
                        JSON Editor
                      </TabsTrigger>
                    </TabsList>

                    {/* Form Editor Tab */}
                    <TabsContent value="form" className="space-y-4">
                      {template && template.configuration && (
                        <div className="rounded-lg border bg-card p-4">
                          <div className="space-y-4">
                            {Object.entries(template.configuration).map(([key, defaultValue]) => (
                              <div key={key} className="space-y-2">
                                <Label htmlFor={key} className="capitalize font-medium">
                                  {key.replace(/_/g, ' ')}
                                </Label>
                                {Array.isArray(defaultValue) ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      id={key}
                                      placeholder="Enter values as JSON array..."
                                      value={JSON.stringify(
                                        data.configuration[key as any] || defaultValue,
                                        null,
                                        2
                                      )}
                                      onChange={(e) => {
                                        try {
                                          const parsed = JSON.parse(e.target.value);
                                          setData('configuration', {
                                            ...data.configuration,
                                            [key]: parsed,
                                          });
                                          handleConfigChange(
                                            JSON.stringify(
                                              { ...data.configuration, [key]: parsed },
                                              null,
                                              2
                                            )
                                          );
                                        } catch {
                                          // Keep current value
                                        }
                                      }}
                                      rows={3}
                                      className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Enter as JSON array, e.g., ["value1", "value2"]
                                    </p>
                                  </div>
                                ) : typeof defaultValue === 'number' ? (
                                  <Input
                                    id={key}
                                    type="number"
                                    value={data.configuration[key as any] ?? defaultValue}
                                    onChange={(e) => {
                                      const newVal = e.target.value ? Number(e.target.value) : defaultValue;
                                      setData('configuration', {
                                        ...data.configuration,
                                        [key]: newVal,
                                      });
                                      handleConfigChange(
                                        JSON.stringify(
                                          { ...data.configuration, [key]: newVal },
                                          null,
                                          2
                                        )
                                      );
                                    }}
                                  />
                                ) : typeof defaultValue === 'boolean' ? (
                                  <div className="flex items-center gap-3 pt-2">
                                    <Switch
                                      checked={data.configuration[key as any] ?? defaultValue}
                                      onCheckedChange={(checked) => {
                                        setData('configuration', {
                                          ...data.configuration,
                                          [key]: checked,
                                        });
                                        handleConfigChange(
                                          JSON.stringify(
                                            { ...data.configuration, [key]: checked },
                                            null,
                                            2
                                          )
                                        );
                                      }}
                                    />
                                    <span className="text-sm">
                                      {data.configuration[key as any] ?? defaultValue ? 'Enabled' : 'Disabled'}
                                    </span>
                                  </div>
                                ) : (
                                  <Input
                                    id={key}
                                    type="text"
                                    placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
                                    value={data.configuration[key as any] || defaultValue}
                                    onChange={(e) => {
                                      setData('configuration', {
                                        ...data.configuration,
                                        [key]: e.target.value,
                                      });
                                      handleConfigChange(
                                        JSON.stringify(
                                          { ...data.configuration, [key]: e.target.value },
                                          null,
                                          2
                                        )
                                      );
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* JSON Editor Tab */}
                    <TabsContent value="json" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="configuration" className="font-medium">
                            Configuration JSON
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                        <Textarea
                          id="configuration"
                          placeholder='{\n  "setting": "value"\n}'
                          value={configJSON}
                          onChange={(e) => handleConfigChange(e.target.value)}
                          rows={10}
                          className={`font-mono text-sm ${
                            jsonError ? 'border-destructive' : 'border-input'
                          }`}
                          spellCheck="false"
                        />
                        {jsonError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Invalid JSON: {jsonError}
                            </AlertDescription>
                          </Alert>
                        )}
                        {!jsonError && configJSON.trim() !== '{\n  \n}' && (
                          <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              Valid JSON configuration
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  {errors.configuration && (
                    <p className="text-sm text-destructive">{errors.configuration}</p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="space-y-6 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="font-medium">Tool Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Active tools are available for your AI agent to use
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={data.is_active}
                        onCheckedChange={(checked) => setData('is_active', checked)}
                      />
                      <span className="font-medium">
                        {data.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Link href={user.agents.tools.index.url(agent.id)}>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={processing || !!jsonError}
                      className="gap-2 min-w-[140px]"
                    >
                      {processing ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Create Tool
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">
                • API keys are encrypted and stored securely
              </p>
              <p className="text-muted-foreground">
                • All API calls are logged for monitoring and debugging
              </p>
              <p className="text-muted-foreground">
                • Test your configuration before activating the tool
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}