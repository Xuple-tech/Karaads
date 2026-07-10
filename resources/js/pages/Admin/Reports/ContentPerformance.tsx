import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileText } from 'lucide-react';

import { AdminActionCard, AdminPage, AdminPageHeader, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

export default function ContentPerformance() {
    return (
        <>
            <Head title="Content Performance Reports" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Reports"
                        title="Content performance"
                        description="Entry points for export-oriented reporting around top content and engagement."
                        actions={
                            <Link href={admin.analytics.index.url()}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to analytics
                                </Button>
                            </Link>
                        }
                    />

                    <AdminSection title="Available reports" description="Current content reporting exports exposed in admin.">
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            <AdminActionCard title="Top posts" description="Most viewed and engaged posts." href="#" icon={FileText} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                            <AdminActionCard title="Engagement metrics" description="Likes, comments, and shares analysis." href="#" icon={FileText} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                            <AdminActionCard title="Content categories" description="Performance by content type and category." href="#" icon={FileText} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                        </div>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
