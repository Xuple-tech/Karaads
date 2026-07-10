import { Head } from '@inertiajs/react';
import { LayoutGrid, Rows3, ShieldCheck } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface Placement {
    id: string;
    name: string;
    surface: string;
    slot: string;
    source_type: string;
    status: boolean;
}

export default function Index({ placements }: { placements: { data: Placement[] } }) {
    const activeCount = placements.data.filter((placement) => placement.status).length;

    return (
        <>
            <Head title="V2 Placements" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Ads V2"
                        title="Ad placements"
                        description="Review configured ad placements across surfaces, slots, and source types."
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard label="Placements" value={placements.data.length} hint="Configured ad placements" icon={Rows3} />
                        <AdminMetricCard label="Active" value={activeCount} hint="Placements currently enabled" icon={ShieldCheck} tone="success" />
                        <AdminMetricCard label="Surfaces" value={new Set(placements.data.map((placement) => placement.surface)).size} hint="Unique placement surfaces" icon={LayoutGrid} />
                    </div>

                    <AdminSection title="Placement registry" description="Inspect the surface, slot, source, and activation state for each placement.">
                        <AdminPanel title="Ad placements" description="Current placement definitions returned by the backend.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Surface</TableHead>
                                            <TableHead>Slot</TableHead>
                                            <TableHead>Source</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {placements.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                    No placements.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            placements.data.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="font-medium">{row.name}</TableCell>
                                                    <TableCell>{row.surface}</TableCell>
                                                    <TableCell>{row.slot}</TableCell>
                                                    <TableCell>{row.source_type}</TableCell>
                                                    <TableCell>{row.status ? 'Active' : 'Inactive'}</TableCell>
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
