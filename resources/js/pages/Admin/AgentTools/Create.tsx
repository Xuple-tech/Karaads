import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Plus, Trash2, Code } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Agent {
  id: number;
  name: string;
}

interface CreatePageProps {
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

const AgentToolsCreate = ({ agents, toolTypes }: CreatePageProps) => {
  const { data, setData, post, processing, errors } = useForm({
    agent_id: '',
    tool_type: '',
    name: '',
    description: '',
    configuration: {} as Record<string, any>,
    is_active: true,
    order: 0,
  });

  const [configFields, setConfigFields] = useState<ConfigurationField[]>([
    { key: 'api_endpoint', type: 'string', value: '', required: true, description: 'API endpoint URL' },
    { key: 'method', type: 'string', value: 'POST', required: true, description: 'HTTP method' },
    { key: 'timeout', type: 'number', value: 30, required: false, description: 'Request timeout in seconds' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert config fields to object
    const configObj: Record<string, any> = {};
    configFields.forEach(field => {
      configObj[field.key] = field.value;
    });

    setData('configuration', configObj);

    post(route('admin.agent-tools.store'));
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
      <Head title="Create Agent Tool" />

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
              <h1 className="text-3xl font-bold tracking-tight">Create Agent Tool</h1>
              <p className="text-muted-foreground">
                Create a new tool for AI agents to use
              </p>
            </div>
          </div>
          <Button type="submit" form="create-tool-form" disabled={processing}>
            <Save className="h-4 w-4 mr-2" />
            {processing ? 'Creating...' : 'Create Tool'}
          </Button>
        </div>

        {/* Main Form */}
        <form id="create-tool-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Configure the basic settings for your tool
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

              {/* Configuration Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Tool Configuration</CardTitle>
                  <CardDescription>
                    Configure the tool settings and parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Configuration Fields</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addConfigField}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

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
                          No configuration fields added. Add fields to configure your tool.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & Help */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tool Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {data.name || 'Untitled Tool'}
                      </h3>
                      <Badge className="capitalize">
                        {data.tool_type ? data.tool_type.replace('_', ' ') : 'No Type'}
                      </Badge>
                    </div>

                    {data.description && (
                      <p className="text-sm text-gray-600">
                        {data.description}
                      </p>
                    )}

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
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tool Types Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {toolTypes.map((type) => (
                    <div key={type} className="text-sm">
                      <div className="font-medium capitalize">
                        {type.replace('_', ' ')}
                      </div>
                      <div className="text-gray-600">
                        {type === 'calculator' && 'Mathematical calculations and conversions'}
                        {type === 'booking' && 'Appointment and reservation management'}
                        {type === 'product_search' && 'Product search and catalog browsing'}
                        {type === 'support_ticket' && 'Customer support ticket system'}
                        {type === 'custom' && 'Custom tool with specific functionality'}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>JSON Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-auto">
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
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AgentToolsCreate;
