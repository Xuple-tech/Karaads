import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    Zap,
    Calendar,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
    RotateCcw,
    Flame,
    Gift,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import PaymentMethodsManager from '@/components/billing/PaymentMethodsManager';

interface Plan {
    id: string;
    name: string;
    slug: string;
    description: string;
    monthly_price: number;
    yearly_price: number;
    requests_per_day: number | null;
    requests_per_month: number | null;
    tokens_per_day: number | null;
    tokens_per_month: number | null;
    images_per_day: number | null;
    images_per_month: number | null;
    features: string[];
    supports_api: boolean;
    supports_voice: boolean;
    supports_email_automation: boolean;
    supports_projects: boolean;
    priority_support: boolean;
    is_active: boolean;
}

interface Subscription {
    id: string;
    plan_id: string;
    status: 'active' | 'cancelled' | 'expired' | 'pending_payment';
    started_at: string;
    renews_at: string;
    cancelled_at: string | null;
    amount_paid: number;
    billing_period: 'monthly' | 'yearly';
    is_trial: boolean;
    trial_ends_at?: string;
}

interface UsageStats {
    daily: {
        requests_used: number;
        requests_limit: number | null;
        tokens_used: number;
        tokens_limit: number | null;
        images_generated: number;
        images_limit: number | null;
    };
    monthly: {
        requests_used: number;
        requests_limit: number | null;
        tokens_used: number;
        tokens_limit: number | null;
        images_generated: number;
        images_limit: number | null;
    };
}

interface UserSubscriptionProps {
    currentSubscription: Subscription | null;
    currentPlan: Plan | null;
    availablePlans: Plan[];
}

