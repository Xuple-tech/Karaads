import { useEffect, useRef, useCallback } from 'react';

interface EchoChannelOptions {
    isPrivate?: boolean;
}

/**
 * Hook for subscribing to Laravel Echo channels
 * Automatically handles subscription and cleanup
 */
export function useEchoChannel(
    channelName: string,
    events: string | string[],
    callback: (data: any) => void,
    options: EchoChannelOptions = {}
) {
    const { isPrivate = true } = options;
    const channelRef = useRef<any>(null);
    const callbackRef = useRef(callback);

    // Keep callback reference updated
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        // Check if Echo is available
        if (!window.Echo) {
            console.warn('Laravel Echo not initialized');
            return;
        }

        const eventList = Array.isArray(events) ? events : [events];
        const fullChannelName = isPrivate ? `private-${channelName}` : channelName;

        try {
            // Subscribe to channel
            channelRef.current = window.Echo.channel(fullChannelName);

            // Listen for all specified events
            eventList.forEach((event) => {
                channelRef.current.listen(event, (data: any) => {
                    callbackRef.current(data);
                });
            });

            console.log(`✓ Subscribed to ${fullChannelName}`);
        } catch (error) {
            console.error(`Failed to subscribe to channel ${fullChannelName}:`, error);
        }

        // Cleanup on unmount
        return () => {
            if (channelRef.current) {
                try {
                    window.Echo.leaveChannel(fullChannelName);
                    console.log(`✓ Unsubscribed from ${fullChannelName}`);
                } catch (error) {
                    console.error(`Failed to unsubscribe from ${fullChannelName}:`, error);
                }
            }
        };
    }, [channelName, events, isPrivate]);

    return channelRef.current;
}

/**
 * Hook for listening to private user notifications
 */
export function useNotifications(userId: string, callback: (notification: any) => void) {
    return useEchoChannel(
        `App.Models.User.${userId}`,
        ['user.followed', 'post.liked'],
        callback,
        { isPrivate: true }
    );
}

/**
 * Hook for listening to conversation messages
 */
export function useConversationMessages(
    conversationId: string,
    callback: (message: any) => void
) {
    return useEchoChannel(
        `conversation.${conversationId}`,
        'message.sent',
        callback,
        { isPrivate: true }
    );
}

/**
 * Hook for listening to feed updates
 */
export function useFeedUpdates(userId: string, callback: (post: any) => void) {
    return useEchoChannel(
        `feed.${userId}`,
        ['post.created', 'post.liked'],
        callback,
        { isPrivate: true }
    );
}

/**
 * Hook for listening to public posts channel
 */
export function usePublicPosts(callback: (data: any) => void) {
    return useEchoChannel('posts', ['post.created', 'post.liked'], callback, {
        isPrivate: false,
    });
}

/**
 * Hook for typing indicators (client-side events)
 */
export function useTypingIndicator(conversationId: string) {
    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!window.Echo) return;

        channelRef.current = window.Echo.private(`conversation.${conversationId}`);

        return () => {
            if (channelRef.current) {
                window.Echo.leaveChannel(`private-conversation.${conversationId}`);
            }
        };
    }, [conversationId]);

    const sendTyping = useCallback((isTyping: boolean) => {
        if (channelRef.current) {
            channelRef.current.whisper('typing', { is_typing: isTyping });
        }
    }, []);

    const listenForTyping = useCallback(
        (callback: (data: any) => void) => {
            if (channelRef.current) {
                channelRef.current.listenForWhisper('typing', callback);
            }
        },
        []
    );

    return { sendTyping, listenForTyping };
}

/**
 * Hook for presence channels (online status)
 */
export function usePresence(userId: string) {
    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!window.Echo) return;

        try {
            channelRef.current = window.Echo.join(`presence.${userId}`);

            channelRef.current.here((users: any) => {
                console.log('Users online:', users);
            });

            channelRef.current.joining((user: any) => {
                console.log(`${user.name} joined`);
            });

            channelRef.current.leaving((user: any) => {
                console.log(`${user.name} left`);
            });
        } catch (error) {
            console.error('Failed to join presence channel:', error);
        }

        return () => {
            if (channelRef.current) {
                window.Echo.leaveChannel(`presence.${userId}`);
            }
        };
    }, [userId]);

    return channelRef.current;
}

/**
 * Hook for monitoring Echo connection status
 */
export function useEchoStatus() {
    const isConnectedRef = useRef(false);

    useEffect(() => {
        if (!window.Echo) return;

        try {
            const socket = window.Echo.connector.socket;

            const onConnect = () => {
                isConnectedRef.current = true;
                console.log('✓ WebSocket connected');
            };

            const onDisconnect = () => {
                isConnectedRef.current = false;
                console.log('✗ WebSocket disconnected');
            };

            const onError = (error: any) => {
                console.error('WebSocket error:', error);
                isConnectedRef.current = false;
            };

            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);
            socket.on('connect_error', onError);

            return () => {
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);
                socket.off('connect_error', onError);
            };
        } catch (error) {
            console.error('Error setting up Echo status monitoring:', error);
        }
    }, []);

    return isConnectedRef.current;
}
