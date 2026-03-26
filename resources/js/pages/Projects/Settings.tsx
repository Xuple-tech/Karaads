import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Projects } from "@/types";
import AppLayout from "@/layouts/app-layout";
import {
    ArrowLeft,
    Save,
    Archive,
    RotateCcw,
    Trash2,
    AlertTriangle,
    Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
    project: Projects;
}

export default function ProjectSettings({ project }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: project.title,
        description: project.description || "",
        visibility: project.visibility || "private",
        status: project.status || "active",
        logo: null as File | null,
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        project.logo ? `/storage/${project.logo}` : null
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("projects.settings.update", project.id), {
            onSuccess: () => {
                toast.success("Settings updated successfully!");
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("logo", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleArchive = () => {
        post(route("projects.archive", project.id), {
            onSuccess: () => {
                toast.success("Project archived successfully!");
            },
        });
    };

    const handleRestore = () => {
        post(route("projects.restore", project.id), {
            onSuccess: () => {
                toast.success("Project restored successfully!");
            },
        });
    };

    const handleDelete = () => {
        post(route("projects.destroy", project.id), {
            onSuccess: () => {
                toast.success("Project deleted successfully!");
                window.location.href = route("p.i");
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: "Projects", href: route("p.i") },
                { label: project.title, href: route("projects.dashboard", project.id) },
                { label: "Settings" },
            ]}
        >
            <Head title={`${project.title} - Settings`} />

            <div className="container mx-auto p-6 space-y-8 max-w-2xl">
                {/* Header */}
                <div>
                    <Button variant="ghost" size="sm" className="mb-4" asChild>
                        <Link href={route("projects.dashboard", project.id)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-bold tracking-tight">Project Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your project configuration and preferences
                    </p>
                </div>

                <Separator />

                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Update your project's basic details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="title">Project Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                    className="mt-1"
                                    placeholder="Enter project title"
                                />
                                {errors.title && (
                                    <p className="text-destructive text-sm mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    className="mt-1"
                                    placeholder="Enter project description"
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-destructive text-sm mt-1">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="logo">Project Logo</Label>
                                <div className="mt-2 space-y-4">
                                    {logoPreview && (
                                        <div className="relative inline-block">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="h-24 w-24 rounded-lg object-cover border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setLogoPreview(null);
                                                    setData("logo", null);
                                                }}
                                                className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                    <div>
                                        <label
                                            htmlFor="logo-input"
                                            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition"
                                        >
                                            <Upload className="h-4 w-4" />
                                            <span className="text-sm">Click to upload logo</span>
                                        </label>
                                        <input
                                            id="logo-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="visibility">Visibility</Label>
                                    <Select
                                        value={data.visibility}
                                        onValueChange={(value) => setData("visibility", value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="private">Private</SelectItem>
                                            <SelectItem value="shared">Shared</SelectItem>
                                            <SelectItem value="public">Public</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData("status", value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit" disabled={processing} className="w-full">
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Separator />

                {/* Project Management */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Management</CardTitle>
                        <CardDescription>Manage project status and actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.status === "active" ? (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleArchive}
                            >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive Project
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full" onClick={handleRestore}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restore Project
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Separator />

                {/* Danger Zone */}
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <div>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>
                                    These actions cannot be undone. Please be careful.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                        </Button>
                    </CardContent>
                </Card>

                {/* Delete Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{project.title}"? This action cannot be undone.
                                All conversations, files, and team data will be permanently deleted.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
