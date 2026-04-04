import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Copy, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface AgentToolItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  status: string;
  parameters: Record<string, any>;
  outputSchema: Record<string, any>;
}

interface AgentToolListProps {
  projectId: string;
  onToolSelected?: (tool: AgentToolItem) => void;
}

const categoryColors: Record<string, string> = {
  search: 'bg-blue-100 text-blue-800',
  file: 'bg-purple-100 text-purple-800',
  api: 'bg-green-100 text-green-800',
  code: 'bg-orange-100 text-orange-800',
  utility: 'bg-gray-100 text-gray-800',
  internal: 'bg-slate-100 text-slate-800',
};

function normalizeTool(tool: Record<string, any>): AgentToolItem {
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

export default function AgentToolList({ projectId, onToolSelected }: AgentToolListProps) {
  const [tools, setTools] = useState<AgentToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const categories = useMemo(
    () => [...new Set(tools.map((tool) => tool.category))],
    [tools]
  );

  const filteredTools = useMemo(
    () =>
      selectedCategory
        ? tools.filter((tool) => tool.category === selectedCategory)
        : tools,
    [selectedCategory, tools]
  );

  const copyToolName = (name: string) => {
    navigator.clipboard.writeText(name);
    toast.success(`Copied: ${name}`);
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

  if (tools.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-8 text-center text-gray-500">
            <p>No tools available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({tools.length})
        </button>
        {categories.map((category) => {
          const count = tools.filter((tool) => tool.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => {
          const active = tool.status === 'active';

          return (
            <Card
              key={tool.id}
              className={`${active ? 'hover:shadow-lg' : 'opacity-50'} transition`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="line-clamp-2 text-base">{tool.displayName}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {tool.description}
                    </CardDescription>
                  </div>
                  <Badge className={categoryColors[tool.category] ?? 'bg-gray-100 text-gray-800'} variant="secondary">
                    {tool.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded bg-gray-50 p-2 font-mono text-xs text-gray-700">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{tool.name}</span>
                    <button
                      onClick={() => copyToolName(tool.name)}
                      className="rounded p-1 transition hover:bg-gray-200"
                      title="Copy tool name"
                    >
                      <Copy size={14} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  Status: <span className="font-semibold text-gray-900">{tool.status}</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => onToolSelected?.(tool)}
                >
                  <Eye size={14} className="mr-2" />
                  Inspect Tool
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
