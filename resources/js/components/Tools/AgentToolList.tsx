import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Copy } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Tool {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  icon_url?: string;
  rate_limit: number;
  is_active: boolean;
  parameters?: Record<string, any>;
}

interface AgentToolListProps {
  projectId: string;
  onToolSelected?: (tool: Tool) => void;
}

export default function AgentToolList({
  projectId,
  onToolSelected,
}: AgentToolListProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const categories = [...new Set(tools.map(t => t.category))];
  const filtered = selectedCategory
    ? tools.filter(t => t.category === selectedCategory)
    : tools;

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      search: '🔍',
      file: '📁',
      api: '🔌',
      code: '💻',
      utility: '⚙️',
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
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

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
          <div className="text-center text-gray-500 py-8">
            <p>No tools available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({tools.length})
        </button>
        {categories.map(category => {
          const count = tools.filter(t => t.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getCategoryIcon(category)} {category} ({count})
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(tool => (
          <Card
            key={tool.id}
            className={`${tool.is_active ? 'hover:shadow-lg' : 'opacity-50'} transition cursor-default`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{getCategoryIcon(tool.category)}</span>
                    <CardTitle className="text-base line-clamp-2">{tool.display_name}</CardTitle>
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

            <CardContent className="space-y-3">
              {/* Rate Limit */}
              <div className="text-xs">
                <p className="text-gray-600">Rate Limit: <span className="font-semibold text-gray-900">{tool.rate_limit}/min</span></p>
              </div>

              {/* Tool Name Display */}
              <div className="bg-gray-50 p-2 rounded font-mono text-xs text-gray-700 break-all flex items-center justify-between">
                <span className="flex-1 truncate">{tool.name}</span>
                <button
                  onClick={() => copyToolName(tool.name)}
                  className="ml-2 p-1 hover:bg-gray-200 rounded transition"
                  title="Copy tool name"
                >
                  <Copy size={14} className="text-gray-600" />
                </button>
              </div>

              {/* Actions */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToolSelected?.(tool)}
                className="w-full"
                disabled={!tool.is_active}
              >
                <Eye size={14} className="mr-2" />
                {tool.is_active ? 'View Details' : 'Inactive'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
