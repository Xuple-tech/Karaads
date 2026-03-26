import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Projects } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, Clock, Search } from "lucide-react";
import { useState } from "react";

interface Props {
    project: Projects;
    activities: any;
}

const ACTION_COLORS: { [key: string]: string } = {
    project_created: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    project_updated: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    settings_updated: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    member_added: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    member_removed: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    member_role_updated: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    file_uploaded: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    file_deleted: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    project_archived: "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300",
    project_restored: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    version_created: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    template_created: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
};

export default function ProjectActivity({ project, activities }: Props) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredActivities = (activities.data || []).filter(
        (activity: any) =>
            activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout
            breadcrumbs={[
                { label: "Projects", href: route("p.i") },
                { label: project.title, href: route("projects.dashboard", project.id) },
                { label: "Activity" },
            ]}
        >
            <Head title={`${project.title} - Activity Log`} />

            <div className="container mx-auto p-6 space-y-8 max-w-4xl">
                {/* Header */}
                <div>
                    <Button variant="ghost" size="sm" className="mb-4" asChild>
                        <Link href={route("projects.dashboard", project.id)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <Clock className="h-8 w-8" />
                        Activity Log
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Complete audit trail of all project activities
                    </p>
                </div>

                <Separator />

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search activities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Activity List */}
                <Card>
                    <CardContent className="p-0">
                        {filteredActivities.length > 0 ? (
                            <div className="space-y-0 divide-y">
                                {filteredActivities.map((activity: any, index: number) => (
                                    <ActivityItem
                                        key={activity.id}
                                        activity={activity}
                                        isLast={index === filteredActivities.length - 1}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                                <p className="text-muted-foreground text-lg">
                                    {searchTerm ? "No activities match your search" : "No activities yet"}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {activities.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: activities.last_page }, (_, i) => i + 1).map(
                            (page) => (
                                <Button
                                    key={page}
                                    variant={page === activities.current_page ? "default" : "outline"}
                                    size="sm"
                                    asChild
                                >
                                    <Link
                                        href={route("projects.activity", {
                                            project: project.id,
                                            page,
                                        })}
                                    >
                                        {page}
                                    </Link>
                                </Button>
                            )
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function ActivityItem({ activity, isLast }: { activity: any; isLast: boolean }) {
    const colorClass = ACTION_COLORS[activity.action] || "bg-gray-50 text-gray-700";

    return (
        <div className="p-6 hover:bg-accent/50 transition-colors flex gap-4">
            <div className="relative flex flex-col items-center flex-shrink-0">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={activity.user?.avatar} alt={activity.user?.name} />
                    <AvatarFallback className="text-sm">
                        {activity.user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {!isLast && <div className="w-0.5 h-16 bg-border mt-3" />}
            </div>

            <div className="flex-1 pt-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <p className="text-sm">
                            <span className="font-semibold">{activity.user?.name}</span>{" "}
                            <span className="text-muted-foreground">{activity.description}</span>
                        </p>
                    </div>
                    <Badge className={`text-xs whitespace-nowrap ${colorClass}`}>
                        {activity.action.replace(/_/g, " ")}
                    </Badge>
                </div>

                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                        {Object.entries(activity.metadata).map(([key, value]: any) => (
                            <div key={key}>
                                <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                    {new Date(activity.created_at).toLocaleDateString()} at{" "}
                    {new Date(activity.created_at).toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
}
