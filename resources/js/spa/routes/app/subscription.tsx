import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, CreditCard, Gift, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiError, apiRequest } from '@/spa/lib/api';

type Plan = {
    id: string;
    name: string;
    description?: string | null;
    monthly_price?: number | string | null;
    yearly_price?: number | string | null;
    requests_per_day?: number | null;
    tokens_per_day?: number | null;
};

type UsageBucket = {
    requests_used: number;
    requests_limit?: number | null;
    tokens_used: number;
    tokens_limit?: number | null;
};

export function Component() {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
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
        onSuccess: (data) => {
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            }
        },
        onError: (mutationError) => setError(mutationError instanceof ApiError ? mutationError.message : 'Failed to upgrade plan.'),
    });

    const cancel = useMutation({
        mutationFn: () => apiRequest('/api/subscription/cancel', { method: 'POST', json: {} }),
        onSuccess: async () => {
            setError(null);
            await Promise.all([mine.refetch(), usage.refetch()]);
        },
        onError: (mutationError) => setError(mutationError instanceof ApiError ? mutationError.message : 'Failed to cancel subscription.'),
    });

    const currentPlanId = mine.data?.plan?.id;
    const currentSubscription = mine.data?.subscription;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Subscription & Billing</h1>
                <p className="text-muted-foreground">The richer billing workspace is back on the SPA runtime, using the existing Laravel subscription APIs.</p>
            </div>

            {currentSubscription?.is_trial ? (
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                    <Gift className="h-4 w-4" />
                    <AlertDescription>Trial active. Upgrade anytime to keep access after the trial ends.</AlertDescription>
                </Alert>
            ) : null}

            {error ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            {mine.data?.plan ? (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle>Current plan</CardTitle>
                                <CardDescription>Your active subscription details</CardDescription>
                            </div>
                            <Badge variant="outline">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {mine.data.subscription?.status ?? 'active'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Plan</p>
                            <p className="text-2xl font-semibold">{mine.data.plan.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Billing period</p>
                            <p className="text-lg font-medium capitalize">{mine.data.subscription?.billing_period ?? 'monthly'}</p>
                        </div>
                        <div className="flex items-end justify-end">
                            <Button disabled={cancel.isPending} onClick={() => cancel.mutate()} variant="outline">
                                {cancel.isPending ? <span className="mr-2 inline-block h-4 w-4 shrink-0 animate-pulse rounded bg-current/30" /> : <CreditCard className="mr-2 h-4 w-4" />}
                                Cancel subscription
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {usage.data ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Usage statistics
                        </CardTitle>
                        <CardDescription>Daily and monthly usage snapshots.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        {(['daily', 'monthly'] as const).map((period) => (
                            <div className="space-y-4" key={period}>
                                <h3 className="font-medium capitalize">{period}</h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span>Requests</span>
                                            <span>{usage.data[period].requests_used} / {usage.data[period].requests_limit ?? 'Unlimited'}</span>
                                        </div>
                                        <Progress value={usage.data[period].requests_limit ? (usage.data[period].requests_used / usage.data[period].requests_limit) * 100 : 0} />
                                    </div>
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span>Tokens</span>
                                            <span>{usage.data[period].tokens_used} / {usage.data[period].tokens_limit ?? 'Unlimited'}</span>
                                        </div>
                                        <Progress value={usage.data[period].tokens_limit ? (usage.data[period].tokens_used / usage.data[period].tokens_limit) * 100 : 0} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : null}

            <Tabs defaultValue="plans">
                <TabsList>
                    <TabsTrigger value="plans">Plans</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>

                <TabsContent className="mt-6" value="plans">
                    <div className="mb-4 flex gap-2">
                        <Button onClick={() => setBillingPeriod('monthly')} variant={billingPeriod === 'monthly' ? 'default' : 'outline'}>
                            Monthly
                        </Button>
                        <Button onClick={() => setBillingPeriod('yearly')} variant={billingPeriod === 'yearly' ? 'default' : 'outline'}>
                            Yearly
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {plans.data?.plans?.map((plan) => {
                            const price = billingPeriod === 'monthly' ? plan.monthly_price : plan.yearly_price;
                            const isCurrent = currentPlanId === plan.id;

                            return (
                                <Card className={isCurrent ? 'border-primary' : ''} key={plan.id}>
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <CardDescription>{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-3xl font-bold">${price}</p>
                                            <p className="text-sm text-muted-foreground">per {billingPeriod === 'monthly' ? 'month' : 'year'}</p>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <p className="flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-primary" />
                                                {plan.requests_per_day ?? 'Unlimited'} daily requests
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-primary" />
                                                {plan.tokens_per_day ?? 'Unlimited'} daily tokens
                                            </p>
                                        </div>
                                        <Button className="w-full" disabled={isCurrent || upgrade.isPending} onClick={() => upgrade.mutate(plan.id)}>
                                            {isCurrent ? 'Current plan' : 'Choose plan'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent className="mt-6" value="faq">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">How billing works</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Billing, renewals, and cancellations continue to run on Laravel checkout and subscription logic.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Usage limits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">The app blocks requests once the active daily or monthly limits are exceeded.</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
