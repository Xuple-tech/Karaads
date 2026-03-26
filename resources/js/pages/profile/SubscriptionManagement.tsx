import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    Zap,
    Calendar,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
    id: string;
    name: string;
    slug: string;
    monthly_price: number;
    yearly_price: number;
}

interface Subscription {
    id: string;
    plan_id: string;
    status: 'active' | 'cancelled' | 'expired' | 'pending_payment';
    started_at: string;
    renews_at: string;
    cancelled_at: string | null;
    expires_at: string | null;
    payment_method: string;
    is_trial: boolean;
    trial_ends_at: string | null;
    amount_paid: number;
}

interface SubscriptionManagementProps {
    currentSubscription: Subscription | null;
    currentPlan: Plan | null;
    availablePlans: Plan[];
}

export default function SubscriptionManagement({
    currentSubscription,
    currentPlan,
    availablePlans,
}: SubscriptionManagementProps) {
    const { auth } = usePage().props;
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (!currentSubscription || !currentPlan) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>No Active Subscription</CardTitle>
                    <CardDescription>You're currently on the free plan</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        Upgrade to a paid plan to unlock premium features and higher limits.
                    </p>
                    <Button onClick={() => window.location.href = '/subscription/pricing'}>
                        View Plans
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Current Plan Status */}
            <Card className={cn(
                'border-2',
                currentSubscription.status === 'active' ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'
            )}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <CardTitle>{currentPlan.name}</CardTitle>
                                <Badge className={getStatusColor(currentSubscription.status)}>
                                    <span className="flex items-center gap-1">
                                        {getStatusIcon(currentSubscription.status)}
                                        {currentSubscription.status.replace('_', ' ')}
                                    </span>
                                </Badge>
                            </div>
                            <CardDescription>Your current subscription plan</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Trial Info */}
                    {currentSubscription.is_trial && currentSubscription.trial_ends_at && (
                        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-semibold mb-1">Free Trial Active</p>
                                <p className="text-sm">
                                    Trial ends on {formatDate(currentSubscription.trial_ends_at)}. Your card will not be charged until the trial ends.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Payment Warning */}
                    {currentSubscription.status === 'pending_payment' && (
                        <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-semibold mb-1">Payment Issue</p>
                                <p className="text-sm">
                                    There's an issue with your payment method. Please update it to continue service.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Subscription Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Started</p>
                            <p className="text-base font-semibold">
                                {formatDate(currentSubscription.started_at)}
                            </p>
                        </div>

                        {currentSubscription.status === 'active' && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Renews</p>
                                <p className="text-base font-semibold">
                                    {formatDate(currentSubscription.renews_at)}
                                </p>
                            </div>
                        )}

                        {currentSubscription.cancelled_at && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                                <p className="text-base font-semibold">
                                    {formatDate(currentSubscription.cancelled_at)}
                                </p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                            <p className="text-base font-semibold capitalize">
                                {currentSubscription.payment_method}
                            </p>
                        </div>

                        {currentSubscription.amount_paid > 0 && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Monthly Amount</p>
                                <p className="text-base font-semibold">
                                    ${currentSubscription.amount_paid.toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {currentSubscription.status === 'active' && (
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                onClick={() => window.location.href = '/subscription/pricing'}
                                variant="outline"
                            >
                                <Zap className="mr-2 h-4 w-4" />
                                Change Plan
                            </Button>

                            {!showCancelConfirm ? (
                                <Button
                                    onClick={() => setShowCancelConfirm(true)}
                                    variant="destructive"
                                >
                                    Cancel Subscription
                                </Button>
                            ) : (
                                <div className="flex gap-2 ml-auto">
                                    <Button
                                        onClick={() => setShowCancelConfirm(false)}
                                        variant="outline"
                                        disabled={isLoading}
                                    >
                                        Keep Subscription
                                    </Button>
                                    <Button
                                        onClick={handleCancelSubscription}
                                        variant="destructive"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Cancelling...' : 'Confirm Cancel'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {currentSubscription.status === 'cancelled' && (
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-4">
                                Your subscription has been cancelled. You can reactivate it or choose a different plan.
                            </p>
                            <Button onClick={() => window.location.href = '/subscription/pricing'}>
                                Explore Plans
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Available Plans */}
            {currentPlan.slug !== 'pro' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Upgrade Your Plan
                        </CardTitle>
                        <CardDescription>
                            See what other plans are available
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            {availablePlans.map((plan) => {
                                if (plan.slug === currentPlan.slug) return null;

                                return (
                                    <div key={plan.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <h3 className="font-semibold mb-2">{plan.name}</h3>
                                        <p className="text-2xl font-bold mb-4">
                                            ${plan.monthly_price}
                                            <span className="text-sm text-muted-foreground font-normal">/month</span>
                                        </p>
                                        <Button
                                            onClick={() => window.location.href = '/subscription/pricing'}
                                            className="w-full"
                                            variant={plan.slug === 'pro' ? 'default' : 'outline'}
                                        >
                                            {currentPlan.monthly_price < plan.monthly_price ? 'Upgrade' : 'Downgrade'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
