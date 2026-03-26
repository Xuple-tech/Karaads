import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    MessageSquare,
    Image as ImageIcon,
    Volume2,
    Mail,
    TrendingUp,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
    id: string;
    name: string;
    slug: string;
    description: string;
    monthly_price: number;
    yearly_price: number;
    requests_per_day: number | null;
    tokens_per_day: number | null;
    images_per_day: number | null;
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
}

interface UsageStats {
    daily: {
        requests_used: number;
        requests_limit: number | null;
        tokens_used: number;
        tokens_limit: number | null;
        images_generated: number;
        images_limit: number | null;
        voice_messages: number;
        voice_limit: number | null;
        emails_processed: number;
        emails_limit: number | null;
    };
    monthly: {
        requests_used: number;
        requests_limit: number | null;
        tokens_used: number;
        tokens_limit: number | null;
        images_generated: number;
        images_limit: number | null;
        voice_messages: number;
        voice_limit: number | null;
        emails_processed: number;
        emails_limit: number | null;
    };
}

interface BillingManagementProps {
    currentSubscription: Subscription | null;
    currentPlan: Plan | null;
    availablePlans: Plan[];
}

interface UsageItem {
    label: string;
    icon: React.ReactNode;
    daily: { used: number; limit: number | null };
    monthly: { used: number; limit: number | null };
    color: string;
}

