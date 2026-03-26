import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const Create = ({ sites, plans, users, statuses, billingCycles, currencies }) => {
    const { data, setData, post, errors, processing } = useForm({
        site_id: '',
        plan_id: '',
        user_id: '',
        stripe_subscription_id: '',
        stripe_customer_id: '',
        status: 'active',
        billing_cycle: 'monthly',
        price: 0,
        currency: 'USD',
        starts_at: new Date().toISOString().split('T')[0],
        expires_at: '',
        canceled_at: '',
        trial_ends_at: '',
        metadata: {},
    });

    const [priceOverride, setPriceOverride] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.site-subscriptions.store'));
    };

    const handlePlanChange = (planId) => {
        setData('plan_id', planId);
        if (!priceOverride) {
            const selectedPlan = plans.find(plan => plan.id === parseInt(planId));
            if (selectedPlan) {
                const price = data.billing_cycle === 'yearly'
                    ? selectedPlan.yearly_price
                    : selectedPlan.monthly_price;
                setData('price', price);
            }
        }
    };

    const handleBillingCycleChange = (cycle) => {
        setData('billing_cycle', cycle);
        if (!priceOverride) {
            const selectedPlan = plans.find(plan => plan.id === parseInt(data.plan_id));
            if (selectedPlan) {
                const price = cycle === 'yearly'
                    ? selectedPlan.yearly_price
                    : selectedPlan.monthly_price;
                setData('price', price);
            }
        }
    };

    return (
        <AdminLayout>
            <Head title="Create Subscription" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Subscription</h1>
                    <p className="text-muted-foreground">
                        Create a new subscription for a site
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="site_id">Site *</Label>
                                    <Select value={data.site_id} onValueChange={(value) => setData('site_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sites.map(site => (
                                                <SelectItem key={site.id} value={site.id.toString()}>
                                                    {site.name} ({site.domain})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.site_id && <p className="text-sm text-red-600">{errors.site_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="plan_id">Plan *</Label>
                                    <Select value={data.plan_id} onValueChange={handlePlanChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {plans.map(plan => (
                                                <SelectItem key={plan.id} value={plan.id.toString()}>
                                                    {plan.name} - ${plan.monthly_price}/mo, ${plan.yearly_price}/yr
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.plan_id && <p className="text-sm text-red-600">{errors.plan_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">User *</Label>
                                    <Select value={data.user_id} onValueChange={(value) => setData('user_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map(user => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && <p className="text-sm text-red-600">{errors.user_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map(status => (
                                                <SelectItem key={status} value={status}>
                                                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="billing_cycle">Billing Cycle *</Label>
                                    <Select value={data.billing_cycle} onValueChange={handleBillingCycleChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select billing cycle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {billingCycles.map(cycle => (
                                                <SelectItem key={cycle} value={cycle}>
                                                    {cycle.replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.billing_cycle && <p className="text-sm text-red-600">{errors.billing_cycle}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency *</Label>
                                    <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map(currency => (
                                                <SelectItem key={currency} value={currency}>
                                                    {currency}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.currency && <p className="text-sm text-red-600">{errors.currency}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price *</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(e) => {
                                                setData('price', parseFloat(e.target.value) || 0);
                                                setPriceOverride(true);
                                            }}
                                            placeholder="Enter price"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const selectedPlan = plans.find(plan => plan.id === parseInt(data.plan_id));
                                                if (selectedPlan) {
                                                    const price = data.billing_cycle === 'yearly'
                                                        ? selectedPlan.yearly_price
                                                        : selectedPlan.monthly_price;
                                                    setData('price', price);
                                                    setPriceOverride(false);
                                                }
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                    {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="starts_at">Starts At *</Label>
                                    <Input
                                        id="starts_at"
                                        type="date"
                                        value={data.starts_at}
                                        onChange={(e) => setData('starts_at', e.target.value)}
                                    />
                                    {errors.starts_at && <p className="text-sm text-red-600">{errors.starts_at}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="expires_at">Expires At</Label>
                                    <Input
                                        id="expires_at"
                                        type="date"
                                        value={data.expires_at}
                                        onChange={(e) => setData('expires_at', e.target.value)}
                                    />
                                    {errors.expires_at && <p className="text-sm text-red-600">{errors.expires_at}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="canceled_at">Canceled At</Label>
                                    <Input
                                        id="canceled_at"
                                        type="date"
                                        value={data.canceled_at}
                                        onChange={(e) => setData('canceled_at', e.target.value)}
                                    />
                                    {errors.canceled_at && <p className="text-sm text-red-600">{errors.canceled_at}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="trial_ends_at">Trial Ends At</Label>
                                    <Input
                                        id="trial_ends_at"
                                        type="date"
                                        value={data.trial_ends_at}
                                        onChange={(e) => setData('trial_ends_at', e.target.value)}
                                    />
                                    {errors.trial_ends_at && <p className="text-sm text-red-600">{errors.trial_ends_at}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stripe_subscription_id">Stripe Subscription ID</Label>
                                <Input
                                    id="stripe_subscription_id"
                                    value={data.stripe_subscription_id}
                                    onChange={(e) => setData('stripe_subscription_id', e.target.value)}
                                    placeholder="Enter Stripe subscription ID (optional)"
                                />
                                {errors.stripe_subscription_id && <p className="text-sm text-red-600">{errors.stripe_subscription_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stripe_customer_id">Stripe Customer ID</Label>
                                <Input
                                    id="stripe_customer_id"
                                    value={data.stripe_customer_id}
                                    onChange={(e) => setData('stripe_customer_id', e.target.value)}
                                    placeholder="Enter Stripe customer ID (optional)"
                                />
                                {errors.stripe_customer_id && <p className="text-sm text-red-600">{errors.stripe_customer_id}</p>}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button variant="outline" asChild>
                                    <a href={route('admin.site-subscriptions.index')}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Subscription'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Create;
