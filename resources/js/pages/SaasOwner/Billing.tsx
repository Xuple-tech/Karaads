import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle, AlertCircle, Crown } from 'lucide-react';

interface BillingPageProps {
    settings: {
        name: string;
        plan: string;
        message_limit: number;
        created_at: string;
    } | null;
    plans: {
        [key: string]: {
            name: string;
            price: number | string;
            messages: number | string;
        };
    };
}

const Billing: React.FC<BillingPageProps> = ({ settings, plans }) => {
    const currentPlan = settings?.plan?.toLowerCase() || 'free';

    return (
        <>
            <Head title="Billing & Subscription" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
                </div>

                {/* Current Plan Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Current Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Crown className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {plans[currentPlan]?.name || 'Free Plan'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {typeof plans[currentPlan]?.price === 'number'
                                            ? `$${plans[currentPlan].price}/month`
                                            : plans[currentPlan]?.price}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={currentPlan === 'pro' ? 'default' : 'secondary'}>
                                {currentPlan.toUpperCase()}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Available Plans */}
                <div className="grid gap-6 md:grid-cols-3">
                    {Object.entries(plans).map(([key, plan]) => {
                        const isCurrentPlan = key === currentPlan;
                        const isPopular = key === 'pro';

                        return (
                            <Card key={key} className={`relative ${isPopular ? 'border-primary' : ''}`}>
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-primary text-primary-foreground">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="text-center">
                                    <CardTitle className="flex items-center justify-center gap-2">
                                        {plan.name}
                                        {isCurrentPlan && <CheckCircle className="h-5 w-5 text-green-500" />}
                                    </CardTitle>
                                    <div className="text-3xl font-bold">
                                        {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                                        {typeof plan.price === 'number' && (
                                            <span className="text-sm font-normal text-muted-foreground">/month</span>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>
                                                {typeof plan.messages === 'number'
                                                    ? `${plan.messages.toLocaleString()} messages`
                                                    : plan.messages} per month
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Custom AI prompts</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Team member management</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Advanced analytics</span>
                                        </div>
                                        {key === 'enterprise' && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>Priority support</span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        className="w-full"
                                        variant={isCurrentPlan ? 'outline' : 'default'}
                                        disabled={isCurrentPlan}
                                    >
                                        {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Billing History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Billing History</CardTitle>
                        <CardDescription>
                            View your past invoices and payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No billing history available.</p>
                            <p className="text-sm mt-2">
                                Billing features will be available when you upgrade to a paid plan.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Billing;
