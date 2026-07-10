import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Laravel Echo for WebSocket support
export function initializeEcho(): void {  // ✅ Added 'export'
    if (window.Echo) {
        return; // Already initialized
    }

    window.Pusher = Pusher;

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: Number(import.meta.env.VITE_REVERB_PORT),
        wssPort: Number(import.meta.env.VITE_REVERB_PORT),
        forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
        withCredentials: true,
        wsPath: '/reverb', // ⬅️ ADD THIS LINE (or '/app' if using default)
        auth: {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            },
        },
    });

    console.log('✅ Laravel Echo initialized');
}

/**
 * Listen to post events
 */
export function listenToPostEvents(  // ✅ Added 'export'
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
            console.error('🔴 WebSocket error:', error);
            errorCallback?.(error);
        });

    return () => {
        window.Echo.leaveChannel('posts');
    };
}

/**
 * Listen to user feed events (personalized feed)
 */
export function listenToFeedEvents(  // ✅ Added 'export'
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
            console.error('🔴 Feed WebSocket error:', error);
            errorCallback?.(error);
        });

    return () => {
        window.Echo.leaveChannel(`feed.${userId}`);
    };
}

/**
 * Listen to message events for conversations
 */
export function listenToConversation(  // ✅ Added 'export'
    conversationId: string,
    callback: (data: any) => void,
    errorCallback?: (error: any) => void
): (() => void) {
    initializeEcho();

    if (!conversationId) {
        console.warn('⚠️ No conversation ID provided to listenToConversation');
        return () => {};
    }

    console.log(`📡 Subscribing to conversation.${conversationId}`);

    const channelName = `conversation.${conversationId}`;
    const channel = window.Echo.private(channelName);

    channel
        .listen('.MessageSent', (data: any) => {
            console.log('📨 Message received via WebSocket:', data);
            callback(data);
        })
        .error((error: any) => {
            console.error(`🔴 Conversation ${conversationId} WebSocket error:`, error);
            if (errorCallback) {
                errorCallback(error);
            }
        });

    console.log(`✅ Successfully subscribed to ${channelName}`);

    return () => {
        console.log(`👋 Leaving channel ${channelName}`);
        window.Echo.leaveChannel(channelName);
    };
}

/**
 * Listen to user-specific events (notifications, follows)
 */
export function listenToUserEvents(  // ✅ Added 'export'
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
            console.error(`🔴 User ${userId} WebSocket error:`, error);
            errorCallback?.(error);
        });

    return () => {
        window.Echo.leaveChannel(`App.Models.User.${userId}`);
    };
}

/**
 * Disconnect all channels
 */
export function disconnectEcho(): void {  // ✅ Added 'export'
    if (window.Echo) {
        window.Echo.disconnect();
        console.log('✅ Laravel Echo disconnected');
    }
}

// ✅ Alternative: Export everything as a named export object
export const EchoUtils = {
    initializeEcho,
    listenToPostEvents,
    listenToFeedEvents,
    listenToConversation,
    listenToUserEvents,
    disconnectEcho,
};

// ✅ Or export as default
export default {
    initializeEcho,
    listenToPostEvents,
    listenToFeedEvents,
    listenToConversation,
    listenToUserEvents,
    disconnectEcho,
};