import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Key,
    Wallet,
    Activity,
    Plus,
    Edit,
    ToggleLeft,
    ToggleRight,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Copy,
    TrendingUp,
    Users,
    DollarSign,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApiModel {
    id: string;
    public_id: string;
    name: string;
    description: string | null;
    model_type: string;
    upstream_provider: string;
    upstream_model: string;
    input_price_per_1m_tokens: number;
    output_price_per_1m_tokens: number;
    provider_input_price_per_1m_tokens: number | null;
    provider_output_price_per_1m_tokens: number | null;
    max_context_tokens: number | null;
    supports_streaming: boolean;
    supports_tools: boolean;
    supports_reasoning: boolean;
    is_active: boolean;
    created_at: string;
}

interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    is_active: boolean;
    notes: string | null;
    allowed_model_ids: string[];
    expires_at: string | null;
    last_used_at: string | null;
    usage_requests_count: number;
    usage_spend_usd: number;
    user: { id: string; name: string; email: string } | null;
}

interface UsageRecord {
    id: string;
    request_id: string;
    endpoint: string;
    status: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost_usd: number;
    created_at: string;
    user: { id: string; name: string; email: string } | null;
    api_key: { id: string; name: string; key_prefix: string } | null;
    model: { id: string; public_id: string; name: string } | null;
}

interface Wallet {
    id: string;
    user_id: string;
    balance_usd: number;
    lifetime_credited_usd: number;
    lifetime_debited_usd: number;
    ledger_count: number;
    user: { id: string; name: string; email: string } | null;
}

interface LedgerEntry {
    id: string;
    type: 'topup' | 'debit' | 'adjustment';
    amount_usd: number;
    balance_before_usd: number;
    balance_after_usd: number;
    description: string;
    external_reference: string | null;
    created_at: string;
    user: { id: string; name: string; email: string } | null;
    api_key: { id: string; name: string; key_prefix: string } | null;
}

