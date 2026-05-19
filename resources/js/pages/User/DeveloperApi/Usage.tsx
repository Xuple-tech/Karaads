import React from 'react';
import { router, usePage } from '@inertiajs/react';
import DeveloperPortalLayout from '@/layouts/developer-portal-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';

interface UsageStats {
    requests: number;
    success_requests: number;
    error_requests: number;
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
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

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    usage: Paginated<UsageRecord>;
    stats: UsageStats | null;
}

function formatUsd(val: number) {
    return '$' + val.toFixed(val < 0.01 ? 6 : 4);
}

export default function DeveloperApiUsage({ usage, stats }: PageProps) {
    const { props } = usePage<{ flash?: { error?: string } }>();
    const flash = props.flash ?? {};

    const s = stats ?? { requests: 0, success_requests: 0, error_requests: 0, total_tokens: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0 };

    const summaryItems = [
        { label: 'Total Requests', value: s.requests.toLocaleString() },
        { label: 'Successful', value: s.success_requests.toLocaleString() },
        { label: 'Failed', value: s.error_requests.toLocaleString() },
        { label: 'Total Tokens', value: s.total_tokens.toLocaleString() },
        { label: 'Input Tokens', value: s.input_tokens.toLocaleString() },
        { label: 'Output Tokens', value: s.output_tokens.toLocaleString() },
        { label: 'Total Cost', value: formatUsd(s.cost_usd) },
        {
            label: 'Success Rate',
            value: s.requests > 0 ? `${((s.success_requests / s.requests) * 100).toFixed(1)}%` : '—',
        },
    ];

    return (
        <DeveloperPortalLayout title="Usage">
            {flash.error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Usage</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        API request history and usage statistics.
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {summaryItems.map((item) => (
                        <Card key={item.label}>
                            <CardContent className="pt-4 pb-3">
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className="text-xl font-semibold mt-0.5">{item.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Records table */}
                {usage.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center text-muted-foreground">
                            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No usage records yet</p>
                            <p className="text-sm mt-1">Records will appear here once you start making API calls.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">In</TableHead>
                                        <TableHead className="text-right">Out</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
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
                                            <TableCell>
                                                {r.model ? (
                                                    <div>
                                                        <p className="text-sm font-medium">{r.model.name}</p>
                                                        <p className="font-mono text-xs text-muted-foreground">{r.model.public_id}</p>
                                                    </div>
                                                ) : (
                                                    <span className="font-mono text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={r.status === 'success' ? 'default' : 'destructive'}
                                                    className="text-xs"
                                                >
                                                    {r.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-xs">{r.input_tokens.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-xs">{r.output_tokens.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-xs">
                                                {r.total_tokens.toLocaleString()}
                                                {r.is_estimated_tokens && (
                                                    <span className="text-muted-foreground ml-0.5">~</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs">{formatUsd(r.cost_usd)}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {r.api_key ? `${r.api_key.key_prefix}…` : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {usage.last_page > 1 && (
                            <div className="flex justify-center gap-1 p-4 border-t">
                                {usage.links.map((link) => (
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
                    </Card>
                )}
            </div>
        </DeveloperPortalLayout>
    );
}
