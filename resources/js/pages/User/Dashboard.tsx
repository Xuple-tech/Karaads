import TrialStatus from '@/components/subscription/TrialStatus';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import subscription from '@/routes/subscription';
import user from '@/routes/user';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Clock, Cpu, FileText, Globe, MessageSquare, Plus } from 'lucide-react';
interface DashboardProps {
    stats: {
        sites_count: number;
        active_sites_count: number;
        agents_count: number;
        active_agents_count: number;
        conversations_count: number;
        active_conversations_count: number;
        today_conversations: number;
        last_7_days_conversations: number;
        last_30_days_conversations: number;
        avg_response_time: number;
    };
    recentSites: Array<{
        id: number;
        name: string;
        domain: string;
        url: string;
        is_active: boolean;
        created_at: string;
        display_url: string;
    }>;
    recentAgents: Array<{
        id: number;
        name: string;
        type: string;
        is_active: boolean;
        created_at: string;
        site: {
            id: number;
            name: string;
        } | null;
    }>;
    recentConversations: Array<{
        id: number;
        status: string;
        message_count: number;
        created_at: string;
        updated_at: string;
        ai_agent: {
            id: number;
            name: string;
        };
    }>;
    planLimits: {
        max_sites: number;
        max_agents: number;
        features: string[];
    };
    usage: {
        sites: {
            current: number;
            max: number;
            percentage: number;
        };
        agents: {
            current: number;
            max: number;
            percentage: number;
        };
    };
    conversationsAnalytics: {
        today: number;
        last_7_days: number;
        last_30_days: number;
        avg_response_time: number;
        completion_rate: number;
    };
    hasData: {
        sites: boolean;
        agents: boolean;
        conversations: boolean;
    };
    trial: {
        isOnTrial: boolean;
        hasTrialExpired: boolean;
        daysRemaining: number;
        agentQuota: number;
        remainingQuota: number;
    };
}

