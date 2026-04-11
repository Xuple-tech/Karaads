import { useEffect, useMemo, useState } from 'react';

type WidgetMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    status?: 'streaming' | 'completed' | 'failed';
    toolRuns?: WidgetToolRun[];
};

type WidgetToolRun = {
    id: string;
    tool_name: string;
    status: 'started' | 'completed' | 'failed';
    summary?: string | null;
    arguments?: Record<string, unknown> | null;
    result?: unknown;
    error_message?: string | null;
};

type StreamPayload = {
    message?: { id?: string };
    message_id?: string;
    content?: string;
    tool_name?: string;
    summary?: string | null;
    arguments?: Record<string, unknown> | null;
    result?: unknown;
    error?: string;
    tool_message?: string | null;
};

const getStorageKey = (token: string) => `kwati_widget_session_${token}`;
const getMessagesStorageKey = (token: string) => `kwati_widget_messages_${token}`;

function updateToolRuns(
    toolRuns: WidgetToolRun[] | undefined,
    payload: StreamPayload,
    status: WidgetToolRun['status']
): WidgetToolRun[] {
    const currentToolRuns = toolRuns ?? [];
    const toolName = payload.tool_name ?? 'tool';
    const startedIndex = [...currentToolRuns]
        .reverse()
        .findIndex((toolRun) => toolRun.tool_name === toolName && toolRun.status === 'started');

    const normalizedStartedIndex = startedIndex === -1 ? -1 : currentToolRuns.length - 1 - startedIndex;
    const latestMatchingIndex = [...currentToolRuns]
        .reverse()
        .findIndex((toolRun) => toolRun.tool_name === toolName);
    const normalizedLatestMatchingIndex = latestMatchingIndex === -1 ? -1 : currentToolRuns.length - 1 - latestMatchingIndex;

    if (status === 'started') {
        if (normalizedStartedIndex !== -1) {
            return currentToolRuns;
        }

        return [
            ...currentToolRuns,
            {
                id: `${toolName}-${Date.now()}-${currentToolRuns.length}`,
                tool_name: toolName,
                status,
                summary: payload.tool_message ?? payload.summary ?? null,
                arguments: payload.arguments ?? null,
                result: payload.result,
                error_message: status === 'failed' ? payload.error ?? 'Tool execution failed.' : null,
            },
        ];
    }

    const targetIndex = normalizedStartedIndex !== -1 ? normalizedStartedIndex : normalizedLatestMatchingIndex;

    if (targetIndex === -1) {
        return currentToolRuns;
    }

    return currentToolRuns.map((toolRun, index) =>
        index === targetIndex
            ? {
                  ...toolRun,
                  status,
                  summary: payload.summary ?? toolRun.summary ?? payload.tool_message ?? null,
                  result: payload.result ?? toolRun.result,
                  error_message: status === 'failed' ? payload.error ?? 'Tool execution failed.' : null,
              }
            : toolRun
    );
}

async function fileToDataUrl(file: File): Promise<{ name: string; type: string; data: string }> {
    const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    return { name: file.name, type: file.type, data };
}

