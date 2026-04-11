import { WidgetMarkdown } from './WidgetMarkdown';
import { WidgetToolTimeline } from './WidgetToolTimeline';

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

export function WidgetMessage({ message }: { message: Message }) {
    const isStreaming = message.status === 'streaming';
    const isEmpty = !message.content;
    const hasToolRuns = Boolean(message.toolRuns?.length);

    return (
        <div className={`kwati-message is-${message.role}`}>
            {message.role === 'assistant' && isStreaming && isEmpty ? (
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
                    {isStreaming && !isEmpty ? <span className="kwati-cursor" aria-hidden="true" /> : null}
                </div>
            )}
            {message.role === 'assistant' && hasToolRuns ? <WidgetToolTimeline toolRuns={message.toolRuns ?? []} /> : null}
        </div>
    );
}
