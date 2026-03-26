import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { Loader2, Play, Copy, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Tool {
  name: string;
  display_name: string;
  description: string;
  category: string;
  parameters?: Record<string, any>;
  return_schema?: Record<string, any>;
}

interface ToolExecutorProps {
  projectId: string;
  tool: Tool;
}

interface ExecutionResult {
  success: boolean;
  message: string;
  data: any;
  timestamp: string;
}

export default function ToolExecutor({ projectId, tool }: ToolExecutorProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [jsonInput, setJsonInput] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState('builder');

  const handleExecute = async () => {
    try {
      setLoading(true);

      // Parse JSON input if in JSON mode
      let finalParams = parameters;
      if (activeTab === 'json') {
        try {
          finalParams = JSON.parse(jsonInput);
        } catch (err) {
          toast.error('Invalid JSON input');
          setResult({
            success: false,
            message: 'Invalid JSON input',
            data: null,
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }

      const response = await axios.post(
        `/api/projects/${projectId}/tools/${tool.name}/execute`,
        finalParams
      );

      setResult(response.data);
      toast.success('Tool executed successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Tool execution failed';
      toast.error(errorMessage);
      setResult({
        success: false,
        message: errorMessage,
        data: error.response?.data,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResultToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      toast.success('Result copied to clipboard');
    }
  };

  const addParameter = (key: string, value: any = '') => {
    setParameters({ ...parameters, [key]: value });
  };

  const updateParameter = (key: string, value: any) => {
    setParameters({ ...parameters, [key]: value });
  };

  const removeParameter = (key: string) => {
    const newParams = { ...parameters };
    delete newParams[key];
    setParameters(newParams);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🚀 Test {tool.display_name}
        </CardTitle>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Parameter Builder</TabsTrigger>
            <TabsTrigger value="json">JSON Input</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-4">
            {Object.keys(tool.parameters || {}).length > 0 ? (
              <div className="space-y-3">
                <Label className="font-medium">Parameters:</Label>
                {Object.entries(tool.parameters || {}).map(([key, param]: any) => (
                  <div key={key}>
                    <Label className="text-sm mb-1">
                      {param.description || key}
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      placeholder={`Enter ${key}...`}
                      value={parameters[key] || ''}
                      onChange={(e) => updateParameter(key, e.target.value)}
                      type={param.type === 'integer' ? 'number' : 'text'}
                    />
                    {param.enum && (
                      <p className="text-xs text-gray-600 mt-1">
                        Allowed values: {param.enum.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                This tool has no parameters.
              </p>
            )}

            <div className="border-t pt-4">
              <Label className="font-medium mb-3 block">Additional Parameters:</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                {Object.entries(parameters).map(([key, value]) => {
                  if (tool.parameters && key in tool.parameters) return null;
                  return (
                    <div key={key} className="flex gap-2 items-end">
                      <Input
                        value={key}
                        readOnly
                        className="flex-1 text-sm"
                        disabled
                      />
                      <Input
                        value={typeof value === 'string' ? value : JSON.stringify(value)}
                        onChange={(e) => updateParameter(key, e.target.value)}
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeParameter(key)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Input
                  id="custom-key"
                  placeholder="Parameter name"
                  className="text-sm"
                />
                <Input
                  id="custom-value"
                  placeholder="Value"
                  className="text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const keyInput = document.getElementById('custom-key') as HTMLInputElement;
                    const valueInput = document.getElementById('custom-value') as HTMLInputElement;
                    if (keyInput.value) {
                      addParameter(keyInput.value, valueInput.value || '');
                      keyInput.value = '';
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
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{}'
              className="font-mono text-xs h-48"
            />
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleExecute}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Play className="mr-2 h-4 w-4" />
          Execute Tool
        </Button>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Execution Result:</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={copyResultToClipboard}
              >
                <Copy size={16} className="mr-2" />
                Copy
              </Button>
            </div>

            <div
              className={`border rounded p-4 ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                ) : (
                  <AlertCircle className="text-red-600 mt-1 flex-shrink-0" size={20} />
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.data && (
                    <pre className="mt-3 bg-white p-3 rounded text-xs overflow-auto max-h-48 border">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                  <p className="text-xs mt-2 text-gray-600">
                    Executed at: {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tool.return_schema && Object.keys(tool.return_schema).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <Label className="text-sm font-medium text-blue-900">
              Expected Response Schema:
            </Label>
            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-24">
              {JSON.stringify(tool.return_schema, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
