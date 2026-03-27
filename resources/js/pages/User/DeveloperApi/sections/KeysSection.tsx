import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, RefreshCw, Trash2, ChevronDown, ChevronUp, Clock, Activity, CalendarClock, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { Panel, Field, SelectField, ModelToggle, Pagination, formatDate } from '../components';
import type { ApiKey, ApiModel, KeyDraft, Paginated } from '../types';

type Props = {
    apiKeys: Paginated<ApiKey>;
    models: ApiModel[];
    consoleBaseUrl: string;
    createData: { name: string; notes: string; expires_at: string; allowed_model_ids: string[] };
    createProcessing: boolean;
    onSetCreateData: (key: keyof Props['createData'], value: string | string[]) => void;
    onCreateKey: () => void;
    keyStatus: string;
    onSetKeyStatus: (value: string) => void;
    onApplyKeyFilter: () => void;
    keyDrafts: Record<string, KeyDraft>;
    onUpdateDraft: (keyId: string, patch: Partial<KeyDraft>) => void;
};

export function KeysSection({
    apiKeys,
    models,
    consoleBaseUrl,
    createData,
    createProcessing,
    onSetCreateData,
    onCreateKey,
    keyStatus,
    onSetKeyStatus,
    onApplyKeyFilter,
    keyDrafts,
    onUpdateDraft,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [showExpiry, setShowExpiry] = useState(false);
    const [showScopes, setShowScopes] = useState(false);

    const toggleCreate = (publicId: string) => {
        const current = createData.allowed_model_ids;
        onSetCreateData(
            'allowed_model_ids',
            current.includes(publicId)
                ? current.filter((id) => id !== publicId)
                : [...current, publicId],
        );
    };

    const handleOpenCreate = () => {
        setShowExpiry(false);
        setShowScopes(false);
        setCreateOpen(true);
    };

    const handleCreate = () => {
        onCreateKey();
        setCreateOpen(false);
    };

    return (
        <div className="space-y-6">
            <Panel
                title="API Keys"
                description="Manage keys scoped to specific models."
                action={
                    <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        New Key
                    </Button>
                }
            >
                <div className="mb-5 flex items-center gap-3">
                    <SelectField
                        label=""
                        value={keyStatus}
                        onChange={onSetKeyStatus}
                        className="w-40"
                    >
                        <option value="">All keys</option>
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                    </SelectField>
                    <Button variant="outline" size="sm" onClick={onApplyKeyFilter}>
                        Filter
                    </Button>
                </div>

                <div className="space-y-3">
                    {apiKeys.data.map((key) => {
                        const draft = keyDrafts[key.id];
                        if (!draft) return null;
                        return (
                            <KeyCard
                                key={key.id}
                                apiKey={key}
                                draft={draft}
                                models={models}
                                consoleBaseUrl={consoleBaseUrl}
                                onUpdateDraft={onUpdateDraft}
                            />
                        );
                    })}
                    {apiKeys.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 py-14">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <Activity className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">No API keys found.</p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleOpenCreate}
                                className="mt-1 gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Create your first key
                            </Button>
                        </div>
                    )}
                </div>
                <Pagination links={apiKeys.links} />
            </Panel>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                        <DialogDescription>
                            Give it a name. Expiry and model restrictions are optional — leave them unset for full access with no expiry.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-1">
                        {/* Name — always visible */}
                        <Field label="Name">
                            <Input
                                value={createData.name}
                                onChange={(e) => onSetCreateData('name', e.target.value)}
                                placeholder="e.g. production-app"
                                autoFocus
                            />
                        </Field>

                        {/* Notes — compact always-visible */}
                        <Field label="Notes (optional)">
                            <Textarea
                                className="min-h-16 resize-none"
                                value={createData.notes}
                                onChange={(e) => onSetCreateData('notes', e.target.value)}
                                placeholder="What is this key used for?"
                            />
                        </Field>

                        {/* Smart defaults summary */}
                        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                    <span className="font-medium text-foreground">Expiry: </span>
                                    {showExpiry && createData.expires_at
                                        ? new Date(createData.expires_at).toLocaleString()
                                        : 'Never (infinite)'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                    <span className="font-medium text-foreground">Access: </span>
                                    {showScopes && createData.allowed_model_ids.length > 0
                                        ? createData.allowed_model_ids.join(', ')
                                        : 'All models'}
                                </span>
                            </div>
                        </div>

                        {/* Advanced toggles */}
                        <div className="space-y-2">
                            {/* Expiry toggle */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowExpiry((v) => !v);
                                    if (showExpiry) onSetCreateData('expires_at', '');
                                }}
                                className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                                    {showExpiry ? 'Remove expiry date' : 'Set expiry date'}
                                </span>
                                <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showExpiry ? 'rotate-90' : ''}`} />
                            </button>
                            {showExpiry && (
                                <div className="pl-2">
                                    <Field label="Expires At">
                                        <Input
                                            type="datetime-local"
                                            value={createData.expires_at}
                                            onChange={(e) => onSetCreateData('expires_at', e.target.value)}
                                        />
                                    </Field>
                                </div>
                            )}

                            {/* Scope toggle */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowScopes((v) => !v);
                                    if (showScopes) onSetCreateData('allowed_model_ids', []);
                                }}
                                className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                    {showScopes ? 'Allow all models' : 'Restrict to specific models'}
                                </span>
                                <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showScopes ? 'rotate-90' : ''}`} />
                            </button>
                            {showScopes && (
                                <div className="pl-2">
                                    <div className="flex flex-wrap gap-2 pt-0.5">
                                        {models.map((m) => (
                                            <ModelToggle
                                                key={m.id}
                                                publicId={m.public_id}
                                                selected={createData.allowed_model_ids.includes(m.public_id)}
                                                onToggle={() => toggleCreate(m.public_id)}
                                            />
                                        ))}
                                        {models.length === 0 && (
                                            <span className="text-xs text-muted-foreground">No models available</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={createProcessing || !createData.name.trim()}>
                            {createProcessing ? 'Creating…' : 'Create Key'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function KeyCard({
    apiKey,
    draft,
    models,
    consoleBaseUrl,
    onUpdateDraft,
}: {
    apiKey: ApiKey;
    draft: KeyDraft;
    models: ApiModel[];
    consoleBaseUrl: string;
    onUpdateDraft: (keyId: string, patch: Partial<KeyDraft>) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [revokeOpen, setRevokeOpen] = useState(false);
    const [regenOpen, setRegenOpen] = useState(false);

    const toggleModel = (publicId: string) => {
        onUpdateDraft(apiKey.id, {
            allowed_model_ids: draft.allowed_model_ids.includes(publicId)
                ? draft.allowed_model_ids.filter((id) => id !== publicId)
                : [...draft.allowed_model_ids, publicId],
        });
    };

    return (
        <>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                    onClick={() => setExpanded((p) => !p)}
                    role="button"
                    aria-expanded={expanded}
                >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <code className="shrink-0 rounded border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs text-foreground">
                            {apiKey.key_prefix}
                        </code>
                        <span className="truncate text-sm font-medium text-foreground">
                            {apiKey.name || <span className="italic text-muted-foreground">Unnamed</span>}
                        </span>
                        <Badge variant={apiKey.is_active ? 'default' : 'secondary'} className="shrink-0">
                            {apiKey.is_active ? 'Active' : 'Revoked'}
                        </Badge>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                        <span className="hidden sm:inline">{apiKey.usage_requests_count.toLocaleString()} req</span>
                        <span className="hidden sm:inline">${apiKey.usage_spend_usd.toFixed(4)} spent</span>
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </div>

                {expanded && (
                    <div className="border-t border-border px-4 pb-4 pt-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Name">
                                <Input
                                    value={draft.name}
                                    onChange={(e) => onUpdateDraft(apiKey.id, { name: e.target.value })}
                                />
                            </Field>
                            <Field label="Expires At">
                                <Input
                                    type="datetime-local"
                                    value={draft.expires_at}
                                    onChange={(e) => onUpdateDraft(apiKey.id, { expires_at: e.target.value })}
                                />
                            </Field>
                            <Field label="Notes" className="sm:col-span-2">
                                <Textarea
                                    className="min-h-16 resize-none"
                                    value={draft.notes}
                                    onChange={(e) => onUpdateDraft(apiKey.id, { notes: e.target.value })}
                                />
                            </Field>
                            <Field label="Model Scopes" className="sm:col-span-2">
                                <div className="flex flex-wrap gap-2 pt-0.5">
                                    {models.map((m) => (
                                        <ModelToggle
                                            key={m.id}
                                            publicId={m.public_id}
                                            selected={draft.allowed_model_ids.includes(m.public_id)}
                                            onToggle={() => toggleModel(m.public_id)}
                                        />
                                    ))}
                                </div>
                            </Field>
                        </div>

                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Last used: {formatDate(apiKey.last_used_at)}</span>
                            <span className="mx-1">·</span>
                            <span>Rotated: {formatDate(apiKey.last_rotated_at)}</span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                onClick={() => router.put(`${consoleBaseUrl}/keys/${apiKey.id}`, draft)}
                            >
                                Save changes
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRegenOpen(true)}
                                className="gap-1.5"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Regenerate
                            </Button>
                            {apiKey.is_active && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setRevokeOpen(true)}
                                    className="gap-1.5"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Revoke
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently deactivate{' '}
                            <code className="font-mono text-xs">{apiKey.key_prefix}</code>. Any
                            application using this key will immediately lose access. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                setRevokeOpen(false);
                                router.post(`${consoleBaseUrl}/keys/${apiKey.id}/revoke`);
                            }}
                        >
                            Revoke Key
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={regenOpen} onOpenChange={setRegenOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            A new secret key will be issued for{' '}
                            <code className="font-mono text-xs">{apiKey.key_prefix}</code>. The
                            current key will be invalidated immediately. Make sure to update any
                            applications using this key.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setRegenOpen(false);
                                router.post(`${consoleBaseUrl}/keys/${apiKey.id}/regenerate`);
                            }}
                        >
                            Regenerate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
