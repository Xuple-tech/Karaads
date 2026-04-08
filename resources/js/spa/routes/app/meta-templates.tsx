import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';

type ReplyTemplate = {
    id: string;
    name: string;
    content: string;
    category: string | null;
    usage_count: number;
    is_active: boolean;
    created_at: string;
};

type TemplatesResponse = { success: boolean; templates: ReplyTemplate[] };

const emptyForm = { name: '', content: '', category: '', is_active: true };

export function Component() {
    const { accountId } = useParams();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<ReplyTemplate | null>(null);
    const [form, setForm] = useState(emptyForm);

    const templatesQuery = useQuery({
        queryKey: ['spa', 'meta', 'account', accountId, 'templates'],
        queryFn: () => apiRequest<TemplatesResponse>(`/api/meta/accounts/${accountId}/templates`),
        enabled: Boolean(accountId),
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'account', accountId, 'templates'] });

    const createMutation = useMutation({
        mutationFn: () => apiRequest(`/api/meta/accounts/${accountId}/templates`, { method: 'POST', json: form }),
        onSuccess: async () => {
            toast.success('Template created');
            setDialogOpen(false);
            setForm(emptyForm);
            await invalidate();
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to create template.'),
    });

    const updateMutation = useMutation({
        mutationFn: () =>
            apiRequest(`/api/meta/accounts/${accountId}/templates/${editingTemplate!.id}`, { method: 'PUT', json: form }),
        onSuccess: async () => {
            toast.success('Template updated');
            setDialogOpen(false);
            setEditingTemplate(null);
            setForm(emptyForm);
            await invalidate();
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to update template.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            apiRequest(`/api/meta/accounts/${accountId}/templates/${id}`, { method: 'DELETE' }),
        onSuccess: async () => {
            toast.success('Template deleted');
            setDeleteId(null);
            await invalidate();
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to delete template.'),
    });

    const openCreate = () => {
        setEditingTemplate(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (template: ReplyTemplate) => {
        setEditingTemplate(template);
        setForm({
            name: template.name,
            content: template.content,
            category: template.category ?? '',
            is_active: template.is_active,
        });
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        if (editingTemplate) updateMutation.mutate();
        else createMutation.mutate();
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-8">
            {/* Header */}
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <Button asChild variant="ghost" className="h-auto w-fit px-0 py-1 text-muted-foreground hover:text-foreground">
                        <Link to={`/meta/accounts/${accountId}`}>
                            <ArrowLeft className="mr-1.5 h-4 w-4" />
                            Back to workspace
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">Reply Templates</h1>
                    <p className="text-sm text-muted-foreground">Save canned responses to insert into conversations with one click.</p>
                </div>
                <Button type="button" onClick={openCreate}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    New template
                </Button>
            </div>

            {/* Template list */}
            <div className="rounded-xl border border-border/60 bg-card">
                {templatesQuery.isLoading ? (
                    <div className="divide-y divide-border/60">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                                <Skeleton className="h-8 w-20 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : (templatesQuery.data?.templates ?? []).length ? (
                    <div className="divide-y divide-border/60">
                        {templatesQuery.data!.templates.map((template) => (
                            <div key={template.id} className="flex items-start gap-4 p-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-foreground">{template.name}</p>
                                        {template.category && (
                                            <Badge variant="outline" className="text-xs capitalize">{template.category}</Badge>
                                        )}
                                        {!template.is_active && (
                                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                        )}
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{template.content}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{template.usage_count} use{template.usage_count === 1 ? '' : 's'}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(template)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => setDeleteId(template.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                        <p className="font-medium text-foreground">No templates yet</p>
                        <p className="max-w-xs text-sm text-muted-foreground">
                            Create a template for common replies like delivery times, pricing info, or greetings.
                        </p>
                        <Button type="button" className="mt-2" onClick={openCreate}>
                            <Plus className="mr-1.5 h-4 w-4" />
                            Create your first template
                        </Button>
                    </div>
                )}
            </div>

            {/* Create / Edit dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? 'Edit template' : 'New template'}</DialogTitle>
                        <DialogDescription>
                            Templates are available in the conversation reply area.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Delivery time Lagos"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category (optional)</Label>
                            <Input
                                id="category"
                                placeholder="e.g. delivery, pricing, greeting"
                                value={form.category}
                                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="content">Message</Label>
                                <span className="text-xs text-muted-foreground">{form.content.length}/1000</span>
                            </div>
                            <Textarea
                                id="content"
                                rows={6}
                                placeholder="Type the canned reply..."
                                value={form.content}
                                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                                maxLength={1000}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                id="is_active"
                                checked={form.is_active}
                                onCheckedChange={(val) => setForm((f) => ({ ...f, is_active: val }))}
                            />
                            <Label htmlFor="is_active">Active</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={isPending || !form.name.trim() || !form.content.trim()}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingTemplate ? 'Save changes' : 'Create template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete template?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
