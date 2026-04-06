import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AudioLines, Mic, Plus, Send, Square } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAuthToken } from '@/spa/lib/auth-token';
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
};

export function Component() {
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const queryClient = useQueryClient();
    const [text, setText] = useState('');
    const [recording, setRecording] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

    const messages = conversation.data?.conversation?.messages ?? [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const createConversation = useMutation({
        mutationFn: () => apiRequest<{ conversation: { id: string } }>('/api/spa/voice/conversations', { method: 'POST', json: {} }),
        onSuccess: async ({ conversation: created }) => {
            await queryClient.invalidateQueries({ queryKey: ['spa', 'voice', 'conversations'] });
            navigate(`/c/${created.id}/voice`);
        },
    });

    const refreshConversation = async () => {
        await queryClient.invalidateQueries({ queryKey: ['spa', 'voice', 'conversation', currentConversationId] });
        await queryClient.invalidateQueries({ queryKey: ['spa', 'voice', 'conversations'] });
    };

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
            await refreshConversation();
        },
    });

    const sendAudio = useMutation({
        mutationFn: async (blob: Blob) => {
            if (!currentConversationId) return null;
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');
            formData.append('conversation_id', currentConversationId);
            const token = getAuthToken();
            const res = await fetch('/api/voice/process-audio', {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });
            if (!res.ok) {
                const payload = await res.json().catch(() => null);
                throw new Error(payload?.message ?? 'Failed to process audio.');
            }
            return res.json();
        },
        onSuccess: async () => { await refreshConversation(); },
        onError: (e: any) => setMicError(e?.message ?? 'Audio processing failed.'),
    });

    const startRecording = async () => {
        setMicError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            chunksRef.current = [];
            mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mr.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                sendAudio.mutate(blob);
                setRecording(false);
            };
            mr.start();
            mediaRecorderRef.current = mr;
            setRecording(true);
        } catch {
            setMicError('Microphone access denied. Please allow microphone access and try again.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
    };

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
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {recording ? 'Recording…' : 'Voice & text'}
                        </p>
                    </div>
                    {recording && (
                        <span className="flex items-center gap-1.5 text-xs text-red-400">
                            <span className="inline-block h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                            Live
                        </span>
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

                        {sendAudio.isPending && (
                            <div className="flex justify-start">
                                <div className="bg-accent text-foreground rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
                                    <span className="flex gap-1 items-center">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                                    </span>
                                </div>
                            </div>
                        )}

                        {!messages.length && !sendAudio.isPending && (
                            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Mic className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Start the conversation</p>
                                    <p className="text-xs text-muted-foreground mt-1">Tap the mic or type a message.</p>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Mic error */}
                {micError && (
                    <div className="mx-4 mb-0 mt-0 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {micError}
                    </div>
                )}

                {/* Input */}
                <div className="flex-shrink-0 border-t border-border/40 p-4">
                    <div className="mx-auto max-w-2xl flex gap-2">
                        {/* Mic button */}
                        <Button
                            size="icon"
                            type="button"
                            disabled={!currentConversationId || sendAudio.isPending || sendMessage.isPending}
                            onClick={recording ? stopRecording : startRecording}
                            className={`h-10 w-10 flex-shrink-0 transition-colors ${
                                recording
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                            title={recording ? 'Stop recording' : 'Start recording'}
                        >
                            {sendAudio.isPending
                                ? <span className="inline-block h-3.5 w-3.5 animate-pulse rounded bg-current/30" />
                                : recording
                                ? <Square className="h-4 w-4 fill-current" />
                                : <Mic className="h-4 w-4" />}
                        </Button>

                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (!sendMessage.isPending && text.trim()) sendMessage.mutate();
                                }
                            }}
                            placeholder="Or type a message…"
                            disabled={recording}
                            className="bg-background border-border/60 h-10 text-sm"
                        />
                        <Button
                            size="icon"
                            disabled={!currentConversationId || !text.trim() || sendMessage.isPending || recording}
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
