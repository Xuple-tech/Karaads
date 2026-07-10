import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Users } from 'lucide-react';

import { AdminActionCard, AdminPage, AdminPageHeader, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

export default function UserGrowth() {
    return (
        <>
            <Head title="User Growth Reports" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Reports"
                        title="User growth reports"
                        description="Analyze acquisition, active usage, and demographic growth signals."
                        actions={
                            <Link href={admin.analytics.index.url()}>
                                <Button variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to analytics
                                </Button>
                            </Link>
                        }
                    />

                    <AdminSection title="Available reports" description="Current export entry points for user growth reporting.">
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            <AdminActionCard title="New registrations" description="Daily and monthly signup statistics." href="#" icon={Users} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                            <AdminActionCard title="Active users" description="DAU and MAU reporting for engagement tracking." href="#" icon={Users} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                            <AdminActionCard title="User demographics" description="Breakdown by location, device, and age." href="#" icon={Users} meta={<Download className="h-4 w-4 text-muted-foreground" />} />
                        </div>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