export default function Dashboard() {
    const { props } = usePage<{ props: DashboardProps }>();
    const { stats, recentSites, recentAgents, recentConversations, planLimits, usage, conversationsAnalytics, hasData, trial } = props;

    const statCards = [
        {
            title: 'Sites',
            value: stats.sites_count,
            icon: Globe,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            description: `${stats.active_sites_count} active`,
            link: user.sites.index.url(),
        },
        {
            title: 'AI Agents',
            value: stats.agents_count,
            icon: Cpu,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            description: `${stats.active_agents_count} active`,
            link: user.agents.index.url(),
        },
        {
            title: 'Conversations',
            value: stats.conversations_count,
            icon: MessageSquare,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            description: `${stats.active_conversations_count} active`,
            link: user.analytics.conversations.url(),
        },
        {
            title: 'Avg Response',
            value: `${(stats.avg_response_time / 1000).toFixed(1)}s`,
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            description: 'Average time',
            link: user.analytics.overview.url(),
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back! Here's what's happening with your AI agents.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button asChild size="lg" className="group shadow-lg">
                            <Link href="/docs/agents">
                                View Documentation
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Link href={user.agents.create.url()}>
                            <Button disabled={!trial.isOnTrial && trial.hasTrialExpired}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Agent
                            </Button>
                        </Link>
                        <Link href={user.sites.create.url()}>
                            <Button variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                New Site
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
                        upgradeUrl={user.subscription.url()}
                    />
                )}

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Link key={card.title} href={card.link}>
                            <Card className="cursor-pointer transition-all hover:shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                                            <h3 className="mt-2 text-2xl font-bold">{card.value}</h3>
                                            <p className="text-muted-foreground mt-1 text-sm">{card.description}</p>
                                        </div>
                                        <div className={`${card.bgColor} rounded-full p-3`}>
                                            <card.icon className={`h-6 w-6 ${card.color}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Plan Usage & Trial Status */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plan Usage</CardTitle>
                                <CardDescription>Your current plan limits and usage</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span>Sites</span>
                                        <span>
                                            {usage.sites.current} / {usage.sites.max}
                                        </span>
                                    </div>
                                    <Progress value={usage.sites.percentage} className="h-2" />
                                </div>
                                <div>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span>AI Agents</span>
                                        <span>
                                            {usage.agents.current} / {usage.agents.max}
                                        </span>
                                    </div>
                                    <Progress value={usage.agents.percentage} className="h-2" />
                                </div>
                                <div className="border-t pt-4">
                                    <h4 className="mb-3 font-medium">Plan Features</h4>
                                    <ul className="space-y-2">
                                        {planLimits.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-sm">
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {trial.isOnTrial || trial.hasTrialExpired ? (
                        <TrialStatus
                            isOnTrial={trial.isOnTrial}
                            hasTrialExpired={trial.hasTrialExpired}
                            daysRemaining={trial.daysRemaining}
                            agentQuota={trial.agentQuota}
                            remainingQuota={trial.remainingQuota}
                            variant="card"
                            upgradeUrl={subscription.pricing.url()}
                        />
                    ) : null}

                    {/* Conversations Analytics */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversations Analytics</CardTitle>
                                <CardDescription>Last 30 days performance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <p className="text-muted-foreground text-sm">Today</p>
                                            <p className="text-2xl font-bold">{conversationsAnalytics.today}</p>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <p className="text-muted-foreground text-sm">Last 7 Days</p>
                                            <p className="text-2xl font-bold">{conversationsAnalytics.last_7_days}</p>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <p className="text-muted-foreground text-sm">Avg Response Time</p>
                                            <p className="text-2xl font-bold">{(conversationsAnalytics.avg_response_time / 1000).toFixed(1)}s</p>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <p className="text-muted-foreground text-sm">Completion Rate</p>
                                            <p className="text-2xl font-bold">{conversationsAnalytics.completion_rate.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Sites */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Recent Sites</span>
                                <Link href={user.sites.index.url()} className="text-secondary text-sm font-normal hover:underline">
                                    View all
                                </Link>
                            </CardTitle>
                            <CardDescription>Your recently created sites</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hasData.sites ? (
                                <div className="space-y-4">
                                    {recentSites.map((site) => (
                                        <Link key={site.id} href={user.sites.show.url(site.id)} className="block">
                                            <div className="hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded bg-blue-100 p-2">
                                                        <Globe className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{site.name}</p>
                                                        <p className="text-muted-foreground text-sm">{site.display_url}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={site.is_active ? 'default' : 'secondary'}>
                                                    {site.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Globe className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                                    <p className="text-muted-foreground">No sites yet</p>
                                    <Link href={user.sites.create.url()}>
                                        <Button variant="outline" size="sm" className="mt-3">
                                            Create First Site
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Agents */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Recent Agents</span>
                                <Link href={user.agents.index.url()} className="text-secondary text-sm font-normal hover:underline">
                                    View all
                                </Link>
                            </CardTitle>
                            <CardDescription>Your recently created AI agents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hasData.agents ? (
                                <div className="space-y-4">
                                    {recentAgents.map((agent) => (
                                        <Link key={agent.id} href={user.agents.show.url(agent.id)} className="block">
                                            <div className="hover:bg-muted/50 flex items-center justify-between rounded-lg p-3 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded bg-purple-100 p-2">
                                                        <Cpu className="h-4 w-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{agent.name}</p>
                                                        <p className="text-muted-foreground text-sm">{agent.site?.name || 'No site'}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                                                    {agent.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Cpu className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                                    <p className="text-muted-foreground">No agents yet</p>
                                    <Link href={user.agents.create.url()}>
                                        <Button variant="outline" size="sm" className="mt-3">
                                            Create First Agent
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Conversations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Recent Conversations</span>
                                <Link href="/agents/analytics/conversations" className="text-secondary text-sm font-normal hover:underline">
                                    View all
                                </Link>
                            </CardTitle>
                            <CardDescription>Latest user interactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hasData.conversations ? (
                                <div className="space-y-4">
                                    {recentConversations.map((conversation) => (
                                        <Link
                                            key={conversation.id}
                                            href={`/agents/agents/${conversation.ai_agent.id}/conversations/${conversation.id}`}
                                            className="block"
                                        >
                                            <div className="hover:bg-muted/50 rounded-lg p-3 transition-colors">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <p className="font-medium">{conversation.ai_agent.name}</p>
                                                    <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                                                        {conversation.status}
                                                    </Badge>
                                                </div>
                                                <div className="text-muted-foreground flex items-center justify-between text-sm">
                                                    <span>{conversation.message_count} messages</span>
                                                    <span>{new Date(conversation.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <MessageSquare className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                                    <p className="text-muted-foreground">No conversations yet</p>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Conversations will appear here when users interact with your agents
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                {/* Documentation Card - Simple Version */}
                <Card className="border-primary/20 hover:border-primary/40 relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/logo.png"
                            alt="AI Agent Documentation"
                            className="h-full w-full object-cover opacity-20"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                            }}
                        />
                        <div className="fallback from-primary/20 to-primary/10 absolute inset-0 hidden bg-gradient-to-br" />
                        <div className="from-background via-background/95 to-background/80 absolute inset-0 bg-gradient-to-r" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-8">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div className="flex-1">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="bg-/10 rounded-lg p-2">
                                        <FileText className="text- h-6 w-6" />
                                    </div>
                                    <Badge className="bg-primary/10 text- hover:bg-/20 border-none">Documentation</Badge>
                                </div>

                                <h3 className="mb-3 text-2xl font-bold tracking-tight">Need Help? Check Our Documentation</h3>
                                <p className="text-muted-foreground mb-6 max-w-2xl">
                                    Comprehensive guides, API references, and best practices to help you get the most out of your AI agents.
                                </p>

                                <div className="mb-6 flex flex-wrap gap-4">
                                    <div className="bg-primary/5 flex items-center gap-2 rounded-full px-3 py-1">
                                        <CheckCircle className="text-primary h-4 w-4" />
                                        <span className="text-sm">Quick Start Guides</span>
                                    </div>
                                    <div className="bg-primary/5 flex items-center gap-2 rounded-full px-3 py-1">
                                        <CheckCircle className="text-primary h-4 w-4" />
                                        <span className="text-sm">API Examples</span>
                                    </div>
                                    <div className="bg-primary/5 flex items-center gap-2 rounded-full px-3 py-1">
                                        <CheckCircle className="text-primary h-4 w-4" />
                                        <span className="text-sm">Tutorials</span>
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-auto">
                                <Button asChild size="lg" className="group shadow-lg">
                                    <Link href="/docs/agents">
                                        View Documentation
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <p className="text-muted-foreground mt-2 text-center text-sm">Free access • Updated weekly</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
