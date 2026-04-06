import type { Message } from '@/types/chat';
import { AlertCircle, Sparkles } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import ChatInput from '@/spa/components/SpaChatInput';
import ChatMessageRenderer, { type StreamActivity } from '@/spa/components/ChatMessageRenderer';
import { apiRequest } from '@/spa/lib/api';
import { authHeaders } from '@/spa/lib/auth-token';

type ChatState = {
    messages: Message[];
    conversationId: string | null;
    activities: StreamActivity[];
    streamingMessageId: string | null;
};

type ChatAction =
    | { type: 'hydrate'; conversationId: string | null; messages: Message[] }
    | { type: 'user.append'; message: Message }
    | { type: 'assistant.create'; message: Message; conversationId?: string | null; replace?: boolean }
    | { type: 'assistant.delta'; messageId: string; content: string }
    | { type: 'attachment.add'; messageId: string; attachment: any }
    | { type: 'assistant.complete'; messageId: string; content?: string; attachments?: any[] }
    | { type: 'assistant.fail'; messageId: string; error: string }
    | { type: 'activity'; activity: StreamActivity }
    | { type: 'activity.clear' };

function reducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case 'hydrate':
            return { ...state, conversationId: action.conversationId, messages: action.messages, activities: [], streamingMessageId: null };
        case 'user.append':
            return { ...state, messages: [...state.messages, action.message] };
        case 'assistant.create': {
            const baseMessages = action.replace
                ? state.messages.filter((m) => m.id !== action.message.id)
                : state.messages;
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
        case 'activity':
            return {
                ...state,
                activities: [
                    ...state.activities.filter((a) => a.tool_name !== action.activity.tool_name),
                    action.activity,
                ],
            };
        case 'activity.clear':
            return { ...state, activities: [] };
        default:
            return state;
    }
}

async function readSse(response: Response, onEvent: (event: string, payload: any) => void) {
    if (!response.body) throw new Error('Missing response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';

        for (const chunk of chunks) {
            let eventName = 'message';
            let data = '';

            for (const line of chunk.split('\n')) {
                if (line.startsWith('event: ')) eventName = line.slice(7).trim();
                if (line.startsWith('data: ')) data += line.slice(6);
            }

            if (!data) continue;
            onEvent(eventName, JSON.parse(data));
        }
    }
}

