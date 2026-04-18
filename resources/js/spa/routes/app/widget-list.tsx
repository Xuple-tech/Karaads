import { useMutation, useQuery } from '@tanstack/react-query';
import { Globe2, Layers3, Loader2, MessageSquareText, Plus, Settings2, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';

type WidgetSummary = {
    id: string;
    name: string;
    bot_name: string;
    greeting: string;
    theme_color: string;
    is_active: boolean;
    sessions_count: number;
    knowledge_count: number;
    tools_count: number;
    messages_count: number;
};

export function Component() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [greeting, setGreeting] = useState('Hi! How can I help you today?');
    const [connectWebsite, setConnectWebsite] = useState(false);
    const [websiteSourceType, setWebsiteSourceType] = useState<'wordpress_url' | 'wordpress_plugin'>('wordpress_url');
    const [siteUrl, setSiteUrl] = useState('');
    const [verificationMethod, setVerificationMethod] = useState<'meta_tag' | 'file'>('meta_tag');

    const widgetsQuery = useQuery({
        queryKey: ['spa', 'widgets'],
        queryFn: () => apiRequest<{ widgets: WidgetSummary[] }>('/api/widget'),
    });

    const createMutation = useMutation({
        mutationFn: () =>
            apiRequest('/api/widget', {
                method: 'POST',
                json: {
                    name,
                    greeting,
                    website_source:
                        connectWebsite && siteUrl.trim()
                            ? {
                                  source_type: websiteSourceType,
                                  site_url: siteUrl,
                                  verification_method: websiteSourceType === 'wordpress_url' ? verificationMethod : null,
                                  scope_mode: 'safe_public',
                                  recrawl_interval_hours: 24,
                              }
                            : undefined,
                },
            }),
        onSuccess: async () => {
            toast.success('Widget created');
            setOpen(false);
            setName('');
            setGreeting('Hi! How can I help you today?');
            setConnectWebsite(false);
            setSiteUrl('');
            setWebsiteSourceType('wordpress_url');
            setVerificationMethod('meta_tag');
            await queryClient.invalidateQueries({ queryKey: ['spa', 'widgets'] });
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to create widget.'),
    });

    const widgets = widgetsQuery.data?.widgets ?? [];

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-10">

            {/* ── Hero header ── */}
            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card px-6 py-8 sm:px-8">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-10 right-0 h-64 w-64 rounded-full bg-violet-600/15 blur-[80px]" />
                    <div className="absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-indigo-600/10 blur-[60px]" />
                </div>
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI Chat Widgets
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            Website Widgets
                        </h1>
                        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                            Deploy a branded AI chat bubble on any website — add knowledge, tools, and streaming responses.
                        </p>
                    </div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98] sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create widget
                    </Button>
                </div>
            </div>

            {/* ── Widget grid ── */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {widgetsQuery.isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton key={j} className="h-14 rounded-xl" />
                                ))}
                            </div>
                            <Skeleton className="h-9 w-full rounded-xl" />
                        </div>
                    ))
                ) : widgets.length ? (
                    widgets.map((widget) => <WidgetCard key={widget.id} widget={widget} />)
                ) : (
                    <EmptyState onCreateClick={() => setOpen(true)} />
                )}
            </div>

            {/* ── Create dialog ── */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create widget</DialogTitle>
                        <DialogDescription>
                            Start with a name and greeting — configure branding, knowledge, and tools next.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-1">
                        <div className="space-y-1.5">
                            <Label>Widget name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Support Bot"
                                autoFocus
                                className="h-11 rounded-xl bg-[#2a2a2a] border-[#383838] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Greeting message</Label>
                            <Input
                                value={greeting}
                                onChange={(e) => setGreeting(e.target.value)}
                                className="h-11 rounded-xl bg-[#2a2a2a] border-[#383838] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                            />
                        </div>

                        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Connect website</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">Optional — quick start for WordPress sites.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConnectWebsite((v) => !v)}
                                    className={`relative h-5 w-9 rounded-full transition-colors ${connectWebsite ? 'bg-violet-600' : 'bg-muted'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${connectWebsite ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {connectWebsite && (
                                <div className="space-y-3 pt-1">
                                    <select
                                        value={websiteSourceType}
                                        onChange={(e) => setWebsiteSourceType(e.target.value as 'wordpress_url' | 'wordpress_plugin')}
                                        className="h-10 w-full rounded-xl border border-[#383838] bg-[#2a2a2a] px-3 text-sm text-foreground outline-none focus:border-violet-500"
                                    >
                                        <option value="wordpress_url">Paste WordPress URL</option>
                                        <option value="wordpress_plugin">Connect with WordPress plugin</option>
                                    </select>
                                    <Input
                                        value={siteUrl}
                                        onChange={(e) => setSiteUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="h-10 rounded-xl bg-[#2a2a2a] border-[#383838] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    />
                                    {websiteSourceType === 'wordpress_url' && (
                                        <select
                                            value={verificationMethod}
                                            onChange={(e) => setVerificationMethod(e.target.value as 'meta_tag' | 'file')}
                                            className="h-10 w-full rounded-xl border border-[#383838] bg-[#2a2a2a] px-3 text-sm text-foreground outline-none focus:border-violet-500"
                                        >
                                            <option value="meta_tag">Verify with meta tag</option>
                                            <option value="file">Verify with file</option>
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            onClick={() => createMutation.mutate()}
                            disabled={createMutation.isPending || !name.trim()}
                            className="rounded-xl bg-violet-600 text-white hover:bg-violet-700"
                        >
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create widget
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function WidgetCard({ widget }: { widget: WidgetSummary }) {
    const stats = [
        { label: 'Sessions', value: widget.sessions_count },
        { label: 'Messages', value: widget.messages_count },
        { label: 'Knowledge', value: widget.knowledge_count },
        { label: 'Tools', value: widget.tools_count },
    ];

    return (
        <div className="group flex flex-col rounded-2xl border border-border/50 bg-card p-5 gap-4 transition-all hover:border-border hover:shadow-md">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                    style={{ backgroundColor: widget.theme_color + '22' }}
                >
                    <Globe2 className="h-5 w-5" style={{ color: widget.theme_color }} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{widget.name}</p>
                        <Badge
                            className={`text-[10px] px-1.5 py-0 ${widget.is_active ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15' : 'bg-muted text-muted-foreground'}`}
                            variant="outline"
                        >
                            {widget.is_active ? 'Live' : 'Paused'}
                        </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{widget.greeting}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
                {stats.map(({ label, value }) => (
                    <div key={label} className="flex flex-col items-center rounded-xl border border-border/50 bg-muted/20 py-2.5 px-1 text-center">
                        <p className="text-sm font-semibold text-foreground">{value}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{label}</p>
                    </div>
                ))}
            </div>

            {/* Configure button */}
            <Link
                to={`/widget/${widget.id}/settings`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-accent hover:border-border active:scale-[0.98]"
            >
                <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                Configure
            </Link>
        </div>
    );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
    return (
        <div className="col-span-full">
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border/60 py-16 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/40">
                    <MessageSquareText className="h-7 w-7 text-muted-foreground/60" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                    <p className="font-semibold text-foreground">No widgets yet</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Create your first widget to start embedding Kwati AI on your website.
                    </p>
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <Button
                        onClick={onCreateClick}
                        className="rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create widget
                    </Button>
                </div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground/60">
                    <span className="flex items-center gap-1.5"><Layers3 className="h-3.5 w-3.5" /> Knowledge base</span>
                    <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Custom tools</span>
                    <span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" /> Any website</span>
                </div>
            </div>
        </div>
    );
}
