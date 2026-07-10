import '../css/app.css';

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from '@/layouts/app-layout';
import AdsPortalLayout from '@/layouts/ads-portal-layout';
import { initializeTheme } from '@/hooks/use-appearance';
import { initializeEcho } from '@/utils/echo';
import ErrorBoundary from '@/error-boundry';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { CallProvider } from '@/contexts/call-context';
import { CallModalRedesigned } from '@/components/calls/call-modal-redesigned';
import SystemMaintenancePopup from '@/components/system-maintenance-popup';

// Pages (eagerly loaded as per requirement)
import SearchPage from '@/pages/app/search';
import KwatiAiPage from '@/pages/app/kwati-ai';
import Messages from '@/pages/app/messages';
import BusinessPages from '@/pages/app/business-pages';
import Moments from '@/pages/app/moments';
import Profile from '@/pages/app/profile';
import MonetizationPage from '@/pages/app/monetization';
import PostShow from '@/pages/Post/Show';
import PostCreate from '@/pages/app/post/create';
import StoryCreate from '@/pages/app/stories-create';
import Notifications from '@/pages/app/notifications';
import Earn from '@/pages/Earn/Index';
import LiveIndex from '@/pages/app/live/index';
import LiveHost from '@/pages/app/live/host';
import LiveShow from '@/pages/app/live/show';
import Dashboard from './pages/dashboard';
const Onboarding = React.lazy(() => import('@/pages/onboarding'));
const HashtagPage = React.lazy(() => import('@/pages/app/hashtag'));

const AdsIndex = React.lazy(() => import('@/pages/app/ads/index'));
const AdsCreate = React.lazy(() => import('@/pages/app/ads/create'));
const AdsShow = React.lazy(() => import('@/pages/app/ads/show'));
const AdsEdit = React.lazy(() => import('@/pages/app/ads/edit'));
const AdsPortalIndex = React.lazy(() => import('@/pages/ads-portal/index'));
const AdsPortalCreate = React.lazy(() => import('@/pages/ads-portal/create'));
const AdsPortalShow = React.lazy(() => import('@/pages/ads-portal/show'));
const AdsPortalEdit = React.lazy(() => import('@/pages/ads-portal/edit'));

// Settings Pages
const SettingsProfile = React.lazy(() => import('@/pages/settings/profile'));
const SettingsVerification = React.lazy(() => import('@/pages/settings/verification'));
const SettingsPassword = React.lazy(() => import('@/pages/settings/password'));
const SettingsAppearance = React.lazy(() => import('@/pages/settings/appearance'));
const SettingsPrivacy = React.lazy(() => import('@/pages/settings/privacy'));
const SettingsTwoFactor = React.lazy(() => import('@/pages/settings/two-factor'));
const SettingsAccountDeletion = React.lazy(() => import('@/pages/settings/account-deletion'));

const AccountDeletionInfo = React.lazy(() => import('@/pages/account-deletion-info'));
const AccountDeletionRequest = React.lazy(() => import('@/pages/account-deletion-request'));
const AccountDeletionConfirm = React.lazy(() => import('@/pages/account-deletion-confirm'));

