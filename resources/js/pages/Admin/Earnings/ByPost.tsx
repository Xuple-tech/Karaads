import { FormEvent, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Ban, CheckCircle2, PauseCircle, Save } from 'lucide-react';

import { AdminMetricCard, AdminPanel, AdminSection } from '@/components/admin/page';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

type MonetizationStatus = 'active' | 'paused' | 'blocked';

interface PostMonetization {
    is_monetized: boolean;
    ad_integration: boolean;
    cpm_rate: string | number;
    cpc_rate: string | number;
    revenue_share: string | number;
    total_earnings: string | number;
    total_impressions: number;
    total_clicks: number;
    estimated_earnings: string | number;
    monetization_status: MonetizationStatus;
}

interface Post {
    id: string;
    content: string | null;
    user?: {
        name?: string;
        email?: string;
    } | null;
    monetization?: PostMonetization | null;
}

interface PostEarning {
    post_id: string;
    total_amount: string;
    count: number;
    post: Post | null;
}

interface ByPostProps {
    postEarnings: {
        data: PostEarning[];
        links: unknown[];
        meta: unknown;
    };
    selectedPost?: Post | null;
    selectedPostStats?: {
        total_amount: number;
        transactions: number;
        pending_amount: number;
        paid_amount: number;
    } | null;
    statusOptions: MonetizationStatus[];
}

const numberValue = (value: string | number | null | undefined, fallback = 0) => Number(value ?? fallback);

