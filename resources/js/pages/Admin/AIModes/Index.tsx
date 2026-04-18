import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { Bot, Edit2, Eye, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface AIMode {
    id: number;
    name: string;
    description: string;
    emoji: string;
    system_prompt: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    modes: AIMode[];
}

const truncate = (text: string, max = 100) =>
    text.length <= max ? text : text.slice(0, max) + '…';

export default function Index({ modes }: Props) {
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const handleToggle = async (mode: AIMode) => {
        setTogglingId(mode.id);
        await router.patch(route('admin.ai-modes.toggle', mode.id), {}, {
            onSuccess: () => toast.success(`Mode ${mode.is_active ? 'deactivated' : 'activated'}`),
            onError: () => toast.error('Failed to toggle mode status'),
            onFinish: () => setTogglingId(null),
        });
    };

    const handleDelete = async (mode: AIMode) => {
        if (!confirm(`Delete "${mode.name}"? This cannot be undone.`)) return;
        await router.delete(route('admin.ai-modes.destroy', mode.id), {
            onSuccess: () => toast.success('Mode deleted'),
            onError: () => toast.error('Failed to delete mode'),
        });
    };

    const stats = [
        { label: 'Total modes', value: modes.length },
        { label: 'Active', value: modes.filter((m) => m.is_active).length },
        { label: 'Inactive', value: modes.filter((m) => !m.is_active).length },
        { label: 'Max order', value: modes.length > 0 ? Math.max(...modes.map((m) => m.display_order)) : 0 },
    ];

    return (
        <AdminLayout>
            <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">

                {/* ── Header ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">AI Modes</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage AI conversation modes and their system prompts.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.visit(route('admin.ai-modes.create'))}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create mode
                    </Button>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {stats.map(({ label, value }) => (
                        <Card key={label}>
                            <CardContent className="pt-5 pb-4">
                                <p className="text-2xl font-bold text-foreground">{value}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── Modes list ── */}
                <Card>
                    <CardHeader>
                        <CardTitle>All AI modes</CardTitle>
                        <CardDescription>
                            Configure different AI personalities and behaviors for conversations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {modes.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <Bot className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">No AI modes yet</p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">Create your first mode to get started.</p>
                                </div>
                                <Button onClick={() => router.visit(route('admin.ai-modes.create'))}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create your first mode
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* ── Mobile cards (hidden on md+) ── */}
                                <div className="divide-y divide-border md:hidden">
                                    {modes.map((mode) => (
                                        <div key={mode.id} className="p-4 space-y-3">
                                            {/* Top row */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-2xl shrink-0">{mode.emoji}</span>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-foreground truncate">{mode.name}</p>
                                                        <p className="text-xs text-muted-foreground">ID: {mode.id} · Order: {mode.display_order}</p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={`shrink-0 ${mode.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400'}`}
                                                >
                                                    {mode.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>

                                            {/* Description */}
                                            {mode.description && (
                                                <p className="text-sm text-muted-foreground">{truncate(mode.description, 120)}</p>
                                            )}

                                            {/* System prompt preview */}
                                            <div className="rounded-lg bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
                                                {truncate(mode.system_prompt, 100)}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => router.visit(route('admin.ai-modes.show', mode.id))}
                                                >
                                                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => router.visit(route('admin.ai-modes.edit', mode.id))}
                                                >
                                                    <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={mode.is_active ? 'destructive' : 'default'}
                                                    className="flex-1"
                                                    onClick={() => handleToggle(mode)}
                                                    disabled={togglingId === mode.id}
                                                >
                                                    {togglingId === mode.id ? (
                                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : mode.is_active ? (
                                                        <><ToggleRight className="mr-1.5 h-3.5 w-3.5" />Deactivate</>
                                                    ) : (
                                                        <><ToggleLeft className="mr-1.5 h-3.5 w-3.5" />Activate</>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(mode)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Desktop table (hidden below md) ── */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Mode</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>System prompt</TableHead>
                                                <TableHead className="w-16 text-center">Order</TableHead>
                                                <TableHead className="w-24">Status</TableHead>
                                                <TableHead className="w-44">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {modes.map((mode) => (
                                                <TableRow key={mode.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{mode.emoji}</span>
                                                            <div>
                                                                <p className="font-medium text-foreground">{mode.name}</p>
                                                                <p className="text-xs text-muted-foreground">ID: {mode.id}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="max-w-[180px] text-sm text-muted-foreground">
                                                            {truncate(mode.description, 80)}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-[220px] rounded-lg bg-muted/40 px-2 py-1.5 font-mono text-xs text-muted-foreground">
                                                            {truncate(mode.system_prompt, 120)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline">{mode.display_order}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={mode.is_active
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400'}
                                                        >
                                                            {mode.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            <Button size="sm" variant="outline" onClick={() => router.visit(route('admin.ai-modes.show', mode.id))}>
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => router.visit(route('admin.ai-modes.edit', mode.id))}>
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={mode.is_active ? 'destructive' : 'default'}
                                                                onClick={() => handleToggle(mode)}
                                                                disabled={togglingId === mode.id}
                                                            >
                                                                {togglingId === mode.id ? (
                                                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                ) : mode.is_active ? (
                                                                    <ToggleRight className="h-3.5 w-3.5" />
                                                                ) : (
                                                                    <ToggleLeft className="h-3.5 w-3.5" />
                                                                )}
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(mode)}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
