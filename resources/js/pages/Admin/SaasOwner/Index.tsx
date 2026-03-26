import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Building2, Mail, Calendar } from 'lucide-react';

interface SaasOwner {
    id: string;
    name: string;
    email: string;
    role: string;
    is_admin: number;
    email_verified_at: string | null;
    google_id: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
    language: string;
    ai_mode_id: string | null;
    call_by_name: boolean;
    tone_level: number;
    detail_level: number;
    response_length: number;
}

interface SaasOwnersIndexProps {
    owners: {
        data: SaasOwner[];
        links: any;
        current_page: number;
        last_page: number;
    };
}

export default function SaasOwnersIndex({ owners }: SaasOwnersIndexProps) {
    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this SaaS owner?')) {
            router.delete(route('admin.saas-owners.destroy', id));
        }
    };

    const getRoleBadge = (isAdmin: number, role: string) => {
        if (isAdmin === 1) {
            return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
        }
        return <Badge variant="outline">{role || 'Owner'}</Badge>;
    };

    const getVerificationStatus = (emailVerifiedAt: string | null) => {
        return emailVerifiedAt ? (
            <Badge className="bg-green-100 text-green-800" variant="secondary">Verified</Badge>
        ) : (
            <Badge variant="secondary">Pending</Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">SaaS Owner Management</h2>
                    <p className="text-muted-foreground mt-1">Manage platform owners and their accounts</p>
                </div>
                <Link href={route('admin.saas-owners.create')}>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add SaaS Owner
                    </Button>
                </Link>
            </div>

            {owners.data.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <div className="flex flex-col items-center justify-center">
                        <Building2 className="w-12 h-12 text--400 mb-4" />
                        <h3 className="text-lg font-semibold text--900 mb-2">No SaaS Owners</h3>
                        <p className="text--500 mb-4">Get started by adding your first SaaS owner</p>
                        <Link href={route('admin.saas-owners.create')}>
                            <Button>Add SaaS Owner</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg- rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Owner</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {owners.data.map((owner) => (
                                <TableRow key={owner.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium">
                                                {owner.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium">{owner.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {owner.language}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{owner.email}</span>
                                        </div>
                                        {owner.google_id && (
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                Google Auth
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getRoleBadge(owner.is_admin, owner.role)}
                                    </TableCell>
                                    <TableCell>
                                        {getVerificationStatus(owner.email_verified_at)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(owner.created_at)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Link href={route('admin.saas-owners.show', owner.id)}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.saas-owners.edit', owner.id)}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    <Pencil className="w-3 h-3 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-8"
                                                onClick={() => handleDelete(owner.id)}
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination */}
            {owners.data.length > 0 && owners.last_page > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                        Showing {owners.data.length} owners on page {owners.current_page} of {owners.last_page}
                    </div>
                    <div className="flex gap-2">
                        {owners.current_page > 1 && owners.links.prev && (
                            <Link href={owners.links.prev}>
                                <Button variant="outline" size="sm">
                                    Previous
                                </Button>
                            </Link>
                        )}
                        {owners.current_page < owners.last_page && owners.links.next && (
                            <Link href={owners.links.next}>
                                <Button variant="outline" size="sm">
                                    Next
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