export function useWidgetChat({ token, greeting }: { token: string; greeting?: string }) {
    const [messages, setMessages] = useState<WidgetMessage[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedMessages = localStorage.getItem(getMessagesStorageKey(token));

        if (storedMessages) {
            try {
                const parsed = JSON.parse(storedMessages) as WidgetMessage[];
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                    return;
                }
            } catch {
                localStorage.removeItem(getMessagesStorageKey(token));
            }
        }

        if (greeting) {
            setMessages([{ id: 'greeting', role: 'assistant', content: greeting, status: 'completed' }]);
        }
    }, [greeting, token]);

    useEffect(() => {
        const stored = localStorage.getItem(getStorageKey(token));
        if (stored) {
            setSessionToken(stored);
        }
    }, [token]);

    useEffect(() => {
        if (messages.length === 0) {
            localStorage.removeItem(getMessagesStorageKey(token));
            return;
        }

        localStorage.setItem(getMessagesStorageKey(token), JSON.stringify(messages));
    }, [messages, token]);

    const ensureSession = async () => {
        if (sessionToken) {
            return sessionToken;
        }

        const response = await fetch(`/api/widget/${token}/session`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page_url: window.location.href,
                referrer_url: document.referrer || null,
                metadata: {
                    language: navigator.language,
                    userAgent: navigator.userAgent,
                },
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to start widget session.');
        }

        const payload = await response.json();
        localStorage.setItem(getStorageKey(token), payload.session_token);
        setSessionToken(payload.session_token);
        return payload.session_token as string;
    };

    const readStream = async (response: Response) => {
        if (!response.ok || !response.body) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload.message || `Widget request failed (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

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

                if (dataLines.length === 0) continue;
                const payload = JSON.parse(dataLines.join('\n')) as StreamPayload;

                if (
                    (eventName === 'tool.started' || eventName === 'tool.completed' || eventName === 'tool.failed') &&
                    typeof (payload as StreamPayload & { message?: unknown }).message === 'string'
                ) {
                    payload.tool_message = (payload as StreamPayload & { message?: string }).message;
                }

                if (eventName === 'message.created') {
                    const id = payload.message?.id || payload.message_id || `assistant-${Date.now()}`;
                    setMessages((current) => [
                        ...current.filter((message) => message.id !== id),
                        { id, role: 'assistant', content: '', status: 'streaming', toolRuns: [] },
                    ]);
                }

                if (eventName === 'message.delta' && payload.message_id) {
                    setMessages((current) =>
                        current.map((message) =>
                            message.id === payload.message_id
                                ? { ...message, content: message.content + (payload.content || ''), status: 'streaming' }
                                : message
                        )
                    );
                }

                if (eventName === 'message.completed' && payload.message_id) {
                    setMessages((current) =>
                        current.map((message) =>
                            message.id === payload.message_id ? { ...message, status: 'completed' } : message
                        )
                    );
                }

                if (eventName === 'tool.started' && payload.message_id) {
                    setMessages((current) =>
                        current.map((message) =>
                            message.id === payload.message_id
                                ? { ...message, toolRuns: updateToolRuns(message.toolRuns, payload, 'started') }
                                : message
                        )
                    );
                }

                if (eventName === 'tool.completed' && payload.message_id) {
                    setMessages((current) =>
                        current.map((message) =>
                            message.id === payload.message_id
                                ? { ...message, toolRuns: updateToolRuns(message.toolRuns, payload, 'completed') }
                                : message
                        )
                    );
                }

                if (eventName === 'tool.failed' && payload.message_id) {
                    setMessages((current) =>
                        current.map((message) =>
                            message.id === payload.message_id
                                ? { ...message, toolRuns: updateToolRuns(message.toolRuns, payload, 'failed') }
                                : message
                        )
                    );
                }

                if (eventName === 'message.failed') {
                    throw new Error(payload.error || 'The widget could not complete the request.');
                }
            }
        }
    };

    const sendMessage = async (message: string, files: File[]) => {
        setIsSending(true);
        setError(null);
        const currentSession = await ensureSession();
        setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', content: message, status: 'completed' }]);

        try {
            const encodedFiles = await Promise.all(files.map((file) => fileToDataUrl(file)));
            const response = await fetch(`/api/widget/${token}/chat`, {
                method: 'POST',
                headers: { Accept: 'text/event-stream', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_token: currentSession,
                    message,
                    files: encodedFiles,
                }),
            });

            await readStream(response);
        } catch (sendError) {
            setError(sendError instanceof Error ? sendError.message : 'The widget could not complete the request.');
        } finally {
            setIsSending(false);
        }
    };

    const clearConversation = () => {
        localStorage.removeItem(getStorageKey(token));
        localStorage.removeItem(getMessagesStorageKey(token));
        setSessionToken(null);
        setError(null);
        setMessages(greeting ? [{ id: 'greeting', role: 'assistant', content: greeting, status: 'completed' }] : []);
    };

    return {
        messages: useMemo(() => messages, [messages]),
        clearConversation,
        error,
        isSending,
        sendMessage,
    };
}
