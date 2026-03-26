import TrialStatus from '@/components/subscription/TrialStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Layout from '@/layouts/UserLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, Copy, Cpu, Edit, Eye, Globe, MessageSquare, MoreVertical, Plus, Trash2 } from 'lucide-react';

interface AIAgent {
    id: number;
    name: string;
    description: string | null;
    agent_type: string;
    is_active: boolean;
    widget_position: string;
    created_at: string;
    site: {
        id: number;
        name: string;
    };
    widget_settings?: any;
}

interface AgentsIndexProps {
    agents: {
        data: AIAgent[];
        current_page: number;
        last_page: number;
        total: number;
    };
    trial: {
        isOnTrial: boolean;
        hasTrialExpired: boolean;
        daysRemaining: number;
        agentQuota: number;
        remainingQuota: number;
    };
}

export default function AgentsIndex() {
    const { props } = usePage<{ props: AgentsIndexProps }>();
    const { agents, trial } = props;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Layout>
            <Head title="AI Agents" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col flex-wrap items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
                        <p className="text-muted-foreground">Manage your AI agents across all sites</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/ai-agents/templates">
                            <Button variant="outline">
                                <Cpu className="mr-2 h-4 w-4" />
                                Templates
                            </Button>
                        </Link>
                        <Link href="/ai-agents/agents/create">
                            <Button disabled={trial.hasTrialExpired && trial.remainingQuota <= 0}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Agent
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Trial Status Banner */}
                {(trial.isOnTrial || trial.hasTrialExpired) && (
                    <TrialStatus
                        isOnTrial={trial.isOnTrial}
                        hasTrialExpired={trial.hasTrialExpired}
                        daysRemaining={trial.daysRemaining}
                        agentQuota={trial.agentQuota}
                        remainingQuota={trial.remainingQuota}
                        variant="banner"
                        upgradeUrl="/subscription"
                    />
                )}

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Total Agents</p>
                                    <h3 className="mt-2 text-2xl font-bold">{agents.total || 0}</h3>
                                </div>
                                <Cpu className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Active Agents</p>
                                    <h3 className="mt-2 text-2xl font-bold">{agents.data.filter((a) => a.is_active).length}</h3>
                                </div>
                                <Cpu className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Widget Agents</p>
                                    <h3 className="mt-2 text-2xl font-bold">{agents.data.filter((a) => a.agent_type === 'widget').length}</h3>
                                </div>
                                <Globe className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">API Agents</p>
                                    <h3 className="mt-2 text-2xl font-bold">{agents.data.filter((a) => a.agent_type === 'api').length}</h3>
                                </div>
                                <Cpu className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Agents Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your AI Agents</CardTitle>
                        <CardDescription>All AI agents across your sites</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Agent</TableHead>
                                    <TableHead>Site</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Widget Position</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agents.data.length > 0 ? (
                                    agents.data.map((agent) => (
                                        <TableRow key={agent.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded bg-purple-100 p-2">
                                                        <Cpu className="h-4 w-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{agent.name}</p>
                                                        <p className="text-muted-foreground text-sm">{agent.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/ai-agents/sites/${agent.site.id}`} className="text-blue-600 hover:underline">
                                                    {agent.site.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {agent.agent_type.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                                                    {agent.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">{agent.widget_position.replace('-', ' ')}</TableCell>
                                            <TableCell>{formatDate(agent.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/ai-agents/agents/${agent.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/ai-agents/agents/${agent.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <Link href={`/ai-agents/agents/${agent.id}/conversations`}>
                                                                <DropdownMenuItem>
                                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                                    Conversations
                                                                </DropdownMenuItem>
                                                            </Link>
                                                            <Link href={`/ai-agents/agents/${agent.id}/analytics`}>
                                                                <DropdownMenuItem>
                                                                    <BarChart3 className="mr-2 h-4 w-4" />
                                                                    Analytics
                                                                </DropdownMenuItem>
                                                            </Link>
                                                            <Link href={`/ai-agents/agents/${agent.id}/duplicate`} method="post">
                                                                <DropdownMenuItem>
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Duplicate
                                                                </DropdownMenuItem>
                                                            </Link>
                                                            <DropdownMenuItem className="text-red-600">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center">
                                            <div className="text-center">
                                                <Cpu className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                                                <p className="text-muted-foreground">No agents yet</p>
                                                <Link href="/ai-agents/agents/create">
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
                                        window.location.href = `/ai-agents/agents?page=${page}`;
                                    }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Button variant={'link'} asChild>
                    <Link href="/docs/agents">
                    See Docs
                    </Link>
                </Button>
            </div>
        </Layout>
    );
}
