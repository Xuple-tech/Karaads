import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Download, FileText } from 'lucide-react';

import { AdminActionCard, AdminPage, AdminPageHeader, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

export default function Financial() {
    return (
        <>
            <Head title="Financial Reports" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Reports"
                        title="Financial reports"
                        description="Generate and download platform financial statements and payout summaries."
                        actions={
                            <Link href={admin.analytics.index.url()}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to analytics
                                </Button>
                            </Link>
                        }
                    />

                    <AdminSection title="Available reports" description="Current financial report entry points for export-oriented workflows.">
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            <AdminActionCard title="Monthly revenue" description="Detailed breakdown of monthly onboarding, revenue, and active accounts." href={admin.reports.monthly.url()} icon={BarChart3} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                            <AdminActionCard title="Payout history" description="Record of all processed withdrawals." href="#" icon={FileText} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                            <AdminActionCard title="Tax summary" description="Annual tax report for platform earnings." href="#" icon={FileText} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                        </div>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
