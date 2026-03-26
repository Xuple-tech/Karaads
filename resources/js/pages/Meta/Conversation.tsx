import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, ThumbsUp, ThumbsDown, Edit2, Copy, Loader } from 'lucide-react';
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
    category_icon: string;
    confidence_score: number;
    status: string;
    ai_analysis: string;
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

const sentimentEmojis: Record<string, string> = {
    positive: '😊',
    negative: '😠',
    neutral: '😐',
};

export default function Conversation({
    metaAccount,
    metaConversation,
    messages = [],
    drafts = {},
}: Props) {
    const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);
    const [editingDraftId, setEditingDraftId] = useState<number | null>(null);
    const [editedText, setEditedText] = useState('');
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendDraft = async (draftId: number) => {
        setSendingId(draftId);
        try {
            const response = await fetch(`/meta/drafts/${draftId}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                toast.success('Message sent successfully!');
                window.location.reload();
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            toast.error('Error sending message');
        } finally {
            setSendingId(null);
        }
    };

    const handleRejectDraft = async (draftId: number) => {
        setRejectingId(draftId);
        try {
            const response = await fetch(`/meta/drafts/${draftId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                toast.success('Draft rejected');
                window.location.reload();
            } else {
                toast.error('Failed to reject draft');
            }
        } catch (error) {
            toast.error('Error rejecting draft');
        } finally {
            setRejectingId(null);
        }
    };

    const handleUpdateDraft = async (draftId: number) => {
        try {
            const response = await fetch(`/meta/drafts/${draftId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ draft_reply: editedText }),
            });

            if (response.ok) {
                toast.success('Draft updated');
                setEditingDraftId(null);
                window.location.reload();
            } else {
                toast.error('Failed to update draft');
            }
        } catch (error) {
            toast.error('Error updating draft');
        }
    };

    const getDraft = (messageId: number) => {
        return Object.values(drafts).find(d => d.message_id === messageId);
    };

    return (
        <AppLayout breadcrumbs={[
            { label: 'Meta Automation', href: '/meta/dashboard' },
            { label: 'Accounts', href: '/meta/accounts' },
            { label: metaAccount.account_name, href: `/meta/accounts/${metaAccount.id}/conversations` },
            { label: metaConversation.participant_name },
        ]}>
            <Head title={`Chat with ${metaConversation.participant_name}`} />

            <div className="space-y-4 flex flex-col h-[calc(100vh-200px)]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{metaConversation.participant_name}</h1>
                        <p className="text-sm text-muted-foreground">{metaAccount.account_name}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/meta/accounts/${metaAccount.id}/conversations`}>
                            ← Back to Conversations
                        </Link>
                    </Button>
                </div>

                {/* Messages */}
                <Card className="flex-1 overflow-hidden flex flex-col">
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No messages yet
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => {
                                    const draft = getDraft(message.id);
                                    return (
                                        <div key={message.id} className="space-y-2">
                                            {/* Message Bubble */}
                                            <div
                                                className={`flex ${message.is_incoming ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                        message.is_incoming
                                                            ? 'bg-muted text-muted-foreground'
                                                            : 'bg-blue-600 text-white'
                                                    }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <p className="text-xs mt-1 opacity-70">
                                                        {new Date(message.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* AI Draft (only for incoming messages) */}
                                            {message.is_incoming && draft && (
                                                <div className="flex justify-start">
                                                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 max-w-xs lg:max-w-md">
                                                        <CardHeader className="pb-2 pt-3 px-3">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div>
                                                                    <CardTitle className="text-xs font-semibold text-green-900 dark:text-green-100">
                                                                        🤖 AI Draft Reply
                                                                    </CardTitle>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-2xl">{draft.sentiment_emoji}</span>
                                                                    <Badge variant="secondary" className="text-xs capitalize">
                                                                        {draft.sentiment}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="px-3 pb-3 space-y-3">
                                                            {/* Draft Text */}
                                                            {editingDraftId === draft.id ? (
                                                                <Textarea
                                                                    value={editedText}
                                                                    onChange={(e) => setEditedText(e.target.value)}
                                                                    rows={3}
                                                                    className="text-sm"
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-green-900 dark:text-green-100">
                                                                    {draft.draft_reply}
                                                                </p>
                                                            )}

                                                            {/* Analysis Info */}
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <span className="capitalize">{draft.category}</span>
                                                                <span>•</span>
                                                                <span>{draft.confidence_score.toFixed(0)}% confident</span>
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="flex gap-2 pt-2 flex-wrap">
                                                                {editingDraftId === draft.id ? (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="flex-1 h-8 text-xs"
                                                                            onClick={() => setEditingDraftId(null)}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            className="flex-1 h-8 text-xs"
                                                                            onClick={() => handleUpdateDraft(draft.id)}
                                                                        >
                                                                            Save
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="flex-1 h-8 text-xs"
                                                                            onClick={() => {
                                                                                setEditingDraftId(draft.id);
                                                                                setEditedText(draft.draft_reply);
                                                                            }}
                                                                        >
                                                                            <Edit2 className="h-3 w-3 mr-1" />
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                                                                            onClick={() => handleSendDraft(draft.id)}
                                                                            disabled={sendingId === draft.id}
                                                                        >
                                                                            {sendingId === draft.id ? (
                                                                                <Loader className="h-3 w-3 mr-1 animate-spin" />
                                                                            ) : (
                                                                                <Send className="h-3 w-3 mr-1" />
                                                                            )}
                                                                            Send
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            className="h-8"
                                                                            onClick={() => handleRejectDraft(draft.id)}
                                                                            disabled={rejectingId === draft.id}
                                                                        >
                                                                            <ThumbsDown className="h-3 w-3" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Info */}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-3 pb-3">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                            💡 <strong>AI Agent at Work:</strong> Each incoming message is analyzed automatically and a draft reply is generated instantly based on your automation preferences. Review, edit, and send with one click, or reject to write your own response.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
