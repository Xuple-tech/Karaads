import { useEffect, useMemo, useState } from 'react';

import { WidgetLauncher } from './WidgetLauncher';
import { WidgetPanel } from './WidgetPanel';
import { useWidgetChat } from './useWidgetChat';

type WidgetConfig = {
    bot_name: string;
    greeting: string;
    theme_color: string;
    avatar_url?: string | null;
    allow_file_uploads?: boolean;
};

export function WidgetApp({ token }: { token: string }) {
    const [config, setConfig] = useState<WidgetConfig | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await fetch(`/api/widget/${token}/config`, {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(payload.message || 'Failed to load widget.');
                }

                const payload = await response.json();
                setConfig(payload);
                document.documentElement.style.setProperty('--kwati-color', payload.theme_color || '#7c3aed');
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Failed to load widget.');
            }
        };

        void loadConfig();
    }, [token]);

    const { messages, isSending, sendMessage, clearConversation, error: chatError } = useWidgetChat({
        token,
        greeting: config?.greeting,
    });

    const unreadCount = useMemo(() => {
        if (open) {
            return 0;
        }

        return messages.filter((message) => message.role === 'assistant').length > 1 ? 1 : 0;
    }, [messages, open]);

    if (!config && error) {
        return null;
    }

    return (
        <div className="kwati-widget-shell" style={{ ['--kwati-color' as string]: config?.theme_color || '#7c3aed' }}>
            {open ? (
                <WidgetPanel
                    botName={config?.bot_name || 'Kwati'}
                    avatarUrl={config?.avatar_url || null}
                    messages={messages}
                    isSending={isSending}
                    error={chatError || error}
                    allowFileUploads={Boolean(config?.allow_file_uploads)}
                    onClear={clearConversation}
                    onClose={() => setOpen(false)}
                    onSend={sendMessage}
                />
            ) : (
                <WidgetLauncher botName={config?.bot_name || 'Kwati'} onClick={() => setOpen(true)} open={false} unreadCount={unreadCount} />
            )}
        </div>
    );
}
