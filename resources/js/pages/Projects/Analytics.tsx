import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    ArrowLeft,
    TrendingUp,
    MessageCircle,
    FileText,
    Users,
    Activity,
} from "lucide-react";

interface Props {
    project: Projects;
    stats: {
        conversations: number;
        files: number;
        members: number;
        activities: number;
        versions: number;
    };
    activities: any[];
    conversationsByDate: any[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ProjectAnalytics({
    project,
    stats,
    activities,
    conversationsByDate,
}: Props) {
    const chartData = (conversationsByDate || [])
        .slice()
        .reverse()
        .map((item: any) => ({
            date: new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            conversations: item.count,
        }));

    const activityData = [
        { name: "Conversations", value: stats.conversations, color: "#3b82f6" },
        { name: "Files", value: stats.files, color: "#10b981" },
        { name: "Members", value: stats.members, color: "#f59e0b" },
        { name: "Activities", value: stats.activities, color: "#8b5cf6" },
    ].filter((item) => item.value > 0);

    return (
        <AppLayout
            breadcrumbs={[
                { label: "Projects", href: route("p.i") },
                { label: project.title, href: route("projects.dashboard", project.id) },
                { label: "Analytics" },
            ]}
        >
            <Head title={`${project.title} - Analytics`} />

            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div>
                    <Button variant="ghost" size="sm" className="mb-4" asChild>
                        <Link href={route("projects.dashboard", project.id)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <TrendingUp className="h-8 w-8" />
                        Analytics & Insights
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Project performance and activity metrics
                    </p>
                </div>

                <Separator />

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        icon={MessageCircle}
                        label="Conversations"
                        value={stats.conversations}
                        color="blue"
                    />
                    <StatCard
                        icon={FileText}
                        label="Files"
                        value={stats.files}
                        color="green"
                    />
                    <StatCard icon={Users} label="Members" value={stats.members} color="purple" />
                    <StatCard
                        icon={Activity}
                        label="Activities"
                        value={stats.activities}
                        color="amber"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Versions"
                        value={stats.versions}
                        color="red"
                    />
                </div>

                <Separator />

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Conversation Trends */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversation Trends</CardTitle>
                                <CardDescription>Conversations over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                            <XAxis
                                                dataKey="date"
                                                stroke="var(--muted-foreground)"
                                                style={{ fontSize: "0.875rem" }}
                                            />
                                            <YAxis
                                                stroke="var(--muted-foreground)"
                                                style={{ fontSize: "0.875rem" }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "var(--background)",
                                                    border: "1px solid var(--border)",
                                                    borderRadius: "0.5rem",
                                                }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="conversations"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                dot={{ fill: "#3b82f6" }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-300 flex items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activity Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Distribution</CardTitle>
                            <CardDescription>Project metrics breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activityData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={activityData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {activityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-300 flex items-center justify-center text-muted-foreground">
                                    No data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity Log</CardTitle>
                        <CardDescription>Latest project activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activities.length > 0 ? (
                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="flex gap-4">
                                        <div className="relative flex flex-col items-center flex-shrink-0">
                                            <Avatar className="h-9 w-9 border-2 border-primary/20">
                                                <AvatarImage
                                                    src={activity.user?.avatar}
                                                    alt={activity.user?.name}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {activity.user?.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {index !== activities.length - 1 && (
                                                <div className="w-0.5 h-12 bg-border mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm">
                                                    <span className="font-semibold">
                                                        {activity.user?.name}
                                                    </span>{" "}
                                                    <span className="text-muted-foreground">
                                                        {activity.description}
                                                    </span>
                                                </p>
                                                <Badge variant="outline" className="text-xs">
                                                    {activity.action}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(activity.created_at).toLocaleDateString()} at{" "}
                                                {new Date(activity.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No activities yet</p>
                        )}
                    </CardContent>
                </Card>

                <Button asChild variant="outline" className="w-full">
                    <Link href={route("projects.activity", project.id)}>
                        View Full Activity Log
                    </Link>
                </Button>
            </div>
        </AppLayout>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: any;
    label: string;
    value: number;
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
        <Card>
            <CardContent className="p-6">
                <div
                    className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}
                >
                    <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                <p className="text-3xl font-bold">{value}</p>
            </CardContent>
        </Card>
    );
}
