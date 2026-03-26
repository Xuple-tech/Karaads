import { useState, useCallback, useEffect } from 'react';

interface RateLimitError {
    error: string;
    reason: string;
    code: string;
    limit?: number;
    used?: number;
    reset_at?: string;
    plan_id?: string;
    plan_name?: string;
}

interface RateLimitState {
    isLimited: boolean;
    error: RateLimitError | null;
    resetAt: Date | null;
}

export function useSubscriptionRateLimit() {
    const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
        isLimited: false,
        error: null,
        resetAt: null,
    });

    /**
     * Check if response is a rate limit error
     */
    const isRateLimitError = useCallback((error: any): error is RateLimitError => {
        return (
            error &&
            typeof error === 'object' &&
            error.code === 'RATE_LIMIT_EXCEEDED'
        );
    }, []);

    /**
     * Handle rate limit error
     */
    const handleRateLimitError = useCallback((error: RateLimitError) => {
        setRateLimitState({
            isLimited: true,
            error,
            resetAt: error.reset_at ? new Date(error.reset_at) : null,
        });
    }, []);

    /**
     * Clear rate limit state
     */
    const clearRateLimit = useCallback(() => {
        setRateLimitState({
            isLimited: false,
            error: null,
            resetAt: null,
        });
    }, []);

    /**
     * Check if user can make request
     */
    const canMakeRequest = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/subscription/my-subscription', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data = await response.json();

            if (!response.ok) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking rate limit:', error);
            return false;
        }
    }, []);

    /**
     * Get formatted reset time
     */
    const getFormattedResetTime = useCallback(() => {
        if (!rateLimitState.resetAt) return null;

        const now = new Date();
        const diff = rateLimitState.resetAt.getTime() - now.getTime();

        if (diff <= 0) return 'soon';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }, [rateLimitState.resetAt]);

    return {
        rateLimitState,
        isRateLimitError,
        handleRateLimitError,
        clearRateLimit,
        canMakeRequest,
        getFormattedResetTime,
    };
}
