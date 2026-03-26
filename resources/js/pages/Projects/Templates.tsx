import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Projects } from "@/types";
import AppLayout from "@/layouts/app-layout";
import {
    ArrowLeft,
    Plus,
    BookTemplate,
    Copy,
    Eye,
    Zap,
} from "lucide-react";
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
    templates: any;
}

export default function ProjectTemplates({ templates }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        template_id: "",
        title: "",
        description: "",
    });

    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSelectTemplate = (template: any) => {
        setSelectedTemplate(template);
        setData("template_id", template.id);
        setIsDialogOpen(true);
    };

    const handleCreateFromTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("projects.createFromTemplate"), {
            onSuccess: () => {
                toast.success("Project created from template!");
                reset();
                setIsDialogOpen(false);
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
                { label: "Templates" },
            ]}
        >
            <Head title="Project Templates" />

            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <Button variant="ghost" size="sm" className="mb-4" asChild>
                            <Link href={route("p.i")}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Projects
                            </Link>
                        </Button>
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <BookTemplate className="h-8 w-8" />
                            Project Templates
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Browse and create projects from templates
                        </p>
                    </div>

                    <Button asChild className="gap-2">
                        <Link href={route("p.i")}>
                            <Plus className="h-4 w-4" />
                            Create New Project
                        </Link>
                    </Button>
                </div>

                <Separator />

                {/* Templates Grid */}
                {templates.data && templates.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.data.map((template: any) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onSelect={handleSelectTemplate}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {templates.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: templates.last_page }, (_, i) => i + 1).map(
                                    (page) => (
                                        <Button
                                            key={page}
                                            variant={page === templates.current_page ? "default" : "outline"}
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={route("projects.templates", { page })}
                                            >
                                                {page}
                                            </Link>
                                        </Button>
                                    )
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center text-center py-16 space-y-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                <BookTemplate className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold tracking-tight">No templates available</h3>
                                <p className="text-muted-foreground text-lg max-w-md">
                                    Templates will appear here once you or other users create and share them.
                                </p>
                            </div>
                            <Button asChild size="lg" className="gap-2">
                                <Link href={route("p.i")}>
                                    <Plus className="h-5 w-5" />
                                    Create New Project
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Create from Template Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Project from Template</DialogTitle>
                            <DialogDescription>
                                Set up a new project based on "{selectedTemplate?.name}"
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateFromTemplate} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Project Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                    placeholder="Enter project title"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    placeholder="Optional project description"
                                    className="mt-1"
                                />
                            </div>

                            {selectedTemplate?.description && (
                                <div className="p-3 bg-muted rounded-lg text-sm">
                                    <p className="font-medium mb-1">Template Description:</p>
                                    <p className="text-muted-foreground">{selectedTemplate.description}</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || !data.title}
                                    className="flex-1"
                                >
                                    {processing ? "Creating..." : "Create Project"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

function TemplateCard({
    template,
    onSelect,
}: {
    template: any;
    onSelect: (template: any) => void;
}) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 group h-full flex flex-col">
            {/* Card Header with color coding */}
            <div className="h-2 bg-gradient-to-r from-primary/50 to-primary/20" />

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <CardTitle className="group-hover:text-primary transition line-clamp-1">
                            {template.name}
                        </CardTitle>
                        <Badge variant="outline" className="mt-2 text-xs">
                            {template.category || "general"}
                        </Badge>
                    </div>
                    <BookTemplate className="h-5 w-5 text-primary/50 flex-shrink-0" />
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description || "No description provided"}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>{template.usage_count || 0} used</span>
                    </div>
                    {template.is_public && (
                        <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>Public</span>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <Button
                    onClick={() => onSelect(template)}
                    className="w-full mt-auto gap-2"
                    variant="outline"
                >
                    <Copy className="h-4 w-4" />
                    Use Template
                </Button>
            </CardContent>
        </Card>
    );
}
