import React, { useState } from 'react';
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
import { MoreHorizontal, Download, Lock, Unlock, Eye, Trash2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    email_verified_at: string | null;
    subscription_status?: string;
    conversations_count?: number;
    chats_count?: number;
    created_at: string;
}

interface UsersPageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        role?: string;
        subscription_status?: string;
        search?: string;
        verified?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

const roleColors: Record<string, string> = {
    user: 'bg-blue-100 text-blue-800',
    staff: 'bg-orange-100 text-orange-800',
    admin: 'bg-red-100 text-red-800',
    saas_owner: 'bg-purple-100 text-purple-800',
};

const subscriptionStatusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    paused: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-gray-100 text-gray-800',
};

export default function UsersPage({
    users,
    filters,
}: UsersPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [subscriptionStatus, setSubscriptionStatus] = useState(
        filters.subscription_status || ''
    );
    const [verified, setVerified] = useState(filters.verified || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    const handleFilter = () => {
        const params: any = {};
        if (search) params.search = search;
        if (role) params.role = role;
        if (subscriptionStatus) params.subscription_status = subscriptionStatus;
        if (verified) params.verified = verified;
        params.sort_by = sortBy;
        params.sort_order = sortOrder;

        router.get(route('saas-owner.users.index'), params);
    };

    const handleReset = () => {
        setSearch('');
        setRole('');
        setSubscriptionStatus('');
        setVerified('');
        setSortBy('created_at');
        setSortOrder('desc');
        router.get(route('saas-owner.users.index'));
    };

    const handleExport = () => {
        window.location.href = route('saas-owner.users.export');
        toast.success('Users exported to CSV');
    };

    const handleToggleActive = (id: string) => {
        router.post(
            route('saas-owner.users.toggle-active', id),
            {},
            {
                onSuccess: () => toast.success('User status updated'),
                onError: () => toast.error('Failed to update user'),
            }
        );
    };

    const handleResetPassword = (id: string) => {
        if (confirm('Send password reset email to this user?')) {
            router.post(
                route('saas-owner.users.reset-password', id),
                { send_email: true },
                {
                    onSuccess: () => toast.success('Password reset email sent'),
                    onError: () => toast.error('Failed to send reset email'),
                }
            );
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            router.delete(
                route('saas-owner.users.destroy', id),
                {
                    onSuccess: () => toast.success('User deleted'),
                    onError: () => toast.error('Failed to delete user'),
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
                        <h1 className="text-3xl font-bold">Users</h1>
                        <p className="text-gray-500 mt-1">
                            Manage and monitor platform users
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Filters Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters & Search</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

                            {/* Role Filter */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Role
                                </label>
                                <Select value={role || 'all'} onValueChange={(value) => setRole(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="All roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All roles</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="saas_owner">SaaS Owner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Subscription Status */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Subscription Status
                                </label>
                                <Select value={subscriptionStatus || 'all'} onValueChange={(value) => setSubscriptionStatus(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="paused">Paused</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Email Verified */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Email Verified
                                </label>
                                <Select value={verified || 'all'} onValueChange={(value) => setVerified(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All users</SelectItem>
                                        <SelectItem value="true">Verified</SelectItem>
                                        <SelectItem value="false">Not verified</SelectItem>
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
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
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

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Users ({users.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.data.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Subscription</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Activity</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div>{user.email}</div>
                                                        {user.email_verified_at ? (
                                                            <Badge variant="outline" className="mt-1 text-xs">
                                                                ✓ Verified
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="mt-1 text-xs bg-yellow-50">
                                                                Unverified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={roleColors[user.role]}>
                                                        {user.role.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.subscription_status ? (
                                                        <Badge
                                                            className={
                                                                subscriptionStatusColors[user.subscription_status]
                                                            }
                                                        >
                                                            {user.subscription_status}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">None</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            user.is_active
                                                                ? 'bg-green-50 text-green-700'
                                                                : 'bg-red-50 text-red-700'
                                                        }
                                                    >
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div>
                                                        <div>{user.conversations_count || 0} chats</div>
                                                        <div className="text-gray-500">
                                                            {user.chats_count || 0} msgs
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(user.created_at).toLocaleDateString()}
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
                                                                        'saas-owner.users.show',
                                                                        user.id
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
                                                                        'saas-owner.users.edit',
                                                                        user.id
                                                                    )}
                                                                    className="cursor-pointer"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleResetPassword(user.id)}
                                                            >
                                                                <Mail className="w-4 h-4 mr-2" />
                                                                Reset Password
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleActive(user.id)}
                                                            >
                                                                {user.is_active ? (
                                                                    <>
                                                                        <Lock className="w-4 h-4 mr-2" />
                                                                        Deactivate
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Unlock className="w-4 h-4 mr-2" />
                                                                        Activate
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(user.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
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
                {users.last_page > 1 && (
                    <div className="text-center text-sm text-gray-600">
                        Page {users.current_page} of {users.last_page}
                    </div>
                )}
            </div>
        </SaasOwnerLayout>
    );
}
