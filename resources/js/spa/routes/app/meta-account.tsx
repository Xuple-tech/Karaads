import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bot, Check, Loader2, MessageSquare, Send, Settings2, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';

type ConversationListResponse = {
    account: { id: string; platform: string; account_name: string };
    conversations: {
        data: Array<{
            id: string;
            conversation_id: string;
            participant_name: string | null;
            participant_id: string;
            last_message: string | null;
            last_message_at: string | null;
            unread_count: number;
            has_pending_draft: boolean;
        }>;
    };
};

type ConversationResponse = {
    account: { id: string; platform: string; account_name: string };
    conversation: {
        id: string;
        participant_name: string | null;
        participant_id: string;
        last_message_at: string | null;
    };
    messages: {
        data: Array<{
            id: string;
            direction: 'incoming' | 'outgoing';
            sender_id: string;
            sender_name: string | null;
            content: string;
            status: string;
            created_at: string | null;
            has_draft: boolean;
        }>;
    };
    drafts: Array<{
        id: string;
        original_message: string;
        draft_reply: string;
        sentiment: string | null;
        category: string | null;
        confidence_score: number | null;
        status: string;
        auto_approved: boolean;
    }>;
};

export function Component() {
    const navigate = useNavigate();
    const { accountId, conversationId } = useParams();
    const [manualMessage, setManualMessage] = useState('');
    const [draftEdits, setDraftEdits] = useState<Record<string, string>>({});

    const listQuery = useQuery({
        queryKey: ['spa', 'meta', 'account', accountId, 'conversations'],
        queryFn: () => apiRequest<ConversationListResponse>(`/api/meta/accounts/${accountId}/conversations?per_page=50`),
        enabled: Boolean(accountId),
    });

    const conversationQuery = useQuery({
        queryKey: ['spa', 'meta', 'account', accountId, 'conversation', conversationId],
        queryFn: () => apiRequest<ConversationResponse>(`/api/meta/accounts/${accountId}/conversations/${conversationId}`),
        enabled: Boolean(accountId && conversationId),
    });

    const selectedConversation = conversationQuery.data?.conversation;
    const drafts = useMemo(() => conversationQuery.data?.drafts ?? [], [conversationQuery.data?.drafts]);
    const conversationCount = listQuery.data?.conversations.data.length ?? 0;
    const unreadCount = (listQuery.data?.conversations.data ?? []).reduce((total, item) => total + item.unread_count, 0);
    const draftCount = (listQuery.data?.conversations.data ?? []).filter((item) => item.has_pending_draft).length;

    const analyzeMutation = useMutation({
        mutationFn: (messageId: string) => apiRequest(`/api/meta/messages/${messageId}/analyze`, { method: 'POST', json: {} }),
        onSuccess: async () => {
            toast.success('Draft generated');
            await refreshCurrentConversation(accountId, conversationId);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to generate draft.'),
    });

    const updateDraftMutation = useMutation({
        mutationFn: ({ draftId, draftReply }: { draftId: string; draftReply: string }) =>
            apiRequest(`/api/meta/drafts/${draftId}`, { method: 'PUT', json: { draft_reply: draftReply } }),
        onSuccess: async () => {
            toast.success('Draft updated');
            await refreshCurrentConversation(accountId, conversationId);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to update draft.'),
    });

    const sendDraftMutation = useMutation({
        mutationFn: (draftId: string) => apiRequest(`/api/meta/drafts/${draftId}/send`, { method: 'POST', json: {} }),
        onSuccess: async () => {
            toast.success('Draft sent');
            setManualMessage('');
            await refreshCurrentConversation(accountId, conversationId);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to send draft.'),
    });

    const rejectDraftMutation = useMutation({
        mutationFn: (draftId: string) => apiRequest(`/api/meta/drafts/${draftId}/reject`, { method: 'POST', json: {} }),
        onSuccess: async () => {
            toast.success('Draft rejected');
            await refreshCurrentConversation(accountId, conversationId);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to reject draft.'),
    });

    const manualSendMutation = useMutation({
        mutationFn: () =>
            apiRequest(`/api/meta/conversations/${selectedConversation?.id}/send`, {
                method: 'POST',
                json: { message: manualMessage },
            }),
        onSuccess: async () => {
            toast.success('Message sent');
            setManualMessage('');
            await refreshCurrentConversation(accountId, conversationId);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to send message.'),
    });

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/6 via-background to-primary/10 p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-foreground">
                            <Link to="/meta">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Automations
                            </Link>
                        </Button>

                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                    {listQuery.data?.account.account_name ?? 'Meta workspace'}
                                </h1>
                                <Badge variant="outline" className="capitalize">
                                    {listQuery.data?.account.platform ?? 'meta'}
                                </Badge>
                            </div>
                            <p className="max-w-2xl text-sm text-muted-foreground">
                                Review conversations, generate drafts, and manage replies with a clear approval workflow.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
                        <SummaryCard label="Threads" value={conversationCount} loading={listQuery.isLoading} />
                        <SummaryCard label="Unread" value={unreadCount} loading={listQuery.isLoading} />
                        <SummaryCard label="Drafts" value={draftCount} loading={listQuery.isLoading} />
                    </div>
                </div>
            </section>

            <div className="flex justify-end">
                <Button asChild variant="outline" className="w-fit">
                    <Link to={`/meta/accounts/${accountId}/preferences`}>
                        <Settings2 className="mr-2 h-4 w-4" />
                        Bot preferences
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                        <CardDescription>Open any thread to inspect messages, generate AI drafts, or send a manual response.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <ScrollArea className="h-[70vh] px-4">
                            <div className="space-y-3">
                                {listQuery.isLoading ? (
                                    Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="rounded-2xl border border-border/60 p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-5 w-32" />
                                                        <Skeleton className="h-4 w-48" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-5 w-8 rounded-full" />
                                                        <Skeleton className="h-5 w-12 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (listQuery.data?.conversations.data ?? []).length ? (
                                    (listQuery.data?.conversations.data ?? []).map((conversation) => (
                                        <button
                                            key={conversation.id}
                                            type="button"
                                            onClick={() => navigate(`/meta/accounts/${accountId}/conversations/${conversation.id}`)}
                                            className={`w-full rounded-2xl border p-4 text-left transition ${
                                                conversationId === conversation.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border/60 hover:border-primary/30 hover:bg-primary/5'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 space-y-1">
                                                    <p className="truncate font-medium text-foreground">
                                                        {conversation.participant_name || conversation.participant_id}
                                                    </p>
                                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                                        {conversation.last_message || 'No messages yet'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {conversation.unread_count > 0 && (
                                                        <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">{conversation.unread_count}</Badge>
                                                    )}
                                                    {conversation.has_pending_draft && <Badge variant="secondary">Draft</Badge>}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-border/60 p-5 text-sm text-muted-foreground">
                                        No conversations available for this account yet.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <CardTitle>{selectedConversation?.participant_name || 'Select a conversation'}</CardTitle>
                                <CardDescription>
                                    {selectedConversation
                                        ? selectedConversation.participant_id
                                        : 'Choose a conversation from the left to load the thread.'}
                                </CardDescription>
                            </div>

                            {selectedConversation && (
                                <Badge variant="outline" className="w-fit">
                                    {drafts.length} pending draft{drafts.length === 1 ? '' : 's'}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {conversationQuery.isLoading && conversationId ? (
                            <>
                                <div className="space-y-3">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="rounded-2xl border border-border/60 p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex gap-2">
                                                        <Skeleton className="h-5 w-20 rounded-full" />
                                                        <Skeleton className="h-4 w-28" />
                                                    </div>
                                                    <Skeleton className="h-8 w-24" />
                                                </div>
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-4/5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : selectedConversation ? (
                            <>
                                <div className="space-y-3">
                                    {conversationQuery.data?.messages.data.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`rounded-2xl border p-4 ${
                                                message.direction === 'outgoing'
                                                    ? 'border-primary/20 bg-primary/5'
                                                    : 'border-border/60 bg-card'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant={message.direction === 'incoming' ? 'secondary' : 'default'}>
                                                        {message.direction}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {message.sender_name || message.sender_id}
                                                    </span>
                                                </div>

                                                {message.direction === 'incoming' && !message.has_draft && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => analyzeMutation.mutate(message.id)}
                                                        disabled={analyzeMutation.isPending}
                                                    >
                                                        <Bot className="mr-2 h-4 w-4" />
                                                        Draft reply
                                                    </Button>
                                                )}
                                            </div>

                                            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{message.content}</p>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <h2 className="font-medium text-foreground">Pending drafts</h2>
                                    </div>

                                    {drafts.length ? (
                                        drafts.map((draft) => {
                                            const currentDraft = draftEdits[draft.id] ?? draft.draft_reply;

                                            return (
                                                <div key={draft.id} className="rounded-2xl border border-border/60 p-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="secondary">{draft.sentiment || 'neutral'}</Badge>
                                                    <Badge variant="outline">{draft.category || 'other'}</Badge>
                                                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                                                        Confidence {Math.round(Number(draft.confidence_score ?? 0))}%
                                                    </Badge>
                                                </div>
                                                    <p className="mt-3 text-sm text-muted-foreground">{draft.original_message}</p>
                                                    <Textarea
                                                        value={currentDraft}
                                                        onChange={(event) => setDraftEdits((current) => ({ ...current, [draft.id]: event.target.value }))}
                                                        rows={4}
                                                        className="mt-3"
                                                    />
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => updateDraftMutation.mutate({ draftId: draft.id, draftReply: currentDraft })}
                                                        >
                                                            <Check className="mr-2 h-4 w-4" />
                                                            Save draft
                                                        </Button>
                                                        <Button type="button" onClick={() => sendDraftMutation.mutate(draft.id)}>
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Send draft
                                                        </Button>
                                                        <Button type="button" variant="ghost" onClick={() => rejectDraftMutation.mutate(draft.id)}>
                                                            <X className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-border/60 p-5 text-sm text-muted-foreground">
                                            No pending drafts yet. Generate one from an incoming message in the thread above.
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-primary" />
                                        <h2 className="font-medium text-foreground">Manual reply</h2>
                                    </div>
                                    <Textarea
                                        value={manualMessage}
                                        onChange={(event) => setManualMessage(event.target.value)}
                                        rows={4}
                                        placeholder="Send a direct reply to this conversation"
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => manualSendMutation.mutate()}
                                        disabled={manualSendMutation.isPending || !manualMessage.trim()}
                                    >
                                        {manualSendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Send message
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
                                <p className="font-medium text-foreground">No conversation selected</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Pick a thread from the list to review messages, drafts, and reply controls.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, loading = false }: { label: string; value: number; loading?: boolean }) {
    return (
        <div className="rounded-2xl border border-border/50 bg-background/85 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            {loading ? <Skeleton className="mt-2 h-8 w-14" /> : <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>}
        </div>
    );
}

async function refreshCurrentConversation(accountId?: string, conversationId?: string) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'account', accountId, 'conversations'] }),
        queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'account', accountId, 'conversation', conversationId] }),
    ]);
}
