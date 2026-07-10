import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, DollarSign, FileText, KeyRound, MessageSquare, ThumbsUp, UserCheck, UserX, Users, Wallet, XCircle } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    status: 'active' | 'inactive' | 'suspended' | 'banned';
    bio: string;
    avatar: string;
    created_at: string;
    posts_count: number;
    followers_count: number;
    following_count: number;
    comments_count: number;
    likes_count: number;
    wallet?: {
        balance: string;
        pending_withdrawal: string;
    };
}

interface Withdrawal {
    reference: string;
    amount: number;
    status: string;
    account_number?: string;
    bank_code?: string;
    provider_reference?: string;
    provider_message?: string;
    created_at?: string;
    updated_at?: string;
}

interface ShowProps {
    user: User;
    withdrawals: Withdrawal[];
    isKaraVerified: boolean;
    karaVerifiedAt: string | null;
    verificationRequest: {
        id: string;
        status: 'pending' | 'approved' | 'rejected';
        category: string;
        full_name: string;
        contact_email: string;
        reason: string;
        portfolio_url?: string | null;
        social_url?: string | null;
        followers_count_snapshot: number;
        review_notes?: string | null;
        reviewed_at?: string | null;
        reviewer_name?: string | null;
        created_at?: string | null;
    } | null;
}

const formatCurrency = (amount: string | number, currency = 'NGN') =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(typeof amount === 'number' ? amount : parseFloat(amount || '0'));

