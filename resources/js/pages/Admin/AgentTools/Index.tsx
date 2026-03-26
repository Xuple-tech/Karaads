import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Settings,
  TestTube,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import DataTable from '@/components/Admin/DataTable';
import FilterBar from '@/components/Admin/FilterBar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Agent {
  id: number;
  name: string;
}

interface AgentTool {
  id: number;
  agent_id: number;
  agent: Agent;
  tool_type: string;
  name: string;
  description: string | null;
  configuration: Record<string, any> | null;
  is_active: boolean;
  order: number | null;
  created_at: string;
  updated_at: string;
}

interface AgentToolsPageProps {
  tools: {
    data: AgentTool[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
  };
  filters: {
    search?: string;
    agent_id?: string;
    tool_type?: string;
  };
  agents: Agent[];
  toolTypes: string[];
}

const AgentToolsIndex = ({ tools, filters, agents, toolTypes }: AgentToolsPageProps) => {
  const { auth } = usePage().props;
  const [currentFilters, setCurrentFilters] = useState(filters || {});
  const [selectedTools, setSelectedTools] = useState<number[]>([]);

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (row: AgentTool) => (
        <div className="flex items-center space-x-2">
          <div>
            <div className="font-medium">{row.name}</div>
            {row.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {row.description}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'agent.name',
      title: 'Agent',
      render: (row: AgentTool) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{row.agent?.name || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'tool_type',
      title: 'Type',
      render: (row: AgentTool) => (
        <Badge variant="outline" className="capitalize">
          {row.tool_type.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (row: AgentTool) => (
        <div className="flex items-center">
          <Switch
            checked={row.is_active}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={() => handleToggleStatus(row)}
          />
          <span className="ml-2 text-sm">
            {row.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      key: 'order',
      title: 'Order',
      render: (row: AgentTool) => (
        <span className="text-gray-600">{row.order || '-'}</span>
      )
    },
    {
      key: 'configuration',
      title: 'Config',
      render: (row: AgentTool) => (
        <Badge variant="secondary">
          {row.configuration ? Object.keys(row.configuration).length : 0} settings
        </Badge>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      type: 'datetime'
    },
  ];

  const handleFilterChange = (name: string, value: string) => {
    setCurrentFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setCurrentFilters({});
    window.location.href = route('admin.agent-tools.index');
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    window.location.href = `${route('admin.agent-tools.index')}?${params.toString()}`;
  };

  const filterOptions = [
    {
      name: 'search',
      placeholder: 'Search tools by name',
      icon: Search,
      value: currentFilters.search
    },
    {
      name: 'agent_id',
      placeholder: 'Filter by Agent',
      type: 'select',
      options: [
        { value: '', label: 'All Agents' },
        ...agents.map(agent => ({ value: agent.id.toString(), label: agent.name }))
      ],
      value: currentFilters.agent_id
    },
    {
      name: 'tool_type',
      placeholder: 'Filter by Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        ...toolTypes.map(type => ({
          value: type,
          label: type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)
        }))
      ],
      value: currentFilters.tool_type
    }
  ];

  const handleEdit = (tool: AgentTool) => {
    window.location.href = route('admin.agent-tools.edit', tool.id);
  };

  const handleShow = (tool: AgentTool) => {
    window.location.href = route('admin.agent-tools.show', tool.id);
  };

  const handleDelete = (tool: AgentTool) => {
    if (confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      window.location.href = route('admin.agent-tools.destroy', {
        agentTool: tool.id,
        _method: 'DELETE'
      });
    }
  };

  const handleTestTool = (tool: AgentTool) => {
    if (confirm(`Test tool "${tool.name}"? This will send a test request to verify the tool configuration.`)) {
      fetch(route('admin.agent-tools.test', tool.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          test_data: { test: 'sample_data' }
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

  const handleToggleStatus = (tool: AgentTool) => {
    if (confirm(`Are you sure you want to ${tool.is_active ? 'deactivate' : 'activate'} this tool?`)) {
      fetch(route('admin.agent-tools.update', tool.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          is_active: !tool.is_active
        })
      })
      .then(response => {
        if (response.ok) {
          window.location.reload();
        } else {
          alert('Failed to update tool status.');
        }
      })
      .catch(error => {
        console.error('Error updating tool status:', error);
        alert('Failed to update tool status.');
      });
    }
  };

  const handleSelectTool = (id: number) => {
    setSelectedTools(prev =>
      prev.includes(id)
        ? prev.filter(toolId => toolId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTools.length === tools.data.length) {
      setSelectedTools([]);
    } else {
      setSelectedTools(tools.data.map(tool => tool.id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedTools.length === 0) {
      alert('Please select at least one tool.');
      return;
    }

    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedTools.length} selected tool(s)? This action cannot be undone.`)) {
        return;
      }
    }

    const formData = new FormData();
    formData.append('ids', JSON.stringify(selectedTools));
    formData.append('action', action);
    formData.append('_method', 'POST');

    fetch(route('admin.agent-tools.bulk-action'), {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: formData
    })
    .then(response => {
      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to perform bulk action.');
      }
    })
    .catch(error => {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action.');
    });
  };

  const getToolTypeStats = () => {
    const stats: Record<string, number> = {};
    toolTypes.forEach(type => {
      stats[type] = tools.data.filter(tool => tool.tool_type === type).length;
    });
    return stats;
  };

  const toolTypeStats = getToolTypeStats();

  return (
    <AdminLayout>
      <Head title="Agent Tools" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Tools</h1>
            <p className="text-muted-foreground">
              Manage and configure tools for AI agents
            </p>
          </div>
          <Button asChild>
            <Link href={route('admin.agent-tools.create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tool
            </Link>
          </Button>
        </div>

        {/* Tool Type Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.entries(toolTypeStats).map(([type, count]) => (
            <Card key={type} className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-500 capitalize">
                  {type.replace('_', ' ')}
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{tools.data.filter(t => t.is_active).length}</div>
              <div className="text-sm text-gray-500">Active Tools</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Bulk Actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Filters & Actions</CardTitle>
              <div className="flex items-center space-x-2">
                {selectedTools.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions ({selectedTools.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                        Activate Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                        Deactivate Selected
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction('delete')}
                        className="text-red-600"
                      >
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FilterBar
              filters={filterOptions}
              onFilterChange={handleFilterChange}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              showSearchButton={false}
            />
          </CardContent>
        </Card>

        {/* Tools Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Tools ({tools.total})</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={tools.data}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShow={handleShow}
              actions={[
                {
                  icon: TestTube,
                  onClick: handleTestTool,
                  title: 'Test Tool',
                  variant: 'outline',
                  size: 'sm'
                },
                {
                  icon: Settings,
                  onClick: (tool) => {
                    window.location.href = route('admin.agent-tools.edit', tool.id);
                  },
                  title: 'Configure',
                  variant: 'outline',
                  size: 'sm'
                }
              ]}
              selectable
              selectedRows={selectedTools}
              onSelect={handleSelectTool}
              onSelectAll={handleSelectAll}
              pagination={{
                total: tools.total,
                from: tools.from,
                to: tools.to,
                currentPage: tools.current_page,
                lastPage: tools.last_page,
                prevPageUrl: tools.prev_page_url,
                nextPageUrl: tools.next_page_url,
              }}
              emptyState={{
                title: "No tools found",
                description: "Get started by creating a new tool for your agents.",
                action: (
                  <Button asChild>
                    <Link href={route('admin.agent-tools.create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Tool
                    </Link>
                  </Button>
                )
              }}
            />
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                asChild
              >
                <Link href={route('admin.agent-tools.create')}>
                  <Plus className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Create New Tool</div>
                    <div className="text-sm text-gray-500">Add a custom tool for your agents</div>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                onClick={() => {
                  const firstTool = tools.data[0];
                  if (firstTool) {
                    handleTestTool(firstTool);
                  } else {
                    alert('No tools available to test.');
                  }
                }}
              >
                <TestTube className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Test Tool</div>
                  <div className="text-sm text-gray-500">Test the first tool configuration</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start"
                asChild
              >
                <Link href={route('admin.ai-agents.index')}>
                  <Settings className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Manage Agents</div>
                    <div className="text-sm text-gray-500">Configure your AI agents</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AgentToolsIndex;
