import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Activity } from 'lucide-react';
import admin from '@/routes/admin';

export default function RealTime() {
    return (
        <>
            <Head title="Real-Time Analytics" />
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href={admin.analytics.index.url()}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Real-Time Analytics</h1>
                            <p className="text-muted-foreground">Live platform activity</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Coming Soon</CardTitle>
                            <CardDescription>This feature is currently under development.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Activity className="h-16 w-16 mb-4 opacity-20" />
                            <p>Real-time analytics dashboard will be available in a future update.</p>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        </>
    );
}
