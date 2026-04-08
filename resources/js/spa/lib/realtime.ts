import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { authHeaders } from '@/spa/lib/auth-token';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

export type RealtimePayload = {
    event: string;
    conversation_id?: string;
    message_id?: string;
    [key: string]: unknown;
};

type SubscribeOptions = {
    onSubscribed?: () => void;
    onError?: (error: unknown) => void;
};

let echo: Echo<'reverb'> | null = null;

function resolveConfig() {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';

    return {
        key: import.meta.env.VITE_REVERB_APP_KEY ?? 'kwati-local',
        wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
        wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? (protocol === 'https' ? 443 : 8080)),
        wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? (protocol === 'https' ? 443 : 8080)),
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? protocol) === 'https',
    };
}

function makeEcho(): Echo<'reverb'> {
    window.Pusher = Pusher;

    const { key, wsHost, wsPort, wssPort, forceTLS } = resolveConfig();

    return new Echo({
        broadcaster: 'reverb',
        key,
        wsHost,
        wsPort,
        wssPort,
        forceTLS,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
        authorizer: (channel) => ({
            authorize: async (socketId, callback) => {
                try {
                    const response = await fetch('/broadcasting/auth', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...authHeaders(),
                        },
                        body: JSON.stringify({
                            socket_id: socketId,
                            channel_name: channel.name,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Broadcast auth failed (${response.status})`);
                    }

                    callback(null, await response.json());
                } catch (error) {
                    callback(error instanceof Error ? error : new Error('Broadcast auth failed'), null);
                }
            },
        }),
    });
}

export function getEcho(): Echo<'reverb'> | null {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!echo) {
        echo = makeEcho();
    }

    return echo;
}

export function subscribeToPrivateChannel(
    channelName: string,
    onEvent: (event: string, payload: RealtimePayload) => void,
    options: SubscribeOptions = {},
): () => void {
    const instance = getEcho();

    if (!instance) {
        return () => undefined;
    }

    const channel = instance.private(channelName);
    channel.subscribed(() => options.onSubscribed?.());
    channel.error((error: unknown) => options.onError?.(error));
    channel.listen('.realtime.event', (payload: RealtimePayload) => {
        if (!payload?.event) {
            return;
        }

        onEvent(payload.event, payload);
    });

    return () => {
        instance.leave(`private-${channelName}`);
    };
}
