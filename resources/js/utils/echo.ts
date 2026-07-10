import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const isDev = import.meta.env.DEV;

function isLocalHostname(value: string): boolean {
    const host = value.trim().toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function readXsrfCookie(): string {
    const cookie = document.cookie
        .split('; ')
        .find((item) => item.startsWith('XSRF-TOKEN='));

    if (!cookie) return '';

    const raw = cookie.substring('XSRF-TOKEN='.length);
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

function resolveReverbHost(): string {
    const configuredHost = String(import.meta.env.VITE_REVERB_HOST || '').trim();
    const pageHost = typeof window !== 'undefined' ? window.location.hostname : '';

    if (!configuredHost) {
        return pageHost;
    }

    if (pageHost && !isLocalHostname(pageHost) && isLocalHostname(configuredHost)) {
        if (isDev) {
            console.warn('VITE_REVERB_HOST is localhost in a non-local browser context. Falling back to page hostname.');
        }
        return pageHost;
    }

    return configuredHost;
}

export function initializeEcho(): void {
    if (window.Echo) {
        return;
    }

    window.Pusher = Pusher;

    const csrfToken =
        readXsrfCookie() ||
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
        '';
    const useSecureSocket =
        import.meta.env.VITE_REVERB_SCHEME === 'https' ||
        (typeof window !== 'undefined' && window.location.protocol === 'https:');

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: resolveReverbHost(),
        wsPort: Number(import.meta.env.VITE_REVERB_PORT),
        wssPort: Number(import.meta.env.VITE_REVERB_PORT),
        forceTLS: useSecureSocket,
        enabledTransports: useSecureSocket ? ['wss'] : ['ws'],
        activityTimeout: 120000,
        pongTimeout: 30000,
        unavailableTimeout: 15000,
        authEndpoint: '/broadcasting/auth',
        wsPath: '/reverb', // ⬅️ ADD THIS LINE (or '/app' if using default)
        withCredentials: true,
        auth: {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'X-XSRF-TOKEN': csrfToken,
            },
        },
    });

}

export function listenToPostEvents(
    callback: (data: any) => void,
    errorCallback?: (error: any) => void
): (() => void) {
    initializeEcho();

    window.Echo.channel('posts')
        .listen('.post.created', callback)
        .listen('.post.liked', (data: any) => {
            callback({
                type: 'PostLiked',
                ...data,
            });
        })
        .error((error: any) => {
            console.error('WebSocket error:', error);
            errorCallback?.(error);
        });

    return () => {
        window.Echo.leaveChannel('posts');
    };
}

export function listenToFeedEvents(
    userId: string,
    callback: (data: any) => void,
    errorCallback?: (error: any) => void
): (() => void) {
    initializeEcho();

    window.Echo.private(`feed.${userId}`)
        .listen('.post.created', callback)
        .listen('.post.liked', (data: any) => {
            callback({
                type: 'PostLiked',
                ...data,
            });
        })
        .error((error: any) => {
            console.error('Feed WebSocket error:', error);
            errorCallback?.(error);
        });

    return () => {
        window.Echo.leave(`feed.${userId}`);
    };
}

export function listenToConversation(
    conversationId: string,
    callback: (data: any) => void,
    errorCallback?: (error: any) => void
): (() => void) {
    initializeEcho();

    if (!conversationId) {
        if (isDev) {
            console.warn('No conversation ID provided to listenToConversation');
        }
        return () => {};
    }

    const channelName = `conversation.${conversationId}`;
    const channel = window.Echo.private(channelName);

    channel
        .listen('.MessageSent', (data: any) => {
            callback(data);
        })
        .error((error: any) => {
            console.error(`Conversation ${conversationId} WebSocket error:`, error);
            if (errorCallback) {
                errorCallback(error);
            }
        });

    return () => {
        window.Echo.leave(channelName);
    };
}

export function listenToUserEvents(
    userId: string,
    callback: (data: any) => void,
    errorCallback?: (error: any) => void
): (() => void) {
    initializeEcho();

    window.Echo.private(`App.Models.User.${userId}`)
        .listen('.user.followed', (data: any) => {
            callback({
                type: 'UserFollowed',
                ...data,
            });
        })
        .notification((notification: any) => {
            callback({
                type: 'NotificationCreated',
                ...notification,
            });
        })
        .error((error: any) => {
            console.error(`User ${userId} WebSocket error:`, error);
            errorCallback?.(error);
        });

    return () => {
        window.Echo.leave(`App.Models.User.${userId}`);
    };
}

export function disconnectEcho(): void {
    if (window.Echo) {
        window.Echo.disconnect();
    }
}

export const EchoUtils = {
    initializeEcho,
    listenToPostEvents,
    listenToFeedEvents,
    listenToConversation,
    listenToUserEvents,
    disconnectEcho,
};

export default {
    initializeEcho,
    listenToPostEvents,
    listenToFeedEvents,
    listenToConversation,
    listenToUserEvents,
    disconnectEcho,
};
