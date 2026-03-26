import { Head, Link, usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Projects } from "@/types";
import AppLayout from "@/layouts/app-layout";
import {
    Plus,
    Folder,
    MessageCircle,
    FileText,
    Users,
    MoreVertical,
    Trash2,
    Archive,
    Eye,
    Settings,
    Bot,
    BarChart3,
    Rocket,
    Code,
    Brain,
    Zap,
    TrendingUp,
    Activity,
    Globe,
    GitBranch,
    Star,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import EnhancedCreateProjectForm from "./EnhancedCreateProjectForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface Props {
    projects: any;
    filters: any;
    stats: any;
    availableModels: any;
    frameworks: any;
}

export default function EnhancedProjectsIndex({
    projects,
    filters,
    stats,
    availableModels,
    frameworks
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "all");
    const [visibilityFilter, setVisibilityFilter] = useState(filters?.visibility || "all");
    const [aiModelFilter, setAiModelFilter] = useState(filters?.ai_model || "all");
    const [frameworkFilter, setFrameworkFilter] = useState(filters?.framework || "all");

    const handleFilterChange = () => {
        router.get(route("p.i"), {
            search: searchTerm || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
            visibility: visibilityFilter !== "all" ? visibilityFilter : undefined,
            ai_model: aiModelFilter !== "all" ? aiModelFilter : undefined,
            framework: frameworkFilter !== "all" ? frameworkFilter : undefined,
        });
    };

    return (
        <AppLayout>
            <Head title="AI-Powered Projects" />
            <div className="container mx-auto p-6 space-y-8">
                {/* Enhanced Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-3">
                        <h1 className="text-5xl font-bold tracking-tight flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20">
                                <Bot className="h-8 w-8 text-blue-600" />
                            </div>
                            AI Projects
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl">
                            Build, deploy, and analyze projects with AI-powered coding assistance and advanced analytics
                        </p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full lg:w-auto gap-3 h-12 px-8 text-lg" size="lg">
                                <Plus className="h-6 w-6" />
                                Create AI Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Bot className="h-5 w-5" />
                                    Create AI-Powered Project
                                </DialogTitle>
                                <DialogDescription>
                                    Start a new project with AI coding assistance, analytics, and deployment automation
                                </DialogDescription>
                            </DialogHeader>
                            <EnhancedCreateProjectForm
                                availableModels={availableModels}
                                frameworks={frameworks}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Enhanced Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Total Projects</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total_projects}</p>
                                </div>
                                <Folder className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Active</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.active_projects}</p>
                                </div>
                                <Activity className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-700">AI-Enabled</p>
                                    <p className="text-2xl font-bold text-purple-900">{stats.ai_enabled_projects}</p>
                                </div>
                                <Brain className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-700">Analytics</p>
                                    <p className="text-2xl font-bold text-orange-900">{stats.analytics_projects}</p>
                                </div>
                                <BarChart3 className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-teal-700">Deployed</p>
                                    <p className="text-2xl font-bold text-teal-900">{stats.deployed_projects}</p>
                                </div>
                                <Rocket className="h-8 w-8 text-teal-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-700">Avg Health</p>
                                    <p className="text-2xl font-bold text-yellow-900">{stats.avg_health_score}%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                {/* Enhanced Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-2">
                        <Input
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyUp={handleFilterChange}
                            className="h-11"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={(value) => {
                        setStatusFilter(value);
                        setTimeout(handleFilterChange, 100);
                    }}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={visibilityFilter} onValueChange={(value) => {
                        setVisibilityFilter(value);
                        setTimeout(handleFilterChange, 100);
                    }}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Visibility" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Visibility</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="shared">Shared</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={aiModelFilter} onValueChange={(value) => {
                        setAiModelFilter(value);
                        setTimeout(handleFilterChange, 100);
                    }}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="AI Model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Models</SelectItem>
                            {Object.entries(availableModels).map(([key, model]: [string, any]) => (
                                <SelectItem key={key} value={key}>{model.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={frameworkFilter} onValueChange={(value) => {
                        setFrameworkFilter(value);
                        setTimeout(handleFilterChange, 100);
                    }}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Framework" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Frameworks</SelectItem>
                            {Array.from(new Set(
                                Object.values(frameworks)
                                    .flat()
                                    .map((fw: any) => {
                                        // Handle different framework formats
                                        if (typeof fw === 'string') return fw;
                                        if (fw && typeof fw === 'object' && 'name' in fw) return fw.name;
                                        if (fw && typeof fw === 'object' && 'id' in fw) return fw.id;
                                        return String(fw);
                                    })
                                    .filter(Boolean)
                            )).map((framework: string) => (
                                <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Enhanced Projects Grid */}
                {projects.data && projects.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {projects.data.map((project: any) => (
                                <EnhancedProjectCard key={project.id} project={project} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {projects.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: projects.last_page }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            variant={page === projects.current_page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() =>
                                                router.get(route("p.i", { page }), {
                                                    search: searchTerm,
                                                    status: statusFilter !== "all" ? statusFilter : undefined,
                                                    visibility: visibilityFilter !== "all" ? visibilityFilter : undefined,
                                                    ai_model: aiModelFilter !== "all" ? aiModelFilter : undefined,
                                                    framework: frameworkFilter !== "all" ? frameworkFilter : undefined,
                                                })
                                            }
                                        >
                                            {page}
                                        </Button>
                                    )
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <EnhancedEmptyState />
                )}
            </div>
        </AppLayout>
    );
}

function EnhancedProjectCard({ project }: { project: any }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            try {
                router.delete(route("projects.destroy", project.id), {
                    onSuccess: () => {
                        toast.success("Project deleted successfully");
                    },
                    onError: () => {
                        toast.error("Failed to delete project");
                    },
                });
            } catch (error) {
                toast.error("Error deleting project");
            }
        }
    };

    const getBuildStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'building':
                return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getHealthScoreColor = (score: number) => {
        if (score >= 90) return "text-green-600";
        if (score >= 70) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <Link href={route("projects.dashboard", project.id)}>
            <Card className="group hover:shadow-2xl hover:border-primary/40 transition-all duration-300 border-2 h-full overflow-hidden hover:scale-[1.02] bg-gradient-tobr from-white to-gray-50/50">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start gap-3">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="line-clamp-1 group-hover:text-primary transition text-lg">
                                    {project.title}
                                </CardTitle>
                                {project.ai_model && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                                        <Bot className="h-3 w-3 mr-1" />
                                        AI
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                    {project.visibility || "private"}
                                </Badge>
                                {project.coding_framework && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        <Code className="h-3 w-3 mr-1" />
                                        {project.coding_framework}
                                    </Badge>
                                )}
                                {project.analytics_enabled && (
                                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                        <BarChart3 className="h-3 w-3 mr-1" />
                                        Analytics
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    asChild
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <Link href={route("projects.settings", project.id)}>
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    asChild
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <Link href={route("projects.collaboration", project.id)}>
                                        <Users className="h-4 w-4 mr-2" />
                                        Team
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    asChild
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <Link href={route("projects.analytics", project.id)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Analytics
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    asChild
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <Link href={route("projects.chat.index", project.id)}>
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Chat
                                    </Link>
                                </DropdownMenuItem>
                                <Separator className="my-1" />
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDelete();
                                    }}
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <CardDescription className="line-clamp-2 text-sm mt-2">
                        {project.description || "No description provided"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Enhanced Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">Chats</span>
                            </div>
                            <p className="font-semibold">{project.conversations_count || 0}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span className="text-xs">Files</span>
                            </div>
                            <p className="font-semibold">{project.files_count || 0}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span className="text-xs">Team</span>
                            </div>
                            <p className="font-semibold">{project.members_count || 0}</p>
                        </div>
                    </div>

                    {/* Health Score & Build Status */}
                    <div className="space-y-3">
                        {project.health_score && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Health Score</span>
                                    <span className={`font-semibold ${getHealthScoreColor(project.health_score)}`}>
                                        {project.health_score}%
                                    </span>
                                </div>
                                <Progress value={project.health_score} className="h-2" />
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getBuildStatusIcon(project.build_status)}
                                <span className="text-sm text-muted-foreground">
                                    {project.build_status || 'Not built'}
                                </span>
                            </div>
                            {project.deployment_url && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    <Globe className="h-3 w-3 mr-1" />
                                    Live
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* AI Features Indicators */}
                    {(project.ai_model || project.analytics_enabled) && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                            {project.ai_model && (
                                <div className="flex items-center gap-1 text-xs text-purple-600">
                                    <Zap className="h-3 w-3" />
                                    <span>AI Coding</span>
                                </div>
                            )}
                            {project.analytics_enabled && (
                                <div className="flex items-center gap-1 text-xs text-orange-600">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>Analytics</span>
                                </div>
                            )}
                            {project.auto_deploy && (
                                <div className="flex items-center gap-1 text-xs text-teal-600">
                                    <Rocket className="h-3 w-3" />
                                    <span>Auto Deploy</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}

function EnhancedEmptyState() {
    return (
        <div className="text-center py-16">
            <div className="flex justify-center mb-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-200">
                    <Bot className="h-12 w-12 text-blue-600" />
                </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2">No AI Projects Yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first AI-powered project with coding assistance, analytics, and automated deployment.
            </p>
            <Dialog>
                <DialogTrigger asChild>
                    <Button size="lg" className="gap-2">
                        <Plus className="h-5 w-5" />
                        Create Your First AI Project
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create AI-Powered Project</DialogTitle>
                        <DialogDescription>
                            Start building with AI assistance and advanced analytics
                        </DialogDescription>
                    </DialogHeader>
                    <EnhancedCreateProjectForm
                        availableModels={{}}
                        frameworks={{}}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
