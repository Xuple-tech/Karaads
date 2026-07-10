import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Coins, FileText, Users } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface Creator {
    id: string;
    name: string;
    email: string;
    posts_count: number;
    earnings_sum_amount: number | null;
}

interface Props {
    topCreators: Creator[];
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

export default function TopCreators({ topCreators }: Props) {
    const totalCreators = topCreators.length;
    const totalPosts = topCreators.reduce((sum, creator) => sum + creator.posts_count, 0);
    const totalEarnings = topCreators.reduce((sum, creator) => sum + Number(creator.earnings_sum_amount || 0), 0);

    return (
        <>
            <Head title="Top Creators" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Analytics"
                        title="Top creators"
                        description="Ranked creator performance using current earnings and publishing activity."
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
                        <AdminMetricCard label="Creators listed" value={totalCreators} hint="Rows in this ranking" icon={Users} />
                        <AdminMetricCard label="Posts counted" value={totalPosts} hint="Published posts across ranked creators" icon={FileText} />
                        <AdminMetricCard label="Total earnings" value={formatCurrency(totalEarnings)} hint="Combined creator earnings in view" icon={Coins} tone="success" />
                    </div>

                    <AdminSection title="Ranking table" description="Compare creator output and earnings side by side.">
                        <AdminPanel title="Creator rankings" description="Sorted by total earnings from the current analytics query.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="text-right">Posts</TableHead>
                                            <TableHead className="text-right">Total earnings</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topCreators.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                                    No creator data available.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            topCreators.map((creator) => (
                                                <TableRow key={creator.id}>
                                                    <TableCell className="font-medium">{creator.name}</TableCell>
                                                    <TableCell>{creator.email}</TableCell>
                                                    <TableCell className="text-right">{creator.posts_count}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(Number(creator.earnings_sum_amount || 0))}</TableCell>
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
