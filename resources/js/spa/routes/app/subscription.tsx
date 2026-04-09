import { useMutation, useQuery } from '@tanstack/react-query';
import {
    AlertCircle,
    CalendarClock,
    CheckCircle2,
    CreditCard,
    Gift,
    Layers3,
    ShieldCheck,
    Sparkles,
    Star,
    Wallet,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ApiError, apiRequest } from '@/spa/lib/api';

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
        today?: {
            widget_requests?: number;
        };
        monthly?: {
            widget_requests?: number;
        };
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

function formatPrice(value: number | string | null | undefined): string {
    const amount = Number(value ?? 0);

    if (! Number.isFinite(amount) || amount <= 0) {
        return 'Free';
    }

    return `$${amount.toFixed(0)}`;
}

function formatLimit(used: number, limit?: number | null): string {
    return `${used} / ${limit ?? 'Unlimited'}`;
}

function formatPercent(used: number, limit?: number | null): number {
    if (! limit || limit <= 0) {
        return 0;
    }

    return Math.min(100, (used / limit) * 100);
}

function formatRenewalDate(value?: string | null): string {
    if (! value) {
        return 'Auto-renew enabled';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Auto-renew enabled';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function LoadingCard({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded-3xl border border-border/50 bg-card/70 ${className}`} />;
}

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
    const providerIds = paymentProviders.map((provider) => provider.id);
    const providerMeta = paymentProviders.find((provider) => provider.id === selectedProvider);
    const currentPlanId = mine.data?.plan?.id;
    const currentSubscription = mine.data?.subscription;
    const paymentState = searchParams.get('payment');
    const paymentProvider = searchParams.get('provider');
    const paymentPlan = searchParams.get('plan');
    const currentPriceLabel = billingPeriod === 'yearly'
        ? formatPrice(mine.data?.plan?.yearly_price)
        : formatPrice(mine.data?.plan?.monthly_price);

    useEffect(() => {
        if (providerIds.length === 0) {
            return;
        }

        if (! providerIds.includes(selectedProvider)) {
            setSelectedProvider(providerIds[0]);
        }
    }, [providerIds, selectedProvider]);

    const upgrade = useMutation({
        mutationFn: ({ planId, provider }: { planId: string; provider: ProviderId }) =>
            apiRequest<{ checkout_url?: string }>('/api/subscription/upgrade', {
                method: 'POST',
                json: {
                    plan_id: planId,
                    billing_period: billingPeriod,
                    provider,
                },
            }),
        onSuccess: (data) => {
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            }
        },
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
        onSuccess: (data) => {
            if (data.portal_url) {
                window.location.href = data.portal_url;
            }
        },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to open billing portal.'),
    });

    const clearPaymentState = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('payment');
        next.delete('provider');
        next.delete('plan');
        setSearchParams(next, { replace: true });
    };

    const isLoading = plans.isLoading || mine.isLoading || usage.isLoading;

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <section className="relative overflow-hidden rounded-[32px] border border-border/50 bg-card px-6 py-7 shadow-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_28%)]" />
                <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl space-y-4">
                        <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                            <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                            Account billing
                        </Badge>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                Manage your plan, payments, and usage in one place
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                                Upgrade with Stripe or Paystack, review your current limits, and keep billing under control without leaving the workspace.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-4 backdrop-blur">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current plan</p>
                            <p className="mt-2 text-lg font-semibold text-foreground">{mine.data?.plan?.name ?? 'Free'}</p>
                        </div>
                        <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-4 backdrop-blur">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Billing cycle</p>
                            <p className="mt-2 text-lg font-semibold capitalize text-foreground">{currentSubscription?.billing_period ?? 'monthly'}</p>
                        </div>
                        <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-4 backdrop-blur">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current price</p>
                            <p className="mt-2 text-lg font-semibold text-foreground">{currentPriceLabel}</p>
                        </div>
                    </div>
                </div>
            </section>

            {currentSubscription?.is_trial && (
                <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/8 px-4 py-3">
                    <Gift className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <p className="text-sm text-foreground">
                        Trial active. Upgrade before the trial ends to keep uninterrupted access.
                    </p>
                </div>
            )}

            {paymentState === 'success' && (
                <Alert className="rounded-2xl border-emerald-500/25 bg-emerald-500/5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>Payment confirmed with {paymentProvider ?? 'your provider'}{paymentPlan ? ` for the ${paymentPlan} plan` : ''}.</span>
                        <Button type="button" variant="ghost" size="sm" onClick={clearPaymentState}>Dismiss</Button>
                    </AlertDescription>
                </Alert>
            )}

            {paymentState === 'failed' && (
                <Alert variant="destructive" className="rounded-2xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>Payment could not be completed. Try again or switch provider.</span>
                        <Button type="button" variant="ghost" size="sm" onClick={clearPaymentState}>Dismiss</Button>
                    </AlertDescription>
                </Alert>
            )}

            {paymentState === 'cancelled' && (
                <Alert className="rounded-2xl border-border/60 bg-card">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>Checkout was cancelled before payment was completed.</span>
                        <Button type="button" variant="ghost" size="sm" onClick={clearPaymentState}>Dismiss</Button>
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive" className="rounded-2xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    <LoadingCard className="h-[760px]" />
                    <div className="space-y-6">
                        <LoadingCard className="h-[250px]" />
                        <LoadingCard className="h-[280px]" />
                        <LoadingCard className="h-[180px]" />
                    </div>
                </div>
            ) : (
                <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    <div className="space-y-6">
                        <section className="rounded-[32px] border border-border/50 bg-card p-6 shadow-sm">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-foreground">Plans and checkout</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Choose a billing cycle, pick a provider, and upgrade instantly.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {(['monthly', 'yearly'] as const).map((period) => (
                                        <Button
                                            key={period}
                                            type="button"
                                            variant={billingPeriod === period ? 'default' : 'outline'}
                                            onClick={() => setBillingPeriod(period)}
                                            className="rounded-full px-4"
                                        >
                                            {period === 'monthly' ? 'Monthly' : 'Yearly'}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 rounded-3xl border border-border/50 bg-background/60 p-4">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    <p className="text-sm font-medium text-foreground">Payment provider</p>
                                </div>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {paymentProviders.map((provider) => (
                                        <button
                                            key={provider.id}
                                            type="button"
                                            onClick={() => setSelectedProvider(provider.id)}
                                            className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                                                selectedProvider === provider.id
                                                    ? 'border-primary bg-primary/7 text-foreground'
                                                    : 'border-border/50 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    {provider.id === 'paystack' ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                                    <span className="text-sm font-medium">{provider.label}</span>
                                                </div>
                                                {selectedProvider === provider.id && (
                                                    <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">Selected</Badge>
                                                )}
                                            </div>
                                            <p className="mt-2 text-xs">Checkout currency: {provider.currency}</p>
                                        </button>
                                    ))}

                                    {paymentProviders.length === 0 && (
                                        <div className="rounded-2xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
                                            No payment provider is configured yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                                {plans.data?.plans?.map((plan) => {
                                    const price = billingPeriod === 'yearly' ? plan.yearly_price : plan.monthly_price;
                                    const isCurrent = currentPlanId === plan.id;
                                    const isFeatured = plan.slug === 'pro';
                                    const enabledCapabilities = (plan.capabilities ?? []).filter((capability) => capability.enabled).slice(0, 3);

                                    return (
                                        <div
                                            key={plan.id}
                                            className={`flex h-full flex-col rounded-[28px] border p-5 ${
                                                isCurrent
                                                    ? 'border-primary bg-primary/5'
                                                    : isFeatured
                                                        ? 'border-primary/35 bg-card'
                                                        : 'border-border/50 bg-card'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-lg font-semibold text-foreground">{plan.name}</p>
                                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                        {plan.description ?? 'AI access with plan-based limits.'}
                                                    </p>
                                                </div>
                                                {isCurrent ? (
                                                    <Badge className="rounded-full bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">Current</Badge>
                                                ) : isFeatured ? (
                                                    <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">Popular</Badge>
                                                ) : null}
                                            </div>

                                            <div className="mt-5">
                                                <p className="text-3xl font-semibold tracking-tight text-foreground">{formatPrice(price)}</p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    per {billingPeriod === 'yearly' ? 'year' : 'month'}
                                                </p>
                                            </div>

                                            <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                                                {(plan.features ?? []).slice(0, 4).map((feature) => (
                                                    <div key={feature} className="flex items-start gap-2">
                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                                {enabledCapabilities.map((capability) => (
                                                    <div key={capability.key} className="flex items-start gap-2">
                                                        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                                        <span>{capability.label}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                className="mt-6 w-full"
                                                variant={isCurrent ? 'outline' : 'default'}
                                                disabled={isCurrent || upgrade.isPending || paymentProviders.length === 0}
                                                onClick={() => upgrade.mutate({ planId: plan.id, provider: selectedProvider })}
                                            >
                                                {isCurrent
                                                    ? 'Current plan'
                                                    : upgrade.isPending
                                                        ? 'Redirecting to checkout...'
                                                        : `Pay with ${providerMeta?.label ?? 'provider'}`}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-[32px] border border-border/50 bg-card p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current subscription</p>
                                    <h2 className="mt-2 text-2xl font-semibold text-foreground">{mine.data?.plan?.name ?? 'Free plan'}</h2>
                                </div>
                                <Badge variant="outline" className="rounded-full capitalize">
                                    {currentSubscription?.status ?? 'active'}
                                </Badge>
                            </div>

                            <div className="mt-5 space-y-3">
                                <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3">
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                        <Wallet className="h-3.5 w-3.5" />
                                        Billing provider
                                    </div>
                                    <p className="mt-2 text-sm font-medium capitalize text-foreground">{currentSubscription?.payment_method ?? 'none'}</p>
                                </div>
                                <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3">
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                        <CalendarClock className="h-3.5 w-3.5" />
                                        Renewal
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-foreground">{formatRenewalDate(currentSubscription?.renews_at)}</p>
                                </div>
                                <div className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3">
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                        <Layers3 className="h-3.5 w-3.5" />
                                        Widget allowance
                                    </div>
                                    <p className="mt-2 text-sm font-medium text-foreground">{mine.data?.usage?.limits?.widgets_total ?? 'Unlimited'} active widgets</p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {currentSubscription?.payment_method === 'stripe' && (
                                    <Button variant="outline" disabled={portalMutation.isPending} onClick={() => portalMutation.mutate()}>
                                        {portalMutation.isPending ? 'Opening portal...' : 'Manage billing'}
                                    </Button>
                                )}
                                {mine.data?.plan?.slug !== 'free' && (
                                    <Button
                                        variant="ghost"
                                        disabled={cancel.isPending}
                                        onClick={() => cancel.mutate()}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        {cancel.isPending ? 'Cancelling...' : 'Cancel subscription'}
                                    </Button>
                                )}
                            </div>

                            {currentSubscription?.payment_method === 'paystack' && (
                                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                    Paystack subscriptions are managed here in Kwati. To change plan, start a new checkout from the plan cards.
                                </p>
                            )}
                        </section>

                        {usage.data && (
                            <section className="rounded-[32px] border border-border/50 bg-card p-6 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" />
                                    <h2 className="text-lg font-semibold text-foreground">Usage overview</h2>
                                </div>

                                <div className="mt-5 space-y-5">
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-foreground">Daily requests</span>
                                            <span className="text-muted-foreground">{formatLimit(usage.data.daily.requests_used, usage.data.daily.requests_limit)}</span>
                                        </div>
                                        <Progress value={formatPercent(usage.data.daily.requests_used, usage.data.daily.requests_limit)} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-foreground">Monthly requests</span>
                                            <span className="text-muted-foreground">{formatLimit(usage.data.monthly.requests_used, usage.data.monthly.requests_limit)}</span>
                                        </div>
                                        <Progress value={formatPercent(usage.data.monthly.requests_used, usage.data.monthly.requests_limit)} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-foreground">Daily tokens</span>
                                            <span className="text-muted-foreground">{formatLimit(usage.data.daily.tokens_used, usage.data.daily.tokens_limit)}</span>
                                        </div>
                                        <Progress value={formatPercent(usage.data.daily.tokens_used, usage.data.daily.tokens_limit)} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="text-foreground">Widget requests this month</span>
                                            <span className="text-muted-foreground">
                                                {mine.data?.usage?.monthly?.widget_requests ?? 0} / {mine.data?.usage?.limits?.widget_requests_per_month ?? 'Unlimited'}
                                            </span>
                                        </div>
                                        <Progress
                                            value={formatPercent(
                                                mine.data?.usage?.monthly?.widget_requests ?? 0,
                                                mine.data?.usage?.limits?.widget_requests_per_month ?? null,
                                            )}
                                            className="h-2"
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="rounded-[32px] border border-border/50 bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-foreground">Billing notes</h2>
                            <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                                <p>Pay with Stripe or Paystack depending on what fits your market and checkout preference.</p>
                                <p>Usage resets according to your active plan limits. Unlimited plans continue to show as open-ended.</p>
                                <p>Stripe subscriptions support the billing portal. Paystack purchases are activated after successful payment verification.</p>
                            </div>
                        </section>
                    </div>
                </section>
            )}
        </div>
    );
}
