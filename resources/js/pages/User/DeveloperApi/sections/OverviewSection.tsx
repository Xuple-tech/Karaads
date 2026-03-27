import React from 'react';
import { TrendingUp, Cpu, Key } from 'lucide-react';
import { Panel } from '../components';
import type { BreakdownsData } from '../types';

type Props = {
    breakdowns: BreakdownsData;
};

export function OverviewSection({ breakdowns }: Props) {
    return (
        <div className="grid gap-6 xl:grid-cols-3">
            <Panel
                title="Daily Trend"
                description="Requests and spend per day"
                action={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            >
                <TrendList rows={breakdowns.trend} />
            </Panel>
            <Panel
                title="Top Models"
                description="Usage by model"
                action={<Cpu className="h-4 w-4 text-muted-foreground" />}
            >
                <RankedList
                    rows={breakdowns.per_model.map((r) => ({
                        label: r.model ?? 'Unknown',
                        requests: r.requests,
                        cost: r.cost_usd ?? 0,
                    }))}
                    empty="No model usage in this period."
                />
            </Panel>
            <Panel
                title="Top Keys"
                description="Usage by API key"
                action={<Key className="h-4 w-4 text-muted-foreground" />}
            >
                <RankedList
                    rows={breakdowns.per_key.map((r) => ({
                        label: r.key_prefix ?? 'Unknown',
                        requests: r.requests,
                        cost: r.cost_usd ?? 0,
                    }))}
                    empty="No key usage in this period."
                />
            </Panel>
        </div>
    );
}

// ─── Internal components ──────────────────────────────────────────────────────

function TrendList({ rows }: { rows: BreakdownsData['trend'] }) {
    if (!rows.length) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No trend data available.</p>
            </div>
        );
    }

    const maxReq = Math.max(...rows.map((r) => r.requests ?? 0), 1);

    return (
        <ul className="space-y-2.5">
            {rows.map((row) => (
                <li key={row.date} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{row.date}</span>
                        <span className="text-muted-foreground">
                            {(row.requests ?? 0).toLocaleString()} req · $
                            {(row.cost_usd ?? 0).toFixed(4)}
                        </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary/70 transition-all"
                            style={{ width: `${((row.requests ?? 0) / maxReq) * 100}%` }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}

function RankedList({
    rows,
    empty,
}: {
    rows: { label: string; requests: number; cost: number }[];
    empty: string;
}) {
    if (!rows.length) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">{empty}</p>
            </div>
        );
    }

    const maxReq = Math.max(...rows.map((r) => r.requests), 1);

    return (
        <ol className="space-y-3">
            {rows.map((row, i) => (
                <li key={row.label} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                        {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="truncate font-medium text-foreground">{row.label}</span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                                {row.requests.toLocaleString()} req
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary/60 transition-all"
                                style={{ width: `${(row.requests / maxReq) * 100}%` }}
                            />
                        </div>
                    </div>
                </li>
            ))}
        </ol>
    );
}
