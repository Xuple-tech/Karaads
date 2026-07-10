import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BadgeDollarSign, CircleDollarSign, FileVideo, Wallet as WalletIcon } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface Wallet {
    balance: string;
    total_earned: string;
    post_earnings: string | number;
    total_withdrawn: string;
    pending_withdrawal: string;
    currency: string;
    is_active: boolean;
}

interface Props {
    user: { id: string; name: string };
    wallet: Wallet;
    withdrawals: {
        reference: string;
        amount: number;
        status: string;
        account_number?: string;
        bank_code?: string;
        provider_reference?: string;
        provider_message?: string;
        created_at?: string;
        updated_at?: string;
    }[];
}

const formatCurrency = (value: string | number, currency: string) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
        typeof value === 'number' ? value : Number(value || 0),
    );

export default function UserWallet({ user, wallet, withdrawals }: Props) {
    return (
        <>
            <Head title={`Wallet: ${user.name}`} />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Users"
                        title={`${user.name} wallet`}
                        description="Inspect wallet health, cumulative balances, and rewarded withdrawal history."
                        actions={
                            <Link href={admin.users.show(user.id).url}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to user
                                </Button>
                            </Link>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <AdminMetricCard label="Balance" value={formatCurrency(wallet.balance, wallet.currency)} hint={wallet.currency} icon={WalletIcon} tone="success" />
                        <AdminMetricCard label="Total earned" value={formatCurrency(wallet.total_earned, wallet.currency)} hint="Lifetime earnings" icon={CircleDollarSign} />
                        <AdminMetricCard label="Earn from post" value={formatCurrency(wallet.post_earnings, wallet.currency)} hint="Credited video post rewards" icon={FileVideo} tone="success" />
                        <AdminMetricCard label="Total withdrawn" value={formatCurrency(wallet.total_withdrawn, wallet.currency)} hint="Historical withdrawals" icon={BadgeDollarSign} />
                        <AdminMetricCard label="Pending withdrawal" value={formatCurrency(wallet.pending_withdrawal, wallet.currency)} hint="Awaiting settlement" icon={WalletIcon} tone="warning" />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
                        <AdminSection title="Wallet state" description="Quick operational view of the user’s wallet status.">
                            <AdminPanel title="Wallet status" description="Use this when support needs to confirm whether the wallet is usable.">
                                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current wallet state</p>
                                        <p className="mt-1 text-lg font-semibold text-foreground">{wallet.is_active ? 'Active' : 'Inactive'}</p>
                                    </div>
                                    <Badge variant={wallet.is_active ? 'default' : 'secondary'}>{wallet.is_active ? 'Active' : 'Inactive'}</Badge>
                                </div>
                            </AdminPanel>
                        </AdminSection>

                        <AdminSection title="Rewarded withdrawal history" description="Provider-side payout records associated with this wallet.">
                            <AdminPanel title="Withdrawal records" description="Useful when investigating settlement complaints or provider failures.">
                                <div className="space-y-3">
                                    {withdrawals.length > 0 ? (
                                        withdrawals.map((withdrawal) => (
                                            <div key={withdrawal.reference} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="font-medium">{formatCurrency(withdrawal.amount, wallet.currency)}</div>
                                                        <div className="text-xs text-muted-foreground">{withdrawal.reference}</div>
                                                    </div>
                                                    <Badge variant="outline" className="capitalize">
                                                        {withdrawal.status}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                                                    <div>Account: {withdrawal.account_number || 'N/A'}</div>
                                                    <div>Provider ref: {withdrawal.provider_reference || 'Pending'}</div>
                                                    {withdrawal.provider_message ? <div>{withdrawal.provider_message}</div> : null}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                                            No rewarded withdrawals found.
                                        </div>
                                    )}
                                </div>
                            </AdminPanel>
                        </AdminSection>
                    </div>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
