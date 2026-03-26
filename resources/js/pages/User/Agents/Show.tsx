import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Layout from '@/layouts/UserLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Brain,
  Edit,
  Trash2,
  Copy,
  Globe,
  MessageSquare,
  BarChart3,
  PenTool as Tool,
  BookOpen,
  Settings,
  ExternalLink,
  PlayCircle,
  PauseCircle,
  MoreVertical,
  Users,
  Clock,
  TrendingUp,
  Key,
  Eye,
  ChevronRight,
  CheckCircle,
  XCircle,
  Mic,
  Search,
  Upload,
  Zap,
  Sparkles,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AIAgent {
  id: number;
  name: string;
  description: string | null;
  agent_type: string;
  behavior_profile: string;
  welcome_message: string;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
  default_language: string;
  supported_languages: string[];
  widget_position: string;
  knowledge_base_enabled: boolean;
  web_search_enabled: boolean;
  file_upload_enabled: boolean;
  voice_enabled: boolean;
  created_at: string;
  site: {
    id: number;
    name: string;
  };
  widget_settings?: any;
  tools: Array<{
    id: number;
    name: string;
    tool_type: string;
    is_active: boolean;
    order: number;
  }>;
  knowledge_base: Array<{
    id: number;
    title: string;
    content_type: string;
    is_active: boolean;
    order: number;
  }>;
  api_keys: Array<{
    id: number;
    name: string;
    is_active: boolean;
  }>;
}

interface Conversation {
  id: number;
  status: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
}

interface UsageStat {
  date: string;
  conversations_count: number;
  messages_count: number;
  users_count: number;
}

interface AgentShowProps {
  agent: AIAgent;
  recentConversations: Conversation[];
  usageStats: UsageStat[];
}