export default function UserSubscription({
    currentSubscription,
    currentPlan,
    availablePlans,
}: UserSubscriptionProps) {
    const { auth } = usePage().props;
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
        currentSubscription?.billing_period || 'monthly'
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsageStats();
    }, []);

    const fetchUsageStats = async () => {
        try {
            const response = await fetch('/api/subscription/usage-stats');
            const data = await response.json();
            if (data.success) {
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch usage stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleUpgradePlan = async (planId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/subscription/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    plan_id: planId,
                    billing_period: billingPeriod,
                }),
            });

            const data = await response.json();
            if (data.success && data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                const errorMsg = data.error || 'Failed to create checkout session';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDowngradePlan = async (planId: string) => {
        if (!confirm('Are you sure you want to downgrade your plan? You may lose access to some features.')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/subscription/downgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ plan_id: planId }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Plan downgraded successfully!');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                const errorMsg = data.error || 'Failed to downgrade plan';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'An error occurred';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/subscription/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Subscription cancelled successfully');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                const errorMsg = data.error || 'Failed to cancel subscription';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'An error occurred';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
            setShowCancelConfirm(false);
        }
    };

    const getStatusColor = (status: string) => {
        return {
            active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
            expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
            pending_payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
        }[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'cancelled':
                return <AlertCircle className="h-5 w-5" />;
            case 'expired':
                return <Clock className="h-5 w-5" />;
            case 'pending_payment':
                return <AlertTriangle className="h-5 w-5" />;
            default:
                return <Clock className="h-5 w-5" />;
        }
    };

    const getPercentage = (used: number, limit: number | null) => {
        if (!limit) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getPrice = (plan: Plan) => {
        return billingPeriod === 'monthly' ? plan.monthly_price : plan.yearly_price;
    };

    const isCurrentPlan = (plan: Plan) => currentPlan?.id === plan.id;

    return (
        <AppLayout>
            <Head title="Subscription & Billing" />

            <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Subscription & Billing</h1>
                        <p className="text-muted-foreground">
                            Manage your subscription, view usage, and upgrade or downgrade your plan
                        </p>
                    </div>

                    {/* Trial Alert */}
                    {currentSubscription?.is_trial && (
                        <Alert className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            <Gift className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription>
                                <strong>Trial Active</strong> — Your trial ends on{' '}
                                {currentSubscription.trial_ends_at
                                    ? formatDate(currentSubscription.trial_ends_at)
                                    : 'N/A'}
                                . Upgrade anytime to continue access after your trial ends.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Alert */}
                    {error && (
                        <Alert className="mb-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-6 mb-8">
                        {/* Current Subscription Card */}
                        {currentSubscription && currentPlan && (
                            <Card className="col-span-full border-2">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-2xl">Current Plan</CardTitle>
                                            <CardDescription>Your active subscription details</CardDescription>
                                        </div>
                                        <Badge className={getStatusColor(currentSubscription.status)}>
                                            {getStatusIcon(currentSubscription.status)}
                                            <span className="ml-2 capitalize">{currentSubscription.status}</span>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {/* Plan Name & Price */}
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Plan Name</p>
                                            <p className="text-2xl font-bold">{currentPlan.name}</p>
                                            <p className="text-lg text-muted-foreground">
                                                ${getPrice(currentPlan)}/{billingPeriod === 'monthly' ? 'month' : 'year'}
                                            </p>
                                        </div>

                                        {/* Dates */}
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Subscription Dates</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        Started: {formatDate(currentSubscription.started_at)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        Renews: {formatDate(currentSubscription.renews_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Billing Info */}
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Billing Details</p>
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="block w-fit">
                                                    {currentSubscription.billing_period}
                                                </Badge>
                                                <p className="text-sm text-muted-foreground">
                                                    Amount Paid: ${currentSubscription.amount_paid}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    {currentPlan.features && currentPlan.features.length > 0 && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium mb-3">Plan Features</p>
                                            <div className="grid md:grid-cols-2 gap-2">
                                                {currentPlan.features.map((feature, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                        <span className="text-sm">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="pt-4 border-t flex gap-3 flex-wrap">
                                        {currentPlan.slug !== 'free' && (
                                            <>
                                                {!showCancelConfirm ? (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowCancelConfirm(true)}
                                                        disabled={isLoading}
                                                    >
                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                        Cancel Subscription
                                                    </Button>
                                                ) : (
                                                    <div className="flex gap-2 w-full">
                                                        <Button
                                                            variant="destructive"
                                                            onClick={handleCancelSubscription}
                                                            disabled={isLoading}
                                                            className="flex-1"
                                                        >
                                                            Confirm Cancellation
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setShowCancelConfirm(false)}
                                                            disabled={isLoading}
                                                            className="flex-1"
                                                        >
                                                            Keep Subscription
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <Button variant="outline" asChild>
                                            <a href="/billing">View Billing Details</a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Usage Statistics */}
                    {!statsLoading && stats && (
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Usage Statistics</CardTitle>
                                <CardDescription>Track your API usage and limits</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Daily Usage */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Today's Usage
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>API Requests</span>
                                                    <span className="font-medium">
                                                        {stats.daily.requests_used} /
                                                        {stats.daily.requests_limit || '∞'}
                                                    </span>
                                                </div>
                                                {stats.daily.requests_limit && (
                                                    <Progress
                                                        value={getPercentage(stats.daily.requests_used, stats.daily.requests_limit)}
                                                        className="h-2"
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>Tokens</span>
                                                    <span className="font-medium">
                                                        {stats.daily.tokens_used} /
                                                        {stats.daily.tokens_limit || '∞'}
                                                    </span>
                                                </div>
                                                {stats.daily.tokens_limit && (
                                                    <Progress
                                                        value={getPercentage(stats.daily.tokens_used, stats.daily.tokens_limit)}
                                                        className="h-2"
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>Images Generated</span>
                                                    <span className="font-medium">
                                                        {stats.daily.images_generated} /
                                                        {stats.daily.images_limit || '∞'}
                                                    </span>
                                                </div>
                                                {stats.daily.images_limit && (
                                                    <Progress
                                                        value={getPercentage(stats.daily.images_generated, stats.daily.images_limit)}
                                                        className="h-2"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Monthly Usage */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            This Month's Usage
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>API Requests</span>
                                                    <span className="font-medium">
                                                        {stats.monthly.requests_used} /
                                                        {stats.monthly.requests_limit || '∞'}
                                                    </span>
                                                </div>
                                                {stats.monthly.requests_limit && (
                                                    <Progress
                                                        value={getPercentage(stats.monthly.requests_used, stats.monthly.requests_limit)}
                                                        className="h-2"
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>Tokens</span>
                                                    <span className="font-medium">
                                                        {stats.monthly.tokens_used} /
                                                        {stats.monthly.tokens_limit || '∞'}
                                                    </span>
                                                </div>
                                                {stats.monthly.tokens_limit && (
                                                    <Progress
                                                        value={getPercentage(stats.monthly.tokens_used, stats.monthly.tokens_limit)}
                                                        className="h-2"
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>Images Generated</span>
                                                    <span className="font-medium">
                                                        {stats.monthly.images_generated} /
                                                        {stats.monthly.images_limit || '∞'}
                                                    </span>
                                                </div>
                                                {stats.monthly.images_limit && (
                                                    <Progress
                                                        value={getPercentage(stats.monthly.images_generated, stats.monthly.images_limit)}
                                                        className="h-2"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Billing Period Toggle */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Available Plans</span>
                                <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted">
                                    <button
                                        onClick={() => setBillingPeriod('monthly')}
                                        className={cn(
                                            'px-3 py-1 rounded text-sm font-medium transition-colors',
                                            billingPeriod === 'monthly'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setBillingPeriod('yearly')}
                                        className={cn(
                                            'px-3 py-1 rounded text-sm font-medium transition-colors',
                                            billingPeriod === 'yearly'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        Yearly
                                    </button>
                                </div>
                            </CardTitle>
                            <CardDescription>Compare plans and upgrade or downgrade</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availablePlans.map((plan) => (
                                    <Card
                                        key={plan.id}
                                        className={cn(
                                            'flex flex-col transition-all',
                                            isCurrentPlan(plan) && 'ring-2 ring-primary border-primary'
                                        )}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-2">
                                                <CardTitle className="text-lg">{plan.name}</CardTitle>
                                                {isCurrentPlan(plan) && (
                                                    <Badge className="bg-primary">Current</Badge>
                                                )}
                                            </div>
                                            <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col">
                                            <div className="mb-4">
                                                <div className="text-3xl font-bold">
                                                    ${getPrice(plan)}
                                                    <span className="text-sm text-muted-foreground font-normal">
                                                        /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Plan Highlights */}
                                            <div className="space-y-2 mb-4 flex-1">
                                                {plan.requests_per_day && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        <span>{plan.requests_per_day.toLocaleString()} requests/day</span>
                                                    </div>
                                                )}
                                                {plan.tokens_per_day && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        <span>{(plan.tokens_per_day / 1000).toFixed(0)}K tokens/day</span>
                                                    </div>
                                                )}
                                                {plan.supports_api && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        <span>API Access</span>
                                                    </div>
                                                )}
                                                {plan.priority_support && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        <span>Priority Support</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            {isCurrentPlan(plan) ? (
                                                <Button disabled className="w-full">
                                                    Current Plan
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => {
                                                        if (currentPlan && getPrice(plan) < getPrice(currentPlan)) {
                                                            handleDowngradePlan(plan.id);
                                                        } else {
                                                            handleUpgradePlan(plan.id);
                                                        }
                                                    }}
                                                    disabled={isLoading}
                                                    className="w-full"
                                                    variant={
                                                        currentPlan && getPrice(plan) < getPrice(currentPlan)
                                                            ? 'outline'
                                                            : 'default'
                                                    }
                                                >
                                                    {currentPlan && getPrice(plan) < getPrice(currentPlan) ? (
                                                        <>
                                                            <ArrowUpRight className="h-4 w-4 mr-2 rotate-180" />
                                                            Downgrade
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowUpRight className="h-4 w-4 mr-2" />
                                                            Upgrade
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <PaymentMethodsManager />

                    {/* Help Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Need Help?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                For more information about our plans, features, and pricing, visit our{' '}
                                <a href="/docs/subscription" className="text-primary hover:underline">
                                    subscription documentation
                                </a>
                                .
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Have questions? Contact our support team at support@rheaapp.com
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
