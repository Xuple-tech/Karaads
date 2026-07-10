import { useEffect, useMemo, useRef } from 'react';
import { listenToConversation } from '@/utils/echo';

export interface RealtimeConversationMessage {
    id: string;
    content: string;
    conversation_id: string;
    user_id: string;
    reply_to_message_id?: string | null;
    reply_to?: any | null;
    message_type?: string;
    attachments?: any[];
    user?: {
        id: string;
        name: string;
        avatar?: string;
        avatar_variants?: {
            sm?: string | null;
            md?: string | null;
            lg?: string | null;
            original?: string | null;
        } | null;
        email?: string;
        username?: string;
    };
    created_at: string;
    read_at?: string | null;
    delivered_at?: string | null;
}

interface UseRealtimeConversationsOptions {
    conversationIds: string[];
    onMessageReceived?: (message: RealtimeConversationMessage) => void;
    onError?: (error: any) => void;
}

export function useRealtimeConversations(options: UseRealtimeConversationsOptions) {
    const onMessageReceivedRef = useRef(options.onMessageReceived);
    const onErrorRef = useRef(options.onError);
    const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

    useEffect(() => {
        onMessageReceivedRef.current = options.onMessageReceived;
        onErrorRef.current = options.onError;
    }, [options.onMessageReceived, options.onError]);

    const idsKey = useMemo(() => {
        const unique = Array.from(new Set(options.conversationIds.filter(Boolean)));
        unique.sort();
        return unique.join(',');
    }, [options.conversationIds.join(',')]);

    const ids = useMemo(() => {
        if (!idsKey) return [];
        return idsKey.split(',');
    }, [idsKey]);

    useEffect(() => {
        const subscriptions = subscriptionsRef.current;

        // Subscribe to new IDs
        for (const id of ids) {
            if (subscriptions.has(id)) continue;

            const unsubscribe = listenToConversation(
                id,
                (data: any) => {
                    const message = (data?.message ?? data) as RealtimeConversationMessage;
                    onMessageReceivedRef.current?.(message);
                },
                (error: any) => {
                    onErrorRef.current?.(error);
                },
            );

            subscriptions.set(id, unsubscribe);
        }

        // Unsubscribe removed IDs
        for (const [id, unsubscribe] of subscriptions.entries()) {
            if (ids.includes(id)) continue;
            try {
                unsubscribe();
            } finally {
                subscriptions.delete(id);
            }
        }

    }, [idsKey]);

    useEffect(() => {
        const subscriptions = subscriptionsRef.current;
        return () => {
            for (const [, unsubscribe] of subscriptions.entries()) {
                unsubscribe();
            }
            subscriptions.clear();
        };
    }, []);
}
