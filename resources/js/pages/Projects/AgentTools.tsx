import { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AlertCircle, BookOpen, Zap } from 'lucide-react';
import AgentToolList, { AgentToolItem } from '@/components/Tools/AgentToolList';
import ToolExecutor from '@/components/Tools/ToolExecutor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  project: { id: string; name?: string; title?: string };
}

interface WorkspaceTool {
  id: string;
  name?: string;
  slug?: string;
  display_name?: string;
  description?: string;
  category?: string;
  type?: string;
  status?: string;
  is_active?: boolean;
  parameters?: Record<string, any>;
  input_schema?: { properties?: Record<string, any> };
  return_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
}

function normalizeTool(tool: WorkspaceTool): AgentToolItem {
  return {
    id: String(tool.id),
    name: tool.slug ?? tool.name ?? String(tool.id),
    displayName: tool.display_name ?? tool.name ?? tool.slug ?? 'Untitled tool',
    description: tool.description ?? '',
    category: tool.category ?? tool.type ?? 'internal',
    status: tool.status ?? (tool.is_active ? 'active' : 'inactive'),
    parameters: tool.parameters ?? tool.input_schema?.properties ?? {},
    outputSchema: tool.return_schema ?? tool.output_schema ?? {},
  };
}

export default function AgentTools({ project }: Props) {
  const [tools, setTools] = useState<AgentToolItem[]>([]);
  const [selectedTool, setSelectedTool] = useState<AgentToolItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/workspace/projects/${project.id}/tools`);
        setTools((response.data.data ?? []).map(normalizeTool));
      } catch (error) {
        console.error('Failed to fetch workspace tools:', error);
        toast.error('Failed to load tools');
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [project.id]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    tools.forEach((tool) => {
      stats[tool.category] = (stats[tool.category] || 0) + 1;
    });
    return stats;
  }, [tools]);

  const activeToolsCount = useMemo(
    () => tools.filter((tool) => tool.status === 'active').length,
    [tools]
  );

  return (
    <>
      <Head title="Workspace Tools | Rhea AI" />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workspace Tools</h1>
          <p className="mt-2 text-gray-600">
            Browse and test tools attached to this project through the rebuilt workspace API.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : tools.length}</div>
              <p className="mt-1 text-xs text-gray-600">{activeToolsCount} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <Badge key={category} variant="secondary">
                    {category}: {count}
                  </Badge>
                ))}
                {Object.keys(categoryStats).length === 0 && (
                  <span className="text-sm text-gray-500">No categories yet</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="text-gray-900">
                  <span className="font-semibold">Active:</span> {activeToolsCount}
                </p>
                <p className="text-xs text-gray-600">Managed at the project workspace level</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Zap size={16} />
              Browse Tools
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <BookOpen size={16} />
              Test Tool
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <AgentToolList
              projectId={project.id}
              onToolSelected={(tool) => {
                setSelectedTool(tool);
                setActiveTab('test');
              }}
            />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            {selectedTool ? (
              <div>
                <Button variant="outline" onClick={() => setSelectedTool(null)} className="mb-4">
                  Back to tools
                </Button>
                <ToolExecutor projectId={project.id} tool={selectedTool} />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="py-8 text-center text-gray-500">
                    <AlertCircle className="mx-auto mb-4 text-gray-400" size={40} />
                    <p>Select a tool from the Browse tab to test it</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">How Workspace Tools Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>1. Browse:</strong> View the tools attached directly to this workspace project.
            </p>
            <p>
              <strong>2. Test:</strong> Execute a tool through the workspace API with sample arguments.
            </p>
            <p>
              <strong>3. Reuse:</strong> Agents and MCP sessions in the same project share this tool registry.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
