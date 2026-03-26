// @/Pages/Admin/AIAgents/Show.tsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Copy,
    Download,
    Eye,
    EyeOff,
    Bot,
    User,
    Globe,
    MessageSquare,
    Database,
    Settings,
    BarChart,
    Calendar,
    Hash,
    CheckCircle,
    XCircle
} from 'lucide-react';

const Show = ({ agent, stats }) => {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this agent?')) {
            router.delete(route('admin.ai-agents.destroy', agent.id));
        }
    };

    const handleToggleStatus = () => {
        router.post(route('admin.ai-agents.toggle-status', agent.id));
    };

    const handleClone = () => {
        router.post(route('admin.ai-agents.clone', agent.id));
    };

    const handleExport = () => {
        window.location.href = route('admin.ai-agents.export', agent.id);
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

    return (
        <AdminLayout>
            <Head title={`${agent.name} - AI Agent`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.ai-agents.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
                                <Badge variant={agent.is_active ? "success" : "secondary"}>
                                    {agent.is_active ? (
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
                                    {agent.agent_type.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                {agent.description || 'No description provided'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleToggleStatus}>
                            {agent.is_active ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Activate
                                </>
                            )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleClone}>
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('admin.ai-agents.edit', agent.id)}>
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

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                                    <p className="text-2xl font-bold">{stats.total_conversations}</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                                    <p className="text-2xl font-bold">{stats.total_messages}</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                                    <p className="text-2xl font-bold">{stats.active_users}</p>
                                </div>
                                <User className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Knowledge Items</p>
                                    <p className="text-2xl font-bold">{stats.knowledge_base_items}</p>
                                </div>
                                <Database className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Tools</p>
                                    <p className="text-2xl font-bold">{stats.active_tools}</p>
                                </div>
                                <Settings className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">
                            <Bot className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="conversations">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Conversations
                        </TabsTrigger>
                        <TabsTrigger value="knowledge">
                            <Database className="h-4 w-4 mr-2" />
                            Knowledge Base
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="analytics">
                            <BarChart className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Agent Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Agent Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Owner</h4>
                                        <p className="text-base">
                                            {agent.user?.name} ({agent.user?.email})
                                        </p>
                                    </div>

                                    {agent.site && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Site</h4>
                                            <p className="text-base">
                                                {agent.site.name} ({agent.site.domain})
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Agent Type</h4>
                                        <Badge variant="outline">
                                            {agent.agent_type.split('_').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                                        <p className="text-base">{formatDate(agent.created_at)}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                                        <p className="text-base">{formatDate(agent.updated_at)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Configuration Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Capabilities</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {agent.knowledge_base_enabled && (
                                                <Badge variant="secondary">Knowledge Base</Badge>
                                            )}
                                            {agent.web_search_enabled && (
                                                <Badge variant="secondary">Web Search</Badge>
                                            )}
                                            {agent.file_upload_enabled && (
                                                <Badge variant="secondary">File Upload</Badge>
                                            )}
                                            {agent.voice_enabled && (
                                                <Badge variant="secondary">Voice</Badge>
                                            )}
                                            {!agent.knowledge_base_enabled &&
                                             !agent.web_search_enabled &&
                                             !agent.file_upload_enabled &&
                                             !agent.voice_enabled && (
                                                <span className="text-sm text-muted-foreground">No capabilities enabled</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Context Length</h4>
                                        <p className="text-base">{agent.max_context_length || 4000} tokens</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Temperature</h4>
                                        <p className="text-base">{agent.response_temperature || 0.7}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Default Language</h4>
                                        <p className="text-base">{agent.default_language?.toUpperCase() || 'EN'}</p>
                                    </div>

                                    {agent.widget_position && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Widget Position</h4>
                                            <p className="text-base">
                                                {agent.widget_position.split('-').map(word =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Conversations */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Recent Conversations</CardTitle>
                                    <CardDescription>
                                        Latest conversations with this agent
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {agent.conversations && agent.conversations.length > 0 ? (
                                        <div className="space-y-4">
                                            {agent.conversations.slice(0, 5).map((conversation) => (
                                                <div key={conversation.id} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                User #{conversation.user_id}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatDate(conversation.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm line-clamp-2">
                                                        {conversation.messages?.[0]?.content || 'No messages'}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {conversation.messages_count || 0} messages
                                                        </span>
                                                        <Button variant="ghost" size="sm">
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No conversations yet</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Conversations Tab */}
                    <TabsContent value="conversations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversations</CardTitle>
                                <CardDescription>
                                    All conversations with this agent
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {agent.conversations && agent.conversations.length > 0 ? (
                                    <div className="space-y-4">
                                        {agent.conversations.map((conversation) => (
                                            <div key={conversation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            User #{conversation.user_id}
                                                        </span>
                                                        {conversation.is_resolved && (
                                                            <Badge variant="success">Resolved</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatDate(conversation.created_at)}
                                                        </span>
                                                        <Button variant="ghost" size="sm">
                                                            View
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {conversation.messages?.slice(0, 2).map((message, index) => (
                                                        <div key={message.id || index} className="text-sm">
                                                            <span className="font-medium">
                                                                {message.role === 'user' ? 'User' : 'Agent'}:
                                                            </span>{' '}
                                                            <span className="text-muted-foreground">
                                                                {message.content?.substring(0, 100)}
                                                                {message.content?.length > 100 ? '...' : ''}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs text-muted-foreground">
                                                        {conversation.messages_count || 0} messages
                                                    </span>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant="outline">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {new Date(conversation.created_at).toLocaleDateString()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                                        <p className="text-muted-foreground mb-4">
                                            This agent hasn't had any conversations yet.
                                        </p>
                                        <Button asChild>
                                            <Link href={route('admin.ai-agents.edit', agent.id)}>
                                                Configure Agent
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Knowledge Base Tab */}
                    <TabsContent value="knowledge">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Knowledge Base</CardTitle>
                                        <CardDescription>
                                            Documents and information that this agent can access
                                        </CardDescription>
                                    </div>
                                    <Button size="sm">
                                        Add Knowledge
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {agent.knowledge_base && agent.knowledge_base.length > 0 ? (
                                    <div className="space-y-4">
                                        {agent.knowledge_base.map((item) => (
                                            <div key={item.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium">{item.title}</h4>
                                                    <Badge variant={item.is_active ? "success" : "secondary"}>
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {item.content?.substring(0, 150)}
                                                    {item.content?.length > 150 ? '...' : ''}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Type: {item.type}</span>
                                                    <span>Updated: {formatDate(item.updated_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No knowledge base items</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Add documents and information to help this agent provide better responses.
                                        </p>
                                        <Button>
                                            Add First Item
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Behavior Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Behavior Profile</h4>
                                        <div className="bg-gray-50 rounded p-3 text-sm">
                                            {agent.behavior_profile || 'No behavior profile set'}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Welcome Message</h4>
                                        <div className="bg-gray-50 rounded p-3 text-sm">
                                            {agent.welcome_message || 'No welcome message set'}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Offline Message</h4>
                                        <div className="bg-gray-50 rounded p-3 text-sm">
                                            {agent.offline_message || 'No offline message set'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>API & Integration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">API Keys</h4>
                                        {agent.api_keys && agent.api_keys.length > 0 ? (
                                            <div className="space-y-2">
                                                {agent.api_keys.map((apiKey) => (
                                                    <div key={apiKey.id} className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{apiKey.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Last used: {apiKey.last_used_at ? formatDate(apiKey.last_used_at) : 'Never'}
                                                            </p>
                                                        </div>
                                                        <Badge variant={apiKey.is_active ? "success" : "secondary"}>
                                                            {apiKey.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No API keys configured</p>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Tools</h4>
                                        {agent.tools && agent.tools.length > 0 ? (
                                            <div className="space-y-2">
                                                {agent.tools.map((tool) => (
                                                    <div key={tool.id} className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{tool.name}</p>
                                                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                                                        </div>
                                                        <Badge variant={tool.is_active ? "success" : "secondary"}>
                                                            {tool.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No tools configured</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Appearance Settings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Color</h4>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-8 h-8 rounded border"
                                                        style={{ backgroundColor: agent.primary_color }}
                                                    />
                                                    <span>{agent.primary_color}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Secondary Color</h4>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-8 h-8 rounded border"
                                                        style={{ backgroundColor: agent.secondary_color }}
                                                    />
                                                    <span>{agent.secondary_color}</span>
                                                </div>
                                            </div>

                                            {agent.logo_url && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Logo</h4>
                                                    <img
                                                        src={agent.logo_url}
                                                        alt="Agent Logo"
                                                        className="h-12 w-auto"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            {agent.custom_css && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Custom CSS</h4>
                                                    <div className="bg-gray-50 rounded p-3 text-sm font-mono max-h-32 overflow-auto">
                                                        {agent.custom_css}
                                                    </div>
                                                </div>
                                            )}

                                            {agent.custom_js && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Custom JavaScript</h4>
                                                    <div className="bg-gray-50 rounded p-3 text-sm font-mono max-h-32 overflow-auto">
                                                        {agent.custom_js}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <Card>
                            <CardHeader>
                                <CardTitle>Usage Analytics</CardTitle>
                                <CardDescription>
                                    Performance metrics and usage statistics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {agent.usage_stats && agent.usage_stats.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-sm font-medium text-muted-foreground">Avg. Response Time</p>
                                                <p className="text-2xl font-bold">1.2s</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-sm font-medium text-muted-foreground">Satisfaction Rate</p>
                                                <p className="text-2xl font-bold">94%</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-sm font-medium text-muted-foreground">Daily Conversations</p>
                                                <p className="text-2xl font-bold">128</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                                                <p className="text-2xl font-bold">87%</p>
                                            </div>
                                        </div>

                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-medium mb-4">Recent Activity</h4>
                                            <div className="space-y-3">
                                                {agent.usage_stats.slice(0, 5).map((stat, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{stat.date}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {stat.conversations} conversations, {stat.messages} messages
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">{stat.unique_users} users</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Avg. {stat.avg_response_time}s
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No analytics data yet</h3>
                                        <p className="text-muted-foreground">
                                            Analytics data will appear once the agent starts receiving conversations.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default Show;
