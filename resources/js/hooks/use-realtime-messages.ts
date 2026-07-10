import { useEffect, useRef, useCallback } from 'react';
import { listenToConversation } from '@/utils/echo';

export interface RealTimeMessage {
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

interface UseRealtimeMessagesOptions {
    conversationId: string;
    onMessageReceived?: (message: RealTimeMessage) => void;
    onError?: (error: any) => void;
}

/**
 * Hook for real-time message updates in conversations
 * Listens to WebSocket events and calls callback when messages arrive
 */
export function useRealtimeMessages(options: UseRealtimeMessagesOptions) {
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const callbackRef = useRef(options.onMessageReceived);
    const errorCallbackRef = useRef(options.onError);

    // Update refs when callbacks change, but don't trigger re-subscription
    useEffect(() => {
        callbackRef.current = options.onMessageReceived;
        errorCallbackRef.current = options.onError;
    }, [options.onMessageReceived, options.onError]);

    useEffect(() => {
        if (!options.conversationId) {
            // Cleanup if conversation ID is empty
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            return;
        }

        const handleMessageEvent = (data: any) => {
            if (import.meta.env.DEV) {
                console.log('📨 Hook received message:', data);
            }
            const message = data.message || data;
            callbackRef.current?.(message);
        };

        const handleError = (error: any) => {
            console.error('WebSocket error in hook:', error);
            errorCallbackRef.current?.(error);
        };

        // Only subscribe if not already subscribed
        if (!unsubscribeRef.current) {
            unsubscribeRef.current = listenToConversation(
                options.conversationId,
                handleMessageEvent,
                handleError
            );
        }

        // Cleanup subscription on unmount or conversation change
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [options.conversationId]);
}
