import { useQuery } from '@tanstack/react-query';

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
        queryFn: () => apiRequest<SessionResponse>('/api/session/user'),
        staleTime: 10_000,
    });
}
