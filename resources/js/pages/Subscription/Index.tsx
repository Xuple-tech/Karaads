import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Zap, TrendingUp, RotateCcw } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import UsageStats from '@/components/subscription/UsageStats';
import toast from 'react-hot-toast';

interface Subscription {
    id: string;
    status: string;
    plan: {
        id: string;
        name: string;
        slug: string;
        description: string;
        monthly_price: number;
        requests_per_day?: number;
        tokens_per_day?: number;
    };
    started_at: string;
    renews_at?: string;
    is_trial?: boolean;
    trial_ends_at?: string;
}

interface Plan {
    id: string;
    name: string;
    slug: string;
    description: string;
    monthly_price: number;
    requests_per_day?: number;
    tokens_per_day?: number;
    features: string[];
}

interface SubscriptionIndexProps {
    subscription: Subscription | null;
    plans: Plan[];
}

export default function SubscriptionIndex({ subscription, plans }: SubscriptionIndexProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorAction, setErrorAction] = useState<'downgrade' | 'cancel' | null>(null);
    const currentPlan = subscription?.plan;

    const handleDowngrade = async (planId: string) => {
        if (!confirm('Are you sure you want to downgrade your plan?')) return;

        setError(null);
        setErrorAction(null);
        setLoading(true);
        try {
            const response = await fetch('/api/subscription/downgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
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
                setErrorAction('downgrade');
                toast.error(errorMsg, { duration: 5000 });
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'An error occurred while downgrading';
            setError(errorMsg);
            setErrorAction('downgrade');
            toast.error(errorMsg, { duration: 5000 });
            console.error('Downgrade error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You can resubscribe anytime.')) return;

        setError(null);
        setErrorAction(null);
        setLoading(true);
        try {
            const response = await fetch('/api/subscription/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Subscription cancelled successfully');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                const errorMsg = data.error || 'Failed to cancel subscription';
                setError(errorMsg);
                setErrorAction('cancel');
                toast.error(errorMsg, { duration: 5000 });
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'An error occurred while cancelling';
            setError(errorMsg);
            setErrorAction('cancel');
            toast.error(errorMsg, { duration: 5000 });
            console.error('Cancel error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Subscription Management" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Subscription Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your subscription and view your usage
                        </p>
                    </div>

                    {/* Trial Alert */}
                    {subscription?.is_trial && (
                        <Alert className="mb-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertTitle>Trial Active</AlertTitle>
                            <AlertDescription>
                                You're currently on a free trial that ends on{' '}
                                {new Date(subscription.trial_ends_at || '').toLocaleDateString()}. Upgrade anytime to continue
                                after trial ends.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Current Subscription */}
                    {currentPlan && (
                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            {/* Current Plan Card */}
                            <Card className="md:col-span-2 p-8">
                                <h2 className="text-2xl font-bold mb-4">Current Plan</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Plan Name</p>
                                        <p className="text-2xl font-bold">{currentPlan.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Description</p>
                                        <p>{currentPlan.description}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Billing</p>
                                        <p className="text-xl font-semibold">
                                            ${currentPlan.monthly_price}/month
                                        </p>
                                        {subscription.renews_at && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Renews on {new Date(subscription.renews_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="pt-4 space-y-2">
                                        {currentPlan.slug !== 'free' && (
                                            <>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleCancel}
                                                    disabled={loading}
                                                    className="w-full"
                                                >
                                                    Cancel Subscription
                                                </Button>

                                                {/* Error Display for Cancel */}
                                                {error && errorAction === 'cancel' && (
                                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-start gap-2">
                                                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-red-800 dark:text-red-200 break-words">
                                                                {error}
                                                            </p>
                                                            <button
                                                                onClick={handleCancel}
                                                                disabled={loading}
                                                                className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                                Retry
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Quick Stats */}
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Limits
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Daily Requests</p>
                                        <p className="text-lg font-semibold">
                                            {currentPlan.requests_per_day
                                                ? currentPlan.requests_per_day.toLocaleString()
                                                : 'Unlimited'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Daily Tokens</p>
                                        <p className="text-lg font-semibold">
                                            {currentPlan.tokens_per_day
                                                ? (currentPlan.tokens_per_day / 1000).toFixed(0) + 'K'
                                                : 'Unlimited'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Usage Statistics */}
                    <div className="mb-12">
                        <UsageStats />
                    </div>

                    {/* Upgrade Section */}
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList>
                            <TabsTrigger value="all">All Plans</TabsTrigger>
                            <TabsTrigger value="upgrade">Upgrade Options</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-6">
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {plans.map((plan) => (
                                    <Card
                                        key={plan.id}
                                        className={`p-6 ${
                                            currentPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    >
                                        <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                                        <p className="text-2xl font-bold mb-4">
                                            ${plan.monthly_price}
                                            <span className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                                                /mo
                                            </span>
                                        </p>
                                        {currentPlan?.id === plan.id ? (
                                            <Button disabled className="w-full">
                                                Current Plan
                                            </Button>
                                        ) : (
                                            <div className="space-y-2">
                                                <Button
                                                    className="w-full"
                                                    disabled={loading}
                                                    onClick={() => {
                                                        if (currentPlan && plan.monthly_price < currentPlan.monthly_price) {
                                                            handleDowngrade(plan.id);
                                                        } else {
                                                            // Navigate to pricing page to upgrade
                                                            window.location.href = '/subscription/pricing';
                                                        }
                                                    }}
                                                >
                                                    {currentPlan && plan.monthly_price < currentPlan.monthly_price
                                                        ? 'Downgrade'
                                                        : 'Upgrade'}
                                                </Button>

                                                {/* Error Display for Downgrade */}
                                                {error && errorAction === 'downgrade' && currentPlan && plan.monthly_price < currentPlan.monthly_price && (
                                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2 flex items-start gap-2">
                                                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-red-800 dark:text-red-200 break-words">
                                                                {error}
                                                            </p>
                                                            <button
                                                                onClick={() => handleDowngrade(plan.id)}
                                                                disabled={loading}
                                                                className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                                Retry
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="upgrade" className="mt-6">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Need more capacity?</AlertTitle>
                                <AlertDescription>
                                    Upgrade your plan to unlock higher limits and more features. Your upgrade takes effect
                                    immediately.
                                </AlertDescription>
                            </Alert>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </GuestLayout>
    );
}
