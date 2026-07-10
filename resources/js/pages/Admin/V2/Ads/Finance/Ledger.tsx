import { Head } from '@inertiajs/react';
import { ArrowDownUp, BookText, Rows3 } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface LedgerItem {
    id: string;
    direction: string;
    entry_type: string;
    amount: string;
    created_at: string;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

export default function Ledger({ ledger }: { ledger: { data: LedgerItem[] } }) {
    const totalAmount = ledger.data.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

    return (
        <>
            <Head title="V2 Finance Ledger" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Ads V2"
                        title="Finance ledger"
                        description="Inspect ledger direction, entry type, and recorded amounts for the ads finance system."
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard label="Entries" value={ledger.data.length} hint="Ledger rows in this response" icon={Rows3} />
                        <AdminMetricCard label="Directions" value={new Set(ledger.data.map((entry) => entry.direction)).size} hint="Unique movement directions" icon={ArrowDownUp} />
                        <AdminMetricCard label="Total amount" value={formatCurrency(totalAmount)} hint="Aggregate of returned ledger amounts" icon={BookText} tone="success" />
                    </div>

                    <AdminSection title="Ledger table" description="Review financial movements by date, direction, and entry type.">
                        <AdminPanel title="Ledger entries" description="Backend-supplied finance ledger records for the current query.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Direction</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledger.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                                    No ledger entries.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            ledger.data.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell>{row.direction}</TableCell>
                                                    <TableCell>{row.entry_type}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(Number(row.amount || 0))}</TableCell>
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
