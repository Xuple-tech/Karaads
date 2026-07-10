import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { BadgeCheck, CreditCard, Search, Wallet } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel } from '@/components/admin/page';
import Pagination, { type PaginationLink } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface BadgePaymentUser {
    id: string;
    name: string;
    email: string;
    username: string;
    status: string;
    kara_verified_at?: string | null;
    kara_verified_expires_at?: string | null;
}

interface BadgePayment {
    id: string;
    user?: BadgePaymentUser | null;
    status: string;
    category: string;
    full_name: string;
    contact_email: string;
    payment_amount?: string | number | null;
    payment_provider?: string | null;
    payment_reference?: string | null;
    paid_at?: string | null;
    updated_at: string;
    created_at: string;
}

interface BadgePaymentsProps {
    payments: {
        data: BadgePayment[];
        links: PaginationLink[];
    };
    filters: {
        search?: string;
        provider?: string;
    };
    summary: {
        total_paid: number;
        total_amount: number;
        paystack_count: number;
        wallet_count: number;
    };
}

const formatCurrency = (amount: number | string | null | undefined) => {
    const value = Number(amount ?? 0);

    return value.toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

const formatDate = (value?: string | null) => {
    if (!value) return 'Not recorded';

    return new Date(value).toLocaleString();
};

const providerLabel = (provider?: string | null) => provider || 'wallet';

export default function BadgePayments({ payments, filters, summary }: BadgePaymentsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [provider, setProvider] = useState(filters.provider || 'all');
    const rows = payments.data || [];

    const submitFilters = (event?: FormEvent) => {
        event?.preventDefault();
        router.get(
            '/admin/badge-payments',
            {
                search: search || undefined,
                provider: provider === 'all' ? undefined : provider,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Badge Payments" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Platform"
                        title="Badge payments"
                        description="People who successfully paid for the Kara Verified badge."
                        actions={
                            <Badge variant="outline" className="rounded-full px-3 py-1.5">
                                {summary.total_paid.toLocaleString()} paid
                            </Badge>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-4">
                        <AdminMetricCard label="Paid users" value={summary.total_paid.toLocaleString()} hint="Successful badge payments" icon={BadgeCheck} tone="success" />
                        <AdminMetricCard label="Total amount" value={formatCurrency(summary.total_amount)} hint="Badge revenue recorded" icon={CreditCard} />
                        <AdminMetricCard label="Paystack" value={summary.paystack_count.toLocaleString()} hint="Paid through Paystack" icon={CreditCard} />
                        <AdminMetricCard label="Wallet" value={summary.wallet_count.toLocaleString()} hint="Paid from wallet balance" icon={Wallet} />
                    </div>

                    <AdminPanel title="Search badge payments" description="Find users by name, username, email, or payment reference.">
                        <form onSubmit={submitFilters} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search user or reference..."
                            />
                            <Select
                                value={provider}
                                onValueChange={(value) => {
                                    setProvider(value);
                                    router.get(
                                        '/admin/badge-payments',
                                        {
                                            search: search || undefined,
                                            provider: value === 'all' ? undefined : value,
                                        },
                                        { preserveState: true, preserveScroll: true },
                                    );
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Payment provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All providers</SelectItem>
                                    <SelectItem value="paystack">Paystack</SelectItem>
                                    <SelectItem value="wallet">Wallet</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </form>
                    </AdminPanel>

                    <AdminPanel title="Paid badge users" description="Every successful badge payment recorded on the platform.">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Request</TableHead>
                                        <TableHead>Paid at</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                                No badge payments found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rows.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{payment.user?.name || payment.full_name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            @{payment.user?.username || 'user'} • {payment.user?.email || payment.contact_email}
                                                        </span>
                                                        {payment.user?.kara_verified_at ? (
                                                            <span className="mt-1 text-xs text-emerald-600">
                                                                Badge active until {payment.user.kara_verified_expires_at ? new Date(payment.user.kara_verified_expires_at).toLocaleDateString() : 'not set'}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {formatCurrency(payment.payment_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={providerLabel(payment.payment_provider) === 'paystack' ? 'default' : 'secondary'} className="capitalize">
                                                        {providerLabel(payment.payment_provider)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[220px] truncate font-mono text-xs">
                                                    {payment.payment_reference || 'No reference'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant={payment.status === 'approved' ? 'default' : 'outline'} className="w-fit capitalize">
                                                            {payment.status}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {payment.category?.replaceAll('_', ' ') || 'verification'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(payment.paid_at || payment.updated_at)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {payment.user ? (
                                                        <Link href={`/admin/users/${payment.user.id}`}>
                                                            <Button size="sm" variant="outline">
                                                                View user
                                                            </Button>
                                                        </Link>
                                                    ) : null}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </AdminPanel>

                    <div className="flex justify-end">
                        <Pagination links={payments.links || []} />
                    </div>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
