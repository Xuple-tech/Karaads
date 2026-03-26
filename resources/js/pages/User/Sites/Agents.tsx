import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import {
    Users,
    Plus,
    Search,
    Filter,
    MessageSquare,
    BarChart3,
    Settings,
    MoreVertical,
    Activity,
    Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import EmptyState from "@/components/empty-state";
import user from "@/routes/user";

function SiteAgents({ site, agents }) {
    const getAgentTypeBadge = (type) => {
        const types = {
            support: { label: "Support", variant: "default" },
            sales: { label: "Sales", variant: "secondary" },
            lead_gen: { label: "Lead Gen", variant: "outline" },
            assistant: { label: "Assistant", variant: "success" },
            custom: { label: "Custom", variant: "destructive" }
        };
        return types[type] || { label: type, variant: "outline" };
    };

    return (
        <AppLayout>
            <Head title={`${site.name} - Agents`} />

            <div className="container max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                href={user.sites.show.url(site.id)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {site.name}
                            </Link>
                            <span className="text-muted-foreground">/</span>
                            <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Manage AI agents for your site
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={`/user/agents/create?site=${site.id}`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Agent
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                                    <p className="text-2xl font-bold">{agents.total}</p>
                                </div>
                                <Users className="h-8 w-8 text-primary/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                                    <p className="text-2xl font-bold">12</p>
                                </div>
                                <Activity className="h-8 w-8 text-green-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Conversations</p>
                                    <p className="text-2xl font-bold">156</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-blue-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                                    <p className="text-2xl font-bold">94%</p>
                                </div>
                                <BarChart3 className="h-8 w-8 text-amber-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="all" className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <TabsList>
                            <TabsTrigger value="all">All Agents</TabsTrigger>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="inactive">Inactive</TabsTrigger>
                        </TabsList>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search agents..."
                                    className="pl-10 w-full sm:w-64"
                                />
                            </div>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="all" className="space-y-6">
                        {agents.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {agents.data.map((agent) => {
                                        const typeBadge = getAgentTypeBadge(agent.type);
                                        const widgetSettings = agent.widget_settings || {};

                                        return (
                                            <Card key={agent.id} className="hover:shadow-md transition-shadow">
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <Bot className="h-6 w-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <CardTitle className="text-lg">
                                                                    <Link
                                                                        href={`/user/agents/${agent.id}`}
                                                                        className="hover:text-primary transition-colors"
                                                                    >
                                                                        {agent.name}
                                                                    </Link>
                                                                </CardTitle>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant={typeBadge.variant}>
                                                                        {typeBadge.label}
                                                                    </Badge>
                                                                    <Badge variant={agent.is_active ? "success" : "secondary"}>
                                                                        {agent.is_active ? "Active" : "Inactive"}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/user/agents/${agent.id}/edit`}>
                                                                        Edit Agent
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/user/agents/${agent.id}/analytics`}>
                                                                        View Analytics
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => {
                                                                        if (confirm("Are you sure you want to delete this agent?")) {
                                                                            router.delete(`/user/agents/${agent.id}`);
                                                                        }
                                                                    }}
                                                                >
                                                                    Delete Agent
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="pb-3">
                                                    {agent.description && (
                                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                            {agent.description}
                                                        </p>
                                                    )}

                                                    <div className="space-y-3">
                                                        <div>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-muted-foreground">Daily Conversations</span>
                                                                <span className="font-medium">42/100</span>
                                                            </div>
                                                            <Progress value={42} className="h-2" />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-muted-foreground">Widget Position</p>
                                                                <p className="font-medium">{widgetSettings.position || "Bottom Right"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Response Time</p>
                                                                <p className="font-medium">~2s</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>

                                                <CardFooter className="pt-3 border-t">
                                                    <div className="flex items-center justify-between w-full">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/user/agents/${agent.id}/conversations`}>
                                                                <MessageSquare className="h-3 w-3 mr-1" />
                                                                Conversations
                                                            </Link>
                                                        </Button>
                                                        <Button variant="default" size="sm" asChild>
                                                            <Link href={`/user/agents/${agent.id}`}>
                                                                <Settings className="h-3 w-3 mr-1" />
                                                                Configure
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {agents.last_page > 1 && (
                                    <div className="mt-8">
                                        <Pagination
                                            currentPage={agents.current_page}
                                            totalPages={agents.last_page}
                                            onPageChange={(page) => {
                                                router.get(user.sites.agents.url(site.id), { page });
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState
                                icon={Bot}
                                title="No agents yet"
                                description="Create your first AI agent for this site."
                                action={
                                    <Button asChild>
                                        <Link href={`/user/agents/create?site=${site.id}`}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create First Agent
                                        </Link>
                                    </Button>
                                }
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

export default SiteAgents;