interface AdminStats {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    total_tokens: number;
    total_cost_usd: number;
    active_keys: number;
    wallet_count: number;
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
    models: ApiModel[];
    keys: Paginated<ApiKey>;
    usage: Paginated<UsageRecord>;
    wallets: Paginated<Wallet>;
    ledger: Paginated<LedgerEntry>;
    stats: AdminStats;
    breakdowns: {
        by_model: Record<string, number>;
        by_status: Record<string, number>;
        trend: { date: string; requests: number; cost_usd: number }[];
        recent_payments: { id: string; amount_usd: number; description: string; created_at: string; user: { id: string; name: string; email: string } | null }[];
    };
    filters: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Overview Stats ────────────────────────────────────────────────────────────

function OverviewStats({ stats }: { stats: AdminStats }) {
    const items = [
        { label: 'Total Requests', value: stats.total_requests.toLocaleString(), icon: Activity },
        { label: 'Total Revenue', value: formatUsd(stats.total_cost_usd), icon: DollarSign },
        { label: 'Active Keys', value: stats.active_keys.toLocaleString(), icon: Key },
        { label: 'Wallets', value: stats.wallet_count.toLocaleString(), icon: Wallet },
        { label: 'Total Tokens', value: stats.total_tokens.toLocaleString(), icon: Zap },
        { label: 'Success Rate', value: stats.total_requests > 0 ? `${((stats.successful_requests / stats.total_requests) * 100).toFixed(1)}%` : '—', icon: TrendingUp },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {items.map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                            <Icon className="w-3.5 h-3.5" />
                            <p className="text-xs">{label}</p>
                        </div>
                        <p className="text-xl font-semibold">{value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ─── Models Tab ───────────────────────────────────────────────────────────────

interface ModelFormValues {
    public_id: string;
    name: string;
    description: string;
    upstream_provider: string;
    upstream_model: string;
    input_price_per_1m_tokens: string;
    output_price_per_1m_tokens: string;
    provider_input_price_per_1m_tokens: string;
    provider_output_price_per_1m_tokens: string;
    max_context_tokens: string;
    supports_streaming: boolean;
    supports_tools: boolean;
    is_active: boolean;
}

const EMPTY_MODEL_FORM: ModelFormValues = {
    public_id: '',
    name: '',
    description: '',
    upstream_provider: 'xai',
    upstream_model: '',
    input_price_per_1m_tokens: '0',
    output_price_per_1m_tokens: '0',
    provider_input_price_per_1m_tokens: '',
    provider_output_price_per_1m_tokens: '',
    max_context_tokens: '',
    supports_streaming: true,
    supports_tools: false,
    is_active: true,
};

function ModelDialog({
    open,
    onClose,
    editModel,
}: {
    open: boolean;
    onClose: () => void;
    editModel: ApiModel | null;
}) {
    const [form, setForm] = useState<ModelFormValues>(() =>
        editModel
            ? {
                  public_id: editModel.public_id,
                  name: editModel.name,
                  description: editModel.description ?? '',
                  upstream_provider: editModel.upstream_provider,
                  upstream_model: editModel.upstream_model,
                  input_price_per_1m_tokens: String(editModel.input_price_per_1m_tokens),
                  output_price_per_1m_tokens: String(editModel.output_price_per_1m_tokens),
                  provider_input_price_per_1m_tokens: String(editModel.provider_input_price_per_1m_tokens ?? ''),
                  provider_output_price_per_1m_tokens: String(editModel.provider_output_price_per_1m_tokens ?? ''),
                  max_context_tokens: String(editModel.max_context_tokens ?? ''),
                  supports_streaming: editModel.supports_streaming,
                  supports_tools: editModel.supports_tools,
                  is_active: editModel.is_active,
              }
            : EMPTY_MODEL_FORM
    );
    const [loading, setLoading] = useState(false);

    const set = (key: keyof ModelFormValues, val: string | boolean) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    function submit() {
        setLoading(true);
        const payload = {
            ...form,
            input_price_per_1m_tokens: parseFloat(form.input_price_per_1m_tokens),
            output_price_per_1m_tokens: parseFloat(form.output_price_per_1m_tokens),
            provider_input_price_per_1m_tokens: form.provider_input_price_per_1m_tokens ? parseFloat(form.provider_input_price_per_1m_tokens) : null,
            provider_output_price_per_1m_tokens: form.provider_output_price_per_1m_tokens ? parseFloat(form.provider_output_price_per_1m_tokens) : null,
            max_context_tokens: form.max_context_tokens ? parseInt(form.max_context_tokens) : null,
        };
        if (editModel) {
            router.put(route('admin.developer-api.models.update', editModel.id), payload, {
                onError: (e) => { toast.error(Object.values(e)[0] as string); setLoading(false); },
                onSuccess: () => { setLoading(false); onClose(); },
            });
        } else {
            router.post(route('admin.developer-api.models.store'), payload, {
                onError: (e) => { toast.error(Object.values(e)[0] as string); setLoading(false); },
                onSuccess: () => { setLoading(false); onClose(); },
            });
        }
    }

    const Field = ({ label, id, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) => (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} className="mt-1" {...props} />
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editModel ? 'Edit Model' : 'Add Model'}</DialogTitle>
                    <DialogDescription>
                        {editModel ? `Editing ${editModel.public_id}` : 'Configure a new Kwati AI model.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-1">
                    {!editModel && (
                        <Field label="Public Model ID *" id="public_id" value={form.public_id}
                            onChange={(e) => set('public_id', e.target.value)} placeholder="kwati-5" />
                    )}
                    <Field label="Display Name *" id="name" value={form.name}
                        onChange={(e) => set('name', e.target.value)} placeholder="Kwati 5" />
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={form.description}
                            onChange={(e) => set('description', e.target.value)} className="mt-1 h-16" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Upstream Provider *" id="upstream_provider" value={form.upstream_provider}
                            onChange={(e) => set('upstream_provider', e.target.value)} placeholder="xai" />
                        <Field label="Upstream Model *" id="upstream_model" value={form.upstream_model}
                            onChange={(e) => set('upstream_model', e.target.value)} placeholder="grok-4-fast-reasoning" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium pt-1">Customer Pricing (per 1M tokens)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Input $" id="inp" type="number" min={0} step={0.01} value={form.input_price_per_1m_tokens}
                            onChange={(e) => set('input_price_per_1m_tokens', e.target.value)} />
                        <Field label="Output $" id="out" type="number" min={0} step={0.01} value={form.output_price_per_1m_tokens}
                            onChange={(e) => set('output_price_per_1m_tokens', e.target.value)} />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium pt-1">Provider Cost (internal, optional)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Provider Input $" id="pinp" type="number" min={0} step={0.001} value={form.provider_input_price_per_1m_tokens}
                            onChange={(e) => set('provider_input_price_per_1m_tokens', e.target.value)} />
                        <Field label="Provider Output $" id="pout" type="number" min={0} step={0.001} value={form.provider_output_price_per_1m_tokens}
                            onChange={(e) => set('provider_output_price_per_1m_tokens', e.target.value)} />
                    </div>
                    <Field label="Max Context Tokens" id="ctx" type="number" min={1} value={form.max_context_tokens}
                        onChange={(e) => set('max_context_tokens', e.target.value)} placeholder="131072" />

                    <div className="flex items-center justify-between">
                        <Label htmlFor="sw_streaming">Streaming</Label>
                        <Switch id="sw_streaming" checked={form.supports_streaming}
                            onCheckedChange={(v) => set('supports_streaming', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="sw_tools">Tool Calls</Label>
                        <Switch id="sw_tools" checked={form.supports_tools}
                            onCheckedChange={(v) => set('supports_tools', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="sw_active">Active</Label>
                        <Switch id="sw_active" checked={form.is_active}
                            onCheckedChange={(v) => set('is_active', v)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={submit} disabled={loading}>
                        {loading ? 'Saving…' : editModel ? 'Save Changes' : 'Create Model'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ModelsTab({ models }: { models: ApiModel[] }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editModel, setEditModel] = useState<ApiModel | null>(null);

    function openCreate() { setEditModel(null); setDialogOpen(true); }
    function openEdit(m: ApiModel) { setEditModel(m); setDialogOpen(true); }

    function handleToggle(m: ApiModel) {
        router.post(route('admin.developer-api.models.toggle', m.id), {}, {
            onError: () => toast.error('Failed to update model status.'),
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button size="sm" onClick={openCreate}>
                    <Plus className="w-4 h-4 mr-1" /> Add Model
                </Button>
            </div>

            <ModelDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditModel(null); }} editModel={editModel} />

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Public ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Upstream Model</TableHead>
                            <TableHead className="text-right">Input $/M</TableHead>
                            <TableHead className="text-right">Output $/M</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-20"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {models.map((m) => (
                            <TableRow key={m.id} className={cn(!m.is_active && 'opacity-50')}>
                                <TableCell className="font-mono text-xs">{m.public_id}</TableCell>
                                <TableCell className="text-sm">{m.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-xs">{m.upstream_provider}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{m.upstream_model}</TableCell>
                                <TableCell className="text-right text-xs">${m.input_price_per_1m_tokens}</TableCell>
                                <TableCell className="text-right text-xs">${m.output_price_per_1m_tokens}</TableCell>
                                <TableCell>
                                    <Badge variant={m.is_active ? 'default' : 'secondary'}>
                                        {m.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1 hover:bg-muted rounded" onClick={() => openEdit(m)}>
                                            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
                                        <button className="p-1 hover:bg-muted rounded" onClick={() => handleToggle(m)}>
                                            {m.is_active
                                                ? <ToggleRight className="w-3.5 h-3.5 text-green-500" />
                                                : <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" />}
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

// ─── Keys Tab ─────────────────────────────────────────────────────────────────

function KeysTab({ keys }: { keys: Paginated<ApiKey> }) {
    const { props } = usePage<{ flash?: { developer_plaintext_key?: string } }>();
    const newKey = props.flash?.developer_plaintext_key ?? null;

    function handleToggle(id: string) {
        router.post(route('admin.developer-api.keys.toggle', id), {}, {
            onError: () => toast.error('Failed.'),
        });
    }

    function handleRegenerate(id: string) {
        if (!confirm('Regenerate this API key?')) return;
        router.post(route('admin.developer-api.keys.regenerate', id), {}, {
            onError: () => toast.error('Failed.'),
        });
    }

    return (
        <div className="space-y-4">
            {newKey && (
                <Alert>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <AlertDescription>
                        New key (copy it now, shown once):{' '}
                        <code className="text-xs bg-muted px-2 py-0.5 rounded break-all">{newKey}</code>
                        <button className="ml-2 inline-flex" onClick={() => copyToClipboard(newKey, 'Key copied!')}>
                            <Copy className="w-3.5 h-3.5" />
                        </button>
                    </AlertDescription>
                </Alert>
            )}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Prefix</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Requests</TableHead>
                            <TableHead className="text-right">Spend</TableHead>
                            <TableHead>Last Used</TableHead>
                            <TableHead className="w-24"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {keys.data.map((k) => (
                            <TableRow key={k.id} className={cn(!k.is_active && 'opacity-50')}>
                                <TableCell className="font-medium text-sm">{k.name}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{k.user?.email ?? '—'}</TableCell>
                                <TableCell className="font-mono text-xs">{k.key_prefix}…</TableCell>
                                <TableCell>
                                    <Badge variant={k.is_active ? 'default' : 'secondary'} className="text-xs">
                                        {k.is_active ? 'Active' : 'Revoked'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-xs">{k.usage_requests_count.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{formatUsd(k.usage_spend_usd)}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{formatDate(k.last_used_at)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1 hover:bg-muted rounded" onClick={() => handleToggle(k.id)}>
                                            {k.is_active
                                                ? <ToggleRight className="w-3.5 h-3.5 text-green-500" />
                                                : <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" />}
                                        </button>
                                        {k.is_active && (
                                            <button className="p-1 hover:bg-muted rounded" onClick={() => handleRegenerate(k.id)}>
                                                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                                            </button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

// ─── Usage Tab ────────────────────────────────────────────────────────────────

function UsageTab({ usage }: { usage: Paginated<UsageRecord> }) {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead>Key</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {usage.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No usage records.</TableCell>
                        </TableRow>
                    ) : usage.data.map((r) => (
                        <TableRow key={r.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(r.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{r.user?.email ?? '—'}</TableCell>
                            <TableCell className="font-mono text-xs">{r.model?.public_id ?? '—'}</TableCell>
                            <TableCell>
                                <Badge variant={r.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                                    {r.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right text-xs">{r.total_tokens.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{formatUsd(r.cost_usd)}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {r.api_key ? `${r.api_key.key_prefix}…` : '—'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

// ─── Wallets Tab ──────────────────────────────────────────────────────────────

function WalletsTab({ wallets }: { wallets: Paginated<Wallet> }) {
    const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);

    function handleAdjust() {
        if (!adjustUserId) return;
        setLoading(true);
        router.post(route('admin.developer-api.wallets.adjust', adjustUserId), { amount_usd: parseFloat(amount), description: desc }, {
            onError: (e) => { toast.error(Object.values(e)[0] as string); setLoading(false); },
            onSuccess: () => { setAdjustUserId(null); setAmount(''); setDesc(''); setLoading(false); toast.success('Wallet adjusted.'); },
        });
    }

    return (
        <div className="space-y-4">
            <Dialog open={!!adjustUserId} onOpenChange={() => setAdjustUserId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Wallet Balance</DialogTitle>
                        <DialogDescription>Enter a positive amount to credit, negative to debit.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>Amount (USD)</Label>
                            <Input type="number" step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" placeholder="+5.00 or -2.50" />
                        </div>
                        <div>
                            <Label>Reason *</Label>
                            <Input value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1" placeholder="Manual adjustment" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAdjustUserId(null)}>Cancel</Button>
                        <Button onClick={handleAdjust} disabled={loading || !amount || !desc}>
                            {loading ? 'Saving…' : 'Apply'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="text-right">Total Credited</TableHead>
                            <TableHead className="text-right">Total Debited</TableHead>
                            <TableHead className="text-right">Tx Count</TableHead>
                            <TableHead className="w-16"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {wallets.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No wallets yet.</TableCell>
                            </TableRow>
                        ) : wallets.data.map((w) => (
                            <TableRow key={w.id}>
                                <TableCell>
                                    <div className="text-sm font-medium">{w.user?.name ?? '—'}</div>
                                    <div className="text-xs text-muted-foreground">{w.user?.email}</div>
                                </TableCell>
                                <TableCell className={cn('text-right font-mono text-sm font-semibold', w.balance_usd < 0 && 'text-destructive')}>
                                    {formatUsd(w.balance_usd)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-green-600 dark:text-green-400">
                                    +{formatUsd(w.lifetime_credited_usd)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-red-600 dark:text-red-400">
                                    -{formatUsd(w.lifetime_debited_usd)}
                                </TableCell>
                                <TableCell className="text-right text-xs text-muted-foreground">{w.ledger_count}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAdjustUserId(w.user_id)}>
                                        Adjust
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

// ─── Ledger Tab ───────────────────────────────────────────────────────────────

function LedgerTab({ ledger }: { ledger: Paginated<LedgerEntry> }) {
    const typeColor: Record<string, string> = {
        topup: 'text-green-600 dark:text-green-400',
        debit: 'text-red-600 dark:text-red-400',
        adjustment: 'text-yellow-600 dark:text-yellow-400',
    };

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance After</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ledger.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No transactions.</TableCell>
                        </TableRow>
                    ) : ledger.data.map((e) => (
                        <TableRow key={e.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(e.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{e.user?.email ?? '—'}</TableCell>
                            <TableCell>
                                <span className={cn('text-xs font-medium capitalize', typeColor[e.type] ?? '')}>{e.type}</span>
                            </TableCell>
                            <TableCell className="text-sm max-w-[200px] truncate">{e.description}</TableCell>
                            <TableCell className={cn('text-right font-mono text-xs', typeColor[e.type] ?? '')}>
                                {e.type === 'debit' ? '-' : '+'}{formatUsd(Math.abs(e.amount_usd))}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">{formatUsd(e.balance_after_usd)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDeveloperApiIndex({
    models,
    keys,
    usage,
    wallets,
    ledger,
    stats,
    breakdowns,
    filters,
}: PageProps) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash ?? {};

    return (
        <AdminLayout>
            <Head title="Developer API — Admin" />

            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Developer API</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Manage API models, monitor usage, adjust wallets, and review key activity.
                    </p>
                </div>

                {flash.success && (
                    <Alert>
                        <CheckCircle2 className="w-4 h-4" />
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <OverviewStats stats={stats} />

                {/* Recent Payments */}
                {breakdowns.recent_payments && breakdowns.recent_payments.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Recent Top-ups
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {breakdowns.recent_payments.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between text-sm">
                                        <div>
                                            <span className="font-medium">{p.user?.name ?? '—'}</span>
                                            <span className="text-muted-foreground ml-2 text-xs">{p.user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(p.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                                                +{formatUsd(p.amount_usd)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="models">
                    <TabsList>
                        <TabsTrigger value="models">
                            <Zap className="w-3 h-3 mr-1" /> Models
                            <Badge variant="secondary" className="ml-1.5 text-xs">{models.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="keys">
                            <Key className="w-3 h-3 mr-1" /> Keys
                            <Badge variant="secondary" className="ml-1.5 text-xs">{keys.total}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="usage">
                            <Activity className="w-3 h-3 mr-1" /> Usage
                            <Badge variant="secondary" className="ml-1.5 text-xs">{usage.total}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="wallets">
                            <Wallet className="w-3 h-3 mr-1" /> Wallets
                            <Badge variant="secondary" className="ml-1.5 text-xs">{wallets.total}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="ledger">
                            <TrendingUp className="w-3 h-3 mr-1" /> Ledger
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="models" className="mt-4">
                        <ModelsTab models={models} />
                    </TabsContent>
                    <TabsContent value="keys" className="mt-4">
                        <KeysTab keys={keys} />
                    </TabsContent>
                    <TabsContent value="usage" className="mt-4">
                        <UsageTab usage={usage} />
                    </TabsContent>
                    <TabsContent value="wallets" className="mt-4">
                        <WalletsTab wallets={wallets} />
                    </TabsContent>
                    <TabsContent value="ledger" className="mt-4">
                        <LedgerTab ledger={ledger} />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
