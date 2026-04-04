import { useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle, Copy, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface ToolLike {
  id?: string;
  name?: string;
  slug?: string;
  display_name?: string;
  description?: string;
  parameters?: Record<string, any>;
  input_schema?: { properties?: Record<string, any> };
  return_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
}

interface ToolExecutorProps {
  projectId: string;
  tool: ToolLike;
}

interface ExecutionResult {
  success: boolean;
  message: string;
  data: any;
  timestamp: string;
}

function normalizedName(tool: ToolLike) {
  return tool.display_name ?? tool.name ?? tool.slug ?? 'Untitled tool';
}

function normalizedParameters(tool: ToolLike) {
  return tool.parameters ?? tool.input_schema?.properties ?? {};
}

function normalizedOutputSchema(tool: ToolLike) {
  return tool.return_schema ?? tool.output_schema ?? {};
}

export default function ToolExecutor({ projectId, tool }: ToolExecutorProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [jsonInput, setJsonInput] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState('builder');

  const parameterSchema = useMemo(() => normalizedParameters(tool), [tool]);
  const outputSchema = useMemo(() => normalizedOutputSchema(tool), [tool]);

  const handleExecute = async () => {
    try {
      setLoading(true);

      let finalParams = parameters;
      if (activeTab === 'json') {
        try {
          finalParams = JSON.parse(jsonInput);
        } catch {
          const invalid = {
            success: false,
            message: 'Invalid JSON input',
            data: null,
            timestamp: new Date().toISOString(),
          };
          toast.error(invalid.message);
          setResult(invalid);
          return;
        }
      }

      const response = await axios.post(
        `/api/workspace/projects/${projectId}/tools/${tool.id}/execute`,
        { arguments: finalParams }
      );

      const payload = response.data.data ?? response.data;
      setResult({
        success: payload.success !== false,
        message: payload.message ?? 'Tool executed successfully',
        data: payload,
        timestamp: new Date().toISOString(),
      });
      toast.success('Tool executed successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Tool execution failed';
      toast.error(errorMessage);
      setResult({
        success: false,
        message: errorMessage,
        data: error.response?.data ?? null,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResultToClipboard = () => {
    if (!result) {
      return;
    }

    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast.success('Result copied to clipboard');
  };

  const updateParameter = (key: string, value: any) => {
    setParameters((current) => ({ ...current, [key]: value }));
  };

  const removeParameter = (key: string) => {
    setParameters((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const addParameter = (key: string, value: any = '') => {
    if (!key) {
      return;
    }

    updateParameter(key, value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Test {normalizedName(tool)}
        </CardTitle>
        <CardDescription>{tool.description ?? 'Execute this tool with sample inputs.'}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Parameter Builder</TabsTrigger>
            <TabsTrigger value="json">JSON Input</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-4">
            {Object.keys(parameterSchema).length > 0 ? (
              <div className="space-y-3">
                <Label className="font-medium">Parameters:</Label>
                {Object.entries(parameterSchema).map(([key, param]: any) => (
                  <div key={key}>
                    <Label className="mb-1 text-sm">
                      {param.description || key}
                      {param.required && <span className="ml-1 text-red-500">*</span>}
                    </Label>
                    <Input
                      placeholder={`Enter ${key}...`}
                      value={parameters[key] || ''}
                      onChange={(event) => updateParameter(key, event.target.value)}
                      type={param.type === 'integer' || param.type === 'number' ? 'number' : 'text'}
                    />
                    {param.enum && (
                      <p className="mt-1 text-xs text-gray-600">
                        Allowed values: {param.enum.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">This tool has no declared parameters.</p>
            )}

            <div className="border-t pt-4">
              <Label className="mb-3 block font-medium">Additional Parameters:</Label>
              <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
                {Object.entries(parameters).map(([key, value]) => {
                  if (key in parameterSchema) {
                    return null;
                  }

                  return (
                    <div key={key} className="flex items-end gap-2">
                      <Input value={key} readOnly className="flex-1 text-sm" disabled />
                      <Input
                        value={typeof value === 'string' ? value : JSON.stringify(value)}
                        onChange={(event) => updateParameter(key, event.target.value)}
                        className="flex-1 text-sm"
                      />
                      <Button size="sm" variant="destructive" onClick={() => removeParameter(key)}>
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Input id="workspace-custom-key" placeholder="Parameter name" className="text-sm" />
                <Input id="workspace-custom-value" placeholder="Value" className="text-sm" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const keyInput = document.getElementById('workspace-custom-key') as HTMLInputElement | null;
                    const valueInput = document.getElementById('workspace-custom-value') as HTMLInputElement | null;

                    if (!keyInput?.value) {
                      return;
                    }

                    addParameter(keyInput.value, valueInput?.value ?? '');
                    keyInput.value = '';
                    if (valueInput) {
                      valueInput.value = '';
                    }
                  }}
                >
                  Add Parameter
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <Label className="font-medium">JSON Parameters:</Label>
            <Textarea
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
              placeholder="{}"
              className="h-48 font-mono text-xs"
            />
          </TabsContent>
        </Tabs>

        <Button onClick={handleExecute} disabled={loading || !tool.id} size="lg" className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Play className="mr-2 h-4 w-4" />
          Execute Tool
        </Button>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Execution Result:</Label>
              <Button size="sm" variant="outline" onClick={copyResultToClipboard}>
                <Copy size={16} className="mr-2" />
                Copy
              </Button>
            </div>

            <div
              className={`rounded border p-4 ${
                result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="mt-1 shrink-0 text-green-600" size={20} />
                ) : (
                  <AlertCircle className="mt-1 shrink-0 text-red-600" size={20} />
                )}
                <div className="flex-1">
                  <p className={result.success ? 'font-medium text-green-900' : 'font-medium text-red-900'}>
                    {result.message}
                  </p>
                  {result.data && (
                    <pre className="mt-3 max-h-48 overflow-auto rounded border bg-white p-3 text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                  <p className="mt-2 text-xs text-gray-600">
                    Executed at: {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {Object.keys(outputSchema).length > 0 && (
          <div className="rounded border border-blue-200 bg-blue-50 p-3">
            <Label className="text-sm font-medium text-blue-900">Expected Response Schema:</Label>
            <pre className="mt-2 max-h-24 overflow-auto rounded bg-white p-2 text-xs">
              {JSON.stringify(outputSchema, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
