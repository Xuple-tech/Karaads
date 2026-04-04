import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/spa/lib/api';

type PricingResponse = {
    plans: Array<{
        id: string;
        name: string;
        description?: string | null;
        monthly_price?: string | number | null;
    }>;
};

export function Component() {
    const plans = useQuery({
        queryKey: ['spa', 'pricing'],
        queryFn: () => apiRequest<PricingResponse>('/api/subscription/plans'),
        staleTime: 300_000,
    });

    return (
        <section className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-10 max-w-2xl space-y-3">
                <p className="text-sm uppercase tracking-[0.3em] text-primary">Pricing</p>
                <h1 className="text-4xl font-semibold">Plans available through the JSON billing API.</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {plans.data?.plans?.map((plan) => (
                    <article key={plan.id} className="rounded-3xl border border-border/70 bg-card p-6">
                        <h2 className="text-xl font-semibold">{plan.name}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{plan.description ?? 'Subscription access for chat and user tools.'}</p>
                        <p className="mt-6 text-3xl font-semibold">${plan.monthly_price ?? '0'}</p>
                        <p className="text-sm text-muted-foreground">Monthly</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
