import { useEffect, useRef } from 'react';
import { listenToFeedEvents, listenToPostEvents } from '@/utils/echo';

export interface RealTimePost {
    id: string;
    content: string;
    user_id: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
    media?: Array<{ id: string; path: string }>;
    created_at: string;
}

interface UseRealtimePostsOptions {
    onPostCreated?: (post: RealTimePost) => void;
    onPostLiked?: (data: any) => void;
    onError?: (error: any) => void;
    userId?: string; // If provided, listen to personalized feed instead of public posts
}

/**
 * Hook for real-time post updates
 * Listens to WebSocket events and calls callbacks when posts are created/liked
 */
export function useRealtimePosts(options: UseRealtimePostsOptions) {
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const handlePostEvent = (data: any) => {
            if (data.type === 'PostLiked') {
                options.onPostLiked?.(data);
            } else if (data.post) {
                options.onPostCreated?.(data.post);
            }
        };

        // Subscribe to appropriate channel
        if (options.userId) {
            unsubscribeRef.current = listenToFeedEvents(
                options.userId,
                handlePostEvent,
                options.onError
            );
        } else {
            unsubscribeRef.current = listenToPostEvents(
                handlePostEvent,
                options.onError
            );
        }

        // Cleanup subscription on unmount
        return () => {
            unsubscribeRef.current?.();
        };
    }, [options.userId, options.onPostCreated, options.onPostLiked, options.onError]);
}