// Auth pages
const Landing = React.lazy(() => import('@/pages/Landing'));
const Login = React.lazy(() => import('@/pages/auth/login'));
const Register = React.lazy(() => import('@/pages/auth/register'));
const ForgotPassword = React.lazy(() => import('@/pages/auth/forgot-password'));
const ResetPassword = React.lazy(() => import('@/pages/auth/reset-password'));
const VerifyEmail = React.lazy(() => import('@/pages/auth/verify-email'));
const AccountActivation = React.lazy(() => import('@/pages/auth/account-activation'));
const EmailVerificationOtp = React.lazy(() => import('@/pages/auth/email-verification-otp'));
const TermsOfService = React.lazy(() => import('@/pages/terms-of-service'));
const PrivacyPolicy = React.lazy(() => import('@/pages/privacy-policy'));
const CSAEPolicy = React.lazy(() => import('@/pages/csae-policy'));

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { auth } = useAuth();
    const location = useLocation();

    if (!auth?.user) {
        return <Navigate to="/login" replace />;
    }

    const isOnboardingRoute = location.pathname === '/onboarding';
    const onboardingComplete = Boolean(auth.user.onboarding_complete);

    if (!onboardingComplete && !isOnboardingRoute) {
        return <Navigate to="/onboarding" replace />;
    }

    if (onboardingComplete && isOnboardingRoute) {
        return <Navigate to="/app" replace />;
    }

    if (isOnboardingRoute) {
        return <>{children}</>;
    }

    const isHomeRoute = location.pathname === '/app';
    const isProfileRoute = location.pathname.startsWith('/@') || location.pathname === '/profile';
    const isPostViewRoute = location.pathname.startsWith('/posts/');
    const isMessagesRoute = location.pathname === '/messages' || location.pathname.startsWith('/messages/');
    const isBusinessPagesRoute = location.pathname === '/pages' || location.pathname.startsWith('/pages/');
    const isMessageConversationRoute = location.pathname.startsWith('/messages/');
    const isKwatiAiRoute = location.pathname === '/kwati-ai';
    const isAdsCreateRoute = location.pathname === '/ads/create';
    const isAdsEditRoute = /^\/ads\/[^/]+\/edit$/.test(location.pathname);
    const isFocusedAdsFormRoute = isAdsCreateRoute || isAdsEditRoute;
    const isLiveViewerRoute = /^\/live\/[^/]+$/.test(location.pathname);
    const isLiveHostRoute = /^\/live\/[^/]+\/host$/.test(location.pathname);
    const hideLiveChrome = isLiveViewerRoute || isLiveHostRoute;

    return (
        <AppLayout
            hideTopNav={isHomeRoute || isProfileRoute || isPostViewRoute || isMessagesRoute || isBusinessPagesRoute || isKwatiAiRoute || hideLiveChrome}
            hideTopNavOnSmall={isFocusedAdsFormRoute}
            hideMobileNav={isPostViewRoute || isMessageConversationRoute || isKwatiAiRoute || hideLiveChrome}
        >
            {children}
        </AppLayout>
    );
}

function AdsPortalProtectedRoute({ children }: { children: React.ReactNode }) {
    const { auth } = useAuth();
    const location = useLocation();

    if (!auth?.user) {
        return <Navigate to="/login" replace />;
    }

    const isOnboardingRoute = location.pathname === '/onboarding';
    const onboardingComplete = Boolean(auth.user.onboarding_complete);

    if (!onboardingComplete && !isOnboardingRoute) {
        return <Navigate to="/onboarding" replace />;
    }

    if (onboardingComplete && isOnboardingRoute) {
        return <Navigate to="/app" replace />;
    }

    return <AdsPortalLayout>{children}</AdsPortalLayout>;
}

// Public Route Component (redirects to app if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { auth } = useAuth();

    if (auth?.user) {
        return <Navigate to="/app" replace />;
    }

    return <>{children}</>;
}

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const { token } = useParams<{ token: string }>();
    return <ResetPassword token={token || ''} email={searchParams.get('email') || ''} />;
}

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    return <VerifyEmail status={searchParams.get('status') || undefined} />;
}

function AccountActivationPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const state = (location.state ?? {}) as {
        email?: string;
        autoSendCode?: boolean;
    };
    const emailFromQuery = searchParams.get('email') || '';
    const autoFromQuery = searchParams.get('autoSendCode') === '1';
    const email = state.email || emailFromQuery;
    const autoSendCode = Boolean(state.autoSendCode || autoFromQuery);

    return (
        <AccountActivation
            email={email}
            autoSendCode={autoSendCode}
        />
    );
}

function EmailVerificationOtpPage() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const autoSendCode = searchParams.get('autoSendCode') === '1';

    return (
        <EmailVerificationOtp
            email={email}
            autoSendCode={autoSendCode}
        />
    );
}

function PostShowPage() {
    const { postId } = useParams<{ postId: string }>();
    return <PostShow postId={postId || ''} />;
}

function PostShowRoute() {
    return <PostShowPage />;
}

function ProfileRedirect() {
    const { auth, isLoading } = useAuth();

    if (isLoading) return null;

    if (!auth?.user) {
        return <Navigate to="/login" replace />;
    }

    if (!auth.user.username) {
        // console.log('ProfileRedirect: No username, rendering Profile directly');
        return <AppLayout hideTopNav><Profile /></AppLayout>;
    }

    // Redirect to username without @ (Profile component handles the routing)
    // console.log(`ProfileRedirect: Redirecting to /${auth.user.username}`);
    return <Navigate to={`/@${auth.user.username}`} replace />;
}

