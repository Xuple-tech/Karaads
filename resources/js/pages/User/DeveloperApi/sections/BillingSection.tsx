import React, { useState } from 'react';
import { CreditCard, Landmark, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Panel, StatCard, DataTable, Td, Pagination, formatDate } from '../components';
import type { BreakdownsData, LedgerRow, Paginated, TopupConfig, WalletData } from '../types';

type Props = {
    wallet: WalletData;
    breakdowns: BreakdownsData;
    ledger: Paginated<LedgerRow>;
    topupConfig: TopupConfig;
    consoleBaseUrl: string;
    topupAmount: number;
    topupProvider: 'stripe' | 'paystack';
    topupProcessing: boolean;
    onSetTopupAmount: (amount: number) => void;
    onSetTopupProvider: (provider: 'stripe' | 'paystack') => void;
    onTopup: () => void;
};

export function BillingSection({
    wallet,
    breakdowns,
    ledger,
    topupConfig,
    topupAmount,
    topupProvider,
    topupProcessing,
    onSetTopupAmount,
    onSetTopupProvider,
    onTopup,
}: Props) {
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const handleTopup = () => {
        onTopup();
        setCheckoutOpen(false);
    };

    const isAmountValid =
        topupAmount >= topupConfig.min_amount_usd && topupAmount <= topupConfig.max_amount_usd;

    return (
        <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Balance"
                    value={`$${wallet.balance_usd.toFixed(4)}`}
                    icon={<Wallet className="h-4 w-4" />}
                />
                <StatCard
                    label="Lifetime Credits"
                    value={`$${wallet.lifetime_credited_usd.toFixed(4)}`}
                    icon={<TrendingUp className="h-4 w-4" />}
                />
                <StatCard
                    label="Period Credits"
                    value={`$${breakdowns.ledger.credits_usd.toFixed(4)}`}
                    sub="This period"
                    icon={<CreditCard className="h-4 w-4" />}
                />
                <StatCard
                    label="Period Debits"
                    value={`$${breakdowns.ledger.debits_usd.toFixed(4)}`}
                    sub="This period"
                    icon={<TrendingDown className="h-4 w-4" />}
                />
            </div>

            {/* Top up */}
            <Panel
                title="Add Credits"
                description={`Enter amount between $${topupConfig.min_amount_usd} and $${topupConfig.max_amount_usd}.`}
                action={
                    <Button
                        size="sm"
                        onClick={() => setCheckoutOpen(true)}
                        disabled={!isAmountValid}
                        className="gap-1.5"
                    >
                        <CreditCard className="h-3.5 w-3.5" />
                        Checkout
                    </Button>
                }
            >
                <div className="flex items-end gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Amount (USD)
                        </label>
                        <Input
                            type="number"
                            min={topupConfig.min_amount_usd}
                            max={topupConfig.max_amount_usd}
                            step="0.01"
                            value={topupAmount}
                            onChange={(e) => onSetTopupAmount(Number(e.target.value))}
                            className="w-40"
                        />
                        {!isAmountValid && topupAmount > 0 && (
                            <p className="text-xs text-destructive">
                                Must be between ${topupConfig.min_amount_usd}  ${topupConfig.max_amount_usd}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Payment Provider
                        </label>
                        <div className="flex gap-2">
                            {topupConfig.providers.includes('paystack') && (
                                <Button
                                    type="button"
                                    variant={topupProvider === 'paystack' ? 'default' : 'outline'}
                                    onClick={() => onSetTopupProvider('paystack')}
                                    className="gap-1.5"
                                >
                                    <Landmark className="h-3.5 w-3.5" />
                                    Paystack
                                </Button>
                            )}
                            {topupConfig.providers.includes('stripe') && (
                                <Button
                                    type="button"
                                    variant={topupProvider === 'stripe' ? 'default' : 'outline'}
                                    onClick={() => onSetTopupProvider('stripe')}
                                    className="gap-1.5"
                                >
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Stripe
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Panel>

            {/* Ledger by type */}
            {breakdowns.ledger.by_type.length > 0 && (
                <Panel title="By Transaction Type" description="Breakdown of ledger entries by type.">
                    <ul className="space-y-2.5">
                        {breakdowns.ledger.by_type.map((row) => {
                            const max = Math.max(...breakdowns.ledger.by_type.map((r) => r.entries), 1);
                            return (
                                <li key={row.type} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium capitalize text-foreground">{row.type}</span>
                                        <span className="tabular-nums text-muted-foreground">
                                            {row.entries} entries  ${row.amount_usd.toFixed(4)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary/60 transition-all"
                                            style={{ width: `${(row.entries / max) * 100}%` }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </Panel>
            )}

            {/* Ledger table */}
            <Panel title="Transaction Ledger" description="Full history of credits and debits.">
                <DataTable
                    headers={['Date', 'Type', 'Amount', 'Balance After', 'Description']}
                    empty={ledger.data.length === 0}
                >
                    {ledger.data.map((entry) => (
                        <tr key={entry.id} className="hover:bg-accent/40 transition-colors">
                            <Td className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</Td>
                            <Td>
                                <span className="capitalize text-sm">{entry.type}</span>
                            </Td>
                            <Td>
                                <span
                                    className={
                                        entry.amount_usd >= 0
                                            ? 'font-semibold text-green-700 dark:text-green-400'
                                            : 'font-semibold text-red-700 dark:text-red-400'
                                    }
                                >
                                    {entry.amount_usd >= 0 ? '+' : ''}${entry.amount_usd.toFixed(6)}
                                </span>
                            </Td>
                            <Td className="tabular-nums">${entry.balance_after_usd.toFixed(6)}</Td>
                            <Td className="text-muted-foreground">
                                {entry.description || entry.external_reference || '-'}
                            </Td>
                        </tr>
                    ))}
                </DataTable>
                <Pagination links={ledger.links} />
            </Panel>

            {/* Checkout Confirmation */}
            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirm Top-up</DialogTitle>
                        <DialogDescription>
                            You are about to add credits to your account. Review the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
                            <p className="text-xs text-muted-foreground">Amount to add</p>
                            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                                ${topupAmount.toFixed(2)}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Paying with {topupProvider === 'paystack' ? 'Paystack' : 'Stripe'}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Your balance will update immediately after payment.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleTopup} disabled={topupProcessing} className="gap-1.5">
                            {topupProvider === 'paystack' ? <Landmark className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                            {topupProcessing ? 'Processing' : 'Confirm & Pay'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
