import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import  AppLayout  from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SubscriptionPlan {
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

interface PricingProps {
    plans: SubscriptionPlan[];
    userPlan: SubscriptionPlan | null;
}

export default function Pricing({ plans, userPlan }: PricingProps) {
    const { auth } = usePage().props;
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorPlanId, setErrorPlanId] = useState<string | null>(null);

    const handleUpgrade = async (planId: string) => {
        setError(null);
        setIsLoading(true);
        setErrorPlanId(null);

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
                // Redirect to Stripe checkout
                window.location.href = data.checkout_url;
            } else {
                const errorMsg = data.error || 'Failed to create checkout session. Please try again.';
                setError(errorMsg);
                setErrorPlanId(planId);
                toast.error(errorMsg, {
                    duration: 5000,
                    icon: '❌',
                });
                console.error('Upgrade failed:', errorMsg);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred. Please check your connection and try again.';
            setError(errorMsg);
            setErrorPlanId(planId);
            toast.error(errorMsg, {
                duration: 5000,
                icon: '❌',
            });
            console.error('Upgrade failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPrice = (plan: SubscriptionPlan) => {
        return billingPeriod === 'monthly' ? plan.monthly_price : plan.yearly_price;
    };

    const isCurrentPlan = (plan: SubscriptionPlan) => {
        return userPlan?.id === plan.id;
    };

    const getButtonText = (plan: SubscriptionPlan) => {
        if (isCurrentPlan(plan)) {
            return 'Current Plan';
        }
        if (plan.slug === 'free') {
            return 'Downgrade';
        }
        return 'Upgrade';
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            Choose the perfect plan for your needs
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-4">
                            <span className={cn(
                                'text-sm font-medium transition-colors',
                                billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
                            )}>
                                Monthly
                            </span>
                            <button
                                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                                className="relative inline-flex h-8 w-14 items-center rounded-full bg-muted"
                            >
                                <span
                                    className={cn(
                                        'inline-block h-6 w-6 transform rounded-full bg-background shadow transition-transform',
                                        billingPeriod === 'yearly' && 'translate-x-7'
                                    )}
                                />
                            </button>
                            <span className={cn(
                                'text-sm font-medium transition-colors',
                                billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'
                            )}>
                                Yearly
                                <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                    Save 20%
                                </Badge>
                            </span>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={cn(
                                    'relative transition-all hover:shadow-lg',
                                    isCurrentPlan(plan) && 'ring-2 ring-primary border-primary',
                                    plan.slug === 'pro' && 'md:scale-105'
                                )}
                            >
                                {plan.slug === 'pro' && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-primary">Most Popular</Badge>
                                    </div>
                                )}

                                {isCurrentPlan(plan) && (
                                    <div className="absolute -top-4 right-4">
                                        <Badge className="bg-green-600">Current</Badge>
                                    </div>
                                )}

                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Price */}
                                    <div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold">${getPrice(plan)}</span>
                                            <span className="text-muted-foreground">/month</span>
                                        </div>
                                        {billingPeriod === 'yearly' && (
                                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                                Billed annually
                                            </p>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => {
                                                if (!auth.user) {
                                                    window.location.href = '/login';
                                                } else if (!isCurrentPlan(plan)) {
                                                    handleUpgrade(plan.id);
                                                }
                                            }}
                                            disabled={isCurrentPlan(plan) || isLoading}
                                            className={cn(
                                                'w-full',
                                                isCurrentPlan(plan) ? 'bg-muted text-muted-foreground' : ''
                                            )}
                                            variant={isCurrentPlan(plan) ? 'outline' : plan.slug === 'pro' ? 'default' : 'outline'}
                                        >
                                            {isLoading && errorPlanId === plan.id ? 'Processing...' : (!auth.user ? 'Sign up' : getButtonText(plan))}
                                        </Button>

                                        {/* Error Message with Retry Button */}
                                        {error && errorPlanId === plan.id && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-red-800 dark:text-red-200 break-words">
                                                        {error}
                                                    </p>
                                                    <button
                                                        onClick={() => handleUpgrade(plan.id)}
                                                        disabled={isLoading}
                                                        className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                                                    >
                                                        <RotateCcw className="h-3 w-3" />
                                                        Retry
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3 pt-6 border-t">
                                        {/* Requests */}
                                        <div className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {plan.requests_per_day ? plan.requests_per_day : 'Unlimited'} requests/day
                                                </p>
                                                {plan.requests_per_month && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {plan.requests_per_month}/month
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tokens */}
                                        {plan.tokens_per_day && (
                                            <div className="flex items-start gap-3">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {plan.tokens_per_day.toLocaleString()} tokens/day
                                                    </p>
                                                    {plan.tokens_per_month && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {plan.tokens_per_month.toLocaleString()}/month
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Images */}
                                        {plan.images_per_day && (
                                            <div className="flex items-start gap-3">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                <p className="font-medium text-sm">
                                                    {plan.images_per_day} images/day
                                                </p>
                                            </div>
                                        )}

                                        {/* Features */}
                                        {plan.features && plan.features.length > 0 && (
                                            <div className="pt-3 border-t">
                                                <p className="text-xs font-semibold text-muted-foreground mb-2">FEATURES</p>
                                                {plan.features.map((feature: string, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 mb-2">
                                                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                        <span className="text-sm">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Support */}
                                        {plan.priority_support && (
                                            <div className="flex items-start gap-3 pt-3 border-t">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                <p className="font-medium text-sm">Priority support</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Yes, you can upgrade or downgrade your plan anytime. Changes take effect immediately.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        If you're not satisfied with your subscription, contact our support team within the first 30 days for a refund.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">What happens if I exceed my limit?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        You'll receive a notification when you're approaching your limit. Your requests will be blocked once you exceed it. You can upgrade to a higher plan or wait for the daily/monthly reset.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Is my data secure?</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Yes, we use industry-standard encryption and security practices. All your data is encrypted in transit and at rest.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
