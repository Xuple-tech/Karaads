// @/Pages/Admin/Sites/Index.tsx
import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import DataTable from '@/components/Admin/DataTable';
import FilterBar from '@/components/Admin/FilterBar';
import StatsCard from '@/components/Admin/StatsCard';
import { Globe, Users, Bot, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const Index = ({
    sites,
    users,
    siteTypes}) => {
    const { auth } = usePage().props;

    const columns = [
        { key: 'name', title: 'Name' },
        { key: 'domain', title: 'Domain' },
        { key: 'user.name', title: 'Owner' },
        { key: 'site_type', title: 'Type', type: 'badge' },
        { key: 'current_agents_count', title: 'Agents', type: 'number' },
        { key: 'is_active', title: 'Active', type: 'boolean' },
        { key: 'widget_enabled', title: 'Widget', type: 'boolean' },
        { key: 'verified_at', title: 'Verified', type: 'datetime' },
        { key: 'created_at', title: 'Created', type: 'datetime' },
    ];

    const filterOptions = [
        {
            name: 'user_id',
            placeholder: 'Filter by Owner',
            options: [{ value: '', label: 'All Owners' }, ...users.map(u => ({ value: u.id, label: u.name }))]
        },
        {
            name: 'site_type',
            placeholder: 'Filter by Type',
            options: [{ value: '', label: 'All Types' }, ...siteTypes.map(t => ({ value: t, label: t }))]
        },
        {
            name: 'is_active',
            placeholder: 'Filter by Status',
            options: [
                { value: '', label: 'All Status' },
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' }
            ]
        },
        {
            name: 'widget_enabled',
            placeholder: 'Filter by Widget',
            options: [
                { value: '', label: 'All' },
                { value: 'true', label: 'Widget Enabled' },
                { value: 'false', label: 'Widget Disabled' }
            ]
        }
    ];

    const stats = [
        {
            title: 'Total Sites',
            value: sites.total,
            icon: Globe,
            description: 'All sites registered',
            variant: 'primary'
        },
        {
            title: 'Active Sites',
            value: sites.data.filter(s => s.is_active).length,
            icon: CheckCircle,
            description: 'Currently active',
            variant: 'success'
        },
        {
            title: 'Widget Enabled',
            value: sites.data.filter(s => s.widget_enabled).length,
            icon: Globe,
            description: 'With widget installed',
            variant: 'default'
        },
        {
            title: 'Verified Sites',
            value: sites.data.filter(s => s.verified_at).length,
            icon: CheckCircle,
            description: 'Successfully verified',
            variant: 'default'
        },
    ];

    const handleEdit = (site) => {
        window.location.href = route('admin.sites.edit', site.id);
    };

    const handleShow = (site) => {
        window.location.href = route('admin.sites.show', site.id);
    };

    const handleDelete = (site) => {
        if (confirm('Are you sure you want to delete this site?')) {
            window.location.href = route('admin.sites.destroy', {
                site: site.id,
                _method: 'DELETE'
            });
        }
    };

    const handleToggleStatus = (site, e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to ${site.is_active ? 'deactivate' : 'activate'} this site?`)) {
            window.location.href = route('admin.sites.toggle-status', site.id);
        }
    };

    const handleToggleWidget = (site, e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to ${site.widget_enabled ? 'disable' : 'enable'} the widget for this site?`)) {
            window.location.href = route('admin.sites.toggle-widget', site.id);
        }
    };

    const handleVerify = (site, e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to verify this site?')) {
            window.location.href = route('admin.sites.verify', site.id);
        }
    };

    return (
        <AdminLayout>
            <Head title="Sites" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
                        <p className="text-muted-foreground">
                            Manage and monitor all sites on the platform
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.sites.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Site
                        </Link>
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <StatsCard key={index} {...stat} />
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Sites</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterBar
                            filters={filterOptions}
                            onReset={() => window.location.href = route('admin.sites.index')}
                        />
                    </CardContent>
                </Card>

                {/* Sites Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>All Sites</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={sites.data}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onShow={handleShow}
                            additionalActions={(site) => [
                                {
                                    label: site.is_active ? 'Deactivate' : 'Activate',
                                    onClick: (e) => handleToggleStatus(site, e),
                                    variant: 'outline'
                                },
                                {
                                    label: site.widget_enabled ? 'Disable Widget' : 'Enable Widget',
                                    onClick: (e) => handleToggleWidget(site, e),
                                    variant: 'outline'
                                },
                                ...(!site.verified_at ? [{
                                    label: 'Verify',
                                    onClick: (e) => handleVerify(site, e),
                                    variant: 'success'
                                }] : [])
                            ]}
                            pagination={{
                                total: sites.total,
                                from: sites.from,
                                to: sites.to,
                                currentPage: sites.current_page,
                                lastPage: sites.last_page,
                                prevPageUrl: sites.prev_page_url,
                                nextPageUrl: sites.next_page_url,
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Index;
