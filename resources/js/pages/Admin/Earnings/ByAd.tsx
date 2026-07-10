import { Head, Link } from '@/components/page-head';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Pagination from '@/components/pagination';

interface Ad {
    id: string;
    title: string;
}

interface AdEarning {
    ad_id: string;
    total_amount: string;
    count: number;
    ad: Ad;
}

interface ByAdProps {
    adEarnings: {
        data: AdEarning[];
        links: unknown[];
        meta: unknown;
    };
}

export default function ByAd({ adEarnings }: ByAdProps) {
    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(parseFloat(amount));
    };

    return (
        <>
            <Head title="Earnings by Ad" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.earnings.index')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Earnings by Ad</h1>
                            <p className="text-muted-foreground">Top earning ads on the platform</p>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ad Title</TableHead>
                                        <TableHead>Transactions</TableHead>
                                        <TableHead className="text-right">Total Earnings</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adEarnings.data.length > 0 ? (
                                        adEarnings.data.map((item) => (
                                            <TableRow key={item.ad_id}>
                                                <TableCell className="font-medium">
                                                    {item.ad ? item.ad.title : 'Deleted Ad'}
                                                </TableCell>
                                                <TableCell>{item.count}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(item.total_amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.ad && (
                                                        <Link href={route('admin.earnings.by-ad', { ad_id: item.ad_id })}>
                                                            <Button variant="outline" size="sm">
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No ads found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Pagination links={adEarnings.links} />
                </div>
            </AdminLayout>
        </>
    );
}
