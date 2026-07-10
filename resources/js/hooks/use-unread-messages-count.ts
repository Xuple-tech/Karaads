import { useEffect, useState, useCallback } from 'react';

const UNREAD_MESSAGES_STORAGE_KEY = 'unread_messages_count';

/**
 * Hook to manage unread message count
 * Stores the count in localStorage and provides methods to update it
 */
export function useUnreadMessagesCount() {
    const [count, setCount] = useState(() => {
        // Initialize from localStorage
        const stored = typeof window !== 'undefined'
            ? localStorage.getItem(UNREAD_MESSAGES_STORAGE_KEY)
            : null;
        return stored ? parseInt(stored, 10) : 0;
    });

    // Sync count to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (count > 0) {
                localStorage.setItem(UNREAD_MESSAGES_STORAGE_KEY, count.toString());
            } else {
                localStorage.removeItem(UNREAD_MESSAGES_STORAGE_KEY);
            }
        }
    }, [count]);

    const increment = useCallback(() => {
        setCount((prev) => prev + 1);
    }, []);

    const reset = useCallback(() => {
        setCount(0);
    }, []);

    const decrement = useCallback(() => {
        setCount((prev) => Math.max(0, prev - 1));
    }, []);

    return { count, increment, reset, decrement };
}
