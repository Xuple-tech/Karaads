import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Facebook, Instagram, Mail, MessageSquare, Plus, Radio, Settings2, Smartphone, WandSparkles, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

const platformConfig = {
    whatsapp: { label: 'WhatsApp', Icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    facebook: { label: 'Facebook', Icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    instagram: { label: 'Instagram', Icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/30' },
} as const;

const connectOptions = [
    { platform: 'whatsapp', label: 'WhatsApp Business', description: 'Launch AI replies on your business number' },
    { platform: 'facebook', label: 'Facebook Messenger', description: 'Automate Messenger enquiries' },
    { platform: 'instagram', label: 'Instagram DMs', description: 'Handle product and enquiry messages' },
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
            toast.error(error instanceof ApiError ? error.message : 'Failed to start connection.');
        },
    });

    useEffect(() => {
        const status = searchParams.get('status');
        const message = searchParams.get('message');

        if (!status || !message) return;

        if (status === 'success') toast.success(message);
        else toast.error(message);

        searchParams.delete('status');
        searchParams.delete('message');
        setSearchParams(searchParams, { replace: true });
        void queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'dashboard'] });
    }, [searchParams, setSearchParams]);

    const hasAccounts = (meta.data?.accounts.length ?? 0) > 0;

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-8">

            {/* Page header */}
            <div className="flex flex-col gap-1 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">Automations</h1>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage customer channels, AI bot settings, and reply workflows in one place.
                    </p>
                </div>
                <Badge variant="outline" className="w-fit capitalize self-start sm:self-auto">
                    {meta.data?.subscriptionTier ?? 'standard'} plan
                </Badge>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Channels" value={meta.data?.stats.total_accounts ?? 0} loading={meta.isLoading} />
                <StatCard label="Conversations" value={meta.data?.stats.total_conversations ?? 0} loading={meta.isLoading} />
                <StatCard label="Auto-replies" value={meta.data?.stats.auto_replies_sent ?? 0} loading={meta.isLoading} />
                <StatCard label="Email accounts" value={emails.data?.accounts.length ?? 0} loading={emails.isLoading} />
            </div>

            {/* Main content */}
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

                {/* Messaging channels */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-medium text-foreground">Messaging Channels</h2>
                            <p className="text-sm text-muted-foreground">Connect a channel to start automated conversations.</p>
                        </div>
                    </div>

                    {/* Connect new channel buttons */}
                    <div className="grid gap-2 sm:grid-cols-3">
                        {connectOptions.map((item) => {
                            const cfg = platformConfig[item.platform];
                            return (
                                <button
                                    key={item.platform}
                                    type="button"
                                    onClick={() => connectMutation.mutate(item.platform)}
                                    disabled={connectMutation.isPending}
                                    className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 text-left transition hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
                                >
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                                        <cfg.Icon className={`h-4 w-4 ${cfg.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Connected accounts list */}
                    <div className="flex flex-col gap-2">
                        {meta.isLoading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4">
                                    <Skeleton className="h-9 w-9 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-56" />
                                    </div>
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                            ))
                        ) : hasAccounts ? (
                            meta.data!.accounts.map((account) => {
                                const cfg = platformConfig[account.platform as keyof typeof platformConfig] ?? {
                                    Icon: MessageSquare,
                                    color: 'text-muted-foreground',
                                    bg: 'bg-muted',
                                };
                                return (
                                    <div key={account.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                                            <cfg.Icon className={`h-4 w-4 ${cfg.color}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium text-foreground">{account.account_name}</p>
                                                <Badge variant="outline" className="capitalize text-xs">{account.platform}</Badge>
                                                <Badge
                                                    variant={account.is_active ? 'default' : 'secondary'}
                                                    className={account.is_active ? 'bg-emerald-600 text-white hover:bg-emerald-600 text-xs' : 'text-xs'}
                                                >
                                                    {account.is_active ? 'Active' : 'Paused'}
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {account.unread_count} unread &middot; {account.conversation_count} conversations
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <Link
                                                to={`/meta/accounts/${account.id}/setup`}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                title="Setup guide"
                                            >
                                                <WandSparkles className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                to={`/meta/accounts/${account.id}/broadcast`}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                title="Broadcast"
                                            >
                                                <Radio className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                to={`/meta/accounts/${account.id}/templates`}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                title="Templates"
                                            >
                                                <BookOpen className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                to={`/meta/accounts/${account.id}`}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                title="Open workspace"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 py-10 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <Plus className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground">No channels connected</p>
                                <p className="max-w-xs text-xs text-muted-foreground">
                                    Connect WhatsApp, Facebook, or Instagram above to start deploying your AI bot.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-4">

                    {/* Email accounts */}
                    <div className="rounded-xl border border-border/60 bg-card">
                        <div className="border-b border-border/60 px-4 py-3">
                            <h2 className="text-sm font-medium text-foreground">Email Accounts</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Connected inboxes for automation</p>
                        </div>
                        <div className="p-3">
                            {emails.isLoading ? (
                                <div className="space-y-2 p-1">
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between gap-3 rounded-lg p-2">
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-36" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                            <Skeleton className="h-5 w-14 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : emails.data?.accounts.length ? (
                                <div className="space-y-1">
                                    {emails.data.accounts.slice(0, 5).map((account) => (
                                        <div key={account.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">{account.email}</p>
                                                <p className="text-xs capitalize text-muted-foreground">{account.provider}</p>
                                            </div>
                                            <Badge
                                                variant={account.is_active ? 'default' : 'secondary'}
                                                className={account.is_active ? 'shrink-0 bg-emerald-600 text-white hover:bg-emerald-600' : 'shrink-0'}
                                            >
                                                {account.is_active ? 'Active' : 'Off'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="p-2 text-xs text-muted-foreground">No email accounts connected.</p>
                            )}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="rounded-xl border border-border/60 bg-card">
                        <div className="border-b border-border/60 px-4 py-3">
                            <h2 className="text-sm font-medium text-foreground">Quick Access</h2>
                        </div>
                        <div className="flex flex-col gap-1 p-3">
                            <Button asChild variant="ghost" className="h-auto justify-between px-3 py-2.5 text-left">
                                <Link to="/user/settings">
                                    <span className="text-sm text-foreground">Application settings</span>
                                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="h-auto justify-between px-3 py-2.5 text-left">
                                <Link to="/mails">
                                    <span className="text-sm text-foreground">Email inbox</span>
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="h-auto justify-between px-3 py-2.5 text-left">
                                <Link to="/widget">
                                    <span className="text-sm text-foreground">Website widget</span>
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, loading = false }: { label: string; value: number; loading?: boolean }) {
    return (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            {loading ? (
                <Skeleton className="mt-2 h-7 w-12" />
            ) : (
                <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
            )}
        </div>
    );
}
