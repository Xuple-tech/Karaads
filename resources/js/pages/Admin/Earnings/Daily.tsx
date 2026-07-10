import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Filter, Calendar } from 'lucide-react';
import Pagination from '@/components/pagination';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import admin from '@/routes/admin';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface DailyEarning {
    date: string;
    total_amount: string;
    count: number;
}

interface DailyProps {
    dailyEarnings: {
        data: DailyEarning[];
        links: unknown[];
        meta: unknown;
    };
    filters: {
        date_from?: string;
        date_to?: string;
    };
}

export default function Daily({ dailyEarnings, filters }: DailyProps) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(admin.earnings.daily.url(), {
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true });
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(parseFloat(amount));
    };

    // Prepare chart data
    // Sort data by date ascending for the chart
    const sortedData = [...dailyEarnings.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const chartData = {
        labels: sortedData.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Daily Earnings',
                data: sortedData.map(d => parseFloat(d.total_amount)),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Daily Earnings Overview',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <>
            <Head title="Daily Earnings Report" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href={admin.earnings.index.url()}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Daily Earnings</h1>
                            <p className="text-muted-foreground">Daily breakdown of platform revenue</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Filter Range</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="w-full md:w-auto">
                                    <label className="text-sm font-medium mb-1 block">From Date</label>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-auto">
                                    <label className="text-sm font-medium mb-1 block">To Date</label>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                    />
                                </div>
                                <Button type="submit">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply Filter
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Earnings Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <Line options={chartOptions} data={chartData} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Daily Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Transactions</TableHead>
                                            <TableHead className="text-right">Total Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dailyEarnings.data.length > 0 ? (
                                            dailyEarnings.data.map((day) => (
                                                <TableRow key={day.date}>
                                                    <TableCell>
                                                        {new Date(day.date).toLocaleDateString(undefined, {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </TableCell>
                                                    <TableCell>{day.count}</TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(day.total_amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                    No data found for the selected range.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <Pagination links={dailyEarnings.links} />
                </div>
            </AdminLayout>
        </>
    );
}
