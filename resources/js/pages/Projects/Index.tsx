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
} from "lucide-react";
import { useState } from "react";
import CreateProjectForm from "./CreateProjectForm";
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
}

export default function ProjectsIndex({ projects, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "all");
    const [visibilityFilter, setVisibilityFilter] = useState(filters?.visibility || "all");

    const handleFilterChange = () => {
        router.get(route("p.i"), {
            search: searchTerm || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
            visibility: visibilityFilter !== "all" ? visibilityFilter : undefined,
        });
    };

    return (
        <AppLayout>
            <Head title="Projects" />
            <div className="container mx-auto p-6 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
                                <Folder className="h-6 w-6 text-primary" />
                            </div>
                            Projects
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Organize and collaborate on your projects
                        </p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto gap-2" size="lg">
                                <Plus className="h-5 w-5" />
                                New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                                <DialogDescription>
                                    Start a new project to organize conversations and files
                                </DialogDescription>
                            </DialogHeader>
                            <CreateProjectForm />
                        </DialogContent>
                    </Dialog>
                </div>

                <Separator />

                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyUp={handleFilterChange}
                        className="md:col-span-2"
                    />
                    <Select value={statusFilter} onValueChange={(value) => {
                        setStatusFilter(value);
                        setTimeout(handleFilterChange, 100);
                    }}>
                        <SelectTrigger>
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
                        <SelectTrigger>
                            <SelectValue placeholder="Visibility" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Visibility</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="shared">Shared</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Projects Grid */}
                {projects.data && projects.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.data.map((project: any) => (
                                <ProjectCard key={project.id} project={project} />
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
                    <EmptyState />
                )}
            </div>
        </AppLayout>
    );
}

function ProjectCard({ project }: { project: any }) {
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

    return (
        <Link href={route("projects.dashboard", project.id)}>
            <Card className="group hover:shadow-xl hover:border-primary/30 transition-all duration-300 border-2 h-full overflow-hidden hover:scale-[1.02]">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1 flex-1">
                            <CardTitle className="line-clamp-1 group-hover:text-primary transition">
                                {project.title}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                                {project.visibility || "private"}
                            </Badge>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
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
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs">Conversations</span>
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
                                <span className="text-xs">Members</span>
                            </div>
                            <p className="font-semibold">{project.members_count || 0}</p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <Badge
                            variant={project.status === "active" ? "default" : "secondary"}
                            className="text-xs"
                        >
                            {project.status || "active"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {new Date(project.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function EmptyState() {
    return (
        <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center text-center py-16 space-y-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Folder className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight">No projects yet</h3>
                    <p className="text-muted-foreground text-lg max-w-md">
                        Get started by creating your first project to manage conversations
                        efficiently.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg" className="gap-2">
                            <Plus className="h-5 w-5" />
                            Create Your First Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogDescription>
                                Start a new project to organize conversations and files
                            </DialogDescription>
                        </DialogHeader>
                        <CreateProjectForm />
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
