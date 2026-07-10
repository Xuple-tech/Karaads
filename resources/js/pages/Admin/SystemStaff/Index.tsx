import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { KeyRound, Search, ShieldCheck, UserPlus } from 'lucide-react';

import { AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import Pagination, { type PaginationLink } from '@/components/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface Staff {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    permissions: string[] | null;
}

interface Props {
    staff: { data: Staff[]; links: PaginationLink[]; meta: unknown };
    filters: { search?: string; role?: string; status?: string };
    roles: string[];
    permissions: string[];
}

export default function SystemStaffIndex({ staff, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const { data, setData, post, processing, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(admin.systemStaff.index.url({ query: { search: search || undefined } }), {}, { preserveState: true });
    };

    const toggleActive = (id: string) => {
        router.post(admin.systemStaff.toggleActive.url(id));
    };

    const deleteStaff = (id: string) => {
        router.delete(admin.systemStaff.destroy.url(id));
    };

    const resetPassword = (id: string) => {
        post(admin.systemStaff.resetPassword.url(id), {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="System Staff" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Platform"
                        title="System staff"
                        description="Manage privileged admin, moderation, and finance staff accounts."
                        actions={
                            <Link href={admin.systemStaff.create.url()}>
                                <Button>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Create staff
                                </Button>
                            </Link>
                        }
                    />

                    <AdminSection title="Search" description="Find staff by name or email.">
                        <AdminPanel title="Staff search" description="Filter the current staff account list.">
                            <form className="flex gap-3" onSubmit={onSearch}>
                                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" />
                                <Button type="submit">
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </form>
                        </AdminPanel>
                    </AdminSection>

                    <AdminPanel title="Staff accounts" description="Review role assignments, active state, and account actions.">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staff.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                No staff records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        staff.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{item.role.replace(/_/g, ' ')}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={admin.systemStaff.edit.url(item.id)}>
                                                            <Button variant="outline" size="sm">Edit</Button>
                                                        </Link>
                                                        <Button size="sm" variant="outline" onClick={() => toggleActive(item.id)}>
                                                            {item.is_active ? 'Deactivate' : 'Activate'}
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="sm" variant="destructive">Delete</Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete this staff account?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This removes the staff account permanently unless backend protections block the action.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteStaff(item.id)} className="bg-red-600 hover:bg-red-700">
                                                                        Delete account
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </AdminPanel>

                    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card/80 px-4 py-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">Staff pages</p>
                                <p className="text-sm text-muted-foreground">Navigate the current staff result set.</p>
                            </div>
                        </div>
                        <Pagination links={staff.links} />
                    </div>

                    <AdminPanel title="Reset password" description="Submit a new password for a selected staff account.">
                        <div className="space-y-3">
                            <Input
                                type="password"
                                placeholder="New password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <Input
                                type="password"
                                placeholder="Confirm password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            <div className="flex flex-wrap gap-2">
                                {staff.data.map((item) => (
                                    <Button
                                        key={`rp-${item.id}`}
                                        size="sm"
                                        variant="outline"
                                        disabled={processing || !data.password || !data.password_confirmation}
                                        onClick={() => resetPassword(item.id)}
                                    >
                                        <KeyRound className="mr-2 h-4 w-4" />
                                        Reset {item.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </AdminPanel>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
