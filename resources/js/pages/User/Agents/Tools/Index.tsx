import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Layout from '@/layouts/UserLayout';
import user from '@/routes/user';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
  Calculator, 
  Calendar, 
  CheckCircle, 
  ChevronRight, 
  Edit, 
  Eye, 
  EyeOff, 
  Info, 
  MoreVertical, 
  Plus, 
  Search, 
  Settings, 
  Ticket, 
  Terminal,
  PenTool as Tool,
  Trash2,
  Wrench,
  Zap,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

interface Tool {
  id: number;
  name: string;
  tool_type: 'calculator' | 'booking' | 'product_search' | 'support_ticket' | 'custom';
  description?: string;
  is_active: boolean;
  order: number;
  created_at: string;
}

interface AIAgent {
  id: number;
  name: string;
}

interface ToolsIndexProps {
  agent: AIAgent;
  tools: {
    data: Tool[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

const TOOL_TYPE_CONFIG = {
  calculator: {
    name: 'Calculator',
    icon: Calculator,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeVariant: 'outline' as const,
  },
  booking: {
    name: 'Booking',
    icon: Calendar,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeVariant: 'outline' as const,
  },
  product_search: {
    name: 'Product Search',
    icon: Search,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeVariant: 'outline' as const,
  },
  support_ticket: {
    name: 'Support Ticket',
    icon: Ticket,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeVariant: 'outline' as const,
  },
  custom: {
    name: 'Custom',
    icon: Terminal,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    badgeVariant: 'outline' as const,
  },
};

export default function ToolsIndex() {
  const { props } = usePage<{ props: ToolsIndexProps }>();
  const { agent, tools } = props;
  const { delete: destroy } = useForm();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = (tool: Tool) => {
    if (confirm(`Are you sure you want to delete "${tool.name}"? This action cannot be undone.`)) {
      setDeleteId(tool.id);
      destroy(user.agents.tools.destroy.url({ agent: agent.id, tool: tool.id }), { 
        method: 'delete',
        preserveScroll: true 
      });
    }
  };

  const handleToggleActive = (id: number) => {
    useForm().post(user.agents.tools.toggleActive.url({ agent: agent.id, tool: id }), {
      preserveScroll: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const activeCount = tools.data.filter(t => t.is_active).length;
  const inactiveCount = tools.total - activeCount;

  const getToolConfig = (type: string) => {
    return TOOL_TYPE_CONFIG[type as keyof typeof TOOL_TYPE_CONFIG] || TOOL_TYPE_CONFIG.custom;
  };

  return (
    <Layout>
      <Head title={`Tools - ${agent.name}`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link 
              href={user.agents.index.url()} 
              className="hover:text-foreground transition-colors"
            >
              AI Agents
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{agent.name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
              <p className="text-lg text-muted-foreground">
                Extend capabilities for <span className="font-semibold text-primary">{agent.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={user.agents.show.url(agent.id)}>
                <Button variant="outline" size="sm" className="gap-2">
                  View Agent
                </Button>
              </Link>
              <Link href={user.agents.tools.create.url(agent.id)}>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Tool
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Tool className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tools</p>
                  <p className="text-2xl font-bold">{tools.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-gray-100 p-2">
                  <EyeOff className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Types</p>
                  <p className="text-2xl font-bold">
                    {new Set(tools.data.map(t => t.tool_type)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Table */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wrench className="h-5 w-5" />
                  All Tools
                </CardTitle>
                <CardDescription>
                  {tools.total === 0 
                    ? "No tools configured yet"
                    : `${tools.total} tool${tools.total !== 1 ? 's' : ''} available for use`
                  }
                </CardDescription>
              </div>
              {tools.total > 0 && (
                <Badge variant="secondary" className="font-medium">
                  {activeCount} Active
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {tools.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-6 mb-6">
                  <Wrench className="h-12 w-12 text-muted-foreground/60" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">No tools configured</h3>
                <p className="mb-8 max-w-md text-muted-foreground">
                  Add tools to enable your AI agent with capabilities like calculations, 
                  data lookups, and external integrations.
                </p>
                <Link href={user.agents.tools.create.url(agent.id)}>
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Create First Tool
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold">Tool</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tools.data.map((tool) => {
                        const config = getToolConfig(tool.tool_type);
                        const Icon = config.icon;
                        
                        return (
                          <TableRow 
                            key={tool.id} 
                            className="group hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className={`rounded-md text-primary  p-2 ${config.color.split(' ')[0]}`}>
                                  <Icon className="h-4 w-4 " />
                                </div>
                                <div>
                                  <div className="font-medium">{tool.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Added {formatDate(tool.created_at)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={config.badgeVariant} 
                                className={`${config.color} font-medium`}
                              >
                                {config.name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {tool.description || 'No description provided'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {tool.is_active ? (
                                <Badge 
                                  variant="default" 
                                  className="gap-1.5 bg-emerald-500 hover:bg-emerald-600"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge 
                                  variant="outline" 
                                  className="gap-1.5 border-gray-300 text-gray-600"
                                >
                                  <EyeOff className="h-3 w-3" />
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem asChild>
                                    <Link 
                                      href={user.agents.tools.edit.url({ agent: agent.id, tool: tool.id })}
                                      className="cursor-pointer"
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Tool
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleToggleActive(tool.id)}
                                    className="cursor-pointer"
                                  >
                                    {tool.is_active ? (
                                      <>
                                        <EyeOff className="mr-2 h-4 w-4" />
                                        Deactivate Tool
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Activate Tool
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(tool)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Tool
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {tools.last_page > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t pt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing page {tools.current_page} of {tools.last_page}
                    </div>
                    <Pagination 
                      currentPage={tools.current_page} 
                      lastPage={tools.last_page} 
                      links={[]} 
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        {tools.data.length > 0 && (
          <Alert className="border-blue-100 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p className="font-medium">Tips for managing tools:</p>
                <ul className="list-inside list-disc space-y-1 pl-2 text-sm">
                  <li>Active tools are available for your AI agent to use automatically</li>
                  <li>Deactivate tools temporarily when they need maintenance or updates</li>
                  <li>Test new tools thoroughly before activating them in production</li>
                  <li>Keep tool descriptions clear and concise for better agent understanding</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Layout>
  );
}