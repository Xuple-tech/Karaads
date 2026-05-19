import { useMutation, useQuery } from '@tanstack/react-query';
import {
    ArrowRight,
    BookOpen,
    Facebook,
    Globe2,
    Instagram,
    Mail,
    MessageSquare,
    Plus,
    Radio,
    Settings2,
    Smartphone,
    WandSparkles,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';

// ─── types ────────────────────────────────────────────────────────────────────

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
    latest_ai_insight?: {
        intent?: string | null;
        priority?: string | null;
        reply_goal?: string | null;
        key_points?: string[];
        memory_hits?: number | null;
        status?: string | null;
        confidence_score?: number | null;
        sentiment?: string | null;
        category?: string | null;
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

// ─── config ───────────────────────────────────────────────────────────────────

const platformConfig = {
    whatsapp: {
        label: 'WhatsApp',
        Icon: Smartphone,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
    facebook: {
        label: 'Facebook',
        Icon: Facebook,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    instagram: {
        label: 'Instagram',
        Icon: Instagram,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
    },
} as const;

const connectOptions = [
    { platform: 'whatsapp', label: 'WhatsApp Business', description: 'AI replies on your business number' },
    { platform: 'facebook', label: 'Facebook Messenger', description: 'Automate Messenger enquiries' },
    { platform: 'instagram', label: 'Instagram DMs', description: 'Handle product & enquiry messages' },
] as const;

// ─── component ────────────────────────────────────────────────────────────────

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
        onSuccess: ({ oauth_url }) => { window.location.href = oauth_url; },
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
        <div className="mx-auto w-full max-w-5xl space-y-8 py-2 pb-10">

            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Automations</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage messaging channels, AI reply settings, and connected tools.
                    </p>
                </div>
                {meta.data?.subscriptionTier && (
                    <span className="shrink-0 rounded-full border border-border/60 px-3 py-1 text-xs capitalize text-muted-foreground">
                        {meta.data.subscriptionTier} plan
                    </span>
                )}
            </div>

            {/* ── Stats ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Channels', value: meta.data?.stats.total_accounts ?? 0, loading: meta.isLoading },
                    { label: 'Conversations', value: meta.data?.stats.total_conversations ?? 0, loading: meta.isLoading },
                    { label: 'Auto-replies', value: meta.data?.stats.auto_replies_sent ?? 0, loading: meta.isLoading },
                    { label: 'Email accounts', value: emails.data?.accounts.length ?? 0, loading: emails.isLoading },
                ].map(({ label, value, loading }) => (
                    <div key={label} className="rounded-xl border border-border/50 bg-card px-4 py-3">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        {loading
                            ? <Skeleton className="mt-2 h-7 w-10" />
                            : <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
                        }
                    </div>
                ))}
            </div>

            {/* ── Main grid ──────────────────────────────────── */}
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">

                {/* Left — messaging channels */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Messaging channels</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">Connect a channel to deploy your AI bot.</p>
                    </div>

                    {/* Connect buttons */}
                    <div className="grid gap-2 sm:grid-cols-3">
                        {connectOptions.map((item) => {
                            const cfg = platformConfig[item.platform];
                            return (
                                <button
                                    key={item.platform}
                                    type="button"
                                    onClick={() => connectMutation.mutate(item.platform)}
                                    disabled={connectMutation.isPending}
                                    className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 text-left transition-colors hover:border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/5 disabled:opacity-50"
                                >
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                                        <cfg.Icon className={`h-4 w-4 ${cfg.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[0.82rem] font-medium text-foreground">{item.label}</p>
                                        <p className="mt-0.5 text-[0.72rem] text-muted-foreground">{item.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Connected accounts */}
                    <div className="space-y-2">
                        {meta.isLoading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4">
                                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3.5 w-36" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                    <Skeleton className="h-7 w-7 rounded-lg" />
                                </div>
                            ))
                        ) : hasAccounts ? (
                            meta.data!.accounts.map((account) => {
                                const cfg = platformConfig[account.platform as keyof typeof platformConfig] ?? {
                                    Icon: MessageSquare,
                                    color: 'text-muted-foreground',
                                    bg: 'bg-muted/50',
                                };
                                return (
                                    <div key={account.id} className="rounded-xl border border-border/50 bg-card p-3.5">
                                        <div className="flex items-center gap-3">
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                                            <cfg.Icon className={`h-4 w-4 ${cfg.color}`} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-foreground truncate">{account.account_name}</p>
                                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${account.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                                                    {account.is_active ? 'Active' : 'Paused'}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                                                {account.platform} &middot; {account.unread_count} unread &middot; {account.conversation_count} conversations
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-0.5">
                                            {[
                                                { to: `/meta/accounts/${account.id}/setup`, icon: WandSparkles, title: 'Setup' },
                                                { to: `/meta/accounts/${account.id}/broadcast`, icon: Radio, title: 'Broadcast' },
                                                { to: `/meta/accounts/${account.id}/templates`, icon: BookOpen, title: 'Templates' },
                                                { to: `/meta/accounts/${account.id}`, icon: ArrowRight, title: 'Open' },
                                            ].map(({ to, icon: Icon, title }) => (
                                                <Link
                                                    key={to}
                                                    to={to}
                                                    title={title}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
                                                >
                                                    <Icon className="h-3.5 w-3.5" />
                                                </Link>
                                            ))}
                                        </div>
                                        </div>

                                        {account.latest_ai_insight && (
                                            <div className="mt-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    {account.latest_ai_insight.sentiment && (
                                                        <span className="rounded-full bg-background px-2 py-1 text-muted-foreground">
                                                            {account.latest_ai_insight.sentiment}
                                                        </span>
                                                    )}
                                                    {account.latest_ai_insight.category && (
                                                        <span className="rounded-full bg-background px-2 py-1 text-muted-foreground">
                                                            {account.latest_ai_insight.category}
                                                        </span>
                                                    )}
                                                    {account.latest_ai_insight.intent && (
                                                        <span className="rounded-full bg-background px-2 py-1 text-muted-foreground capitalize">
                                                            intent: {account.latest_ai_insight.intent.replaceAll('_', ' ')}
                                                        </span>
                                                    )}
                                                    {account.latest_ai_insight.priority && (
                                                        <span className="rounded-full bg-background px-2 py-1 text-muted-foreground capitalize">
                                                            {account.latest_ai_insight.priority} priority
                                                        </span>
                                                    )}
                                                    {account.latest_ai_insight.confidence_score != null && (
                                                        <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                                                            {Math.round(Number(account.latest_ai_insight.confidence_score))}% confident
                                                        </span>
                                                    )}
                                                </div>

                                                {account.latest_ai_insight.reply_goal && (
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Goal: {account.latest_ai_insight.reply_goal}
                                                    </p>
                                                )}

                                                {account.latest_ai_insight.key_points && account.latest_ai_insight.key_points.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {account.latest_ai_insight.key_points.map((point) => (
                                                            <span key={point} className="rounded-full border border-border/60 px-2 py-1 text-[11px] text-foreground">
                                                                {point}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <p className="mt-2 text-[11px] text-muted-foreground">
                                                    Memory hits: {account.latest_ai_insight.memory_hits ?? 0}
                                                    {account.latest_ai_insight.status ? ` · Draft status: ${account.latest_ai_insight.status}` : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/50 py-12 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                                    <Plus className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">No channels connected</p>
                                    <p className="mt-1 text-xs text-muted-foreground max-w-[260px]">
                                        Connect WhatsApp, Facebook, or Instagram above to start deploying your AI bot.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">

                    {/* Email accounts */}
                    <div className="rounded-xl border border-border/50 bg-card">
                        <div className="border-b border-border/50 px-4 py-3">
                            <p className="text-sm font-semibold text-foreground">Email accounts</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Connected inboxes for automation</p>
                        </div>
                        <div className="p-2">
                            {emails.isLoading ? (
                                <div className="space-y-1 p-2">
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between gap-3 rounded-lg p-2">
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-3.5 w-36" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                            <Skeleton className="h-5 w-14 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : emails.data?.accounts.length ? (
                                <div className="space-y-px">
                                    {emails.data.accounts.slice(0, 5).map((account) => (
                                        <div key={account.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
                                            <div className="min-w-0">
                                                <p className="truncate text-[0.82rem] font-medium text-foreground">{account.email}</p>
                                                <p className="text-[0.72rem] capitalize text-muted-foreground">{account.provider}</p>
                                            </div>
                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${account.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                                                {account.is_active ? 'Active' : 'Off'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="px-3 py-4 text-xs text-muted-foreground">No email accounts connected.</p>
                            )}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="rounded-xl border border-border/50 bg-card">
                        <div className="border-b border-border/50 px-4 py-3">
                            <p className="text-sm font-semibold text-foreground">Quick links</p>
                        </div>
                        <div className="p-2 space-y-px">
                            {[
                                { to: '/widget', label: 'Website widget', icon: Globe2 },
                                { to: '/mails', label: 'Email inbox', icon: Mail },
                                { to: '/user/settings', label: 'App settings', icon: Settings2 },
                            ].map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                        {label}
                                    </div>
                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
