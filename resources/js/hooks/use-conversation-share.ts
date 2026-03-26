import { useState, useCallback } from 'react';
import axios from 'axios';

interface ShareData {
    id: number;
    conversation_id: string;
    share_token: string;
    is_public: boolean;
    is_active: boolean;
    expires_at?: string | null;
    created_at: string;
    share_url?: string;
}

interface UseConversationShareOptions {
    conversationId: string;
}

export const useConversationShare = ({ conversationId }: UseConversationShareOptions) => {
    const [share, setShare] = useState<ShareData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchShare = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                `/api/conversations/${conversationId}/share/details`
            );
            if (response.data.success) {
                setShare(response.data.share);
                return response.data.share;
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to fetch share details';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    const createShare = useCallback(
        async (isPublic: boolean, expiresAt: string | null = null) => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.post(
                    `/api/conversations/${conversationId}/share/create`,
                    {
                        is_public: isPublic,
                        expires_at: expiresAt,
                    }
                );
                if (response.data.success) {
                    setShare(response.data.share);
                    return response.data;
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to create share';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [conversationId]
    );

    const updateShare = useCallback(
        async (updates: { is_public?: boolean; expires_at?: string | null }) => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.put(
                    `/api/conversations/${conversationId}/share/update`,
                    updates
                );
                if (response.data.success) {
                    setShare(response.data.share);
                    return response.data;
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to update share';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [conversationId]
    );

    const revokeShare = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(
                `/api/conversations/${conversationId}/share/revoke`
            );
            if (response.data.success) {
                setShare(null);
                return response.data;
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to revoke share';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    const getShareUrl = useCallback(() => {
        if (!share?.share_token) return null;
        return `${window.location.origin}/share/${share.share_token}`;
    }, [share]);

    return {
        share,
        shareUrl: getShareUrl(),
        loading,
        error,
        fetchShare,
        createShare,
        updateShare,
        revokeShare,
    };
};
