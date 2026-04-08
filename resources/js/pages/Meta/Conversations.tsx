import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Search, ArrowLeft, Clock, ChevronRight } from 'lucide-react';

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

function formatTime(dateString: string) {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const AVATAR_COLORS = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
];

function avatarGradient(name: string) {
    const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

export default function Conversations({ metaAccount, conversations = [] }: Props) {
    const [query, setQuery] = useState('');

    const filtered = conversations.filter(c =>
        c.participant_name.toLowerCase().includes(query.toLowerCase()) ||
        c.last_message.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={[
            { label: 'Automations', href: '/meta/dashboard' },
            { label: 'Accounts', href: '/meta/accounts' },
            { label: metaAccount.account_name },
        ]}>
            <Head title={`${metaAccount.account_name} — Conversations`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
                        <p className="mt-1.5 text-muted-foreground">
                            {metaAccount.account_name}
                            {conversations.length > 0 && (
                                <span className="ml-2 text-muted-foreground/60">· {conversations.length} total</span>
                            )}
                        </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/meta/accounts">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Accounts
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search conversations…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center py-12 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                <MessageCircle className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <p className="font-medium">
                                {conversations.length === 0 ? 'No conversations yet' : 'No results found'}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {conversations.length === 0
                                    ? 'Messages from this account will appear here'
                                    : 'Try a different search term'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-1">
                        {filtered.map(conv => (
                            <Link
                                key={conv.id}
                                href={`/meta/accounts/${metaAccount.id}/conversations/${conv.id}`}
                                className="block"
                            >
                                <div className="group flex items-center gap-4 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-accent">
                                    {/* Avatar */}
                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(conv.participant_name)} text-white text-sm font-bold`}>
                                        {conv.participant_name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Body */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold truncate">{conv.participant_name}</span>
                                            {conv.unread_count > 0 && (
                                                <Badge className="ml-1 text-xs px-1.5 py-0 h-5 shrink-0">
                                                    {conv.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-sm text-muted-foreground truncate">
                                            {conv.last_message}
                                        </p>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground/70">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatTime(conv.last_message_at)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="h-3 w-3" />
                                                {conv.message_count}
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
