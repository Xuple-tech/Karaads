import { useEffect, useRef } from 'react';
import { listenToUserEvents } from '@/utils/echo';

export interface RealTimeNotification {
    type: 'follow' | 'like' | 'comment' | 'mention';
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
    action: string;
    related_id?: string;
    created_at: string;
}

interface UseRealtimeNotificationsOptions {
    userId: string;
    onNotificationReceived?: (notification: RealTimeNotification) => void;
    onUserFollowed?: (data: any) => void;
    onError?: (error: any) => void;
}

/**
 * Hook for real-time notifications and user events
 * Listens to follows, likes, mentions, and other user-specific events
 */
export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions) {
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const handleUserEvent = (data: any) => {
            if (data.type === 'UserFollowed') {
                options.onUserFollowed?.(data);
            } else {
                options.onNotificationReceived?.(data);
            }
        };

        unsubscribeRef.current = listenToUserEvents(
            options.userId,
            handleUserEvent,
            options.onError
        );

        // Cleanup subscription on unmount
        return () => {
            unsubscribeRef.current?.();
        };
    }, [options.userId, options.onNotificationReceived, options.onUserFollowed, options.onError]);
}
