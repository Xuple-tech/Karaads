import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Search, ArrowRight, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Conversation {
    id: number;
    conversation_id: string;
    participant_name: string;
    participant_avatar?: string;
    unread_count: number;
    last_message: string;
    last_message_at: string;
    message_count: number;
}

interface MetaAccount {
    id: number;
    account_name: string;
    platform: string;
}

interface Props {
    metaAccount: MetaAccount;
    conversations: Conversation[];
}

export default function Conversations({ metaAccount, conversations = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const filteredConversations = conversations.filter(conv =>
        conv.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    const truncateMessage = (message: string, length = 100) => {
        return message.length > length ? message.substring(0, length) + '...' : message;
    };

    return (
        <AppLayout breadcrumbs={[
            { label: 'Meta Automation', href: '/meta/dashboard' },
            { label: 'Accounts', href: '/meta/accounts' },
            { label: metaAccount.account_name },
        ]}>
            <Head title={`Conversations - ${metaAccount.account_name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
                        <p className="text-muted-foreground mt-2">{metaAccount.account_name} • {filteredConversations.length} conversations</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/meta/accounts">
                            ← Back to Accounts
                        </Link>
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Conversations List */}
                <div className="space-y-2">
                    {filteredConversations.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="pt-6 text-center">
                                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">
                                    {conversations.length === 0 ? 'No conversations yet' : 'No matching conversations found'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredConversations.map((conversation) => (
                            <Link
                                key={conversation.id}
                                href={`/meta/accounts/${metaAccount.id}/conversations/${conversation.id}`}
                                className="block"
                            >
                                <Card className="hover:shadow-md transition-shadow hover:bg-accent cursor-pointer">
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {conversation.participant_name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold truncate">{conversation.participant_name}</h3>
                                                    {conversation.unread_count > 0 && (
                                                        <Badge variant="default" className="ml-auto">
                                                            {conversation.unread_count} new
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {truncateMessage(conversation.last_message)}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(conversation.last_message_at)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="h-3 w-3" />
                                                        {conversation.message_count} messages
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <div className="flex-shrink-0">
                                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>

                {/* Info Card */}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">💡 AI Analysis in Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-800 dark:text-blue-200">
                        <p>
                            Each message in these conversations is being analyzed by our AI agent. Draft replies are automatically generated based on your configured preferences and will appear when you view the conversation.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
