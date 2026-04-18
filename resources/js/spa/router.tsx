import { createBrowserRouter, useRouteError } from 'react-router-dom';

import { AppLayout, GuestOnly, ProtectedOnly, PublicLayout } from '@/spa/routes/layouts';

function RouteErrorPage() {
    const error = useRouteError() as { status?: number; statusText?: string } | null;
    const is404 = error?.status === 404;
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
            <p className="text-7xl font-bold text-foreground/10">{error?.status ?? (is404 ? 404 : 'Error')}</p>
            <h1 className="mt-4 text-xl font-semibold text-foreground">{is404 ? 'Page not found' : (error?.statusText ?? 'Something went wrong')}</h1>
            <button onClick={() => window.history.back()} className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors">Go back</button>
        </div>
    );
}

function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
            <p className="text-7xl font-bold text-foreground/10">404</p>
            <h1 className="mt-4 text-xl font-semibold text-foreground">Page not found</h1>
            <button onClick={() => window.history.back()} className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors">Go back</button>
        </div>
    );
}

export const router = createBrowserRouter([
    // ── Public marketing pages (with nav header) ──
    {
        element: <PublicLayout />,
        errorElement: <RouteErrorPage />,
        children: [
            { path: '/', lazy: () => import('@/spa/routes/public/home') },
            { path: '/pricing', lazy: () => import('@/spa/routes/public/pricing') },
            { path: '/subscription/pricing', lazy: () => import('@/spa/routes/public/pricing') },
            { path: '/privacy', lazy: () => import('@/spa/routes/public/privacy') },
            { path: '/privacy-policy', lazy: () => import('@/spa/routes/public/privacy') },
            { path: '/terms', lazy: () => import('@/spa/routes/public/terms') },
            { path: '/terms-of-service', lazy: () => import('@/spa/routes/public/terms') },
            { path: '/share/:token', lazy: () => import('@/spa/routes/public/shared-conversation') },
        ],
    },

    // ── Auth pages (no nav header — AuthLayout provides its own) ──
    {
        element: <GuestOnly />,
        errorElement: <RouteErrorPage />,
        children: [
            { path: '/login', lazy: () => import('@/spa/routes/auth/login') },
            { path: '/register', lazy: () => import('@/spa/routes/auth/register') },
            { path: '/forgot-password', lazy: () => import('@/spa/routes/auth/forgot-password') },
            { path: '/reset-password/:token', lazy: () => import('@/spa/routes/auth/reset-password') },
        ],
    },
    {
        element: <ProtectedOnly />,
        errorElement: <RouteErrorPage />,
        children: [
            { path: '/verify-email', lazy: () => import('@/spa/routes/auth/verify-email') },
            { path: '/confirm-password', lazy: () => import('@/spa/routes/auth/confirm-password') },
        ],
    },

    // ── Authenticated app ──
    {
        element: <ProtectedOnly />,
        errorElement: <RouteErrorPage />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: '/app', lazy: () => import('@/spa/routes/app/chat-home') },
                    { path: '/new', lazy: () => import('@/spa/routes/app/chat-home') },
                    { path: '/dashboard', lazy: () => import('@/spa/routes/app/chat-home') },
                    { path: '/c/new', lazy: () => import('@/spa/routes/app/chat-home') },
                    { path: '/c/:conversationId', lazy: () => import('@/spa/routes/app/conversation') },
                    { path: '/voice-chat', lazy: () => import('@/spa/routes/app/voice') },
                    { path: '/c/:conversationId/voice', lazy: () => import('@/spa/routes/app/voice') },
                    { path: '/automations', lazy: () => import('@/spa/routes/app/automations') },
                    { path: '/widget', lazy: () => import('@/spa/routes/app/widget-list') },
                    { path: '/widget/:widgetId/settings', lazy: () => import('@/spa/routes/app/widget-settings') },
                    { path: '/mails', lazy: () => import('@/spa/routes/app/automations') },
                    { path: '/emails/*', lazy: () => import('@/spa/routes/app/feature-placeholder') },
                    { path: '/meta', lazy: () => import('@/spa/routes/app/automations') },
                    { path: '/meta/dashboard', lazy: () => import('@/spa/routes/app/automations') },
                    { path: '/meta/accounts/:accountId', lazy: () => import('@/spa/routes/app/meta-account') },
                    { path: '/meta/accounts/:accountId/setup', lazy: () => import('@/spa/routes/app/meta-setup') },
                    { path: '/meta/accounts/:accountId/conversations/:conversationId', lazy: () => import('@/spa/routes/app/meta-account') },
                    { path: '/meta/accounts/:accountId/preferences', lazy: () => import('@/spa/routes/app/meta-preferences') },
                    { path: '/meta/accounts/:accountId/templates', lazy: () => import('@/spa/routes/app/meta-templates') },
                    { path: '/meta/accounts/:accountId/broadcast', lazy: () => import('@/spa/routes/app/meta-broadcast') },
                    { path: '/user/conversations', lazy: () => import('@/spa/routes/app/conversations') },
                    { path: '/user/settings', lazy: () => import('@/spa/routes/app/settings') },
                    { path: '/user/subscription', lazy: () => import('@/spa/routes/app/subscription') },
                    { path: '/subscription', lazy: () => import('@/spa/routes/app/subscription') },
                    { path: '/billing', lazy: () => import('@/spa/routes/app/subscription') },
                    { path: '/studio/*', lazy: () => import('@/spa/routes/app/feature-placeholder') },
                    { path: '/podcast/*', lazy: () => import('@/spa/routes/app/feature-placeholder') },
                ],
            },
        ],
    },

    // ── Catch-all 404 ──
    { path: '*', element: <NotFoundPage /> },
]);
