import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Filter, Wallet } from 'lucide-react';

import { AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
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

interface WithdrawalRequest {
    id: string;
    amount: string;
    net_amount?: string;
    fee_amount?: string;
    currency: string;
    payout_method: string;
    status: string;
    created_at: string;
    source?: string;
    reference?: string;
    account_number?: string;
    bank_code?: string;
    provider_reference?: string;
    detail_url?: string | null;
    user: User;
}

interface IndexProps {
    withdrawals: {
        data: WithdrawalRequest[];
        links: PaginationLink[];
        meta: unknown;
    };
    filters: {
        search?: string;
        status?: string;
        method?: string;
        source?: string;
    };
    summary: {
        manual: {
            count: number;
            users: number;
            amount: number;
        };
        kara_ads_balance: {
            count: number;
            users: number;
            amount: number;
        };
    };
    statuses: string[];
    methods: string[];
    sources: string[];
}

export default function Index({ withdrawals, filters, summary, statuses, methods, sources }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [method, setMethod] = useState(filters.method || 'all');
    const [source, setSource] = useState(filters.source || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            admin.withdrawals.index.url({
                query: {
                    search: search || undefined,
                    status: status === 'all' ? undefined : status,
                    method: method === 'all' ? undefined : method,
                    source: source === 'all' ? undefined : source,
                },
            }),
            {},
            { preserveState: true },
        );
    };

    const getStatusVariant = (value: string) => {
        if (value === 'completed' || value === 'success') return 'default';
        if (value === 'pending' || value === 'processing') return 'secondary';
        return 'destructive';
    };

    const formatCurrency = (amount: string, currency: string) =>
        new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency || 'NGN',
            maximumFractionDigits: 0,
        }).format(parseFloat(amount));

    return (
        <>
            <Head title="Withdrawal Requests" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Finance"
                        title="Withdrawals"
                        description="Review manual withdrawals and every user who withdrew from Kara Ads balance."
                        actions={
                            <Badge variant="outline" className="rounded-full px-3 py-1.5">
                                {withdrawals.data.length} visible
                            </Badge>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <AdminPanel title="Kara Ads balance withdrawals" description="Users who withdrew from their rewarded Kara Ads balance.">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Metric label="Users" value={summary.kara_ads_balance.users.toLocaleString()} />
                                <Metric label="Withdrawals" value={summary.kara_ads_balance.count.toLocaleString()} />
                                <Metric label="Total" value={formatCurrency(String(summary.kara_ads_balance.amount), 'NGN')} />
                            </div>
                        </AdminPanel>
                        <AdminPanel title="Manual withdrawals" description="Older wallet withdrawal requests.">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Metric label="Users" value={summary.manual.users.toLocaleString()} />
                                <Metric label="Requests" value={summary.manual.count.toLocaleString()} />
                                <Metric label="Total" value={formatCurrency(String(summary.manual.amount), 'NGN')} />
                            </div>
                        </AdminPanel>
                    </div>

                    <AdminSection title="Filters" description="Search withdrawal requests by user, status, or payout method.">
                        <AdminPanel title="Filter requests" description="Apply finance filters without leaving the page.">
                            <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                <Input
                                    placeholder="Search by user..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Select value={source} onValueChange={setSource}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All sources</SelectItem>
                                        {sources.map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {item === 'rewarded' ? 'Kara Ads balance' : item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        {statuses.map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {item.charAt(0).toUpperCase() + item.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={method} onValueChange={setMethod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All methods</SelectItem>
                                        {methods.map((item) => (
                                            <SelectItem key={item} value={item}>
                                                {item.replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="submit">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                            </form>
                        </AdminPanel>
                    </AdminSection>

                    <AdminPanel title="Withdrawal users" description="Latest users who withdrew from manual wallets or Kara Ads rewarded balance.">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
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
                                                    {withdrawal.net_amount ? (
                                                        <div className="text-xs font-normal text-muted-foreground">
                                                            Net {formatCurrency(withdrawal.net_amount, withdrawal.currency)}
                                                            {withdrawal.fee_amount ? ` · Fee ${formatCurrency(withdrawal.fee_amount, withdrawal.currency)}` : ''}
                                                        </div>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[220px] truncate font-mono text-xs">
                                                        {withdrawal.reference || withdrawal.id}
                                                    </div>
                                                    {withdrawal.account_number || withdrawal.bank_code ? (
                                                        <div className="text-xs text-muted-foreground">
                                                            {withdrawal.account_number || 'No account'} {withdrawal.bank_code ? `· bank ${withdrawal.bank_code}` : ''}
                                                        </div>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{withdrawal.payout_method.replace(/_/g, ' ')}</Badge>
                                                    {withdrawal.source === 'rewarded' ? (
                                                        <div className="mt-1">
                                                            <Badge variant="secondary">Kara Ads balance</Badge>
                                                        </div>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(withdrawal.status)}>
                                                        {withdrawal.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {withdrawal.detail_url ? (
                                                        <Link href={withdrawal.detail_url}>
                                                            <Button variant="ghost" size="icon">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" disabled>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                                No withdrawal requests found.
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
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">Queue navigation</p>
                                <p className="text-sm text-muted-foreground">Move through the current withdrawal result set.</p>
                            </div>
                        </div>
                        <Pagination links={withdrawals.links} />
                    </div>
                </AdminPage>
            </AdminLayout>
        </>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-black">{value}</p>
        </div>
    );
}
