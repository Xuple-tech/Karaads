import React, { useState, useMemo } from 'react';
import SaasOwnerLayout from '@/layouts/SaasOwnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, MoreHorizontal, Download, Pause, Play, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
}

interface Subscription {
    id: string;
    user_id: string;
    plan_id: string;
    user: {
        name: string;
        email: string;
    };
    plan: SubscriptionPlan;
    status: 'active' | 'cancelled' | 'expired' | 'paused';
    is_trial: boolean;
    started_at: string;
    renews_at: string;
    amount_paid: number;
}

interface SubscriptionsPageProps {
    subscriptions: {
        data: Subscription[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    paused: 'bg-yellow-100 text-yellow-800',
};

export default function SubscriptionsPage({
    subscriptions,
    filters,
}: SubscriptionsPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    const handleFilter = () => {
        const params: any = {};
        if (search) params.search = search;
        if (status) params.status = status;
        params.sort_by = sortBy;
        params.sort_order = sortOrder;

        router.get(route('saas-owner.subscriptions.index'), params);
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setSortBy('created_at');
        setSortOrder('desc');
        router.get(route('saas-owner.subscriptions.index'));
    };

    const handleExport = () => {
        window.location.href = route('saas-owner.subscriptions.export');
        toast.success('Subscriptions exported to CSV');
    };

    const handlePause = (id: string) => {
        router.post(
            route('saas-owner.subscriptions.pause', id),
            {},
            {
                onSuccess: () => toast.success('Subscription paused'),
                onError: () => toast.error('Failed to pause subscription'),
            }
        );
    };

    const handleResume = (id: string) => {
        router.post(
            route('saas-owner.subscriptions.resume', id),
            {},
            {
                onSuccess: () => toast.success('Subscription resumed'),
                onError: () => toast.error('Failed to resume subscription'),
            }
        );
    };

    const handleCancel = (id: string) => {
        if (confirm('Are you sure you want to cancel this subscription?')) {
            router.post(
                route('saas-owner.subscriptions.cancel', id),
                {},
                {
                    onSuccess: () => toast.success('Subscription cancelled'),
                    onError: () => toast.error('Failed to cancel subscription'),
                }
            );
        }
    };

    return (
        <SaasOwnerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Subscriptions</h1>
                        <p className="text-gray-500 mt-1">
                            Manage customer subscriptions and plans
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                        <Link href={route('saas-owner.subscriptions.create')}>
                            <Button size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                New Subscription
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters & Search</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search Input */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Search by Email or Name
                                </label>
                                <Input
                                    placeholder="john@example.com"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9"
                                />
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Status
                                </label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="paused">Paused</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Sort By
                                </label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at">Created Date</SelectItem>
                                        <SelectItem value="started_at">Start Date</SelectItem>
                                        <SelectItem value="renews_at">Renewal Date</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Order
                                </label>
                                <Select value={sortOrder} onValueChange={setSortOrder}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="asc">Ascending</SelectItem>
                                        <SelectItem value="desc">Descending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                            <Button size="sm" onClick={handleFilter}>
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscriptions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Subscriptions ({subscriptions.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {subscriptions.data.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No subscriptions found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Started</TableHead>
                                            <TableHead>Renews</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscriptions.data.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        <div>{sub.user.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {sub.user.email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{sub.plan.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Badge className={statusColors[sub.status]}>
                                                            {sub.status}
                                                        </Badge>
                                                        {sub.is_trial && (
                                                            <Badge variant="outline">Trial</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(sub.started_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(sub.renews_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    ${sub.amount_paid.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={route(
                                                                        'saas-owner.subscriptions.show',
                                                                        sub.id
                                                                    )}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={route(
                                                                        'saas-owner.subscriptions.edit',
                                                                        sub.id
                                                                    )}
                                                                    className="cursor-pointer"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {sub.status === 'active' && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handlePause(sub.id)
                                                                    }
                                                                >
                                                                    <Pause className="w-4 h-4 mr-2" />
                                                                    Pause
                                                                </DropdownMenuItem>
                                                            )}
                                                            {sub.status === 'paused' && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleResume(sub.id)
                                                                    }
                                                                >
                                                                    <Play className="w-4 h-4 mr-2" />
                                                                    Resume
                                                                </DropdownMenuItem>
                                                            )}
                                                            {sub.status !== 'cancelled' && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleCancel(sub.id)
                                                                    }
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Cancel
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination Info */}
                {subscriptions.last_page > 1 && (
                    <div className="text-center text-sm text-gray-600">
                        Page {subscriptions.current_page} of {subscriptions.last_page}
                    </div>
                )}
            </div>
        </SaasOwnerLayout>
    );
}
