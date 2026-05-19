import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import DeveloperPortalLayout from '@/layouts/developer-portal-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Key,
    Plus,
    RefreshCw,
    XCircle,
    CheckCircle2,
    AlertCircle,
    Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { SharedData } from '@/types';
import { developerPortalUrl, normalizeDeveloperPortalBaseUrl } from '@/lib/developer-portal-url';

interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    is_active: boolean;
    notes: string | null;
    allowed_model_ids: string[];
    expires_at: string | null;
    last_used_at: string | null;
    last_rotated_at: string | null;
    usage_requests_count: number;
    usage_spend_usd: number;
}

interface ApiModel {
    id: string;
    public_id: string;
    name: string;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    apiKeys: Paginated<ApiKey>;
    models: ApiModel[];
}

function formatUsd(val: number) {
    return '$' + val.toFixed(val < 0.01 ? 6 : 4);
}

function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function copyToClipboard(text: string, label = 'Copied!') {
    navigator.clipboard.writeText(text).then(() => toast.success(label));
}

function CreateKeyDialog({
    open,
    onClose,
    models,
    newPlaintextKey,
    baseUrl,
}: {
    open: boolean;
    onClose: () => void;
    models: ApiModel[];
    newPlaintextKey: string | null;
    baseUrl: string;
}) {
    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [allowedModels, setAllowedModels] = useState<string[]>([]);
    const [expiresAt, setExpiresAt] = useState('');
    const [loading, setLoading] = useState(false);

    function toggleModel(publicId: string) {
        setAllowedModels((prev) =>
            prev.includes(publicId) ? prev.filter((m) => m !== publicId) : [...prev, publicId]
        );
    }

    function submit() {
        if (!name.trim()) { toast.error('Key name is required'); return; }
        setLoading(true);
        router.post(developerPortalUrl(baseUrl, 'keys'), {
            name,
            notes: notes || null,
            allowed_model_ids: allowedModels.length > 0 ? allowedModels : null,
            expires_at: expiresAt || null,
        }, {
            onError: (e) => { toast.error(Object.values(e)[0] as string); setLoading(false); },
            onSuccess: () => { setLoading(false); setName(''); setNotes(''); setAllowedModels([]); setExpiresAt(''); },
        });
    }

    if (newPlaintextKey) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            API Key Created
                        </DialogTitle>
                        <DialogDescription>
                            Copy this key now. It will never be shown again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted rounded-md p-3 font-mono text-sm break-all select-all">
                        {newPlaintextKey}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="secondary" onClick={() => copyToClipboard(newPlaintextKey, 'API key copied!')}>
                            <Copy className="w-4 h-4 mr-1" /> Copy
                        </Button>
                        <Button onClick={onClose}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                    <DialogDescription>Give your key a name and optional settings.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Name *</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My App" className="mt-1" />
                    </div>
                    <div>
                        <Label>Notes</Label>
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" className="mt-1 h-20" />
                    </div>
                    <div>
                        <Label>Allowed Models <span className="text-muted-foreground font-normal">(leave empty for all)</span></Label>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {models.map((m) => (
                                <button
                                    key={m.public_id}
                                    type="button"
                                    onClick={() => toggleModel(m.public_id)}
                                    className={cn(
                                        'px-2 py-0.5 rounded text-xs border transition-colors',
                                        allowedModels.includes(m.public_id)
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-border hover:border-primary'
                                    )}
                                >
                                    {m.public_id}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label>Expires At <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={submit} disabled={loading}>
                        {loading ? 'Creating…' : 'Create Key'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function DeveloperApiKeys({ apiKeys, models }: PageProps) {
    const { props } = usePage<SharedData & { flash?: { success?: string; error?: string; developer_plaintext_key?: string } }>();
    const flash = props.flash ?? {};
    const newPlaintextKey = flash.developer_plaintext_key ?? null;
    const baseUrl = normalizeDeveloperPortalBaseUrl(props.developerPortal?.base_url);

    const [createOpen, setCreateOpen] = useState(!!newPlaintextKey);
    const [revokeId, setRevokeId] = useState<string | null>(null);

    function handleRevoke() {
        if (!revokeId) return;
        router.post(developerPortalUrl(baseUrl, `keys/${revokeId}/revoke`), {}, {
            onSuccess: () => { setRevokeId(null); toast.success('Key revoked.'); },
            onError: () => toast.error('Failed to revoke key.'),
        });
    }

    function handleRegenerate(id: string) {
        if (!confirm('Regenerate this key? The current key will stop working immediately.')) return;
        router.post(developerPortalUrl(baseUrl, `keys/${id}/regenerate`), {}, {
            onError: () => toast.error('Failed to regenerate key.'),
        });
    }

    return (
        <DeveloperPortalLayout title="API Keys">
            {flash.success && (
                <Alert className="mb-6">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertDescription>{flash.success}</AlertDescription>
                </Alert>
            )}
            {flash.error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">API Keys</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Create and manage keys to authenticate API requests.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-1.5" /> New API Key
                    </Button>
                </div>

                <CreateKeyDialog
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                    models={models}
                    newPlaintextKey={createOpen ? newPlaintextKey : null}
                    baseUrl={baseUrl}
                />

                {/* Confirm revoke dialog */}
                <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Revoke API Key?</DialogTitle>
                            <DialogDescription>This key will stop working immediately. This cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setRevokeId(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleRevoke}>Revoke</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {apiKeys.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center text-muted-foreground">
                            <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No API keys yet</p>
                            <p className="text-sm mt-1">Create a key to start making API requests.</p>
                            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                                <Plus className="w-4 h-4 mr-1.5" /> Create your first key
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {apiKeys.data.map((key) => (
                            <Card key={key.id} className={cn(!key.is_active && 'opacity-60')}>
                                <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">{key.name}</span>
                                            <Badge variant={key.is_active ? 'default' : 'secondary'}>
                                                {key.is_active ? 'Active' : 'Revoked'}
                                            </Badge>
                                            {key.expires_at && new Date(key.expires_at) < new Date() && (
                                                <Badge variant="destructive">Expired</Badge>
                                            )}
                                        </div>
                                        <div className="font-mono text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <span>{key.key_prefix}…</span>
                                            <button onClick={() => copyToClipboard(key.key_prefix, 'Prefix copied')}>
                                                <Copy className="w-3 h-3 hover:text-foreground transition-colors" />
                                            </button>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5 flex gap-3 flex-wrap">
                                            <span>{key.usage_requests_count.toLocaleString()} requests</span>
                                            <span>{formatUsd(key.usage_spend_usd)} spent</span>
                                            {key.last_used_at && <span>Last used {formatDate(key.last_used_at)}</span>}
                                            {key.expires_at && <span>Expires {formatDate(key.expires_at)}</span>}
                                        </div>
                                        {key.allowed_model_ids.length > 0 && (
                                            <div className="flex gap-1 flex-wrap mt-1.5">
                                                {key.allowed_model_ids.map((m) => (
                                                    <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                                                ))}
                                            </div>
                                        )}
                                        {key.notes && (
                                            <p className="text-xs text-muted-foreground mt-1 italic">{key.notes}</p>
                                        )}
                                    </div>
                                    {key.is_active && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button variant="outline" size="sm" onClick={() => handleRegenerate(key.id)}>
                                                <RefreshCw className="w-3 h-3 mr-1" /> Rotate
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setRevokeId(key.id)}
                                            >
                                                <XCircle className="w-3 h-3 mr-1" /> Revoke
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {apiKeys.last_page > 1 && (
                            <div className="flex justify-center gap-1 pt-2">
                                {apiKeys.links.map((link) => (
                                    <Button
                                        key={link.label}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="min-w-[2rem] text-xs"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DeveloperPortalLayout>
    );
}
