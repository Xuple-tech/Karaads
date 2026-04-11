import { useMutation, useQuery } from '@tanstack/react-query';
import {
    AlertCircle,
    CalendarClock,
    Check,
    CheckCircle2,
    CreditCard,
    Gift,
    Wallet,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ApiError, apiRequest } from '@/spa/lib/api';

// ─── types ────────────────────────────────────────────────────────────────────

type ProviderId = 'stripe' | 'paystack';

type PaymentProvider = {
    id: ProviderId;
    label: string;
    currency: string;
};

type Capability = {
    key: string;
    label: string;
    enabled: boolean;
};

type Plan = {
    id: string;
    name: string;
    description?: string | null;
    monthly_price?: number | string | null;
    yearly_price?: number | string | null;
    slug?: string;
    features?: string[];
    capabilities?: Capability[];
};

type UsageResponse = {
    daily: {
        requests_used: number;
        requests_limit?: number | null;
        tokens_used: number;
        tokens_limit?: number | null;
        images_generated?: number;
        images_limit?: number | null;
    };
    monthly: {
        requests_used: number;
        requests_limit?: number | null;
        tokens_used: number;
        tokens_limit?: number | null;
        images_generated?: number;
        images_limit?: number | null;
    };
};

type MySubscriptionResponse = {
    subscription?: {
        status?: string;
        billing_period?: 'monthly' | 'yearly' | string | null;
        is_trial?: boolean;
        payment_method?: string | null;
        renews_at?: string | null;
    } | null;
    plan?: Plan | null;
    usage?: {
        today?: { widget_requests?: number };
        monthly?: { widget_requests?: number };
        limits?: {
            widget_requests_per_month?: number | null;
            widgets_total?: number | null;
        };
    } | null;
    paymentProviders?: PaymentProvider[];
};

type PlansResponse = {
    plans: Plan[];
    paymentProviders?: PaymentProvider[];
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatPrice(value: number | string | null | undefined): string {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n) || n <= 0) return 'Free';
    return `$${n.toFixed(0)}`;
}

function formatLimit(used: number, limit?: number | null): string {
    return `${used.toLocaleString()} / ${limit ? limit.toLocaleString() : 'Unlimited'}`;
}

function formatPercent(used: number, limit?: number | null): number {
    if (!limit || limit <= 0) return 0;
    return Math.min(100, (used / limit) * 100);
}

function formatRenewalDate(value?: string | null): string {
    if (!value) return 'Auto-renew enabled';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'Auto-renew enabled';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

// ─── sub-components ───────────────────────────────────────────────────────────

function UsageBar({ label, used, limit }: { label: string; used: number; limit?: number | null }) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[0.8rem] text-foreground">{label}</span>
                <span className="text-[0.75rem] text-muted-foreground">{formatLimit(used, limit)}</span>
            </div>
            <Progress value={formatPercent(used, limit)} className="h-1.5" />
        </div>
    );
}

// ─── main component ───────────────────────────────────────────────────────────

