import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AudioLines, Mic, Plus, Send, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/spa/lib/api';

type VoiceConversationSummary = {
    id: string;
    title: string;
    updated_at?: string | null;
};

type VoiceMessage = {
    id: string | number;
    content: string;
    role: 'user' | 'assistant' | string;
    type?: string;
    created_at?: string | null;
};

type VoiceConversationResponse = {
    conversation: {
        id: string;
        title: string;
        messages: VoiceMessage[];
    };
    availableVoices?: Array<{ id: string; name: string }>;
};

export function Component() {
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const queryClient = useQueryClient();
    const [text, setText] = useState('');

    const conversations = useQuery({
        queryKey: ['spa', 'voice', 'conversations'],
        queryFn: () => apiRequest<{ conversations: VoiceConversationSummary[] }>('/api/spa/voice/conversations'),
        staleTime: 30_000,
    });

    const currentConversationId = useMemo(() => {
        if (conversationId) return conversationId;
        return conversations.data?.conversations?.[0]?.id ?? null;
    }, [conversationId, conversations.data?.conversations]);

    const conversation = useQuery({
        enabled: Boolean(currentConversationId),
        queryKey: ['spa', 'voice', 'conversation', currentConversationId],
        queryFn: () => apiRequest<VoiceConversationResponse>(`/api/spa/voice/conversations/${currentConversationId}`),
    });

    useEffect(() => {
        if (!conversationId && conversations.data?.conversations?.length) {
            navigate(`/c/${conversations.data.conversations[0].id}/voice`, { replace: true });
        }
    }, [conversationId, conversations.data?.conversations, navigate]);

    const createConversation = useMutation({
        mutationFn: () => apiRequest<{ conversation: { id: string } }>('/api/spa/voice/conversations', { method: 'POST', json: {} }),
        onSuccess: async ({ conversation: created }) => {
            await queryClient.invalidateQueries({ queryKey: ['spa', 'voice', 'conversations'] });
            navigate(`/c/${created.id}/voice`);
        },
    });

    const sendMessage = useMutation({
        mutationFn: async () => {
            if (!currentConversationId || !text.trim()) return null;
            return apiRequest<any>('/api/voice/process-text', {
                method: 'POST',
                json: { conversation_id: currentConversationId, text },
            });
        },
        onSuccess: async () => {
            setText('');
            await queryClient.invalidateQueries({ queryKey: ['spa', 'voice', 'conversation', currentConversationId] });
            await queryClient.invalidateQueries({ queryKey: ['spa', 'voice', 'conversations'] });
        },
    });

    const messages = conversation.data?.conversation?.messages ?? [];
    const availableVoices = conversation.data?.availableVoices ?? [];

    return (
        <div className="flex h-full gap-4 min-h-0">
            {/* ── Sidebar ── */}
            <div className="hidden lg:flex w-64 flex-shrink-0 flex-col rounded-xl border border-border/50 bg-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                    <div className="flex items-center gap-2">
                        <AudioLines className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Voice</span>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        disabled={createConversation.isPending}
                        onClick={() => createConversation.mutate()}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                        {createConversation.isPending
                            ? <span className="inline-block h-3.5 w-3.5 animate-pulse rounded bg-current/30" />
                            : <Plus className="h-3.5 w-3.5" />}
                    </Button>
                </div>

                {/* Conversation list */}
                <ScrollArea className="flex-1 p-2">
                    <div className="space-y-0.5">
                        {conversations.data?.conversations?.map((item) => {
                            const active = item.id === currentConversationId;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => navigate(`/c/${item.id}/voice`)}
                                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                        active
                                            ? 'bg-primary/10 text-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }`}
                                >
                                    <p className="font-medium truncate">{item.title || 'Voice Chat'}</p>
                                    <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">
                                        {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'New'}
                                    </p>
                                </button>
                            );
                        })}
                        {!conversations.data?.conversations?.length && (
                            <div className="px-3 py-6 text-center text-xs text-muted-foreground/50">
                                No voice conversations yet.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* ── Main area ── */}
            <div className="flex flex-1 flex-col min-h-0 rounded-xl border border-border/50 bg-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-card/80 flex-shrink-0">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            {conversation.data?.conversation?.title ?? 'Voice Chat'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Text input active</p>
                    </div>
                    {availableVoices.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            {availableVoices.slice(0, 3).map((voice) => (
                                <Badge key={voice.id} variant="secondary" className="text-[11px] gap-1">
                                    <Volume2 className="h-3 w-3" />
                                    {voice.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 px-5 py-5">
                    <div className="mx-auto max-w-2xl space-y-5">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                    message.role === 'user'
                                        ? 'bg-[#2f2f2f] text-[#e8e8e4] rounded-tr-sm'
                                        : 'bg-accent text-foreground rounded-tl-sm'
                                }`}>
                                    <p>{message.content}</p>
                                    {message.created_at && (
                                        <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                                            {new Date(message.created_at).toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {!messages.length && (
                            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Mic className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Start the conversation</p>
                                    <p className="text-xs text-muted-foreground mt-1">Type below to send a message.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="flex-shrink-0 border-t border-border/40 p-4">
                    <div className="mx-auto max-w-2xl flex gap-2">
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (!sendMessage.isPending && text.trim()) sendMessage.mutate();
                                }
                            }}
                            placeholder="Send a message…"
                            className="bg-background border-border/60 h-10 text-sm"
                        />
                        <Button
                            size="icon"
                            disabled={!currentConversationId || !text.trim() || sendMessage.isPending}
                            onClick={() => sendMessage.mutate()}
                            className="h-10 w-10 flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {sendMessage.isPending
                                ? <span className="inline-block h-3.5 w-3.5 animate-pulse rounded bg-current/30" />
                                : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
