import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Trash2, AlertCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
}

export default function PaymentMethodsManager() {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/stripe/payment-methods');
            const data = await response.json();

            if (data.success) {
                setPaymentMethods(data.paymentMethods || []);
            } else {
                setError('Failed to load payment methods');
            }
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
            setError('Failed to load payment methods');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePaymentMethod = async (paymentMethodId: string) => {
        if (!confirm('Are you sure you want to delete this payment method?')) {
            return;
        }

        setIsDeleting(paymentMethodId);
        try {
            const response = await fetch(`/stripe/payment-method/${paymentMethodId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Payment method deleted successfully');
                setPaymentMethods(paymentMethods.filter(pm => pm.id !== paymentMethodId));
            } else {
                toast.error(data.error || 'Failed to delete payment method');
            }
        } catch (error) {
            console.error('Failed to delete payment method:', error);
            toast.error('Failed to delete payment method');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleAddPaymentMethod = async () => {
        const portalUrl = await createBillingPortalSession();
        if (portalUrl) {
            window.location.href = portalUrl;
        }
    };

    const createBillingPortalSession = async () => {
        try {
            const response = await fetch('/stripe/billing-portal');
            const data = await response.json();

            if (data.success) {
                return data.portal_url;
            } else {
                toast.error('Failed to access payment settings');
                return null;
            }
        } catch (error) {
            console.error('Failed to create billing portal session:', error);
            toast.error('Failed to access payment settings');
            return null;
        }
    };

    const getCardBrandColor = (brand: string) => {
        switch (brand?.toLowerCase()) {
            case 'visa':
                return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
            case 'mastercard':
                return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
            case 'amex':
                return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
            default:
                return 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Methods
                    </CardTitle>
                    <CardDescription>Manage your saved payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Methods
                        </CardTitle>
                        <CardDescription>Manage your saved payment methods</CardDescription>
                    </div>
                    <Button onClick={handleAddPaymentMethod} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                    </Alert>
                )}

                {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                        <p className="text-muted-foreground mb-4">No payment methods saved yet</p>
                        <Button onClick={handleAddPaymentMethod}>Add Payment Method</Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className={`p-4 rounded-lg border-2 ${getCardBrandColor(method.brand)}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold">
                                                <Badge className="mr-2">{method.brand.toUpperCase()}</Badge>
                                                •••• {method.last4}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Expires {String(method.expMonth).padStart(2, '0')}/{method.expYear}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeletePaymentMethod(method.id)}
                                        disabled={isDeleting === method.id}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {paymentMethods.length > 0 && (
                    <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                            Manage all your payment methods and billing settings in the Stripe billing portal
                        </p>
                        <Button variant="outline" className="w-full" onClick={handleAddPaymentMethod}>
                            Open Billing Portal
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
