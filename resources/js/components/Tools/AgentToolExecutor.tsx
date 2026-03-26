import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Play, Copy, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ToolParameter {
  type: string;
  description?: string;
  required?: boolean;
  enum?: string[];
  default?: any;
}

interface Tool {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  parameters?: Record<string, ToolParameter>;
  return_schema?: Record<string, any>;
  rate_limit: number;
  is_active: boolean;
}

interface AgentToolExecutorProps {
  projectId: string;
  agentId?: string;
  onSuccess?: (result: any) => void;
}

export default function AgentToolExecutor({
  projectId,
  agentId,
  onSuccess,
}: AgentToolExecutorProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);

  const newToolCategories = ['media', 'analytics', 'text', 'automation', 'search'];

  useEffect(() => {
    fetchTools();
  }, [projectId]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${projectId}/tools`);
      setTools(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tools:', error);
      toast.error('Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const newTools = tools.filter(t => newToolCategories.includes(t.category));
  const legacyTools = tools.filter(t => !newToolCategories.includes(t.category));

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      search: '🔍',
      file: '📁',
      api: '🔌',
      code: '💻',
      utility: '⚙️',
      media: '🖼️',
      analytics: '📊',
      text: '📝',
      automation: '⚙️',
    };
    return icons[category] || '🔧';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      search: 'bg-blue-100 text-blue-800',
      file: 'bg-purple-100 text-purple-800',
      api: 'bg-green-100 text-green-800',
      code: 'bg-orange-100 text-orange-800',
      utility: 'bg-gray-100 text-gray-800',
      media: 'bg-pink-100 text-pink-800',
      analytics: 'bg-cyan-100 text-cyan-800',
      text: 'bg-amber-100 text-amber-800',
      automation: 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleExecute = async () => {
    if (!selectedTool) return;

    try {
      setExecuting(true);
      const response = await axios.post(
        `/api/projects/${projectId}/tools/${selectedTool.name}/execute`,
        {
          ...parameters,
          agent_id: agentId,
        }
      );

      setResult(response.data);
      setShowResult(true);
      setExecutionHistory([
        {
          tool: selectedTool.name,
          params: parameters,
          result: response.data,
          timestamp: new Date(),
        },
        ...executionHistory,
      ].slice(0, 10));

      toast.success(`${selectedTool.display_name} executed successfully`);
      onSuccess?.(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading tools...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tools Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
          ✨ New Powerful Tools
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {newTools.map(tool => (
            <Card
              key={tool.id}
              className={`cursor-pointer transition ${
                selectedTool?.id === tool.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => {
                setSelectedTool(tool);
                setParameters({});
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getCategoryIcon(tool.category)}</span>
                      <CardTitle className="text-sm line-clamp-1">
                        {tool.display_name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs line-clamp-2">
                      {tool.description}
                    </CardDescription>
                  </div>
                  <Badge className={getCategoryColor(tool.category)} variant="secondary">
                    {tool.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  Rate: {tool.rate_limit}/min
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Divider */}
      {legacyTools.length > 0 && (
        <>
          <hr className="border-gray-200" />
          <h3 className="text-sm font-semibold text-gray-600">Core Tools</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {legacyTools.map(tool => (
              <Card
                key={tool.id}
                className={`cursor-pointer transition ${
                  selectedTool?.id === tool.id
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => {
                  setSelectedTool(tool);
                  setParameters({});
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-sm">
                        {tool.display_name}
                      </CardTitle>
                    </div>
                    <Badge className={getCategoryColor(tool.category)} variant="secondary">
                      {tool.category}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Tool Details & Executor */}
      {selectedTool && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCategoryIcon(selectedTool.category)}</span>
                <div>
                  <CardTitle>{selectedTool.display_name}</CardTitle>
                  <CardDescription>{selectedTool.description}</CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedTool(null)}
              >
                Clear
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Parameters */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Parameters</h4>
              {selectedTool.parameters && Object.keys(selectedTool.parameters).length > 0 ? (
                <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                  {Object.entries(selectedTool.parameters).map(([key, param]: [string, any]) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-sm font-medium">
                        {key}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {param.enum ? (
                        <select
                          value={parameters[key] ?? param.default ?? ''}
                          onChange={(e) => handleParameterChange(key, e.target.value)}
                          className="w-full border rounded px-3 py-2 text-sm"
                        >
                          <option value="">Select {key}</option>
                          {param.enum.map((opt: string) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : param.type === 'integer' ? (
                        <input
                          type="number"
                          value={parameters[key] ?? param.default ?? ''}
                          onChange={(e) => handleParameterChange(key, parseInt(e.target.value))}
                          placeholder={param.default ?? ''}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      ) : param.type === 'object' || param.type === 'array' ? (
                        <textarea
                          value={
                            typeof parameters[key] === 'string'
                              ? parameters[key]
                              : JSON.stringify(parameters[key] ?? '', null, 2)
                          }
                          onChange={(e) => {
                            try {
                              handleParameterChange(key, JSON.parse(e.target.value));
                            } catch {
                              handleParameterChange(key, e.target.value);
                            }
                          }}
                          placeholder={`Enter JSON ${param.type}`}
                          className="w-full border rounded px-3 py-2 text-sm font-mono"
                          rows={3}
                        />
                      ) : (
                        <input
                          type="text"
                          value={parameters[key] ?? param.default ?? ''}
                          onChange={(e) => handleParameterChange(key, e.target.value)}
                          placeholder={param.description}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      )}
                      <p className="text-xs text-gray-500">{param.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No parameters required</p>
              )}
            </div>

            {/* Execute Button */}
            <Button
              onClick={handleExecute}
              disabled={executing}
              className="w-full"
              size="lg"
            >
              <Play size={18} className="mr-2" />
              {executing ? 'Executing...' : 'Execute Tool'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Result Viewer */}
      {result && (
        <Card className={`border-2 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {result.success ? '✓' : '✗'} Execution Result
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowResult(!showResult)}
              >
                {showResult ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </CardHeader>
          {showResult && (
            <CardContent>
              <Tabs defaultValue="result" className="w-full">
                <TabsList>
                  <TabsTrigger value="result">Result</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="result" className="mt-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">Status:</span>{' '}
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Message:</span> {result.message}
                    </p>
                    {result.data && (
                      <div className="mt-4 p-3 bg-white rounded border text-sm">
                        <pre className="overflow-auto max-h-64">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="json" className="mt-4">
                  <pre className="p-3 bg-gray-900 text-gray-100 rounded overflow-auto max-h-96 text-xs">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                      toast.success('Copied to clipboard');
                    }}
                    className="mt-2"
                  >
                    <Copy size={14} className="mr-2" />
                    Copy JSON
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      )}

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {executionHistory.map((exec, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded text-sm border border-gray-200">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{exec.tool}</p>
                      <p className="text-xs text-gray-500">
                        {exec.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant={exec.result?.success ? 'default' : 'destructive'}>
                      {exec.result?.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
