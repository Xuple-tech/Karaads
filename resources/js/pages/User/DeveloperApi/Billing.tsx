import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import DeveloperPortalLayout from '@/layouts/developer-portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Wallet, CreditCard, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface WalletSummary {
    balance_usd: number;
    lifetime_credited_usd: number;
    lifetime_debited_usd: number;
}

interface LedgerEntry {
    id: string;
    type: 'topup' | 'debit' | 'adjustment';
    amount_usd: number;
    balance_before_usd: number;
    balance_after_usd: number;
    description: string;
    external_reference: string | null;
    created_at: string;
    api_key: { id: string; name: string; key_prefix: string } | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    wallet: WalletSummary | null;
    ledger: Paginated<LedgerEntry>;
    topupConfig: {
        default_amount_usd: number;
        min_amount_usd: number;
        max_amount_usd: number;
    };
}

function formatUsd(val: number) {
    return '$' + val.toFixed(val < 0.01 ? 6 : 4);
}

const typeColor: Record<string, string> = {
    topup: 'text-green-600 dark:text-green-400',
    debit: 'text-red-600 dark:text-red-400',
    adjustment: 'text-yellow-600 dark:text-yellow-400',
};

export default function DeveloperApiBilling({ wallet, ledger, topupConfig }: PageProps) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash ?? {};

    const w = wallet ?? { balance_usd: 0, lifetime_credited_usd: 0, lifetime_debited_usd: 0 };
    const [topupAmount, setTopupAmount] = useState(String(topupConfig.default_amount_usd));
    const [loading, setLoading] = useState(false);

    function handleTopup() {
        const amount = parseFloat(topupAmount);
        if (isNaN(amount) || amount < topupConfig.min_amount_usd || amount > topupConfig.max_amount_usd) {
            toast.error(`Amount must be between $${topupConfig.min_amount_usd} and $${topupConfig.max_amount_usd}`);
            return;
        }
        setLoading(true);
        router.post('/developer-api/top-up', { amount_usd: amount }, {
            onError: (e) => { toast.error(Object.values(e)[0] as string); setLoading(false); },
            onSuccess: () => setLoading(false),
        });
    }

    return (
        <DeveloperPortalLayout title="Billing">
            {flash.success && (
                <Alert className="mb-6">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertDescription>{flash.success}</AlertDescription>
                </Alert>
            )}
            {flash.error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Billing</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage your wallet balance and view transaction history.
                    </p>
                </div>

                {/* Wallet summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <Wallet className="w-4 h-4" /> Current Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">${w.balance_usd.toFixed(4)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4" /> Total Credited
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                ${w.lifetime_credited_usd.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4" /> Total Spent
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                ${w.lifetime_debited_usd.toFixed(4)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top-up */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Add Funds
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                            Top up your wallet via Stripe. Minimum ${topupConfig.min_amount_usd}, maximum ${topupConfig.max_amount_usd}.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium">$</span>
                                <Input
                                    type="number"
                                    value={topupAmount}
                                    onChange={(e) => setTopupAmount(e.target.value)}
                                    min={topupConfig.min_amount_usd}
                                    max={topupConfig.max_amount_usd}
                                    step={1}
                                    className="w-28"
                                />
                            </div>
                            <Button onClick={handleTopup} disabled={loading}>
                                <CreditCard className="w-4 h-4 mr-1.5" />
                                {loading ? 'Redirecting to Stripe…' : 'Add Funds'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction history */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">Transaction History</h2>
                    {ledger.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No transactions yet</p>
                                <p className="text-sm mt-1">Add funds to get started.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Balance After</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledger.data.map((e) => (
                                            <TableRow key={e.id}>
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(e.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn('text-xs font-medium capitalize', typeColor[e.type] ?? '')}>
                                                        {e.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm max-w-[240px] truncate">{e.description}</TableCell>
                                                <TableCell className={cn('text-right font-mono text-xs', typeColor[e.type] ?? '')}>
                                                    {e.type === 'debit' ? '-' : '+'}{formatUsd(Math.abs(e.amount_usd))}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs">
                                                    {formatUsd(e.balance_after_usd)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {ledger.last_page > 1 && (
                                <div className="flex justify-center gap-1 p-4 border-t">
                                    {ledger.links.map((link) => (
                                        <Button
                                            key={link.label}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="min-w-[2rem] text-xs"
                                        />
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </DeveloperPortalLayout>
    );
}
