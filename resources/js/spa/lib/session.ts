import { useQuery } from '@tanstack/react-query';

import { revalidateSession } from '@/spa/lib/auth-runtime';
import { getAuthToken } from '@/spa/lib/auth-token';

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

            return revalidateSession({ redirectOnFailure: false });
        },
        staleTime: 10_000,
    });
}
