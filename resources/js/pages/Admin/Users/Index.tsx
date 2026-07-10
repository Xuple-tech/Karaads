import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, Pencil, Search, Trash2, UserMinus, UserPlus, Users } from 'lucide-react';

import { AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import Pagination, { type PaginationLink } from '@/components/pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    created_at: string;
    status: 'active' | 'inactive' | 'suspended' | 'banned';
    kara_verified_at: string | null;
}

interface IndexProps {
    users: {
        data: User[];
        links: PaginationLink[];
        meta: unknown;
    };
    filters: {
        search?: string;
        verification?: string;
    };
    title?: string;
    description?: string | null;
    isVerificationPage?: boolean;
}

export default function Index({ users, filters, title = 'Users', description, isVerificationPage = false }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            window.location.pathname,
            { search, ...(isVerificationPage ? { verification: 'requests' } : {}) },
            { preserveState: true },
        );
    };

    const handleDelete = (id: string) => {
        router.delete(admin.users.destroy(id).url);
    };

    const handleDisable = (id: string) => {
        router.post(admin.users.disable(id).url);
    };

    const handleEnable = (id: string) => {
        router.post(admin.users.enable(id).url);
    };

    const handleGrantKaraVerified = (id: string) => {
        router.post(`/admin/users/${id}/kara-verified/grant`);
    };

    const handleRevokeKaraVerified = (id: string) => {
        router.post(`/admin/users/${id}/kara-verified/revoke`);
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();

        if (!csvFile || isImporting) {
            return;
        }

        setIsImporting(true);
        router.post(
            admin.users.import.url(),
            { csv_file: csvFile },
            {
                forceFormData: true,
                onFinish: () => {
                    setIsImporting(false);
                    setCsvFile(null);
                },
            },
        );
    };

    return (
        <>
            <Head title={title} />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Platform"
                        title={title}
                        description={description || 'Manage accounts, lifecycle actions, and CSV imports from one place.'}
                        actions={
                            <Badge variant="outline" className="rounded-full px-3 py-1.5">
                                {users.data.length} visible
                            </Badge>
                        }
                    />

                    <AdminSection
                        title="Filters"
                        description={
                            isVerificationPage
                                ? 'Search users who submitted a Kara Verified request from yesterday onward, plus recent fallback candidates.'
                                : 'Narrow the current result set or import accounts in bulk.'
                        }
                    >
                        <div className={`grid gap-6 ${isVerificationPage ? '' : 'xl:grid-cols-[1.2fr,0.8fr]'}`}>
                            <AdminPanel title="Search users" description="Find people by name, email, or username.">
                                <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search by name, email, or username..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit">
                                        <Search className="mr-2 h-4 w-4" />
                                        Search
                                    </Button>
                                </form>
                            </AdminPanel>

                            {!isVerificationPage ? (
                                <AdminPanel title="Import users" description="Existing users are skipped by email or phone during import.">
                                    <form onSubmit={handleImport} className="space-y-3">
                                        <Input
                                            type="file"
                                            accept=".csv,text/csv"
                                            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Only name, email, phone, and `createdAt` are imported. Balance fields are ignored.
                                        </p>
                                        <Button type="submit" disabled={!csvFile || isImporting}>
                                            <Download className="mr-2 h-4 w-4" />
                                            {isImporting ? 'Importing...' : 'Import CSV'}
                                        </Button>
                                    </form>
                                </AdminPanel>
                            ) : null}
                        </div>
                    </AdminSection>

                    <AdminPanel
                        title={isVerificationPage ? 'Submitted verification requests' : 'User directory'}
                        description={
                            isVerificationPage
                                ? 'This table includes saved Verify requests from yesterday onward and recent users that may not have been saved by the old profile flow.'
                                : 'Review user status and take account-level actions.'
                        }
                    >
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Badge</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>@{user.username}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                                        {user.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.kara_verified_at ? 'default' : 'outline'}>
                                                        {user.kara_verified_at ? 'Kara Verified' : 'Not verified'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        <Link href={admin.users.show(user.id).url}>
                                                            <Button variant="ghost" size="icon">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={admin.users.edit(user.id).url}>
                                                            <Button variant="ghost" size="icon">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {user.status === 'active' ? (
                                                            <Button variant="outline" size="sm" onClick={() => handleDisable(user.id)}>
                                                                <UserMinus className="mr-2 h-4 w-4" />
                                                                Disable
                                                            </Button>
                                                        ) : (
                                                            <Button variant="outline" size="sm" onClick={() => handleEnable(user.id)}>
                                                                <UserPlus className="mr-2 h-4 w-4" />
                                                                Enable
                                                            </Button>
                                                        )}
                                                        {user.kara_verified_at ? (
                                                            <Button variant="outline" size="sm" onClick={() => handleRevokeKaraVerified(user.id)}>
                                                                Remove badge
                                                            </Button>
                                                        ) : (
                                                            <Button size="sm" onClick={() => handleGrantKaraVerified(user.id)}>
                                                                Grant badge
                                                            </Button>
                                                        )}
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This permanently removes the account and associated data.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-700">
                                                                        Delete user
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                {isVerificationPage
                                                    ? 'No verification requests found.'
                                                    : 'No users found matching your criteria.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </AdminPanel>

                    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card/80 px-4 py-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">Pagination</p>
                                <p className="text-sm text-muted-foreground">Move through the current user result set.</p>
                            </div>
                        </div>
                        <Pagination links={users.links} />
                    </div>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
