import React, { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import ConsoleLayout, { consoleNavIcons } from '@/layouts/console-layout';

import { StatCard, Banner } from './components';
import { FiltersSection } from './sections/FiltersSection';
import { OverviewSection } from './sections/OverviewSection';
import { KeysSection } from './sections/KeysSection';
import { UsageSection } from './sections/UsageSection';
import { BillingSection } from './sections/BillingSection';
import { ModelsSection } from './sections/ModelsSection';

import type { Props, FlashProps, KeyDraft } from './types';

const sections = ['overview', 'keys', 'usage', 'billing', 'models'] as const;

export default function DeveloperApiIndex({
    section,
    wallet,
    stats,
    breakdowns,
    apiKeys,
    usage,
    ledger,
    models,
    apiBaseUrl,
    docsUrl,
    topupConfig,
    filters,
}: Props) {
    const page = usePage<FlashProps>();
    const flash = page.props.flash ?? {};
    const consoleBaseUrl = page.props.console.base_url.replace(/\/+$/, '');
    const activeSection = section;

    /** Derive the URL for a given section. */
    const sectionUrl = (s: string) =>
        s === 'overview' ? consoleBaseUrl : `${consoleBaseUrl}/${s}`;

    // ── Key drafts ────────────────────────────────────────────────────────────
    const [keyDrafts, setKeyDrafts] = useState<Record<string, KeyDraft>>({});

    useEffect(() => {
        setKeyDrafts(
            (apiKeys?.data ?? []).reduce<Record<string, KeyDraft>>((acc, key) => {
                acc[key.id] = {
                    name: key.name,
                    notes: key.notes ?? '',
                    expires_at: key.expires_at ? key.expires_at.slice(0, 16) : '',
                    allowed_model_ids: key.allowed_model_ids ?? [],
                };
                return acc;
            }, {}),
        );
    }, [apiKeys?.data]);

    const updateDraft = (keyId: string, patch: Partial<KeyDraft>) =>
        setKeyDrafts((prev) => ({ ...prev, [keyId]: { ...prev[keyId], ...patch } }));

    // ── Forms ─────────────────────────────────────────────────────────────────
    const createKeyForm = useForm({
        name: '',
        notes: '',
        allowed_model_ids: [] as string[],
        expires_at: '',
    });

    const filterForm = useForm({
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
        amount_usd: topupConfig?.default_amount_usd ?? 10,
        provider: topupConfig?.default_provider ?? 'paystack',
    });

    // ── Navigation ────────────────────────────────────────────────────────────
    const navigate = (s: string) =>
        router.get(sectionUrl(s), {}, { preserveState: false });

    const applyFilters = () =>
        router.get(sectionUrl(activeSection), filterForm.data, { preserveState: true, preserveScroll: true });

    // ── Stats ─────────────────────────────────────────────────────────────────
    const successRate = useMemo(() => {
        if (!stats.requests) return 0;
        return Math.round((stats.success_requests / stats.requests) * 100);
    }, [stats.requests, stats.success_requests]);

    const resolvedBreakdowns = breakdowns ?? {
        per_model: [],
        per_key: [],
        statuses: [],
        ledger: { credits_usd: 0, debits_usd: 0, by_type: [] },
        trend: [],
    };

    const navItems = [
        ...sections.map((s) => ({
            key: s,
            label: s.charAt(0).toUpperCase() + s.slice(1),
            icon: consoleNavIcons[s],
            active: activeSection === s,
            onClick: () => navigate(s),
        })),
        {
            key: 'docs',
            label: 'Docs',
            icon: consoleNavIcons.docs,
            href: docsUrl,
            active: false,
        },
    ];

    const showFilters =
        activeSection === 'overview' ||
        activeSection === 'usage' ||
        activeSection === 'billing';

    return (
        <ConsoleLayout
            title="Developer Console"
            subtitle="Manage API keys, wallet credits, usage analytics, and model access."
            items={navItems}
            actions={
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground">Base URL</span>
                    <code className="font-mono text-xs text-foreground">{apiBaseUrl}</code>
                </div>
            }
        >
            <Head title="Developer Console" />

            <div className="space-y-6">
                {/* Flash messages */}
                {flash.success && <Banner tone="success" text={flash.success} />}
                {flash.error && <Banner tone="error" text={flash.error} />}
                {flash.developer_plaintext_key && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400">
                        <p className="font-semibold">Copy your secret key — it won't be shown again</p>
                        <code className="mt-2 block overflow-x-auto rounded-md border border-border bg-background/80 px-3 py-2 font-mono text-xs text-foreground">
                            {flash.developer_plaintext_key}
                        </code>
                    </div>
                )}

                {/* Top stats — only for sections where usage data is relevant */}
                {showFilters && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatCard label="Requests" value={stats.requests.toLocaleString()} />
                        <StatCard label="Tokens" value={stats.total_tokens.toLocaleString()} />
                        <StatCard label="Spend" value={`$${stats.cost_usd.toFixed(6)}`} />
                        <StatCard label="Success Rate" value={`${successRate}%`} />
                    </div>
                )}

                {/* Shared filters */}
                {showFilters && (
                    <FiltersSection
                        data={{
                            days: filterForm.data.days,
                            date_from: filterForm.data.date_from,
                            date_to: filterForm.data.date_to,
                            model: filterForm.data.model,
                            status: filterForm.data.status,
                        }}
                        models={models}
                        onChange={(key, value) => filterForm.setData(key, value as never)}
                        onApply={() => applyFilters()}
                    />
                )}

                {/* Sections */}
                {activeSection === 'overview' && breakdowns && (
                    <OverviewSection breakdowns={breakdowns} />
                )}

                {activeSection === 'keys' && (
                    <KeysSection
                        apiKeys={apiKeys ?? { data: [], links: [] }}
                        models={models}
                        consoleBaseUrl={consoleBaseUrl}
                        createData={createKeyForm.data}
                        createProcessing={createKeyForm.processing}
                        onSetCreateData={(key, value) => createKeyForm.setData(key, value as never)}
                        onCreateKey={() => createKeyForm.post(`${consoleBaseUrl}/keys`)}
                        keyStatus={filterForm.data.key_status}
                        onSetKeyStatus={(v) => filterForm.setData('key_status', v)}
                        onApplyKeyFilter={() => router.get(`${consoleBaseUrl}/keys`, { key_status: filterForm.data.key_status })}
                        keyDrafts={keyDrafts}
                        onUpdateDraft={updateDraft}
                    />
                )}

                {activeSection === 'usage' && usage && (
                    <UsageSection usage={usage} breakdowns={resolvedBreakdowns} />
                )}

                {activeSection === 'billing' && (
                    <BillingSection
                        wallet={wallet}
                        breakdowns={resolvedBreakdowns}
                        ledger={ledger ?? { data: [], links: [] }}
                        topupConfig={topupConfig ?? { default_amount_usd: 10, min_amount_usd: 1, max_amount_usd: 1000, providers: ['paystack', 'stripe'], default_provider: 'paystack', paystack: { currency: 'NGN', exchange_rate: 1460, symbol: '₦' } }}
                        consoleBaseUrl={consoleBaseUrl}
                        topupAmount={topupForm.data.amount_usd}
                        topupProvider={topupForm.data.provider}
                        topupProcessing={topupForm.processing}
                        onSetTopupAmount={(v) => topupForm.setData('amount_usd', v)}
                        onSetTopupProvider={(v) => topupForm.setData('provider', v)}
                        onTopup={() => topupForm.post(`${consoleBaseUrl}/billing/top-up`)}
                    />
                )}

                {activeSection === 'models' && <ModelsSection models={models} docsUrl={docsUrl} />}
            </div>
        </ConsoleLayout>
    );
}
