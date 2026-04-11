import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { WidgetInput } from './WidgetInput';
import { WidgetMessage } from './WidgetMessage';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    status?: 'streaming' | 'completed' | 'failed';
    toolRuns?: {
        id: string;
        tool_name: string;
        status: 'started' | 'completed' | 'failed';
        summary?: string | null;
        arguments?: Record<string, unknown> | null;
        result?: unknown;
        error_message?: string | null;
    }[];
};

export function WidgetPanel({
    botName,
    avatarUrl,
    messages,
    isSending,
    error,
    allowFileUploads,
    onClear,
    onClose,
    onSend,
}: {
    botName: string;
    avatarUrl: string | null;
    messages: Message[];
    isSending: boolean;
    error: string | null;
    allowFileUploads: boolean;
    onClear: () => void;
    onClose: () => void;
    onSend: (message: string, files: File[]) => Promise<void>;
}) {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [dismissedError, setDismissedError] = useState<string | null>(null);
    const lastMessage = useMemo(() => messages[messages.length - 1] ?? null, [messages]);

    useLayoutEffect(() => {
        const container = messagesEndRef.current?.parentElement;

        if (!container) {
            return;
        }

        container.scrollTop = container.scrollHeight;
    }, [messages.length, lastMessage?.content, lastMessage?.status, lastMessage?.toolRuns?.length]);

    const visibleError = error && error !== dismissedError ? error : null;

    return (
        <div className="kwati-panel">
            {/* Header */}
            <div className="kwati-panel-header">
                <div className="kwati-panel-identity">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={botName} className="kwati-avatar" />
                    ) : (
                        <span className="kwati-avatar-fallback">{botName[0] ?? 'K'}</span>
                    )}
                    <div className="kwati-panel-name">
                        <strong>{botName}</strong>
                        <span>
                            <span className="kwati-online-dot" aria-hidden="true" />
                            Online
                        </span>
                    </div>
                </div>
                <div className="kwati-panel-actions">
                    <button
                        type="button"
                        className="kwati-header-action"
                        onClick={() => {
                            if (window.confirm('Clear this chat conversation?')) {
                                onClear();
                            }
                        }}
                        aria-label="Clear chat"
                        title="Clear chat"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                            <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                    </button>
                    <button type="button" className="kwati-close" onClick={onClose} aria-label="Close chat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="kwati-messages">
                {messages.map((message) => (
                    <WidgetMessage key={message.id} message={message} />
                ))}
                {visibleError ? (
                    <div className="kwati-error">
                        <span className="kwati-error-text">{visibleError}</span>
                        <button
                            type="button"
                            className="kwati-error-dismiss"
                            onClick={() => setDismissedError(error)}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                ) : null}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <WidgetInput allowFileUploads={allowFileUploads} disabled={isSending} onSend={onSend} />
        </div>
    );
}
