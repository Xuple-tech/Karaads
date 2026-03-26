import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Projects } from "@/types";
import AppLayout from "@/layouts/app-layout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    FileText,
    MessageCircle,
    Users,
    Activity,
    Settings,
    Share2,
    MoreVertical,
    TrendingUp,
    Clock,
    AlertCircle,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Props {
    project: Projects;
    stats: {
        conversations: number;
        files: number;
        members: number;
        activities: number;
        versions: number;
    };
    recentConversations: any[];
    recentFiles: any[];
    recentActivities: any[];
}

export default function ProjectDashboard({
    project,
    stats,
    recentConversations,
    recentFiles,
    recentActivities,
}: Props) {
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    return (
        <AppLayout
            breadcrumbs={[
                { label: "Projects", href: route("p.i") },
                { label: project.title },
            ]}
        >
            <Head title={`${project.title} - Dashboard`} />

            <div className="container mx-auto p-6 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
                            <Badge variant="outline">{project.visibility || "private"}</Badge>
                        </div>
                        <p className="text-muted-foreground max-w-xl">{project.description}</p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route("projects.analytics", project.id)}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Analytics
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={route("projects.settings", project.id)}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={route("projects.collaboration", project.id)}>
                                        <Users className="w-4 h-4 mr-2" />
                                        Team
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={route("projects.activity", project.id)}>
                                        <Clock className="w-4 h-4 mr-2" />
                                        Activity Log
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Separator />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        icon={MessageCircle}
                        title="Conversations"
                        value={stats.conversations}
                        description="Active conversations"
                        color="blue"
                    />
                    <StatCard
                        icon={FileText}
                        title="Files"
                        value={stats.files}
                        description="Project files"
                        color="green"
                    />
                    <StatCard
                        icon={Users}
                        title="Members"
                        value={stats.members}
                        description="Team members"
                        color="purple"
                    />
                    <StatCard
                        icon={Activity}
                        title="Activities"
                        value={stats.activities}
                        description="Total activities"
                        color="amber"
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Versions"
                        value={stats.versions}
                        description="Project versions"
                        color="red"
                    />
                </div>

                <Separator />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Conversations */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageCircle className="h-5 w-5" />
                                            Recent Conversations
                                        </CardTitle>
                                        <CardDescription>Latest project conversations</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={route("p.sh", project.id)}>View All</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {recentConversations.length > 0 ? (
                                    recentConversations.map((conv) => (
                                        <Link
                                            key={conv.id}
                                            href={route("p.sh", project.id)}
                                        >
                                            <div className="p-4 border rounded-lg hover:bg-accent transition-colors group">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <p className="font-medium group-hover:text-primary transition line-clamp-1">
                                                            {conv.title || "Untitled Conversation"}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(conv.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {conv.messages?.length || 0} msgs
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="py-8 text-center">
                                        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                                        <p className="text-muted-foreground">No conversations yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-6">
                        {/* Recent Files */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-5 w-5" />
                                    Recent Files
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {recentFiles.length > 0 ? (
                                    recentFiles.map((file) => (
                                        <div key={file.id} className="p-2 border rounded hover:bg-accent transition">
                                            <p className="text-sm font-medium truncate">{file.file_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(file.file_size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-muted-foreground py-4">
                                        No files
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={route("projects.collaboration", project.id)}>
                                        <Users className="h-4 w-4 mr-2" />
                                        Manage Team
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={route("projects.versions", project.id)}>
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Versions
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={route("projects.settings", project.id)}>
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Activity Timeline */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>Project activity timeline</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route("projects.activity", project.id)}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentActivities.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => (
                                    <div key={activity.id} className="flex gap-4">
                                        <div className="relative flex flex-col items-center">
                                            <Avatar className="w-9 h-9 border-2 border-primary/20">
                                                <AvatarImage
                                                    src={activity.user?.avatar}
                                                    alt={activity.user?.name}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {activity.user?.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {index !== recentActivities.length - 1 && (
                                                <div className="w-0.5 h-12 bg-border mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className="text-sm">
                                                <span className="font-semibold">{activity.user?.name}</span>{" "}
                                                <span className="text-muted-foreground">
                                                    {activity.description}
                                                </span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(activity.created_at).toLocaleDateString()} at{" "}
                                                {new Date(activity.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                                <p className="text-muted-foreground">No activity yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function StatCard({
    icon: Icon,
    title,
    value,
    description,
    color,
}: {
    icon: any;
    title: string;
    value: number;
    description: string;
    color: string;
}) {
    const colorClasses: { [key: string]: string } = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
        red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{title}</h3>
                <p className="text-2xl font-bold mb-2">{value}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
