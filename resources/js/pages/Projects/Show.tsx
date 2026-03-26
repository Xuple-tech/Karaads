// resources/js/Pages/Projects/Show.tsx
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Projects, Conversation, ProjectFile as File } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { ChevronRight, Download, MessageCircle, FileText, Edit, File as FileIcon, Image, Music, Video, Archive, FolderOpen } from "lucide-react";

interface Props {
    project: Projects;
}

function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
        return <Image className="w-4 h-4 text-blue-500" />;
    }
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext || '')) {
        return <Music className="w-4 h-4 text-purple-500" />;
    }
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) {
        return <Video className="w-4 h-4 text-red-500" />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(ext || '')) {
        return <FileText className="w-4 h-4 text-orange-500" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
        return <Archive className="w-4 h-4 text-yellow-500" />;
    }

    return <FileIcon className="w-4 h-4 text-gray-500" />;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default function ShowProject({ project }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { label: 'Projects', href: route('p.i') },
            { label: project.title }
        ]}>
            <Head title={project.title} />

            <div className="container mx-auto p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={project.logo || undefined} alt={project.title} />
                                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                                    {project.title.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
                                <div className="flex items-center flex-wrap gap-2 mt-2">
                                    <Badge variant="secondary" className="capitalize">
                                        {project.project_type || 'default'}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <MessageCircle className="w-3 h-3" />
                                        {project.conversations?.length || 0} conversations
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        {project.files?.length || 0} files
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        {project.description && (
                            <p className="text-muted-foreground leading-relaxed max-w-2xl">{project.description}</p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button variant="outline" asChild className="flex-1 sm:flex-none gap-2">
                            <Link href={route('projects.files', project.id)}>
                                <FolderOpen className="w-4 h-4" />
                                Files
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="flex-1 sm:flex-none gap-2">
                            <Link href={route('p.e', project.id)}>
                                <Edit className="w-4 h-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button asChild className="flex-1 sm:flex-none">
                            <Link href={route('p.i')}>
                                Back to Projects
                            </Link>
                        </Button>
                    </div>
                </div>

                <Separator />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Conversations Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    Conversations
                                </CardTitle>
                                <CardDescription>
                                    Conversations in this project
                                </CardDescription>
                            </div>
                            {project.conversations && project.conversations.length > 0 && (
                                <Badge variant="outline" className="text-sm">
                                    {project.conversations.length}
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent>
                            {project.conversations && project.conversations.length > 0 ? (
                                <div className="space-y-2">
                                    {project.conversations.map((conversation: Conversation) => (
                                        <Button
                                            key={conversation.id}
                                            variant="ghost"
                                            className="w-full justify-between h-auto p-3 border rounded-lg hover:bg-accent transition-colors"
                                            asChild
                                        >
                                            <Link href={route('chat.show', conversation.id)}>
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="space-y-1 text-left">
                                                        <div className="font-medium">{conversation.title}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {conversation.chats_count || 0} messages
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 ml-2 shrink-0" />
                                                </div>
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-primary/10 p-3 mb-2">
                                        <MessageCircle className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">
                                        No conversations yet
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Start a new conversation to organize your work
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Files Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Files
                                </CardTitle>
                                <CardDescription>
                                    Files in this project
                                </CardDescription>
                            </div>
                            {project.files && project.files.length > 0 && (
                                <Badge variant="outline" className="text-sm">
                                    {project.files.length}
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent>
                            {project.files && project.files.length > 0 ? (
                                <div className="space-y-2">
                                    {project.files.map((file: File) => (
                                        <div
                                            key={file.id}
                                            className="p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    {getFileIcon(file.file_path || file.file_name || '')}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate text-sm">
                                                            {file.file_name || file.file_path?.split('/').pop()}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {formatFileSize(file.file_size || 0)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <a
                                                        href={`/storage/${file.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-primary/10 p-3 mb-2">
                                        <FileText className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">
                                        No files uploaded yet
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Upload files to share resources with your project
                                    </p>
                                    <Button variant="link" size="sm" asChild className="mt-2">
                                        <Link href={route('p.e', project.id)}>
                                            Upload files
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
