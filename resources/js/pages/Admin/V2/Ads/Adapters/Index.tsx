import { Head } from '@inertiajs/react';
import { PlugZap, Rows3, ShieldCheck } from 'lucide-react';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface Adapter {
    id: string;
    name: string;
    provider_key: string;
    adapter_type: string;
    status: string;
    created_at: string;
}

export default function Index({ adapters }: { adapters: { data: Adapter[] } }) {
    const activeCount = adapters.data.filter((adapter) => adapter.status === 'active').length;

    return (
        <>
            <Head title="V2 Adapters" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Ads V2"
                        title="Provider adapters"
                        description="Operational view of configured ad provider adapters and their current status."
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard label="Adapters" value={adapters.data.length} hint="Configured provider adapters" icon={Rows3} />
                        <AdminMetricCard label="Active" value={activeCount} hint="Adapters currently active" icon={ShieldCheck} tone="success" />
                        <AdminMetricCard label="Providers" value={new Set(adapters.data.map((adapter) => adapter.provider_key)).size} hint="Unique provider keys in use" icon={PlugZap} />
                    </div>

                    <AdminSection title="Adapter registry" description="Review adapter identity, provider mapping, and current lifecycle status.">
                        <AdminPanel title="Provider adapters" description="This table reflects the current adapter registry returned by the backend.">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Provider key</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {adapters.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                                                    No adapters.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            adapters.data.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="font-medium">{row.name}</TableCell>
                                                    <TableCell>{row.provider_key}</TableCell>
                                                    <TableCell>{row.adapter_type}</TableCell>
                                                    <TableCell className="capitalize">{row.status}</TableCell>
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
