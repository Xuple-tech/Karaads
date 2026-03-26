// @/Pages/Admin/AgentKnowledgeBases/Create.tsx
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, FileText, Link as LinkIcon, Upload } from 'lucide-react';

const Create = ({ agents, contentTypes }) => {
    const [activeTab, setActiveTab] = useState('text');
    const { data, setData, errors, processing, post } = useForm({
        agent_id: '',
        content_type: 'faq',
        title: '',
        content: '',
        source_url: '',
        file_path: '',
        file_type: '',
        file_size: null,
        is_active: true,
        order: 0,
        metadata: {},
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.agent-knowledge-bases.store'));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData({
                ...data,
                file_path: file.name,
                file_type: file.type,
                file_size: file.size,
                title: file.name,
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Add Knowledge Base Item" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.agent-knowledge-bases.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Add Knowledge Base Item</h1>
                            <p className="text-muted-foreground">
                                Add information that AI agents can use for responses
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="basic" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="basic">
                                <FileText className="h-4 w-4 mr-2" />
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger value="content">
                                <FileText className="h-4 w-4 mr-2" />
                                Content
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Info Tab */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Select agent and content type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="agent_id">Agent *</Label>
                                            <Select
                                                value={data.agent_id}
                                                onValueChange={(value) => setData('agent_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an agent" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {agents.map((agent) => (
                                                        <SelectItem key={agent.id} value={agent.id.toString()}>
                                                            {agent.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.agent_id && <p className="text-sm text-red-500">{errors.agent_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="content_type">Content Type *</Label>
                                            <Select
                                                value={data.content_type}
                                                onValueChange={(value) => setData('content_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {contentTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type.split('_').map(word =>
                                                                word.charAt(0).toUpperCase() + word.slice(1)
                                                            ).join(' ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.content_type && (
                                                <p className="text-sm text-red-500">{errors.content_type}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="How to reset your password"
                                            required
                                        />
                                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="order">Display Order</Label>
                                            <Input
                                                id="order"
                                                type="number"
                                                value={data.order}
                                                onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Lower numbers appear first
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="source_url">Source URL (Optional)</Label>
                                            <div className="flex">
                                                <Input
                                                    id="source_url"
                                                    value={data.source_url}
                                                    onChange={(e) => setData('source_url', e.target.value)}
                                                    placeholder="https://example.com/article"
                                                    type="url"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <Label htmlFor="is_active">Active</Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Content Tab */}
                        <TabsContent value="content" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Content</CardTitle>
                                    <CardDescription>
                                        Add the knowledge base content in text or upload a file
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="text">Text Content</TabsTrigger>
                                            <TabsTrigger value="file">File Upload</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="text" className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="content">Content *</Label>
                                                <Textarea
                                                    id="content"
                                                    value={data.content}
                                                    onChange={(e) => setData('content', e.target.value)}
                                                    placeholder="Enter detailed information that the AI agent should know..."
                                                    rows={10}
                                                    className="font-mono text-sm"
                                                    required={activeTab === 'text'}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Use clear, concise language. The AI agent will use this information to answer questions.
                                                </p>
                                                {errors.content && (
                                                    <p className="text-sm text-red-500">{errors.content}</p>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="file" className="space-y-4 pt-4">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                                                    <div className="mb-4">
                                                        <p className="text-sm text-gray-600">
                                                            {data.file_path || 'No file selected'}
                                                        </p>
                                                        {data.file_size && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Size: {(data.file_size / 1024).toFixed(2)} KB
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Input
                                                            id="file-upload"
                                                            type="file"
                                                            onChange={handleFileUpload}
                                                            className="hidden"
                                                        />
                                                        <Label htmlFor="file-upload">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="cursor-pointer"
                                                            >
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                Choose File
                                                            </Button>
                                                        </Label>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-4">
                                                        Supported: PDF, DOC, DOCX, TXT (Max 10MB)
                                                    </p>
                                                </div>
                                            </div>
                                            {activeTab === 'file' && !data.file_path && (
                                                <p className="text-sm text-red-500">Please upload a file</p>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.agent-knowledge-bases.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Item'}
                        </Button>
                    </div>
                </form>

                <Card>
                    <CardHeader>
                        <CardTitle>Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Keep content concise and focused on a single topic</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Use clear headings and bullet points for better readability</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Include relevant keywords that users might ask about</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Regularly update information to keep it current</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Organize similar topics together using content types</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Create;
