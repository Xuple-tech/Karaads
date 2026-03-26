import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AgentSelector from "@/components/AgentSelector";
import AppLayout from "@/layouts/app-layout";
import {
    MessageCircle,
    Plus,
    Send,
    Bot,
    User,
    Code,
    BarChart3,
    Pin,
    MoreVertical,
    Edit,
    Trash2,
    Download,
    Share,
    Settings,
    Paperclip,
    Zap,
    Brain,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Search,
    Filter,
    Sparkles,
    Terminal,
    Database,
    FileText,
    Image,
    Video,
    Mic,
    Phone,
    Calendar,
    Tag,
    Star,
    Reply,
    Forward,
    Copy,
    Eye,
    EyeOff,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
    project: any;
    conversations: any;
    currentConversation: any;
    agents: any[];
    aiCapabilities: any;
    userRole: string;
}

export default function ProjectChatIndex({
    project,
    conversations,
    currentConversation,
    agents,
    aiCapabilities,
    userRole,
}: Props) {
    const [selectedConversation, setSelectedConversation] = useState(currentConversation);
    const [messages, setMessages] = useState(currentConversation?.chats || []);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState("");
    const [messageType, setMessageType] = useState("text");
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [replyToMessage, setReplyToMessage] = useState(null);
    const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredConversations, setFilteredConversations] = useState(conversations.data || []);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New conversation form state
    const [newConversationForm, setNewConversationForm] = useState({
        title: "",
        description: "",
        type: "general",
        agent_id: "",
    });

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingMessage]);

    useEffect(() => {
        // Filter conversations based on search
        const filtered = (conversations.data || []).filter((conv: any) =>
            conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredConversations(filtered);
    }, [searchQuery, conversations]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleCreateConversation = async () => {
        if (!newConversationForm.title.trim()) {
            toast.error("Please enter a conversation title");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(route('projects.chat.conversations.create', project.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(newConversationForm),
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Conversation created successfully!");
                setShowNewConversationDialog(false);
                setNewConversationForm({ title: "", description: "", type: "general", agent_id: "" });

                // Refresh conversations or add to list
                router.reload({ only: ['conversations'] });

                // Select the new conversation
                setSelectedConversation(data.conversation);
                setMessages([]);
            } else {
                toast.error(data.message || "Failed to create conversation");
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
            toast.error("Failed to create conversation");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const messageToSend = newMessage;
        setNewMessage("");
        setIsLoading(true);

        // Add user message to UI immediately
        const userMessage = {
            id: Date.now().toString(),
            message: messageToSend,
            role: 'user',
            type: messageType,
            created_at: new Date().toISOString(),
            user: { name: 'You' },
            reply_to_id: replyToMessage?.id || null,
        };

        setMessages(prev => [...prev, userMessage]);
        setReplyToMessage(null);

        try {
            // Send message to backend
            const response = await fetch(route('projects.chat.messages.send', [project.id, selectedConversation.id]), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    message: messageToSend,
                    type: messageType,
                    agent_id: selectedAgent?.id,
                    reply_to_id: replyToMessage?.id,
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Update the temporary message with the real one
                setMessages(prev => prev.map(msg =>
                    msg.id === userMessage.id ? data.message : msg
                ));

                // Add AI response if available
                if (data.ai_response) {
                    setMessages(prev => [...prev, data.ai_response]);
                } else if (aiCapabilities.canGenerate && messageType !== 'text') {
                    // Stream AI response for code/analytics
                    handleStreamAIResponse(messageToSend);
                }
            } else {
                toast.error(data.message || "Failed to send message");
                // Remove the temporary message
                setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error("Failed to send message");
            setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        } finally {
            setIsLoading(false);
        }
    };

    const handleStreamAIResponse = async (message: string) => {
        if (!selectedConversation || !aiCapabilities.canGenerate) return;

        setIsStreaming(true);
        setStreamingMessage("");

        try {
            const response = await fetch(route('projects.chat.stream', [project.id, selectedConversation.id]), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    message,
                    type: messageType,
                    context: {
                        conversation_history: messages.slice(-5),
                    },
                }),
            });

            if (!response.body) {
                throw new Error('No response body');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'done') {
                                // Save the complete streaming message
                                const aiMessage = {
                                    id: Date.now().toString(),
                                    message: streamingMessage,
                                    role: 'assistant',
                                    type: messageType,
                                    created_at: new Date().toISOString(),
                                    metadata: { ai_model: project.ai_model },
                                };
                                setMessages(prev => [...prev, aiMessage]);
                                setStreamingMessage("");
                            } else if (data.content) {
                                setStreamingMessage(prev => prev + data.content);
                            } else if (data.type === 'error') {
                                toast.error(data.content || 'AI response failed');
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error streaming AI response:', error);
            toast.error("Failed to get AI response");
        } finally {
            setIsStreaming(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleConversationSelect = async (conversation: any) => {
        setSelectedConversation(conversation);
        setMessages([]);
        setIsLoading(true);

        try {
            const response = await fetch(route('projects.chat.messages', [project.id, conversation.id]));
            const data = await response.json();
            setMessages(data.messages.data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConversation = async (conversation: any) => {
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            const response = await fetch(route('projects.chat.conversations.delete', [project.id, conversation.id]), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Conversation deleted successfully!");
                if (selectedConversation?.id === conversation.id) {
                    setSelectedConversation(null);
                    setMessages([]);
                }
                router.reload({ only: ['conversations'] });
            } else {
                toast.error(data.message || "Failed to delete conversation");
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            toast.error("Failed to delete conversation");
        }
    };

    const handlePinMessage = async (message: any) => {
        try {
            const response = await fetch(route('projects.chat.messages.pin', [project.id, selectedConversation.id, message.id]), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                setMessages(prev => prev.map(msg =>
                    msg.id === message.id ? { ...msg, is_pinned: data.is_pinned } : msg
                ));
            }
        } catch (error) {
            console.error('Error pinning message:', error);
            toast.error("Failed to update message");
        }
    };

    const renderMessage = (message: any) => {
        const isUser = message.role === 'user';
        const isAI = message.role === 'assistant';

        return (
            <div key={message.id} className={`flex gap-3 p-4 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isUser ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                    {isUser ? (
                        <User className="h-4 w-4 text-white" />
                    ) : (
                        <Bot className="h-4 w-4 text-white" />
                    )}
                </div>

                <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                    {/* Agent info for AI messages */}
                    {isAI && message.metadata?.agent_name && (
                        <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
                            <Bot className="h-3 w-3" />
                            <span>{message.metadata.agent_name}</span>
                            <Badge variant="outline" className="text-xs">
                                {message.metadata.agent_id ? 'Agent' : 'Default AI'}
                            </Badge>
                        </div>
                    )}

                    <div className={`inline-block p-3 rounded-lg ${
                        isUser
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900 border'
                    }`}>
                        {message.reply_to_id && (
                            <div className="mb-2 p-2 bg-black/10 rounded text-sm opacity-75">
                                Replying to: {messages.find(m => m.id === message.reply_to_id)?.message?.substring(0, 50)}...
                            </div>
                        )}

                        {message.type === 'code' ? (
                            <div className="bg-gray-900 rounded p-3 text-left">
                                <SyntaxHighlighter
                                    language="javascript"
                                    style={oneDark}
                                    customStyle={{ margin: 0, background: 'transparent' }}
                                >
                                    {message.message}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <ReactMarkdown className="prose prose-sm max-w-none">
                                {message.message}
                            </ReactMarkdown>
                        )}

                        {message.files && message.files.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {message.files.map((file: any) => (
                                    <div key={file.id} className="flex items-center gap-2 text-sm">
                                        <Paperclip className="h-3 w-3" />
                                        <span>{file.filename}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                        isUser ? 'justify-end' : 'justify-start'
                    }`}>
                        <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                        {message.is_pinned && <Pin className="h-3 w-3 text-yellow-500" />}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setReplyToMessage(message)}>
                                    <Reply className="h-4 w-4 mr-2" />
                                    Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePinMessage(message)}>
                                    <Pin className="h-4 w-4 mr-2" />
                                    {message.is_pinned ? 'Unpin' : 'Pin'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.message)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title={`${project.title} - Chat`} />

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar - Conversations List */}
                <div className="w-80 border-r bg-gray-50 flex flex-col">
                    <div className="p-4 border-b bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <Link href={route('projects.dashboard', project.id)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Project
                                </Link>
                                <h1 className="text-lg font-semibold mt-1">{project.title}</h1>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        New
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Conversation</DialogTitle>
                                        <DialogDescription>
                                            Start a new conversation in this project
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                id="title"
                                                value={newConversationForm.title}
                                                onChange={(e) => setNewConversationForm(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Enter conversation title"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description (Optional)</Label>
                                            <Textarea
                                                id="description"
                                                value={newConversationForm.description}
                                                onChange={(e) => setNewConversationForm(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Brief description of this conversation"
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="type">Type</Label>
                                            <Select value={newConversationForm.type} onValueChange={(value) => setNewConversationForm(prev => ({ ...prev, type: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">General Discussion</SelectItem>
                                                    <SelectItem value="coding">Coding & Development</SelectItem>
                                                    <SelectItem value="analytics">Data Analytics</SelectItem>
                                                    <SelectItem value="support">Support & Help</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setShowNewConversationDialog(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleCreateConversation} disabled={isLoading}>
                                                {isLoading ? 'Creating...' : 'Create Conversation'}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-2">
                            {filteredConversations.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No conversations yet</p>
                                    <p className="text-sm">Create your first conversation to get started</p>
                                </div>
                            ) : (
                                filteredConversations.map((conversation: any) => (
                                    <div
                                        key={conversation.id}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                                            selectedConversation?.id === conversation.id
                                                ? 'bg-blue-100 border-blue-200 border'
                                                : 'hover:bg-gray-100'
                                        }`}
                                        onClick={() => handleConversationSelect(conversation)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                                                {conversation.description && (
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{conversation.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {conversation.type}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(conversation.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                        <MoreVertical className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Share className="h-4 w-4 mr-2" />
                                                        Share
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Export
                                                    </DropdownMenuItem>
                                                    <Separator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteConversation(conversation);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b bg-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">{selectedConversation.title}</h2>
                                        {selectedConversation.description && (
                                            <p className="text-sm text-gray-600">{selectedConversation.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {aiCapabilities.canGenerate && (
                                            <Badge variant="secondary" className="gap-1">
                                                <Sparkles className="h-3 w-3" />
                                                AI Enabled
                                            </Badge>
                                        )}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Conversation
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Manage Access
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Export Chat
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {isLoading && messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                            <p className="text-gray-500 mt-2">Loading messages...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>No messages yet</p>
                                            <p className="text-sm">Start the conversation below</p>
                                        </div>
                                    ) : (
                                        messages.map(renderMessage)
                                    )}

                                    {/* Streaming Message */}
                                    {isStreaming && streamingMessage && (
                                        <div className="flex gap-3 p-4">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1 max-w-[80%]">
                                                <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-900 border">
                                                    {messageType === 'code' ? (
                                                        <div className="bg-gray-900 rounded p-3">
                                                            <SyntaxHighlighter
                                                                language="javascript"
                                                                style={oneDark}
                                                                customStyle={{ margin: 0, background: 'transparent' }}
                                                            >
                                                                {streamingMessage}
                                                            </SyntaxHighlighter>
                                                        </div>
                                                    ) : (
                                                        <ReactMarkdown className="prose prose-sm max-w-none">
                                                            {streamingMessage}
                                                        </ReactMarkdown>
                                                    )}
                                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                                        <div className="animate-pulse">●</div>
                                                        <span>AI is typing...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Reply Context */}
                            {replyToMessage && (
                                <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Reply className="h-4 w-4 text-blue-600" />
                                            <span className="text-blue-600">Replying to:</span>
                                            <span className="text-gray-700 truncate max-w-md">
                                                {replyToMessage.message.substring(0, 100)}...
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setReplyToMessage(null)}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Message Input */}
                            <div className="p-4 border-t bg-white">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <Select value={messageType} onValueChange={setMessageType}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">
                                                <div className="flex items-center gap-2">
                                                    <MessageCircle className="h-4 w-4" />
                                                    Text
                                                </div>
                                            </SelectItem>
                                            {aiCapabilities.hasCoding && (
                                                <SelectItem value="code">
                                                    <div className="flex items-center gap-2">
                                                        <Code className="h-4 w-4" />
                                                        Code
                                                    </div>
                                                </SelectItem>
                                            )}
                                            {aiCapabilities.hasAnalytics && (
                                                <SelectItem value="analytics">
                                                    <div className="flex items-center gap-2">
                                                        <BarChart3 className="h-4 w-4" />
                                                        Analytics
                                                    </div>
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <AgentSelector
                                        selectedAgent={selectedAgent}
                                        onAgentSelect={setSelectedAgent}
                                        autoSelectCapability={
                                            messageType === 'code' ? 'code_generation' :
                                            messageType === 'analytics' ? 'data_analysis' :
                                            undefined
                                        }
                                        className="flex-1 min-w-[200px]"
                                        placeholder="Choose an AI agent..."
                                    />

                                    {aiCapabilities.canGenerate && (
                                        <Badge variant="outline" className="text-xs gap-1">
                                            <Brain className="h-3 w-3" />
                                            {aiCapabilities.model}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Textarea
                                            ref={textareaRef}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder={
                                                messageType === 'code'
                                                    ? "Describe the code you want to generate..."
                                                    : messageType === 'analytics'
                                                    ? "Describe the data analysis you need..."
                                                    : "Type your message..."
                                            }
                                            className="min-h-[60px] resize-none pr-12"
                                            disabled={isLoading || isStreaming}
                                        />

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute bottom-2 right-2"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Paperclip className="h-4 w-4" />
                                        </Button>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => {
                                                // Handle file uploads
                                                console.log('Files selected:', e.target.files);
                                            }}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() || isLoading || isStreaming}
                                        className="gap-2"
                                    >
                                        {isLoading || isStreaming ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                        Send
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                    <span>Press Enter to send, Shift+Enter for new line</span>
                                    {aiCapabilities.canGenerate && (
                                        <span className="flex items-center gap-1">
                                            <Zap className="h-3 w-3" />
                                            AI assistance enabled
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                                <p>Choose a conversation from the sidebar to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
