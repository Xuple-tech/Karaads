import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import admin from '@/routes/admin';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface RevenueData {
    date: string;
    total: string;
    earning_type: string;
}

interface RevenueByType {
    earning_type: string;
    total: string;
}

interface RevenueProps {
    revenueData: RevenueData[];
    revenueByType: RevenueByType[];
    period: string;
}

export default function Revenue({ revenueData, revenueByType, period }: RevenueProps) {
    const handlePeriodChange = (value: string) => {
        router.get(admin.analytics.revenue.url({ period: value }), { preserveState: true });
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(amount));
    };

    // Process data for line chart (aggregate by date)
    const dates = [...new Set(revenueData.map(d => d.date))].sort();
    const aggregatedData = dates.map(date => {
        const dayTotal = revenueData
            .filter(d => d.date === date)
            .reduce((sum, d) => sum + Number(d.total), 0);
        return { date, total: dayTotal };
    });

    const lineChartData = {
        labels: dates.map(d => new Date(d).toLocaleDateString()),
        datasets: [
            {
                label: 'Total Revenue',
                data: aggregatedData.map(d => d.total),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    // Process data for doughnut chart
    const doughnutChartData = {
        labels: revenueByType.map(d => d.earning_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
        datasets: [
            {
                data: revenueByType.map(d => Number(d.total)),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(107, 114, 128, 0.8)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const totalRevenue = revenueByType.reduce((sum, d) => sum + Number(d.total), 0);

    return (
        <>
            <Head title="Revenue Analytics" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={admin.analytics.index.url()}>
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold">Revenue Analytics</h1>
                                <p className="text-muted-foreground">Detailed revenue breakdown and trends</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={period} onValueChange={handlePeriodChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7_days">Last 7 Days</SelectItem>
                                    <SelectItem value="30_days">Last 30 Days</SelectItem>
                                    <SelectItem value="90_days">Last 90 Days</SelectItem>
                                    <SelectItem value="1_year">Last Year</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Revenue Over Time</CardTitle>
                                <CardDescription>Total revenue trend for the selected period</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px]">
                                    <Line 
                                        data={lineChartData} 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'top' },
                                            },
                                            scales: {
                                                y: { beginAtZero: true }
                                            }
                                        }} 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Distribution</CardTitle>
                                <CardDescription>Breakdown by earning type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px] flex items-center justify-center">
                                    <Doughnut 
                                        data={doughnutChartData} 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'bottom' },
                                            }
                                        }} 
                                    />
                                </div>
                                <div className="mt-6 space-y-2">
                                    <div className="flex justify-between items-center font-bold pt-2 border-t">
                                        <span>Total Revenue</span>
                                        <span>{formatCurrency(totalRevenue)}</span>
                                    </div>
                                    {revenueByType.map((item) => (
                                        <div key={item.earning_type} className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">
                                                {item.earning_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                            <span>{formatCurrency(item.total)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
