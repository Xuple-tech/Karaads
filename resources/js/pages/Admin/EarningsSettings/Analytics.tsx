import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    stats: {
        total_distributed: number;
        active_earners: number;
        today_distributed: number;
        avg_earnings_per_user: number;
    };
}

export default function EarningsSettingsAnalytics({ stats }: Props) {
    return (
        <>
            <Head title="Earnings Settings Analytics" />
            <AdminLayout>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Earnings Settings Analytics</h1>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card><CardHeader><CardTitle>Total Distributed</CardTitle></CardHeader><CardContent>{Number(stats.total_distributed).toFixed(2)}</CardContent></Card>
                        <Card><CardHeader><CardTitle>Active Earners</CardTitle></CardHeader><CardContent>{stats.active_earners}</CardContent></Card>
                        <Card><CardHeader><CardTitle>Today Distributed</CardTitle></CardHeader><CardContent>{Number(stats.today_distributed).toFixed(2)}</CardContent></Card>
                        <Card><CardHeader><CardTitle>Avg Per User</CardTitle></CardHeader><CardContent>{Number(stats.avg_earnings_per_user).toFixed(2)}</CardContent></Card>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
