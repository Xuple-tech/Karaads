import React, { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';

type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type ModelRow = {
    id: string;
    public_id: string;
    name: string;
    description?: string | null;
    model_type: 'text' | 'image';
    upstream_provider: string;
    upstream_model: string;
    input_price_per_1m_tokens: string;
    output_price_per_1m_tokens: string;
    provider_input_price_per_1m_tokens?: string | null;
    provider_output_price_per_1m_tokens?: string | null;
    price_per_image_usd?: string | null;
    provider_price_per_image_usd?: string | null;
    max_context_tokens?: number | null;
    supports_reasoning: boolean;
    supports_streaming: boolean;
    supports_tools: boolean;
    is_active: boolean;
};

type KeyRow = {
    id: string;
    name: string;
    key_prefix: string;
    is_active: boolean;
    notes?: string | null;
    allowed_model_ids: string[];
    expires_at?: string | null;
    last_used_at?: string | null;
    last_rotated_at?: string | null;
    usage_requests_count: number;
    usage_spend_usd: number;
    user?: { id: string; name: string; email: string } | null;
};

type UsageRow = {
    id: string;
    request_id: string;
    endpoint: string;
    status: string;
    total_tokens: number;
    cost_usd: number;
    created_at: string;
    user?: { id: string; name: string; email: string } | null;
    api_key?: { id: string; name: string; key_prefix: string } | null;
    model?: { id: string; public_id: string; name: string } | null;
};

type WalletRow = {
    id: string;
    user_id: string;
    balance_usd: number;
    lifetime_credited_usd: number;
    lifetime_debited_usd: number;
    ledger_count: number;
    user?: { id: string; name: string; email: string } | null;
};

type LedgerRow = {
    id: string;
    type: string;
    amount_usd: number;
    balance_before_usd: number;
    balance_after_usd: number;
    description?: string | null;
    external_reference?: string | null;
    created_at: string;
    user?: { id: string; name: string; email: string } | null;
};

type Props = {
    models: ModelRow[];
    keys: Paginated<KeyRow>;
    usage: Paginated<UsageRow>;
    wallets: Paginated<WalletRow>;
    ledger: Paginated<LedgerRow>;
    stats: {
        requests: number;
        total_tokens: number;
        cost_usd: number;
        success_requests: number;
        error_requests: number;
        active_keys: number;
        wallet_count: number;
    };
    breakdowns: {
        per_model: Array<{ model?: string | null; requests: number; cost_usd?: number }>;
        per_key: Array<{ key_prefix?: string | null; requests: number; cost_usd?: number }>;
        statuses: Array<{ status?: string; requests: number }>;
        top_customers: Array<{ email?: string | null; requests: number; cost_usd?: number }>;
        trend: Array<{ date?: string; requests: number; cost_usd?: number }>;
        recent_payments: Array<{ id: string; amount_usd: number; description?: string | null; created_at: string; user?: { email: string } | null }>;
    };
    filters: {
        section?: string;
        days: number;
        date_from?: string | null;
        date_to?: string | null;
        status?: string | null;
        model?: string | null;
        user_query?: string | null;
        key_status?: string | null;
    };
};

type FlashProps = {
    flash?: {
        success?: string;
        error?: string;
        developer_plaintext_key?: string | null;
    };
};

type ModelDraft = {
    name: string;
    description: string;
    model_type: 'text' | 'image';
    upstream_provider: string;
    upstream_model: string;
    input_price_per_1m_tokens: number;
    output_price_per_1m_tokens: number;
    provider_input_price_per_1m_tokens: number;
    provider_output_price_per_1m_tokens: number;
    price_per_image_usd: number;
    provider_price_per_image_usd: number;
    max_context_tokens: number;
    supports_reasoning: boolean;
    supports_streaming: boolean;
    supports_tools: boolean;
    is_active: boolean;
};

const sections = ['overview', 'models', 'keys', 'wallets', 'usage', 'adjustments'] as const;

export default function AdminDeveloperApiIndex({ models, keys, usage, wallets, ledger, stats, breakdowns, filters }: Props) {
    const page = usePage<FlashProps>();
    const flash = page.props.flash || {};
    const activeSection = filters.section || 'overview';
    const [modelDrafts, setModelDrafts] = useState<Record<string, ModelDraft>>({});
    const [adjustments, setAdjustments] = useState<Record<string, { amount_usd: number; description: string }>>({});

    const filterForm = useForm({
        section: activeSection,
        days: filters.days ?? 30,
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        status: filters.status ?? '',
        model: filters.model ?? '',
        user_query: filters.user_query ?? '',
        key_status: filters.key_status ?? '',
    });

    const createModelForm = useForm({
        public_id: '',
        name: '',
        description: '',
        model_type: 'text' as const,
        upstream_provider: 'internal',
        upstream_model: '',
        input_price_per_1m_tokens: 0,
        output_price_per_1m_tokens: 0,
        provider_input_price_per_1m_tokens: 0,
        provider_output_price_per_1m_tokens: 0,
        price_per_image_usd: 0,
        provider_price_per_image_usd: 0,
        max_context_tokens: 128000,
        supports_reasoning: false,
        supports_streaming: true,
        supports_tools: false,
        is_active: true,
    });

    useEffect(() => {
        setModelDrafts(
            models.reduce<Record<string, ModelDraft>>((carry, model) => {
                carry[model.id] = {
                    name: model.name,
                    description: model.description ?? '',
                    model_type: model.model_type,
                    upstream_provider: model.upstream_provider,
                    upstream_model: model.upstream_model,
                    input_price_per_1m_tokens: Number(model.input_price_per_1m_tokens),
                    output_price_per_1m_tokens: Number(model.output_price_per_1m_tokens),
                    provider_input_price_per_1m_tokens: Number(model.provider_input_price_per_1m_tokens ?? 0),
                    provider_output_price_per_1m_tokens: Number(model.provider_output_price_per_1m_tokens ?? 0),
                    price_per_image_usd: Number(model.price_per_image_usd ?? 0),
                    provider_price_per_image_usd: Number(model.provider_price_per_image_usd ?? 0),
                    max_context_tokens: model.max_context_tokens ?? 128000,
                    supports_reasoning: model.supports_reasoning,
                    supports_streaming: model.supports_streaming,
                    supports_tools: model.supports_tools,
                    is_active: model.is_active,
                };
                return carry;
            }, {}),
        );

        setAdjustments(
            wallets.data.reduce<Record<string, { amount_usd: number; description: string }>>((carry, wallet) => {
                carry[wallet.user_id] = { amount_usd: 0, description: '' };
                return carry;
            }, {}),
        );
    }, [models, wallets.data]);

    const navigate = (section: string) => {
        router.get('/admin/developer-api', { ...filterForm.data, section }, { preserveState: true, preserveScroll: true });
    };

    const applyFilters = (section = activeSection) => {
        router.get('/admin/developer-api', { ...filterForm.data, section }, { preserveState: true, preserveScroll: true });
    };

    const updateModelDraft = (id: string, patch: Partial<ModelDraft>) => {
        setModelDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
    };

    return (
        <AdminLayout>
            <Head title="Developer Console Admin" />
            <div className="space-y-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold">Developer Console Admin</h1>
                        <p className="text-sm text-muted-foreground">Operate models, keys, wallets, usage, and payment flows.</p>
                    </div>
                </div>

                {flash.success && <Banner tone="success" text={flash.success} />}
                {flash.error && <Banner tone="error" text={flash.error} />}
                {flash.developer_plaintext_key && (
                    <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <div className="font-medium">One-time regenerated key</div>
                        <code className="mt-2 block overflow-x-auto rounded bg-black px-3 py-2 text-xs text-white">{flash.developer_plaintext_key}</code>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {sections.map((section) => (
                        <button key={section} type="button" onClick={() => navigate(section)} className={`rounded border px-4 py-2 text-sm ${activeSection === section ? 'border-black bg-black text-white' : 'bg-white'}`}>
                            {section}
                        </button>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                    <StatCard label="Requests" value={stats.requests.toLocaleString()} />
                    <StatCard label="Tokens" value={stats.total_tokens.toLocaleString()} />
                    <StatCard label="Spend" value={`$${stats.cost_usd.toFixed(6)}`} />
                    <StatCard label="Active Keys" value={stats.active_keys.toLocaleString()} />
                    <StatCard label="Wallets" value={stats.wallet_count.toLocaleString()} />
                </div>

                <Panel title="Filters">
                    <div className="grid gap-4 lg:grid-cols-6">
                        <Field label="Days"><input className="rounded border px-3 py-2" type="number" min={1} max={365} value={filterForm.data.days} onChange={(e) => filterForm.setData('days', Number(e.target.value))} /></Field>
                        <Field label="User"><input className="rounded border px-3 py-2" value={filterForm.data.user_query} onChange={(e) => filterForm.setData('user_query', e.target.value)} /></Field>
                        <Field label="Model">
                            <select className="rounded border px-3 py-2" value={filterForm.data.model} onChange={(e) => filterForm.setData('model', e.target.value)}>
                                <option value="">All</option>
                                {models.map((model) => <option key={model.id} value={model.public_id}>{model.public_id}</option>)}
                            </select>
                        </Field>
                        <Field label="Status">
                            <select className="rounded border px-3 py-2" value={filterForm.data.status} onChange={(e) => filterForm.setData('status', e.target.value)}>
                                <option value="">All</option>
                                <option value="success">Success</option>
                                <option value="error">Error</option>
                            </select>
                        </Field>
                        <Field label="Key Status">
                            <select className="rounded border px-3 py-2" value={filterForm.data.key_status} onChange={(e) => filterForm.setData('key_status', e.target.value)}>
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="revoked">Revoked</option>
                            </select>
                        </Field>
                        <div className="flex items-end"><button className="rounded bg-black px-4 py-2 text-white" onClick={() => applyFilters()}>Apply</button></div>
                    </div>
                </Panel>

                {activeSection === 'overview' && (
                    <div className="grid gap-6 xl:grid-cols-3">
                        <Panel title="Top Models"><Rows rows={breakdowns.per_model.map((row) => `${row.model}: ${row.requests} req · $${(row.cost_usd ?? 0).toFixed(6)}`)} empty="No model data." /></Panel>
                        <Panel title="Top Keys"><Rows rows={breakdowns.per_key.map((row) => `${row.key_prefix}: ${row.requests} req · $${(row.cost_usd ?? 0).toFixed(6)}`)} empty="No key data." /></Panel>
                        <Panel title="Recent Payments"><Rows rows={breakdowns.recent_payments.map((row) => `${row.user?.email ?? '-'} · $${row.amount_usd.toFixed(6)} · ${formatDate(row.created_at)}`)} empty="No recent payments." /></Panel>
                    </div>
                )}

                {activeSection === 'models' && (
                    <div className="space-y-6">
                        <Panel title="Create Model">
                            <div className="grid gap-4 lg:grid-cols-3">
                                <Field label="Public ID"><input className="rounded border px-3 py-2" value={createModelForm.data.public_id} onChange={(e) => createModelForm.setData('public_id', e.target.value)} /></Field>
                                <Field label="Name"><input className="rounded border px-3 py-2" value={createModelForm.data.name} onChange={(e) => createModelForm.setData('name', e.target.value)} /></Field>
                                <Field label="Model Type">
                                    <select className="rounded border px-3 py-2" value={createModelForm.data.model_type} onChange={(e) => createModelForm.setData('model_type', e.target.value as 'text' | 'image')}>
                                        <option value="text">Text</option>
                                        <option value="image">Image</option>
                                    </select>
                                </Field>
                                <Field label="Upstream Model"><input className="rounded border px-3 py-2" value={createModelForm.data.upstream_model} onChange={(e) => createModelForm.setData('upstream_model', e.target.value)} /></Field>
                                <Field label="Description" className="lg:col-span-3"><textarea className="min-h-20 rounded border px-3 py-2" value={createModelForm.data.description} onChange={(e) => createModelForm.setData('description', e.target.value)} /></Field>
                                <Field label="Input Price"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={createModelForm.data.input_price_per_1m_tokens} onChange={(e) => createModelForm.setData('input_price_per_1m_tokens', Number(e.target.value))} /></Field>
                                <Field label="Output Price"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={createModelForm.data.output_price_per_1m_tokens} onChange={(e) => createModelForm.setData('output_price_per_1m_tokens', Number(e.target.value))} /></Field>
                                <Field label="Provider Input"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={createModelForm.data.provider_input_price_per_1m_tokens} onChange={(e) => createModelForm.setData('provider_input_price_per_1m_tokens', Number(e.target.value))} /></Field>
                                <Field label="Provider Output"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={createModelForm.data.provider_output_price_per_1m_tokens} onChange={(e) => createModelForm.setData('provider_output_price_per_1m_tokens', Number(e.target.value))} /></Field>
                                <Field label="Price Per Image"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={createModelForm.data.price_per_image_usd} onChange={(e) => createModelForm.setData('price_per_image_usd', Number(e.target.value))} /></Field>
                                <Field label="Provider Image Price"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={createModelForm.data.provider_price_per_image_usd} onChange={(e) => createModelForm.setData('provider_price_per_image_usd', Number(e.target.value))} /></Field>
                                <Field label="Context"><input className="rounded border px-3 py-2" type="number" value={createModelForm.data.max_context_tokens} onChange={(e) => createModelForm.setData('max_context_tokens', Number(e.target.value))} /></Field>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={createModelForm.data.supports_reasoning} onChange={(e) => createModelForm.setData('supports_reasoning', e.target.checked)} />Supports reasoning</label>
                            </div>
                            <div className="mt-4"><button className="rounded bg-black px-4 py-2 text-white" onClick={() => createModelForm.post('/admin/developer-api/models')}>Create model</button></div>
                        </Panel>
                        <Panel title="Edit Models">
                            <div className="space-y-4">
                                {models.map((model) => {
                                    const draft = modelDrafts[model.id];
                                    if (!draft) return null;
                                    return (
                                        <div key={model.id} className="rounded border p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold">{model.public_id}</div>
                                                    <div className="text-xs text-muted-foreground">{model.model_type}{model.supports_reasoning ? ' · reasoning' : ''}</div>
                                                </div>
                                                <div className="text-sm text-muted-foreground">{model.is_active ? 'Active' : 'Disabled'}</div>
                                            </div>
                                            <div className="grid gap-4 lg:grid-cols-3">
                                                <Field label="Name"><input className="rounded border px-3 py-2" value={draft.name} onChange={(e) => updateModelDraft(model.id, { name: e.target.value })} /></Field>
                                                <Field label="Model Type">
                                                    <select className="rounded border px-3 py-2" value={draft.model_type} onChange={(e) => updateModelDraft(model.id, { model_type: e.target.value as 'text' | 'image' })}>
                                                        <option value="text">Text</option>
                                                        <option value="image">Image</option>
                                                    </select>
                                                </Field>
                                                <Field label="Upstream Provider"><input className="rounded border px-3 py-2" value={draft.upstream_provider} onChange={(e) => updateModelDraft(model.id, { upstream_provider: e.target.value })} /></Field>
                                                <Field label="Upstream Model"><input className="rounded border px-3 py-2" value={draft.upstream_model} onChange={(e) => updateModelDraft(model.id, { upstream_model: e.target.value })} /></Field>
                                                <Field label="Description" className="lg:col-span-3"><textarea className="min-h-20 rounded border px-3 py-2" value={draft.description} onChange={(e) => updateModelDraft(model.id, { description: e.target.value })} /></Field>
                                                <Field label="Input Price"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={draft.input_price_per_1m_tokens} onChange={(e) => updateModelDraft(model.id, { input_price_per_1m_tokens: Number(e.target.value) })} /></Field>
                                                <Field label="Output Price"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={draft.output_price_per_1m_tokens} onChange={(e) => updateModelDraft(model.id, { output_price_per_1m_tokens: Number(e.target.value) })} /></Field>
                                                <Field label="Provider Input"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={draft.provider_input_price_per_1m_tokens} onChange={(e) => updateModelDraft(model.id, { provider_input_price_per_1m_tokens: Number(e.target.value) })} /></Field>
                                                <Field label="Provider Output"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={draft.provider_output_price_per_1m_tokens} onChange={(e) => updateModelDraft(model.id, { provider_output_price_per_1m_tokens: Number(e.target.value) })} /></Field>
                                                <Field label="Price Per Image"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={draft.price_per_image_usd} onChange={(e) => updateModelDraft(model.id, { price_per_image_usd: Number(e.target.value) })} /></Field>
                                                <Field label="Provider Image Price"><input className="rounded border px-3 py-2" type="number" step="0.000001" value={draft.provider_price_per_image_usd} onChange={(e) => updateModelDraft(model.id, { provider_price_per_image_usd: Number(e.target.value) })} /></Field>
                                                <Field label="Context"><input className="rounded border px-3 py-2" type="number" value={draft.max_context_tokens} onChange={(e) => updateModelDraft(model.id, { max_context_tokens: Number(e.target.value) })} /></Field>
                                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.supports_reasoning} onChange={(e) => updateModelDraft(model.id, { supports_reasoning: e.target.checked })} />Supports reasoning</label>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <button className="rounded bg-black px-4 py-2 text-white" onClick={() => router.put(`/admin/developer-api/models/${model.id}`, draft)}>Save</button>
                                                <button className="rounded border px-4 py-2" onClick={() => router.post(`/admin/developer-api/models/${model.id}/toggle`)}>Toggle status</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Panel>
                    </div>
                )}

                {activeSection === 'keys' && (
                    <Panel title="Key Operations">
                        <div className="space-y-4">
                            {keys.data.map((key) => (
                                <div key={key.id} className="rounded border p-4">
                                    <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <div className="font-mono text-sm">{key.key_prefix}</div>
                                            <div className="text-sm text-muted-foreground">{key.user?.email} · {key.name}</div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{key.is_active ? 'Active' : 'Revoked'} · {key.usage_requests_count} requests · ${key.usage_spend_usd.toFixed(6)}</div>
                                    </div>
                                    <div className="mt-3 text-xs text-muted-foreground">Last used: {formatDate(key.last_used_at)} · Rotated: {formatDate(key.last_rotated_at)}</div>
                                    <div className="mt-4 flex gap-2">
                                        <button className="rounded border px-4 py-2" onClick={() => router.post(`/admin/developer-api/keys/${key.id}/toggle`)}>Toggle</button>
                                        <button className="rounded bg-black px-4 py-2 text-white" onClick={() => router.post(`/admin/developer-api/keys/${key.id}/regenerate`)}>Regenerate</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination links={keys.links} />
                    </Panel>
                )}

                {activeSection === 'wallets' && (
                    <div className="space-y-6">
                        <Panel title="Wallets">
                            <div className="space-y-4">
                                {wallets.data.map((wallet) => (
                                    <div key={wallet.id} className="rounded border p-4">
                                        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                                            <div>
                                                <div className="font-semibold">{wallet.user?.email}</div>
                                                <div className="text-sm text-muted-foreground">Balance ${wallet.balance_usd.toFixed(6)} · Credits ${wallet.lifetime_credited_usd.toFixed(6)} · Debits ${wallet.lifetime_debited_usd.toFixed(6)}</div>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid gap-3 lg:grid-cols-3">
                                            <input className="rounded border px-3 py-2" type="number" step="0.000001" value={adjustments[wallet.user_id]?.amount_usd ?? 0} onChange={(e) => setAdjustments((current) => ({ ...current, [wallet.user_id]: { ...(current[wallet.user_id] || { description: '' }), amount_usd: Number(e.target.value) } }))} />
                                            <input className="rounded border px-3 py-2" value={adjustments[wallet.user_id]?.description ?? ''} onChange={(e) => setAdjustments((current) => ({ ...current, [wallet.user_id]: { ...(current[wallet.user_id] || { amount_usd: 0 }), description: e.target.value } }))} />
                                            <button className="rounded bg-black px-4 py-2 text-white" onClick={() => router.post(`/admin/developer-api/wallets/${wallet.user_id}/adjust`, adjustments[wallet.user_id])}>Apply adjustment</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Pagination links={wallets.links} />
                        </Panel>
                        <Panel title="Ledger">
                            <table className="min-w-full text-sm">
                                <thead><tr className="border-b text-left"><th className="py-2">Date</th><th className="py-2">User</th><th className="py-2">Type</th><th className="py-2">Amount</th><th className="py-2">Balance After</th></tr></thead>
                                <tbody>
                                    {ledger.data.map((entry) => (
                                        <tr key={entry.id} className="border-b">
                                            <td className="py-2">{formatDate(entry.created_at)}</td>
                                            <td className="py-2">{entry.user?.email ?? '-'}</td>
                                            <td className="py-2">{entry.type}</td>
                                            <td className="py-2">${entry.amount_usd.toFixed(6)}</td>
                                            <td className="py-2">${entry.balance_after_usd.toFixed(6)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination links={ledger.links} />
                        </Panel>
                    </div>
                )}

                {activeSection === 'usage' && (
                    <Panel title="Usage">
                        <table className="min-w-full text-sm">
                            <thead><tr className="border-b text-left"><th className="py-2">Request</th><th className="py-2">User</th><th className="py-2">Key</th><th className="py-2">Model</th><th className="py-2">Tokens</th><th className="py-2">Cost</th><th className="py-2">Status</th></tr></thead>
                            <tbody>
                                {usage.data.map((row) => (
                                    <tr key={row.id} className="border-b">
                                        <td className="py-2 font-mono text-xs">{row.request_id}</td>
                                        <td className="py-2">{row.user?.email ?? '-'}</td>
                                        <td className="py-2">{row.api_key?.key_prefix ?? '-'}</td>
                                        <td className="py-2">{row.model?.public_id ?? '-'}</td>
                                        <td className="py-2">{row.total_tokens.toLocaleString()}</td>
                                        <td className="py-2">${row.cost_usd.toFixed(6)}</td>
                                        <td className="py-2">{row.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination links={usage.links} />
                    </Panel>
                )}

                {activeSection === 'adjustments' && (
                    <div className="grid gap-6 xl:grid-cols-3">
                        <Panel title="Statuses"><Rows rows={breakdowns.statuses.map((row) => `${row.status}: ${row.requests}`)} empty="No status data." /></Panel>
                        <Panel title="Top Customers"><Rows rows={breakdowns.top_customers.map((row) => `${row.email ?? '-'}: ${row.requests} req · $${(row.cost_usd ?? 0).toFixed(6)}`)} empty="No customer data." /></Panel>
                        <Panel title="Trend"><Rows rows={breakdowns.trend.map((row) => `${row.date}: ${row.requests} req · $${(row.cost_usd ?? 0).toFixed(6)}`)} empty="No trend data." /></Panel>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
    return <section className="rounded border bg-white p-5"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-4">{children}</div></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <label className="flex flex-col gap-2 text-sm"><span className="font-medium">{label}</span>{children}</label>;
}

function StatCard({ label, value }: { label: string; value: string }) {
    return <div className="rounded border bg-white p-4"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>;
}

function Banner({ tone, text }: { tone: 'success' | 'error'; text: string }) {
    const style = tone === 'success' ? 'border-green-300 bg-green-50 text-green-800' : 'border-red-300 bg-red-50 text-red-800';
    return <div className={`rounded border px-4 py-3 text-sm ${style}`}>{text}</div>;
}

function Rows({ rows, empty }: { rows: string[]; empty: string }) {
    return rows.length ? <div className="space-y-2 text-sm">{rows.map((row) => <div key={row} className="rounded border px-3 py-2">{row}</div>)}</div> : <div className="text-sm text-muted-foreground">{empty}</div>;
}

function Pagination({ links }: { links: Paginated<unknown>['links'] }) {
    if (links.length <= 3) return null;
    return <div className="mt-4 flex flex-wrap gap-2">{links.map((link) => <button key={`${link.label}-${link.url}`} type="button" disabled={!link.url} onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })} className={`rounded border px-3 py-1 text-sm ${link.active ? 'border-black bg-black text-white' : 'bg-white'}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</div>;
}

function formatDate(value?: string | null) {
    return value ? new Date(value).toLocaleString() : 'Never';
}
