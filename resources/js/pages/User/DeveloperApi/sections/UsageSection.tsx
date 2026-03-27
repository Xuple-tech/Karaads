import React, { useState } from 'react';
import { BarChart3, Zap } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Panel, DataTable, Td, Pagination, formatDate } from '../components';
import type { BreakdownsData, Paginated, UsageRow } from '../types';

type Props = {
    usage: Paginated<UsageRow>;
    breakdowns: BreakdownsData;
};

export function UsageSection({ usage, breakdowns }: Props) {
    const [selected, setSelected] = useState<UsageRow | null>(null);

    return (
        <div className="space-y-6">
            <Panel
                title="Request Log"
                description="Click any row to view full request details."
                action={<Zap className="h-4 w-4 text-muted-foreground" />}
            >
                <DataTable
                    headers={['Request ID', 'Key', 'Model', 'Tokens', 'Cost', 'Status', 'Date']}
                    empty={usage.data.length === 0}
                >
                    {usage.data.map((row) => (
                        <tr
                            key={row.id}
                            className="cursor-pointer hover:bg-accent/60 transition-colors"
                            onClick={() => setSelected(row)}
                        >
                            <Td mono className="max-w-[120px] truncate">{row.request_id}</Td>
                            <Td>
                                {row.api_key?.key_prefix ? (
                                    <code className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
                                        {row.api_key.key_prefix}
                                    </code>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </Td>
                            <Td>
                                <span className="font-medium">{row.model?.public_id ?? '-'}</span>
                            </Td>
                            <Td>
                                <span className="tabular-nums">{row.total_tokens.toLocaleString()}</span>
                            </Td>
                            <Td>
                                <span className="tabular-nums">${row.cost_usd.toFixed(6)}</span>
                            </Td>
                            <Td>
                                <StatusBadge status={row.status} estimated={row.is_estimated_tokens} />
                            </Td>
                            <Td>
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(row.created_at)}
                                </span>
                            </Td>
                        </tr>
                    ))}
                </DataTable>
                <Pagination links={usage.links} />
            </Panel>

            <div className="grid gap-6 md:grid-cols-2">
                <Panel
                    title="By Status"
                    description="Request distribution by outcome."
                    action={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                >
                    <BreakdownList
                        rows={breakdowns.statuses.map((r) => ({
                            label: r.status ?? 'unknown',
                            value: r.requests.toLocaleString(),
                            count: r.requests,
                        }))}
                        maxCount={Math.max(...breakdowns.statuses.map((r) => r.requests), 1)}
                        empty="No status breakdown available."
                    />
                </Panel>
                <Panel
                    title="Spend by Model"
                    description="Dollar cost per model."
                    action={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                >
                    <BreakdownList
                        rows={breakdowns.per_model.map((r) => ({
                            label: r.model ?? 'Unknown',
                            value: `$${(r.cost_usd ?? 0).toFixed(6)}`,
                            count: r.requests,
                        }))}
                        maxCount={Math.max(...breakdowns.per_model.map((r) => r.requests), 1)}
                        empty="No model spend data."
                    />
                </Panel>
            </div>

            {/* Request Detail Modal */}
            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Request Detail</DialogTitle>
                        <DialogDescription>
                            Full information for this API request.
                        </DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 py-1">
                            <div className="flex items-center gap-2">
                                <StatusBadge status={selected.status} estimated={selected.is_estimated_tokens} />
                                {selected.is_estimated_tokens && (
                                    <span className="text-xs text-muted-foreground">(estimated tokens)</span>
                                )}
                            </div>
                            <dl className="space-y-2">
                                <DetailRow label="Request ID">
                                    <code className="font-mono text-xs break-all">{selected.request_id}</code>
                                </DetailRow>
                                <DetailRow label="Model">{selected.model?.public_id ?? '-'}</DetailRow>
                                <DetailRow label="API Key">
                                    {selected.api_key?.key_prefix ? (
                                        <code className="font-mono text-xs">{selected.api_key.key_prefix}</code>
                                    ) : '-'}
                                </DetailRow>
                                <DetailRow label="Prompt Tokens">
                                    {selected.prompt_tokens !== undefined
                                        ? selected.prompt_tokens.toLocaleString()
                                        : '-'}
                                </DetailRow>
                                <DetailRow label="Completion Tokens">
                                    {selected.completion_tokens !== undefined
                                        ? selected.completion_tokens.toLocaleString()
                                        : '-'}
                                </DetailRow>
                                <DetailRow label="Total Tokens">
                                    <span className="font-semibold">{selected.total_tokens.toLocaleString()}</span>
                                </DetailRow>
                                <DetailRow label="Cost">
                                    <span className="font-semibold">${selected.cost_usd.toFixed(6)}</span>
                                </DetailRow>
                                <DetailRow label="Date">{formatDate(selected.created_at)}</DetailRow>
                            </dl>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd className="text-right text-foreground">{children}</dd>
        </div>
    );
}

function StatusBadge({ status, estimated }: { status: string; estimated: boolean }) {
    const isSuccess = status === 'success';
    return (
        <Badge
            variant={isSuccess ? 'default' : 'destructive'}
            className={
                isSuccess
                    ? 'bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20 dark:bg-green-400/10 dark:text-green-400 dark:border-green-400/30'
                    : 'bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/20 dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/30'
            }
        >
            {status}{estimated ? ' (est.)' : ''}
        </Badge>
    );
}

function BreakdownList({
    rows,
    maxCount,
    empty,
}: {
    rows: { label: string; value: string; count: number }[];
    maxCount: number;
    empty: string;
}) {
    if (!rows.length) {
        return <p className="py-4 text-center text-sm text-muted-foreground">{empty}</p>;
    }
    return (
        <ul className="space-y-2.5">
            {rows.map((row) => (
                <li key={row.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize text-foreground">{row.label}</span>
                        <span className="tabular-nums text-muted-foreground">{row.value}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary/60 transition-all"
                            style={{ width: `${(row.count / maxCount) * 100}%` }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}
