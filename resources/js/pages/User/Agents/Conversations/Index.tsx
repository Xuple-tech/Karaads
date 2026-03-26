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
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Layout from '@/layouts/UserLayout';
import user from '@/routes/user';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, MessageSquare, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Message {
    id: number;
    content: string;
    sender_type: 'user' | 'agent';
    created_at: string;
}

interface Conversation {
    id: number;
    title: string;
    status: 'active' | 'closed';
    created_at: string;
    updated_at: string;
    last_message_at: string;
    messages: Message[];
}

interface AIAgent {
    id: number;
    name: string;
    description: string | null;
}

interface Props {
    agent: AIAgent;
    conversations: {
        data: Conversation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        active: number;
        closed: number;
    };
}

export default function ConversationsIndex({ agent, conversations, stats }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = (conversation: Conversation) => {
        router.delete(user.agents.conversations.destroy.url([agent.id, conversation.id]), {
            onSuccess: () => setDeletingId(null),
        });
    };

    const getLastMessage = (conversation: Conversation) => {
        if (conversation.messages && conversation.messages.length > 0) {
            return conversation.messages[0]?.content || 'No content';
        }
        return 'No messages yet';
    };

    return (
        <Layout>
            <Head title={`${agent.name} - Conversations`} />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
                        <Link href={user.agents.show.url(agent.id)}>
                            <Button variant="outline">Back to Agent</Button>
                        </Link>
                    </div>
                    <p className="text-muted-foreground">Manage all conversations with this agent</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Closed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Conversations Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                        <CardDescription>
                            {conversations.total} total conversation{conversations.total !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {conversations.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <MessageSquare className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                                <p className="text-muted-foreground">No conversations yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Last Message</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {conversations.data.map((conversation) => (
                                                <TableRow key={conversation.id}>
                                                    <TableCell className="font-medium">
                                                        {conversation.title || `Conversation #${conversation.id}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                                                            {conversation.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                                                        {getLastMessage(conversation)}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {new Date(conversation.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={user.agents.conversations.show.url([agent.id, conversation.id])}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => setDeletingId(conversation.id)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>

                                                        <AlertDialog
                                                            open={deletingId === conversation.id}
                                                            onOpenChange={(open) => !open && setDeletingId(null)}
                                                        >
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete this conversation? This action cannot be
                                                                        undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(conversation)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {conversations.last_page > 1 && (
                                    <div className="flex justify-center pt-4">
                                        <Pagination
                                            currentPage={conversations.current_page}
                                            lastPage={conversations.last_page}
                                            onPageChange={(page) => {
                                                router.get(user.agents.conversations.index.url(agent.id), { page }, { preserveState: true });
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
