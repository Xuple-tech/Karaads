import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/AdminLayout';
import { Edit, Trash2, Plus, TrendingUp } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    slug: string;
    monthly_price: number;
    yearly_price?: number;
    requests_per_day?: number;
    requests_per_month?: number;
    is_active: boolean;
    display_order: number;
    active_subscriptions_count?: number;
}

interface SubscriptionPlansIndexProps {
    plans: Plan[];
}

export default function SubscriptionPlansIndex({ plans }: SubscriptionPlansIndexProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async (planId: string, planName: string) => {
        if (!confirm(`Are you sure you want to delete the "${planName}" plan?`)) return;

        setLoading(true);
        try {
            const response = await fetch(`/admin/subscriptions/plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                router.reload();
            } else {
                alert('Failed to delete plan');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (planId: string, isActive: boolean) => {
        setLoading(true);
        try {
            const response = await fetch(`/admin/subscriptions/plans/${planId}/deactivate`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ is_active: !isActive }),
            });

            if (response.ok) {
                router.reload();
            } else {
                alert('Failed to update plan status');
            }
        } catch (error) {
            console.error('Toggle error:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Subscription Plans" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage subscription tiers and features
                        </p>
                    </div>
                    <Button onClick={() => router.visit('/admin/subscriptions/plans/create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Plan
                    </Button>
                </div>

                {/* Plans Table */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Daily Limit</TableHead>
                                <TableHead>Active Users</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium">{plan.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{plan.slug}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        ${(plan.monthly_price ?? '0') || 0}/mo
                                        {plan.yearly_price && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                ${plan.yearly_price}/yr
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {plan.requests_per_day
                                            ? `${plan.requests_per_day.toLocaleString()} requests`
                                            : 'Unlimited'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                                            {plan.active_subscriptions_count || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {plan.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.visit(`/admin/subscriptions/plans/${plan.id}/edit`)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(plan.id, plan.name)}
                                            disabled={loading}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                {/* Info Card */}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 p-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        💡 Plan Management Tips
                    </h3>
                    <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                        <li>• Plans must have unique slugs (internal identifiers)</li>
                        <li>• Null limits mean unlimited for that metric</li>
                        <li>• Changing plan limits affects new subscriptions only</li>
                        <li>• Deactivating a plan prevents new signups but keeps existing subscriptions</li>
                    </ul>
                </Card>
            </div>
        </AdminLayout>
    );
}
