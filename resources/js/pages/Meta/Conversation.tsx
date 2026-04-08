import React, { useState, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Send, ThumbsDown, Pencil, Loader2, ArrowLeft, Bot, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
    id: number;
    content: string;
    is_incoming: boolean;
    sender_name: string;
    timestamp: string;
}

interface Draft {
    id: number;
    message_id: number;
    draft_reply: string;
    sentiment: string;
    sentiment_emoji: string;
    category: string;
    confidence_score: number;
    status: string;
}

interface MetaAccount {
    id: number;
    account_name: string;
    platform: string;
}

interface MetaConversation {
    id: number;
    conversation_id: string;
    participant_name: string;
}

interface Props {
    metaAccount: MetaAccount;
    metaConversation: MetaConversation;
    messages: Message[];
    drafts: Record<number, Draft>;
}

const sentimentConfig: Record<string, { emoji: string; color: string }> = {
    positive: { emoji: '😊', color: 'text-green-500' },
    negative: { emoji: '😠', color: 'text-red-500' },
    neutral: { emoji: '😐', color: 'text-muted-foreground' },
};

function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Conversation({ metaAccount, metaConversation, messages = [], drafts = {} }: Props) {
    const [editingDraftId, setEditingDraftId] = useState<number | null>(null);
    const [editedText, setEditedText] = useState('');
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const csrfToken = () =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const handleSend = async (draftId: number) => {
        setSendingId(draftId);
        try {
            const res = await fetch(`/meta/drafts/${draftId}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
            });
            if (res.ok) { toast.success('Message sent'); window.location.reload(); }
            else toast.error('Failed to send');
        } catch { toast.error('Error sending'); }
        finally { setSendingId(null); }
    };

    const handleReject = async (draftId: number) => {
        setRejectingId(draftId);
        try {
            const res = await fetch(`/meta/drafts/${draftId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
            });
            if (res.ok) { toast.success('Draft discarded'); window.location.reload(); }
            else toast.error('Failed to reject');
        } catch { toast.error('Error rejecting'); }
        finally { setRejectingId(null); }
    };

    const handleUpdate = async (draftId: number) => {
        try {
            const res = await fetch(`/meta/drafts/${draftId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ draft_reply: editedText }),
            });
            if (res.ok) { toast.success('Draft updated'); setEditingDraftId(null); window.location.reload(); }
            else toast.error('Failed to update draft');
        } catch { toast.error('Error updating draft'); }
    };

    const getDraft = (msgId: number) => Object.values(drafts).find(d => d.message_id === msgId);

    return (
        <AppLayout breadcrumbs={[
            { label: 'Automations', href: '/meta/dashboard' },
            { label: 'Accounts', href: '/meta/accounts' },
            { label: metaAccount.account_name, href: `/meta/accounts/${metaAccount.id}/conversations` },
            { label: metaConversation.participant_name },
        ]}>
            <Head title={`${metaConversation.participant_name} — Chat`} />

            <div className="flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shrink-0">
                            {metaConversation.participant_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="font-semibold leading-tight">{metaConversation.participant_name}</h1>
                            <p className="text-xs text-muted-foreground">{metaAccount.account_name}</p>
                        </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/meta/accounts/${metaAccount.id}/conversations`}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto rounded-xl border bg-card p-4 space-y-4 min-h-0">
                    {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No messages yet
                        </div>
                    ) : (
                        <>
                            {messages.map(msg => {
                                const draft = getDraft(msg.id);
                                const sentiment = sentimentConfig[draft?.sentiment ?? 'neutral'] ?? sentimentConfig.neutral;

                                return (
                                    <div key={msg.id} className="space-y-2">
                                        {/* Bubble */}
                                        <div className={`flex ${msg.is_incoming ? 'justify-start' : 'justify-end'}`}>
                                            <div
                                                className={`relative max-w-xs rounded-2xl px-4 py-2.5 text-sm lg:max-w-md ${
                                                    msg.is_incoming
                                                        ? 'rounded-tl-sm bg-muted text-foreground'
                                                        : 'rounded-tr-sm bg-primary text-primary-foreground'
                                                }`}
                                            >
                                                <p className="leading-relaxed">{msg.content}</p>
                                                <p className={`mt-1 text-[10px] ${msg.is_incoming ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                                                    {formatTime(msg.timestamp)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Draft card — only for incoming messages */}
                                        {msg.is_incoming && draft && (
                                            <div className="flex justify-start pl-2">
                                                <div className="w-full max-w-xs rounded-xl border border-border bg-card shadow-sm lg:max-w-md">
                                                    {/* Draft header */}
                                                    <div className="flex items-center justify-between px-3 pt-3 pb-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                                                                <Bot className="h-3 w-3 text-primary" />
                                                            </div>
                                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Draft</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-base leading-none">{sentiment.emoji}</span>
                                                            <Badge variant="outline" className="text-[10px] py-0 h-4 capitalize">
                                                                {draft.category}
                                                            </Badge>
                                                            <span className={`text-[10px] font-medium ${draft.confidence_score >= 70 ? 'text-green-500' : 'text-amber-500'}`}>
                                                                {draft.confidence_score.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Draft body */}
                                                    <div className="px-3 pb-3">
                                                        {editingDraftId === draft.id ? (
                                                            <Textarea
                                                                value={editedText}
                                                                onChange={e => setEditedText(e.target.value)}
                                                                rows={3}
                                                                className="text-sm resize-none"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <p className="text-sm text-foreground leading-relaxed">{draft.draft_reply}</p>
                                                        )}

                                                        {/* Actions */}
                                                        <div className="mt-3 flex gap-2">
                                                            {editingDraftId === draft.id ? (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-7 text-xs flex-1"
                                                                        onClick={() => setEditingDraftId(null)}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 text-xs flex-1"
                                                                        onClick={() => handleUpdate(draft.id)}
                                                                    >
                                                                        <CheckCheck className="mr-1 h-3 w-3" />
                                                                        Save
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 text-xs"
                                                                        onClick={() => {
                                                                            setEditingDraftId(draft.id);
                                                                            setEditedText(draft.draft_reply);
                                                                        }}
                                                                    >
                                                                        <Pencil className="mr-1 h-3 w-3" />
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 text-xs flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                                        onClick={() => handleSend(draft.id)}
                                                                        disabled={sendingId === draft.id}
                                                                    >
                                                                        {sendingId === draft.id
                                                                            ? <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                                            : <Send className="mr-1 h-3 w-3" />
                                                                        }
                                                                        Send
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                        onClick={() => handleReject(draft.id)}
                                                                        disabled={rejectingId === draft.id}
                                                                    >
                                                                        {rejectingId === draft.id
                                                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                                                            : <ThumbsDown className="h-3 w-3" />
                                                                        }
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </>
                    )}
                </div>

                {/* Footer tip */}
                <p className="mt-3 shrink-0 text-center text-xs text-muted-foreground/60">
                    AI drafts are generated automatically · Edit before sending or send as-is
                </p>
            </div>
        </AppLayout>
    );
}
