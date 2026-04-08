import { createBrowserRouter } from 'react-router-dom';

import { AppLayout, GuestOnly, ProtectedOnly, PublicLayout } from '@/spa/routes/layouts';

export const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            { path: '/', lazy: () => import('@/spa/routes/public/home') },
            { path: '/pricing', lazy: () => import('@/spa/routes/public/pricing') },
            { path: '/subscription/pricing', lazy: () => import('@/spa/routes/public/pricing') },
            { path: '/privacy', lazy: () => import('@/spa/routes/public/privacy') },
            { path: '/privacy-policy', lazy: () => import('@/spa/routes/public/privacy') },
            { path: '/terms', lazy: () => import('@/spa/routes/public/terms') },
            { path: '/terms-of-service', lazy: () => import('@/spa/routes/public/terms') },
            { path: '/share/:token', lazy: () => import('@/spa/routes/public/shared-conversation') },
            {
                element: <GuestOnly />,
                children: [
                    { path: '/login', lazy: () => import('@/spa/routes/auth/login') },
                    { path: '/register', lazy: () => import('@/spa/routes/auth/register') },
                    { path: '/forgot-password', lazy: () => import('@/spa/routes/auth/forgot-password') },
                    { path: '/reset-password/:token', lazy: () => import('@/spa/routes/auth/reset-password') },
                ],
            },
            {
                element: <ProtectedOnly />,
                children: [
                    { path: '/verify-email', lazy: () => import('@/spa/routes/auth/verify-email') },
                    { path: '/confirm-password', lazy: () => import('@/spa/routes/auth/confirm-password') },
                ],
            },
        ],
    },
    {
        element: <ProtectedOnly />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: '/doc-builder', lazy: () => import('@/spa/routes/app/doc-builder') },
                    { path: '/doc-builder/:sessionId', lazy: () => import('@/spa/routes/app/doc-builder') },
                    { path: '/app', lazy: () => import('@/spa/routes/app/chat-home') },
                    { path: '/new', lazy: () => import('@/spa/routes/app/chat-home') },
                    { path: '/dashboard', lazy: () => import('@/spa/routes/app/chat-home') },
                    { path: '/c/new', lazy: () => import('@/spa/routes/app/chat-home') },
                    { path: '/c/:conversationId', lazy: () => import('@/spa/routes/app/conversation') },
                    { path: '/voice-chat', lazy: () => import('@/spa/routes/app/voice') },
                    { path: '/c/:conversationId/voice', lazy: () => import('@/spa/routes/app/voice') },
                    { path: '/mails', lazy: () => import('@/spa/routes/app/feature-placeholder') },
                    { path: '/emails/*', lazy: () => import('@/spa/routes/app/feature-placeholder') },
                    { path: '/meta/*', lazy: () => import('@/spa/routes/app/feature-placeholder') },
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
]);
