import type { ChatAttachment, ChatToolRun, Message } from '@/types/chat';
import { AlertCircle, ArrowDown } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Alert, AlertDescription } from '@/components/ui/alert';
import ChatInput from '@/spa/components/SpaChatInput';
import ChatMessageRenderer from '@/spa/components/ChatMessageRenderer';
import { apiRequest } from '@/spa/lib/api';
import { authHeaders } from '@/spa/lib/auth-token';
import { getChatTransport } from '@/spa/lib/chat-transport';
import { subscribeToPrivateChannel } from '@/spa/lib/realtime';

type ChatState = {
    messages: Message[];
    conversationId: string | null;
    streamingMessageId: string | null;
};

type ChatAction =
    | { type: 'hydrate'; conversationId: string | null; messages: Message[] }
    | { type: 'user.append'; message: Message }
    | { type: 'assistant.create'; message: Message; conversationId?: string | null; replace?: boolean }
    | { type: 'assistant.delta'; messageId: string; content: string }
    | { type: 'attachment.add'; messageId: string; attachment: ChatAttachment }
    | { type: 'tool.sync'; messageId: string; toolRun: ChatToolRun }
    | { type: 'assistant.complete'; messageId: string; content?: string; attachments?: ChatAttachment[] }
    | { type: 'assistant.fail'; messageId: string; error: string };

function reducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case 'hydrate':
            return { ...state, conversationId: action.conversationId, messages: action.messages, streamingMessageId: null };
        case 'user.append':
            return { ...state, messages: [...state.messages, action.message] };
        case 'assistant.create': {
            const baseMessages = state.messages.filter((m) => m.id !== action.message.id);
            return {
                ...state,
                conversationId: action.conversationId ?? state.conversationId,
                messages: [...baseMessages, action.message],
                streamingMessageId: action.message.id,
            };
        }
        case 'assistant.delta':
            return {
                ...state,
                messages: state.messages.map((m) =>
                    m.id === action.messageId
                        ? { ...m, content: (m.content || '') + action.content, content_markdown: (m.content_markdown || '') + action.content, isStreaming: true }
                        : m
                ),
            };
        case 'attachment.add':
            return {
                ...state,
                messages: state.messages.map((m) =>
                    m.id === action.messageId
                        ? { ...m, attachments: [...(m.attachments || []), action.attachment] }
                        : m
                ),
            };
        case 'tool.sync':
            return {
                ...state,
                messages: state.messages.map((message) => {
                    if (message.id !== action.messageId) {
                        return message;
                    }

                    const nextToolRuns = [
                        ...(message.tool_runs ?? []).filter((toolRun) => toolRun.id !== action.toolRun.id),
                        action.toolRun,
                    ].sort((left, right) => {
                        const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
                        const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;

                        return leftTime - rightTime;
                    });

                    return {
                        ...message,
                        tool_runs: nextToolRuns,
                    };
                }),
            };
        case 'assistant.complete':
            return {
                ...state,
                messages: state.messages.map((m) =>
                    m.id === action.messageId
                        ? {
                              ...m,
                              content: action.content ?? m.content,
                              content_markdown: action.content ?? m.content_markdown,
                              attachments: action.attachments ?? m.attachments,
                              isStreaming: false,
                              status: 'completed',
                          }
                        : m
                ),
                streamingMessageId: null,
            };
        case 'assistant.fail':
            return {
                ...state,
                messages: state.messages.map((m) =>
                    m.id === action.messageId
                        ? { ...m, isStreaming: false, status: 'failed', error_message: action.error }
                        : m
                ),
                streamingMessageId: null,
            };
        default:
            return state;
    }
}

const WELCOME_PROMPTS = [
    'Write me a business proposal',
    'Explain quantum computing simply',
    'Help me debug my code',
    'Create a weekly meal plan',
];

type StreamPayload = {
    event?: string;
    conversation_id?: string;
    message_id?: string;
    [key: string]: unknown;
};

