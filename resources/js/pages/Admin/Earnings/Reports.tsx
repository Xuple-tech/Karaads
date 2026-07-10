import { Head } from '@inertiajs/react';
import { CircleDollarSign, Clock3, CreditCard, XCircle } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface BreakdownItem {
    status?: string;
    earning_type?: string;
    count: number;
    total_amount: number;
}

interface Props {
    statusBreakdown: BreakdownItem[];
    typeBreakdown: BreakdownItem[];
    totals: {
        pending: number;
        processing: number;
        paid: number;
        failed: number;
    };
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

export default function EarningsReports({ statusBreakdown, typeBreakdown, totals }: Props) {
    return (
        <>
            <Head title="Earnings Reports" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Earnings"
                        title="Earnings reports"
                        description="Summarize earnings pipeline totals and review the current breakdown by status and earning type."
                    />

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <AdminMetricCard label="Pending" value={formatCurrency(Number(totals.pending))} hint="Awaiting processing" icon={Clock3} tone="warning" />
                        <AdminMetricCard label="Processing" value={formatCurrency(Number(totals.processing))} hint="Currently in flight" icon={CreditCard} />
                        <AdminMetricCard label="Paid" value={formatCurrency(Number(totals.paid))} hint="Completed earnings" icon={CircleDollarSign} tone="success" />
                        <AdminMetricCard label="Failed" value={formatCurrency(Number(totals.failed))} hint="Failed earnings value" icon={XCircle} tone="danger" />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <AdminSection title="Status breakdown" description="Review record counts and total amounts by earnings status.">
                            <AdminPanel title="By status" description="Aggregated earnings totals grouped by processing state.">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Count</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {statusBreakdown.map((item, idx) => (
                                                <TableRow key={`status-${idx}`}>
                                                    <TableCell className="capitalize">{item.status}</TableCell>
                                                    <TableCell className="text-right">{item.count}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(Number(item.total_amount))}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </AdminPanel>
                        </AdminSection>

                        <AdminSection title="Type breakdown" description="Compare totals across earning types.">
                            <AdminPanel title="By earning type" description="Aggregated earnings totals grouped by earning source.">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead className="text-right">Count</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {typeBreakdown.map((item, idx) => (
                                                <TableRow key={`type-${idx}`}>
                                                    <TableCell className="capitalize">{item.earning_type}</TableCell>
                                                    <TableCell className="text-right">{item.count}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(Number(item.total_amount))}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </AdminPanel>
                        </AdminSection>
                    </div>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