export default function ByPost({ postEarnings, selectedPost, selectedPostStats, statusOptions }: ByPostProps) {
    const formatCurrency = (amount: string | number) =>
        new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
        }).format(numberValue(amount));

    const monetization = selectedPost?.monetization;
    const { data, setData, put, processing, errors } = useForm({
        is_monetized: monetization?.is_monetized ?? true,
        ad_integration: monetization?.ad_integration ?? true,
        monetization_status: monetization?.monetization_status ?? 'active',
        cpm_rate: numberValue(monetization?.cpm_rate, 0.5),
        cpc_rate: numberValue(monetization?.cpc_rate, 0.05),
        revenue_share: numberValue(monetization?.revenue_share, 0.6),
        total_earnings: numberValue(monetization?.total_earnings ?? selectedPostStats?.total_amount, 0),
        estimated_earnings: numberValue(monetization?.estimated_earnings ?? selectedPostStats?.total_amount, 0),
        total_impressions: numberValue(monetization?.total_impressions, 0),
        total_clicks: numberValue(monetization?.total_clicks, 0),
    });

    useEffect(() => {
        setData({
            is_monetized: monetization?.is_monetized ?? true,
            ad_integration: monetization?.ad_integration ?? true,
            monetization_status: monetization?.monetization_status ?? 'active',
            cpm_rate: numberValue(monetization?.cpm_rate, 0.5),
            cpc_rate: numberValue(monetization?.cpc_rate, 0.05),
            revenue_share: numberValue(monetization?.revenue_share, 0.6),
            total_earnings: numberValue(monetization?.total_earnings ?? selectedPostStats?.total_amount, 0),
            estimated_earnings: numberValue(monetization?.estimated_earnings ?? selectedPostStats?.total_amount, 0),
            total_impressions: numberValue(monetization?.total_impressions, 0),
            total_clicks: numberValue(monetization?.total_clicks, 0),
        });
    }, [selectedPost?.id]);

    const submitControls = (event: FormEvent) => {
        event.preventDefault();

        if (!selectedPost) {
            return;
        }

        put(`/admin/earnings/by-post/${selectedPost.id}/monetization`, {
            preserveScroll: true,
        });
    };

    const statusBadge = (status?: MonetizationStatus) => {
        if (status === 'blocked') return <Badge variant="destructive">Blocked</Badge>;
        if (status === 'paused') return <Badge variant="secondary">Paused</Badge>;

        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Active</Badge>;
    };

    return (
        <>
            <Head title="Post Earnings Control" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={admin.earnings.index.url()}>
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold">Post Earnings Control</h1>
                                <p className="text-muted-foreground">Pause, resume, block, and tune earning settings per post.</p>
                            </div>
                        </div>
                        <Link href="/admin/earnings/by-post">
                            <Button variant="outline">All post earnings</Button>
                        </Link>
                    </div>

                    {selectedPost ? (
                        <section className="grid gap-4 md:grid-cols-4">
                            <AdminMetricCard label="Post total" value={formatCurrency(selectedPostStats?.total_amount ?? 0)} hint="Recorded earnings" icon={CheckCircle2} tone="success" />
                            <AdminMetricCard label="Transactions" value={selectedPostStats?.transactions ?? 0} hint="Earning records" icon={Save} />
                            <AdminMetricCard label="Pending" value={formatCurrency(selectedPostStats?.pending_amount ?? 0)} hint="Awaiting payout" icon={PauseCircle} tone="warning" />
                            <AdminMetricCard label="Paid" value={formatCurrency(selectedPostStats?.paid_amount ?? 0)} hint="Completed payout" icon={Ban} />
                        </section>
                    ) : null}

                    <section className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
                        <AdminSection title="Post earning posts" description="Choose a post to open its earning controls.">
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Post</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Transactions</TableHead>
                                                <TableHead className="text-right">Total earnings</TableHead>
                                                <TableHead className="text-right">Control</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {postEarnings.data.length > 0 ? (
                                                postEarnings.data.map((item) => (
                                                    <TableRow key={item.post_id}>
                                                        <TableCell className="max-w-md">
                                                            <div className="flex flex-col">
                                                                <span className="truncate font-medium">{item.post?.content || 'Deleted Post'}</span>
                                                                <span className="text-xs text-muted-foreground">{item.post?.user?.name || 'Unknown creator'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{statusBadge(item.post?.monetization?.monetization_status)}</TableCell>
                                                        <TableCell>{item.count}</TableCell>
                                                        <TableCell className="text-right font-medium">{formatCurrency(item.total_amount)}</TableCell>
                                                        <TableCell className="text-right">
                                                            {item.post ? (
                                                                <Link href={admin.earnings.byPost.url({ post: item.post_id })}>
                                                                    <Button variant="outline" size="sm">Manage</Button>
                                                                </Link>
                                                            ) : null}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                        No posts found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Pagination links={postEarnings.links} />
                        </AdminSection>

                        <AdminPanel
                            title={selectedPost ? 'Selected post controls' : 'Select a post'}
                            description={selectedPost ? 'Changes here directly control earning behavior for this post.' : 'Pick a post from the table to manage its monetization.'}
                        >
                            {selectedPost ? (
                                <form onSubmit={submitControls} className="space-y-5">
                                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                                        <p className="line-clamp-3 font-medium">{selectedPost.content || 'Untitled post'}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">{selectedPost.user?.name || 'Unknown creator'} · {selectedPost.user?.email || 'No email'}</p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="flex items-center justify-between rounded-2xl border border-border/70 p-3">
                                            <span className="text-sm font-medium">Monetized</span>
                                            <input
                                                type="checkbox"
                                                checked={data.is_monetized}
                                                onChange={(event) => setData('is_monetized', event.target.checked)}
                                            />
                                        </label>
                                        <label className="flex items-center justify-between rounded-2xl border border-border/70 p-3">
                                            <span className="text-sm font-medium">Ad integration</span>
                                            <input
                                                type="checkbox"
                                                checked={data.ad_integration}
                                                onChange={(event) => setData('ad_integration', event.target.checked)}
                                            />
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={data.monetization_status} onValueChange={(value) => setData('monetization_status', value as MonetizationStatus)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status} value={status} className="capitalize">
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.monetization_status ? <p className="text-sm text-destructive">{errors.monetization_status}</p> : null}
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="CPM rate" value={data.cpm_rate} error={errors.cpm_rate} onChange={(value) => setData('cpm_rate', value)} />
                                        <Field label="CPC rate" value={data.cpc_rate} error={errors.cpc_rate} onChange={(value) => setData('cpc_rate', value)} />
                                        <Field label="Revenue share" value={data.revenue_share} error={errors.revenue_share} step="0.01" onChange={(value) => setData('revenue_share', value)} />
                                        <Field label="Estimated earnings" value={data.estimated_earnings} error={errors.estimated_earnings} onChange={(value) => setData('estimated_earnings', value)} />
                                        <Field label="Total earnings" value={data.total_earnings} error={errors.total_earnings} onChange={(value) => setData('total_earnings', value)} />
                                        <Field label="Impressions" value={data.total_impressions} error={errors.total_impressions} step="1" onChange={(value) => setData('total_impressions', value)} />
                                        <Field label="Clicks" value={data.total_clicks} error={errors.total_clicks} step="1" onChange={(value) => setData('total_clicks', value)} />
                                    </div>

                                    <Button type="submit" disabled={processing} className="w-full gap-2">
                                        <Save className="h-4 w-4" />
                                        {processing ? 'Saving controls...' : 'Save post earning controls'}
                                    </Button>
                                </form>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                                    Select a post to control earnings, rates, and monetization status.
                                </div>
                            )}
                        </AdminPanel>
                    </section>
                </div>
            </AdminLayout>
        </>
    );
}

function Field({
    label,
    value,
    error,
    step = '0.000001',
    onChange,
}: {
    label: string;
    value: string | number | boolean;
    error?: string;
    step?: string;
    onChange: (value: number) => void;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input
                type="number"
                min="0"
                step={step}
                value={Number(value)}
                onChange={(event) => onChange(Number(event.target.value))}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
