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
import { Pencil, Trash2, Plus, Users } from 'lucide-react';

interface Staff {
    id: string;
    name: string;
    email: string;
    role: string;
    is_admin: number;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface StaffIndexProps {
    staff: {
        data: Staff[];
        links: any;
        current_page: number;
        last_page: number;
    };
}

export default function StaffIndex({ staff }: StaffIndexProps) {
    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this staff member?')) {
            router.delete(route('admin.staff.destroy', id));
        }
    };

    const getRoleBadge = (isAdmin: number, role: string) => {
        if (isAdmin === 1) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Admin</span>;
        }
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{role || 'Staff'}</span>;
    };

    const getVerificationStatus = (emailVerifiedAt: string | null) => {
        return emailVerifiedAt ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
        );
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Staff Management</h2>
                    <p className="text-muted-foreground mt-1">Manage your team members and their permissions</p>
                </div>
                <Link href={route('admin.staff.create')}>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Staff Member
                    </Button>
                </Link>
            </div>

            {staff.data.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text--400 mb-4" />
                        <h3 className="text-lg font-semibold text--900 mb-2">No staff members</h3>
                        <p className="text--500 mb-4">Get started by adding your first staff member</p>
                        <Link href={route('admin.staff.create')}>
                            <Button>Add Staff Member</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className=" rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.data.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium">{member.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {member.email}
                                    </TableCell>
                                    <TableCell>
                                        {getRoleBadge(member.is_admin, member.role)}
                                    </TableCell>
                                    <TableCell>
                                        {getVerificationStatus(member.email_verified_at)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(member.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Link href={route('admin.staff.edit', member.id)}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    <Pencil className="w-3 h-3 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-8"
                                                onClick={() => handleDelete(member.id)}
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
            {staff.data.length > 0 && staff.last_page > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                        Showing page {staff.current_page} of {staff.last_page}
                    </div>
                    <div className="flex gap-2">
                        {staff.current_page > 1 && (
                            <Link href={staff.links.prev}>
                                <Button variant="outline" size="sm">
                                    Previous
                                </Button>
                            </Link>
                        )}
                        {staff.current_page < staff.last_page && (
                            <Link href={staff.links.next}>
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
