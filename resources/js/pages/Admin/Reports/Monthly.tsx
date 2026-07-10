import { Head, Link } from '@inertiajs/react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Activity, ArrowLeft, BarChart3, BadgeDollarSign, CalendarDays, Users, Wallet } from 'lucide-react';

import { AdminMetricCard, AdminPanel, AdminPage, AdminPageHeader } from '@/components/admin/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

type MonthlyRow = {
    month: string;
    label: string;
    onboarded_users: number;
    cumulative_users: number;
    active_accounts: number;
    inactive_accounts: number;
    active_users: number;
    badge_revenue: number;
    monetization_revenue: number;
    ad_wallet_revenue: number;
    total_revenue: number;
};

type MonthlySummary = {
    total_onboarded: number;
    active_accounts: number;
    inactive_accounts: number;
    active_users: number;
    badge_revenue: number;
    monetization_revenue: number;
    ad_wallet_revenue: number;
    total_revenue: number;
};

type Props = {
    monthlyPlatformReport: {
        months: MonthlyRow[];
        summary: MonthlySummary;
    };
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const compactNumber = (value: number) =>
    new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(Number(value || 0));

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: '#07111f',
            borderColor: 'rgba(125, 211, 252, 0.35)',
            borderWidth: 1,
            padding: 12,
            titleColor: '#e0f2fe',
            bodyColor: '#f8fafc',
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#94a3b8',
                maxTicksLimit: 6,
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(148, 163, 184, 0.14)',
            },
            ticks: {
                color: '#94a3b8',
            },
        },
    },
};

