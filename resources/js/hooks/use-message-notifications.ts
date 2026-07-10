import { useEffect, useRef } from 'react';
import { router } from '@/components/page-head';
import { listenToConversation } from '@/utils/echo';
import axiosInstance from '@/lib/axios';

export interface MessageNotificationData {
    id: string;
    content: string;
    conversation_id: string;
    user_id: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
    created_at: string;
}

interface UseMessageNotificationsOptions {
    userId: string;
    enabled?: boolean;
    onMessageReceived?: (message: MessageNotificationData) => void;
    onError?: (error: any) => void;
}

/**
 * Request permission for web notifications.
 */
export function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        return Promise.resolve('denied');
    }

    if (Notification.permission === 'granted') {
        return Promise.resolve('granted');
    }

    if (Notification.permission === 'denied') {
        return Promise.resolve('denied');
    }

    return Notification.requestPermission().then(
        (permission) => permission as NotificationPermission,
        () => 'denied' as NotificationPermission,
    );
}

/**
 * Send a web notification with click handler.
 */
export function sendWebNotification(
    title: string,
    options?: NotificationOptions,
    onNotificationClick?: () => void,
    navigationPath?: string,
): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    try {
        const notification = new Notification(title, options);

        notification.onclick = () => {
            notification.close();

            if (window.parent) {
                window.parent.focus();
            }

            if (navigationPath) {
                router.visit(navigationPath);
            }

            onNotificationClick?.();
        };

        setTimeout(() => {
            notification.close();
        }, 10000);
    } catch (error) {
        console.error('Failed to send web notification:', error);
    }
}

/**
 * Hook for listening to new messages and sending notifications.
 */
export function useMessageNotifications(options: UseMessageNotificationsOptions) {
    const unsubscribeRefs = useRef<Map<string, () => void>>(new Map());
    const callbackRef = useRef(options.onMessageReceived);
    const errorCallbackRef = useRef(options.onError);
    const userIdRef = useRef(options.userId);

    useEffect(() => {
        callbackRef.current = options.onMessageReceived;
        errorCallbackRef.current = options.onError;
        userIdRef.current = options.userId;
    }, [options.onMessageReceived, options.onError, options.userId]);

    useEffect(() => {
        if (options.enabled !== false && 'Notification' in window) {
            requestNotificationPermission().catch(() => {
                // Ignore permission request failures.
            });
        }
    }, [options.enabled]);

    useEffect(() => {
        if (options.enabled === false || !options.userId) {
            return;
        }

        const setupConversationListeners = async () => {
            try {
                const response = await axiosInstance.get('/api/conversations', {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (response.status < 200 || response.status >= 300) {
                    return;
                }

                const { data: conversations } = response.data;

                conversations.forEach((conversation: any) => {
                    if (unsubscribeRefs.current.has(conversation.id)) {
                        return;
                    }

                    const unsubscribe = listenToConversation(
                        conversation.id,
                        (data: any) => {
                            const message = data.message || data;

                            if (message.user_id === userIdRef.current) {
                                return;
                            }

                            if ('Notification' in window && Notification.permission === 'granted') {
                                sendWebNotification(
                                    `${message.user?.name || 'Someone'} sent you a message`,
                                    {
                                        body: String(message.content || '').substring(0, 100),
                                        icon: message.user?.avatar || undefined,
                                        tag: `message-${message.id}`,
                                        requireInteraction: false,
                                    },
                                    undefined,
                                    `/messages/c/${message.conversation_id}`,
                                );
                            }

                            callbackRef.current?.(message);
                        },
                        (error: any) => {
                            console.error(`Error listening to conversation ${conversation.id}:`, error);
                            errorCallbackRef.current?.(error);
                        },
                    );

                    unsubscribeRefs.current.set(conversation.id, unsubscribe);
                });
            } catch (error) {
                const status = (error as any)?.response?.status;
                if (status !== 401 && status !== 403) {
                    console.error('Failed to setup conversation listeners:', error);
                }
                errorCallbackRef.current?.(error);
            }
        };

        setupConversationListeners();

        return () => {
            unsubscribeRefs.current.forEach((unsubscribe) => {
                unsubscribe();
            });
            unsubscribeRefs.current.clear();
        };
    }, [options.enabled, options.userId]);
}
