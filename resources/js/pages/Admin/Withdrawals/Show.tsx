import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock3, Wallet, XCircle } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface User {
    id: string;
    name: string;
    email: string;
}

interface WalletInfo {
    id: string;
    balance: string;
    pending_withdrawal: string;
}

interface WithdrawalRequest {
    id: string;
    amount: string;
    currency: string;
    payout_method: string;
    payout_details: unknown;
    status: string;
    created_at: string;
    processed_at: string | null;
    completed_at: string | null;
    rejection_reason: string | null;
    transaction_id: string | null;
    fee: string;
    net_amount: string;
    admin_notes: string | null;
    user: User;
    wallet: WalletInfo;
}

interface ShowProps {
    withdrawal: WithdrawalRequest;
}

const formatCurrency = (amount: string, currency: string) =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency || 'NGN',
        maximumFractionDigits: 0,
    }).format(parseFloat(amount || '0'));

const formatDateTime = (value: string | null) => (value ? new Date(value).toLocaleString() : 'Not available');

export default function Show({ withdrawal }: ShowProps) {
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);

    const { data: approveData, setData: setApproveData, post: approvePost, processing: approveProcessing } = useForm({
        transaction_id: '',
        admin_notes: withdrawal.admin_notes || '',
    });

    const {
        data: rejectData,
        setData: setRejectData,
        post: rejectPost,
        processing: rejectProcessing,
        errors: rejectErrors,
    } = useForm({
        rejection_reason: '',
        admin_notes: withdrawal.admin_notes || '',
    });

    const { data: completeData, setData: setCompleteData, post: completePost, processing: completeProcessing } = useForm({
        transaction_id: withdrawal.transaction_id || '',
        admin_notes: withdrawal.admin_notes || '',
    });

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        approvePost(admin.withdrawals.approve(withdrawal.id).url, {
            onSuccess: () => setIsApproveOpen(false),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectPost(admin.withdrawals.reject(withdrawal.id).url, {
            onSuccess: () => setIsRejectOpen(false),
        });
    };

    const handleComplete = (e: React.FormEvent) => {
        e.preventDefault();
        completePost(admin.withdrawals.complete(withdrawal.id).url, {
            onSuccess: () => setIsCompleteOpen(false),
        });
    };

    const statusVariant = withdrawal.status === 'completed' ? 'default' : withdrawal.status === 'pending' || withdrawal.status === 'processing' ? 'secondary' : 'destructive';

    return (
        <>
            <Head title={`Withdrawal #${withdrawal.id}`} />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Finance"
                        title={`Withdrawal #${withdrawal.id}`}
                        description="Review payout details, confirm manual processing, or reject the request with an audit reason."
                        actions={
                            <>
                                <Link href={admin.withdrawals.index.url()}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to withdrawals
                                    </Button>
                                </Link>
                                <Badge variant={statusVariant} className="rounded-full px-3 py-1.5 uppercase">
                                    {withdrawal.status}
                                </Badge>
                            </>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard
                            label="Gross amount"
                            value={formatCurrency(withdrawal.amount, withdrawal.currency)}
                            hint="Amount requested by the user"
                            icon={Wallet}
                        />
                        <AdminMetricCard
                            label="Processing fee"
                            value={formatCurrency(withdrawal.fee, withdrawal.currency)}
                            hint="Fees withheld from settlement"
                            icon={Clock3}
                            tone="warning"
                        />
                        <AdminMetricCard
                            label="Net payout"
                            value={formatCurrency(withdrawal.net_amount, withdrawal.currency)}
                            hint="Expected amount to transfer"
                            icon={CheckCircle2}
                            tone="success"
                        />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
                        <AdminSection title="Request details" description="Core withdrawal payload and payout destination details.">
                            <div className="space-y-6">
                                <AdminPanel title="Settlement request" description="Verify method, payload, and the current admin audit fields before acting.">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Payout method</p>
                                            <div className="mt-2">
                                                <Badge variant="outline">{withdrawal.payout_method.replace(/_/g, ' ')}</Badge>
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Transaction ID</p>
                                            <p className="mt-2 font-mono text-sm">{withdrawal.transaction_id || 'Not assigned'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Created</p>
                                            <p className="mt-2 font-medium">{formatDateTime(withdrawal.created_at)}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Processed</p>
                                            <p className="mt-2 font-medium">{formatDateTime(withdrawal.processed_at)}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 md:col-span-2">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Payout details</p>
                                            <pre className="mt-3 overflow-x-auto rounded-2xl bg-background p-4 text-xs text-muted-foreground">
                                                {JSON.stringify(withdrawal.payout_details, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </AdminPanel>

                                <AdminPanel title="Audit trail" description="Inspect rejection or completion metadata captured on this request.">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Completed</p>
                                            <p className="mt-2 font-medium">{formatDateTime(withdrawal.completed_at)}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rejection reason</p>
                                            <p className="mt-2 text-sm">{withdrawal.rejection_reason || 'No rejection reason recorded.'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 md:col-span-2">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin notes</p>
                                            <p className="mt-2 whitespace-pre-wrap text-sm">{withdrawal.admin_notes || 'No internal notes saved.'}</p>
                                        </div>
                                    </div>
                                </AdminPanel>
                            </div>
                        </AdminSection>

                        <AdminSection title="User and actions" description="Review the requesting user and execute the next state transition.">
                            <div className="space-y-6">
                                <AdminPanel title="User context" description="Cross-check the wallet state before approving or rejecting the request.">
                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                            <p className="font-medium">{withdrawal.user.name}</p>
                                            <p className="text-sm text-muted-foreground">{withdrawal.user.email}</p>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wallet balance</p>
                                                <p className="mt-2 text-lg font-semibold">{formatCurrency(withdrawal.wallet.balance, withdrawal.currency)}</p>
                                            </div>
                                            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pending withdrawals</p>
                                                <p className="mt-2 text-lg font-semibold">{formatCurrency(withdrawal.wallet.pending_withdrawal, withdrawal.currency)}</p>
                                            </div>
                                        </div>
                                        <Link href={admin.users.show(withdrawal.user.id).url}>
                                            <Button variant="outline" className="w-full">
                                                Open user profile
                                            </Button>
                                        </Link>
                                    </div>
                                </AdminPanel>

                                <AdminPanel title="Workflow actions" description="Only actions valid for the current state are shown.">
                                    <div className="space-y-4">
                                        {withdrawal.status === 'pending' ? (
                                            <div className="grid gap-3">
                                                <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button>
                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                            Approve and process
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Approve withdrawal</DialogTitle>
                                                            <DialogDescription>
                                                                Move the request into processing and optionally store a transaction reference now.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={handleApprove} className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="approve-transaction-id">Transaction ID</Label>
                                                                <Input
                                                                    id="approve-transaction-id"
                                                                    value={approveData.transaction_id}
                                                                    onChange={(e) => setApproveData('transaction_id', e.target.value)}
                                                                    placeholder="TXN123456789"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="approve-admin-notes">Admin notes</Label>
                                                                <Textarea
                                                                    id="approve-admin-notes"
                                                                    value={approveData.admin_notes}
                                                                    onChange={(e) => setApproveData('admin_notes', e.target.value)}
                                                                    placeholder="Internal context for the finance team..."
                                                                />
                                                            </div>
                                                            <DialogFooter>
                                                                <Button type="button" variant="outline" onClick={() => setIsApproveOpen(false)}>
                                                                    Cancel
                                                                </Button>
                                                                <Button type="submit" disabled={approveProcessing}>
                                                                    {approveProcessing ? 'Saving...' : 'Approve request'}
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>

                                                <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="destructive">
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Reject request
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Reject withdrawal</DialogTitle>
                                                            <DialogDescription>
                                                                Rejecting returns funds to the user wallet. A rejection reason is required.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={handleReject} className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="rejection-reason">Rejection reason</Label>
                                                                <Textarea
                                                                    id="rejection-reason"
                                                                    value={rejectData.rejection_reason}
                                                                    onChange={(e) => setRejectData('rejection_reason', e.target.value)}
                                                                    placeholder="Explain the issue with this withdrawal request..."
                                                                />
                                                                {rejectErrors.rejection_reason ? <p className="text-sm text-red-500">{rejectErrors.rejection_reason}</p> : null}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="reject-admin-notes">Admin notes</Label>
                                                                <Textarea
                                                                    id="reject-admin-notes"
                                                                    value={rejectData.admin_notes}
                                                                    onChange={(e) => setRejectData('admin_notes', e.target.value)}
                                                                    placeholder="Internal notes..."
                                                                />
                                                            </div>
                                                            <DialogFooter>
                                                                <Button type="button" variant="outline" onClick={() => setIsRejectOpen(false)}>
                                                                    Cancel
                                                                </Button>
                                                                <Button type="submit" variant="destructive" disabled={rejectProcessing}>
                                                                    {rejectProcessing ? 'Saving...' : 'Reject request'}
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        ) : null}

                                        {withdrawal.status === 'processing' ? (
                                            <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
                                                <DialogTrigger asChild>
                                                    <Button>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Mark as completed
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Complete withdrawal</DialogTitle>
                                                        <DialogDescription>
                                                            Confirm the settlement completed and save the final transaction reference if available.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <form onSubmit={handleComplete} className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="complete-transaction-id">Transaction ID</Label>
                                                            <Input
                                                                id="complete-transaction-id"
                                                                value={completeData.transaction_id}
                                                                onChange={(e) => setCompleteData('transaction_id', e.target.value)}
                                                                placeholder="TXN123456789"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="complete-admin-notes">Admin notes</Label>
                                                            <Textarea
                                                                id="complete-admin-notes"
                                                                value={completeData.admin_notes}
                                                                onChange={(e) => setCompleteData('admin_notes', e.target.value)}
                                                                placeholder="Internal notes..."
                                                            />
                                                        </div>
                                                        <DialogFooter>
                                                            <Button type="button" variant="outline" onClick={() => setIsCompleteOpen(false)}>
                                                                Cancel
                                                            </Button>
                                                            <Button type="submit" disabled={completeProcessing}>
                                                                {completeProcessing ? 'Saving...' : 'Complete withdrawal'}
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        ) : null}

                                        {withdrawal.status === 'completed' ? (
                                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-800">
                                                Completed on {formatDateTime(withdrawal.completed_at)}.
                                                {withdrawal.transaction_id ? ` Transaction ID: ${withdrawal.transaction_id}.` : ''}
                                            </div>
                                        ) : null}

                                        {withdrawal.status === 'rejected' ? (
                                            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-800">
                                                Rejected with reason: {withdrawal.rejection_reason || 'No reason supplied.'}
                                            </div>
                                        ) : null}
                                    </div>
                                </AdminPanel>
                            </div>
                        </AdminSection>
                    </div>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