export default function MonthlyReport({ monthlyPlatformReport }: Props) {
    const monthlyRows = monthlyPlatformReport?.months ?? [];
    const monthlySummary = monthlyPlatformReport?.summary ?? {
        total_onboarded: 0,
        active_accounts: 0,
        inactive_accounts: 0,
        active_users: 0,
        badge_revenue: 0,
        monetization_revenue: 0,
        ad_wallet_revenue: 0,
        total_revenue: 0,
    };
    const monthlyLabels = monthlyRows.map((row) => row.label);
    const labels = monthlyLabels.length ? monthlyLabels : ['No data'];

    const userTrendData = {
        labels,
        datasets: [
            {
                label: 'Onboarded users',
                data: monthlyRows.length ? monthlyRows.map((row) => Number(row.onboarded_users || 0)) : [0],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.18)',
                fill: true,
                tension: 0.38,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
            {
                label: 'Cumulative users',
                data: monthlyRows.length ? monthlyRows.map((row) => Number(row.cumulative_users || 0)) : [0],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                fill: false,
                tension: 0.38,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    };

    const revenueBySourceData = {
        labels,
        datasets: [
            {
                label: 'Badge payments',
                data: monthlyRows.length ? monthlyRows.map((row) => Number(row.badge_revenue || 0)) : [0],
                backgroundColor: 'rgba(16, 185, 129, 0.82)',
                borderRadius: 12,
            },
            {
                label: 'Monetization',
                data: monthlyRows.length ? monthlyRows.map((row) => Number(row.monetization_revenue || 0)) : [0],
                backgroundColor: 'rgba(168, 85, 247, 0.82)',
                borderRadius: 12,
            },
            {
                label: 'Ads wallet',
                data: monthlyRows.length ? monthlyRows.map((row) => Number(row.ad_wallet_revenue || 0)) : [0],
                backgroundColor: 'rgba(14, 165, 233, 0.82)',
                borderRadius: 12,
            },
        ],
    };

    const accountStatusData = {
        labels,
        datasets: [
            {
                label: 'Active accounts',
                data: monthlyRows.length ? monthlyRows.map((row) => Number(row.active_accounts || 0)) : [0],
                backgroundColor: 'rgba(34, 197, 94, 0.82)',
                borderRadius: 12,
            },
            {
                label: 'Inactive accounts',
                data: monthlyRows.length ? monthlyRows.map((row) => Number(row.inactive_accounts || 0)) : [0],
                backgroundColor: 'rgba(248, 113, 113, 0.74)',
                borderRadius: 12,
            },
        ],
    };

    const activeUsersData = {
        labels,
        datasets: [
            {
                label: 'Active users',
                data: monthlyRows.length ? monthlyRows.map((row) => Number(row.active_users || 0)) : [0],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.18)',
                fill: true,
                tension: 0.38,
                pointRadius: 0,
                pointHoverRadius: 4,
            },
        ],
    };

    const revenueMixData = {
        labels: ['Badge', 'Monetization', 'Ads wallet'],
        datasets: [
            {
                data: [
                    Number(monthlySummary.badge_revenue || 0),
                    Number(monthlySummary.monetization_revenue || 0),
                    Number(monthlySummary.ad_wallet_revenue || 0),
                ],
                backgroundColor: ['#10b981', '#a855f7', '#0ea5e9'],
                borderColor: '#08111f',
                borderWidth: 4,
                hoverOffset: 8,
            },
        ],
    };

    const monthlyLegendOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                display: true,
                position: 'bottom' as const,
            },
        },
    };

    const stackedOptions = {
        ...monthlyLegendOptions,
        scales: {
            ...chartOptions.scales,
            x: {
                ...chartOptions.scales.x,
                stacked: true,
            },
            y: {
                ...chartOptions.scales.y,
                stacked: true,
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
            },
            tooltip: chartOptions.plugins.tooltip,
        },
    };

    return (
        <>
            <Head title="Monthly Report" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Reports"
                        title="Monthly platform report"
                        description="Track onboarding, active accounts, inactive accounts, and revenue month on month."
                        actions={
                            <div className="flex flex-wrap items-center gap-3">
                                <Link href={admin.analytics.index.url()}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to analytics
                                    </Button>
                                </Link>
                                <Link href={admin.reports.financial.url()}>
                                    <Button variant="outline">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Financial reports
                                    </Button>
                                </Link>
                            </div>
                        }
                    />

                    <AdminPanel
                        title="Month by month"
                        description="The chart cards below show onboarding, current account status, active users, and revenue sources."
                        className="border-border/70 bg-card/90 shadow-sm"
                    >
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <AdminMetricCard label="Total onboarded" value={compactNumber(monthlySummary.total_onboarded)} hint="All time users tracked" icon={Users} tone="success" />
                            <AdminMetricCard label="Active accounts" value={compactNumber(monthlySummary.active_accounts)} hint="Users currently active" icon={Activity} tone="default" />
                            <AdminMetricCard label="Inactive accounts" value={compactNumber(monthlySummary.inactive_accounts)} hint="Users currently inactive" icon={Users} tone="danger" />
                            <AdminMetricCard label="Total revenue" value={formatCurrency(monthlySummary.total_revenue)} hint="Badge, monetization, and ads wallet" icon={Wallet} tone="warning" />
                        </div>

                        <div className="mt-6 grid gap-4 xl:grid-cols-2">
                            <div className="rounded-2xl border border-border/70 bg-background p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Onboarded vs cumulative users</p>
                                        <p className="text-xs text-muted-foreground">Signups and the running total by month.</p>
                                    </div>
                                    <Badge variant="outline" className="rounded-full">
                                        <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                                        Users
                                    </Badge>
                                </div>
                                <div className="mt-4 h-64">
                                    <Line options={monthlyLegendOptions} data={userTrendData} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border/70 bg-background p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Revenue mix</p>
                                        <p className="text-xs text-muted-foreground">Overall split of badge, monetization, and ad wallet revenue.</p>
                                    </div>
                                    <Badge variant="outline" className="rounded-full">
                                        <BadgeDollarSign className="mr-1.5 h-3.5 w-3.5" />
                                        Revenue
                                    </Badge>
                                </div>
                                <div className="mt-4 h-64">
                                    <Doughnut options={doughnutOptions} data={revenueMixData} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border/70 bg-background p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Active vs inactive accounts</p>
                                        <p className="text-xs text-muted-foreground">Current account status across monthly cohorts.</p>
                                    </div>
                                    <Badge variant="outline" className="rounded-full">
                                        <Users className="mr-1.5 h-3.5 w-3.5" />
                                        Status
                                    </Badge>
                                </div>
                                <div className="mt-4 h-64">
                                    <Bar options={stackedOptions} data={accountStatusData} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border/70 bg-background p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Active users by login month</p>
                                        <p className="text-xs text-muted-foreground">Users with recorded login activity and active status.</p>
                                    </div>
                                    <Badge variant="outline" className="rounded-full">
                                        <Activity className="mr-1.5 h-3.5 w-3.5" />
                                        Activity
                                    </Badge>
                                </div>
                                <div className="mt-4 h-64">
                                    <Line options={monthlyLegendOptions} data={activeUsersData} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-2xl border border-border/70">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/60">
                                        <TableHead>Month</TableHead>
                                        <TableHead>Onboarded</TableHead>
                                        <TableHead>Cumulative</TableHead>
                                        <TableHead>Active</TableHead>
                                        <TableHead>Inactive</TableHead>
                                        <TableHead>Active users</TableHead>
                                        <TableHead>Badge revenue</TableHead>
                                        <TableHead>Monetization</TableHead>
                                        <TableHead>Ads wallet</TableHead>
                                        <TableHead>Total revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {monthlyRows.length ? monthlyRows.map((row) => (
                                        <TableRow key={row.month}>
                                            <TableCell className="font-medium">{row.label}</TableCell>
                                            <TableCell>{compactNumber(row.onboarded_users)}</TableCell>
                                            <TableCell>{compactNumber(row.cumulative_users)}</TableCell>
                                            <TableCell>{compactNumber(row.active_accounts)}</TableCell>
                                            <TableCell>{compactNumber(row.inactive_accounts)}</TableCell>
                                            <TableCell>{compactNumber(row.active_users)}</TableCell>
                                            <TableCell>{formatCurrency(Number(row.badge_revenue || 0))}</TableCell>
                                            <TableCell>{formatCurrency(Number(row.monetization_revenue || 0))}</TableCell>
                                            <TableCell>{formatCurrency(Number(row.ad_wallet_revenue || 0))}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(Number(row.total_revenue || 0))}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                                                No monthly report data available yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </AdminPanel>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