export default function SpaChatInterface({
    isAuthenticated,
    initialMessages = [],
    initialConversationId = null,
    userName,
}: {
    isAuthenticated: boolean;
    initialMessages?: Message[];
    initialConversationId?: string | null;
    userName?: string;
}) {
    const queryClient = useQueryClient();
    const [state, dispatch] = useReducer(reducer, {
        messages: initialMessages,
        conversationId: initialConversationId,
        streamingMessageId: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [userScrolledUp, setUserScrolledUp] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const chatTransport = getChatTransport();

    const isNearBottom = () => {
        const el = scrollRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    };

    const scrollToBottom = (smooth = true) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
        setShowScrollBtn(false);
        setUserScrolledUp(false);
    };

    const handleScroll = useCallback(() => {
        const near = isNearBottom();
        setShowScrollBtn(!near);
        if (near) setUserScrolledUp(false);
        else setUserScrolledUp(true);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        dispatch({ type: 'hydrate', conversationId: initialConversationId, messages: initialMessages });
    }, [initialConversationId, initialMessages]);

    // Instant scroll when loading a conversation
    useEffect(() => {
        scrollToBottom(false);
        setUserScrolledUp(false);
    }, [initialConversationId, initialMessages]);

    // Smart auto-scroll: only follow bottom if user hasn't scrolled up
    useEffect(() => {
        if (!userScrolledUp) {
            scrollToBottom(true);
        }
    }, [state.messages.length, userScrolledUp]);

    const syncConversation = useCallback(async (conversationId: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiRequest<{ conversation: { id: string; messages: any[] } }>(
            `/api/chat/conversations/${conversationId}`
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedMessages: Message[] = response.conversation.messages.map((m: any) => ({
            id: m.id,
            conversation_id: m.conversation_id,
            role: m.role,
            status: m.status,
            provider: m.provider,
            model: m.model,
            type: m.type,
            content: m.content_markdown,
            content_markdown: m.content_markdown,
            content_text: m.content_text,
            created_at: m.created_at,
            attachments: m.attachments ?? [],
            tool_runs: m.tool_runs ?? [],
        }));

        dispatch({ type: 'hydrate', conversationId, messages: mappedMessages });

        const hasStreamingMessage = mappedMessages.some((message) => message.status === 'streaming');
        if (!hasStreamingMessage) {
            setIsLoading(false);
        }
    }, []);

    const handleStreamEvent = useCallback(async (eventName: string, payload: StreamPayload) => {
        const messageId = typeof payload.message_id === 'string' ? payload.message_id : null;
        const conversationId = typeof payload.conversation_id === 'string'
            ? payload.conversation_id
            : state.conversationId;

        if (eventName === 'message.created' && payload.message && typeof payload.message === 'object') {
            const message = payload.message as Message;

            if (conversationId && !state.conversationId) {
                history.replaceState({}, '', `/c/${conversationId}`);
            }

            dispatch({
                type: 'assistant.create',
                message: {
                    id: message.id,
                    conversation_id: message.conversation_id,
                    role: message.role,
                    status: message.status ?? 'streaming',
                    provider: message.provider,
                    model: message.model,
                    type: message.type,
                    content: message.content_markdown ?? '',
                    content_markdown: message.content_markdown ?? '',
                    content_text: message.content_text ?? '',
                    attachments: message.attachments ?? [],
                    tool_runs: message.tool_runs ?? [],
                    isStreaming: true,
                },
                conversationId,
                replace: Boolean(payload.replace),
            });
        }

        if (eventName === 'message.delta' && messageId) {
            dispatch({ type: 'assistant.delta', messageId, content: String(payload.content ?? '') });
        }

        if ((eventName === 'tool.started' || eventName === 'tool.completed' || eventName === 'tool.failed') && messageId) {
            if (payload.tool_run && typeof payload.tool_run === 'object') {
                dispatch({ type: 'tool.sync', messageId, toolRun: payload.tool_run as ChatToolRun });
            }
        }

        if (eventName === 'attachment.created' && messageId && payload.attachment && typeof payload.attachment === 'object') {
            dispatch({ type: 'attachment.add', messageId, attachment: payload.attachment as ChatAttachment });
        }

        if (eventName === 'message.completed' && messageId) {
            dispatch({
                type: 'assistant.complete',
                messageId,
                content: typeof payload.content === 'string' ? payload.content : undefined,
            });
            setIsLoading(false);
            if (conversationId) {
                await syncConversation(conversationId);
                void queryClient.invalidateQueries({ queryKey: ['spa', 'conversations'] });
            }
        }

        if (eventName === 'message.failed') {
            const error = String(payload.error ?? 'Request failed');
            if (messageId) {
                dispatch({ type: 'assistant.fail', messageId, error });
            }
            setError(error);
            setIsLoading(false);
            if (conversationId) {
                await syncConversation(conversationId);
            }
        }
    }, [queryClient, state.conversationId, syncConversation]);

    const readEventStream = useCallback(async (response: Response) => {
        if (!response.ok || !response.body) {
            throw new Error(`Streaming request failed (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const frames = buffer.split('\n\n');
            buffer = frames.pop() ?? '';

            for (const frame of frames) {
                const lines = frame.split('\n');
                let eventName = 'message';
                const dataLines: string[] = [];

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        eventName = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        dataLines.push(line.slice(5).trim());
                    }
                }

                if (dataLines.length === 0) {
                    continue;
                }

                const rawData = dataLines.join('\n');
                let payload: StreamPayload = {};

                try {
                    payload = JSON.parse(rawData) as StreamPayload;
                } catch {
                    continue;
                }

                await handleStreamEvent(eventName, payload);
            }
        }
    }, [handleStreamEvent]);

    const handleRealtimeEvent = useCallback(async (eventName: string, payload: StreamPayload) => {
        await handleStreamEvent(eventName, payload);

        if (eventName === 'conversation.updated') {
            void queryClient.invalidateQueries({ queryKey: ['spa', 'conversations'] });
        }
    }, [handleStreamEvent, queryClient]);

    useEffect(() => {
        if (chatTransport !== 'ws' || !state.conversationId) {
            return;
        }

        return subscribeToPrivateChannel(
            `conversation.${state.conversationId}`,
            (eventName, payload) => {
                void handleRealtimeEvent(eventName, payload);
            },
            {
                onSubscribed: () => {
                    void syncConversation(state.conversationId!);
                },
                onError: () => {
                    setError('Realtime connection failed. Refresh to resync this chat.');
                },
            },
        );
    }, [chatTransport, handleRealtimeEvent, state.conversationId, syncConversation]);


    const sendMessage = useCallback(async (prompt: string, type: 'text' | 'image', attachedFiles?: File[]) => {
        setError(null);
        setIsLoading(true);
        document.dispatchEvent(new CustomEvent('kwati:message-sent'));

        dispatch({
            type: 'user.append',
            message: {
                id: `user-${Date.now()}`,
                role: 'user',
                content: prompt,
                content_markdown: prompt,
                content_text: prompt,
                type,
                attachments: attachedFiles?.map((file) => ({
                    id: `${file.name}-${file.size}`,
                    kind: file.type.startsWith('image/') ? 'image' : 'file',
                    name: file.name,
                    mime_type: file.type,
                    size: file.size,
                })) ?? [],
            },
        });

        const processedFiles = await Promise.all((attachedFiles || []).map(async (file) => ({
            name: file.name,
            type: file.type,
            data: await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }),
        })));

        if (chatTransport === 'ws') {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    conversation_id: state.conversationId,
                    message: prompt,
                    type,
                    model: 'grok-4-fast-non-reasoning',
                    files: processedFiles,
                }),
            });

            if (!response.ok) {
                setIsLoading(false);
                setError('Could not send message. Please try again.');
                return;
            }

            const payload = await response.json();
            const conversationId = payload.conversation_id as string | null;

            if (conversationId && !state.conversationId) {
                history.replaceState({}, '', `/c/${conversationId}`);
            }

            if (payload.assistant_message && conversationId) {
                dispatch({
                    type: 'assistant.create',
                    message: {
                        id: payload.assistant_message.id,
                        conversation_id: conversationId,
                        role: 'assistant',
                        status: 'streaming',
                        provider: payload.assistant_message.provider,
                        model: payload.assistant_message.model,
                        content: '',
                        content_markdown: '',
                        attachments: [],
                        tool_runs: payload.assistant_message.tool_runs ?? [],
                        isStreaming: true,
                    },
                    conversationId,
                });
            }

            setFiles([]);
            return;
        }

        try {
            const response = await fetch('/api/chat/messages/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', ...authHeaders() },
                body: JSON.stringify({
                    conversation_id: state.conversationId,
                    message: prompt,
                    type,
                    model: 'grok-4-fast-non-reasoning',
                    files: processedFiles,
                }),
            });

            if (!response.ok) {
                setIsLoading(false);
                setError('Could not send message. Please try again.');
                return;
            }

            await readEventStream(response);
            setFiles([]);
        } catch (streamError) {
            setIsLoading(false);
            setError(streamError instanceof Error ? streamError.message : 'Could not send message. Please try again.');
        }
    }, [chatTransport, readEventStream, state.conversationId]);

    const handleSubmit = useCallback(async (event: FormEvent, type: 'text' | 'image', attachedFiles?: File[]) => {
        event.preventDefault();
        const prompt = inputRef.current?.value?.trim();
        if (!prompt || isLoading) return;

        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.style.height = 'auto';
        }

        await sendMessage(prompt, type, attachedFiles);
    }, [isLoading, sendMessage]);

    const handleRegenerate = useCallback(async (messageId: string) => {
        setError(null);
        setIsLoading(true);

        if (chatTransport === 'ws') {
            const response = await fetch(`/api/chat/messages/${messageId}/regenerate`, {
                method: 'POST',
                headers: { Accept: 'application/json', ...authHeaders() },
            });

            if (!response.ok) {
                setError('Could not regenerate message.');
                setIsLoading(false);
                return;
            }

            const payload = await response.json();

            dispatch({
                type: 'assistant.create',
                message: {
                    id: payload.assistant_message.id,
                    conversation_id: payload.conversation_id || state.conversationId || undefined,
                    role: 'assistant',
                    status: 'streaming',
                    content: '',
                    content_markdown: '',
                    attachments: [],
                    tool_runs: payload.assistant_message.tool_runs ?? [],
                    isStreaming: true,
                },
                replace: true,
            });

            return;
        }

        try {
            const response = await fetch(`/api/chat/messages/${messageId}/regenerate/stream`, {
                method: 'POST',
                headers: { Accept: 'text/event-stream', ...authHeaders() },
            });

            if (!response.ok) {
                setError('Could not regenerate message.');
                setIsLoading(false);
                return;
            }

            await readEventStream(response);
        } catch (streamError) {
            setIsLoading(false);
            setError(streamError instanceof Error ? streamError.message : 'Could not regenerate message.');
        }
    }, [chatTransport, readEventStream, state.conversationId]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event as unknown as FormEvent, mode, files);
        }
    }, [files, handleSubmit, mode]);

    // Wire suggestion chip clicks into the input
    useEffect(() => {
        const handler = (e: Event) => {
            const text = (e as CustomEvent<string>).detail;
            if (!text || !inputRef.current) return;
            inputRef.current.value = text;
            inputRef.current.focus();
            inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        };
        document.addEventListener('kwati:suggestion', handler);
        return () => document.removeEventListener('kwati:suggestion', handler);
    }, []);

    const welcome = useMemo(() => state.messages.length === 0, [state.messages.length]);
    const firstName = userName?.split(' ')[0];

    return (
        <div className="relative flex w-full flex-1 flex-col overflow-hidden">

            {/* ── Scrollable message area ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain pb-48 pt-6 custom-scrollbar">
                <div className="mx-auto w-full max-w-2xl px-4">

                    {/* Welcome screen */}
                    {welcome && (
                        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-7 text-center">

                            {/* Logo */}
                            <img
                                src="/logo.png"
                                alt="Kwati AI"
                                className="h-9 w-auto select-none opacity-90"
                                draggable={false}
                            />

                            {/* Greeting */}
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                {firstName ? `Good to see you, ${firstName}` : 'How can I help you?'}
                            </h1>

                            {/* Prompt suggestions */}
                            <div className="grid w-full max-w-lg grid-cols-2 gap-2">
                                {WELCOME_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        className="rounded-xl border border-border/60 bg-card px-4 py-3 text-left text-[0.825rem] text-muted-foreground transition-all hover:border-[#8b5cf6]/30 hover:bg-accent hover:text-foreground"
                                        onClick={() => {
                                            if (inputRef.current) {
                                                inputRef.current.value = prompt;
                                                inputRef.current.focus();
                                                inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
                                            }
                                        }}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error banner */}
                    {error && (
                        <Alert className="mb-6 rounded-xl border-destructive/30 bg-destructive/8" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Messages */}
                    <div className="space-y-8">
                        {state.messages.map((message, index) => (
                            <ChatMessageRenderer
                                key={message.id}
                                message={message}
                                onRegenerate={message.role === 'assistant' ? handleRegenerate : undefined}
                                isLast={index === state.messages.length - 1}
                            />
                        ))}

                        {/* Skeleton while waiting for first SSE token */}
                        {isLoading && !state.streamingMessageId && (
                            <div className="flex gap-3 animate-pulse">
                                <div className="mt-0.5 h-7 w-7 flex-shrink-0 rounded-full bg-muted/40" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-2.5 w-3/4 rounded-full bg-muted/30" />
                                    <div className="h-2.5 w-1/2 rounded-full bg-muted/30" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-1" />
                </div>
            </div>

            {/* Scroll-to-bottom button */}
            {showScrollBtn && (
                <div className="pointer-events-none absolute bottom-36 left-0 right-0 z-20 flex justify-center">
                    <button
                        type="button"
                        onClick={() => scrollToBottom(true)}
                        className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/60 bg-[#2a2a2a] px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-[#333333] hover:text-foreground hover:border-border active:scale-95"
                    >
                        <ArrowDown className="h-3.5 w-3.5" />
                        Scroll to bottom
                    </button>
                </div>
            )}

            {/* Guest notice */}
            {!isAuthenticated && (
                <div className="pointer-events-none absolute bottom-36 left-0 right-0 z-10 flex justify-center px-4">
                    <div className="rounded-full border border-border/40 bg-background/90 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
                        Sign in to save history and unlock higher limits
                    </div>
                </div>
            )}

            {/* Input pinned to bottom */}
            <ChatInput
                files={files}
                handleKeyDown={handleKeyDown}
                isAuthenticated={isAuthenticated}
                is_processing={isLoading}
                mode={mode}
                onSend={handleSubmit}
                ref={inputRef}
                setFiles={setFiles}
                setMode={(nextMode) => setMode(nextMode as 'text' | 'image')}
            />
        </div>
    );
}
