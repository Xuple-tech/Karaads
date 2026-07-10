import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, Download } from 'lucide-react';

import { AdminActionCard, AdminPage, AdminPageHeader, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

export default function AdPerformance() {
    return (
        <>
            <Head title="Creative Performance Reports" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Reports"
                        title="Creative performance"
                        description="Export-oriented reporting entry points for campaign and creative effectiveness."
                        actions={
                            <Link href={admin.analytics.index.url()}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to analytics
                                </Button>
                            </Link>
                        }
                    />

                    <AdminSection title="Available reports" description="Current ad and creative reporting exports available in admin.">
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            <AdminActionCard title="Campaign summary" description="Overview of all ad campaigns." href="#" icon={Activity} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                            <AdminActionCard title="Conversion rates" description="Click-through and conversion analysis." href="#" icon={Activity} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                            <AdminActionCard title="Revenue by placement" description="Earnings breakdown by placement." href="#" icon={Activity} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                        </div>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
