import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import UserLayout from '@/layouts/UserLayout';

type Paginated<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type ApiKey = {
    id: string;
    name: string;
    key_prefix: string;
    is_active: boolean;
    notes?: string | null;
    expires_at?: string | null;
    allowed_model_ids: string[];
    last_used_at?: string | null;
    last_rotated_at?: string | null;
    usage_requests_count: number;
    usage_spend_usd: number;
};

type ApiModel = {
    id: string;
    public_id: string;
    name: string;
    description?: string | null;
    input_price_per_1m_tokens: string;
    output_price_per_1m_tokens: string;
    max_context_tokens?: number | null;
    supports_streaming: boolean;
    is_active: boolean;
};

type UsageRow = {
    id: string;
    request_id: string;
    status: string;
    endpoint: string;
    total_tokens: number;
    cost_usd: number;
    created_at: string;
    is_estimated_tokens: boolean;
    api_key?: { id: string; name: string; key_prefix: string } | null;
    model?: { id: string; public_id: string; name: string } | null;
};

type LedgerRow = {
    id: string;
    type: string;
    amount_usd: number;
    balance_after_usd: number;
    description?: string | null;
    external_reference?: string | null;
    created_at: string;
};

type BreakdownRow = {
    model?: string | null;
    key_prefix?: string | null;
    status?: string;
    date?: string;
    requests: number;
    total_tokens?: number;
    cost_usd?: number;
};

