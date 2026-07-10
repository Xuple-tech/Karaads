import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ChartColumn, MousePointerClick, Rows3 } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface AdStat {
    date: string;
    interaction_type: string;
    count: number;
}

interface Props {
    adStats: AdStat[];
    period: string;
}

export default function AdsPerformance({ adStats, period }: Props) {
    const totalInteractions = adStats.reduce((sum, item) => sum + item.count, 0);
    const interactionTypes = new Set(adStats.map((item) => item.interaction_type)).size;

    return (
        <>
            <Head title="Ads Performance" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Analytics"
                        title="Ads performance"
                        description={`Ad interaction performance for the selected period: ${period}.`}
                        actions={
                            <Link href={admin.analytics.index.url()}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to analytics
                                </Button>
                            </Link>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard label="Rows" value={adStats.length} hint="Daily interaction records returned" icon={Rows3} />
                        <AdminMetricCard label="Interaction types" value={interactionTypes} hint="Unique interaction categories" icon={ChartColumn} />
                        <AdminMetricCard label="Total interactions" value={totalInteractions} hint="Sum of all recorded ad interactions" icon={MousePointerClick} tone="success" />
                    </div>

                    <AdminSection title="Interaction table" description="Break down ad activity by date and interaction type.">
                        <AdminPanel title="Ad interactions" description="Use this view for quick audit and performance checks.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Interaction type</TableHead>
                                            <TableHead className="text-right">Count</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {adStats.length === 0 ? (
                                            <TableRow>
                                                <TableCell className="py-8 text-center text-muted-foreground" colSpan={3}>
                                                    No ad interaction data for this period.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            adStats.map((item, index) => (
                                                <TableRow key={`${item.date}-${item.interaction_type}-${index}`}>
                                                    <TableCell>{item.date}</TableCell>
                                                    <TableCell className="capitalize">{item.interaction_type}</TableCell>
                                                    <TableCell className="text-right">{item.count}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
