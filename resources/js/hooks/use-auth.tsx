import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';

export interface AuthUser {
    id: string;
    name: string;
    username: string;
    email: string;
    country?: string | null;
    state?: string | null;
    location?: string | null;
    kara_verified_at?: string | null;
    kara_verified_expires_at?: string | null;
    has_verification_badge?: boolean;
    birth_date?: string | null;
    onboarding_interests?: string[] | null;
    onboarding_completed_at?: string | null;
    onboarding_complete?: boolean;
    message_policy?: 'everyone' | 'followers' | 'nobody';
    default_post_visibility?: 'everyone' | 'followers' | 'private';
    post_email_notifications_enabled?: boolean;
    avatar?: string;
    bio?: string;
    is_online?: boolean;
    last_seen_at?: string | null;
    followers_count: number;
    following_count: number;
    is_verified: boolean;
    created_at: string;
}

export interface AuthData {
    user?: AuthUser;
}

interface AuthContextType {
    auth: AuthData | null;
    setAuth: (auth: AuthData | null) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function persistLastEmail(email: unknown): void {
    if (typeof email === 'string' && email.includes('@')) {
        localStorage.setItem('karaads_last_email', email);
    }
}

function readInitialAuth(): { found: boolean; auth: AuthData | null } {
    const parseAuth = (payload: unknown): { found: boolean; auth: AuthData | null } => {
        if (!payload || typeof payload !== 'object') {
            return { found: false, auth: null };
        }

        const pageProps = (payload as any)?.props;
        if (!pageProps || typeof pageProps !== 'object') {
            return { found: false, auth: null };
        }

        if (!Object.prototype.hasOwnProperty.call(pageProps, 'auth')) {
            return { found: false, auth: null };
        }

        const auth = (pageProps as any).auth;
        return { found: true, auth: auth && typeof auth === 'object' ? auth : null };
    };

    const appElement = document.getElementById('app');
    if (appElement?.dataset.page) {
        try {
            const parsedPage = JSON.parse(appElement.dataset.page);
            const parsed = parseAuth(parsedPage);
            if (parsed.found) {
                return parsed;
            }
        } catch {
            // Ignore malformed payloads and continue fallback checks.
        }
    }

    const windowPage = (window as any)?.laravel?.page;
    const parsedWindowPage = parseAuth(windowPage);
    if (parsedWindowPage.found) {
        return parsedWindowPage;
    }

    return { found: false, auth: null };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [auth, setAuth] = useState<AuthData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initialAuth = readInitialAuth();
        if (initialAuth.found) {
            persistLastEmail(initialAuth.auth?.user?.email);
            setAuth(initialAuth.auth);
            setIsLoading(false);
            return;
        }

        const fetchAuth = async () => {
            try {
                const response = await axiosInstance.get('/api/users/profile', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                const result = response.data;
                const user = result.data || result;
                persistLastEmail(user?.email);
                setAuth({ user });
            } catch (error) {
                const status = (error as any)?.response?.status;
                const isExpectedGuestState = status === 401 || status === 403;

                if (!isExpectedGuestState && import.meta.env.DEV) {
                    console.error('Failed to fetch auth user:', error);
                }
                setAuth(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