export default function BillingManagement({
    currentSubscription,
    currentPlan,
    availablePlans,
}: BillingManagementProps) {
    const { auth } = usePage().props;
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [usagePeriod, setUsagePeriod] = useState<'daily' | 'monthly'>('daily');
    const [expandedSections, setExpandedSections] = useState({
        subscription: true,
        billing: true,
        usage: true,
    });

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

    const handleCancelSubscription = async () => {
        setIsLoading(true);
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
                window.location.reload();
            }
        } catch (error) {
            console.error('Cancel failed:', error);
            alert('Failed to cancel subscription');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgradePlan = async (planId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/subscription/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    plan_id: planId,
                    billing_period: currentSubscription?.billing_period || 'monthly',
                }),
            });

            const data = await response.json();
            if (data.success && data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                alert(data.error || 'Failed to upgrade plan');
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
            alert('Failed to upgrade plan');
        } finally {
            setIsLoading(false);
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
        if (limit === null) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Build usage items
    const usageItems: UsageItem[] = stats
        ? [
            {
                label: 'API Requests',
                icon: <Zap className="h-5 w-5" />,
                daily: {
                    used: stats.daily.requests_used,
                    limit: stats.daily.requests_limit,
                },
                monthly: {
                    used: stats.monthly.requests_used,
                    limit: stats.monthly.requests_limit,
                },
                color: 'bg-blue-500',
            },
            {
                label: 'Tokens',
                icon: <MessageSquare className="h-5 w-5" />,
                daily: { used: stats.daily.tokens_used, limit: stats.daily.tokens_limit },
                monthly: {
                    used: stats.monthly.tokens_used,
                    limit: stats.monthly.tokens_limit,
                },
                color: 'bg-purple-500',
            },
            {
                label: 'Images Generated',
                icon: <ImageIcon className="h-5 w-5" />,
                daily: {
                    used: stats.daily.images_generated,
                    limit: stats.daily.images_limit,
                },
                monthly: {
                    used: stats.monthly.images_generated,
                    limit: stats.monthly.images_limit,
                },
                color: 'bg-pink-500',
            },
            {
                label: 'Voice Messages',
                icon: <Volume2 className="h-5 w-5" />,
                daily: {
                    used: stats.daily.voice_messages,
                    limit: stats.daily.voice_limit,
                },
                monthly: {
                    used: stats.monthly.voice_messages,
                    limit: stats.monthly.voice_limit,
                },
                color: 'bg-green-500',
            },
            {
                label: 'Emails Processed',
                icon: <Mail className="h-5 w-5" />,
                daily: {
                    used: stats.daily.emails_processed,
                    limit: stats.daily.emails_limit,
                },
                monthly: {
                    used: stats.monthly.emails_processed,
                    limit: stats.monthly.emails_limit,
                },
                color: 'bg-yellow-500',
            },
        ]
        : [];

    const currentStats = stats ? stats[usagePeriod] : null;
    const isLimitExceeded =
        currentStats &&
        usageItems.some(item => {
            const limit = item[usagePeriod].limit;
            return limit && item[usagePeriod].used >= limit;
        });

    return (
        <AppLayout>
            <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Billing & Usage</h1>
                        <p className="text-muted-foreground">
                            Manage your subscription, monitor usage, and update billing settings
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Subscription Section */}
                        <Card>
                            <CardHeader
                                className="cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                                onClick={() => toggleSection('subscription')}
                            >
                                <div className="flex-1">
                                    <CardTitle>Subscription & Plan</CardTitle>
                                    <CardDescription>
                                        Manage your current subscription and plan details
                                    </CardDescription>
                                </div>
                                {expandedSections.subscription ? <ChevronUp /> : <ChevronDown />}
                            </CardHeader>
                            {expandedSections.subscription && (
                                <CardContent className="space-y-6">
                                    {currentSubscription && currentPlan ? (
                                        <>
                                            {/* Current Plan Badge */}
                                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground">Current Plan</p>
                                                    <p className="text-2xl font-bold">{currentPlan.name}</p>
                                                </div>
                                                <Badge className={getStatusColor(currentSubscription.status)}>
                                                    {getStatusIcon(currentSubscription.status)}
                                                    <span className="ml-2 capitalize">{currentSubscription.status}</span>
                                                </Badge>
                                            </div>

                                            {/* Subscription Details Grid */}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Plan Details</p>
                                                    <div className="space-y-1">
                                                        <p className="text-sm">
                                                            <span className="font-medium">Monthly Price:</span> ${currentPlan.monthly_price}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="font-medium">Yearly Price:</span> ${currentPlan.yearly_price}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="font-medium">Billing Period:</span>{' '}
                                                            <Badge variant="outline" className="ml-1">
                                                                {currentSubscription.billing_period}
                                                            </Badge>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Important Dates</p>
                                                    <div className="space-y-1">
                                                        <p className="text-sm">
                                                            <Calendar className="h-4 w-4 inline mr-2" />
                                                            <span className="font-medium">Started:</span> {formatDate(currentSubscription.started_at)}
                                                        </p>
                                                        <p className="text-sm">
                                                            <Calendar className="h-4 w-4 inline mr-2" />
                                                            <span className="font-medium">Renews:</span> {formatDate(currentSubscription.renews_at)}
                                                        </p>
                                                        {currentSubscription.cancelled_at && (
                                                            <p className="text-sm text-red-600">
                                                                <AlertCircle className="h-4 w-4 inline mr-2" />
                                                                <span className="font-medium">Cancelled:</span>{' '}
                                                                {formatDate(currentSubscription.cancelled_at)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Plan Features */}
                                            <div className="space-y-2 p-4 bg-muted rounded-lg">
                                                <p className="text-sm font-medium">Plan Limits</p>
                                                <div className="space-y-2 text-sm">
                                                    <p>
                                                        🔄 <span className="font-medium">Requests/Day:</span>{' '}
                                                        {currentPlan.requests_per_day ? (
                                                            <span>{currentPlan.requests_per_day}</span>
                                                        ) : (
                                                            <Badge variant="secondary">Unlimited</Badge>
                                                        )}
                                                    </p>
                                                    <p>
                                                        💬 <span className="font-medium">Tokens/Day:</span>{' '}
                                                        {currentPlan.tokens_per_day ? (
                                                            <span>{currentPlan.tokens_per_day.toLocaleString()}</span>
                                                        ) : (
                                                            <Badge variant="secondary">Unlimited</Badge>
                                                        )}
                                                    </p>
                                                    <p>
                                                        🖼️ <span className="font-medium">Images/Day:</span>{' '}
                                                        {currentPlan.images_per_day ? (
                                                            <span>{currentPlan.images_per_day}</span>
                                                        ) : (
                                                            <Badge variant="secondary">Unlimited</Badge>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-4 border-t">
                                                {currentPlan.slug !== 'pro' && (
                                                    <Button
                                                        onClick={() => {
                                                            const proPlan = availablePlans.find(p => p.slug === 'pro');
                                                            if (proPlan) handleUpgradePlan(proPlan.id);
                                                        }}
                                                        disabled={isLoading}
                                                        className="flex-1"
                                                    >
                                                        Upgrade to Pro
                                                    </Button>
                                                )}

                                                {currentSubscription.status === 'active' && (
                                                    <Button
                                                        onClick={() => setShowCancelConfirm(true)}
                                                        disabled={isLoading}
                                                        variant="destructive"
                                                        className="flex-1"
                                                    >
                                                        Cancel Subscription
                                                    </Button>
                                                )}

                                                <Button
                                                    onClick={() => window.open('/billing/invoices')}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    View Invoices
                                                </Button>
                                            </div>

                                            {/* Cancel Confirmation */}
                                            {showCancelConfirm && (
                                                <Alert className="border-red-200 bg-red-50">
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                    <AlertDescription className="text-red-800">
                                                        <p className="font-semibold mb-2">Cancel Subscription?</p>
                                                        <p className="text-sm mb-3">
                                                            Your subscription will be cancelled at the end of your current billing period.
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={handleCancelSubscription}
                                                                disabled={isLoading}
                                                            >
                                                                Confirm Cancel
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setShowCancelConfirm(false)}
                                                            >
                                                                Keep Subscription
                                                            </Button>
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </>
                                    ) : (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                <p className="font-semibold mb-2">No Active Subscription</p>
                                                <p className="text-sm mb-3">You're currently on the free plan.</p>
                                                <Button onClick={() => window.location.href = '/pricing'} size="sm">
                                                    View Plans
                                                </Button>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            )}
                        </Card>

                        {/* Usage Statistics Section */}
                        <Card>
                            <CardHeader
                                className="cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                                onClick={() => toggleSection('usage')}
                            >
                                <div className="flex-1">
                                    <CardTitle>Usage & Limits</CardTitle>
                                    <CardDescription>
                                        Track your current usage against your plan limits
                                    </CardDescription>
                                </div>
                                {expandedSections.usage ? <ChevronUp /> : <ChevronDown />}
                            </CardHeader>
                            {expandedSections.usage && (
                                <CardContent className="space-y-6">
                                    {statsLoading ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Loading usage data...
                                        </div>
                                    ) : stats ? (
                                        <>
                                            {/* Period Toggle */}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={usagePeriod === 'daily' ? 'default' : 'outline'}
                                                    onClick={() => setUsagePeriod('daily')}
                                                >
                                                    Today
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={usagePeriod === 'monthly' ? 'default' : 'outline'}
                                                    onClick={() => setUsagePeriod('monthly')}
                                                >
                                                    This Month
                                                </Button>
                                            </div>

                                            {/* Limit Exceeded Alert */}
                                            {isLimitExceeded && (
                                                <Alert className="border-red-200 bg-red-50">
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                    <AlertDescription className="text-red-800">
                                                        <p className="font-semibold">Usage Limit Exceeded</p>
                                                        <p className="text-sm">
                                                            You've exceeded your {usagePeriod} usage limit. Your requests are currently
                                                            blocked. Consider upgrading your plan or wait for the{' '}
                                                            {usagePeriod === 'daily' ? 'daily' : 'monthly'} reset.
                                                        </p>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {/* Usage Items */}
                                            <div className="space-y-4">
                                                {usageItems.map(item => {
                                                    const current = item[usagePeriod];
                                                    const percentage = getPercentage(current.used, current.limit);
                                                    const isWarning = percentage >= 80;
                                                    const isExceeded = percentage >= 100;

                                                    return (
                                                        <div key={item.label} className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={cn('p-2 rounded-lg text-white', item.color)}>
                                                                        {item.icon}
                                                                    </div>
                                                                    <span className="font-medium">{item.label}</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-semibold">
                                                                        {current.used.toLocaleString()}
                                                                        {current.limit && (
                                                                            <span className="text-muted-foreground text-sm font-normal">
                                                                                {' '}
                                                                                / {current.limit.toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    <p
                                                                        className={cn(
                                                                            'text-xs',
                                                                            isExceeded && 'text-red-600 font-semibold',
                                                                            isWarning && !isExceeded && 'text-orange-600',
                                                                            !isWarning && 'text-green-600'
                                                                        )}
                                                                    >
                                                                        {percentage.toFixed(1)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {current.limit && (
                                                                <Progress
                                                                    value={percentage}
                                                                    className={cn(
                                                                        'h-2',
                                                                        isExceeded && '[&>*]:bg-red-600',
                                                                        isWarning && !isExceeded && '[&>*]:bg-orange-500',
                                                                        !isWarning && '[&>*]:bg-green-500'
                                                                    )}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Usage Tips */}
                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" /> Usage Tips
                                                </p>
                                                <ul className="text-sm text-blue-800 space-y-1">
                                                    <li>• Limits reset daily and monthly at 00:00 UTC</li>
                                                    <li>• Upgrade your plan anytime to increase limits</li>
                                                    <li>• Monitor your usage to avoid hitting limits</li>
                                                    <li>• Contact support for usage questions</li>
                                                </ul>
                                            </div>
                                        </>
                                    ) : (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Unable to load usage data. Please try again later.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            )}
                        </Card>

                        {/* Available Plans Section */}
                        {currentPlan?.slug !== 'pro' && (
                            <Card>
                                <CardHeader
                                    className="cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                                    onClick={() => toggleSection('billing')}
                                >
                                    <div className="flex-1">
                                        <CardTitle>Upgrade Options</CardTitle>
                                        <CardDescription>
                                            Explore other plans available for your account
                                        </CardDescription>
                                    </div>
                                    {expandedSections.billing ? <ChevronUp /> : <ChevronDown />}
                                </CardHeader>
                                {expandedSections.billing && (
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {availablePlans
                                                .filter(plan => plan.slug !== currentPlan?.slug)
                                                .map(plan => (
                                                    <div key={plan.id} className="p-4 border rounded-lg hover:shadow-md transition">
                                                        <h4 className="font-semibold mb-2">{plan.name}</h4>
                                                        <p className="text-2xl font-bold mb-1">
                                                            ${plan.monthly_price}
                                                            <span className="text-sm text-muted-foreground font-normal">/month</span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mb-4">
                                                            or ${plan.yearly_price}/year
                                                        </p>
                                                        <Button
                                                            onClick={() => handleUpgradePlan(plan.id)}
                                                            disabled={isLoading}
                                                            size="sm"
                                                            className="w-full"
                                                        >
                                                            Upgrade Now
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
