import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Bot, Check, Loader2, MessageSquare, Send, Settings2, Sparkles, Tag, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
            crm_status: string;
            tags: string[];
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
        crm_status: string;
        tags: string[];
        notes: string | null;
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
        ai_analysis:
            | {
                  intent?: string;
                  priority?: string;
                  reply_goal?: string;
                  key_points?: string[];
                  plan?: string[];
                  memory?: Array<{ role?: string; text?: string; score?: number }>;
                  trace?: {
                      memory_hits?: number;
                  };
              }
            | string
            | null;
        sentiment: string | null;
        category: string | null;
        confidence_score: number | null;
        status: string;
        auto_approved: boolean;
    }>;
};

type ReplyTemplate = { id: string; name: string; content: string; category: string | null; usage_count: number };

const crmStatusConfig: Record<string, { label: string; className: string }> = {
    new:      { label: 'New',      className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    lead:     { label: 'Lead',     className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    customer: { label: 'Customer', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
    vip:      { label: 'VIP',      className: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
    closed:   { label: 'Closed',   className: 'bg-muted text-muted-foreground' },
};

export function Component() {
    const navigate = useNavigate();
    const { accountId, conversationId } = useParams();
    const [manualMessage, setManualMessage] = useState('');
    const [draftEdits, setDraftEdits] = useState<Record<string, string>>({});

    // CRM sheet state
    const [crmOpen, setCrmOpen] = useState(false);
    const [crmStatus, setCrmStatus] = useState('new');
    const [crmTags, setCrmTags] = useState<string[]>([]);
    const [crmNotes, setCrmNotes] = useState('');
    const [tagInput, setTagInput] = useState('');

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

    const templatesQuery = useQuery({
        queryKey: ['spa', 'meta', 'account', accountId, 'templates'],
        queryFn: () => apiRequest<{ templates: ReplyTemplate[] }>(`/api/meta/accounts/${accountId}/templates`),
        enabled: Boolean(accountId),
    });

    // Sync CRM state when conversation loads
    useEffect(() => {
        const conv = conversationQuery.data?.conversation;
        if (!conv) return;
        setCrmStatus(conv.crm_status ?? 'new');
        setCrmTags(conv.tags ?? []);
        setCrmNotes(conv.notes ?? '');
    }, [conversationQuery.data?.conversation]);

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

    const crmMutation = useMutation({
        mutationFn: () =>
            apiRequest(`/api/meta/accounts/${accountId}/conversations/${conversationId}/crm`, {
                method: 'PATCH',
                json: { crm_status: crmStatus, tags: crmTags, notes: crmNotes },
            }),
        onSuccess: async () => {
            toast.success('CRM updated');
            setCrmOpen(false);
            await refreshCurrentConversation(accountId, conversationId);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to update CRM.'),
    });

    const addTag = (value: string) => {
        const tag = value.trim();
        if (tag && !crmTags.includes(tag)) {
            setCrmTags((prev) => [...prev, tag]);
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => setCrmTags((prev) => prev.filter((t) => t !== tag));

    const useTemplate = (template: ReplyTemplate) => {
        setManualMessage(template.content);
        void apiRequest(`/api/meta/templates/${template.id}/use`, { method: 'POST' });
    };

    const crmCfg = crmStatusConfig[selectedConversation?.crm_status ?? 'new'] ?? crmStatusConfig.new;

    const getAnalysis = (analysis: ConversationResponse['drafts'][number]['ai_analysis']) =>
        analysis && typeof analysis === 'object' ? analysis : null;

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <Button asChild variant="ghost" className="h-auto w-fit px-0 py-1 text-muted-foreground hover:text-foreground">
                        <Link to="/meta">
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Automations
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            {listQuery.data?.account.account_name ?? 'Workspace'}
                        </h1>
                        <Badge variant="outline" className="capitalize">
                            {listQuery.data?.account.platform ?? 'meta'}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-3">
                        <StatPill label="Threads" value={conversationCount} loading={listQuery.isLoading} />
                        <StatPill label="Unread" value={unreadCount} loading={listQuery.isLoading} />
                        <StatPill label="Drafts" value={draftCount} loading={listQuery.isLoading} />
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link to={`/meta/accounts/${accountId}/preferences`}>
                            <Settings2 className="mr-1.5 h-4 w-4" />
                            Settings
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                {/* Conversation list */}
                <Card className="border-border/60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Conversations</CardTitle>
                        <CardDescription className="text-xs">Select a thread to open it.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <ScrollArea className="h-[70vh] px-4">
                            <div className="space-y-2">
                                {listQuery.isLoading ? (
                                    Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="rounded-xl border border-border/60 p-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                                <Skeleton className="h-5 w-8 rounded-full" />
                                            </div>
                                        </div>
                                    ))
                                ) : (listQuery.data?.conversations.data ?? []).length ? (
                                    (listQuery.data?.conversations.data ?? []).map((conversation) => {
                                        const cfg = crmStatusConfig[conversation.crm_status] ?? crmStatusConfig.new;
                                        return (
                                            <button
                                                key={conversation.id}
                                                type="button"
                                                onClick={() => navigate(`/meta/accounts/${accountId}/conversations/${conversation.id}`)}
                                                className={`w-full rounded-xl border p-3 text-left transition ${
                                                    conversationId === conversation.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border/60 hover:border-primary/30 hover:bg-primary/5'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 space-y-1">
                                                        <p className="truncate text-sm font-medium text-foreground">
                                                            {conversation.participant_name || conversation.participant_id}
                                                        </p>
                                                        <p className="line-clamp-1 text-xs text-muted-foreground">
                                                            {conversation.last_message || 'No messages yet'}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        {conversation.unread_count > 0 && (
                                                            <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500 text-xs">{conversation.unread_count}</Badge>
                                                        )}
                                                        {conversation.has_pending_draft && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                                                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cfg.className}`}>{cfg.label}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border/60 p-5 text-sm text-muted-foreground">
                                        No conversations yet.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Conversation detail */}
                <Card className="border-border/60">
                    <CardHeader className="gap-3 pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <CardTitle className="text-base">{selectedConversation?.participant_name || 'Select a conversation'}</CardTitle>
                                <CardDescription className="text-xs">
                                    {selectedConversation
                                        ? selectedConversation.participant_id
                                        : 'Choose a conversation from the left to load the thread.'}
                                </CardDescription>
                            </div>

                            {selectedConversation && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${crmCfg.className}`}>
                                        {crmCfg.label}
                                    </span>
                                    {selectedConversation.tags?.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                    ))}
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2"
                                        onClick={() => setCrmOpen(true)}
                                    >
                                        <Tag className="h-3.5 w-3.5" />
                                    </Button>
                                    <Badge variant="outline" className="text-xs">
                                        {drafts.length} draft{drafts.length === 1 ? '' : 's'}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {conversationQuery.isLoading && conversationId ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="rounded-xl border border-border/60 p-4">
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
                        ) : selectedConversation ? (
                            <>
                                {/* Messages */}
                                <div className="space-y-2">
                                    {conversationQuery.data?.messages.data.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`rounded-xl border p-4 ${
                                                message.direction === 'outgoing'
                                                    ? 'border-primary/20 bg-primary/5'
                                                    : 'border-border/60 bg-card'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant={message.direction === 'incoming' ? 'secondary' : 'default'} className="text-xs">
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
                                                        <Bot className="mr-1.5 h-3.5 w-3.5" />
                                                        Draft reply
                                                    </Button>
                                                )}
                                            </div>

                                            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{message.content}</p>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                {/* Pending drafts */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <h2 className="text-sm font-medium text-foreground">Pending drafts</h2>
                                    </div>
                                    <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
                                        This test script does not train the AI model itself. It checks whether the upgraded service logic is improving how the AI understands messages and builds replies.
                                    </div>

                                    {drafts.length ? (
                                        drafts.map((draft) => {
                                            const currentDraft = draftEdits[draft.id] ?? draft.draft_reply;
                                            const analysis = getAnalysis(draft.ai_analysis);
                                            const keyPoints = analysis?.key_points ?? [];
                                            const plan = analysis?.plan ?? [];
                                            const memory = analysis?.memory ?? [];

                                            return (
                                                <div key={draft.id} className="rounded-xl border border-border/60 p-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant="secondary" className="text-xs">{draft.sentiment || 'neutral'}</Badge>
                                                        <Badge variant="outline" className="text-xs">{draft.category || 'other'}</Badge>
                                                        {analysis?.intent && (
                                                            <Badge variant="outline" className="text-xs capitalize">
                                                                intent: {analysis.intent.replaceAll('_', ' ')}
                                                            </Badge>
                                                        )}
                                                        {analysis?.priority && (
                                                            <Badge variant="outline" className="text-xs capitalize">
                                                                {analysis.priority} priority
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs">
                                                            {Math.round(Number(draft.confidence_score ?? 0))}% confident
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-2 text-xs text-muted-foreground">{draft.original_message}</p>

                                                    {analysis && (
                                                        <div className="mt-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                                {analysis.reply_goal && <span>Goal: {analysis.reply_goal}</span>}
                                                                <span>Memory hits: {analysis.trace?.memory_hits ?? memory.length}</span>
                                                            </div>

                                                            {keyPoints.length > 0 && (
                                                                <div className="mt-2">
                                                                    <p className="text-xs font-medium text-foreground">Key points</p>
                                                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                                                        {keyPoints.map((point) => (
                                                                            <Badge key={point} variant="secondary" className="text-xs">
                                                                                {point}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {plan.length > 0 && (
                                                                <div className="mt-2">
                                                                    <p className="text-xs font-medium text-foreground">Plan</p>
                                                                    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                                                        {plan.map((step, index) => (
                                                                            <p key={`${draft.id}-plan-${index}`}>{index + 1}. {step}</p>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {memory.length > 0 && (
                                                                <div className="mt-2">
                                                                    <p className="text-xs font-medium text-foreground">Relevant memory</p>
                                                                    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                                                        {memory.slice(0, 2).map((item, index) => (
                                                                            <p key={`${draft.id}-memory-${index}`}>
                                                                                {(item.role ?? 'Context')}: {item.text}
                                                                            </p>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <Textarea
                                                        value={currentDraft}
                                                        onChange={(event) => setDraftEdits((current) => ({ ...current, [draft.id]: event.target.value }))}
                                                        rows={4}
                                                        className="mt-3"
                                                    />
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateDraftMutation.mutate({ draftId: draft.id, draftReply: currentDraft })}
                                                        >
                                                            <Check className="mr-1.5 h-3.5 w-3.5" />
                                                            Save
                                                        </Button>
                                                        <Button type="button" size="sm" onClick={() => sendDraftMutation.mutate(draft.id)}>
                                                            <Send className="mr-1.5 h-3.5 w-3.5" />
                                                            Send
                                                        </Button>
                                                        <Button type="button" size="sm" variant="ghost" onClick={() => rejectDraftMutation.mutate(draft.id)}>
                                                            <X className="mr-1.5 h-3.5 w-3.5" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                                            No pending drafts. Generate one from an incoming message above.
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Manual reply */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-primary" />
                                        <h2 className="text-sm font-medium text-foreground">Manual reply</h2>
                                    </div>
                                    <Textarea
                                        value={manualMessage}
                                        onChange={(event) => setManualMessage(event.target.value)}
                                        rows={4}
                                        placeholder="Send a direct reply to this conversation"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => manualSendMutation.mutate()}
                                            disabled={manualSendMutation.isPending || !manualMessage.trim()}
                                        >
                                            {manualSendMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                            Send message
                                        </Button>

                                        {/* Template picker */}
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button type="button" variant="outline" size="sm">
                                                    <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                                                    Templates
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-72 p-0" align="start">
                                                <div className="border-b border-border/60 px-3 py-2.5">
                                                    <p className="text-sm font-medium">Quick reply templates</p>
                                                </div>
                                                <ScrollArea className="max-h-56">
                                                    {templatesQuery.isLoading ? (
                                                        <div className="space-y-1 p-2">
                                                            {Array.from({ length: 3 }).map((_, i) => (
                                                                <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                                            ))}
                                                        </div>
                                                    ) : (templatesQuery.data?.templates ?? []).length ? (
                                                        <div className="p-1">
                                                            {(templatesQuery.data?.templates ?? []).map((template) => (
                                                                <button
                                                                    key={template.id}
                                                                    type="button"
                                                                    onClick={() => useTemplate(template)}
                                                                    className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-muted"
                                                                >
                                                                    <p className="text-sm font-medium text-foreground">{template.name}</p>
                                                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{template.content}</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="p-3 text-xs text-muted-foreground">No templates yet.</p>
                                                    )}
                                                </ScrollArea>
                                                <div className="border-t border-border/60 px-3 py-2">
                                                    <Link
                                                        to={`/meta/accounts/${accountId}/templates`}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Manage templates →
                                                    </Link>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
                                <p className="font-medium text-foreground">No conversation selected</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Pick a thread from the list to review messages, drafts, and reply controls.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* CRM Sheet */}
            <Sheet open={crmOpen} onOpenChange={setCrmOpen}>
                <SheetContent side="right" className="w-full sm:max-w-sm">
                    <SheetHeader>
                        <SheetTitle>CRM</SheetTitle>
                        <SheetDescription>
                            Tag and classify this conversation for your business workflow.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-5">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={crmStatus} onValueChange={setCrmStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(crmStatusConfig).map(([value, cfg]) => (
                                        <SelectItem key={value} value={value}>
                                            {cfg.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {crmTags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <Input
                                placeholder="Type a tag and press Enter"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag(tagInput);
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={crmNotes}
                                onChange={(e) => setCrmNotes(e.target.value)}
                                rows={4}
                                placeholder="Internal notes about this customer..."
                            />
                        </div>

                        <Button
                            type="button"
                            className="w-full"
                            onClick={() => crmMutation.mutate()}
                            disabled={crmMutation.isPending}
                        >
                            {crmMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save CRM data
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

function StatPill({ label, value, loading = false }: { label: string; value: number; loading?: boolean }) {
    return (
        <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5">
            {loading ? (
                <Skeleton className="h-4 w-8" />
            ) : (
                <span className="text-sm font-semibold text-foreground">{value}</span>
            )}
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

async function refreshCurrentConversation(accountId?: string, conversationId?: string) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'account', accountId, 'conversations'] }),
        queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'account', accountId, 'conversation', conversationId] }),
    ]);
}
