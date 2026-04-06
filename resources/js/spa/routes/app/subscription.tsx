import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, CreditCard, Gift, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ApiError, apiRequest } from '@/spa/lib/api';

type Plan = {
    id: string;
    name: string;
    description?: string | null;
    monthly_price?: number | string | null;
    yearly_price?: number | string | null;
    requests_per_day?: number | null;
    tokens_per_day?: number | null;
    slug?: string;
};

type UsageBucket = {
    requests_used: number;
    requests_limit?: number | null;
    tokens_used: number;
    tokens_limit?: number | null;
};

export function Component() {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [activeTab, setActiveTab] = useState<'plans' | 'faq'>('plans');
    const [error, setError] = useState<string | null>(null);

    const plans = useQuery({
        queryKey: ['spa', 'subscription', 'plans'],
        queryFn: () => apiRequest<{ plans: Plan[] }>('/api/subscription/plans'),
    });

    const mine = useQuery({
        queryKey: ['spa', 'subscription', 'mine'],
        queryFn: () => apiRequest<any>('/api/subscription/my-subscription'),
    });

    const usage = useQuery({
        queryKey: ['spa', 'subscription', 'usage'],
        queryFn: () => apiRequest<{ daily: UsageBucket; monthly: UsageBucket }>('/api/subscription/usage-stats'),
    });

    const upgrade = useMutation({
        mutationFn: (planId: string) =>
            apiRequest<{ checkout_url?: string }>('/api/subscription/upgrade', {
                method: 'POST',
                json: { plan_id: planId, billing_period: billingPeriod },
            }),
        onSuccess: (data) => { if (data.checkout_url) window.location.href = data.checkout_url; },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to upgrade plan.'),
    });

    const cancel = useMutation({
        mutationFn: () => apiRequest('/api/subscription/cancel', { method: 'POST', json: {} }),
        onSuccess: async () => { setError(null); await Promise.all([mine.refetch(), usage.refetch()]); },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to cancel subscription.'),
    });

    const portalMutation = useMutation({
        mutationFn: () => apiRequest<{ portal_url?: string }>('/stripe/billing-portal'),
        onSuccess: (data) => { if (data.portal_url) window.location.href = data.portal_url; },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to open billing portal.'),
    });

    const currentPlanId = mine.data?.plan?.id;
    const currentSubscription = mine.data?.subscription;

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing</h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage your plan, usage, and payments.</p>
            </div>

            {/* Trial banner */}
            {currentSubscription?.is_trial && (
                <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3">
                    <Gift className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">Trial active — upgrade anytime to keep access after the trial ends.</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Current plan */}
            {mine.data?.plan && (
                <div className="rounded-xl border border-border/50 bg-card p-5">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Current plan</p>
                            <p className="text-xl font-semibold text-foreground">{mine.data.plan.name}</p>
                        </div>
                        <Badge variant="outline" className="gap-1.5 text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            {mine.data.subscription?.status ?? 'active'}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                        <p className="text-sm text-muted-foreground capitalize">
                            Billed {mine.data.subscription?.billing_period ?? 'monthly'}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={portalMutation.isPending}
                                onClick={() => portalMutation.mutate()}
                                className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 px-3 text-xs gap-1.5"
                            >
                                {portalMutation.isPending
                                    ? <span className="inline-block h-3 w-3 animate-pulse rounded bg-current/30" />
                                    : <CreditCard className="h-3.5 w-3.5" />}
                                Manage billing
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={cancel.isPending}
                                onClick={() => cancel.mutate()}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-3 text-xs gap-1.5"
                            >
                                {cancel.isPending
                                    ? <span className="inline-block h-3 w-3 animate-pulse rounded bg-current/30" />
                                    : null}
                                Cancel subscription
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Usage stats */}
            {usage.data && (
                <div className="rounded-xl border border-border/50 bg-card p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-medium text-foreground">Usage</h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {(['daily', 'monthly'] as const).map((period) => (
                            <div key={period} className="space-y-3">
                                <p className="text-xs font-medium text-muted-foreground capitalize">{period}</p>
                                <div className="space-y-2.5">
                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className="text-foreground/80">Requests</span>
                                            <span className="text-muted-foreground">
                                                {usage.data[period].requests_used} / {usage.data[period].requests_limit ?? '∞'}
                                            </span>
                                        </div>
                                        <Progress
                                            value={usage.data[period].requests_limit
                                                ? (usage.data[period].requests_used / usage.data[period].requests_limit!) * 100
                                                : 0}
                                            className="h-1.5"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className="text-foreground/80">Tokens</span>
                                            <span className="text-muted-foreground">
                                                {usage.data[period].tokens_used} / {usage.data[period].tokens_limit ?? '∞'}
                                            </span>
                                        </div>
                                        <Progress
                                            value={usage.data[period].tokens_limit
                                                ? (usage.data[period].tokens_used / usage.data[period].tokens_limit!) * 100
                                                : 0}
                                            className="h-1.5"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Plans / FAQ tabs */}
            <div>
                <div className="flex gap-1 border-b border-border/40 mb-6">
                    {(['plans', 'faq'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setActiveTab(t)}
                            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                                activeTab === t
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {activeTab === 'plans' && (
                    <div className="space-y-5">
                        {/* Billing period toggle */}
                        <div className="flex gap-1 p-1 rounded-lg bg-card/80 border border-border/40 w-fit">
                            {(['monthly', 'yearly'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setBillingPeriod(p)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                                        billingPeriod === p
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        {/* Plan cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {plans.data?.plans?.map((plan) => {
                                const price = billingPeriod === 'monthly' ? plan.monthly_price : plan.yearly_price;
                                const isCurrent = currentPlanId === plan.id;
                                const isPro = plan.slug === 'pro';

                                return (
                                    <div
                                        key={plan.id}
                                        className={`rounded-xl border p-5 flex flex-col gap-4 transition-colors ${
                                            isCurrent
                                                ? 'border-primary bg-primary/5'
                                                : isPro
                                                ? 'border-primary/40 bg-card'
                                                : 'border-border/50 bg-card'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-foreground">{plan.name}</p>
                                                {plan.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                                                )}
                                            </div>
                                            {isPro && !isCurrent && (
                                                <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full">Popular</span>
                                            )}
                                            {isCurrent && (
                                                <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full">Current</span>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-2xl font-bold text-foreground">${price ?? '0'}</p>
                                            <p className="text-xs text-muted-foreground">per {billingPeriod === 'monthly' ? 'month' : 'year'}</p>
                                        </div>

                                        <div className="space-y-1.5 text-xs text-muted-foreground">
                                            <p className="flex items-center gap-1.5">
                                                <Zap className="h-3.5 w-3.5 text-primary" />
                                                {plan.requests_per_day ?? 'Unlimited'} daily requests
                                            </p>
                                            <p className="flex items-center gap-1.5">
                                                <Zap className="h-3.5 w-3.5 text-primary" />
                                                {plan.tokens_per_day ?? 'Unlimited'} daily tokens
                                            </p>
                                        </div>

                                        <Button
                                            className="w-full mt-auto h-9 text-sm"
                                            variant={isCurrent ? 'outline' : 'default'}
                                            disabled={isCurrent || upgrade.isPending}
                                            onClick={() => upgrade.mutate(plan.id)}
                                        >
                                            {isCurrent ? 'Current plan' : 'Choose plan'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'faq' && (
                    <div className="space-y-4">
                        {[
                            { q: 'How does billing work?', a: 'Billing, renewals, and cancellations run on Stripe checkout and subscription logic. You are charged at the start of each billing period.' },
                            { q: 'What happens when I hit my usage limit?', a: 'The app blocks new requests once daily or monthly limits are reached. Limits reset at the start of each period.' },
                            { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. You can switch plans at any time. Changes take effect at the next billing cycle.' },
                            { q: 'How do I cancel?', a: 'Use the cancel button on your current plan above. Access continues until the end of the billing period.' },
                        ].map(({ q, a }) => (
                            <div key={q} className="rounded-xl border border-border/40 bg-card p-5">
                                <p className="text-sm font-medium text-foreground mb-1.5">{q}</p>
                                <p className="text-sm text-muted-foreground">{a}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
