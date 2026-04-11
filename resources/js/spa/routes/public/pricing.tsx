import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

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

function formatPrice(value: string | number | null | undefined): string {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n) || n <= 0) return 'Free';
    return `$${n.toFixed(0)}`;
}

export function Component() {
    const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

    const plans = useQuery({
        queryKey: ['spa', 'pricing'],
        queryFn: () => apiRequest<PricingResponse>('/api/subscription/plans'),
        staleTime: 300_000,
    });

    return (
        <section className="mx-auto max-w-4xl px-6 py-20">

            {/* Header */}
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Simple, transparent pricing
                </h1>
                <p className="mt-3 text-base text-muted-foreground">
                    Choose the plan that fits your workflow. Upgrade or cancel anytime.
                </p>

                {/* Toggle */}
                <div className="mt-7 inline-flex rounded-xl border border-border/60 bg-card p-1">
                    {(['monthly', 'yearly'] as const).map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPeriod(p)}
                            className={`rounded-lg px-6 py-1.5 text-sm font-medium transition-colors ${
                                period === p
                                    ? 'bg-[#8b5cf6] text-white shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {p === 'monthly' ? 'Monthly' : 'Yearly'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards */}
            {plans.isLoading ? (
                <div className="grid gap-4 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-80 animate-pulse rounded-2xl border border-border/50 bg-card" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                    {plans.data?.plans?.map((plan) => {
                        const price = period === 'yearly' ? plan.yearly_price : plan.monthly_price;
                        const isFeatured = plan.slug === 'pro';
                        const features = [
                            ...(plan.features ?? []),
                            plan.requests_per_day ? `${plan.requests_per_day} requests/day` : 'Unlimited requests',
                            plan.tokens_per_day ? `${plan.tokens_per_day.toLocaleString()} tokens/day` : 'Unlimited tokens',
                        ].slice(0, 6);

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl border p-6 ${
                                    isFeatured
                                        ? 'border-[#8b5cf6]/35 bg-[#8b5cf6]/5'
                                        : 'border-border/50 bg-card'
                                }`}
                            >
                                {isFeatured && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#8b5cf6] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                        Most popular
                                    </span>
                                )}

                                <p className="text-[0.95rem] font-semibold text-foreground">{plan.name}</p>
                                <p className="mt-1 text-[0.8rem] text-muted-foreground line-clamp-2">
                                    {plan.description ?? 'Full access to chat and AI tools.'}
                                </p>

                                <div className="mt-5">
                                    <p className="text-[2rem] font-semibold tracking-tight text-foreground leading-none">
                                        {formatPrice(price)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        per {period === 'yearly' ? 'year' : 'month'}
                                    </p>
                                </div>

                                <ul className="mt-5 flex-1 space-y-2">
                                    {features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-[0.8rem] text-muted-foreground">
                                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8b5cf6]" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/register"
                                    className={`mt-5 block w-full rounded-xl py-2.5 text-center text-sm font-medium transition-all ${
                                        isFeatured
                                            ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                                            : 'border border-border text-foreground hover:bg-accent'
                                    }`}
                                >
                                    Get started
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="mt-10 text-center text-xs text-muted-foreground/40">
                All plans include access to the full chat workspace. No hidden fees.
            </p>
        </section>
    );
}
