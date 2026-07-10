import axios from 'axios';
import { useCallback, useState } from 'react';

interface PostAPIOptions {
    onError?: (error: any) => void;
    onSuccess?: (data: any) => void;
}

export function usePostAPI(options: PostAPIOptions = {}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const likePost = useCallback(
        async (postId: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.post(`/api/posts/${postId}/like`);
                options.onSuccess?.(response.data);
                return response.data;
            } catch (err) {
                setError(err);
                options.onError?.(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [options],
    );

    const unlikePost = useCallback(
        async (postId: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.post(
                    `/api/posts/${postId}/unlike`,
                );
                options.onSuccess?.(response.data);
                return response.data;
            } catch (err) {
                setError(err);
                options.onError?.(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [options],
    );

    const resharePost = useCallback(
        async (postId: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.post(
                    `/api/posts/${postId}/reshare`,
                );
                options.onSuccess?.(response.data);
                return response.data;
            } catch (err) {
                setError(err);
                options.onError?.(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [options],
    );

    const unresharePost = useCallback(
        async (postId: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.post(
                    `/api/posts/${postId}/unreshare`,
                );
                options.onSuccess?.(response.data);
                return response.data;
            } catch (err) {
                setError(err);
                options.onError?.(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [options],
    );

    const commentOnPost = useCallback(
        async (postId: string, content: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.post(
                    `/api/posts/${postId}/comment`,
                    {
                        content,
                    },
                );
                options.onSuccess?.(response.data);
                return response.data;
            } catch (err) {
                setError(err);
                options.onError?.(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [options],
    );

    return {
        isLoading,
        error,
        likePost,
        unlikePost,
        resharePost,
        unresharePost,
        commentOnPost,
    };
}
