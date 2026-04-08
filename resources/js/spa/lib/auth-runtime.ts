import { useSyncExternalStore } from 'react';

import { clearAuthToken, getAuthToken, setAuthToken } from '@/spa/lib/auth-token';
import { queryClient } from '@/spa/lib/query-client';

export type SessionResponse = {
    success: boolean;
    authenticated: boolean;
    user: {
        id: string;
        name: string;
        email: string;
        is_admin?: boolean;
        email_verified_at?: string | null;
    } | null;
};

const sessionQueryKey = ['spa', 'session'];

export type AuthRuntimeStatus = 'unknown' | 'authenticated' | 'unauthenticated' | 'revalidating';

type AuthRuntimeState = {
    status: AuthRuntimeStatus;
};

const listeners = new Set<() => void>();

let state: AuthRuntimeState = {
    status: getAuthToken() ? 'unknown' : 'unauthenticated',
};

let revalidationPromise: Promise<SessionResponse> | null = null;

function notify(): void {
    listeners.forEach((listener) => listener());
}

function setState(next: AuthRuntimeState): void {
    state = next;
    notify();
}

function unauthenticatedResponse(): SessionResponse {
    return {
        success: true,
        authenticated: false,
        user: null,
    };
}

function authenticatedResponse(response: SessionResponse): SessionResponse {
    return {
        success: true,
        authenticated: true,
        user: response.user,
    };
}

function buildLoginRedirect(): string {
    if (typeof window === 'undefined') {
        return '/login';
    }

    const redirect = window.location.pathname + window.location.search;
    return `/login?redirect=${encodeURIComponent(redirect)}`;
}

function setSessionCache(data: SessionResponse): void {
    queryClient.setQueryData(sessionQueryKey, data);
}

export function getAuthRuntimeState(): AuthRuntimeState {
    return state;
}

export function subscribeToAuthRuntime(listener: () => void): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function useAuthRuntimeState(): AuthRuntimeState {
    return useSyncExternalStore(subscribeToAuthRuntime, getAuthRuntimeState, getAuthRuntimeState);
}

export function setAuthenticatedToken(token: string): void {
    setAuthToken(token);
    setState({ status: 'authenticated' });
}

export function clearAuthenticatedToken(): void {
    clearAuthToken();
    setState({ status: 'unauthenticated' });
    setSessionCache(unauthenticatedResponse());
}

export async function logoutSpa(options?: { redirectToLogin?: boolean }): Promise<void> {
    const token = getAuthToken();

    try {
        if (token) {
            await fetch('/api/session/logout', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        }
    } catch {
        // Local logout should still complete even if the server call fails.
    }

    clearAuthenticatedToken();
    await queryClient.invalidateQueries();

    if (options?.redirectToLogin !== false && typeof window !== 'undefined') {
        window.location.replace(buildLoginRedirect());
    }
}

export async function revalidateSession(options?: { redirectOnFailure?: boolean }): Promise<SessionResponse> {
    const token = getAuthToken();

    if (!token) {
        clearAuthenticatedToken();
        return unauthenticatedResponse();
    }

    if (revalidationPromise) {
        return revalidationPromise;
    }

    setState({ status: 'revalidating' });

    revalidationPromise = (async () => {
        try {
            const response = await fetch('/api/session/user', {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                clearAuthenticatedToken();

                if (options?.redirectOnFailure && typeof window !== 'undefined') {
                    window.location.replace(buildLoginRedirect());
                }

                return unauthenticatedResponse();
            }

            if (!response.ok) {
                throw new Error(`Session revalidation failed (${response.status})`);
            }

            const payload = (await response.json()) as SessionResponse;

            if (payload.authenticated) {
                setState({ status: 'authenticated' });
                const next = authenticatedResponse(payload);
                setSessionCache(next);
                return next;
            }

            clearAuthenticatedToken();

            if (options?.redirectOnFailure && typeof window !== 'undefined') {
                window.location.replace(buildLoginRedirect());
            }

            return unauthenticatedResponse();
        } finally {
            revalidationPromise = null;
        }
    })();

    return revalidationPromise;
}

export async function handleUnauthorizedResponse(): Promise<SessionResponse> {
    return revalidateSession({ redirectOnFailure: false });
}
