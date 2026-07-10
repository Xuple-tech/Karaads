import { useEffect, useRef } from 'react';
import { listenToFeedEvents } from '@/utils/echo';
import {
    requestNotificationPermission,
    sendWebNotification,
} from './use-message-notifications';

export interface PostLikeNotificationData {
    post_id: string;
    user_id: string;
    liked: boolean;
    likes_count: number;
    user?: {
        id: string;
        name: string;
        username: string;
        avatar?: string;
    };
}

interface UsePostLikeNotificationsOptions {
    userId: string;
    postOwnerId: string;
    enabled?: boolean;
    onPostLiked?: (data: PostLikeNotificationData) => void;
    onError?: (error: any) => void;
}

/**
 * Hook for real-time post like notifications.
 * Only notifies the post owner.
 */
export function usePostLikeNotifications(
    options: UsePostLikeNotificationsOptions,
) {
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const hasRequestedPermissionRef = useRef(false);

    useEffect(() => {
        if (!hasRequestedPermissionRef.current && options.enabled) {
            hasRequestedPermissionRef.current = true;
            requestNotificationPermission().catch(() => {
                // Ignore permission request failures.
            });
        }
    }, [options.enabled]);

    useEffect(() => {
        if (!options.enabled || !options.postOwnerId) {
            return;
        }

        const handlePostLikeEvent = (data: any) => {
            if (data.event !== 'post.liked' && data.type !== 'PostLiked') {
                return;
            }

            if (data.user_id === options.postOwnerId) {
                return;
            }

            const likerName = data.user?.name || 'Someone';

            if ('Notification' in window && Notification.permission === 'granted') {
                sendWebNotification(
                    `${likerName} liked your post`,
                    {
                        body: `Your post now has ${data.likes_count} ${data.likes_count === 1 ? 'like' : 'likes'}`,
                        icon: data.user?.avatar || '/default-avatar.png',
                        badge: '/logo-icon.png',
                        tag: `post-like-${data.post_id}`,
                    },
                    undefined,
                    `/posts/${data.post_id}`,
                );
            }

            options.onPostLiked?.(data);
        };

        unsubscribeRef.current = listenToFeedEvents(
            options.postOwnerId,
            handlePostLikeEvent,
            options.onError,
        );

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [options.postOwnerId, options.enabled, options.onError, options.onPostLiked]);

    return {
        isEnabled: options.enabled ?? true,
    };
}
