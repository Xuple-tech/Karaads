import { WidgetMarkdown } from './WidgetMarkdown';
import { WidgetToolTimeline } from './WidgetToolTimeline';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    status?: 'streaming' | 'completed' | 'failed';
    attachments?: {
        id?: string;
        kind?: 'image' | 'file' | 'audio' | 'video';
        url?: string | null;
        name?: string | null;
        mime_type?: string | null;
    }[];
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

export function WidgetMessage({ message }: { message: Message }) {
    const isStreaming = message.status === 'streaming';
    const isEmpty = !message.content;
    const attachments = message.attachments ?? [];
    const images = attachments.filter((attachment) => attachment.kind === 'image' || attachment.mime_type?.startsWith('image/'));
    const hasAttachments = attachments.length > 0;
    const hasToolRuns = Boolean(message.toolRuns?.length);

    return (
        <div className={`kwati-message is-${message.role}`}>
            {message.role === 'assistant' && isStreaming && isEmpty && !hasAttachments ? (
                <div className="kwati-typing">
                    <span />
                    <span />
                    <span />
                </div>
            ) : (
                <div className="kwati-bubble">
                    {message.role === 'assistant' ? (
                        <WidgetMarkdown content={message.content} />
                    ) : (
                        message.content
                    )}
                    {images.length > 0 ? (
                        <div style={{ marginTop: message.content ? '10px' : 0, display: 'grid', gap: '10px' }}>
                            {images.map((attachment, index) => (
                                <img
                                    key={attachment.id || attachment.url || `image-${index}`}
                                    src={attachment.url ?? undefined}
                                    alt={attachment.name || 'Generated image'}
                                    style={{
                                        display: 'block',
                                        maxWidth: '100%',
                                        maxHeight: '320px',
                                        borderRadius: '14px',
                                        objectFit: 'contain',
                                        background: 'rgba(255,255,255,0.04)',
                                    }}
                                />
                            ))}
                        </div>
                    ) : null}
                    {isStreaming && !isEmpty ? <span className="kwati-cursor" aria-hidden="true" /> : null}
                </div>
            )}
            {message.role === 'assistant' && hasToolRuns ? <WidgetToolTimeline toolRuns={message.toolRuns ?? []} /> : null}
        </div>
    );
}