export default function AgentShow() {
  const { props } = usePage<{ props: AgentShowProps }>();
  const { agent, recentConversations, usageStats } = props;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  // Prepare chart data
  const chartData = usageStats.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    conversations: stat.conversations_count,
    messages: stat.messages_count,
    users: stat.users_count,
  }));

  const activeToolsCount = agent.tools.filter(tool => tool.is_active).length;
  const activeKnowledgeItems = agent.knowledge_base.filter(kb => kb.is_active).length;
  const activeApiKeys = agent.api_keys.filter(key => key.is_active).length;

  const getBehaviorProfileLabel = (profile: string) => {
    const profiles: Record<string, string> = {
      friendly: 'Friendly Assistant',
      professional: 'Professional Expert',
      casual: 'Casual Helper',
      technical: 'Technical Specialist',
      creative: 'Creative Partner',
    };
    return profiles[profile] || profile;
  };

  return (
    <Layout>
      <Head title={`${agent.name} - AI Agent`} />

      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link 
              href="/ai-agents" 
              className="hover:text-foreground transition-colors"
            >
              AI Agents
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{agent.name}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div 
                className="p-3 rounded-xl shadow-sm"
                style={{ 
                  backgroundColor: `${agent.primary_color}15`,
                  border: `1px solid ${agent.primary_color}30`
                }}
              >
                <Brain className="h-8 w-8" style={{ color: agent.primary_color }} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {agent.name}
                  </h1>
                  <Badge
                    variant={agent.is_active ? "default" : "secondary"}
                    className={agent.is_active ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                  >
                    {agent.is_active ? (
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <PauseCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </Badge>
                </div>
                {agent.description && (
                  <p className="text-muted-foreground max-w-2xl">
                    {agent.description}
                  </p>
                )}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    <Link
                      href={`/sites/${agent.site.id}`}
                      className="hover:text-foreground transition-colors font-medium"
                    >
                      {agent.site.name}
                    </Link>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div className="text-sm text-muted-foreground capitalize">
                    {agent.agent_type.replace('_', ' ')} Agent
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <div className="text-sm text-muted-foreground">
                    Created {formatDate(agent.created_at)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href={`/ai-agents/agents/${agent.id}/toggle-active`}
                method="post"
                preserveScroll
              >
                <Button variant="outline" size="sm" className="gap-2">
                  {agent.is_active ? (
                    <>
                      <PauseCircle className="h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Activate
                    </>
                  )}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <Link href={`/ai-agents/agents/${agent.id}/edit`}>
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Agent
                    </DropdownMenuItem>
                  </Link>
                  <Link
                    href={`/ai-agents/agents/${agent.id}/duplicate`}
                    method="post"
                    preserveScroll
                  >
                    <DropdownMenuItem className="cursor-pointer">
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate Agent
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Agent
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Delete Agent
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  Are you sure you want to delete <strong>"{agent.name}"</strong>? This action cannot be undone.
                </p>
                <div className="rounded-lg bg-destructive/10 p-4 text-sm">
                  <p className="font-medium text-destructive">This will permanently delete:</p>
                  <ul className="mt-2 space-y-1 text-destructive/80">
                    <li>• All conversations and chat history</li>
                    <li>• Knowledge base content and documents</li>
                    <li>• Tool configurations and API settings</li>
                    <li>• Analytics data and usage statistics</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Link
                href={`/ai-agents/agents/${agent.id}`}
                method="delete"
                onSuccess={() => setShowDeleteDialog(false)}
              >
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90 gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Agent
                </AlertDialogAction>
              </Link>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Tool className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tools</p>
                  <p className="text-2xl font-bold">
                    {activeToolsCount} <span className="text-sm font-normal text-muted-foreground">/ {agent.tools.length}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Knowledge Items</p>
                  <p className="text-2xl font-bold">
                    {activeKnowledgeItems} <span className="text-sm font-normal text-muted-foreground">/ {agent.knowledge_base.length}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Key className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">API Keys</p>
                  <p className="text-2xl font-bold">
                    {activeApiKeys} <span className="text-sm font-normal text-muted-foreground">/ {agent.api_keys.length}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-100 p-2">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Conversations</p>
                  <p className="text-2xl font-bold">{recentConversations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="conversations" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Tool className="h-4 w-4" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Agent Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Agent Profile
                  </CardTitle>
                  <CardDescription>
                    Core configuration and personality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Agent Type</p>
                      <p className="font-medium capitalize">
                        {agent.agent_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Behavior Profile</p>
                      <p className="font-medium">
                        {getBehaviorProfileLabel(agent.behavior_profile)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Widget Position</p>
                      <p className="font-medium capitalize">
                        {agent.widget_position.replace('-', ' ')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Primary Language</p>
                      <p className="font-medium uppercase">
                        {agent.default_language}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Welcome Message</p>
                    <div className="mt-1 rounded-lg bg-muted/50 p-4">
                      <p className="text-foreground">{agent.welcome_message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features & Capabilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Capabilities
                  </CardTitle>
                  <CardDescription>
                    Enabled features and integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-blue-100 p-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Knowledge Base</p>
                          <p className="text-sm text-muted-foreground">
                            {agent.knowledge_base.length} items
                          </p>
                        </div>
                      </div>
                      {agent.knowledge_base_enabled ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-green-100 p-2">
                          <Search className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Web Search</p>
                          <p className="text-sm text-muted-foreground">
                            Real-time information lookup
                          </p>
                        </div>
                      </div>
                      {agent.web_search_enabled ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-purple-100 p-2">
                          <Tool className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Tools</p>
                          <p className="text-sm text-muted-foreground">
                            {activeToolsCount} active tools
                          </p>
                        </div>
                      </div>
                      {activeToolsCount > 0 ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-amber-100 p-2">
                          <Mic className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">Voice</p>
                          <p className="text-sm text-muted-foreground">
                            Speech input and output
                          </p>
                        </div>
                      </div>
                      {agent.voice_enabled ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-orange-100 p-2">
                          <Upload className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">File Upload</p>
                          <p className="text-sm text-muted-foreground">
                            Document processing
                          </p>
                        </div>
                      </div>
                      {agent.file_upload_enabled ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Recent Conversations
                    </CardTitle>
                    <CardDescription>
                      Latest user interactions with this agent
                    </CardDescription>
                  </div>
                  {recentConversations.length > 0 && (
                    <Link
                      href={`/ai-agents/agents/${agent.id}/conversations`}
                    >
                      <Button variant="ghost" size="sm" className="gap-2">
                        View All
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {recentConversations.length > 0 ? (
                  <div className="space-y-3">
                    {recentConversations.map((conversation) => (
                      <Link
                        key={conversation.id}
                        href={`/ai-agents/agents/${agent.id}/conversations/${conversation.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="rounded-md bg-blue-100 p-2">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                Conversation #{conversation.id}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {conversation.message_count} messages
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Started {formatRelativeTime(conversation.started_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge
                              variant={
                                conversation.status === 'active'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="capitalize"
                            >
                              {conversation.status}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Conversations will appear here once users start interacting with your agent.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>
                  Usage metrics and engagement trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Usage Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Usage Overview</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="conversations"
                          name="Conversations"
                          stroke={agent.primary_color}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="messages"
                          name="Messages"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="users"
                          name="Users"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    href={`/ai-agents/agents/${agent.id}/analytics`}
                  >
                    <Button variant="outline" className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      View Detailed Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tabs */}
          {['conversations', 'knowledge', 'tools', 'settings'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {tab === 'conversations' && (
                      <span className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Conversations
                      </span>
                    )}
                    {tab === 'knowledge' && (
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Knowledge Base
                      </span>
                    )}
                    {tab === 'tools' && (
                      <span className="flex items-center gap-2">
                        <Tool className="h-5 w-5" />
                        Tools
                      </span>
                    )}
                    {tab === 'settings' && (
                      <span className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Settings
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {tab === 'conversations' && 'Manage user conversations and chat history'}
                    {tab === 'knowledge' && 'Organize and manage knowledge base content'}
                    {tab === 'tools' && 'Configure and manage agent capabilities'}
                    {tab === 'settings' && 'Agent configuration and integrations'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-8 mb-6">
                      {tab === 'conversations' && <MessageSquare className="h-12 w-12 text-muted-foreground" />}
                      {tab === 'knowledge' && <BookOpen className="h-12 w-12 text-muted-foreground" />}
                      {tab === 'tools' && <Tool className="h-12 w-12 text-muted-foreground" />}
                      {tab === 'settings' && <Settings className="h-12 w-12 text-muted-foreground" />}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 capitalize">
                      {tab === 'conversations' && 'Conversations Management'}
                      {tab === 'knowledge' && 'Knowledge Base'}
                      {tab === 'tools' && 'Tools Configuration'}
                      {tab === 'settings' && 'Agent Settings'}
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      {tab === 'conversations' && 'View, manage, and analyze all conversations with your AI agent.'}
                      {tab === 'knowledge' && 'Add, edit, and organize knowledge base content for your agent.'}
                      {tab === 'tools' && 'Configure tools and integrations to extend agent capabilities.'}
                      {tab === 'settings' && 'Configure agent settings, API keys, and widget preferences.'}
                    </p>
                    <Link
                      href={`/ai-agents/agents/${agent.id}/${tab}`}
                    >
                      <Button className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        {tab === 'conversations' && 'Manage Conversations'}
                        {tab === 'knowledge' && 'Manage Knowledge Base'}
                        {tab === 'tools' && 'Configure Tools'}
                        {tab === 'settings' && 'Configure Settings'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}