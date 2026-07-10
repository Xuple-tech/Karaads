import { Head, router } from '@inertiajs/react';
import { CircleCheckBig, ShieldAlert } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';

interface Report {
    id: string;
    reason: string;
    details: string | null;
    status: string;
    created_at: string;
    reporter?: { name: string };
    post?: { id: string };
    comment?: { id: string };
}

interface Props {
    reports: {
        data: Report[];
    };
}

export default function ContentReports({ reports }: Props) {
    const resolveReport = (id: string) => {
        router.post(admin.content.reports.resolve.url({ id }));
    };

    const resolvedCount = reports.data.filter((report) => report.status === 'resolved').length;

    return (
        <>
            <Head title="Content Reports" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Content"
                        title="Content reports"
                        description="Track incoming moderation reports and resolve them without leaving the admin queue."
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <AdminMetricCard label="Reports" value={reports.data.length} hint="Total reports in the current payload" icon={ShieldAlert} />
                        <AdminMetricCard label="Resolved" value={resolvedCount} hint="Reports already handled" icon={CircleCheckBig} tone="success" />
                    </div>

                    <AdminSection title="Moderation queue" description="Review reporter context, target type, and current resolution state.">
                        <AdminPanel title="Report records" description="Open and resolved reports for content moderation.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Reporter</TableHead>
                                            <TableHead>Target</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                    No reports found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            reports.data.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell>{report.reporter?.name ?? 'Unknown'}</TableCell>
                                                    <TableCell>{report.post ? `Post ${report.post.id}` : report.comment ? `Comment ${report.comment.id}` : 'Unknown'}</TableCell>
                                                    <TableCell>
                                                        <div className="max-w-sm">
                                                            <div>{report.reason}</div>
                                                            {report.details ? <div className="text-xs text-muted-foreground">{report.details}</div> : null}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="capitalize">{report.status}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button size="sm" disabled={report.status === 'resolved'} onClick={() => resolveReport(report.id)}>
                                                            Resolve
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </AdminPanel>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
