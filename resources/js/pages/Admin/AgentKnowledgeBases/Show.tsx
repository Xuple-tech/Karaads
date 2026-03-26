// @/Pages/Admin/AgentKnowledgeBases/Show.tsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Edit,
    Trash2,
    FileText,
    Bot,
    CheckCircle,
    XCircle,
    Link as LinkIcon,
    Calendar,
    Hash,
    ExternalLink
} from 'lucide-react';

const Show = ({ knowledgeBase }) => {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this knowledge base item?')) {
            router.delete(route('admin.agent-knowledge-bases.destroy', knowledgeBase.id));
        }
    };

    const handleToggleStatus = () => {
        router.post(route('admin.agent-knowledge-bases.toggle-status', knowledgeBase.id));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    return (
        <AdminLayout>
            <Head title={`${knowledgeBase.title} - Knowledge Base`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.agent-knowledge-bases.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-3xl font-bold tracking-tight">{knowledgeBase.title}</h1>
                                <Badge variant={knowledgeBase.is_active ? "success" : "secondary"}>
                                    {knowledgeBase.is_active ? (
                                        <>
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Inactive
                                        </>
                                    )}
                                </Badge>
                                <Badge variant="outline">
                                    {knowledgeBase.content_type.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                Knowledge base item for {knowledgeBase.agent?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                            {knowledgeBase.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('admin.agent-knowledge-bases.edit', knowledgeBase.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Details */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Agent Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Agent Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Bot className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{knowledgeBase.agent?.name}</p>
                                        <p className="text-sm text-muted-foreground">Assigned Agent</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <Link href={route('admin.ai-agents.show', knowledgeBase.agent_id)}>
                                        View Agent
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Content Type</h4>
                                    <Badge variant="outline">
                                        {knowledgeBase.content_type.split('_').map(word =>
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Display Order</h4>
                                    <div className="flex items-center">
                                        <Hash className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span>{knowledgeBase.order}</span>
                                    </div>
                                </div>

                                {knowledgeBase.source_url && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Source URL</h4>
                                        <a
                                            href={knowledgeBase.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue-600 hover:underline"
                                        >
                                            <LinkIcon className="h-4 w-4 mr-1" />
                                            Visit Source
                                        </a>
                                    </div>
                                )}

                                {knowledgeBase.file_path && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">File</h4>
                                        <div className="space-y-1">
                                            <p className="text-sm truncate">{knowledgeBase.file_path}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Type: {knowledgeBase.file_type} • Size: {formatFileSize(knowledgeBase.file_size)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span className="text-sm">{formatDate(knowledgeBase.created_at)}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span className="text-sm">{formatDate(knowledgeBase.updated_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Content Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Content Preview</CardTitle>
                                <CardDescription>
                                    How this information appears to the AI agent
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {knowledgeBase.file_path ? (
                                    <div className="border rounded-lg p-6 text-center">
                                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h4 className="font-medium mb-2">File Content</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            This knowledge base item contains file content that the AI agent can reference.
                                        </p>
                                        <div className="bg-gray-50 rounded p-3">
                                            <p className="font-medium">{knowledgeBase.file_path}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {knowledgeBase.file_type} • {formatFileSize(knowledgeBase.file_size)}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose max-w-none">
                                        <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap font-mono text-sm">
                                            {knowledgeBase.content}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Usage & Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Usage Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-muted-foreground">Content Length</p>
                                        <p className="text-2xl font-bold">
                                            {knowledgeBase.content?.length || 0} characters
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-medium text-muted-foreground">Word Count</p>
                                        <p className="text-2xl font-bold">
                                            {knowledgeBase.content?.split(/\s+/).filter(word => word.length > 0).length || 0} words
                                        </p>
                                    </div>
                                </div>
                                {knowledgeBase.metadata && Object.keys(knowledgeBase.metadata).length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium mb-2">Metadata</h4>
                                        <div className="bg-gray-50 rounded p-3">
                                            <pre className="text-xs overflow-auto max-h-32">
                                                {JSON.stringify(knowledgeBase.metadata, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Related Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button variant="outline" asChild>
                                        <Link href={route('admin.agent-knowledge-bases.edit', knowledgeBase.id)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Content
                                        </Link>
                                    </Button>
                                    <Button variant="outline" onClick={handleToggleStatus}>
                                        {knowledgeBase.is_active ? (
                                            <>
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Activate
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={route('admin.ai-agents.show', knowledgeBase.agent_id)}>
                                            <Bot className="h-4 w-4 mr-2" />
                                            View Agent
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Show;
