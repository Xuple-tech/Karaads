import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart3, DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import DataTable from '@/components/Admin/DataTable';
import FilterBar from '@/components/Admin/FilterBar';
import StatsCard from '@/components/Admin/StatsCard';
import { Badge } from '@/components/ui/badge';

const Index = ({ subscriptions, metrics, filters, sites, plans, statuses, billingCycles }) => {
    const { auth } = usePage().props;
    const [currentFilters, setCurrentFilters] = useState(filters || {});

    const columns = [
        { key: 'site.name', title: 'Site' },
        { key: 'plan.name', title: 'Plan', type: 'badge' },
        { key: 'user.name', title: 'User' },
        { key: 'status', title: 'Status', type: 'badge' },
        { key: 'billing_cycle', title: 'Cycle', type: 'badge' },
        { key: 'price', title: 'Price', type: 'currency' },
        { key: 'currency', title: 'Currency', type: 'badge' },
        { key: 'starts_at', title: 'Starts', type: 'date' },
        { key: 'expires_at', title: 'Expires', type: 'date' },
    ];

    const handleFilterChange = (name, value) => {
        setCurrentFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetFilters = () => {
        setCurrentFilters({});
        window.location.href = route('admin.site-subscriptions.index');
    };

    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        window.location.href = `${route('admin.site-subscriptions.index')}?${params.toString()}`;
    };

    const filterOptions = [
        {
            name: 'search',
            placeholder: 'Search sites',
            value: currentFilters.search
        },
        {
            name: 'site_id',
            placeholder: 'Filter by Site',
            options: [
                { value: '', label: 'All Sites' },
                ...sites.map(site => ({ value: site.id, label: `${site.name} (${site.domain})` }))
            ]
        },
        {
            name: 'plan_id',
            placeholder: 'Filter by Plan',
            options: [
                { value: '', label: 'All Plans' },
                ...plans.map(plan => ({ value: plan.id, label: plan.name }))
            ]
        },
        {
            name: 'status',
            placeholder: 'Filter by Status',
            options: [
                { value: '', label: 'All Statuses' },
                ...statuses.map(status => ({
                    value: status,
                    label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                }))
            ]
        },
        {
            name: 'billing_cycle',
            placeholder: 'Filter by Billing Cycle',
            options: [
                { value: '', label: 'All Cycles' },
                ...billingCycles.map(cycle => ({ value: cycle, label: cycle.replace('_', ' ') }))
            ]
        }
    ];

    const statsCards = [
        {
            title: 'Total Subscriptions',
            value: metrics.total?.toLocaleString() || 0,
            icon: Users,
            description: 'All subscriptions',
            variant: 'primary'
        },
        {
            title: 'Active Subscriptions',
            value: metrics.active?.toLocaleString() || 0,
            icon: TrendingUp,
            description: 'Currently active',
            variant: 'success'
        },
        {
            title: 'Monthly Recurring',
            value: `$${metrics.monthly_recurring?.toLocaleString()}`,
            icon: DollarSign,
            description: 'Monthly revenue',
            variant: 'default'
        },
        {
            title: 'Yearly Recurring',
            value: `$${metrics.yearly_recurring?.toLocaleString()}`,
            icon: DollarSign,
            description: 'Yearly revenue',
            variant: 'default'
        },
    ];

    const handleEdit = (subscription) => {
        window.location.href = route('admin.site-subscriptions.edit', subscription.id);
    };

    const handleShow = (subscription) => {
        window.location.href = route('admin.site-subscriptions.show', subscription.id);
    };

    const handleDelete = (subscription) => {
        if (confirm('Are you sure you want to delete this subscription?')) {
            window.location.href = route('admin.site-subscriptions.destroy', {
                siteSubscription: subscription.id,
                _method: 'DELETE'
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Site Subscriptions" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Site Subscriptions</h1>
                        <p className="text-muted-foreground">
                            Manage and monitor all site subscriptions
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.site-subscriptions.analytics')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Analytics
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('admin.site-subscriptions.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Subscription
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((stat, index) => (
                        <StatsCard key={index} {...stat} />
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Subscriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterBar
                            filters={filterOptions}
                            onFilterChange={handleFilterChange}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                        />
                    </CardContent>
                </Card>

                {/* Subscriptions Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>All Subscriptions</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={subscriptions.data}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onShow={handleShow}
                            actions={[
                                {
                                    label: 'Cancel',
                                    onClick: (subscription) => {
                                        if (confirm('Are you sure you want to cancel this subscription?')) {
                                            window.location.href = route('admin.site-subscriptions.cancel', subscription.id);
                                        }
                                    },
                                    variant: 'outline',
                                    size: 'sm'
                                },
                                {
                                    label: 'Renew',
                                    onClick: (subscription) => {
                                        if (confirm('Are you sure you want to renew this subscription?')) {
                                            window.location.href = route('admin.site-subscriptions.renew', subscription.id);
                                        }
                                    },
                                    variant: 'outline',
                                    size: 'sm'
                                }
                            ]}
                            pagination={{
                                total: subscriptions.total,
                                from: subscriptions.from,
                                to: subscriptions.to,
                                currentPage: subscriptions.current_page,
                                lastPage: subscriptions.last_page,
                                prevPageUrl: subscriptions.prev_page_url,
                                nextPageUrl: subscriptions.next_page_url,
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Index;
