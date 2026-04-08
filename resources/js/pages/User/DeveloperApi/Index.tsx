import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    Copy,
    Plus,
    RefreshCw,
    XCircle,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    Terminal,
    TrendingUp,
    CreditCard,
    LogOut,
    User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WalletSummary {
    balance_usd: number;
    lifetime_credited_usd: number;
    lifetime_debited_usd: number;
}

interface UsageStats {
    requests: number;
    success_requests: number;
    error_requests: number;
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
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
    last_rotated_at: string | null;
    usage_requests_count: number;
    usage_spend_usd: number;
}

interface UsageRecord {
    id: string;
    request_id: string;
    status: string;
    endpoint: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost_usd: number;
    created_at: string;
    is_estimated_tokens: boolean;
    api_key: { id: string; name: string; key_prefix: string } | null;
    model: { id: string; public_id: string; name: string } | null;
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
    api_key: { id: string; name: string; key_prefix: string } | null;
}

interface ApiModel {
    id: string;
    public_id: string;
    name: string;
    description: string | null;
    max_context_tokens: number | null;
    supports_streaming: boolean;
    supports_tools: boolean;
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
    wallet: WalletSummary;
    stats: UsageStats;
    breakdowns: {
        by_model: Record<string, number>;
        by_status: Record<string, number>;
        ledger: Record<string, number>;
        trend: { date: string; requests: number; cost_usd: number }[];
    };
    apiKeys: Paginated<ApiKey>;
    usage: Paginated<UsageRecord>;
    ledger: Paginated<LedgerEntry>;
    models: ApiModel[];
    apiBaseUrl: string;
    topupConfig: {
        default_amount_usd: number;
        min_amount_usd: number;
        max_amount_usd: number;
    };
    filters: Record<string, string>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function WalletCard({ wallet, topupConfig }: { wallet: WalletSummary | null | undefined; topupConfig: PageProps['topupConfig'] }) {
    const w: WalletSummary = wallet ?? { balance_usd: 0, lifetime_credited_usd: 0, lifetime_debited_usd: 0 };
    const [topupAmount, setTopupAmount] = useState(String(topupConfig.default_amount_usd));
    const [loading, setLoading] = useState(false);

    function handleTopup() {
        const amount = parseFloat(topupAmount);
        if (isNaN(amount) || amount < topupConfig.min_amount_usd || amount > topupConfig.max_amount_usd) {
            toast.error(`Amount must be between $${topupConfig.min_amount_usd} and $${topupConfig.max_amount_usd}`);
            return;
        }
        setLoading(true);
        router.post(
            '/developer-api/top-up',
            { amount_usd: amount },
            {
                onError: (e) => { toast.error(Object.values(e)[0] as string); setLoading(false); },
                onSuccess: () => setLoading(false),
            }
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Wallet className="w-4 h-4" /> Wallet Balance
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-3xl font-bold">${w.balance_usd.toFixed(4)}</div>
                <div className="text-sm text-muted-foreground space-y-1">
                    <div>Total credited: ${w.lifetime_credited_usd.toFixed(2)}</div>
                    <div>Total spent: ${w.lifetime_debited_usd.toFixed(4)}</div>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        min={topupConfig.min_amount_usd}
                        max={topupConfig.max_amount_usd}
                        step={1}
                        className="w-28"
                    />
                    <Button onClick={handleTopup} disabled={loading} size="sm">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {loading ? 'Redirecting…' : 'Top up'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function StatsRow({ stats }: { stats: UsageStats | null | undefined }) {
    const s: UsageStats = stats ?? {
        requests: 0,
        success_requests: 0,
        error_requests: 0,
        total_tokens: 0,
        input_tokens: 0,
        output_tokens: 0,
        cost_usd: 0,
    };
    const items = [
        { label: 'Total Requests', value: (s.requests ?? 0).toLocaleString() },
        { label: 'Success Rate', value: s.requests > 0 ? `${((s.success_requests / s.requests) * 100).toFixed(1)}%` : '—' },
        { label: 'Total Tokens', value: (s.total_tokens ?? 0).toLocaleString() },
        { label: 'Total Spend', value: formatUsd(s.cost_usd ?? 0) },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.map((item) => (
                <Card key={item.label}>
                    <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-2xl font-semibold mt-0.5">{item.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ─── Key Management ───────────────────────────────────────────────────────────

interface CreateKeyDialogProps {
    open: boolean;
    onClose: () => void;
    models: ApiModel[];
    newPlaintextKey: string | null;
}

function CreateKeyDialog({ open, onClose, models, newPlaintextKey }: CreateKeyDialogProps) {
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
        router.post(
            '/developer-api/keys',
            {
                name,
                notes: notes || null,
                allowed_model_ids: allowedModels.length > 0 ? allowedModels : null,
                expires_at: expiresAt || null,
            },
            {
                onError: (e) => { toast.error(Object.values(e)[0] as string); setLoading(false); },
                onSuccess: () => { setLoading(false); setName(''); setNotes(''); setAllowedModels([]); setExpiresAt(''); },
            }
        );
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
                        <Button
                            variant="secondary"
                            onClick={() => copyToClipboard(newPlaintextKey, 'API key copied!')}
                        >
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
                        <Label>Allowed Models (leave empty for all)</Label>
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
                        <Label>Expires At (optional)</Label>
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

function ApiKeysTab({ apiKeys, models, newPlaintextKey }: { apiKeys: Paginated<ApiKey>; models: ApiModel[]; newPlaintextKey: string | null }) {
    const [createOpen, setCreateOpen] = useState(!!newPlaintextKey);
    const [revokeId, setRevokeId] = useState<string | null>(null);

    function handleRevoke() {
        if (!revokeId) return;
        router.post(`/developer-api/keys/${revokeId}/revoke`, {}, {
            onSuccess: () => { setRevokeId(null); toast.success('Key revoked.'); },
            onError: () => toast.error('Failed to revoke key.'),
        });
    }

    function handleRegenerate(id: string) {
        if (!confirm('Regenerate this key? The current key will stop working immediately.')) return;
        router.post(`/developer-api/keys/${id}/regenerate`, {}, {
            onError: () => toast.error('Failed to regenerate key.'),
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> New API Key
                </Button>
            </div>

            <CreateKeyDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                models={models}
                newPlaintextKey={createOpen ? newPlaintextKey : null}
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
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Key className="w-8 h-8 mx-auto mb-3 opacity-40" />
                        <p>No API keys yet. Create one to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {apiKeys.data.map((key) => (
                        <Card key={key.id} className={cn(!key.is_active && 'opacity-60')}>
                            <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium truncate">{key.name}</span>
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
                                            <Copy className="w-3 h-3 hover:text-foreground" />
                                        </button>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5 flex gap-3 flex-wrap">
                                        <span>{key.usage_requests_count} requests</span>
                                        <span>{formatUsd(key.usage_spend_usd)} spent</span>
                                        {key.last_used_at && <span>Last used {formatDate(key.last_used_at)}</span>}
                                    </div>
                                    {key.allowed_model_ids.length > 0 && (
                                        <div className="flex gap-1 flex-wrap mt-1">
                                            {key.allowed_model_ids.map((m) => (
                                                <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {key.is_active && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRegenerate(key.id)}
                                            >
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
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function UsageTab({ usage }: { usage: Paginated<UsageRecord> }) {
    return (
        <div>
            {usage.data.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Activity className="w-8 h-8 mx-auto mb-3 opacity-40" />
                        <p>No usage records yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Tokens</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead>Key</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usage.data.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(r.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {r.model?.public_id ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={r.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                                            {r.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-xs">
                                        {r.total_tokens.toLocaleString()}
                                        {r.is_estimated_tokens && <span className="text-muted-foreground ml-1">~</span>}
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-mono">
                                        {formatUsd(r.cost_usd)}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {r.api_key ? `${r.api_key.key_prefix}…` : '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}

function LedgerTab({ ledger }: { ledger: Paginated<LedgerEntry> }) {
    const typeColor: Record<string, string> = {
        topup: 'text-green-600 dark:text-green-400',
        debit: 'text-red-600 dark:text-red-400',
        adjustment: 'text-yellow-600 dark:text-yellow-400',
    };

    return (
        <div>
            {ledger.data.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-40" />
                        <p>No transactions yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Balance After</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ledger.data.map((e) => (
                                <TableRow key={e.id}>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(e.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn('text-xs font-medium capitalize', typeColor[e.type] ?? '')}>
                                            {e.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm max-w-[220px] truncate">{e.description}</TableCell>
                                    <TableCell className={cn('text-right font-mono text-xs', typeColor[e.type] ?? '')}>
                                        {e.type === 'debit' ? '-' : '+'}{formatUsd(Math.abs(e.amount_usd))}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs">
                                        {formatUsd(e.balance_after_usd)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}

function QuickstartTab({ apiBaseUrl, models }: { apiBaseUrl: string; models: ApiModel[] }) {
    const defaultModel = models[0]?.public_id ?? 'kwati-4';
    const curlExample = `curl -X POST ${apiBaseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${defaultModel}",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`;

    return (
        <div className="space-y-6">
            <Alert>
                <Terminal className="w-4 h-4" />
                <AlertDescription>
                    The API is fully compatible with the OpenAI SDK. Just point the <code className="text-xs">base_url</code> to{' '}
                    <code className="text-xs">{apiBaseUrl}</code> and use your API key.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Terminal className="w-4 h-4" /> Quick Start — cURL
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <pre className="bg-muted text-sm rounded-md p-4 overflow-x-auto font-mono text-xs leading-relaxed">
                            {curlExample}
                        </pre>
                        <button
                            className="absolute top-2 right-2 p-1.5 rounded hover:bg-background/80"
                            onClick={() => copyToClipboard(curlExample, 'Example copied!')}
                        >
                            <Copy className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Available Models</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Model ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Context</TableHead>
                                <TableHead>Streaming</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {models.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell className="font-mono text-xs">{m.public_id}</TableCell>
                                    <TableCell className="text-sm">{m.name}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {m.max_context_tokens ? `${(m.max_context_tokens / 1000).toFixed(0)}k` : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {m.supports_streaming ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Python Example
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted text-xs rounded-md p-4 overflow-x-auto font-mono leading-relaxed">{`from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${apiBaseUrl}",
)

response = client.chat.completions.create(
    model="${defaultModel}",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)`}</pre>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DeveloperApiIndex({
    wallet,
    stats,
    apiKeys,
    usage,
    ledger,
    models,
    apiBaseUrl,
    topupConfig,
}: PageProps) {
    const { props } = usePage<SharedData & { flash?: { success?: string; error?: string; developer_plaintext_key?: string } }>();
    const flash = props.flash ?? {};
    const newPlaintextKey = flash.developer_plaintext_key ?? null;
    const auth = props.auth;

    function logout() {
        router.post('/developer-api/logout');
    }

    return (
        <div className="min-h-dvh bg-background">
            <Head title="Developer API Console" />

            {/* Standalone portal header — no SPA sidebar */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-sm tracking-tight">Kwati API Console</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{auth?.user?.email}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5">
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Developer API</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Build with the Kwati AI API. Manage keys, monitor usage, and top up your wallet.
                        </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                        {apiBaseUrl}
                    </Badge>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <WalletCard wallet={wallet} topupConfig={topupConfig} />
                    <div className="md:col-span-2">
                        <StatsRow stats={stats} />
                    </div>
                </div>

                <Tabs defaultValue={newPlaintextKey ? 'keys' : 'quickstart'}>
                    <TabsList>
                        <TabsTrigger value="quickstart">
                            <Terminal className="w-3 h-3 mr-1" /> Quickstart
                        </TabsTrigger>
                        <TabsTrigger value="keys">
                            <Key className="w-3 h-3 mr-1" /> API Keys
                            <Badge variant="secondary" className="ml-1.5 text-xs">{apiKeys.total}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="usage">
                            <Activity className="w-3 h-3 mr-1" /> Usage
                        </TabsTrigger>
                        <TabsTrigger value="billing">
                            <TrendingUp className="w-3 h-3 mr-1" /> Billing
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="quickstart" className="mt-4">
                        <QuickstartTab apiBaseUrl={apiBaseUrl} models={models} />
                    </TabsContent>
                    <TabsContent value="keys" className="mt-4">
                        <ApiKeysTab apiKeys={apiKeys} models={models} newPlaintextKey={newPlaintextKey} />
                    </TabsContent>
                    <TabsContent value="usage" className="mt-4">
                        <UsageTab usage={usage} />
                    </TabsContent>
                    <TabsContent value="billing" className="mt-4">
                        <LedgerTab ledger={ledger} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

