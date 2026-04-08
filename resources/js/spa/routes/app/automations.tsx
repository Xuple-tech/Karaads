import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, Mail, MessageSquareText, RadioTower, RefreshCw, Settings2, Sparkles, Wallet } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';

type MetaAccount = {
    id: string;
    platform: string;
    account_name: string;
    account_email?: string | null;
    is_active: boolean;
    unread_count: number;
    conversation_count: number;
    message_count: number;
    preferences?: {
        enable_auto_reply?: boolean;
        require_approval_before_send?: boolean;
        reply_tone?: string;
    } | null;
};

type MetaDashboard = {
    accounts: MetaAccount[];
    stats: {
        total_accounts: number;
        total_conversations: number;
        total_messages: number;
        auto_replies_sent: number;
        pending_drafts: number;
    };
    canAccessMeta: boolean;
    subscriptionTier: string;
};

type EmailAccountsResponse = {
    success: boolean;
    accounts: Array<{ id: number; email: string; provider: string; is_active: boolean }>;
};

const platformCards = [
    { platform: 'whatsapp', label: 'Connect WhatsApp', helper: 'Deploy a WhatsApp bot to your business number.' },
    { platform: 'facebook', label: 'Connect Facebook', helper: 'Manage Messenger automation from the same workspace.' },
    { platform: 'instagram', label: 'Connect Instagram', helper: 'Handle Instagram DM automation with the same AI stack.' },
] as const;

export function Component() {
    const [searchParams, setSearchParams] = useSearchParams();

    const meta = useQuery({
        queryKey: ['spa', 'meta', 'dashboard'],
        queryFn: () => apiRequest<MetaDashboard>('/api/meta/dashboard'),
    });

    const emails = useQuery({
        queryKey: ['spa', 'email', 'accounts'],
        queryFn: () => apiRequest<EmailAccountsResponse>('/api/email/accounts'),
    });

    const connectMutation = useMutation({
        mutationFn: (platform: 'facebook' | 'instagram' | 'whatsapp') =>
            apiRequest<{ oauth_url: string }>('/api/meta/accounts/initiate-oauth', {
                method: 'POST',
                json: { platform },
            }),
        onSuccess: ({ oauth_url }) => {
            window.location.href = oauth_url;
        },
        onError: (error) => {
            toast.error(error instanceof ApiError ? error.message : 'Failed to start Meta connection.');
        },
    });

    useEffect(() => {
        const status = searchParams.get('status');
        const message = searchParams.get('message');

        if (!status || !message) {
            return;
        }

        if (status === 'success') {
            toast.success(message);
        } else {
            toast.error(message);
        }

        searchParams.delete('status');
        searchParams.delete('message');
        setSearchParams(searchParams, { replace: true });
        void queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'dashboard'] });
    }, [searchParams, setSearchParams]);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <section className="rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl space-y-3">
                        <Badge variant="secondary" className="w-fit gap-1 rounded-full px-3 py-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            Automation Hub
                        </Badge>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Automations</h1>
                            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                                Run WhatsApp, Instagram, Facebook, and email workflows from one SPA workspace. Meta is live here now; email visibility stays in the same hub.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatCard label="Meta Accounts" value={meta.data?.stats.total_accounts ?? 0} icon={RadioTower} />
                        <StatCard label="Conversations" value={meta.data?.stats.total_conversations ?? 0} icon={MessageSquareText} />
                        <StatCard label="Auto Replies" value={meta.data?.stats.auto_replies_sent ?? 0} icon={RefreshCw} />
                        <StatCard label="Email Accounts" value={emails.data?.accounts.length ?? 0} icon={Mail} />
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle>Meta Channels</CardTitle>
                        <CardDescription>Connect a business channel and configure its AI persona, approvals, and conversations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-3">
                            {platformCards.map((item) => (
                                <button
                                    key={item.platform}
                                    type="button"
                                    onClick={() => connectMutation.mutate(item.platform)}
                                    className="rounded-2xl border border-border/60 bg-card p-4 text-left transition hover:border-primary/40 hover:bg-primary/5"
                                >
                                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{item.helper}</p>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            {meta.data?.accounts.length ? (
                                meta.data.accounts.map((account) => (
                                    <Link
                                        key={account.id}
                                        to={`/meta/accounts/${account.id}`}
                                        className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 transition hover:border-primary/40 hover:bg-primary/5 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-foreground">{account.account_name}</p>
                                                <Badge variant={account.is_active ? 'default' : 'secondary'}>
                                                    {account.is_active ? 'Active' : 'Paused'}
                                                </Badge>
                                                <Badge variant="outline" className="capitalize">{account.platform}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{account.account_email || 'Business account connected'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {account.preferences?.enable_auto_reply ? 'Auto-reply on' : 'Manual approval'} · {account.unread_count} unread · {account.conversation_count} conversations
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-primary">
                                            Open workspace
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                                    No Meta accounts connected yet. Start with WhatsApp if you want the AI bot builder first.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle>Email Automation</CardTitle>
                            <CardDescription>Email is still part of the automation hub even though the Meta workspace is the active build-out.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="rounded-2xl border border-border/60 bg-card p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-medium text-foreground">Connected inboxes</p>
                                        <p className="text-sm text-muted-foreground">
                                            {emails.data?.accounts.length ?? 0} email account(s) available for automation.
                                        </p>
                                    </div>
                                    <Wallet className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            {(emails.data?.accounts ?? []).slice(0, 4).map((account) => (
                                <div key={account.id} className="rounded-2xl border border-border/60 p-4">
                                    <p className="font-medium text-foreground">{account.email}</p>
                                    <p className="text-sm capitalize text-muted-foreground">{account.provider}</p>
                                </div>
                            ))}

                            {!emails.data?.accounts.length && (
                                <div className="rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                                    No email accounts connected yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle>Quick Links</CardTitle>
                            <CardDescription>Jump straight into the high-value Meta setup flow.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Button asChild variant="outline" className="justify-between">
                                <Link to="/meta/dashboard">
                                    Meta dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-between">
                                <Link to="/user/settings">
                                    App settings
                                    <Settings2 className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof RadioTower }) {
    return (
        <div className="rounded-2xl border border-border/50 bg-background/80 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
        </div>
    );
}
