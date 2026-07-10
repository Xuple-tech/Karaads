import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';

import { ArrowLeft, Search } from 'lucide-react';
import admin from '@/routes/admin';

interface User {
    id: string;
    name: string;
    email: string;
}

interface UserEarning {
    user_id: string;
    total_amount: string;
    count: number;
    user: User;
}

interface ByUserProps {
    userEarnings: {
        data: UserEarning[];
        links: unknown[];
        meta: unknown;
    };
    filters: {
        search?: string;
    };
}

export default function ByUser({ userEarnings, filters }: ByUserProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
           admin.earnings.byUser.url(),
            { search },
            { preserveState: true }
        );
    };

    const formatCurrency = (amount: string) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(amount));

    return (
        <>
            <Head title="Earnings by User" />

            <AdminLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href={admin.earnings.index.url()}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Earnings by User
                            </h1>
                            <p className="text-muted-foreground">
                                Overview of top earning users
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Search</CardTitle>
                            <CardDescription>
                                Find users by name or email
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSearch}
                                className="flex max-w-lg gap-3"
                            >
                                <Input
                                    placeholder="e.g. john@example.com"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />
                                <Button type="submit">
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User Earnings</CardTitle>
                        </CardHeader>

                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Transactions</TableHead>
                                        <TableHead className="text-right">
                                            Total
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {userEarnings.data.length ? (
                                        userEarnings.data.map((item) => (
                                            <TableRow key={item.user_id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage
                                                                src=""
                                                                alt={
                                                                    item.user
                                                                        .name
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {item.user.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="leading-tight">
                                                            <p className="font-medium">
                                                                {item.user.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    item.user
                                                                        .email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {item.count}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-right font-semibold">
                                                    {formatCurrency(
                                                        item.total_amount
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <Link
                                                        href={route(
                                                            'admin.users.earnings',
                                                            item.user_id
                                                        )}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            View
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    <Pagination links={userEarnings.links} />
                </div>
            </AdminLayout>
        </>
    );
}
