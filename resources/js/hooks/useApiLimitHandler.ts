import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface LimitErrorData {
    success?: boolean;
    error?: string;
    message?: string;
    action?: 'upgrade' | 'login';
    type?: string;
    code?: string;
    limit?: number;
    used?: number;
    remaining?: number;
    reset_at?: string;
    reset_type?: string;
    plan_name?: string;
    action_label?: string;
    action_url?: string;
}

interface UseApiLimitHandlerReturn {
    limitError: LimitErrorData | null;
    setLimitError: (error: LimitErrorData | null) => void;
    clearLimitError: () => void;
    handleResponse: (response: Response) => Promise<any | null>;
    isLimitError: (response: Response) => boolean;
    showLimitToast: (error: LimitErrorData) => void;
}

/**
 * Hook for handling API limit errors (429 responses)
 *
 * Provides centralized error handling for rate limits and usage restrictions
 * across the application.
 *
 * @returns Object with limit error state and handler functions
 *
 * @example
 * ```tsx
 * const { limitError, setLimitError, handleResponse } = useApiLimitHandler();
 *
 * const sendMessage = async (message: string) => {
 *   const response = await fetch('/api/chat', {
 *     method: 'POST',
 *     body: JSON.stringify({ message })
 *   });
 *
 *   const errorResult = await handleResponse(response);
 *   if (errorResult) {
 *     // Error was a limit error - limitError state is now set
 *     return;
 *   }
 *
 *   // Handle successful response
 *   const data = await response.json();
 * };
 *
 * return (
 *   <div>
 *     {limitError && <LimitNotification error={limitError} />}
 *     <ChatInterface onSubmit={sendMessage} />
 *   </div>
 * );
 * ```
 */
export const useApiLimitHandler = (): UseApiLimitHandlerReturn => {
    const [limitError, setLimitError] = useState<LimitErrorData | null>(null);

    /**
     * Check if a response is a limit error (429 status)
     */
    const isLimitError = useCallback((response: Response): boolean => {
        return response.status === 429;
    }, []);

    /**
     * Handle API response and extract limit error if present
     *
     * @param response - The fetch Response object
     * @returns The error data if it's a limit error, null otherwise
     */
    const handleResponse = useCallback(async (response: Response): Promise<LimitErrorData | null> => {
        if (!isLimitError(response)) {
            return null;
        }

        try {
            const errorData = await response.json();
            setLimitError(errorData);
            return errorData;
        } catch (e) {
            // Fallback error if JSON parsing fails
            const fallbackError: LimitErrorData = {
                error: 'limit_exceeded',
                message: 'You\'ve reached your usage limit. Please try again later.',
                action: 'upgrade'
            };
            setLimitError(fallbackError);
            return fallbackError;
        }
    }, [isLimitError]);

    /**
     * Clear the current limit error
     */
    const clearLimitError = useCallback(() => {
        setLimitError(null);
    }, []);

    /**
     * Show a toast notification for limit errors
     */
    const showLimitToast = useCallback((error: LimitErrorData) => {
        const toastMessage = error.message || 'You\'ve reached your usage limit.';

        if (error.action === 'upgrade') {
            toast.error(toastMessage, {
                icon: '⚠️',
                duration: 5000,
                position: 'top-center'
            });
        } else if (error.action === 'login') {
            toast.error(toastMessage, {
                icon: '🔐',
                duration: 5000,
                position: 'top-center'
            });
        } else {
            toast.error(toastMessage, {
                duration: 5000,
                position: 'top-center'
            });
        }
    }, []);

    return {
        limitError,
        setLimitError,
        clearLimitError,
        handleResponse,
        isLimitError,
        showLimitToast
    };
};

/**
 * Hook for checking if a specific user has hit a particular limit
 *
 * @example
 * ```tsx
 * const { canChatRequest, canGenerateImages } = useLimitChecks();
 *
 * if (!canChatRequest) {
 *   return <UpgradePrompt />;
 * }
 * ```
 */
export const useLimitChecks = () => {
    const [limits, setLimits] = useState({
        canChatRequest: true,
        canGenerateImages: true,
        canUseTokens: true
    });

    const updateLimits = useCallback((error: LimitErrorData | null) => {
        if (!error) {
            setLimits({
                canChatRequest: true,
                canGenerateImages: true,
                canUseTokens: true
            });
            return;
        }

        switch (error.type) {
            case 'rate_limit_exceeded':
            case 'daily_limit_exceeded':
            case 'monthly_limit_exceeded':
                setLimits(prev => ({ ...prev, canChatRequest: false }));
                break;
            case 'image_limit_exceeded':
                setLimits(prev => ({ ...prev, canGenerateImages: false }));
                break;
            case 'token_limit_exceeded':
                setLimits(prev => ({ ...prev, canUseTokens: false }));
                break;
        }
    }, []);

    return { limits, updateLimits };
};

/**
 * Hook for managing limit error modals/dialogs
 *
 * @example
 * ```tsx
 * const { shouldShowModal, modalError, closeModal, openModal } = useLimitModal();
 *
 * return (
 *   <>
 *     {shouldShowModal && <LimitModal error={modalError} onClose={closeModal} />}
 *   </>
 * );
 * ```
 */
export const useLimitModal = () => {
    const [shouldShowModal, setShouldShowModal] = useState(false);
    const [modalError, setModalError] = useState<LimitErrorData | null>(null);

    const openModal = useCallback((error: LimitErrorData) => {
        setModalError(error);
        setShouldShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShouldShowModal(false);
        setModalError(null);
    }, []);

    return {
        shouldShowModal,
        modalError,
        openModal,
        closeModal
    };
};

/**
 * Hook for tracking API requests and rate limiting client-side
 *
 * @example
 * ```tsx
 * const { canMakeRequest, recordRequest, getRequestStats } = useClientSideRateLimit({
 *   maxRequests: 10,
 *   windowMs: 60000 // 1 minute
 * });
 *
 * if (!canMakeRequest()) {
 *   toast.error('Too many requests. Please wait a moment.');
 *   return;
 * }
 *
 * recordRequest();
 * // Make API call
 * ```
 */
export const useClientSideRateLimit = (options: {
    maxRequests?: number;
    windowMs?: number;
} = {}) => {
    const maxRequests = options.maxRequests || 10;
    const windowMs = options.windowMs || 60000; // 1 minute default

    const [requestTimes, setRequestTimes] = useState<number[]>([]);

    const canMakeRequest = useCallback((): boolean => {
        const now = Date.now();
        const recentRequests = requestTimes.filter(time => now - time < windowMs);
        return recentRequests.length < maxRequests;
    }, [requestTimes, windowMs, maxRequests]);

    const recordRequest = useCallback(() => {
        setRequestTimes(prev => {
            const now = Date.now();
            const recent = prev.filter(time => now - time < windowMs);
            return [...recent, now];
        });
    }, [windowMs]);

    const getRequestStats = useCallback(() => {
        const now = Date.now();
        const recentRequests = requestTimes.filter(time => now - time < windowMs);
        return {
            made: recentRequests.length,
            max: maxRequests,
            remaining: Math.max(0, maxRequests - recentRequests.length),
            resetIn: recentRequests.length > 0
                ? Math.ceil((recentRequests[0] + windowMs - now) / 1000)
                : 0
        };
    }, [requestTimes, windowMs, maxRequests]);

    const reset = useCallback(() => {
        setRequestTimes([]);
    }, []);

    return {
        canMakeRequest,
        recordRequest,
        getRequestStats,
        reset
    };
};

export default useApiLimitHandler;
