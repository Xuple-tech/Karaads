export type ChatTransport = 'sse' | 'ws';

export function getChatTransport(): ChatTransport {
    const configured = String(import.meta.env.VITE_CHAT_TRANSPORT ?? 'sse').toLowerCase();

    return configured === 'ws' ? 'ws' : 'sse';
}

export function isSseChatTransport(): boolean {
    return getChatTransport() === 'sse';
}