type Props = {
    wallet: {
        balance_usd: number;
        lifetime_credited_usd: number;
        lifetime_debited_usd: number;
        topups_usd: number;
        debits_usd: number;
    };
    stats: {
        requests: number;
        total_tokens: number;
        cost_usd: number;
        success_requests: number;
        error_requests: number;
    };
    breakdowns: {
        per_model: BreakdownRow[];
        per_key: BreakdownRow[];
        statuses: BreakdownRow[];
        ledger: { credits_usd: number; debits_usd: number; by_type: Array<{ type: string; entries: number; amount_usd: number }> };
        trend: BreakdownRow[];
    };
    apiKeys: Paginated<ApiKey>;
    usage: Paginated<UsageRow>;
    ledger: Paginated<LedgerRow>;
    models: ApiModel[];
    apiBaseUrl: string;
    topupConfig: { default_amount_usd: number; min_amount_usd: number; max_amount_usd: number };
    filters: {
        section?: string;
        days: number;
        date_from?: string | null;
        date_to?: string | null;
        status?: string | null;
        model?: string | null;
        key_id?: string | null;
        ledger_type?: string | null;
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

type KeyDraft = {
    name: string;
    notes: string;
    expires_at: string;
    allowed_model_ids: string[];
};

const sections = ['overview', 'keys', 'usage', 'billing', 'models'] as const;

export default function DeveloperApiIndex({
    wallet,
    stats,
    breakdowns,
    apiKeys,
    usage,
    ledger,
    models,
    apiBaseUrl,
    topupConfig,
    filters,
}: Props) {
    const page = usePage<FlashProps>();
    const flash = page.props.flash || {};
    const activeSection = filters.section || 'overview';
    const [keyDrafts, setKeyDrafts] = useState<Record<string, KeyDraft>>({});

    const createKeyForm = useForm({
        name: '',
        notes: '',
        allowed_model_ids: [] as string[],
        expires_at: '',
    });

    const filterForm = useForm({
        section: activeSection,
        days: filters.days ?? 30,
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        status: filters.status ?? '',
        model: filters.model ?? '',
        key_id: filters.key_id ?? '',
        ledger_type: filters.ledger_type ?? '',
        key_status: filters.key_status ?? '',
    });

    const topupForm = useForm({
        amount_usd: topupConfig.default_amount_usd,
    });

    useEffect(() => {
        setKeyDrafts(
            apiKeys.data.reduce<Record<string, KeyDraft>>((carry, key) => {
                carry[key.id] = {
                    name: key.name,
                    notes: key.notes ?? '',
                    expires_at: key.expires_at ? key.expires_at.slice(0, 16) : '',
                    allowed_model_ids: key.allowed_model_ids ?? [],
                };
                return carry;
            }, {}),
        );
    }, [apiKeys.data]);

    const successRate = useMemo(() => {
        if (!stats.requests) return 0;
        return Math.round((stats.success_requests / stats.requests) * 100);
    }, [stats.requests, stats.success_requests]);

    const navigate = (section: string) => {
        router.get('/user/developer-api', { ...filterForm.data, section }, { preserveState: true, preserveScroll: true });
    };

    const applyFilters = (section = activeSection) => {
        router.get('/user/developer-api', { ...filterForm.data, section }, { preserveState: true, preserveScroll: true });
    };

    const toggleCreateModel = (publicId: string) => {
        const current = createKeyForm.data.allowed_model_ids;
        createKeyForm.setData(
            'allowed_model_ids',
            current.includes(publicId) ? current.filter((id) => id !== publicId) : [...current, publicId],
        );
    };

    const updateDraft = (keyId: string, patch: Partial<KeyDraft>) => {
        setKeyDrafts((current) => ({ ...current, [keyId]: { ...current[keyId], ...patch } }));
    };

    return (
        <UserLayout>
            <Head title="Developer Console" />
            <div className="space-y-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold">Developer Console</h1>
                        <p className="text-sm text-muted-foreground">Keys, usage, credits, models, and wallet operations.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="rounded border bg-white px-4 py-3 text-sm">
                            <div className="text-muted-foreground">Base URL</div>
                            <code>{apiBaseUrl}</code>
                        </div>
                        <Link href="/docs/developer-api" className="rounded border bg-white px-4 py-3 text-sm">
                            <div className="text-muted-foreground">Docs</div>
                            <div className="font-medium">Open integration docs</div>
                        </Link>
                    </div>
                </div>

                {flash.success && <Banner tone="success" text={flash.success} />}
                {flash.error && <Banner tone="error" text={flash.error} />}
                {flash.developer_plaintext_key && (
                    <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <div className="font-medium">One-time secret</div>
                        <code className="mt-2 block overflow-x-auto rounded bg-black px-3 py-2 text-xs text-white">{flash.developer_plaintext_key}</code>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {sections.map((section) => (
                        <button
                            key={section}
                            type="button"
                            onClick={() => navigate(section)}
                            className={`rounded border px-4 py-2 text-sm ${activeSection === section ? 'border-black bg-black text-white' : 'bg-white'}`}
                        >
                            {section}
                        </button>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                    <StatCard label="Balance" value={`$${wallet.balance_usd.toFixed(6)}`} />
                    <StatCard label="Requests" value={stats.requests.toLocaleString()} />
                    <StatCard label="Tokens" value={stats.total_tokens.toLocaleString()} />
                    <StatCard label="Spend" value={`$${stats.cost_usd.toFixed(6)}`} />
                    <StatCard label="Success Rate" value={`${successRate}%`} />
                </div>

                {(activeSection === 'overview' || activeSection === 'usage' || activeSection === 'billing') && (
                    <Panel title="Filters">
                        <div className="grid gap-4 lg:grid-cols-6">
                            <Field label="Days"><input className="rounded border px-3 py-2" type="number" min={1} max={365} value={filterForm.data.days} onChange={(e) => filterForm.setData('days', Number(e.target.value))} /></Field>
                            <Field label="From"><input className="rounded border px-3 py-2" type="date" value={filterForm.data.date_from} onChange={(e) => filterForm.setData('date_from', e.target.value)} /></Field>
                            <Field label="To"><input className="rounded border px-3 py-2" type="date" value={filterForm.data.date_to} onChange={(e) => filterForm.setData('date_to', e.target.value)} /></Field>
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
                            <div className="flex items-end">
                                <button className="rounded bg-black px-4 py-2 text-white" onClick={() => applyFilters()}>Apply</button>
                            </div>
                        </div>
                    </Panel>
                )}

                {activeSection === 'overview' && (
                    <div className="grid gap-6 xl:grid-cols-3">
                        <Panel title="Trend"><Rows rows={breakdowns.trend.map((row) => `${row.date}: ${row.requests} req | ${(row.total_tokens ?? 0).toLocaleString()} tok | $${(row.cost_usd ?? 0).toFixed(6)}`)} empty="No trend data." /></Panel>
                        <Panel title="Top Models"><Rows rows={breakdowns.per_model.map((row) => `${row.model}: ${row.requests} req | $${(row.cost_usd ?? 0).toFixed(6)}`)} empty="No model usage." /></Panel>
                        <Panel title="Top Keys"><Rows rows={breakdowns.per_key.map((row) => `${row.key_prefix}: ${row.requests} req | $${(row.cost_usd ?? 0).toFixed(6)}`)} empty="No key usage." /></Panel>
                    </div>
                )}

                {activeSection === 'keys' && (
                    <div className="space-y-6">
                        <Panel title="Create Key">
                            <div className="grid gap-4 lg:grid-cols-2">
                                <Field label="Name"><input className="rounded border px-3 py-2" value={createKeyForm.data.name} onChange={(e) => createKeyForm.setData('name', e.target.value)} /></Field>
                                <Field label="Expires At"><input className="rounded border px-3 py-2" type="datetime-local" value={createKeyForm.data.expires_at} onChange={(e) => createKeyForm.setData('expires_at', e.target.value)} /></Field>
                                <Field label="Notes" className="lg:col-span-2"><textarea className="min-h-24 rounded border px-3 py-2" value={createKeyForm.data.notes} onChange={(e) => createKeyForm.setData('notes', e.target.value)} /></Field>
                                <Field label="Model Scopes" className="lg:col-span-2">
                                    <div className="flex flex-wrap gap-2">
                                        {models.map((model) => (
                                            <button key={model.id} type="button" onClick={() => toggleCreateModel(model.public_id)} className={`rounded border px-3 py-1 text-sm ${createKeyForm.data.allowed_model_ids.includes(model.public_id) ? 'border-black bg-black text-white' : 'bg-white'}`}>{model.public_id}</button>
                                        ))}
                                    </div>
                                </Field>
                            </div>
                            <div className="mt-4"><button className="rounded bg-black px-4 py-2 text-white" onClick={() => createKeyForm.post('/user/developer-api/keys')}>Create key</button></div>
                        </Panel>

                        <Panel title="Manage Keys">
                            <div className="mb-4 flex gap-3">
                                <Field label="Status">
                                    <select className="rounded border px-3 py-2" value={filterForm.data.key_status} onChange={(e) => filterForm.setData('key_status', e.target.value)}>
                                        <option value="">All</option>
                                        <option value="active">Active</option>
                                        <option value="revoked">Revoked</option>
                                    </select>
                                </Field>
                                <div className="flex items-end"><button className="rounded border px-4 py-2" onClick={() => applyFilters('keys')}>Filter</button></div>
                            </div>
                            <div className="space-y-4">
                                {apiKeys.data.map((key) => {
                                    const draft = keyDrafts[key.id];
                                    if (!draft) return null;
                                    return (
                                        <div key={key.id} className="rounded border p-4">
                                            <div className="mb-3 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="font-mono text-sm">{key.key_prefix}</div>
                                                <div className="text-sm text-muted-foreground">{key.is_active ? 'Active' : 'Revoked'} | {key.usage_requests_count} requests | ${key.usage_spend_usd.toFixed(6)}</div>
                                            </div>
                                            <div className="grid gap-4 lg:grid-cols-2">
                                                <Field label="Name"><input className="rounded border px-3 py-2" value={draft.name} onChange={(e) => updateDraft(key.id, { name: e.target.value })} /></Field>
                                                <Field label="Expires At"><input className="rounded border px-3 py-2" type="datetime-local" value={draft.expires_at} onChange={(e) => updateDraft(key.id, { expires_at: e.target.value })} /></Field>
                                                <Field label="Notes" className="lg:col-span-2"><textarea className="min-h-20 rounded border px-3 py-2" value={draft.notes} onChange={(e) => updateDraft(key.id, { notes: e.target.value })} /></Field>
                                                <Field label="Model Scopes" className="lg:col-span-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        {models.map((model) => (
                                                            <button
                                                                key={model.id}
                                                                type="button"
                                                                onClick={() => updateDraft(key.id, { allowed_model_ids: draft.allowed_model_ids.includes(model.public_id) ? draft.allowed_model_ids.filter((id) => id !== model.public_id) : [...draft.allowed_model_ids, model.public_id] })}
                                                                className={`rounded border px-3 py-1 text-sm ${draft.allowed_model_ids.includes(model.public_id) ? 'border-black bg-black text-white' : 'bg-white'}`}
                                                            >
                                                                {model.public_id}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </Field>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button className="rounded bg-black px-4 py-2 text-white" onClick={() => router.put(`/user/developer-api/keys/${key.id}`, draft)}>Save</button>
                                                <button className="rounded border px-4 py-2" onClick={() => router.post(`/user/developer-api/keys/${key.id}/regenerate`)}>Regenerate</button>
                                                {key.is_active && <button className="rounded border border-red-300 px-4 py-2 text-red-700" onClick={() => router.post(`/user/developer-api/keys/${key.id}/revoke`)}>Revoke</button>}
                                            </div>
                                            <div className="mt-3 text-xs text-muted-foreground">Last used: {formatDate(key.last_used_at)} | Rotated: {formatDate(key.last_rotated_at)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <Pagination links={apiKeys.links} />
                        </Panel>
                    </div>
                )}

                {activeSection === 'usage' && (
                    <Panel title="Usage">
                        <table className="min-w-full text-sm">
                            <thead><tr className="border-b text-left"><th className="py-2">Request</th><th className="py-2">Key</th><th className="py-2">Model</th><th className="py-2">Tokens</th><th className="py-2">Cost</th><th className="py-2">Status</th></tr></thead>
                            <tbody>
                                {usage.data.map((row) => (
                                    <tr key={row.id} className="border-b">
                                        <td className="py-2 font-mono text-xs">{row.request_id}</td>
                                        <td className="py-2">{row.api_key?.key_prefix ?? '-'}</td>
                                        <td className="py-2">{row.model?.public_id ?? '-'}</td>
                                        <td className="py-2">{row.total_tokens.toLocaleString()}</td>
                                        <td className="py-2">${row.cost_usd.toFixed(6)}</td>
                                        <td className="py-2">{row.status}{row.is_estimated_tokens ? ' (estimated)' : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Rows title="Statuses" rows={breakdowns.statuses.map((row) => `${row.status}: ${row.requests}`)} empty="No status data." />
                            <Rows title="Per Model Spend" rows={breakdowns.per_model.map((row) => `${row.model}: $${(row.cost_usd ?? 0).toFixed(6)}`)} empty="No model data." />
                        </div>
                        <Pagination links={usage.links} />
                    </Panel>
                )}

                {activeSection === 'billing' && (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <StatCard label="Lifetime Credits" value={`$${wallet.lifetime_credited_usd.toFixed(6)}`} />
                            <StatCard label="Lifetime Debits" value={`$${wallet.lifetime_debited_usd.toFixed(6)}`} />
                            <StatCard label="Period Credits" value={`$${breakdowns.ledger.credits_usd.toFixed(6)}`} />
                            <StatCard label="Period Debits" value={`$${breakdowns.ledger.debits_usd.toFixed(6)}`} />
                        </div>
                        <Panel title="Top Up">
                            <div className="flex gap-3">
                                <input className="rounded border px-3 py-2" type="number" min={topupConfig.min_amount_usd} max={topupConfig.max_amount_usd} step="0.01" value={topupForm.data.amount_usd} onChange={(e) => topupForm.setData('amount_usd', Number(e.target.value))} />
                                <button className="rounded bg-black px-4 py-2 text-white" onClick={() => topupForm.post('/user/developer-api/top-up')}>Checkout</button>
                            </div>
                        </Panel>
                        <Panel title="Ledger">
                            <table className="min-w-full text-sm">
                                <thead><tr className="border-b text-left"><th className="py-2">Date</th><th className="py-2">Type</th><th className="py-2">Amount</th><th className="py-2">Balance</th><th className="py-2">Description</th></tr></thead>
                                <tbody>
                                    {ledger.data.map((entry) => (
                                        <tr key={entry.id} className="border-b">
                                            <td className="py-2">{formatDate(entry.created_at)}</td>
                                            <td className="py-2">{entry.type}</td>
                                            <td className="py-2">${entry.amount_usd.toFixed(6)}</td>
                                            <td className="py-2">${entry.balance_after_usd.toFixed(6)}</td>
                                            <td className="py-2">{entry.description || entry.external_reference || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination links={ledger.links} />
                        </Panel>
                    </div>
                )}

                {activeSection === 'models' && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {models.map((model) => (
                            <Panel key={model.id} title={model.public_id}>
                                <Rows
                                    rows={[
                                        model.description || 'No description.',
                                        `Input: $${model.input_price_per_1m_tokens}/1M`,
                                        `Output: $${model.output_price_per_1m_tokens}/1M`,
                                        `Context: ${model.max_context_tokens ?? 'n/a'}`,
                                        `Streaming: ${model.supports_streaming ? 'Yes' : 'No'}`,
                                    ]}
                                    empty=""
                                />
                            </Panel>
                        ))}
                    </div>
                )}

            </div>
        </UserLayout>
    );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
    return <section className="rounded border bg-white p-5"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-4">{children}</div></section>;
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
    return <label className={`flex flex-col gap-2 text-sm ${className}`}><span className="font-medium">{label}</span>{children}</label>;
}

function StatCard({ label, value }: { label: string; value: string }) {
    return <div className="rounded border bg-white p-4"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>;
}

function Banner({ tone, text }: { tone: 'success' | 'error'; text: string }) {
    const style = tone === 'success' ? 'border-green-300 bg-green-50 text-green-800' : 'border-red-300 bg-red-50 text-red-800';
    return <div className={`rounded border px-4 py-3 text-sm ${style}`}>{text}</div>;
}

function Rows({ title, rows, empty }: { title?: string; rows: string[]; empty: string }) {
    return (
        <div>
            {title && <div className="mb-2 text-sm font-medium">{title}</div>}
            {rows.length ? <div className="space-y-2 text-sm">{rows.map((row) => <div key={row} className="rounded border px-3 py-2">{row}</div>)}</div> : <div className="text-sm text-muted-foreground">{empty}</div>}
        </div>
    );
}

function Pagination({ links }: { links: Paginated<unknown>['links'] }) {
    if (links.length <= 3) return null;
    return <div className="mt-4 flex flex-wrap gap-2">{links.map((link) => <button key={`${link.label}-${link.url}`} type="button" disabled={!link.url} onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })} className={`rounded border px-3 py-1 text-sm ${link.active ? 'border-black bg-black text-white' : 'bg-white'}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</div>;
}

function formatDate(value?: string | null) {
    return value ? new Date(value).toLocaleString() : 'Never';
}
