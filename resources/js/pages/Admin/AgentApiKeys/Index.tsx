import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Key, Eye, Edit, Trash2, ToggleLeft } from 'lucide-react';
import DataTable from '@/components/Admin/DataTable';
import FilterBar from '@/components/Admin/FilterBar';
import StatsCard from '@/components/Admin/StatsCard';
import { KeyRound, Calendar, Clock, Shield } from 'lucide-react';

const Index = ({ apiKeys, filters, agents }) => {
    const { auth } = usePage().props;
    const [currentFilters, setCurrentFilters] = useState(filters || {});

    const columns = [
        { key: 'name', title: 'Name' },
        { key: 'agent.name', title: 'Agent' },
        { key: 'api_key', title: 'API Key' },
        { key: 'is_active', title: 'Status', type: 'boolean' },
        { key: 'permissions', title: 'Permissions', type: 'array' },
        { key: 'last_used_at', title: 'Last Used', type: 'datetime' },
        { key: 'expires_at', title: 'Expires', type: 'date' },
        { key: 'created_at', title: 'Created', type: 'datetime' },
    ];

    const handleFilterChange = (name, value) => {
        setCurrentFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetFilters = () => {
        setCurrentFilters({});
        window.location.href = route('admin.agent-api-keys.index');
    };

    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        window.location.href = `${route('admin.agent-api-keys.index')}?${params.toString()}`;
    };

    const filterOptions = [
        {
            name: 'search',
            placeholder: 'Search API keys',
            value: currentFilters.search
        },
        {
            name: 'agent_id',
            placeholder: 'Filter by Agent',
            options: [
                { value: '', label: 'All Agents' },
                ...agents.map(agent => ({ value: agent.id, label: agent.name }))
            ]
        }
    ];

    const stats = [
        {
            title: 'Total API Keys',
            value: apiKeys.total?.toLocaleString() || 0,
            icon: KeyRound,
            description: 'All API keys',
            variant: 'primary'
        },
        {
            title: 'Active Keys',
            value: apiKeys.data.filter(key => key.is_active).length?.toLocaleString() || 0,
            icon: Shield,
            description: 'Currently active',
            variant: 'success'
        },
        {
            title: 'Expiring Soon',
            value: apiKeys.data.filter(key =>
                key.expires_at && new Date(key.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            ).length?.toLocaleString() || 0,
            icon: Calendar,
            description: 'Within 7 days',
            variant: 'default'
        },
        {
            title: 'Recently Used',
            value: apiKeys.data.filter(key =>
                key.last_used_at && new Date(key.last_used_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length?.toLocaleString() || 0,
            icon: Clock,
            description: 'Within 24 hours',
            variant: 'default'
        },
    ];

    const handleEdit = (apiKey) => {
        window.location.href = route('admin.agent-api-keys.edit', apiKey.id);
    };

    const handleShow = (apiKey) => {
        window.location.href = route('admin.agent-api-keys.show', apiKey.id);
    };

    const handleDelete = (apiKey) => {
        if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
            window.location.href = route('admin.agent-api-keys.destroy', {
                agentApiKey: apiKey.id,
                _method: 'DELETE'
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Agent API Keys" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Agent API Keys</h1>
                        <p className="text-muted-foreground">
                            Manage and monitor API keys for agents
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.agent-api-keys.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create API Key
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
                        <CardTitle>Filter API Keys</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterBar
                            filters={filterOptions}
                            onFilterChange={handleFilterChange}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                        />
                    </CardContent>
                </Card>

                {/* API Keys Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>All API Keys</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={apiKeys.data}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onShow={handleShow}
                            actions={[
                                {
                                    icon: ToggleLeft,
                                    onClick: (apiKey) => {
                                        if (confirm('Are you sure you want to revoke this API key?')) {
                                            window.location.href = route('admin.agent-api-keys.revoke', apiKey.id);
                                        }
                                    },
                                    title: 'Revoke Key',
                                    variant: 'outline',
                                    size: 'sm'
                                }
                            ]}
                            pagination={{
                                total: apiKeys.total,
                                from: apiKeys.from,
                                to: apiKeys.to,
                                currentPage: apiKeys.current_page,
                                lastPage: apiKeys.last_page,
                                prevPageUrl: apiKeys.prev_page_url,
                                nextPageUrl: apiKeys.next_page_url,
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Index;
