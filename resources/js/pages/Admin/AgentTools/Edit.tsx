import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  TestTube,
  Copy,
  Calendar,
  User,
  Settings,
  Activity,
  Code,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Agent {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
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

interface ShowPageProps {
  tool: AgentTool;
}

const AgentToolsShow = ({ tool }: ShowPageProps) => {
  const [showConfig, setShowConfig] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${tool.name}"? This action cannot be undone.`)) {
      window.location.href = route('admin.agent-tools.destroy', {
        agentTool: tool.id,
        _method: 'DELETE'
      });
    }
  };

  const handleTestTool = () => {
    if (confirm(`Test tool "${tool.name}"? This will send a test request to verify the tool configuration.`)) {
      fetch(route('admin.agent-tools.test', tool.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          test_data: tool.configuration
        })
      })
      .then(response => response.json())
      .then(data => {
        alert(data.message || 'Tool test completed.');
      })
      .catch(error => {
        console.error('Error testing tool:', error);
        alert('Failed to test tool.');
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getToolTypeLabel = (type: string) => {
    return type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1);
  };

  return (
    <AdminLayout>
      <Head title={`Tool: ${tool.name}`} />

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
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
                <Badge variant={tool.is_active ? "success" : "secondary"}>
                  {tool.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {getToolTypeLabel(tool.tool_type)}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Tool ID: {tool.id} • Created {formatDate(tool.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleTestTool}>
              <TestTube className="h-4 w-4 mr-2" />
              Test Tool
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={route('admin.agent-tools.edit', tool.id)}>
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

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="agent">Agent Details</TabsTrigger>
            <TabsTrigger value="json">JSON View</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tool Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Tool Name</h3>
                        <p className="text-lg font-semibold">{tool.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Tool Type</h3>
                        <Badge variant="outline" className="text-base capitalize">
                          {getToolTypeLabel(tool.tool_type)}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Display Order</h3>
                        <p className="text-lg font-semibold">{tool.order}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                        <div className="flex items-center">
                          {tool.is_active ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span className="font-semibold text-green-600">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-red-500 mr-2" />
                              <span className="font-semibold text-red-600">Inactive</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {tool.description && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                        <p className="text-gray-700 whitespace-pre-line">{tool.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Configuration Preview */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Configuration</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfig(!showConfig)}
                      >
                        {showConfig ? (
                          <EyeOff className="h-4 w-4 mr-2" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        {showConfig ? 'Hide' : 'Show'} Values
                      </Button>
                    </div>
                    <CardDescription>
                      {Object.keys(tool.configuration || {}).length} configuration fields
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tool.configuration && Object.keys(tool.configuration).length > 0 ? (
                      <div className="border rounded-lg divide-y">
                        {Object.entries(tool.configuration).map(([key, value], index) => (
                          <div key={index} className="p-4 flex justify-between items-center hover:bg-gray-50">
                            <div>
                              <div className="font-medium text-sm">{key}</div>
                              <div className="text-xs text-gray-500">
                                {typeof value === 'object' ? 'Object/Array' : typeof value}
                              </div>
                            </div>
                            <div className="text-right">
                              {showConfig ? (
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                  {typeof value === 'object'
                                    ? JSON.stringify(value, null, 2).substring(0, 50) + '...'
                                    : String(value)
                                  }
                                </code>
                              ) : (
                                <Badge variant="outline">
                                  {typeof value === 'object' ? 'Hidden' : '••••••'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          No configuration fields defined for this tool.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Agent & Actions */}
              <div className="space-y-6">
                {/* Agent Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Associated Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{tool.agent.name}</h3>
                        <p className="text-sm text-gray-500">Agent ID: {tool.agent.id}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <Badge variant={tool.agent.is_active ? "success" : "secondary"}>
                          {tool.agent.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Slug:</span>
                        <code className="text-sm">{tool.agent.slug}</code>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={route('admin.ai-agents.show', tool.agent_id)}>
                        <Activity className="h-4 w-4 mr-2" />
                        View Agent Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={route('admin.agent-tools.edit', tool.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Tool
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleTestTool}>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Tool
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => copyToClipboard(JSON.stringify(tool, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy JSON'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card>
                  <CardHeader>
                    <CardTitle>Timestamps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-500">Created:</span>
                      </div>
                      <div className="text-sm font-medium">
                        {formatDate(tool.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-500">Updated:</span>
                      </div>
                      <div className="text-sm font-medium">
                        {formatDate(tool.updated_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration">
            <Card>
              <CardHeader>
                <CardTitle>Full Configuration</CardTitle>
                <CardDescription>
                  Complete configuration data for this tool
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-900 text-gray-100 p-4 font-mono text-sm overflow-auto max-h-[600px]">
                    <pre>{JSON.stringify(tool.configuration, null, 2)}</pre>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(JSON.stringify(tool.configuration, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Configuration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Tab */}
          <TabsContent value="agent">
            <Card>
              <CardHeader>
                <CardTitle>Agent Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Agent Details</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Agent Name</h4>
                        <p className="text-lg font-semibold">{tool.agent.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Slug</h4>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{tool.agent.slug}</code>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <div className="flex items-center mt-1">
                          {tool.agent.is_active ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span className="font-semibold text-green-600">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-red-500 mr-2" />
                              <span className="font-semibold text-red-600">Inactive</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={route('admin.ai-agents.show', tool.agent_id)}>
                        <Activity className="h-4 w-4 mr-2" />
                        Go to Agent Dashboard
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Tool Context</h3>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Settings className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-700">Tool Integration</h4>
                      </div>
                      <p className="text-sm text-blue-600 mb-3">
                        This tool is configured for agent <strong>"{tool.agent.name}"</strong>.
                        It can be accessed through the agent's API or interface.
                      </p>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Tool Type: {getToolTypeLabel(tool.tool_type)}</li>
                        <li>• Tool Order: {tool.order}</li>
                        <li>• Tool Status: {tool.is_active ? 'Active' : 'Inactive'}</li>
                        <li>• Configuration Fields: {Object.keys(tool.configuration || {}).length}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* JSON Tab */}
          <TabsContent value="json">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Complete JSON Data</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(JSON.stringify(tool, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy All'}
                  </Button>
                </div>
                <CardDescription>
                  Complete JSON representation of this tool
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-900 text-gray-100 p-4 font-mono text-sm overflow-auto max-h-[600px]">
                    <pre>{JSON.stringify(tool, null, 2)}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AgentToolsShow;
