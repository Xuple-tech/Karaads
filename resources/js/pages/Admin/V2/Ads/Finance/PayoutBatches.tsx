import { Head } from '@inertiajs/react';
import { CalendarRange, Rows3, Wallet } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface Batch {
    id: string;
    status: string;
    total_amount: string;
    currency: string;
    period_start: string;
    period_end: string;
}

const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export default function PayoutBatches({ batches }: { batches: { data: Batch[] } }) {
    const totalAmount = batches.data.reduce((sum, batch) => sum + Number(batch.total_amount || 0), 0);
    const currency = batches.data[0]?.currency || 'NGN';

    return (
        <>
            <Head title="V2 Payout Batches" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Ads V2"
                        title="Payout batches"
                        description="Track payout batch periods, settlement status, and total batch amounts."
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard label="Batches" value={batches.data.length} hint="Payout batches returned" icon={Rows3} />
                        <AdminMetricCard label="Statuses" value={new Set(batches.data.map((batch) => batch.status)).size} hint="Unique payout states present" icon={CalendarRange} />
                        <AdminMetricCard label="Total amount" value={formatCurrency(totalAmount, currency)} hint="Aggregate across returned batches" icon={Wallet} tone="success" />
                    </div>

                    <AdminSection title="Batch table" description="Review payout windows, currencies, statuses, and total batch amounts.">
                        <AdminPanel title="Payout batches" description="Batch-level finance records for payout operations.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Period</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Currency</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {batches.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                                    No payout batches.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            batches.data.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>
                                                        {new Date(row.period_start).toLocaleDateString()} - {new Date(row.period_end).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="capitalize">{row.status}</TableCell>
                                                    <TableCell>{row.currency}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(Number(row.total_amount || 0), row.currency)}</TableCell>
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