export default function Show({ user, withdrawals, verificationRequest, isKaraVerified, karaVerifiedAt }: ShowProps) {
    const [isAdjustWalletOpen, setIsAdjustWalletOpen] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState('');

    const {
        data: walletData,
        setData: setWalletData,
        post: walletPost,
        processing: walletProcessing,
        errors: walletErrors,
        reset: walletReset,
    } = useForm({
        amount: '',
        type: 'credit',
        description: '',
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        post: passwordPost,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: passwordReset,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleAdjustWallet = (e: React.FormEvent) => {
        e.preventDefault();
        walletPost(admin.users.adjustWallet(user.id).url, {
            onSuccess: () => {
                setIsAdjustWalletOpen(false);
                walletReset();
            },
        });
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordPost(admin.users.resetPassword(user.id).url, {
            onSuccess: () => {
                setIsResetPasswordOpen(false);
                passwordReset();
            },
        });
    };

    const handleDisable = () => {
        router.post(admin.users.disable(user.id).url);
    };

    const handleEnable = () => {
        router.post(admin.users.enable(user.id).url);
    };

    const handleApproveVerification = () => {
        router.post(`/admin/users/${user.id}/verification-request/approve`, {
            review_notes: verificationNotes,
        });
    };

    const handleRejectVerification = () => {
        router.post(`/admin/users/${user.id}/verification-request/reject`, {
            review_notes: verificationNotes,
        });
    };

    const handleGrantKaraVerified = () => {
        router.post(`/admin/users/${user.id}/kara-verified/grant`);
    };

    const handleRevokeKaraVerified = () => {
        router.post(`/admin/users/${user.id}/kara-verified/revoke`);
    };

    const statusVariant = user.status === 'active' ? 'default' : user.status === 'inactive' ? 'secondary' : 'destructive';

    return (
        <>
            <Head title={`User: ${user.name}`} />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Users"
                        title={user.name}
                        description={`Inspect profile activity, wallet state, and operational controls for @${user.username}.`}
                        actions={
                            <>
                                <Link href={admin.users.index.url()}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to users
                                    </Button>
                                </Link>
                                <Link href={admin.users.edit(user.id).url}>
                                    <Button variant="outline">Edit profile</Button>
                                </Link>
                                {user.status === 'active' ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline">
                                                <UserX className="mr-2 h-4 w-4" />
                                                Disable user
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Disable this user?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This blocks normal access until the account is re-enabled.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDisable}>Disable account</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <Button onClick={handleEnable}>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Enable user
                                    </Button>
                                )}
                            </>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <AdminMetricCard label="Posts" value={user.posts_count} hint="Published content items" icon={FileText} />
                        <AdminMetricCard label="Followers" value={user.followers_count} hint="Audience size" icon={Users} />
                        <AdminMetricCard label="Likes" value={user.likes_count} hint="Total reactions received" icon={ThumbsUp} />
                        <AdminMetricCard label="Comments" value={user.comments_count} hint="Conversation count" icon={MessageSquare} />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
                        <AdminSection title="Profile" description="Identity and account metadata for support and moderation workflows.">
                            <AdminPanel title="Account snapshot" description="Use this to verify who the account belongs to and when it was created.">
                                <div className="flex flex-col gap-6 lg:flex-row">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-muted text-2xl font-semibold text-muted-foreground">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                user.name.charAt(0)
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xl font-semibold text-foreground">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">@{user.username}</Badge>
                                                <Badge variant={statusVariant} className="capitalize">
                                                    {user.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Joined</p>
                                            <p className="mt-2 font-medium">{new Date(user.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Following</p>
                                            <p className="mt-2 font-medium">{user.following_count}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 rounded-2xl border border-border/70 bg-muted/20 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Bio</p>
                                    <p className="mt-2 text-sm text-foreground">{user.bio || 'No bio provided.'}</p>
                                </div>
                            </AdminPanel>
                        </AdminSection>

                        <AdminSection title="Wallet and access" description="Run sensitive account operations from one controlled place.">
                            <div className="space-y-6">
                                <AdminPanel title="Wallet balance" description="Review current funds and adjust the user wallet when support requires it.">
                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Available balance</p>
                                            <p className="mt-2 text-3xl font-semibold text-emerald-700">
                                                {formatCurrency(user.wallet?.balance || '0')}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pending withdrawal</p>
                                            <p className="mt-2 text-xl font-semibold text-amber-700">
                                                {formatCurrency(user.wallet?.pending_withdrawal || '0')}
                                            </p>
                                        </div>

                                        <Dialog open={isAdjustWalletOpen} onOpenChange={setIsAdjustWalletOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full">
                                                    <Wallet className="mr-2 h-4 w-4" />
                                                    Adjust wallet
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Adjust user wallet</DialogTitle>
                                                    <DialogDescription>
                                                        Apply a manual credit or debit with a clear audit description.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form onSubmit={handleAdjustWallet} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="amount">Amount</Label>
                                                        <Input
                                                            id="amount"
                                                            type="number"
                                                            step="0.01"
                                                            value={walletData.amount}
                                                            onChange={(e) => setWalletData('amount', e.target.value)}
                                                            placeholder="0.00"
                                                        />
                                                        {walletErrors.amount ? <p className="text-sm text-red-500">{walletErrors.amount}</p> : null}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="type">Adjustment type</Label>
                                                        <Select value={walletData.type} onValueChange={(value) => setWalletData('type', value)}>
                                                            <SelectTrigger id="type">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="credit">Credit balance</SelectItem>
                                                                <SelectItem value="debit">Debit balance</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="description">Reason</Label>
                                                        <Input
                                                            id="description"
                                                            value={walletData.description}
                                                            onChange={(e) => setWalletData('description', e.target.value)}
                                                            placeholder="Manual correction, promo grant, recovery, etc."
                                                        />
                                                        {walletErrors.description ? <p className="text-sm text-red-500">{walletErrors.description}</p> : null}
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="button" variant="outline" onClick={() => setIsAdjustWalletOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={walletProcessing}>
                                                            {walletProcessing ? 'Saving...' : 'Apply adjustment'}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </AdminPanel>

                                <AdminPanel title="Password reset" description="Set a new password directly for the user account.">
                                    <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <KeyRound className="mr-2 h-4 w-4" />
                                                Reset password
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Reset password</DialogTitle>
                                                <DialogDescription>Set a new password for this user and confirm it before submitting.</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleResetPassword} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="password">New password</Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        value={passwordData.password}
                                                        onChange={(e) => setPasswordData('password', e.target.value)}
                                                    />
                                                    {passwordErrors.password ? <p className="text-sm text-red-500">{passwordErrors.password}</p> : null}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="password_confirmation">Confirm password</Label>
                                                    <Input
                                                        id="password_confirmation"
                                                        type="password"
                                                        value={passwordData.password_confirmation}
                                                        onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={passwordProcessing}>
                                                        {passwordProcessing ? 'Saving...' : 'Reset password'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </AdminPanel>

                                <AdminPanel title="Quick links" description="Open related user admin views without returning to the directory.">
                                    <div className="grid gap-3">
                                        <Link href={admin.users.earnings(user.id).url}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <DollarSign className="mr-2 h-4 w-4" />
                                                View earnings history
                                            </Button>
                                        </Link>
                                        <Link href={admin.users.posts(user.id).url}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <FileText className="mr-2 h-4 w-4" />
                                                View posts
                                            </Button>
                                        </Link>
                                    </div>
                                </AdminPanel>

                                <AdminPanel title="Kara Verified badge" description="Grant or remove the public verified badge directly from this user account.">
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant={isKaraVerified ? 'default' : 'outline'}>
                                                {isKaraVerified ? 'Kara Verified active' : 'Kara Verified not active'}
                                            </Badge>
                                            {karaVerifiedAt ? (
                                                <span className="text-sm text-muted-foreground">
                                                    Granted {new Date(karaVerifiedAt).toLocaleString()}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="flex gap-3">
                                            {!isKaraVerified ? (
                                                <Button onClick={handleGrantKaraVerified}>
                                                    <BadgeCheck className="mr-2 h-4 w-4" />
                                                    Grant Kara Verified
                                                </Button>
                                            ) : (
                                                <Button variant="outline" onClick={handleRevokeKaraVerified}>
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Remove Kara Verified
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </AdminPanel>

                                <AdminPanel title="Kara Verified request" description="Review the latest verification application for this user.">
                                    {verificationRequest ? (
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline" className="capitalize">{verificationRequest.status}</Badge>
                                                <Badge variant="secondary" className="capitalize">{verificationRequest.category.replace('_', ' ')}</Badge>
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Applicant</p>
                                                    <p className="mt-2 font-medium">{verificationRequest.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{verificationRequest.contact_email}</p>
                                                </div>
                                                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Followers at submission</p>
                                                    <p className="mt-2 font-medium">{verificationRequest.followers_count_snapshot}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Submitted {verificationRequest.created_at ? new Date(verificationRequest.created_at).toLocaleString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reason</p>
                                                <p className="mt-2 text-sm text-foreground">{verificationRequest.reason}</p>
                                                {verificationRequest.portfolio_url ? <p className="mt-3 text-sm"><a className="text-primary underline" href={verificationRequest.portfolio_url} target="_blank" rel="noreferrer">Portfolio / website</a></p> : null}
                                                {verificationRequest.social_url ? <p className="mt-1 text-sm"><a className="text-primary underline" href={verificationRequest.social_url} target="_blank" rel="noreferrer">Public social profile</a></p> : null}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="verificationNotes">Review notes</Label>
                                                <Input
                                                    id="verificationNotes"
                                                    value={verificationNotes}
                                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                                    placeholder="Optional approval note or required rejection reason"
                                                />
                                            </div>
                                            {verificationRequest.status === 'pending' ? (
                                                <div className="flex gap-3">
                                                    <Button onClick={handleApproveVerification}>
                                                        <BadgeCheck className="mr-2 h-4 w-4" />
                                                        Approve Kara Verified
                                                    </Button>
                                                    <Button variant="outline" onClick={handleRejectVerification}>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Reject request
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                                                    {verificationRequest.review_notes || 'No review notes recorded.'}
                                                    {verificationRequest.reviewed_at ? (
                                                        <div className="mt-2">
                                                            Reviewed {new Date(verificationRequest.reviewed_at).toLocaleString()}
                                                            {verificationRequest.reviewer_name ? ` by ${verificationRequest.reviewer_name}` : ''}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">This user has not submitted a Kara Verified request yet.</p>
                                    )}
                                </AdminPanel>
                            </div>
                        </AdminSection>
                    </div>

                    <AdminSection title="Rewarded withdrawals" description="Interface payout records attached to this user account.">
                        <AdminPanel title="Payout history" description="Use this for support checks when rewarded cash-out records are involved.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Provider details</TableHead>
                                            <TableHead>Updated</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {withdrawals.length > 0 ? (
                                            withdrawals.map((withdrawal) => (
                                                <TableRow key={withdrawal.reference}>
                                                    <TableCell className="font-medium">{withdrawal.reference}</TableCell>
                                                    <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {withdrawal.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        <div>{withdrawal.account_number || 'N/A'}</div>
                                                        <div>{withdrawal.provider_reference || 'Pending provider ref'}</div>
                                                        {withdrawal.provider_message ? <div>{withdrawal.provider_message}</div> : null}
                                                    </TableCell>
                                                    <TableCell>
                                                        {withdrawal.updated_at || withdrawal.created_at
                                                            ? new Date(withdrawal.updated_at || withdrawal.created_at || '').toLocaleString()
                                                            : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                    No rewarded withdrawals recorded for this user.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
