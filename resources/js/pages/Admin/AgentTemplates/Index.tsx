import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import DataTable from '@/components/Admin/DataTable';
import FilterBar from '@/components/Admin/FilterBar';
import StatsCard from '@/components/Admin/StatsCard';
import { Bot, DollarSign, Eye, Edit, Trash2, ToggleLeft } from 'lucide-react';

const Index = ({ templates }) => {
    const { auth } = usePage().props;

    const columns = [
        { key: 'name', title: 'Name' },
        { key: 'category', title: 'Category', type: 'badge' },
        { key: 'industry', title: 'Industry', type: 'badge' },
        { key: 'agents_count', title: 'Agents Count' },
        { key: 'is_premium', title: 'Premium', type: 'boolean' },
        { key: 'is_active', title: 'Status', type: 'boolean' },
        { key: 'price', title: 'Price', type: 'currency' },
        { key: 'created_at', title: 'Created', type: 'datetime' },
    ];

    const handleEdit = (template) => {
        window.location.href = route('admin.agent-templates.edit', template.id);
    };

    const handleShow = (template) => {
        window.location.href = route('admin.agent-templates.show', template.id);
    };

    const handleDelete = (template) => {
        if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            window.location.href = route('admin.agent-templates.destroy', {
                agentTemplate: template.id,
                _method: 'DELETE'
            });
        }
    };

    const handleToggleStatus = (template) => {
        window.location.href = route('admin.agent-templates.toggle-status', template.id);
    };

    const stats = [
        {
            title: 'Total Templates',
            value: templates.total,
            icon: Bot,
            description: 'Across all categories',
            variant: 'primary'
        },
        {
            title: 'Active Templates',
            value: templates.data.filter(t => t.is_active).length,
            icon: Bot,
            description: 'Currently active',
            variant: 'success'
        },
        {
            title: 'Premium Templates',
            value: templates.data.filter(t => t.is_premium).length,
            icon: DollarSign,
            description: 'Premium templates',
            variant: 'default'
        },
        {
            title: 'Total Agents',
            value: templates.data.reduce((sum, template) => sum + template.agents_count, 0),
            icon: Bot,
            description: 'Using templates',
            variant: 'default'
        },
    ];

    return (
        <AdminLayout>
            <Head title="Agent Templates" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Agent Templates</h1>
                        <p className="text-muted-foreground">
                            Manage and organize agent templates for different use cases
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.agent-templates.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Template
                        </Link>
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <StatsCard key={index} {...stat} />
                    ))}
                </div>

                {/* Templates Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>All Templates</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={templates.data}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onShow={handleShow}
                            actions={[
                                {
                                    icon: ToggleLeft,
                                    onClick: handleToggleStatus,
                                    title: 'Toggle Status',
                                    variant: 'outline',
                                    size: 'sm'
                                }
                            ]}
                            pagination={{
                                total: templates.total,
                                from: templates.from,
                                to: templates.to,
                                currentPage: templates.current_page,
                                lastPage: templates.last_page,
                                prevPageUrl: templates.prev_page_url,
                                nextPageUrl: templates.next_page_url,
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Index;
