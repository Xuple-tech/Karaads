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

interface EngagementData {
    date: string;
    count: number;
}

interface EngagementProps {
    postsCreated: EngagementData[];
    period: string;
}

export default function Engagement({ postsCreated, period }: EngagementProps) {
    const handlePeriodChange = (value: string) => {
        router.get(admin.analytics.engagement.url({ period: value }), { preserveState: true });
    };

    const chartData = {
        labels: postsCreated.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Posts Created',
                data: postsCreated.map(d => d.count),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.5)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const totalPosts = postsCreated.reduce((sum, d) => sum + d.count, 0);
    const averageDailyPosts = postsCreated.length > 0 ? Math.round(totalPosts / postsCreated.length) : 0;

    return (
        <>
            <Head title="Engagement Analytics" />
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
                                <h1 className="text-3xl font-bold">Engagement Analytics</h1>
                                <p className="text-muted-foreground">Content creation and user activity</p>
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
                                <CardTitle>Content Creation</CardTitle>
                                <CardDescription>Daily posts created for the selected period</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px]">
                                    <Line 
                                        data={chartData} 
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

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Total Posts Created</div>
                                        <div className="text-3xl font-bold">{totalPosts.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">in selected period</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Average Daily Posts</div>
                                        <div className="text-3xl font-bold">{averageDailyPosts}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
