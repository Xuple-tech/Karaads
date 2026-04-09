import { useEffect, useMemo, useState } from 'react';

type WidgetMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    status?: 'streaming' | 'completed' | 'failed';
};

type StreamPayload = {
    message?: { id?: string };
    message_id?: string;
    content?: string;
    error?: string;
};

const getStorageKey = (token: string) => `kwati_widget_session_${token}`;

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
        if (greeting) {
            setMessages([{ id: 'greeting', role: 'assistant', content: greeting, status: 'completed' }]);
        }
    }, [greeting]);

    useEffect(() => {
        const stored = localStorage.getItem(getStorageKey(token));
        if (stored) {
            setSessionToken(stored);
        }
    }, [token]);

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

                if (eventName === 'message.created') {
                    const id = payload.message?.id || payload.message_id || `assistant-${Date.now()}`;
                    setMessages((current) => [...current.filter((message) => message.id !== id), { id, role: 'assistant', content: '', status: 'streaming' }]);
                }

                if (eventName === 'message.delta' && payload.message_id) {
                    setMessages((current) => current.map((message) => message.id === payload.message_id ? { ...message, content: message.content + (payload.content || ''), status: 'streaming' } : message));
                }

                if (eventName === 'message.completed' && payload.message_id) {
                    setMessages((current) => current.map((message) => message.id === payload.message_id ? { ...message, status: 'completed' } : message));
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

    return {
        messages: useMemo(() => messages, [messages]),
        error,
        isSending,
        sendMessage,
    };
}