// Wrapper to handle public profile routes with @username
function PublicProfileWrapper() {
    const location = useLocation();
    // Check if this is a profile route (starts with /@)
    if (location.pathname.startsWith('/@')) {
        return (
            <AppLayout hideTopNav>
                <Profile />
            </AppLayout>
        );
    }
    // Otherwise render a catch-all (shouldn't happen with this route)
    return null;
}

// App Loading Skeleton
function AppLoadingSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Skeleton */}
            <div className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex gap-6 max-w-7xl mx-auto p-4">
                {/* Sidebar Skeleton */}
                <div className="w-64 space-y-4 hidden lg:block">
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                </div>

                {/* Feed Skeleton */}
                <div className="flex-1 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border border-border rounded-lg p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-20 w-full rounded" />
                            <div className="flex gap-4">
                                <Skeleton className="h-8 flex-1 rounded" />
                                <Skeleton className="h-8 flex-1 rounded" />
                                <Skeleton className="h-8 flex-1 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Sidebar Skeleton */}
                <div className="w-64 space-y-4 hidden lg:block">
                    <Skeleton className="h-40 w-full rounded" />
                    <Skeleton className="h-40 w-full rounded" />
                </div>
            </div>
        </div>
    );
}

function AccountDeletionConfirmPage() {
    const { token } = useParams<{ token: string }>();
    return <AccountDeletionConfirm token={token || ''} />;
}

// Create QueryClient instance
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
        },
    },
});

const IS_MANAGER_PORTAL_HOST =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'manager' || window.location.hostname.startsWith('manager.'));

