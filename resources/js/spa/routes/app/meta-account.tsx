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

    const drafts = useMemo(() => conversationQuery.data?.drafts ?? [], [conversationQuery.data?.drafts]);

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-foreground">
                        <Link to="/meta">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Automations
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            {listQuery.data?.account.account_name ?? 'Meta workspace'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage conversations, drafts, and approvals from the SPA.
                        </p>
                    </div>
                </div>

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
                        <CardDescription>Open a thread to review drafts or send a manual reply.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <ScrollArea className="h-[70vh] px-4">
                            <div className="space-y-3">
                                {(listQuery.data?.conversations.data ?? []).map((conversation) => (
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
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-foreground">
                                                    {conversation.participant_name || conversation.participant_id}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                    {conversation.last_message || 'No messages yet'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {conversation.unread_count > 0 && (
                                                    <Badge>{conversation.unread_count}</Badge>
                                                )}
                                                {conversation.has_pending_draft && (
                                                    <Badge variant="secondary">Draft</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle>
                            {selectedConversation?.participant_name || 'Select a conversation'}
                        </CardTitle>
                        <CardDescription>
                            {selectedConversation
                                ? selectedConversation.participant_id
                                : 'Choose a conversation from the left to open the thread.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {selectedConversation ? (
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
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={message.direction === 'incoming' ? 'secondary' : 'default'}>
                                                        {message.direction}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">{message.sender_name || message.sender_id}</span>
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
                                                        <Badge variant="outline">Confidence {Math.round(Number(draft.confidence_score ?? 0))}%</Badge>
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
                                            No pending drafts yet. Generate one from an incoming message above.
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
                            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                                Select a conversation from the left to load messages, drafts, and manual reply controls.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

async function refreshCurrentConversation(accountId?: string, conversationId?: string) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'account', accountId, 'conversations'] }),
        queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'account', accountId, 'conversation', conversationId] }),
    ]);
}
