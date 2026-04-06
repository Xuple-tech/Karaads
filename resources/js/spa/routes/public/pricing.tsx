import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { apiRequest } from '@/spa/lib/api';

type PricingResponse = {
    plans: Array<{
        id: string;
        name: string;
        description?: string | null;
        monthly_price?: string | number | null;
        yearly_price?: string | number | null;
        requests_per_day?: number | null;
        tokens_per_day?: number | null;
        features?: string[];
        slug?: string;
    }>;
};

export function Component() {
    const plans = useQuery({
        queryKey: ['spa', 'pricing'],
        queryFn: () => apiRequest<PricingResponse>('/api/subscription/plans'),
        staleTime: 300_000,
    });

    return (
        <section className="mx-auto max-w-5xl px-6 py-20">
            {/* Header */}
            <div className="mx-auto max-w-2xl text-center mb-14">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    Simple, transparent pricing
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Choose the plan that fits your workflow. Upgrade or cancel anytime.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                    <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
                        <Link to="/register">Get started free</Link>
                    </Button>
                    <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground px-6">
                        <Link to="/login">Sign in</Link>
                    </Button>
                </div>
            </div>

            {/* Plan cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {plans.data?.plans?.map((plan) => {
                    const isPro = plan.slug === 'pro';
                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl border p-6 gap-5 ${
                                isPro
                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                    : 'border-border/50 bg-card'
                            }`}
                        >
                            {isPro && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold bg-primary text-primary-foreground px-3 py-0.5 rounded-full">
                                    Most popular
                                </span>
                            )}

                            <div>
                                <p className="text-lg font-semibold text-foreground">{plan.name}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {plan.description ?? 'Full access to chat and user tools.'}
                                </p>
                            </div>

                            <div>
                                <p className="text-4xl font-bold text-foreground">${plan.monthly_price ?? '0'}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">per month</p>
                                {plan.yearly_price && (
                                    <p className="text-xs text-primary mt-1">or ${plan.yearly_price}/year</p>
                                )}
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground flex-1">
                                <p className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                                    {plan.requests_per_day ?? 'Unlimited'} requests/day
                                </p>
                                <p className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                                    {plan.tokens_per_day ?? 'Unlimited'} tokens/day
                                </p>
                                {(plan.features ?? []).slice(0, 4).map((feature) => (
                                    <p key={feature} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                        {feature}
                                    </p>
                                ))}
                            </div>

                            <Button
                                asChild
                                className={`w-full ${isPro ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                                variant={isPro ? 'default' : 'outline'}
                            >
                                <Link to="/register">Get started</Link>
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-muted-foreground/60 mt-10">
                All plans include access to the full chat workspace. No hidden fees.
            </p>
        </section>
    );
}
