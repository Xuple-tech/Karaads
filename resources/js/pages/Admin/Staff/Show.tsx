import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';

interface Staff {
    id: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
}

interface StaffShowProps {
    staff: Staff;
}

export default function StaffShow({ staff }: StaffShowProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this staff member?')) {
            router.delete(route('admin.staff.destroy', staff.id));
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Link href={route('admin.staff.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold">Staff Member Details</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{staff.name}</CardTitle>
                        <CardDescription>{staff.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="font-medium">
                                    {new Date(staff.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Last Updated</p>
                                <p className="font-medium">
                                    {new Date(staff.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href={route('admin.staff.edit', staff.id)}>
                                <Button>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
