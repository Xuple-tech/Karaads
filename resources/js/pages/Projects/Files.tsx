// resources/js/Pages/Projects/Files.tsx
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Projects } from "@/types";
import AppLayout from "@/layouts/app-layout";
import FileUploadDropZone from "@/components/FileUploadDropZone";
import { ArrowLeft, Upload, FolderOpen, FileText, Download, Eye } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

interface Props {
    project: Projects;
    files?: any[];
}

export default function ProjectFiles({ project, files = [] }: Props) {
    const [projectFiles, setProjectFiles] = useState(files);

    const handleFilesUploaded = (newFiles: any) => {
        setProjectFiles((prev) => [...prev, ...newFiles]);
    };

    const handleFileDeleted = (fileId: string) => {
        setProjectFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    const getFileStats = () => {
        const totalFiles = projectFiles.length;
        const totalSize = projectFiles.reduce((acc, file) => acc + (file.size || 0), 0);
        const fileTypes = [...new Set(projectFiles.map(file => {
            const ext = file.name?.split('.').pop()?.toLowerCase() || 'unknown';
            return ext;
        }))];

        return { totalFiles, totalSize, fileTypes };
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const stats = getFileStats();

    return (
        <AppLayout breadcrumbs={[
            { label: 'Projects', href: route('p.i') },
            { label: project.title, href: route('p.sh', project.id) },
            { label: 'Files' }
        ]}>
            <Head title={`${project.title} - Files`} />

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
                                <FolderOpen className="w-6 h-6 text-blue-600" />
                                Project Files
                            </h1>
                            <p className="text-muted-foreground">{project.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="gap-2">
                            <Link href={route('projects.edit', project.id)}>
                                <Eye className="w-4 h-4" />
                                Edit Project
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* File Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Total Files</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.totalFiles}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Total Size</p>
                                    <p className="text-2xl font-bold text-green-900">{formatFileSize(stats.totalSize)}</p>
                                </div>
                                <Download className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-700">File Types</p>
                                    <p className="text-2xl font-bold text-purple-900">{stats.fileTypes.length}</p>
                                </div>
                                <Upload className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* File Types Overview */}
                {stats.fileTypes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                File Types Overview
                            </CardTitle>
                            <CardDescription>
                                Different file types in this project
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {stats.fileTypes.map((type) => (
                                    <Badge key={type} variant="secondary" className="capitalize">
                                        .{type}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Separator />

                {/* File Upload and Management */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">File Management</h2>
                    </div>

                    <FileUploadDropZone
                        projectId={project.id}
                        existingFiles={projectFiles}
                        onFilesUploaded={handleFilesUploaded}
                        onFileDeleted={handleFileDeleted}
                    />
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common file management tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Button variant="outline" className="justify-start gap-2 h-auto p-4">
                                <Upload className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Bulk Upload</div>
                                    <div className="text-sm text-muted-foreground">Upload multiple files at once</div>
                                </div>
                            </Button>

                            <Button variant="outline" className="justify-start gap-2 h-auto p-4">
                                <Download className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Download All</div>
                                    <div className="text-sm text-muted-foreground">Download project files as ZIP</div>
                                </div>
                            </Button>

                            <Button variant="outline" className="justify-start gap-2 h-auto p-4">
                                <FolderOpen className="w-5 h-5" />
                                <div className="text-left">
                                    <div className="font-medium">Organize Files</div>
                                    <div className="text-sm text-muted-foreground">Create folders and organize</div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
