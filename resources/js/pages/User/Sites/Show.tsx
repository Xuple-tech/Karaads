import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Layout from '@/layouts/UserLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Globe,
  Cpu,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  MoreVertical,
  ExternalLink,
  Shield,
  BarChart3,
  Users,
  MessageSquare,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import user from '@/routes/user';

interface Site {
  id: number;
  name: string;
  domain: string | null;
  url: string;
  subdomain: string;
  site_type: string;
  industry: string | null;
  description: string | null;
  is_active: boolean;
  widget_enabled: boolean;
  verified_at: string | null;
  created_at: string;
  agents: Array<{
    id: number;
    name: string;
    agent_type: string;
    is_active: boolean;
    widget_position: string;
    widget_settings?: any;
    usage_stats?: Array<{
      date: string;
      conversations_count: number;
      messages_count: number;
    }>;
  }>;
  active_subscription?: {
    plan: {
      id: number;
      name: string;
    };
  };
}

interface SiteShowProps {
  site: Site;
  agents: {
    data: Site['agents'];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export default function SiteShow() {
  const { props } = usePage<{ props: SiteShowProps }>();
  const { site, agents } = props;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAgentStats = (agent: Site['agents'][0]) => {
    if (!agent.usage_stats || agent.usage_stats.length === 0) {
      return { conversations: 0, messages: 0 };
    }
    return {
      conversations: agent.usage_stats.reduce(
        (sum, stat) => sum + stat.conversations_count,
        0
      ),
      messages: agent.usage_stats.reduce(
        (sum, stat) => sum + stat.messages_count,
        0
      ),
    };
  };

  return (
    <Layout>
      <Head title={site.name} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight truncate">
                  {site.name.slice(0,20)}{site.name.length > 20 ? '...' : ''}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={site.is_active ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {site.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {site.verified_at ? (
                    <Badge variant="outline" className="bg-green-50">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">{site.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/ai-agents/agents/create?site_id=${site.id}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Agent
              </Button>
            </Link>
                <Link
                  href={`/ai-agents/sites/${site.id}/toggle-widget`}
                  method="post"
                >
                  <Button>
                    {site.widget_enabled ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Disable Widget
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Enable Widget
                      </>
                    )}
                  </Button>
                </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/ai-agents/sites/${site.id}/edit`}>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Site
                  </DropdownMenuItem>
                </Link>
                {!site.verified_at && (
                  <Link
                    href={`/ai-agents/sites/${site.id}/verify`}
                    method="post"
                  >
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify Site
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link
                  href={`/ai-agents/sites/${site.id}/toggle-widget`}
                  method="post"
                >
                  <DropdownMenuItem>
                    {site.widget_enabled ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Disable Widget
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Enable Widget
                      </>
                    )}
                  </DropdownMenuItem>
                </Link>
                <AlertDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                >
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Site
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete {site.name}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the site and all its agents, conversations, and
                        data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Link
                        href={user.sites.destroy.url(site.id)}
                        method="delete"
                        onSuccess={() => setShowDeleteDialog(false)}
                      >
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Delete Site
                        </AlertDialogAction>
                      </Link>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Agents
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {agents.total || 0}
                  </h3>
                </div>
                <Cpu className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Agents
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {agents.data.filter(a => a.is_active).length}
                  </h3>
                </div>
                <Cpu className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Conversations
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {agents.data.reduce(
                      (sum, agent) => sum + getAgentStats(agent).conversations,
                      0
                    )}
                  </h3>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Plan
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {site.active_subscription?.plan.name || 'Free'}
                  </h3>
                </div>
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Site Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Site Details</CardTitle>
                  <CardDescription>
                    Basic information about your site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Site Type
                      </p>
                      <p className="font-medium capitalize">
                        {site.site_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Industry
                      </p>
                      <p className="font-medium">
                        {site.industry || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Subdomain
                      </p>
                      <p className="font-medium">{site.subdomain}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Created
                      </p>
                      <p className="font-medium">
                        {formatDate(site.created_at)}
                      </p>
                    </div>
                  </div>
                  {site.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Description
                      </p>
                      <p className="mt-1">{site.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Widget Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Widget Status</CardTitle>
                  <CardDescription>
                    AI agent widget configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Widget Status</p>
                      <p className="text-sm text-muted-foreground">
                        Global widget toggle
                      </p>
                    </div>
                    <Badge
                      variant={site.widget_enabled ? 'default' : 'secondary'}
                    >
                      {site.widget_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>AI Agents</CardTitle>
                <CardDescription>
                  AI agents deployed on this site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Conversations</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.data.length > 0 ? (
                      agents.data.map((agent) => {
                        const stats = getAgentStats(agent);
                        return (
                          <TableRow key={agent.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded">
                                  <Cpu className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <Link
                                    href={`/ai-agents/agents/${agent.id}`}
                                    className="font-medium hover:underline"
                                  >
                                    {agent.name}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">
                                    Widget: {agent.widget_position}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {agent.agent_type.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={agent.is_active ? 'default' : 'secondary'}
                              >
                                {agent.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>{stats.conversations}</TableCell>
                            <TableCell>{stats.messages}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/ai-agents/agents/${agent.id}`}
                                >
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-center">
                            <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">
                              No agents yet
                            </p>
                            <Link
                              href={`/ai-agents/agents/create?site_id=${site.id}`}
                            >
                              <Button variant="outline" size="sm" className="mt-3">
                                Create First Agent
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {agents.last_page > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={agents.current_page}
                      totalPages={agents.last_page}
                      onPageChange={(page) => {
                        window.location.href = `/ai-agents/sites/${site.id}?page=${page}`;
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Verification</CardTitle>
                  <CardDescription>
                    Verify ownership of your site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {site.verified_at ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">
                            Site Verified
                          </p>
                          <p className="text-sm text-green-600">
                            Verified on {formatDate(site.verified_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-yellow-800">
                              Site Not Verified
                            </p>
                            <p className="text-sm text-yellow-600">
                              Verification required for full functionality
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/ai-agents/sites/${site.id}/verify`}
                        method="post"
                      >
                        <Button>
                          <Shield className="mr-2 h-4 w-4" />
                          Verify Site
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-medium text-red-800 mb-2">
                      Delete Site
                    </p>
                    <p className="text-sm text-red-600 mb-4">
                      This will permanently delete the site and all its agents,
                      conversations, and data.
                    </p>
                    <AlertDialog
                      open={showDeleteDialog}
                      onOpenChange={setShowDeleteDialog}
                    >
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Site
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete {site.name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the site and all its agents, conversations,
                            and data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <Link
                            href={`/ai-agents/sites/${site.id}`}
                            method="delete"
                            onSuccess={() => setShowDeleteDialog(false)}
                          >
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Delete Site
                            </AlertDialogAction>
                          </Link>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Site Analytics</CardTitle>
                <CardDescription>
                  Performance metrics for all agents on this site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Analytics dashboard coming soon
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    View detailed analytics for individual agents
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}