import { listenToFeedEvents, listenToPostEvents } from '@/utils/echo';
import { useEffect, useRef } from 'react';

export interface PostInteractionEvent {
    id: string;
    post_id: string;
    user_id: string;
    user?: {
        id: string;
        name: string;
        username: string;
        avatar?: string;
    };
    like_count?: number;
    comment_count?: number;
    repost_count?: number;
    content?: string;
    created_at?: string;
    type?: 'like' | 'comment' | 'reshare';
}

interface UseRealtimePostInteractionsOptions {
    onLike?: (data: PostInteractionEvent) => void;
    onUnlike?: (data: PostInteractionEvent) => void;
    onComment?: (data: PostInteractionEvent) => void;
    onReshare?: (data: PostInteractionEvent) => void;
    onError?: (error: any) => void;
    userId?: string;
}

/**
 * Hook for real-time post interactions (likes, comments, reshares)
 * Listens to WebSocket events for post engagement
 */
export function useRealtimePostInteractions(
    options: UseRealtimePostInteractionsOptions,
) {
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const handleInteractionEvent = (data: any) => {
            // Handle like events
            if (data.event === 'post.liked' || data.type === 'PostLiked') {
                options.onLike?.(data);
            }
            // Handle unlike events
            else if (
                data.event === 'post.unliked' ||
                data.type === 'PostUnliked'
            ) {
                options.onUnlike?.(data);
            }
            // Handle comment events
            else if (
                data.event === 'comment.created' ||
                data.type === 'CommentCreated'
            ) {
                options.onComment?.(data);
            }
            // Handle reshare events
            else if (
                data.event === 'post.reshared' ||
                data.type === 'PostReshared'
            ) {
                options.onReshare?.(data);
            }
        };

        // Subscribe to appropriate channel
        if (options.userId) {
            unsubscribeRef.current = listenToFeedEvents(
                options.userId,
                handleInteractionEvent,
                options.onError,
            );
        } else {
            unsubscribeRef.current = listenToPostEvents(
                handleInteractionEvent,
                options.onError,
            );
        }

        // Cleanup subscription on unmount
        return () => {
            unsubscribeRef.current?.();
        };
    }, [
        options.userId,
        options.onLike,
        options.onUnlike,
        options.onComment,
        options.onReshare,
        options.onError,
    ]);
}
