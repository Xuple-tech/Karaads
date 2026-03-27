import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import DataTable from '@/components/Admin/DataTable';
import FilterBar from '@/components/Admin/FilterBar';
import StatsCard from '@/components/Admin/StatsCard';
import { Users, MessageSquare, Bot, Globe } from 'lucide-react';

const Index = ({
    agents,
    filters: initialFilters,
    users,
    sites,
    agentTypes,
    widgetPositions
}) => {
    const { auth } = usePage().props;

    const columns = [
        { key: 'name', title: 'Name' },
        { key: 'user.name', title: 'Owner' },
        { key: 'site.name', title: 'Site' },
        { key: 'agent_type', title: 'Type', type: 'badge' },
        { key: 'is_active', title: 'Status', type: 'boolean' },
        { key: 'created_at', title: 'Created', type: 'datetime' },
    ];

    const filterOptions = [
        {
            name: 'user_id',
            placeholder: 'Filter by Owner',
            options: [{ value: '', label: 'All Owners' }, ...users.map(u => ({ value: u.id, label: u.name }))]
        },
        {
            name: 'site_id',
            placeholder: 'Filter by Site',
            options: [{ value: '', label: 'All Sites' }, ...sites.map(s => ({ value: s.id, label: s.name }))]
        },
        {
            name: 'agent_type',
            placeholder: 'Filter by Type',
            options: [{ value: '', label: 'All Types' }, ...agentTypes.map(t => ({ value: t, label: t }))]
        },
        {
            name: 'is_active',
            placeholder: 'Filter by Status',
            options: [
                { value: '', label: 'All Status' },
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' }
            ]
        }
    ];

    const stats = [
        {
            title: 'Total Agents',
            value: agents.total,
            icon: Bot,
            description: 'Across all sites',
            variant: 'primary'
        },
        {
            title: 'Active Agents',
            value: agents.data.filter(a => a.is_active).length,
            icon: Bot,
            description: 'Currently active',
            variant: 'success'
        },
        {
            title: 'Total Owners',
            value: new Set(agents.data.map(a => a.user_id)).size,
            icon: Users,
            description: 'Unique users',
            variant: 'default'
        },
        {
            title: 'Total Sites',
            value: new Set(agents.data.filter(a => a.site_id).map(a => a.site_id)).size,
            icon: Globe,
            description: 'With agents deployed',
            variant: 'default'
        },
    ];

    const handleEdit = (agent) => {
        window.location.href = route('admin.ai-agents.edit', agent.id);
    };

    const handleShow = (agent) => {
        window.location.href = route('admin.ai-agents.show', agent.id);
    };

    const handleDelete = (agent) => {
        if (confirm('Are you sure you want to delete this agent?')) {
            window.location.href = route('admin.ai-agents.destroy', {
                ai_agent: agent.id,
                _method: 'DELETE'
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="AI Agents" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
                        <p className="text-muted-foreground">
                            Manage and monitor all AI agents across the platform
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.ai-agents.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Agent
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
                        <CardTitle>Filter Agents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterBar
                            filters={filterOptions}
                            onReset={() => window.location.href = route('admin.ai-agents.index')}
                        />
                    </CardContent>
                </Card>

                {/* Agents Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>All Agents</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={agents.data}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onShow={handleShow}
                            pagination={{
                                total: agents.total,
                                from: agents.from,
                                to: agents.to,
                                currentPage: agents.current_page,
                                lastPage: agents.last_page,
                                prevPageUrl: agents.prev_page_url,
                                nextPageUrl: agents.next_page_url,
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Index;
