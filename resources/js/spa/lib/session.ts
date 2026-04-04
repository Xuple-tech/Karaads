import { useQuery } from '@tanstack/react-query';

import { clearAuthToken, getAuthToken } from '@/spa/lib/auth-token';
import { apiRequest } from '@/spa/lib/api';

export type SessionUser = {
    id: string;
    name: string;
    email: string;
    is_admin?: boolean;
    email_verified_at?: string | null;
};

export type SessionResponse = {
    success: boolean;
    authenticated: boolean;
    user: SessionUser | null;
};

export const sessionQueryKey = ['spa', 'session'];

export function useSessionQuery() {
    return useQuery({
        queryKey: sessionQueryKey,
        queryFn: async () => {
            if (!getAuthToken()) {
                return {
                    success: true,
                    authenticated: false,
                    user: null,
                } satisfies SessionResponse;
            }

            try {
                return await apiRequest<SessionResponse>('/api/session/user');
            } catch (error: any) {
                if (error?.status === 401) {
                    clearAuthToken();
                    return {
                        success: true,
                        authenticated: false,
                        user: null,
                    } satisfies SessionResponse;
                }

                throw error;
            }
        },
        staleTime: 10_000,
    });
}
