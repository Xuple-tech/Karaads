import type { Message } from '@/types/chat';
import { AlertCircle, Loader2, Wrench } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ChatInput from '@/spa/components/SpaChatInput';
import ChatMessageRenderer from '@/spa/components/ChatMessageRenderer';
import { apiRequest } from '@/spa/lib/api';
import { authHeaders } from '@/spa/lib/auth-token';

type Activity = {
    tool_name: string;
    status: 'started' | 'completed' | 'failed';
    message?: string | null;
};

type ChatState = {
    messages: Message[];
    conversationId: string | null;
    activities: Activity[];
};

type ChatAction =
    | { type: 'hydrate'; conversationId: string | null; messages: Message[] }
    | { type: 'user.append'; message: Message }
    | { type: 'assistant.create'; message: Message; conversationId?: string | null; replace?: boolean }
    | { type: 'assistant.delta'; messageId: string; content: string }
    | { type: 'attachment.add'; messageId: string; attachment: any }
    | { type: 'assistant.complete'; messageId: string; content?: string; attachments?: any[] }
    | { type: 'assistant.fail'; messageId: string; error: string }
    | { type: 'activity'; activity: Activity }
    | { type: 'activity.clear' };

function reducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case 'hydrate':
            return { ...state, conversationId: action.conversationId, messages: action.messages };
        case 'user.append':
            return { ...state, messages: [...state.messages, action.message] };
        case 'assistant.create': {
            const baseMessages = action.replace ? state.messages.filter((message) => message.id !== action.message.id) : state.messages;
            return {
                ...state,
                conversationId: action.conversationId ?? state.conversationId,
                messages: [...baseMessages, action.message],
            };
        }
        case 'assistant.delta':
            return {
                ...state,
                messages: state.messages.map((message) =>
                    message.id === action.messageId
                        ? {
                              ...message,
                              content: (message.content || '') + action.content,
                              content_markdown: (message.content_markdown || '') + action.content,
                              isStreaming: true,
                          }
                        : message
                ),
            };
        case 'attachment.add':
            return {
                ...state,
                messages: state.messages.map((message) =>
                    message.id === action.messageId
                        ? { ...message, attachments: [...(message.attachments || []), action.attachment] }
                        : message
                ),
            };
        case 'assistant.complete':
            return {
                ...state,
                messages: state.messages.map((message) =>
                    message.id === action.messageId
                        ? {
                              ...message,
                              content: action.content ?? message.content,
                              content_markdown: action.content ?? message.content_markdown,
                              attachments: action.attachments ?? message.attachments,
                              isStreaming: false,
                              status: 'completed',
                          }
                        : message
                ),
            };
        case 'assistant.fail':
            return {
                ...state,
                messages: state.messages.map((message) =>
                    message.id === action.messageId
                        ? { ...message, isStreaming: false, status: 'failed', error_message: action.error }
                        : message
                ),
            };
        case 'activity':
            return {
                ...state,
                activities: [
                    ...state.activities.filter((activity) => activity.tool_name !== action.activity.tool_name),
                    action.activity,
                ],
            };
        case 'activity.clear':
            return { ...state, activities: [] };
        default:
            return state;
    }
}

async function readSse(
    response: Response,
    onEvent: (event: string, payload: any) => void
) {
    if (!response.body) {
        throw new Error('Missing response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';

        for (const chunk of chunks) {
            let eventName = 'message';
            let data = '';

            for (const line of chunk.split('\n')) {
                if (line.startsWith('event: ')) {
                    eventName = line.slice(7).trim();
                }
                if (line.startsWith('data: ')) {
                    data += line.slice(6);
                }
            }

            if (!data) {
                continue;
            }

            onEvent(eventName, JSON.parse(data));
        }
    }
}

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
        const response = await apiRequest<{ conversation: { id: string; messages: any[] } }>(`/api/chat/conversations/${conversationId}`);
        const mappedMessages: Message[] = response.conversation.messages.map((message: any) => ({
            id: message.id,
            conversation_id: message.conversation_id,
            role: message.role,
            status: message.status,
            provider: message.provider,
            model: message.model,
            type: message.type,
            content: message.content_markdown,
            content_markdown: message.content_markdown,
            content_text: message.content_text,
            created_at: message.created_at,
            attachments: message.attachments ?? [],
        }));

        dispatch({
            type: 'hydrate',
            conversationId,
            messages: mappedMessages,
        });
        dispatch({ type: 'activity.clear' });
    }, []);

    const handleSubmit = useCallback(async (event: FormEvent, type: 'text' | 'image', attachedFiles?: File[]) => {
        event.preventDefault();
        const prompt = inputRef.current?.value?.trim();

        if (!prompt || isLoading) {
            return;
        }

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

        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.style.height = 'auto';
        }

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
            headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
                ...authHeaders(),
            },
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
            setError('Could not send message.');
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
                dispatch({
                    type: 'activity',
                    activity: {
                        tool_name: payload.tool_name,
                        status: 'started',
                        message: payload.message,
                    },
                });
            }

            if (eventName === 'tool.completed') {
                dispatch({
                    type: 'activity',
                    activity: {
                        tool_name: payload.tool_name,
                        status: 'completed',
                        message: payload.summary,
                    },
                });
            }

            if (eventName === 'tool.failed') {
                dispatch({
                    type: 'activity',
                    activity: {
                        tool_name: payload.tool_name,
                        status: 'failed',
                        message: payload.error,
                    },
                });
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

    const handleRegenerate = useCallback(async (messageId: string) => {
        setError(null);
        setIsLoading(true);
        dispatch({ type: 'activity.clear' });

        const response = await fetch(`/api/chat/messages/${messageId}/regenerate`, {
            method: 'POST',
            headers: {
                Accept: 'text/event-stream',
                ...authHeaders(),
            },
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

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-36 pt-6">
                {welcome ? (
                    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
                        <h1 className="text-4xl font-semibold tracking-tight">{userName ? `Hello, ${userName}` : 'Start a new chat'}</h1>
                        <p className="max-w-xl text-muted-foreground">Clean markdown rendering, structured source cards, and a stable streaming experience now run through the new chat runtime.</p>
                    </div>
                ) : null}

                {error ? (
                    <Alert className="mb-4" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                {state.activities.length > 0 ? (
                    <div className="mb-4 space-y-2">
                        {state.activities.map((activity) => (
                            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-sm" key={activity.tool_name}>
                                <Wrench className="h-4 w-4 text-primary" />
                                <span className="font-medium">{activity.tool_name.replace(/_/g, ' ')}</span>
                                <Badge variant="secondary" className="capitalize">{activity.status}</Badge>
                                {activity.message ? <span className="text-muted-foreground">{activity.message}</span> : null}
                            </div>
                        ))}
                    </div>
                ) : null}

                <div className="space-y-4">
                    {state.messages.map((message) => (
                        <ChatMessageRenderer key={message.id} message={message} onRegenerate={message.role === 'assistant' ? handleRegenerate : undefined} />
                    ))}
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Streaming response...
                        </div>
                    ) : null}
                </div>

                <div ref={bottomRef} />
            </div>

            {!isAuthenticated ? (
                <div className="fixed bottom-28 left-0 right-0 z-10 flex justify-center px-4">
                    <div className="rounded-full border border-border/50 bg-background/90 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
                        Sign in for saved chat history and billing-backed limits.
                    </div>
                </div>
            ) : null}

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
