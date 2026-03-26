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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Layout from '@/layouts/UserLayout';
import user from '@/routes/user';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Check, Copy, Lock, LockOpen, MoreVertical, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
interface Message {
    id: number;
    content: string;
    sender_type: 'user' | 'agent';
    is_read: boolean;
    created_at: string;
    read_at: string | null;
}

interface Conversation {
    id: number;
    title: string;
    status: 'active' | 'closed';
    created_at: string;
    updated_at: string;
    messages: Message[];
}

interface AIAgent {
    id: number;
    name: string;
}

interface Props {
    agent: AIAgent;
    conversation: Conversation;
}

export default function ConversationShow({ agent, conversation }: Props) {
    const [deletingConversation, setDeletingConversation] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation.messages]);

    const handleDelete = () => {
        router.delete(user.agents.conversations.destroy.url([agent.id, conversation.id]), {
            onSuccess: () => {
                router.visit(user.agents.conversations.index.url(agent.id));
            },
        });
    };

    const handleClose = () => {
        router.post(user.agents.conversations.close.url([agent.id, conversation.id]), {});
    };

    const handleReopen = () => {
        router.post(user.agents.conversations.reopen.url([agent.id, conversation.id]), {});
    };

    const copyToClipboard = (text: string, messageId: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <Layout>
            <Head title={`${conversation.title || 'Conversation'} - ${agent.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={user.agents.conversations.index.url(agent.id)}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{conversation.title || `Conversation #${conversation.id}`}</h1>
                            <p className="text-muted-foreground mt-1 text-sm">{agent.name}</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {conversation.status === 'active' ? (
                                <DropdownMenuItem onClick={handleClose}>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Close Conversation
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={handleReopen}>
                                    <LockOpen className="mr-2 h-4 w-4" />
                                    Reopen Conversation
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setDeletingConversation(true)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Status and Info */}
                <div className="flex items-center gap-4">
                    <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                        {conversation.status === 'active' ? 'Active' : 'Closed'}
                    </Badge>
                    <div className="text-muted-foreground text-sm">
                        Created {new Date(conversation.created_at).toLocaleDateString()} at {new Date(conversation.created_at).toLocaleTimeString()}
                    </div>
                </div>

                {/* Messages */}
                <Card>
                    <CardHeader>
                        <CardTitle>Messages</CardTitle>
                        <CardDescription>
                            {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[600px] space-y-4 overflow-y-auto pb-4">
                            {conversation.messages.length === 0 ? (
                                <div className="text-muted-foreground py-12 text-center">No messages in this conversation</div>
                            ) : (
                                <>
                                    {conversation.messages.map((message) => (
                                        <div key={message.id} className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`group flex max-w-xs items-end gap-2 lg:max-w-md xl:max-w-lg ${
                                                    message.sender_type === 'user' ? 'flex-row-reverse' : ''
                                                }`}
                                            >
                                                <div
                                                    className={`rounded-lg px-4 py-2 ${
                                                        message.sender_type === 'user'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                                                    }`}
                                                >
                                                    <ReactMarkdown>
                                                        {message.content}
                                                    </ReactMarkdown>
                                                    <p
                                                        className={`mt-1 text-xs ${
                                                            message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        {new Date(message.created_at).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(message.content, message.id)}
                                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                                    title="Copy message"
                                                >
                                                    {copiedId === message.id ? (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Dialog */}
                <AlertDialog open={deletingConversation} onOpenChange={setDeletingConversation}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this conversation? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    );
}
