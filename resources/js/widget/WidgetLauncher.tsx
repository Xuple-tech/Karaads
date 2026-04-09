export function WidgetLauncher({
    botName,
    onClick,
    open,
    unreadCount,
}: {
    botName: string;
    onClick: () => void;
    open: boolean;
    unreadCount: number;
}) {
    return (
        <button
            type="button"
            className={`kwati-launcher${open ? ' is-open' : ''}`}
            onClick={onClick}
            aria-label={open ? 'Close chat' : `Chat with ${botName}`}
        >
            {open ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
            )}
            {!open && unreadCount > 0 ? (
                <span className="kwati-launcher-badge">{unreadCount}</span>
            ) : null}
        </button>
    );
}
