import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Copy, Eye, EyeOff, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ToolParameter {
  type?: string;
  description?: string;
  required?: boolean;
  enum?: string[];
  default?: any;
}

interface ToolItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  status: string;
  parameters: Record<string, ToolParameter>;
}

interface AgentToolExecutorProps {
  projectId: string;
  agentId?: string;
  onSuccess?: (result: any) => void;
}

const experimentalCategories = ['media', 'analytics', 'text', 'automation', 'search'];

function normalizeTool(tool: Record<string, any>): ToolItem {
  return {
    id: String(tool.id),
    name: tool.slug ?? tool.name ?? String(tool.id),
    displayName: tool.display_name ?? tool.name ?? tool.slug ?? 'Untitled tool',
    description: tool.description ?? '',
    category: tool.category ?? tool.type ?? 'internal',
    status: tool.status ?? (tool.is_active ? 'active' : 'inactive'),
    parameters: tool.parameters ?? tool.input_schema?.properties ?? {},
  };
}

export default function AgentToolExecutor({
  projectId,
  agentId,
  onSuccess,
}: AgentToolExecutorProps) {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/workspace/projects/${projectId}/tools`);
        setTools((response.data.data ?? []).map(normalizeTool));
      } catch (error) {
        console.error('Failed to fetch workspace tools:', error);
        toast.error('Failed to load tools');
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [projectId]);

  const featuredTools = useMemo(
    () => tools.filter((tool) => experimentalCategories.includes(tool.category)),
    [tools]
  );
  const coreTools = useMemo(
    () => tools.filter((tool) => !experimentalCategories.includes(tool.category)),
    [tools]
  );

  const executeSelectedTool = async () => {
    if (!selectedTool) {
      return;
    }

    try {
      setExecuting(true);
      const response = await axios.post(
        `/api/workspace/projects/${projectId}/tools/${selectedTool.id}/execute`,
        { arguments: { ...parameters, agent_id: agentId } }
      );

      const payload = response.data.data ?? response.data;
      setResult(payload);
      setShowResult(true);
      setExecutionHistory((current) =>
        [
          {
            tool: selectedTool.name,
            params: parameters,
            result: payload,
            timestamp: new Date().toISOString(),
          },
          ...current,
        ].slice(0, 10)
      );
      toast.success(`${selectedTool.displayName} executed successfully`);
      onSuccess?.(payload);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const updateParameter = (key: string, value: any) => {
    setParameters((current) => ({ ...current, [key]: value }));
  };

  const renderToolCard = (tool: ToolItem) => (
    <Card
      key={tool.id}
      className={`cursor-pointer transition ${
        selectedTool?.id === tool.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={() => {
        setSelectedTool(tool);
        setParameters({});
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-1 text-sm">{tool.displayName}</CardTitle>
            <CardDescription className="line-clamp-2 text-xs">{tool.description}</CardDescription>
          </div>
          <Badge variant="secondary">{tool.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500">Status: {tool.status}</p>
      </CardContent>
    </Card>
  );

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
      <div>
        <h3 className="mb-4 text-lg font-semibold text-green-700">Workspace Tools</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{featuredTools.map(renderToolCard)}</div>
      </div>

      {coreTools.length > 0 && (
        <>
          <hr className="border-gray-200" />
          <h3 className="text-sm font-semibold text-gray-600">Core Tools</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{coreTools.map(renderToolCard)}</div>
        </>
      )}

      {selectedTool && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedTool.displayName}</CardTitle>
                <CardDescription>{selectedTool.description}</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedTool(null)}>
                Clear
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Parameters</h4>
              {Object.keys(selectedTool.parameters).length > 0 ? (
                <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  {Object.entries(selectedTool.parameters).map(([key, param]) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-sm font-medium">
                        {key}
                        {param.required && <span className="ml-1 text-red-500">*</span>}
                      </label>
                      {param.enum ? (
                        <select
                          value={parameters[key] ?? param.default ?? ''}
                          onChange={(event) => updateParameter(key, event.target.value)}
                          className="w-full rounded border px-3 py-2 text-sm"
                        >
                          <option value="">Select {key}</option>
                          {param.enum.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={param.type === 'integer' || param.type === 'number' ? 'number' : 'text'}
                          value={parameters[key] ?? param.default ?? ''}
                          onChange={(event) => updateParameter(key, event.target.value)}
                          className="w-full rounded border px-3 py-2 text-sm"
                          placeholder={param.description || `Enter ${key}`}
                        />
                      )}
                      {param.description && <p className="text-xs text-gray-500">{param.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                  This tool does not declare any parameters.
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={executeSelectedTool} disabled={executing}>
                <Play size={16} className="mr-2" />
                {executing ? 'Executing...' : 'Execute Tool'}
              </Button>
              <Button variant="outline" onClick={() => setShowResult((current) => !current)} disabled={!result}>
                {showResult ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                {showResult ? 'Hide Result' : 'Show Result'}
              </Button>
            </div>

            {showResult && result && (
              <div className="space-y-2 rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Latest Result</h4>
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}>
                    <Copy size={14} className="mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {executionHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Recent Executions</h4>
                <div className="space-y-2">
                  {executionHistory.map((entry, index) => (
                    <div key={`${entry.tool}-${index}`} className="rounded border bg-white p-3 text-xs">
                      <div className="font-medium">{entry.tool}</div>
                      <div className="text-gray-500">{new Date(entry.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
