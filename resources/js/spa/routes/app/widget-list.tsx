import { useMutation, useQuery } from '@tanstack/react-query';
import { Globe2, Loader2, MessageSquareText, Plus, Settings2 } from 'lucide-react';
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

    const widgetsQuery = useQuery({
        queryKey: ['spa', 'widgets'],
        queryFn: () => apiRequest<{ widgets: WidgetSummary[] }>('/api/widget'),
    });

    const createMutation = useMutation({
        mutationFn: () => apiRequest('/api/widget', { method: 'POST', json: { name, greeting } }),
        onSuccess: async () => {
            toast.success('Widget created');
            setOpen(false);
            setName('');
            setGreeting('Hi! How can I help you today?');
            await queryClient.invalidateQueries({ queryKey: ['spa', 'widgets'] });
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to create widget.'),
    });

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-8">

            {/* Page header */}
            <div className="flex flex-col gap-1 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Globe2 className="h-5 w-5 text-primary" />
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">Website Widgets</h1>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Deploy a branded AI chat bubble on any website — add knowledge, tools, and streaming responses.
                    </p>
                </div>
                <Button onClick={() => setOpen(true)} className="self-start sm:self-auto">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create widget
                </Button>
            </div>

            {/* Widget cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {widgetsQuery.isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div className="space-y-1.5 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-8 w-full rounded-lg" />
                        </div>
                    ))
                ) : (widgetsQuery.data?.widgets ?? []).length ? (
                    widgetsQuery.data!.widgets.map((widget) => (
                        <div key={widget.id} className="flex flex-col rounded-xl border border-border/60 bg-card p-4 gap-4">
                            {/* Header */}
                            <div className="flex items-start gap-3">
                                <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: widget.theme_color + '22' }}
                                >
                                    <Globe2 className="h-4 w-4" style={{ color: widget.theme_color }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate font-medium text-foreground">{widget.name}</p>
                                        <Badge
                                            variant={widget.is_active ? 'default' : 'secondary'}
                                            className={widget.is_active ? 'bg-emerald-600 text-white hover:bg-emerald-600 text-xs' : 'text-xs'}
                                        >
                                            {widget.is_active ? 'Active' : 'Paused'}
                                        </Badge>
                                    </div>
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{widget.greeting}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { label: 'Sessions', value: widget.sessions_count },
                                    { label: 'Messages', value: widget.messages_count },
                                    { label: 'Knowledge', value: widget.knowledge_count },
                                    { label: 'Tools', value: widget.tools_count },
                                ].map(({ label, value }) => (
                                    <div key={label} className="rounded-lg border border-border/60 p-2 text-center">
                                        <p className="text-sm font-semibold text-foreground">{value}</p>
                                        <p className="text-[10px] text-muted-foreground">{label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Action */}
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link to={`/widget/${widget.id}/settings`}>
                                    <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                                    Configure
                                </Link>
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-14 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <MessageSquareText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">No widgets yet</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">Create your first widget to start embedding Kwati on your site.</p>
                        </div>
                        <Button onClick={() => setOpen(true)}>
                            <Plus className="mr-1.5 h-4 w-4" />
                            Create widget
                        </Button>
                    </div>
                )}
            </div>

            {/* Create dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create widget</DialogTitle>
                        <DialogDescription>
                            Start with a name and greeting. Configure branding, knowledge, and tools next.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Widget name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Support Bot"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Greeting message</Label>
                            <Input
                                value={greeting}
                                onChange={(e) => setGreeting(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => createMutation.mutate()}
                            disabled={createMutation.isPending || !name.trim()}
                        >
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
