import React, { useState } from 'react';
import SaasOwnerLayout from '@/layouts/SaasOwnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    billing_period: number;
}

interface Subscription {
    id?: string;
    user_id: string;
    plan_id: string;
    is_trial: boolean;
    trial_duration_days: number;
    started_at: string;
    amount_paid: number;
}

interface SubscriptionFormProps {
    users: User[];
    plans: Plan[];
    subscription?: Subscription;
    isEditing: boolean;
}

export default function SubscriptionForm({
    users,
    plans,
    subscription,
    isEditing,
}: SubscriptionFormProps) {
    const { errors } = usePage().props;
    const [formData, setFormData] = useState({
        user_id: subscription?.user_id || '',
        plan_id: subscription?.plan_id || '',
        is_trial: subscription?.is_trial || false,
        trial_duration_days: subscription?.trial_duration_days || 14,
        started_at: subscription?.started_at || new Date().toISOString().split('T')[0],
        amount_paid: subscription?.amount_paid || 0,
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const route_name = isEditing
            ? 'saas-owner.subscriptions.update'
            : 'saas-owner.subscriptions.store';

        const method = isEditing ? 'put' : 'post';

        router[method](
            isEditing
                ? route(route_name, subscription?.id)
                : route(route_name),
            formData,
            {
                onSuccess: () => {
                    toast.success(
                        isEditing
                            ? 'Subscription updated successfully'
                            : 'Subscription created successfully'
                    );
                    router.visit(route('saas-owner.subscriptions.index'));
                },
                onError: () => {
                    toast.error('Failed to save subscription');
                    setLoading(false);
                },
            }
        );
    };

    const selectedPlan = plans.find((p) => p.id === formData.plan_id);
    const trialEndDate = formData.is_trial
        ? new Date(new Date(formData.started_at).getTime() + formData.trial_duration_days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        : null;

    return (
        <SaasOwnerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('saas-owner.subscriptions.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing ? 'Edit Subscription' : 'Create Subscription'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {isEditing
                                ? 'Update subscription details'
                                : 'Create a new subscription for a customer'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Customer</CardTitle>
                                    <CardDescription>
                                        Select the customer for this subscription
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="user">Customer *</Label>
                                        <Select
                                            value={formData.user_id}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, user_id: value })
                                            }
                                        >
                                            <SelectTrigger
                                                id="user"
                                                className={
                                                    errors?.user_id ? 'border-red-500' : ''
                                                }
                                            >
                                                <SelectValue placeholder="Select a customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.name} ({user.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors?.user_id && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.user_id}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Plan Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Plan</CardTitle>
                                    <CardDescription>
                                        Choose the subscription plan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="plan">Plan *</Label>
                                        <Select
                                            value={formData.plan_id}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, plan_id: value })
                                            }
                                        >
                                            <SelectTrigger
                                                id="plan"
                                                className={
                                                    errors?.plan_id ? 'border-red-500' : ''
                                                }
                                            >
                                                <SelectValue placeholder="Select a plan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {plans.map((plan) => (
                                                    <SelectItem key={plan.id} value={plan.id}>
                                                        {plan.name} - ${plan.price}/
                                                        {plan.billing_period === 1
                                                            ? 'month'
                                                            : `${plan.billing_period} months`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors?.plan_id && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.plan_id}
                                            </p>
                                        )}
                                    </div>

                                    {selectedPlan && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm">
                                                <strong>Price:</strong> ${selectedPlan.price}
                                            </p>
                                            <p className="text-sm">
                                                <strong>Billing Period:</strong>{' '}
                                                {selectedPlan.billing_period} month
                                                {selectedPlan.billing_period > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Trial Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Trial Settings</CardTitle>
                                    <CardDescription>
                                        Configure trial period if applicable
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_trial"
                                            checked={formData.is_trial}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    is_trial: checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="is_trial" className="font-normal">
                                            This is a trial subscription
                                        </Label>
                                    </div>

                                    {formData.is_trial && (
                                        <div>
                                            <Label htmlFor="trial_days">
                                                Trial Duration (days) *
                                            </Label>
                                            <Input
                                                id="trial_days"
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={formData.trial_duration_days}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        trial_duration_days: parseInt(
                                                            e.target.value
                                                        ),
                                                    })
                                                }
                                                className={
                                                    errors?.trial_duration_days
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors?.trial_duration_days && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    {errors.trial_duration_days}
                                                </p>
                                            )}
                                            {trialEndDate && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Trial ends: {trialEndDate}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Dates & Payment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Dates & Payment</CardTitle>
                                    <CardDescription>
                                        Set subscription start date and payment amount
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="started_at">
                                            Start Date *
                                        </Label>
                                        <Input
                                            id="started_at"
                                            type="date"
                                            value={formData.started_at}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    started_at: e.target.value,
                                                })
                                            }
                                            className={
                                                errors?.started_at ? 'border-red-500' : ''
                                            }
                                        />
                                        {errors?.started_at && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.started_at}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="amount">Amount Paid ($)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.amount_paid}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    amount_paid: parseFloat(e.target.value),
                                                })
                                            }
                                            className={
                                                errors?.amount_paid ? 'border-red-500' : ''
                                            }
                                        />
                                        {errors?.amount_paid && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.amount_paid}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Customer</p>
                                        <p className="font-medium">
                                            {users.find((u) => u.id === formData.user_id)?.name ||
                                                'Not selected'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Plan</p>
                                        <p className="font-medium">
                                            {selectedPlan?.name || 'Not selected'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Plan Price</p>
                                        <p className="font-medium">
                                            ${selectedPlan?.price.toFixed(2) || '0.00'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Amount to Charge</p>
                                        <p className="font-medium">
                                            ${formData.amount_paid.toFixed(2)}
                                        </p>
                                    </div>

                                    {formData.is_trial && (
                                        <div>
                                            <p className="text-sm text-gray-600">Trial Period</p>
                                            <p className="font-medium">
                                                {formData.trial_duration_days} days
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t space-y-2">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save Subscription'}
                                        </Button>
                                        <Link href={route('saas-owner.subscriptions.index')}>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                            >
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </SaasOwnerLayout>
    );
}