export function Component() {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedProvider, setSelectedProvider] = useState<ProviderId>('paystack');
    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    const plans = useQuery({
        queryKey: ['spa', 'subscription', 'plans'],
        queryFn: () => apiRequest<PlansResponse>('/api/subscription/plans'),
    });

    const mine = useQuery({
        queryKey: ['spa', 'subscription', 'mine'],
        queryFn: () => apiRequest<MySubscriptionResponse>('/api/subscription/my-subscription'),
    });

    const usage = useQuery({
        queryKey: ['spa', 'subscription', 'usage'],
        queryFn: () => apiRequest<UsageResponse>('/api/subscription/usage-stats'),
    });

    const paymentProviders = mine.data?.paymentProviders ?? plans.data?.paymentProviders ?? [];
    const providerIds = paymentProviders.map((p) => p.id);
    const providerMeta = paymentProviders.find((p) => p.id === selectedProvider);
    const currentPlanId = mine.data?.plan?.id;
    const currentSubscription = mine.data?.subscription;
    const paymentState = searchParams.get('payment');
    const paymentProvider = searchParams.get('provider');
    const paymentPlan = searchParams.get('plan');

    useEffect(() => {
        if (providerIds.length > 0 && !providerIds.includes(selectedProvider)) {
            setSelectedProvider(providerIds[0]);
        }
    }, [providerIds, selectedProvider]);

    const upgrade = useMutation({
        mutationFn: ({ planId, provider }: { planId: string; provider: ProviderId }) =>
            apiRequest<{ checkout_url?: string }>('/api/subscription/upgrade', {
                method: 'POST',
                json: { plan_id: planId, billing_period: billingPeriod, provider },
            }),
        onSuccess: (data) => { if (data.checkout_url) window.location.href = data.checkout_url; },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to start checkout.'),
    });

    const cancel = useMutation({
        mutationFn: () => apiRequest('/api/subscription/cancel', { method: 'POST', json: {} }),
        onSuccess: async () => {
            setError(null);
            await Promise.all([mine.refetch(), usage.refetch()]);
        },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to cancel subscription.'),
    });

    const portalMutation = useMutation({
        mutationFn: () => apiRequest<{ portal_url?: string }>('/api/subscription/billing-portal'),
        onSuccess: (data) => { if (data.portal_url) window.location.href = data.portal_url; },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to open billing portal.'),
    });

    const clearPaymentState = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('payment');
        next.delete('provider');
        next.delete('plan');
        setSearchParams(next, { replace: true });
    };

    return (
        <div className="mx-auto max-w-4xl space-y-10 py-2">

            {/* ── Page header ───────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing &amp; plans</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage your subscription, payment provider, and usage limits.
                </p>
            </div>

            {/* ── Banners ───────────────────────────────────── */}
            {currentSubscription?.is_trial && (
                <div className="flex items-start gap-3 rounded-xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/8 px-4 py-3 text-sm text-foreground">
                    <Gift className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
                    Trial active — upgrade before it ends to keep uninterrupted access.
                </div>
            )}

            {paymentState === 'success' && (
                <Alert className="rounded-xl border-emerald-500/25 bg-emerald-500/5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>Payment confirmed with {paymentProvider ?? 'your provider'}{paymentPlan ? ` for the ${paymentPlan} plan` : ''}.</span>
                        <button type="button" onClick={clearPaymentState} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Dismiss</button>
                    </AlertDescription>
                </Alert>
            )}

            {paymentState === 'failed' && (
                <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>Payment could not be completed. Try again or switch provider.</span>
                        <button type="button" onClick={clearPaymentState} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Dismiss</button>
                    </AlertDescription>
                </Alert>
            )}

            {paymentState === 'cancelled' && (
                <Alert className="rounded-xl border-border/60 bg-card">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>Checkout was cancelled.</span>
                        <button type="button" onClick={clearPaymentState} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Dismiss</button>
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* ── Plans ─────────────────────────────────────── */}
            <section>
                {/* Toggle + provider row */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Billing period */}
                    <div className="inline-flex rounded-xl border border-border/60 bg-card p-1">
                        {(['monthly', 'yearly'] as const).map((period) => (
                            <button
                                key={period}
                                type="button"
                                onClick={() => setBillingPeriod(period)}
                                className={`rounded-lg px-5 py-1.5 text-sm font-medium transition-colors ${
                                    billingPeriod === period
                                        ? 'bg-[#8b5cf6] text-white shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {period === 'monthly' ? 'Monthly' : 'Yearly'}
                            </button>
                        ))}
                    </div>

                    {/* Provider selector */}
                    {paymentProviders.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Pay with</span>
                            <div className="flex gap-1.5">
                                {paymentProviders.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setSelectedProvider(p.id)}
                                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                            selectedProvider === p.id
                                                ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/10 text-foreground'
                                                : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                                        }`}
                                    >
                                        {p.id === 'paystack' ? <Wallet className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Plan cards */}
                {plans.isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-72 animate-pulse rounded-2xl border border-border/50 bg-card" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-3">
                        {plans.data?.plans?.map((plan) => {
                            const price = billingPeriod === 'yearly' ? plan.yearly_price : plan.monthly_price;
                            const isCurrent = currentPlanId === plan.id;
                            const isFeatured = plan.slug === 'pro';
                            const allFeatures = [
                                ...(plan.features ?? []),
                                ...(plan.capabilities ?? []).filter((c) => c.enabled).map((c) => c.label),
                            ].slice(0, 5);

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col rounded-2xl border p-5 transition-colors ${
                                        isCurrent
                                            ? 'border-[#8b5cf6]/40 bg-[#8b5cf6]/5'
                                            : isFeatured
                                                ? 'border-[#8b5cf6]/25 bg-card'
                                                : 'border-border/50 bg-card'
                                    }`}
                                >
                                    {/* Popular badge */}
                                    {isFeatured && !isCurrent && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#8b5cf6] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                            Most popular
                                        </span>
                                    )}

                                    {/* Name + badge */}
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-[0.95rem] font-semibold text-foreground">{plan.name}</p>
                                        {isCurrent && (
                                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                                Current
                                            </span>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="mt-4">
                                        <p className="text-[2rem] font-semibold tracking-tight text-foreground leading-none">
                                            {formatPrice(price)}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            per {billingPeriod === 'yearly' ? 'year' : 'month'}
                                        </p>
                                    </div>

                                    {/* Features */}
                                    <ul className="mt-5 flex-1 space-y-2">
                                        {allFeatures.map((f) => (
                                            <li key={f} className="flex items-start gap-2 text-[0.8rem] text-muted-foreground">
                                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8b5cf6]" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <button
                                        type="button"
                                        disabled={isCurrent || upgrade.isPending || paymentProviders.length === 0}
                                        onClick={() => upgrade.mutate({ planId: plan.id, provider: selectedProvider })}
                                        className={`mt-5 w-full rounded-xl py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                            isCurrent
                                                ? 'border border-border bg-transparent text-muted-foreground'
                                                : isFeatured
                                                    ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                                                    : 'border border-border bg-transparent text-foreground hover:bg-accent'
                                        }`}
                                    >
                                        {isCurrent
                                            ? 'Current plan'
                                            : upgrade.isPending
                                                ? 'Redirecting…'
                                                : `Upgrade with ${providerMeta?.label ?? 'provider'}`}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Current subscription details ──────────────── */}
            {!mine.isLoading && (
                <section className="rounded-2xl border border-border/50 bg-card p-5">
                    <h2 className="text-sm font-semibold text-foreground">Subscription details</h2>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-border/40 bg-background/60 px-4 py-3">
                            <p className="text-[0.7rem] uppercase tracking-widest text-muted-foreground/60">Plan</p>
                            <p className="mt-1.5 text-sm font-medium text-foreground">{mine.data?.plan?.name ?? 'Free'}</p>
                        </div>
                        <div className="rounded-xl border border-border/40 bg-background/60 px-4 py-3">
                            <div className="flex items-center gap-1.5 text-[0.7rem] uppercase tracking-widest text-muted-foreground/60">
                                <CalendarClock className="h-3 w-3" />
                                Renewal
                            </div>
                            <p className="mt-1.5 text-sm font-medium text-foreground">{formatRenewalDate(currentSubscription?.renews_at)}</p>
                        </div>
                        <div className="rounded-xl border border-border/40 bg-background/60 px-4 py-3">
                            <div className="flex items-center gap-1.5 text-[0.7rem] uppercase tracking-widest text-muted-foreground/60">
                                <CreditCard className="h-3 w-3" />
                                Provider
                            </div>
                            <p className="mt-1.5 text-sm font-medium capitalize text-foreground">{currentSubscription?.payment_method ?? '—'}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {currentSubscription?.payment_method === 'stripe' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                disabled={portalMutation.isPending}
                                onClick={() => portalMutation.mutate()}
                            >
                                {portalMutation.isPending ? 'Opening…' : 'Manage billing'}
                            </Button>
                        )}
                        {mine.data?.plan?.slug !== 'free' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={cancel.isPending}
                                onClick={() => cancel.mutate()}
                            >
                                {cancel.isPending ? 'Cancelling…' : 'Cancel subscription'}
                            </Button>
                        )}
                    </div>

                    {currentSubscription?.payment_method === 'paystack' && (
                        <p className="mt-3 text-xs text-muted-foreground/60">
                            Paystack subscriptions are managed here. To change plan, start a new checkout above.
                        </p>
                    )}
                </section>
            )}

            {/* ── Usage ─────────────────────────────────────── */}
            {usage.data && (
                <section className="rounded-2xl border border-border/50 bg-card p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <Zap className="h-4 w-4 text-[#8b5cf6]" />
                        <h2 className="text-sm font-semibold text-foreground">Usage</h2>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <UsageBar label="Daily requests" used={usage.data.daily.requests_used} limit={usage.data.daily.requests_limit} />
                        <UsageBar label="Monthly requests" used={usage.data.monthly.requests_used} limit={usage.data.monthly.requests_limit} />
                        <UsageBar label="Daily tokens" used={usage.data.daily.tokens_used} limit={usage.data.daily.tokens_limit} />
                        <UsageBar
                            label="Widget requests this month"
                            used={mine.data?.usage?.monthly?.widget_requests ?? 0}
                            limit={mine.data?.usage?.limits?.widget_requests_per_month ?? null}
                        />
                    </div>
                </section>
            )}
        </div>
    );
}
