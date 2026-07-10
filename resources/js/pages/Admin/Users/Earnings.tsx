import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Coins, Rows3 } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface Earning {
    id: string;
    amount: string;
    earning_type: string;
    status: string;
    created_at: string;
}

interface Props {
    user: { id: string; name: string };
    earnings: { data: Earning[] };
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

export default function UserEarnings({ user, earnings }: Props) {
    const totalAmount = earnings.data.reduce((sum, earning) => sum + Number(earning.amount || 0), 0);

    return (
        <>
            <Head title={`Earnings: ${user.name}`} />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Users"
                        title={`${user.name} earnings`}
                        description="Review earning records tied to this user account."
                        actions={
                            <Link href={admin.users.show(user.id).url}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to user
                                </Button>
                            </Link>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <AdminMetricCard label="Records" value={earnings.data.length} hint="Earning rows in this result" icon={Rows3} />
                        <AdminMetricCard label="Total amount" value={formatCurrency(totalAmount)} hint="Combined amount across returned earning records" icon={Coins} tone="success" />
                    </div>

                    <AdminSection title="Earning records" description="Inspect the user’s earning history by type, status, and date.">
                        <AdminPanel title="Earning records" description="This table reflects the current earnings payload for the user.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {earnings.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                                    No earnings found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            earnings.data.map((earning) => (
                                                <TableRow key={earning.id}>
                                                    <TableCell>{new Date(earning.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="capitalize">{earning.earning_type}</TableCell>
                                                    <TableCell className="capitalize">{earning.status}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(Number(earning.amount || 0))}</TableCell>
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
