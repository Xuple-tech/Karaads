import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Filter } from 'lucide-react';
import Pagination from '@/components/pagination';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import admin from '@/routes/admin';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface MonthlyEarning {
    month: string;
    total_amount: string;
    count: number;
}

interface MonthlyProps {
    monthlyEarnings: {
        data: MonthlyEarning[];
        links: unknown[];
        meta: unknown;
    };
    filters: {
        year?: string;
    };
}

export default function Monthly({ monthlyEarnings, filters }: MonthlyProps) {
    const [year, setYear] = useState(filters.year || new Date().getFullYear().toString());

    const handleFilter = (value: string) => {
        setYear(value);
        router.get(admin.earnings.monthly.url({ year: value }), {
            preserveState: true,
        });
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(parseFloat(amount));
    };

    // Generate years for select (current year back 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

    // Prepare chart data
    const sortedData = [...monthlyEarnings.data].sort((a, b) => a.month.localeCompare(b.month));
    
    const chartData = {
        labels: sortedData.map(d => {
            const [y, m] = d.month.split('-');
            return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        }),
        datasets: [
            {
                label: 'Monthly Earnings',
                data: sortedData.map(d => parseFloat(d.total_amount)),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
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
                text: 'Monthly Earnings Overview',
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
            <Head title="Monthly Earnings Report" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href={admin.earnings.index.url()}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Monthly Earnings</h1>
                            <p className="text-muted-foreground">Monthly breakdown of platform revenue</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Filter Year</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full md:w-48">
                                <Select value={year} onValueChange={handleFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((y) => (
                                            <SelectItem key={y} value={y}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Earnings Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <Bar options={chartOptions} data={chartData} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Monthly Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Month</TableHead>
                                            <TableHead>Transactions</TableHead>
                                            <TableHead className="text-right">Total Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {monthlyEarnings.data.length > 0 ? (
                                            monthlyEarnings.data.map((month) => {
                                                const [y, m] = month.month.split('-');
                                                return (
                                                    <TableRow key={month.month}>
                                                        <TableCell>
                                                            {new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString(undefined, {
                                                                month: 'long',
                                                                year: 'numeric',
                                                            })}
                                                        </TableCell>
                                                        <TableCell>{month.count}</TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {formatCurrency(month.total_amount)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                    No data found for the selected year.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <Pagination links={monthlyEarnings.links} />
                </div>
            </AdminLayout>
        </>
    );
}
