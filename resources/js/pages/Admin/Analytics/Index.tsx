import { Head } from '@inertiajs/react';
import { Activity, BarChart3, DollarSign, FileText, TrendingUp, Users } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel } from '@/components/admin/page';
import AdminLayout from '@/layouts/admin-layout';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface Stats {
    total_users: number;
    new_users_today: number;
    total_revenue: string;
    revenue_today: string;
    total_posts: number;
    posts_today: number;
    active_ads: number;
}

interface ChartData {
    date: string;
    total?: string;
    count?: number;
}

interface IndexProps {
    stats: Stats;
    charts: {
        revenue: ChartData[];
        user_growth: ChartData[];
    };
}

export default function Index({ stats, charts }: IndexProps) {
    const formatCurrency = (amount: string | number) =>
        new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
        }).format(Number(amount));

    const revenueChartData = {
        labels: charts.revenue.map((d) => new Date(d.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Revenue',
                data: charts.revenue.map((d) => Number(d.total)),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const userGrowthChartData = {
        labels: charts.user_growth.map((d) => new Date(d.date).toLocaleDateString()),
        datasets: [
            {
                label: 'New Users',
                data: charts.user_growth.map((d) => d.count),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
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
            <Head title="Analytics Dashboard" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Insights"
                        title="Analytics overview"
                        description="Monitor revenue, user growth, content output, and ad activity from the current reporting window."
                    />

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <AdminMetricCard
                            label="Total revenue"
                            value={formatCurrency(stats.total_revenue)}
                            hint={`+${formatCurrency(stats.revenue_today)} today`}
                            icon={DollarSign}
                            tone="success"
                        />
                        <AdminMetricCard
                            label="Total users"
                            value={stats.total_users.toLocaleString()}
                            hint={`+${stats.new_users_today} today`}
                            icon={Users}
                        />
                        <AdminMetricCard
                            label="Total posts"
                            value={stats.total_posts.toLocaleString()}
                            hint={`+${stats.posts_today} today`}
                            icon={FileText}
                        />
                        <AdminMetricCard
                            label="Active creatives"
                            value={stats.active_ads.toLocaleString()}
                            hint="Currently running campaigns"
                            icon={Activity}
                        />
                    </section>

                    <section className="grid gap-6 md:grid-cols-2">
                        <AdminPanel title="Revenue trend" description="Daily revenue over the last 30 days.">
                            <div className="h-[300px]">
                                <Line options={chartOptions} data={revenueChartData} />
                            </div>
                        </AdminPanel>
                        <AdminPanel title="User growth" description="New user registrations over the last 30 days.">
                            <div className="h-[300px]">
                                <Bar options={chartOptions} data={userGrowthChartData} />
                            </div>
                        </AdminPanel>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-3">
                        <AdminPanel title="Revenue signal" description="Current revenue momentum.">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Today versus baseline</p>
                                    <p className="karads-heading text-2xl font-semibold">{formatCurrency(stats.revenue_today)}</p>
                                </div>
                            </div>
                        </AdminPanel>
                        <AdminPanel title="Growth signal" description="New user acquisition today.">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">New users today</p>
                                    <p className="karads-heading text-2xl font-semibold">{stats.new_users_today}</p>
                                </div>
                            </div>
                        </AdminPanel>
                        <AdminPanel title="Content signal" description="Posts created today.">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Posts today</p>
                                    <p className="karads-heading text-2xl font-semibold">{stats.posts_today}</p>
                                </div>
                            </div>
                        </AdminPanel>
                    </section>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
