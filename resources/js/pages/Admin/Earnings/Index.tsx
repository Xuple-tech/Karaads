import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Download, Filter, Wallet } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import Pagination, { type PaginationLink } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Post {
    id: string;
    content: string;
}

interface Earning {
    id: string;
    amount: string;
    currency: string;
    earning_type: string;
    status: string;
    description: string;
    created_at: string;
    user?: User;
    post?: Post;
}

interface Withdrawal {
    id: string;
    amount: string;
    currency: string;
    payout_method: string;
    status: string;
    created_at: string;
    source?: string;
    detail_url?: string | null;
    user: User;
}

interface IndexProps {
    earnings: {
        data: Earning[];
        links: PaginationLink[];
        meta: unknown;
    };
    withdrawals: {
        data: Withdrawal[];
        links: PaginationLink[];
        meta: unknown;
    };
    filters: {
        search?: string;
        status?: string;
        type?: string;
        date_from?: string;
        date_to?: string;
    };
    statuses: string[];
    types: string[];
    financialSummary: {
        total_earnings: number;
        paid_earnings: number;
        total_withdrawals: number;
    };
}

export default function Index({
    earnings,
    withdrawals,
    filters,
    statuses,
    types,
    financialSummary,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [type, setType] = useState(filters.type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            admin.earnings.index.url({
                query: {
                    search: search || undefined,
                    status: status === 'all' ? undefined : status,
                    type: type === 'all' ? undefined : type,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
            }),
            {},
            { preserveState: true },
        );
    };

    const getStatusVariant = (value: string) => {
        if (value === 'paid' || value === 'completed' || value === 'success') return 'default';
        if (value === 'pending' || value === 'processing') return 'secondary';
        return 'destructive';
    };

    const formatCurrency = (amount: string | number, currency: string) =>
        new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency || 'NGN',
            maximumFractionDigits: 0,
        }).format(typeof amount === 'number' ? amount : parseFloat(amount));

    return (
        <>
            <Head title="Earnings Management" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Finance"
                        title="Earnings"
                        description="Monitor revenue entries and related withdrawals in a single finance workspace."
                        actions={
                            <>
                                <Link href={admin.earnings.daily.url()}>
                                    <Button variant="outline">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Daily report
                                    </Button>
                                </Link>
                                <Link href="/admin/earnings/by-post">
                                    <Button variant="outline">
                                        Post earning control
                                    </Button>
                                </Link>
                                <Button variant="outline" onClick={() => router.post(admin.earnings.export.url())}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </>
                        }
                    />

                    <section className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard
                            label="Total earnings"
                            value={formatCurrency(financialSummary.total_earnings, 'NGN')}
                            hint="All recorded earnings"
                            icon={Wallet}
                            tone="success"
                        />
                        <AdminMetricCard
                            label="Paid earnings"
                            value={formatCurrency(financialSummary.paid_earnings, 'NGN')}
                            hint="Completed payouts"
                            icon={Wallet}
                        />
                        <AdminMetricCard
                            label="Total withdrawals"
                            value={formatCurrency(financialSummary.total_withdrawals, 'NGN')}
                            hint="Manual and rewarded withdrawals"
                            icon={Wallet}
                            tone="warning"
                        />
                    </section>

                    <AdminSection title="Filters" description="Search earnings by account, type, status, or date range.">
                        <AdminPanel title="Filter earnings" description="Refine the current earnings result set.">
                            <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                                <div className="xl:col-span-2">
                                    <Input
                                        placeholder="Search by description or user..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        {statuses.map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        {types.map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {item.replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                                <Button type="submit" className="xl:col-span-6 xl:justify-self-start">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply filters
                                </Button>
                            </form>
                        </AdminPanel>
                    </AdminSection>

                    <AdminPanel title="Earnings ledger" description="Current earnings entries matching the applied filters.">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {earnings.data.length > 0 ? (
                                        earnings.data.map((earning) => (
                                            <TableRow key={earning.id}>
                                                <TableCell>
                                                    {new Date(earning.created_at).toLocaleDateString()}
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(earning.created_at).toLocaleTimeString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {earning.user ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{earning.user.name}</span>
                                                            <span className="text-xs text-muted-foreground">{earning.user.email}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">System</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{earning.earning_type.replace(/_/g, ' ')}</Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate" title={earning.description}>
                                                    {earning.description}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(earning.amount, earning.currency)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(earning.status)}>{earning.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                No earnings found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </AdminPanel>

                    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card/80 px-4 py-4">
                        <div>
                            <p className="font-medium">Earnings pages</p>
                            <p className="text-sm text-muted-foreground">Navigate the filtered earnings ledger.</p>
                        </div>
                        <Pagination links={earnings.links} />
                    </div>

                    <AdminPanel
                        title="Related withdrawals"
                        description="Manual and rewarded withdrawals in the same finance context."
                    >
                        <div className="mb-4 flex justify-end">
                            <Link href={admin.withdrawals.index.url()}>
                                <Button variant="outline">Open withdrawals</Button>
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {withdrawals.data.length > 0 ? (
                                        withdrawals.data.map((withdrawal) => (
                                            <TableRow key={withdrawal.id}>
                                                <TableCell>
                                                    {new Date(withdrawal.created_at).toLocaleDateString()}
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(withdrawal.created_at).toLocaleTimeString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{withdrawal.user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{withdrawal.user.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(withdrawal.amount, withdrawal.currency)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{withdrawal.payout_method.replace(/_/g, ' ')}</Badge>
                                                    {withdrawal.source === 'rewarded' ? (
                                                        <div className="mt-1">
                                                            <Badge variant="secondary">rewarded</Badge>
                                                        </div>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(withdrawal.status)}>{withdrawal.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                No withdrawals found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </AdminPanel>

                    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card/80 px-4 py-4">
                        <div>
                            <p className="font-medium">Withdrawal pages</p>
                            <p className="text-sm text-muted-foreground">Navigate the embedded finance withdrawal dataset.</p>
                        </div>
                        <Pagination links={withdrawals.links} />
                    </div>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
