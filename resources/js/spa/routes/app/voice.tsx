import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AudioLines, Mic, Plus, Send, Sparkles, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
        if (conversationId) {
            return conversationId;
        }

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
            if (!currentConversationId || !text.trim()) {
                return null;
            }

            return apiRequest<any>('/api/voice/process-text', {
                method: 'POST',
                json: {
                    conversation_id: currentConversationId,
                    text,
                },
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
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <Card className="border-border/70 bg-card/70">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <AudioLines className="h-5 w-5 text-primary" />
                                Voice
                            </CardTitle>
                            <CardDescription>Conversations optimized for spoken back-and-forth.</CardDescription>
                        </div>
                        <Button disabled={createConversation.isPending} onClick={() => createConversation.mutate()} size="icon" variant="outline">
                            {createConversation.isPending ? <span className="inline-block h-4 w-4 shrink-0 animate-pulse rounded bg-current/30" /> : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Voice runtime
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Text send is active now. Audio capture and playback continue to use the Laravel voice endpoints behind this SPA screen.
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[32rem] pr-3">
                        <div className="space-y-3">
                            {conversations.data?.conversations?.map((item) => {
                                const active = item.id === currentConversationId;

                                return (
                                    <button
                                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${active ? 'border-primary bg-primary/10' : 'border-border/60 bg-background hover:border-primary/40 hover:bg-accent/40'}`}
                                        key={item.id}
                                        onClick={() => navigate(`/c/${item.id}/voice`)}
                                        type="button"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-medium">{item.title || 'Voice Chat'}</p>
                                            {active ? <Badge>Open</Badge> : null}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {item.updated_at ? new Date(item.updated_at).toLocaleString() : 'New conversation'}
                                        </p>
                                    </button>
                                );
                            })}
                            {!conversations.data?.conversations?.length ? (
                                <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                                    No voice conversations yet.
                                </div>
                            ) : null}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="overflow-hidden border-border/70 bg-card/70">
                    <CardHeader className="border-b border-border/60 bg-background/70">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle>{conversation.data?.conversation?.title ?? 'Voice Chat'}</CardTitle>
                                <CardDescription>Use quick text sends now, then layer audio controls back on top.</CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {availableVoices.slice(0, 3).map((voice) => (
                                    <Badge key={voice.id} variant="secondary">
                                        <Volume2 className="mr-1 h-3.5 w-3.5" />
                                        {voice.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[28rem] px-6 py-6">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} key={message.id}>
                                        <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'border border-border/60 bg-background'}`}>
                                            <p className="leading-6">{message.content}</p>
                                            <p className={`mt-2 text-[11px] ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                {message.created_at ? new Date(message.created_at).toLocaleTimeString() : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {!messages.length ? (
                                    <div className="rounded-3xl border border-dashed border-border/70 px-6 py-12 text-center">
                                        <Mic className="mx-auto mb-4 h-8 w-8 text-primary" />
                                        <p className="font-medium">Start the first voice exchange</p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            This restored SPA view keeps the voice workflow available while the audio controls remain tied to the backend voice endpoints.
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </ScrollArea>
                        <Separator />
                        <div className="flex gap-3 p-4">
                            <Input
                                onChange={(event) => setText(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        if (!sendMessage.isPending && text.trim()) {
                                            sendMessage.mutate();
                                        }
                                    }
                                }}
                                placeholder="Send text into the voice conversation..."
                                value={text}
                            />
                            <Button disabled={!currentConversationId || !text.trim() || sendMessage.isPending} onClick={() => sendMessage.mutate()}>
                                {sendMessage.isPending ? <span className="inline-block h-4 w-4 shrink-0 animate-pulse rounded bg-current/30" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
