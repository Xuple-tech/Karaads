import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, Calendar, Clock, TrendingUp, Edit, Trash2, ToggleLeft, RotateCcw, CalendarPlus } from 'lucide-react';

const Show = ({ subscription, history }) => {
    const handleEdit = () => {
        window.location.href = route('admin.site-subscriptions.edit', subscription.id);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this subscription?')) {
            window.location.href = route('admin.site-subscriptions.destroy', {
                siteSubscription: subscription.id,
                _method: 'DELETE'
            });
        }
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this subscription?')) {
            window.location.href = route('admin.site-subscriptions.cancel', subscription.id);
        }
    };

    const handleRenew = () => {
        if (confirm('Are you sure you want to renew this subscription?')) {
            window.location.href = route('admin.site-subscriptions.renew', subscription.id);
        }
    };

    const handleReactivate = () => {
        if (confirm('Are you sure you want to reactivate this subscription?')) {
            window.location.href = route('admin.site-subscriptions.reactivate', subscription.id);
        }
    };

    const handleSyncStripe = () => {
        window.location.href = route('admin.site-subscriptions.sync-stripe', subscription.id);
    };

    return (
        <AdminLayout>
            <Head title={`Subscription - ${subscription.site?.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Subscription Details
                        </h1>
                        <p className="text-muted-foreground">
                            Details for {subscription.site?.name} - {subscription.plan?.name}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleSyncStripe}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Sync Stripe
                        </Button>
                        <Button variant="outline" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        <Button onClick={handleEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <DollarSign className="h-8 w-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                                    <p className="text-2xl font-bold">
                                        {subscription.currency} {subscription.price}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <TrendingUp className="h-8 w-8 text-green-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                                        {subscription.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Calendar className="h-8 w-8 text-purple-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Billing Cycle</p>
                                    <Badge variant="outline">
                                        {subscription.billing_cycle}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-orange-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">User</p>
                                    <p className="text-xl font-bold truncate">{subscription.user?.name}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">Site</h3>
                                <p className="text-muted-foreground mt-1">{subscription.site?.name} ({subscription.site?.domain})</p>
                            </div>

                            <div>
                                <h3 className="font-medium">Plan</h3>
                                <p className="text-muted-foreground mt-1">{subscription.plan?.name}</p>
                            </div>

                            <div>
                                <h3 className="font-medium">User</h3>
                                <p className="text-muted-foreground mt-1">{subscription.user?.name} ({subscription.user?.email})</p>
                            </div>

                            <div>
                                <h3 className="font-medium">Stripe Subscription ID</h3>
                                <p className="text-muted-foreground mt-1">
                                    {subscription.stripe_subscription_id || 'Not set'}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Stripe Customer ID</h3>
                                <p className="text-muted-foreground mt-1">
                                    {subscription.stripe_customer_id || 'Not set'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">Starts At</h3>
                                <p className="text-muted-foreground mt-1">
                                    {new Date(subscription.starts_at).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Expires At</h3>
                                <p className="text-muted-foreground mt-1">
                                    {subscription.expires_at ? new Date(subscription.expires_at).toLocaleString() : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Canceled At</h3>
                                <p className="text-muted-foreground mt-1">
                                    {subscription.canceled_at ? new Date(subscription.canceled_at).toLocaleString() : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Trial Ends At</h3>
                                <p className="text-muted-foreground mt-1">
                                    {subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleString() : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Created At</h3>
                                <p className="text-muted-foreground mt-1">
                                    {new Date(subscription.created_at).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {subscription.status === 'active' ? (
                                <Button variant="outline" onClick={handleCancel}>
                                    <ToggleLeft className="h-4 w-4 mr-2" />
                                    Cancel Subscription
                                </Button>
                            ) : (
                                <Button onClick={handleReactivate}>
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Reactivate Subscription
                                </Button>
                            )}
                            <Button onClick={handleRenew}>
                                <CalendarPlus className="h-4 w-4 mr-2" />
                                Renew Subscription
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={route('admin.site-subscriptions.analytics')}>
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    View Analytics
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {history.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Plan</th>
                                            <th className="text-left py-2">Status</th>
                                            <th className="text-left py-2">Price</th>
                                            <th className="text-left py-2">Starts</th>
                                            <th className="text-left py-2">Expires</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((sub, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="py-2">{sub.plan?.name}</td>
                                                <td className="py-2">
                                                    <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                                        {sub.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </Badge>
                                                </td>
                                                <td className="py-2">{sub.currency} {sub.price}</td>
                                                <td className="py-2">{new Date(sub.starts_at).toLocaleDateString()}</td>
                                                <td className="py-2">{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
};

export default Show;
