import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Projects } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, Plus, Tag, Calendar, User } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
    project: Projects;
    versions: any[];
}

export default function ProjectVersions({ project, versions }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        changes: [] as string[],
    });

    const [isOpen, setIsOpen] = useState(false);
    const [changeInput, setChangeInput] = useState("");

    const handleAddChange = () => {
        if (changeInput.trim()) {
            setData("changes", [...data.changes, changeInput.trim()]);
            setChangeInput("");
        }
    };

    const handleRemoveChange = (index: number) => {
        setData(
            "changes",
            data.changes.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("projects.versions.create", project.id), {
            onSuccess: () => {
                toast.success("Version created successfully!");
                reset();
                setIsOpen(false);
                window.location.reload();
            },
            onError: (err: any) => {
                toast.error(Object.values(err)[0] as string);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: "Projects", href: route("p.i") },
                { label: project.title, href: route("projects.dashboard", project.id) },
                { label: "Versions" },
            ]}
        >
            <Head title={`${project.title} - Versions`} />

            <div className="container mx-auto p-6 space-y-8 max-w-3xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <Button variant="ghost" size="sm" className="mb-4" asChild>
                            <Link href={route("projects.dashboard", project.id)}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <Tag className="h-8 w-8" />
                            Versions
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Track and document project changes
                        </p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Version
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Version</DialogTitle>
                                <DialogDescription>
                                    Document changes and create a new version of your project
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="title">Version Title *</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData("title", e.target.value)}
                                        placeholder="e.g., v1.0.0 - Initial Release"
                                        className="mt-1"
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
                                        placeholder="Describe the version changes"
                                        rows={3}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Changes</Label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                value={changeInput}
                                                onChange={(e) => setChangeInput(e.target.value)}
                                                placeholder="Add a change"
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleAddChange();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleAddChange}
                                            >
                                                Add
                                            </Button>
                                        </div>

                                        {data.changes.length > 0 && (
                                            <div className="space-y-1">
                                                {data.changes.map((change, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-2 bg-muted rounded"
                                                    >
                                                        <span className="text-sm">{change}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveChange(index)}
                                                            className="text-destructive hover:text-destructive/90"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing || !data.title}
                                    className="w-full"
                                >
                                    {processing ? "Creating..." : "Create Version"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Separator />

                {/* Versions Timeline */}
                {versions.length > 0 ? (
                    <div className="space-y-6">
                        {versions.map((version, index) => (
                            <Card key={version.id} className="overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex gap-6">
                                        {/* Timeline Marker */}
                                        <div className="relative flex flex-col items-center flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                                                <Tag className="h-5 w-5 text-primary" />
                                            </div>
                                            {index !== versions.length - 1 && (
                                                <div className="w-0.5 h-24 bg-border mt-4" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {version.version_number}
                                                    </h3>
                                                    <p className="text-base text-muted-foreground">
                                                        {version.title}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">{version.version_number}</Badge>
                                            </div>

                                            {version.description && (
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {version.description}
                                                </p>
                                            )}

                                            {version.changes && version.changes.length > 0 && (
                                                <div className="mb-4 space-y-1">
                                                    <p className="text-sm font-medium">Changes:</p>
                                                    <ul className="text-sm text-muted-foreground space-y-1">
                                                        {version.changes.map((change: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <span className="text-primary">•</span>
                                                                <span>{change}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    <span>{version.user?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {new Date(version.created_at).toLocaleDateString()} at{" "}
                                                        {new Date(version.created_at).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center text-center py-16 space-y-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                <Tag className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold tracking-tight">No versions yet</h3>
                                <p className="text-muted-foreground text-lg max-w-md">
                                    Create your first version to track project changes and milestones.
                                </p>
                            </div>
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button size="lg" className="gap-2">
                                        <Plus className="h-5 w-5" />
                                        Create First Version
                                    </Button>
                                </DialogTrigger>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