function AppRoot() {
    const { auth, isLoading } = useAuth();

    useEffect(() => {
        // Initialize Laravel Echo only for authenticated sessions.
        if (auth?.user?.id) {
            initializeEcho();
        }
    }, [auth?.user?.id]);

    if (isLoading) {
        return <AppLoadingSkeleton />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <CallProvider>
                <SystemMaintenancePopup />
                <ErrorBoundary>
                    <Router>
                        <Suspense fallback={<AppLoadingSkeleton />}>
                        <Routes>
                        {/* Public Routes */}
                        <Route
                            path="/"
                            element={
                                IS_MANAGER_PORTAL_HOST ? (
                                    <AdsPortalProtectedRoute>
                                        <AdsPortalIndex />
                                    </AdsPortalProtectedRoute>
                                ) : (
                                    <PublicRoute>
                                        <Landing />
                                    </PublicRoute>
                                )
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login canResetPassword={true} canRegister={true} />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/forgot-password"
                            element={
                                <PublicRoute>
                                    <ForgotPassword />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/reset-password/:token"
                            element={
                                <PublicRoute>
                                    <ResetPasswordPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/reset-password"
                            element={
                                <PublicRoute>
                                    <Navigate to="/forgot-password" replace />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/verify-email"
                            element={
                                <PublicRoute>
                                    <VerifyEmailPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/auth/me/confirm/v0"
                            element={
                                <PublicRoute>
                                    <AccountActivationPage />
                                </PublicRoute>
                            }
                        />
                        <Route path="/auth/verify-email/otp" element={<EmailVerificationOtpPage />} />
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/csae-policy" element={<CSAEPolicy />} />
                        <Route path="/account-deletion" element={<AccountDeletionInfo />} />
                        <Route path="/delete-account" element={<AccountDeletionRequest />} />
                        <Route path="/delete-account/:token" element={<AccountDeletionConfirmPage />} />

                        {/* Protected Routes */}
                        <Route
                            path="/app"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/onboarding"
                            element={
                                <ProtectedRoute>
                                    <Onboarding />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/app/moments"
                            element={
                                <ProtectedRoute>
                                    <Moments />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/search"
                            element={
                                <ProtectedRoute>
                                    <SearchPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/kwati-ai"
                            element={
                                <ProtectedRoute>
                                    <KwatiAiPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/hashtag/:tag"
                            element={
                                <ProtectedRoute>
                                    <HashtagPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/browse"
                            element={
                                <ProtectedRoute>
                                    <SearchPage />
                                </ProtectedRoute>
                            }
                        />
                    <Route
                        path="/messages/*"
                        element={
                            <ProtectedRoute>
                                <Messages />
                            </ProtectedRoute>
                        }
                    />
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <Notifications />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/pages"
                            element={
                                <ProtectedRoute>
                                    <BusinessPages />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/pages/:slug"
                            element={
                                <ProtectedRoute>
                                    <BusinessPages />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/earn"
                            element={
                                <ProtectedRoute>
                                    <Earn />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/monetization"
                            element={
                                <ProtectedRoute>
                                    <MonetizationPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/live"
                            element={
                                <ProtectedRoute>
                                    <LiveIndex />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/live/:streamId/host"
                            element={
                                <ProtectedRoute>
                                    <LiveHost />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/live/:streamId"
                            element={
                                <ProtectedRoute>
                                    <LiveShow />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/ads"
                            element={
                                <ProtectedRoute>
                                    <AdsIndex />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/ads/create"
                            element={
                                <ProtectedRoute>
                                    <AdsCreate />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/ads/:creativeId"
                            element={
                                <ProtectedRoute>
                                    <AdsShow />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/ads/:creativeId/edit"
                            element={
                                <ProtectedRoute>
                                    <AdsEdit />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager-ads"
                            element={
                                <AdsPortalProtectedRoute>
                                    <AdsPortalIndex />
                                </AdsPortalProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager-ads/create"
                            element={
                                <AdsPortalProtectedRoute>
                                    <AdsPortalCreate />
                                </AdsPortalProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager-ads/:creativeId"
                            element={
                                <AdsPortalProtectedRoute>
                                    <AdsPortalShow />
                                </AdsPortalProtectedRoute>
                            }
                        />
                        <Route
                            path="/manager-ads/:creativeId/edit"
                            element={
                                <AdsPortalProtectedRoute>
                                    <AdsPortalEdit />
                                </AdsPortalProtectedRoute>
                            }
                        />
                        <Route
                            path="/post/create"
                            element={
                                <ProtectedRoute>
                                    <PostCreate />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/app/stories/create"
                            element={
                                <ProtectedRoute>
                                    <StoryCreate />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/posts/:postId" element={<PostShowRoute />} />
                        <Route path="/profile" element={<ProfileRedirect />} />

                        {/* Settings Routes */}
                        <Route
                            path="/settings/profile"
                            element={
                                <ProtectedRoute>
                                    <SettingsProfile mustVerifyEmail={false} />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/verification"
                            element={
                                <ProtectedRoute>
                                    <SettingsVerification />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/password"
                            element={
                                <ProtectedRoute>
                                    <SettingsPassword />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/appearance"
                            element={
                                <ProtectedRoute>
                                    <SettingsAppearance />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/privacy"
                            element={
                                <ProtectedRoute>
                                    <SettingsPrivacy />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/two-factor"
                            element={
                                <ProtectedRoute>
                                    <SettingsTwoFactor />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/account-deletion"
                            element={
                                <ProtectedRoute>
                                    <SettingsAccountDeletion />
                                </ProtectedRoute>
                            }
                        />

                        {IS_MANAGER_PORTAL_HOST && (
                            <>
                                <Route
                                    path="/create"
                                    element={
                                        <AdsPortalProtectedRoute>
                                            <AdsPortalCreate />
                                        </AdsPortalProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/:creativeId/edit"
                                    element={
                                        <AdsPortalProtectedRoute>
                                            <AdsPortalEdit />
                                        </AdsPortalProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/:creativeId"
                                    element={
                                        <AdsPortalProtectedRoute>
                                            <AdsPortalShow />
                                        </AdsPortalProtectedRoute>
                                    }
                                />
                            </>
                        )}

                        {/* Catch-all for anything not matched - handles /@username and other server-side routes */}
                        <Route path="*" element={<PublicProfileWrapper />} />
                        </Routes>
                    </Suspense>
                    </Router>
                    <CallModalRedesigned />
                </ErrorBoundary>
            </CallProvider>
        </QueryClientProvider>
    );
}

// Render app
const root = createRoot(document.getElementById('app')!);
root.render(
    <StrictMode>
        <AuthProvider>
            <AppRoot />
        </AuthProvider>
    </StrictMode>,
);

// This will set light / dark mode on load...
initializeTheme();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.getRegistrations()
            .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
            .catch(() => undefined);

        if ('caches' in window) {
            caches.keys()
                .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
                .catch(() => undefined);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        const appLoader = document.querySelector('.loading');
        if (appLoader) {
            setTimeout(() => {
                appLoader.remove();
            }, 0);
        }
    }, 0);
});
