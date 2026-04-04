import { useMutation } from '@tanstack/react-query';
import { CreditCard, Loader2, LogOut, Mail, MessageSquare, Radio, Settings } from 'lucide-react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';
import { sessionQueryKey, useSessionQuery } from '@/spa/lib/session';

function LoadingState() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <Loader2 className="size-6 animate-spin" />
        </div>
    );
}

export function PublicLayout() {
    const { data } = useSessionQuery();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border/60 bg-background/90 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link className="text-lg font-semibold" to={data?.authenticated ? '/app' : '/'}>
                        KwatiAI
                    </Link>
                    <nav className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Link to="/pricing">Pricing</Link>
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        {data?.authenticated ? <Link to="/app">Open App</Link> : <Link to="/login">Login</Link>}
                    </nav>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export function ProtectedOnly() {
    const location = useLocation();
    const session = useSessionQuery();

    if (session.isLoading) {
        return <LoadingState />;
    }

    if (!session.data?.authenticated) {
        return <Navigate replace to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} />;
    }

    return <Outlet />;
}

export function GuestOnly() {
    const session = useSessionQuery();

    if (session.isLoading) {
        return <LoadingState />;
    }

    if (session.data?.authenticated) {
        return <Navigate replace to="/app" />;
    }

    return <Outlet />;
}

export function AppLayout() {
    const session = useSessionQuery();
    const navigate = useNavigate();
    const logout = useMutation({
        mutationFn: () => apiRequest('/api/session/logout', { method: 'POST', json: {} }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
            navigate('/login');
        },
    });

    const navItems = [
        { to: '/app', label: 'Chat', icon: MessageSquare },
        { to: '/user/conversations', label: 'History', icon: Radio },
        { to: '/user/settings', label: 'Settings', icon: Settings },
        { to: '/subscription', label: 'Billing', icon: CreditCard },
        { to: '/mails', label: 'Mails', icon: Mail },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 lg:px-6">
                <aside className="hidden w-64 shrink-0 rounded-3xl border border-border/70 bg-card/80 p-4 lg:block">
                    <div className="mb-8">
                        <p className="text-lg font-semibold">KwatiAI</p>
                        <p className="text-sm text-muted-foreground">{session.data?.user?.email}</p>
                    </div>
                    <nav className="space-y-2">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                to={to}
                            >
                                <Icon className="size-4" />
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <Button className="mt-8 w-full justify-start" variant="outline" onClick={() => logout.mutate()}>
                        <LogOut className="mr-2 size-4" />
                        Sign out
                    </Button>
                </aside>
                <div className="min-w-0 flex-1 rounded-3xl border border-border/70 bg-card/60 p-4 sm:p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
