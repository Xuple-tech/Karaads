import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import AgentToolList from '@/components/Tools/AgentToolList';
import ToolExecutor from '@/components/Tools/ToolExecutor';
import { BookOpen, Zap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Tool {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  icon_url?: string;
  parameters?: Record<string, any>;
  return_schema?: Record<string, any>;
  rate_limit: number;
  is_active: boolean;
}

interface Props {
  project: any;
}

export default function AgentTools({ project }: Props) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${project.id}/tools`);
      setTools(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tools:', error);
      toast.error('Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    tools.forEach(tool => {
      stats[tool.category] = (stats[tool.category] || 0) + 1;
    });
    return stats;
  };

  const getActiveToolsCount = () => {
    return tools.filter(t => t.is_active).length;
  };

  const categoryStats = getCategoryStats();
  const activeToolsCount = getActiveToolsCount();

  return (
    <>
      <Head title="Tools | Rhea AI" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Tools</h1>
          <p className="text-gray-600 mt-2">
            Browse and test all available tools. These tools can be used by agents dynamically at runtime.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tools.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                {activeToolsCount} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <Badge key={category} variant="secondary">
                    {category}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="text-gray-900">
                  <span className="font-semibold">Active:</span> {activeToolsCount}
                </p>
                <p className="text-gray-600 text-xs">
                  Tools are managed by admins
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
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

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            <AgentToolList
              projectId={project.id}
              onToolSelected={(tool) => {
                setSelectedTool(tool);
                setActiveTab('test');
              }}
            />
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test" className="space-y-6">
            {selectedTool ? (
              <div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTool(null)}
                  className="mb-4"
                >
                  ← Back to tools
                </Button>
                <ToolExecutor
                  projectId={project.id}
                  tool={selectedTool}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="mx-auto mb-4 text-gray-400" size={40} />
                    <p>Select a tool from the Browse tab to test it</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">How to Use Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>1. Browse:</strong> View all available global tools with their descriptions, categories, and rate limits.
            </p>
            <p>
              <strong>2. Test:</strong> Test any tool before using it in your agents by providing sample parameters.
            </p>
            <p>
              <strong>3. Integrate:</strong> Agents can dynamically call these tools by name at runtime without pre-configuration.
            </p>
            <p>
              <strong>Note:</strong> Tools are managed globally by administrators. Contact your admin to add or modify tools.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
