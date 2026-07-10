import HeadingSmall from '@/components/heading-small';
import { Head, Link, usePage } from '@/components/page-head';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/axios';
import SettingsLayout from '@/layouts/settings/layout';
import { type SharedData } from '@/types';
import { BadgeCheck, CreditCard, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const BADGE_FEE_NAIRA = 5000;
const BADGE_FEE_LABEL = `N${BADGE_FEE_NAIRA.toLocaleString()}`;

interface VerificationRequest {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    category: 'creator' | 'public_figure' | 'brand' | 'business';
    full_name: string;
    contact_email: string;
    reason: string;
    portfolio_url?: string | null;
    social_url?: string | null;
    payment_status?: string | null;
    payment_provider?: string | null;
    payment_reference?: string | null;
    paid_at?: string | null;
    review_notes?: string | null;
    created_at?: string | null;
}

const coerceString = (value: unknown, fallback = ''): string =>
    typeof value === 'string' ? value : fallback;

export default function VerificationPayment() {
    const page = usePage<Partial<SharedData>>();
    const { setAuth } = useAuth();
    const authUser =
        page.props?.auth && typeof page.props.auth === 'object' && page.props.auth?.user
            ? page.props.auth.user
            : null;

    const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<'paystack' | 'verify' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [form, setForm] = useState({
        category: 'creator',
        full_name: coerceString(authUser?.name),
        contact_email: coerceString(authUser?.email),
        reason: 'I want to verify my Karaads profile and protect my public identity on the platform.',
        portfolio_url: '',
        social_url: '',
    });

    const hasActiveBadge = Boolean(authUser?.is_verified || authUser?.has_verification_badge);
    const badgeGrantedAt = coerceString(authUser?.kara_verified_at);
    const badgeExpiresAt = coerceString(authUser?.kara_verified_expires_at);
    const badgeExpiresDate = badgeExpiresAt ? new Date(badgeExpiresAt) : null;
    const badgeExpiryIsValid = badgeExpiresDate instanceof Date && !Number.isNaN(badgeExpiresDate.getTime());
    const badgeExpiryLabel = badgeExpiryIsValid && badgeExpiresDate
        ? badgeExpiresDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
        : 'not set';
    const badgeHasExpired = Boolean(
        badgeGrantedAt &&
        badgeExpiryIsValid &&
        badgeExpiresDate !== null &&
        badgeExpiresDate.getTime() <= Date.now() &&
        !hasActiveBadge
    );
    const canPay = badgeHasExpired || (!hasActiveBadge && (!verificationRequest || verificationRequest.status === 'rejected' || verificationRequest.payment_status !== 'paid'));

    const loadVerificationRequest = async () => {
        try {
            const response = await axiosInstance.get('/api/users/verification-request');
            const request = response.data?.data ?? null;
            setVerificationRequest(request);
            if (request) {
                setForm((current) => ({
                    ...current,
                    category: request.category || current.category,
                    full_name: request.full_name || current.full_name,
                    contact_email: request.contact_email || current.contact_email,
                    reason: request.reason || current.reason,
                    portfolio_url: request.portfolio_url || current.portfolio_url,
                    social_url: request.social_url || current.social_url,
                }));
            }
        } catch {
            setVerificationRequest(null);
        } finally {
            setLoading(false);
        }
    };

    const syncAuthenticatedUser = async () => {
        try {
            const response = await axiosInstance.get('/api/users/profile');
            const user = response.data?.data ?? response.data ?? null;
            if (user) {
                setAuth({ user });
            }
        } catch {
            // Leave the current auth state unchanged if the refresh fails.
        }
    };

    useEffect(() => {
        void loadVerificationRequest();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('verification_payment') !== 'paystack') return;

        const reference = params.get('reference') || undefined;
        setSubmitting('verify');
        setSuccess('Checking your Paystack payment...');
        setError(null);

        axiosInstance
            .post('/api/users/verification-request/paystack/verify', { reference })
            .then(async (response) => {
                const request = response.data?.data ?? null;
                setVerificationRequest(request);
                if (request?.payment_status === 'paid') {
                    await syncAuthenticatedUser();
                }
                setSuccess(response.data?.message ?? 'Payment checked.');
            })
            .catch((err) => {
                setSuccess(null);
                setError(err?.response?.data?.message || 'Unable to verify Paystack payment yet.');
            })
            .finally(() => {
                setSubmitting(null);
                window.history.replaceState({}, '', window.location.pathname);
            });
    }, []);

    const submitPayment = async () => {
        setSubmitting('paystack');
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance.post('/api/users/verification-request', {
                ...form,
                payment_method: 'paystack',
            });

            setVerificationRequest(response.data?.data ?? null);

            if (response.data?.authorization_url) {
                setSuccess('Redirecting to Paystack...');
                window.location.assign(response.data.authorization_url);
                return;
            }

            setSuccess(response.data?.message ?? 'Payment complete.');
        } catch (err: any) {
            const errors = err?.response?.data?.errors;
            const firstValidationError = errors
                ? Object.values(errors).flat().find((value) => typeof value === 'string')
                : null;
            setError(firstValidationError || err?.response?.data?.message || 'Unable to start payment.');
        } finally {
            setSubmitting(null);
        }
    };

    const verifyPaystack = async () => {
        setSubmitting('verify');
        setError(null);
        setSuccess(null);

        try {
            const response = await axiosInstance.post('/api/users/verification-request/paystack/verify', {
                reference: verificationRequest?.payment_reference,
            });
            const request = response.data?.data ?? null;
            setVerificationRequest(request);
            if (request?.payment_status === 'paid') {
                await syncAuthenticatedUser();
            }
            setSuccess(response.data?.message ?? 'Payment checked.');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Unable to verify Paystack payment.');
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <>
            <Head title="Kara Verified payment" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Kara Verified"
                        description={`Pay ${BADGE_FEE_LABEL} to activate or renew your verified badge for 30 days.`}
                    />

                    <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
                        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                                <BadgeCheck className="h-4 w-4" />
                                Badge payment
                            </div>
                            <h1 className="mt-4 text-3xl font-black">{BADGE_FEE_LABEL}</h1>
                            <p className="mt-2 max-w-2xl text-sm text-white/75">
                                Pay securely with Paystack. After successful payment, your Kara Verified badge becomes active automatically.
                            </p>
                        </div>

                        <div className="space-y-5 p-5">
                            {loading ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading badge status...
                                </div>
                            ) : null}

                            {hasActiveBadge ? (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                                    Your Kara Verified badge is active. It expires on {badgeExpiryLabel}. You can renew when it expires.
                                </div>
                            ) : badgeHasExpired ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                                    Your Kara Verified badge expired on {badgeExpiryLabel}. Renew for {BADGE_FEE_LABEL} to activate it for another 30 days.
                                </div>
                            ) : null}

                            {verificationRequest ? (
                                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm">
                                    <p className="font-semibold">Current request</p>
                                    <p className="mt-1 text-muted-foreground">
                                        Status: {verificationRequest.status}. Payment: {verificationRequest.payment_status || 'not paid'}
                                        {verificationRequest.payment_provider ? ` via ${verificationRequest.payment_provider}` : ''}.
                                    </p>
                                    {verificationRequest.payment_provider === 'paystack' && verificationRequest.payment_status !== 'paid' ? (
                                        <Button type="button" variant="outline" className="mt-3" onClick={verifyPaystack} disabled={submitting !== null}>
                                            {submitting === 'verify' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Verify Paystack payment
                                        </Button>
                                    ) : null}
                                </div>
                            ) : null}

                            {canPay ? (
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="verification-category">Account type</Label>
                                            <select
                                                id="verification-category"
                                                value={form.category}
                                                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                            >
                                                <option value="creator">Creator</option>
                                                <option value="public_figure">Public figure</option>
                                                <option value="brand">Brand</option>
                                                <option value="business">Business</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="verification-full-name">Full name</Label>
                                            <Input id="verification-full-name" value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="verification-contact-email">Contact email</Label>
                                            <Input id="verification-contact-email" type="email" value={form.contact_email} onChange={(event) => setForm((current) => ({ ...current, contact_email: event.target.value }))} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="verification-social-url">Social or website link</Label>
                                            <Input id="verification-social-url" value={form.social_url} onChange={(event) => setForm((current) => ({ ...current, social_url: event.target.value }))} placeholder="https://..." />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="verification-reason">Verification note</Label>
                                        <textarea
                                            id="verification-reason"
                                            value={form.reason}
                                            onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                                            className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        />
                                    </div>

                                    {error ? <p className="text-sm text-red-500">{error}</p> : null}
                                    {success ? <p className="text-sm text-green-600">{success}</p> : null}

                                    <div className="grid gap-3">
                                        <Button type="button" size="lg" onClick={() => void submitPayment()} disabled={submitting !== null} className="h-14 rounded-2xl">
                                            {submitting === 'paystack' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                                            {badgeHasExpired ? `Renew ${BADGE_FEE_LABEL} with Paystack` : `Pay ${BADGE_FEE_LABEL} with Paystack`}
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            Badge payments and renewals are processed through Paystack only.
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            <Button asChild type="button" variant="ghost">
                                <Link href="/settings/profile">Back to profile settings</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </>
    );
}
