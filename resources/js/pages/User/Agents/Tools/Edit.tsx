import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle,
  CheckCircle,
  Code2,
  Settings,
  Copy,
  Trash2,
} from 'lucide-react';
import user from '@/routes/user';

interface Tool {
  id: number;
  name: string;
  tool_type: 'calculator' | 'booking' | 'product_search' | 'support_ticket' | 'custom';
  description?: string;
  configuration?: Record<string, any>;
  is_active: boolean;
}

interface AIAgent {
  id: number;
  name: string;
}

interface EditProps {
  agent: AIAgent;
  tool: Tool;
}

export default function ToolsEdit() {
  const { props } = usePage<{ props: EditProps }>();
  const { agent, tool } = props;
  const [configJSON, setConfigJSON] = useState(
    JSON.stringify(tool.configuration || {}, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const { data, setData, put, processing, errors, delete: destroy } = useForm({
    name: tool.name,
    tool_type: tool.tool_type,
    description: tool.description || '',
    configuration: tool.configuration || {},
    is_active: tool.is_active,
  });

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
      alert('Please fix the JSON configuration errors before submitting');
      return;
    }
    put(user.agents.tools.update.url({ agent: agent.id, tool: tool.id }), {
      onSuccess: () => {
        // Redirect handled by Laravel
      },
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      destroy(
        user.agents.tools.destroy.url({ agent: agent.id, tool: tool.id })
      );
    }
  };

  // Helper function to update configuration in form mode
  const updateConfigurationField = (key: string, value: any) => {
    const updatedConfig = {
      ...data.configuration,
      [key]: value
    };
    setData('configuration', updatedConfig);
    setConfigJSON(JSON.stringify(updatedConfig, null, 2));
  };

  // Get configuration fields based on tool type
  const getDefaultConfigurationFields = () => {
    const baseFields: Record<string, any> = {};
    
    switch (tool.tool_type) {
      case 'calculator':
        baseFields.currency = 'USD';
        baseFields.decimal_places = 2;
        baseFields.rounding_enabled = true;
        break;
      case 'booking':
        baseFields.max_days_ahead = 30;
        baseFields.require_confirmation = true;
        baseFields.timezone = 'UTC';
        break;
      case 'product_search':
        baseFields.max_results = 10;
        baseFields.search_fields = ['name', 'description'];
        baseFields.sort_by = 'relevance';
        break;
      case 'support_ticket':
        baseFields.priority_levels = ['low', 'medium', 'high'];
        baseFields.auto_assign = true;
        baseFields.response_timeout = 24;
        break;
      case 'custom':
        baseFields.custom_endpoint = '';
        baseFields.request_method = 'POST';
        break;
    }
    
    return { ...baseFields, ...data.configuration };
  };

  const configurationFields = getDefaultConfigurationFields();

  return (
    <Layout>
      <Head title={`Edit ${tool.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={user.agents.tools.index.url(agent.id)}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Edit Tool
              </h1>
              <p className="text-muted-foreground mt-1">
                Update <strong>{tool.name}</strong> for {agent.name}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Tool
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Update the tool configuration below. Changes will be applied immediately to your AI agent.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tool Details</CardTitle>
            <CardDescription>
              Modify the tool information and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Product Search"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Tool Type (Read-only info) */}
              <div>
                <Label htmlFor="tool_type">Tool Type</Label>
                <div className="mt-2 px-3 py-2 bg-gray-100 rounded border border-gray-200 text-sm font-medium">
                  {data.tool_type.replace(/_/g, ' ').toUpperCase()}
                </div>
                <p className="text-sm text-gray-500 mt-1">Tool type cannot be changed after creation</p>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this tool does..."
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Configuration Tabs */}
              <div>
                <Label>Configuration</Label>
                <Tabs defaultValue="json" className="mt-3">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="form">
                      <Settings className="w-4 h-4 mr-2" />
                      Form
                    </TabsTrigger>
                    <TabsTrigger value="json">
                      <Code2 className="w-4 h-4 mr-2" />
                      JSON
                    </TabsTrigger>
                  </TabsList>

                  {/* Form Tab */}
                  <TabsContent value="form" className="space-y-4 mt-4">
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-600">
                        Edit configuration fields below. Changes will be reflected in the JSON tab.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {Object.entries(configurationFields).map(([key, value]) => (
                        <div key={key}>
                          <Label htmlFor={`config-${key}`} className="capitalize font-medium">
                            {key.replace(/_/g, ' ')}
                          </Label>
                          {Array.isArray(value) ? (
                            <Textarea
                              id={`config-${key}`}
                              value={JSON.stringify(value, null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  updateConfigurationField(key, parsed);
                                } catch (e) {
                                  // Keep current value
                                }
                              }}
                              rows={4}
                              className="font-mono text-sm"
                            />
                          ) : typeof value === 'number' ? (
                            <Input
                              id={`config-${key}`}
                              type="number"
                              value={value}
                              onChange={(e) => {
                                const newVal = e.target.value ? parseInt(e.target.value) : 0;
                                updateConfigurationField(key, newVal);
                              }}
                            />
                          ) : typeof value === 'boolean' ? (
                            <Select
                              value={String(value)}
                              onValueChange={(val) => updateConfigurationField(key, val === 'true')}
                            >
                              <SelectTrigger id={`config-${key}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={`config-${key}`}
                              type="text"
                              value={String(value)}
                              onChange={(e) => updateConfigurationField(key, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* JSON Tab */}
                  <TabsContent value="json" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="configuration">Configuration (JSON)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      id="configuration"
                      placeholder='{\n  "key": "value"\n}'
                      value={configJSON}
                      onChange={(e) => handleConfigChange(e.target.value)}
                      rows={10}
                      className={`font-mono text-sm ${jsonError ? 'border-red-500' : ''}`}
                      spellCheck="false"
                    />
                    {jsonError && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>JSON Error:</strong> {jsonError}
                        </AlertDescription>
                      </Alert>
                    )}
                    {!jsonError && configJSON && configJSON !== '{}' && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Valid JSON configuration
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
                {errors.configuration && (
                  <p className="text-sm text-red-500 mt-2">{errors.configuration}</p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded border">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  className="rounded border-gray-300 cursor-pointer"
                />
                <Label htmlFor="is_active" className="cursor-pointer font-medium">
                  {data.is_active ? '🟢' : '⚫'} Tool is {data.is_active ? 'Active' : 'Inactive'}
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                {data.is_active 
                  ? 'This tool is available to your AI agent' 
                  : 'This tool is hidden from your AI agent'}
              </p>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-6 border-t">
                <Link href={user.agents.tools.index.url(agent.id)}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button disabled={processing || !!jsonError} className="gap-2">
                  <Save className="w-4 h-4" />
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}