import { useCallback, useEffect, useRef, useState } from 'react';
import axiosInstance from '@/lib/axios';

interface UseFetchOptions {
    skip?: boolean;
    refetchInterval?: number;
    cacheMs?: number;
    dedupe?: boolean;
    abortOnUnmount?: boolean;
}

type CacheEntry = { expiresAt: number; value: unknown };

const responseCache = new Map<string, CacheEntry>();

function getCached(url: string, cacheMs: number | undefined) {
    if (!cacheMs || cacheMs <= 0) return undefined;
    const entry = responseCache.get(url);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
        responseCache.delete(url);
        return undefined;
    }
    return entry.value;
}

export function useFetch<T>(url: string, options: UseFetchOptions = {}) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!options.skip);
    const [error, setError] = useState<Error | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const currentUrlRef = useRef<string | null>(null);
    const currentPromiseRef = useRef<Promise<T> | null>(null);
    const mountedRef = useRef(false);
    const requestSeqRef = useRef(0);

    const cacheMs = options.cacheMs ?? 0;
    const dedupe = options.dedupe ?? true;
    const abortOnUnmount = options.abortOnUnmount ?? !import.meta.env.DEV;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            requestSeqRef.current += 1;
            if (abortOnUnmount) {
                abortRef.current?.abort();
            }
        };
    }, [abortOnUnmount]);

    const fetchData = useCallback(
        async ({ force }: { force?: boolean } = {}) => {
            if (options.skip || !url) return;

            const requestId = (requestSeqRef.current += 1);

            if (!force) {
                const cached = getCached(url, cacheMs);
                if (cached !== undefined) {
                    if (!mountedRef.current || requestId !== requestSeqRef.current) return;
                    setData(cached as T);
                    setError(null);
                    setLoading(false);
                    return;
                }
            }

            if (dedupe && currentPromiseRef.current && currentUrlRef.current === url) {
                try {
                    if (mountedRef.current && requestId === requestSeqRef.current) {
                        setLoading(true);
                    }
                    const value = await currentPromiseRef.current;
                    if (!mountedRef.current || requestId !== requestSeqRef.current) return;
                    setData(value);
                    setError(null);
                } catch (err) {
                    if (err instanceof DOMException && err.name === 'AbortError') return;
                    if (!mountedRef.current || requestId !== requestSeqRef.current) return;
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                    setData(null);
                } finally {
                    if (mountedRef.current && requestId === requestSeqRef.current) {
                        setLoading(false);
                    }
                }
                return;
            }

            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            currentUrlRef.current = url;

            const doFetch = async () => {
                const response = await axiosInstance.get(url, {
                    signal: controller.signal,
                    headers: {
                        Accept: 'application/json',
                    },
                });
                const result = response.data;
                return (result?.data ?? result) as T;
            };

            let requestPromise: Promise<T> | null = null;

            try {
                if (mountedRef.current && requestId === requestSeqRef.current) {
                    setLoading(true);
                }

                requestPromise = doFetch();
                currentPromiseRef.current = requestPromise;

                const value = await requestPromise;
                if (!mountedRef.current || requestId !== requestSeqRef.current) return;
                setData(value);
                setError(null);

                if (cacheMs > 0) {
                    responseCache.set(url, { value, expiresAt: Date.now() + cacheMs });
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return;
                }
                if (!mountedRef.current || requestId !== requestSeqRef.current) return;
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setData(null);
            } finally {
                if (mountedRef.current && requestId === requestSeqRef.current) {
                    setLoading(false);
                }
                if (requestPromise && currentPromiseRef.current === requestPromise) {
                    currentPromiseRef.current = null;
                    if (currentUrlRef.current === url) {
                        currentUrlRef.current = null;
                    }
                }
            }
        },
        [url, options.skip, cacheMs, dedupe],
    );

    useEffect(() => {
        fetchData();

        if (options.refetchInterval) {
            const interval = setInterval(fetchData, options.refetchInterval);
            return () => {
                clearInterval(interval);
            };
        }
        return;
    }, [fetchData, options.refetchInterval]);

    return { data, loading, error, refetch: () => fetchData({ force: true }) };
}
