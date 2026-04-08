import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Plus, Radio, Send } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';

type Broadcast = {
    id: string;
    name: string;
    message: string;
    status: 'draft' | 'sending' | 'sent' | 'failed';
    recipient_count: number;
    sent_count: number;
    failed_count: number;
    sent_at: string | null;
    created_at: string;
};

type BroadcastDetail = {
    broadcast: Broadcast;
    recipients: Array<{
        id: string;
        participant_name: string | null;
        participant_id: string;
        status: 'pending' | 'sent' | 'failed';
        error_message: string | null;
    }>;
};

type ConversationListResponse = {
    conversations: {
        data: Array<{
            id: string;
            participant_name: string | null;
            participant_id: string;
            last_message: string | null;
        }>;
    };
};

const statusConfig: Record<string, { label: string; className: string }> = {
    draft:   { label: 'Draft',   className: '' },
    sending: { label: 'Sending', className: 'bg-amber-500 text-white hover:bg-amber-500' },
    sent:    { label: 'Sent',    className: 'bg-emerald-600 text-white hover:bg-emerald-600' },
    failed:  { label: 'Failed',  className: 'bg-destructive text-destructive-foreground hover:bg-destructive' },
};

const emptyForm = { name: '', message: '' };

export function Component() {
    const { accountId } = useParams();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const broadcastsQuery = useQuery({
        queryKey: ['spa', 'meta', 'account', accountId, 'broadcasts'],
        queryFn: () => apiRequest<{ broadcasts: { data: Broadcast[] } }>(`/api/meta/accounts/${accountId}/broadcasts`),
        enabled: Boolean(accountId),
    });

    const conversationsQuery = useQuery({
        queryKey: ['spa', 'meta', 'account', accountId, 'conversations'],
        queryFn: () => apiRequest<ConversationListResponse>(`/api/meta/accounts/${accountId}/conversations?per_page=200`),
        enabled: Boolean(accountId) && sheetOpen,
    });

    const detailQuery = useQuery({
        queryKey: ['spa', 'meta', 'account', accountId, 'broadcast', expandedId],
        queryFn: () => apiRequest<BroadcastDetail>(`/api/meta/accounts/${accountId}/broadcasts/${expandedId}`),
        enabled: Boolean(accountId && expandedId),
    });

    const invalidateBroadcasts = () =>
        queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'account', accountId, 'broadcasts'] });

    const storeMutation = useMutation({
        mutationFn: () =>
            apiRequest<{ broadcast: Broadcast }>(`/api/meta/accounts/${accountId}/broadcasts`, {
                method: 'POST',
                json: { ...form, conversation_ids: selectedIds },
            }),
        onSuccess: async ({ broadcast }) => {
            toast.success('Broadcast created');
            setSheetOpen(false);
            setForm(emptyForm);
            setSelectedIds([]);
            await invalidateBroadcasts();
            // Automatically send
            sendMutation.mutate(broadcast.id);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to create broadcast.'),
    });

    const sendMutation = useMutation({
        mutationFn: (broadcastId: string) =>
            apiRequest(`/api/meta/accounts/${accountId}/broadcasts/${broadcastId}/send`, { method: 'POST' }),
        onSuccess: async () => {
            toast.success('Broadcast sent');
            await invalidateBroadcasts();
            if (expandedId) {
                await queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'account', accountId, 'broadcast', expandedId] });
            }
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to send broadcast.'),
    });

    const conversations = conversationsQuery.data?.conversations.data ?? [];
    const allSelected = conversations.length > 0 && selectedIds.length === conversations.length;

    const toggleAll = () => {
        setSelectedIds(allSelected ? [] : conversations.map((c) => c.id));
    };

    const toggleOne = (id: string) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-8">
            {/* Header */}
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <Button asChild variant="ghost" className="h-auto w-fit px-0 py-1 text-muted-foreground hover:text-foreground">
                        <Link to={`/meta/accounts/${accountId}`}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to workspace
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Radio className="h-5 w-5 text-primary" />
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">Broadcast</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">Send one message to multiple conversations at once.</p>
                </div>
                <Button type="button" onClick={() => setSheetOpen(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    New broadcast
                </Button>
            </div>

            {/* Broadcast history */}
            <div className="flex flex-col gap-3">
                {broadcastsQuery.isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border/60 bg-card p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-64" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </div>
                    ))
                ) : (broadcastsQuery.data?.broadcasts.data ?? []).length ? (
                    (broadcastsQuery.data!.broadcasts.data ?? []).map((broadcast) => {
                        const cfg = statusConfig[broadcast.status] ?? statusConfig.draft;
                        const isExpanded = expandedId === broadcast.id;
                        return (
                            <div key={broadcast.id} className="rounded-xl border border-border/60 bg-card">
                                <button
                                    type="button"
                                    className="w-full p-4 text-left"
                                    onClick={() => setExpandedId(isExpanded ? null : broadcast.id)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 space-y-1">
                                            <p className="font-medium text-foreground">{broadcast.name}</p>
                                            <p className="line-clamp-1 text-sm text-muted-foreground">{broadcast.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {broadcast.sent_count}/{broadcast.recipient_count} sent
                                                {broadcast.failed_count > 0 && ` · ${broadcast.failed_count} failed`}
                                                {broadcast.sent_at && ` · ${new Date(broadcast.sent_at).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {broadcast.status === 'draft' && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); sendMutation.mutate(broadcast.id); }}
                                                    disabled={sendMutation.isPending}
                                                >
                                                    <Send className="mr-1.5 h-3.5 w-3.5" />
                                                    Send
                                                </Button>
                                            )}
                                            <Badge variant="secondary" className={cfg.className}>{cfg.label}</Badge>
                                        </div>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-border/60 px-4 py-3">
                                        {detailQuery.isLoading ? (
                                            <div className="space-y-2">
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <Skeleton key={i} className="h-8 w-full rounded-lg" />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border/60">
                                                {(detailQuery.data?.recipients ?? []).map((r) => (
                                                    <div key={r.id} className="flex items-center justify-between gap-3 py-2">
                                                        <p className="text-sm text-foreground">
                                                            {r.participant_name || r.participant_id}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            {r.error_message && (
                                                                <span className="text-xs text-destructive">{r.error_message}</span>
                                                            )}
                                                            <Badge
                                                                variant={r.status === 'sent' ? 'default' : r.status === 'failed' ? 'destructive' : 'secondary'}
                                                                className={r.status === 'sent' ? 'bg-emerald-600 text-white hover:bg-emerald-600' : ''}
                                                            >
                                                                {r.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 py-12 text-center">
                        <Radio className="h-8 w-8 text-muted-foreground/50" />
                        <p className="font-medium text-foreground">No broadcasts yet</p>
                        <p className="max-w-xs text-sm text-muted-foreground">
                            Send a promotion or announcement to multiple customers at once.
                        </p>
                        <Button type="button" className="mt-2" onClick={() => setSheetOpen(true)}>
                            <Plus className="mr-1.5 h-4 w-4" />
                            Create broadcast
                        </Button>
                    </div>
                )}
            </div>

            {/* Create broadcast sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>New broadcast</SheetTitle>
                        <SheetDescription>
                            Write your message, select recipients, and send to all at once.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-1 flex-col gap-5 overflow-hidden mt-6">
                        <div className="space-y-2">
                            <Label htmlFor="bcast-name">Broadcast name</Label>
                            <Input
                                id="bcast-name"
                                placeholder="e.g. April promo"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="bcast-message">Message</Label>
                                <span className="text-xs text-muted-foreground">{form.message.length}/1000</span>
                            </div>
                            <Textarea
                                id="bcast-message"
                                rows={5}
                                placeholder="Type the message to send to all selected contacts..."
                                value={form.message}
                                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                maxLength={1000}
                            />
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Recipients</Label>
                                <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
                            </div>

                            {conversationsQuery.isLoading ? (
                                <div className="space-y-2 rounded-xl border border-border/60 p-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-8 w-full rounded-lg" />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col overflow-hidden rounded-xl border border-border/60">
                                    <div className="flex items-center gap-3 border-b border-border/60 px-3 py-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={allSelected}
                                            onCheckedChange={toggleAll}
                                        />
                                        <Label htmlFor="select-all" className="cursor-pointer text-sm">
                                            Select all ({conversations.length})
                                        </Label>
                                    </div>
                                    <ScrollArea className="flex-1">
                                        <div className="p-1">
                                            {conversations.map((conv) => (
                                                <div key={conv.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted">
                                                    <Checkbox
                                                        id={`conv-${conv.id}`}
                                                        checked={selectedIds.includes(conv.id)}
                                                        onCheckedChange={() => toggleOne(conv.id)}
                                                    />
                                                    <Label htmlFor={`conv-${conv.id}`} className="min-w-0 flex-1 cursor-pointer">
                                                        <p className="truncate text-sm font-medium text-foreground">
                                                            {conv.participant_name || conv.participant_id}
                                                        </p>
                                                        {conv.last_message && (
                                                            <p className="truncate text-xs text-muted-foreground">{conv.last_message}</p>
                                                        )}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>

                        <Button
                            type="button"
                            className="w-full"
                            onClick={() => storeMutation.mutate()}
                            disabled={storeMutation.isPending || !form.name.trim() || !form.message.trim() || selectedIds.length === 0}
                        >
                            {storeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Send className="mr-2 h-4 w-4" />
                            Send to {selectedIds.length} contact{selectedIds.length === 1 ? '' : 's'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
