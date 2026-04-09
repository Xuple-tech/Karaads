import { useEffect, useRef } from 'react';

import { WidgetInput } from './WidgetInput';
import { WidgetMessage } from './WidgetMessage';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    status?: 'streaming' | 'completed' | 'failed';
};

export function WidgetPanel({
    botName,
    avatarUrl,
    messages,
    isSending,
    error,
    allowFileUploads,
    onClose,
    onSend,
}: {
    botName: string;
    avatarUrl: string | null;
    messages: Message[];
    isSending: boolean;
    error: string | null;
    allowFileUploads: boolean;
    onClose: () => void;
    onSend: (message: string, files: File[]) => Promise<void>;
}) {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
                <button type="button" className="kwati-close" onClick={onClose} aria-label="Close chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className="kwati-messages">
                {messages.map((message) => (
                    <WidgetMessage key={message.id} message={message} />
                ))}
                {error ? <div className="kwati-error">{error}</div> : null}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <WidgetInput allowFileUploads={allowFileUploads} disabled={isSending} onSend={onSend} />
        </div>
    );
}
