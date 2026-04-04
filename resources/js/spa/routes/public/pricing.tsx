import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="mx-auto max-w-3xl text-center">
                <Badge className="mb-4 rounded-full px-4 py-1.5">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Billing
                </Badge>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Simple plans for chat, voice, and the user workspace.</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    The SPA now uses the same billing backend, but the public pricing page has been restored to a fuller marketing layout.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                    <Button asChild size="lg">
                        <Link to="/register">Create account</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link to="/login">Sign in</Link>
                    </Button>
                </div>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
                {plans.data?.plans?.map((plan) => (
                    <Card className={`rounded-3xl border-border/70 ${plan.slug === 'pro' ? 'border-primary shadow-lg shadow-primary/10' : ''}`} key={plan.id}>
                        <CardHeader className="space-y-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                {plan.slug === 'pro' ? <Badge>Popular</Badge> : null}
                            </div>
                            <CardDescription>{plan.description ?? 'Subscription access for chat and user tools.'}</CardDescription>
                            <div>
                                <p className="text-4xl font-bold">${plan.monthly_price ?? '0'}</p>
                                <p className="text-sm text-muted-foreground">Monthly billing</p>
                                {plan.yearly_price ? (
                                    <p className="mt-1 text-sm text-primary">or ${plan.yearly_price} yearly</p>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" />
                                    <span>{plan.requests_per_day ?? 'Unlimited'} requests per day</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" />
                                    <span>{plan.tokens_per_day ?? 'Unlimited'} tokens per day</span>
                                </div>
                                {(plan.features ?? []).slice(0, 4).map((feature) => (
                                    <div className="flex items-center gap-2" key={feature}>
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                            <Button asChild className="w-full" variant={plan.slug === 'pro' ? 'default' : 'outline'}>
                                <Link to="/register">Get started</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
