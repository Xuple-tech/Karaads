type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    status?: 'streaming' | 'completed' | 'failed';
};

export function WidgetMessage({ message }: { message: Message }) {
    const isStreaming = message.status === 'streaming';
    const isEmpty = !message.content;

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
                    {message.content}
                    {isStreaming && !isEmpty ? <span className="kwati-cursor" aria-hidden="true" /> : null}
                </div>
            )}
        </div>
    );
}
