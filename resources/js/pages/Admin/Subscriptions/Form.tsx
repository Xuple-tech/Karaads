import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CreditCard, ShieldCheck, SlidersHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';

type CapabilityDefinition = {
    key: string;
    label: string;
    description: string;
};

type QuotaDefinition = {
    key: string;
    label: string;
    description: string;
    unit: string;
};

type Plan = {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    monthly_price: number;
    yearly_price?: number | null;
    stripe_product_id?: string | null;
    stripe_monthly_price_id?: string | null;
    stripe_yearly_price_id?: string | null;
    is_active: boolean;
    display_order: number;
    entitlements: {
        capabilities: Array<{ key: string; enabled: boolean }>;
        quotas: Array<{ key: string; daily?: number | null; monthly?: number | null; total?: number | null }>;
    };
};

interface Props {
    plan?: Plan | null;
    isEditing?: boolean;
    capabilityDefinitions: CapabilityDefinition[];
    quotaDefinitions: QuotaDefinition[];
}

export default function PlanForm({ plan, isEditing = false, capabilityDefinitions, quotaDefinitions }: Props) {
    const capabilityState = capabilityDefinitions.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.key] = plan?.entitlements.capabilities.find((capability) => capability.key === item.key)?.enabled ?? false;
        return acc;
    }, {});

    const quotaState = quotaDefinitions.reduce<Record<string, { daily: string; monthly: string; total: string }>>((acc, item) => {
        const existing = plan?.entitlements.quotas.find((quota) => quota.key === item.key);
        acc[item.key] = {
            daily: existing?.daily ? String(existing.daily) : '',
            monthly: existing?.monthly ? String(existing.monthly) : '',
            total: existing?.total ? String(existing.total) : '',
        };
        return acc;
    }, {});

    const form = useForm({
        name: plan?.name || '',
        slug: plan?.slug || '',
        description: plan?.description || '',
        monthly_price: plan?.monthly_price !== undefined ? String(plan.monthly_price) : '0',
        yearly_price: plan?.yearly_price !== null && plan?.yearly_price !== undefined ? String(plan.yearly_price) : '',
        stripe_product_id: plan?.stripe_product_id || '',
        stripe_monthly_price_id: plan?.stripe_monthly_price_id || '',
        stripe_yearly_price_id: plan?.stripe_yearly_price_id || '',
        is_active: plan?.is_active ?? true,
        display_order: plan?.display_order !== undefined ? String(plan.display_order) : '0',
        capabilities: capabilityState,
        quotas: quotaState,
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        const payload = {
            ...form.data,
            yearly_price: form.data.yearly_price === '' ? null : Number(form.data.yearly_price),
            monthly_price: Number(form.data.monthly_price),
            display_order: Number(form.data.display_order),
            quotas: Object.fromEntries(
                Object.entries(form.data.quotas).map(([key, value]) => [
                    key,
                    {
                        daily: value.daily === '' ? null : Number(value.daily),
                        monthly: value.monthly === '' ? null : Number(value.monthly),
                        total: value.total === '' ? null : Number(value.total),
                    },
                ])
            ),
        };

        if (isEditing && plan?.id) {
            form.transform(() => payload).put(route('admin.subscriptions.plans.update', plan.id));
            return;
        }

        form.transform(() => payload).post(route('admin.subscriptions.plans.store'));
    };

    return (
        <AdminLayout>
            <Head title={isEditing ? `Edit ${plan?.name}` : 'Create Subscription Plan'} />

            <form onSubmit={submit} className="mx-auto max-w-6xl space-y-6">
                <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <Button asChild variant="ghost" className="w-fit px-0">
                            <Link href={route('admin.subscriptions.plans.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to plans
                            </Link>
                        </Button>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isEditing ? `Edit ${plan?.name}` : 'Create Subscription Plan'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Configure pricing, structured entitlements, quota limits, and billing metadata from one editor.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant={form.data.is_active ? 'default' : 'secondary'}>
                            {form.data.is_active ? 'Published' : 'Hidden'}
                        </Badge>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Saving...' : isEditing ? 'Save changes' : 'Create plan'}
                        </Button>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plan Identity</CardTitle>
                                <CardDescription>Set the commercial identity and ordering for this plan.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <Field label="Plan Name" error={form.errors.name}>
                                    <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                                </Field>
                                <Field label="Slug" error={form.errors.slug} hint="Internal identifier used in billing and logic.">
                                    <Input
                                        value={form.data.slug}
                                        onChange={(event) => form.setData('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                    />
                                </Field>
                                <Field label="Description" error={form.errors.description} className="md:col-span-2">
                                    <Textarea
                                        rows={4}
                                        value={form.data.description}
                                        onChange={(event) => form.setData('description', event.target.value)}
                                    />
                                </Field>
                                <Field label="Display Order" error={form.errors.display_order}>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={form.data.display_order}
                                        onChange={(event) => form.setData('display_order', event.target.value)}
                                    />
                                </Field>
                                <div className="flex items-center justify-between rounded-xl border p-4 md:col-span-2">
                                    <div>
                                        <Label className="font-medium">Visible for new subscriptions</Label>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Hidden plans stay assigned to existing subscribers but are removed from new signup flows.
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={form.data.is_active}
                                        onCheckedChange={(checked) => form.setData('is_active', Boolean(checked))}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Capabilities
                                </CardTitle>
                                <CardDescription>Choose which product capabilities this plan unlocks.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 md:grid-cols-2">
                                {capabilityDefinitions.map((capability) => (
                                    <label key={capability.key} className="flex items-start justify-between gap-4 rounded-xl border p-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">{capability.label}</p>
                                            <p className="text-sm text-muted-foreground">{capability.description}</p>
                                        </div>
                                        <Checkbox
                                            checked={form.data.capabilities[capability.key]}
                                            onCheckedChange={(checked) =>
                                                form.setData('capabilities', {
                                                    ...form.data.capabilities,
                                                    [capability.key]: Boolean(checked),
                                                })
                                            }
                                        />
                                    </label>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Quotas and Limits
                                </CardTitle>
                                <CardDescription>Leave a field blank to mark that quota as unlimited.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {quotaDefinitions.map((quota) => (
                                    <div key={quota.key} className="rounded-xl border p-4">
                                        <div className="mb-4">
                                            <p className="font-medium">{quota.label}</p>
                                            <p className="text-sm text-muted-foreground">{quota.description}</p>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <Field label="Daily limit">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder={`Unlimited ${quota.unit}`}
                                                    value={form.data.quotas[quota.key]?.daily ?? ''}
                                                    onChange={(event) => updateQuota(form, quota.key, 'daily', event.target.value)}
                                                />
                                            </Field>
                                            <Field label="Monthly limit">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder={`Unlimited ${quota.unit}`}
                                                    value={form.data.quotas[quota.key]?.monthly ?? ''}
                                                    onChange={(event) => updateQuota(form, quota.key, 'monthly', event.target.value)}
                                                />
                                            </Field>
                                            <Field label="Total limit">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder={`Unlimited ${quota.unit}`}
                                                    value={form.data.quotas[quota.key]?.total ?? ''}
                                                    onChange={(event) => updateQuota(form, quota.key, 'total', event.target.value)}
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing</CardTitle>
                                <CardDescription>Set list pricing for the plan.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <Field label="Monthly Price" error={form.errors.monthly_price}>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.data.monthly_price}
                                        onChange={(event) => form.setData('monthly_price', event.target.value)}
                                    />
                                </Field>
                                <Field label="Yearly Price" error={form.errors.yearly_price} hint="Leave blank if yearly billing is not offered.">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.data.yearly_price}
                                        onChange={(event) => form.setData('yearly_price', event.target.value)}
                                    />
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Stripe Metadata
                                </CardTitle>
                                <CardDescription>Store the Stripe product and price IDs used for checkout.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <Field label="Stripe Product ID" error={form.errors.stripe_product_id}>
                                    <Input
                                        value={form.data.stripe_product_id}
                                        onChange={(event) => form.setData('stripe_product_id', event.target.value)}
                                    />
                                </Field>
                                <Field label="Stripe Monthly Price ID" error={form.errors.stripe_monthly_price_id}>
                                    <Input
                                        value={form.data.stripe_monthly_price_id}
                                        onChange={(event) => form.setData('stripe_monthly_price_id', event.target.value)}
                                    />
                                </Field>
                                <Field label="Stripe Yearly Price ID" error={form.errors.stripe_yearly_price_id}>
                                    <Input
                                        value={form.data.stripe_yearly_price_id}
                                        onChange={(event) => form.setData('stripe_yearly_price_id', event.target.value)}
                                    />
                                </Field>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Publishing Notes</CardTitle>
                                <CardDescription>The admin module now treats structured entitlements as the source of truth.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>Capability toggles drive feature access across the app.</p>
                                <p>Quota fields drive request, token, and image limits across billing and enforcement flows.</p>
                                <p>Legacy plan columns are still mirrored for compatibility during rollout.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

function Field({
    label,
    error,
    hint,
    className,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <Label className="mb-2 block">{label}</Label>
            {children}
            {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
            {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
        </div>
    );
}

function updateQuota(
    form: any,
    key: string,
    period: 'daily' | 'monthly' | 'total',
    value: string
) {
    form.setData('quotas', {
        ...form.data.quotas,
        [key]: {
            ...form.data.quotas[key],
            [period]: value,
        },
    });
}
