import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ChartNoAxesColumn, CreditCard, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';

type Plan = {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    monthly_price: number;
    yearly_price?: number | null;
    is_active: boolean;
    stripe_product_id?: string | null;
    stripe_monthly_price_id?: string | null;
    stripe_yearly_price_id?: string | null;
    entitlements: {
        capabilities: Array<{ key: string; label: string; enabled: boolean }>;
        quotas: Array<{ key: string; label: string; unit: string; daily?: number | null; monthly?: number | null; total?: number | null }>;
    };
    display_features: string[];
};

type Stats = {
    active_subscriptions: number;
    total_subscriptions: number;
    monthly_revenue_estimate: number;
    yearly_revenue_estimate: number;
    usage: {
        requests: number;
        tokens: number;
        images: number;
        voice_messages: number;
        emails_processed: number;
    };
};

interface Props {
    plan: Plan;
    stats: Stats;
}

export default function Show({ plan, stats }: Props) {
    const enabledCapabilities = plan.entitlements.capabilities.filter((capability) => capability.enabled);

    return (
        <AdminLayout>
            <Head title={`${plan.name} Subscription Plan`} />

            <div className="mx-auto max-w-6xl space-y-6">
                <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <Button asChild variant="ghost" className="w-fit px-0">
                            <Link href={route('admin.subscriptions.plans.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to plans
                            </Link>
                        </Button>
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
                                <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                                    {plan.is_active ? 'Published' : 'Hidden'}
                                </Badge>
                                <Badge variant="outline">{plan.slug}</Badge>
                            </div>
                            <p className="max-w-3xl text-sm text-muted-foreground">{plan.description || 'No description provided.'}</p>
                        </div>
                    </div>

                    <Button asChild>
                        <Link href={route('admin.subscriptions.plans.edit', plan.id)}>Edit plan</Link>
                    </Button>
                </section>

                <section className="grid gap-4 md:grid-cols-4">
                    <MetricCard title="Active Subscribers" value={stats.active_subscriptions} icon={Users} />
                    <MetricCard title="Total Subscribers" value={stats.total_subscriptions} icon={Users} />
                    <MetricCard title="Monthly Estimate" value={`$${stats.monthly_revenue_estimate.toFixed(2)}`} icon={CreditCard} />
                    <MetricCard title="Yearly Estimate" value={`$${stats.yearly_revenue_estimate.toFixed(2)}`} icon={ChartNoAxesColumn} />
                </section>

                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Capabilities</CardTitle>
                            <CardDescription>Enabled product capabilities for this plan.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {enabledCapabilities.length ? (
                                enabledCapabilities.map((capability) => (
                                    <Badge key={capability.key} variant="secondary">
                                        {capability.label}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No extra capabilities enabled.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Metadata</CardTitle>
                            <CardDescription>Stripe identifiers used for checkout and subscription syncing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <MetaRow label="Stripe Product ID" value={plan.stripe_product_id} />
                            <MetaRow label="Stripe Monthly Price ID" value={plan.stripe_monthly_price_id} />
                            <MetaRow label="Stripe Yearly Price ID" value={plan.stripe_yearly_price_id} />
                            <MetaRow label="Monthly Price" value={`$${Number(plan.monthly_price).toFixed(2)}`} />
                            <MetaRow label="Yearly Price" value={plan.yearly_price !== null && plan.yearly_price !== undefined ? `$${Number(plan.yearly_price).toFixed(2)}` : 'Not set'} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quota Summary</CardTitle>
                            <CardDescription>Structured quotas that drive enforcement and usage reporting.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {plan.entitlements.quotas.map((quota) => (
                                <div key={quota.key} className="rounded-xl border p-4">
                                    <p className="font-medium">{quota.label}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Daily: {quota.daily ?? 'Unlimited'} {quota.unit}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Monthly: {quota.monthly ?? 'Unlimited'} {quota.unit}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total: {quota.total ?? 'Unlimited'} {quota.unit}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Pressure</CardTitle>
                            <CardDescription>Current month activity across subscribers on this plan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <MetaRow label="Requests" value={stats.usage.requests.toLocaleString()} />
                            <MetaRow label="Tokens" value={stats.usage.tokens.toLocaleString()} />
                            <MetaRow label="Images" value={stats.usage.images.toLocaleString()} />
                            <MetaRow label="Voice Messages" value={stats.usage.voice_messages.toLocaleString()} />
                            <MetaRow label="Emails Processed" value={stats.usage.emails_processed.toLocaleString()} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}

function MetricCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    icon: typeof Users;
}) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between p-6">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-semibold">{value}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    );
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-mono text-xs">{value || 'Not set'}</span>
        </div>
    );
}
