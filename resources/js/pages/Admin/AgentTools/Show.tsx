import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowLeft, Save, TestTube, Trash2, Plus, Code } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Agent {
  id: number;
  name: string;
}

interface AgentTool {
  id: number;
  agent_id: number;
  agent: Agent;
  tool_type: string;
  name: string;
  description: string | null;
  configuration: Record<string, any>;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

interface EditPageProps {
  tool: AgentTool;
  agents: Agent[];
  toolTypes: string[];
}

interface ConfigurationField {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  value: any;
  required?: boolean;
  description?: string;
}

const AgentToolsEdit = ({ tool, agents, toolTypes }: EditPageProps) => {
  const { data, setData, put, processing, errors } = useForm({
    agent_id: tool.agent_id.toString(),
    tool_type: tool.tool_type,
    name: tool.name,
    description: tool.description || '',
    configuration: tool.configuration || {},
    is_active: tool.is_active,
    order: tool.order,
  });

  const [configFields, setConfigFields] = useState<ConfigurationField[]>([]);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Initialize config fields from existing configuration
  useEffect(() => {
    if (tool.configuration) {
      const fields: ConfigurationField[] = Object.entries(tool.configuration).map(([key, value]) => {
        let type: ConfigurationField['type'] = 'string';
        if (typeof value === 'number') type = 'number';
        if (typeof value === 'boolean') type = 'boolean';
        if (Array.isArray(value)) type = 'array';
        if (value && typeof value === 'object' && !Array.isArray(value)) type = 'object';

        return {
          key,
          type,
          value,
          required: false,
          description: '',
        };
      });
      setConfigFields(fields);
    }
  }, [tool.configuration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert config fields to object
    const configObj: Record<string, any> = {};
    configFields.forEach(field => {
      configObj[field.key] = field.value;
    });

    setData('configuration', configObj);

    put(route('admin.agent-tools.update', tool.id));
  };

  const handleTestTool = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(route('admin.agent-tools.test', tool.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          test_data: configFields.reduce((obj, field) => {
            obj[field.key] = field.value;
            return obj;
          }, {} as Record<string, any>)
        })
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Error testing tool:', error);
      setTestResult({
        success: false,
        message: 'Failed to test tool',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const addConfigField = () => {
    setConfigFields([...configFields, {
      key: `field_${Date.now()}`,
      type: 'string',
      value: '',
      required: false,
      description: ''
    }]);
  };

  const removeConfigField = (index: number) => {
    const newFields = [...configFields];
    newFields.splice(index, 1);
    setConfigFields(newFields);
  };

  const updateConfigField = (index: number, field: Partial<ConfigurationField>) => {
    const newFields = [...configFields];
    newFields[index] = { ...newFields[index], ...field };
    setConfigFields(newFields);
  };

  return (
    <AdminLayout>
      <Head title={`Edit: ${tool.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={route('admin.agent-tools.index')}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Tool</h1>
              <p className="text-muted-foreground">
                {tool.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestTool}
              disabled={isTesting}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Testing...' : 'Test Tool'}
            </Button>
            <Button type="submit" form="edit-tool-form" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">
                {testResult.success ? 'Tool Test Successful' : 'Tool Test Failed'}
              </div>
              <div className="text-sm mb-2">{testResult.message}</div>
              {testResult.tool && (
                <div className="text-xs bg-black/10 p-2 rounded">
                  <pre>{JSON.stringify(testResult.tool, null, 2)}</pre>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <form id="edit-tool-form" onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the basic settings for your tool
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tool Name *</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g., Calculator, Booking System"
                        required
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agent_id">Agent *</Label>
                      <Select
                        value={data.agent_id}
                        onValueChange={(value) => setData('agent_id', value)}
                        required
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
                      {errors.agent_id && (
                        <p className="text-sm text-red-600">{errors.agent_id}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tool_type">Tool Type *</Label>
                      <Select
                        value={data.tool_type}
                        onValueChange={(value) => setData('tool_type', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tool type" />
                        </SelectTrigger>
                        <SelectContent>
                          {toolTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tool_type && (
                        <p className="text-sm text-red-600">{errors.tool_type}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="order">Display Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={data.order}
                        onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                      {errors.order && (
                        <p className="text-sm text-red-600">{errors.order}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Describe what this tool does..."
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    )}
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

            {/* Configuration Tab */}
            <TabsContent value="configuration" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Tool Configuration</CardTitle>
                      <CardDescription>
                        Configure the tool settings and parameters
                      </CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addConfigField}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {configFields.map((field, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{field.type}</Badge>
                            {field.required && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConfigField(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Key</Label>
                            <Input
                              value={field.key}
                              onChange={(e) => updateConfigField(index, { key: e.target.value })}
                              placeholder="field_key"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value: any) => updateConfigField(index, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="array">Array</SelectItem>
                                <SelectItem value="object">Object</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Value</Label>
                            {field.type === 'boolean' ? (
                              <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) => updateConfigField(index, { value: checked })}
                                />
                                <span>{field.value ? 'True' : 'False'}</span>
                              </div>
                            ) : field.type === 'number' ? (
                              <Input
                                type="number"
                                value={field.value}
                                onChange={(e) => updateConfigField(index, { value: parseFloat(e.target.value) || 0 })}
                              />
                            ) : field.type === 'array' || field.type === 'object' ? (
                              <div className="space-y-1">
                                <Textarea
                                  value={JSON.stringify(field.value, null, 2)}
                                  onChange={(e) => {
                                    try {
                                      updateConfigField(index, { value: JSON.parse(e.target.value) });
                                    } catch {
                                      // Keep invalid JSON as string
                                    }
                                  }}
                                  placeholder={`Enter ${field.type} as JSON`}
                                  rows={3}
                                />
                                <div className="text-xs text-gray-500">
                                  Enter valid JSON
                                </div>
                              </div>
                            ) : (
                              <Input
                                value={field.value}
                                onChange={(e) => updateConfigField(index, { value: e.target.value })}
                              />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={field.description || ''}
                            onChange={(e) => updateConfigField(index, { description: e.target.value })}
                            placeholder="Field description..."
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.required || false}
                            onCheckedChange={(checked) => updateConfigField(index, { required: checked })}
                          />
                          <Label className="text-sm">Required Field</Label>
                        </div>
                      </div>
                    ))}

                    {configFields.length === 0 && (
                      <Alert>
                        <AlertDescription>
                          No configuration fields. Add fields to configure your tool.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* JSON Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Raw Configuration (JSON)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={JSON.stringify(
                      configFields.reduce((obj, field) => {
                        obj[field.key] = field.value;
                        return obj;
                      }, {} as Record<string, any>),
                      null,
                      2
                    )}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        const fields: ConfigurationField[] = Object.entries(parsed).map(([key, value]) => {
                          let type: ConfigurationField['type'] = 'string';
                          if (typeof value === 'number') type = 'number';
                          if (typeof value === 'boolean') type = 'boolean';
                          if (Array.isArray(value)) type = 'array';
                          if (value && typeof value === 'object' && !Array.isArray(value)) type = 'object';

                          return {
                            key,
                            type,
                            value,
                            required: false,
                            description: '',
                          };
                        });
                        setConfigFields(fields);
                      } catch {
                        // Invalid JSON, don't update
                      }
                    }}
                    rows={10}
                    className="font-mono text-sm"
                    placeholder='{"key": "value"}'
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tool Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                          {data.name || 'Untitled Tool'}
                        </h3>
                        <Badge className="capitalize">
                          {data.tool_type ? data.tool_type.replace('_', ' ') : 'No Type'}
                        </Badge>
                      </div>

                      {data.description && (
                        <div className="border-t pt-3">
                          <h4 className="font-medium text-sm text-gray-500 mb-1">Description</h4>
                          <p className="text-sm text-gray-600">
                            {data.description}
                          </p>
                        </div>
                      )}

                      <div className="border-t pt-3 space-y-2">
                        <h4 className="font-medium text-sm text-gray-500">Details</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <Badge variant={data.is_active ? "success" : "secondary"}>
                              {data.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Agent:</span>
                            <span className="font-medium">
                              {agents.find(a => a.id.toString() === data.agent_id)?.name || 'Not selected'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Order:</span>
                            <span className="font-medium">{data.order}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Created:</span>
                            <span>{new Date(tool.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Last Updated:</span>
                            <span>{new Date(tool.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {configFields.length > 0 && (
                        <div className="border-t pt-3">
                          <h4 className="font-medium text-sm text-gray-500 mb-2">Configuration ({configFields.length} fields)</h4>
                          <div className="space-y-1">
                            {configFields.slice(0, 5).map((field, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">{field.key}:</span>
                                <span className="font-medium truncate max-w-xs">
                                  {field.type === 'object' || field.type === 'array'
                                    ? JSON.stringify(field.value).substring(0, 50) + '...'
                                    : String(field.value)
                                  }
                                </span>
                              </div>
                            ))}
                            {configFields.length > 5 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{configFields.length - 5} more fields
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configuration Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-[400px]">
                      {JSON.stringify({
                        agent_id: data.agent_id,
                        tool_type: data.tool_type,
                        name: data.name,
                        description: data.description,
                        is_active: data.is_active,
                        order: data.order,
                        configuration: configFields.reduce((obj, field) => {
                          obj[field.key] = field.value;
                          return obj;
                        }, {} as Record<string, any>)
                      }, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AgentToolsEdit;
