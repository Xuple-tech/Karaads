// @/Pages/Admin/AgentWidgetSettings/Index.tsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Eye, Edit, Trash2, Smartphone, Monitor, Globe } from 'lucide-react';
import DataTable from '@/components/Admin/DataTable';
import FilterBar from '@/components/Admin/FilterBar';
import StatsCard from '@/components/Admin/StatsCard';

const Index = ({
    widgetSettings,
    filters: initialFilters,
    agents
}) => {
    const columns = [
        { key: 'agent.name', title: 'Agent' },
        { key: 'injection_method', title: 'Injection', type: 'badge' },
        { key: 'trigger_method', title: 'Trigger', type: 'badge' },
        {
            key: 'device_support',
            title: 'Devices',
            render: (item) => (
                <div className="flex items-center space-x-1">
                    {item.show_on_mobile && <Smartphone className="h-4 w-4 text-green-500" />}
                    {item.show_on_desktop && <Monitor className="h-4 w-4 text-blue-500" />}
                </div>
            )
        },
        { key: 'created_at', title: 'Created', type: 'datetime' },
    ];

    const filterOptions = [
        {
            name: 'agent_id',
            placeholder: 'Filter by Agent',
            options: [{ value: '', label: 'All Agents' }, ...agents.map(a => ({ value: a.id, label: a.name }))]
        },
        {
            name: 'injection_method',
            placeholder: 'Filter by Injection',
            options: [
                { value: '', label: 'All Methods' },
                { value: 'manual', label: 'Manual' },
                { value: 'auto_inject', label: 'Auto Inject' }
            ]
        },
    ];

    const stats = [
        {
            title: 'Total Widgets',
            value: widgetSettings.total,
            icon: Globe,
            description: 'Widget configurations',
            variant: 'primary'
        },
        {
            title: 'Auto Inject',
            value: widgetSettings.data.filter(w => w.injection_method === 'auto_inject').length,
            icon: Code,
            description: 'Auto-injected widgets',
            variant: 'success'
        },
        {
            title: 'Mobile Support',
            value: widgetSettings.data.filter(w => w.show_on_mobile).length,
            icon: Smartphone,
            description: 'Show on mobile',
            variant: 'default'
        },
        {
            title: 'Desktop Support',
            value: widgetSettings.data.filter(w => w.show_on_desktop).length,
            icon: Monitor,
            description: 'Show on desktop',
            variant: 'default'
        },
    ];

    const handleEdit = (setting) => {
        router.visit(route('admin.agent-widget-settings.edit', setting.id));
    };

    const handleShow = (setting) => {
        router.visit(route('admin.agent-widget-settings.show', setting.id));
    };

    const handleDelete = (setting) => {
        if (confirm('Are you sure you want to delete these widget settings?')) {
            router.delete(route('admin.agent-widget-settings.destroy', setting.id));
        }
    };

    const handleGetScript = (setting, e) => {
        e.stopPropagation();
        window.open(route('admin.agent-widget-settings.script', setting.id), '_blank');
    };

    const handlePreview = (setting, e) => {
        e.stopPropagation();
        router.visit(route('admin.agent-widget-settings.preview', setting.id));
    };

    return (
        <AdminLayout>
            <Head title="Widget Settings" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Widget Settings</h1>
                        <p className="text-muted-foreground">
                            Configure how AI agent widgets appear on websites
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.agent-widget-settings.create')}>
                            <Code className="h-4 w-4 mr-2" />
                            Create Widget Settings
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
                        <CardTitle>Filter Widget Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterBar
                            filters={filterOptions}
                            onReset={() => router.visit(route('admin.agent-widget-settings.index'))}
                        />
                    </CardContent>
                </Card>

                {/* Widget Settings Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>All Widget Settings</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={widgetSettings.data}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onShow={handleShow}
                            additionalActions={(setting) => [
                                {
                                    label: 'Get Script',
                                    onClick: (e) => handleGetScript(setting, e),
                                    variant: 'outline'
                                },
                                {
                                    label: 'Preview',
                                    onClick: (e) => handlePreview(setting, e),
                                    variant: 'outline'
                                }
                            ]}
                            pagination={{
                                total: widgetSettings.total,
                                from: widgetSettings.from,
                                to: widgetSettings.to,
                                currentPage: widgetSettings.current_page,
                                lastPage: widgetSettings.last_page,
                                prevPageUrl: widgetSettings.prev_page_url,
                                nextPageUrl: widgetSettings.next_page_url,
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Index;
