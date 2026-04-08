import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Eye, HandCoins, Plus, Settings2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/AdminLayout';

type Plan = {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    monthly_price: number;
    yearly_price?: number | null;
    is_active: boolean;
    display_order: number;
    active_subscriptions_count: number;
    subscriptions_count: number;
    monthly_revenue_estimate: number;
    quota_summary: Record<string, { daily?: number | null; monthly?: number | null; label: string }>;
    entitlements: {
        capabilities: Array<{ key: string; label: string; enabled: boolean }>;
    };
};

interface Props {
    plans: Plan[];
}

export default function SubscriptionPlansIndex({ plans }: Props) {
    const [busyPlanId, setBusyPlanId] = useState<string | null>(null);

    const totalActiveSubscribers = plans.reduce((sum, plan) => sum + plan.active_subscriptions_count, 0);
    const totalMonthlyEstimate = plans.reduce((sum, plan) => sum + plan.monthly_revenue_estimate, 0);
    const activePlans = plans.filter((plan) => plan.is_active).length;

    const handleDelete = (plan: Plan) => {
        if (!confirm(`Delete ${plan.name}? This cannot be undone.`)) {
            return;
        }

        setBusyPlanId(plan.id);
        router.delete(route('admin.subscriptions.plans.destroy', plan.id), {
            preserveScroll: true,
            onFinish: () => setBusyPlanId(null),
        });
    };

    const handleToggle = (plan: Plan) => {
        setBusyPlanId(plan.id);
        router.patch(
            route('admin.subscriptions.plans.deactivate', plan.id),
            { is_active: !plan.is_active },
            {
                preserveScroll: true,
                onFinish: () => setBusyPlanId(null),
            }
        );
    };

    return (
        <AdminLayout>
            <Head title="Subscription Plans" />

            <div className="space-y-6">
                <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Manage pricing, structured entitlements, quotas, billing metadata, and plan visibility from one subscription module.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href={route('admin.subscriptions.plans.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create plan
                        </Link>
                    </Button>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <StatsCard title="Plans" value={plans.length} description={`${activePlans} active for new signups`} icon={HandCoins} />
                    <StatsCard title="Active Subscribers" value={totalActiveSubscribers} description="Current subscribers across all plans" icon={BarChart3} />
                    <StatsCard title="Monthly Estimate" value={`$${totalMonthlyEstimate.toFixed(2)}`} description="Based on active subscribers and monthly price" icon={Settings2} />
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle>Plan Catalog</CardTitle>
                        <CardDescription>Every plan now exposes quotas and capabilities through structured entitlements.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Pricing</TableHead>
                                    <TableHead>Quotas</TableHead>
                                    <TableHead>Capabilities</TableHead>
                                    <TableHead>Subscribers</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.map((plan) => {
                                    const enabledCapabilities = plan.entitlements.capabilities.filter((item) => item.enabled);

                                    return (
                                        <TableRow key={plan.id}>
                                            <TableCell className="align-top">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{plan.name}</p>
                                                        <Badge variant="outline">{plan.slug}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{plan.description || 'No description provided.'}</p>
                                                    <p className="text-xs text-muted-foreground">Display order: {plan.display_order}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="space-y-1 text-sm">
                                                    <p className="font-medium">${Number(plan.monthly_price).toFixed(2)} / month</p>
                                                    <p className="text-muted-foreground">
                                                        {plan.yearly_price !== null && plan.yearly_price !== undefined
                                                            ? `$${Number(plan.yearly_price).toFixed(2)} / year`
                                                            : 'No yearly price'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="space-y-1 text-sm text-muted-foreground">
                                                    <p>Requests: {formatQuota(plan.quota_summary.requests)}</p>
                                                    <p>Tokens: {formatQuota(plan.quota_summary.tokens)}</p>
                                                    <p>Images: {formatQuota(plan.quota_summary.images)}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="flex max-w-xs flex-wrap gap-2">
                                                    {enabledCapabilities.length ? (
                                                        enabledCapabilities.map((capability) => (
                                                            <Badge key={capability.key} variant="secondary">
                                                                {capability.label}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No extra capabilities</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="space-y-1 text-sm">
                                                    <p className="font-medium">{plan.active_subscriptions_count} active</p>
                                                    <p className="text-muted-foreground">{plan.subscriptions_count} total</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                                                    {plan.is_active ? 'Published' : 'Hidden'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <div className="flex justify-end gap-2">
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={route('admin.subscriptions.plans.show', plan.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={route('admin.subscriptions.plans.edit', plan.id)}>
                                                            <Settings2 className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={busyPlanId === plan.id}
                                                        onClick={() => handleToggle(plan)}
                                                    >
                                                        {plan.is_active ? 'Hide' : 'Publish'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={busyPlanId === plan.id}
                                                        onClick={() => handleDelete(plan)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

function StatsCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    description: string;
    icon: typeof HandCoins;
}) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between p-6">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-semibold">{value}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    );
}

function formatQuota(quota?: { daily?: number | null; monthly?: number | null }) {
    if (!quota) {
        return 'Unlimited';
    }

    const parts = [];

    if (quota.daily) {
        parts.push(`${quota.daily}/day`);
    }

    if (quota.monthly) {
        parts.push(`${quota.monthly}/month`);
    }

    return parts.length ? parts.join(', ') : 'Unlimited';
}
