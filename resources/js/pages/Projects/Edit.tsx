// resources/js/Pages/Projects/Edit.tsx
import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Projects } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, Trash2, FolderOpen, Settings } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
    project: Projects;
}

export default function EditProject({ project }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: project.title,
        description: project.description || '',
        settings: project.settings || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('projects.update', project.id), {
            onSuccess: () => {
                // Update successful
            },
        });
    };

    const handleDeleteProject = () => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('projects.destroy', project.id);
            form.innerHTML = `<input type="hidden" name="_method" value="DELETE"><input type="hidden" name="_token" value="${document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')}">`;
            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { label: 'Projects', href: route('p.i') },
            { label: project.title, href: route('p.sh', project.id) },
            { label: 'Edit' }
        ]}>
            <Head title={`Edit ${project.title}`} />

            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild className="gap-2">
                            <Link href={route('p.sh', project.id)}>
                                <ArrowLeft className="w-4 h-4" />
                                Back to Project
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Settings className="w-6 h-6 text-blue-600" />
                                Edit Project
                            </h1>
                            <p className="text-muted-foreground">{project.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="gap-2">
                            <Link href={route('projects.files', project.id)}>
                                <FolderOpen className="w-4 h-4" />
                                Manage Files
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Delete Project
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this project? All files and associations will be permanently removed. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteProject}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Project Details Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                        <CardDescription>
                            Update your project information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Project Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter project title"
                                    required
                                    className="text-base"
                                />
                                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe your project goals, subjects, etc..."
                                    rows={5}
                                    className="resize-none"
                                />
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                {processing ? 'Updating...' : 'Update Project'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Additional Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Settings</CardTitle>
                        <CardDescription>
                            Configure additional project options and preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h4 className="font-medium">File Management</h4>
                                    <p className="text-sm text-muted-foreground">Upload, organize, and manage project files</p>
                                </div>
                                <Button variant="outline" asChild className="gap-2">
                                    <Link href={route('projects.files', project.id)}>
                                        <FolderOpen className="w-4 h-4" />
                                        Manage Files
                                    </Link>
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h4 className="font-medium">Project Analytics</h4>
                                    <p className="text-sm text-muted-foreground">View project performance and statistics</p>
                                </div>
                                <Button variant="outline" asChild className="gap-2">
                                    <Link href={route('projects.analytics', project.id)}>
                                        <Settings className="w-4 h-4" />
                                        View Analytics
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