const WELCOME_PROMPTS = [
    'Write me a business proposal',
    'Explain quantum computing simply',
    'Help me debug my code',
    'Create a weekly meal plan',
];

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
    const [state, dispatch] = useReducer(reducer, {
        messages: initialMessages,
        conversationId: initialConversationId,
        activities: [],
        streamingMessageId: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch({ type: 'hydrate', conversationId: initialConversationId, messages: initialMessages });
    }, [initialConversationId, initialMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.messages, state.activities.length]);

    const syncConversation = useCallback(async (conversationId: string) => {
        const response = await apiRequest<{ conversation: { id: string; messages: any[] } }>(
            `/api/chat/conversations/${conversationId}`
        );
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
        }));

        dispatch({ type: 'hydrate', conversationId, messages: mappedMessages });
    }, []);

    const sendMessage = useCallback(async (prompt: string, type: 'text' | 'image', attachedFiles?: File[]) => {
        setError(null);
        setIsLoading(true);
        dispatch({ type: 'activity.clear' });

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

        const response = await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', ...authHeaders() },
            body: JSON.stringify({
                conversation_id: state.conversationId,
                message: prompt,
                type,
                model: 'grok-4-fast-reasoning',
                files: processedFiles,
            }),
        });

        if (!response.ok) {
            setIsLoading(false);
            setError('Could not send message. Please try again.');
            return;
        }

        let assistantMessageId: string | null = null;
        let conversationId = state.conversationId;

        await readSse(response, async (eventName, payload) => {
            if (eventName === 'message.created') {
                assistantMessageId = payload.message.id;
                conversationId = payload.conversation_id || conversationId;

                if (conversationId && !state.conversationId) {
                    history.replaceState({}, '', `/c/${conversationId}`);
                }

                dispatch({
                    type: 'assistant.create',
                    message: {
                        id: payload.message.id,
                        conversation_id: payload.conversation_id,
                        role: 'assistant',
                        status: 'streaming',
                        provider: payload.message.provider,
                        model: payload.message.model,
                        content: '',
                        content_markdown: '',
                        attachments: [],
                        isStreaming: true,
                    },
                    conversationId,
                    replace: payload.replace ?? false,
                });
            }

            if (eventName === 'message.delta' && assistantMessageId) {
                dispatch({ type: 'assistant.delta', messageId: assistantMessageId, content: payload.content || '' });
            }

            if (eventName === 'tool.started') {
                dispatch({ type: 'activity', activity: { tool_name: payload.tool_name, status: 'started', message: payload.message } });
            }

            if (eventName === 'tool.completed') {
                dispatch({ type: 'activity', activity: { tool_name: payload.tool_name, status: 'completed', message: payload.summary } });
            }

            if (eventName === 'tool.failed') {
                dispatch({ type: 'activity', activity: { tool_name: payload.tool_name, status: 'failed', message: payload.error } });
            }

            if (eventName === 'attachment.created' && assistantMessageId) {
                dispatch({ type: 'attachment.add', messageId: assistantMessageId, attachment: payload.attachment });
            }

            if (eventName === 'message.failed' && assistantMessageId) {
                dispatch({ type: 'assistant.fail', messageId: assistantMessageId, error: payload.error || 'Request failed' });
                setError(payload.error || 'Request failed');
                setIsLoading(false);
            }

            if (eventName === 'message.completed' && conversationId) {
                await syncConversation(conversationId);
                setIsLoading(false);
            }
        });

        setFiles([]);
        setIsLoading(false);
    }, [isLoading, state.conversationId, syncConversation]);

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
        dispatch({ type: 'activity.clear' });

        const response = await fetch(`/api/chat/messages/${messageId}/regenerate`, {
            method: 'POST',
            headers: { Accept: 'text/event-stream', ...authHeaders() },
        });

        if (!response.ok) {
            setError('Could not regenerate message.');
            setIsLoading(false);
            return;
        }

        await readSse(response, async (eventName, payload) => {
            if (eventName === 'message.created') {
                dispatch({
                    type: 'assistant.create',
                    message: {
                        id: payload.message.id,
                        conversation_id: payload.conversation_id || state.conversationId || undefined,
                        role: 'assistant',
                        status: 'streaming',
                        content: '',
                        content_markdown: '',
                        attachments: [],
                        isStreaming: true,
                    },
                    replace: true,
                });
            }

            if (eventName === 'message.delta') {
                dispatch({ type: 'assistant.delta', messageId, content: payload.content || '' });
            }

            if (eventName === 'tool.started') {
                dispatch({ type: 'activity', activity: { tool_name: payload.tool_name, status: 'started', message: payload.message } });
            }

            if (eventName === 'tool.completed') {
                dispatch({ type: 'activity', activity: { tool_name: payload.tool_name, status: 'completed', message: payload.summary } });
            }

            if (eventName === 'tool.failed') {
                dispatch({ type: 'activity', activity: { tool_name: payload.tool_name, status: 'failed', message: payload.error } });
            }

            if (eventName === 'attachment.created') {
                dispatch({ type: 'attachment.add', messageId, attachment: payload.attachment });
            }

            if (eventName === 'message.completed' && state.conversationId) {
                await syncConversation(state.conversationId);
                setIsLoading(false);
            }

            if (eventName === 'message.failed') {
                setError(payload.error || 'Regeneration failed');
                dispatch({ type: 'assistant.fail', messageId, error: payload.error || 'Regeneration failed' });
                setIsLoading(false);
            }
        });
    }, [state.conversationId, syncConversation]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event as unknown as FormEvent, mode, files);
        }
    }, [files, handleSubmit, mode]);

    const welcome = useMemo(() => state.messages.length === 0, [state.messages.length]);
    const firstName = userName?.split(' ')[0];

    return (
        <div className="relative flex w-full flex-1 flex-col overflow-hidden">

            {/* ── Scrollable message area ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain pb-48 pt-6 custom-scrollbar">
                <div className="mx-auto w-full max-w-2xl px-4">

                    {/* Welcome */}
                    {welcome && (
                        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-10 text-center">
                            <div className="space-y-4">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                                    <Sparkles className="h-7 w-7 text-primary" />
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {firstName ? `Good to see you, ${firstName}` : 'How can I help you today?'}
                                </h1>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                                    Ask anything — I can write, research, code, analyze, translate, and more.
                                </p>
                            </div>

                            <div className="grid w-full max-w-lg grid-cols-2 gap-2">
                                {WELCOME_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        className="group rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-accent/40 hover:text-foreground"
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
                        {state.messages.map((message) => {
                            const activities =
                                message.isStreaming && message.id === state.streamingMessageId
                                    ? state.activities
                                    : undefined;
                            return (
                                <ChatMessageRenderer
                                    key={message.id}
                                    message={message}
                                    activities={activities}
                                    onRegenerate={message.role === 'assistant' ? handleRegenerate : undefined}
                                />
                            );
                        })}

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

                    <div ref={bottomRef} className="h-1" />
                </div>
            </div>

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
