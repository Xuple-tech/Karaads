import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart3 } from 'lucide-react';
import DataTable from '@/components/Admin/DataTable';
import FilterBar from '@/components/Admin/FilterBar';
import StatsCard from '@/components/Admin/StatsCard';
import { MessageSquare, User, Clock, Star, TrendingUp } from 'lucide-react';

const Index = ({ stats, summary, filters, agents }) => {
    const { auth } = usePage().props;
    const [currentFilters, setCurrentFilters] = useState(filters || {});

    const columns = [
        { key: 'date', title: 'Date', type: 'date' },
        { key: 'agent.name', title: 'Agent' },
        { key: 'conversations_count', title: 'Conversations' },
        { key: 'messages_count', title: 'Messages' },
        { key: 'users_count', title: 'Users' },
        { key: 'avg_response_time', title: 'Avg Response Time', type: 'number', suffix: 's' },
        { key: 'satisfaction_score', title: 'Satisfaction', type: 'rating' },
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
        window.location.href = route('admin.agent-usage-stats.index');
    };

    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                params.append(key, value);
            }
        });
        window.location.href = `${route('admin.agent-usage-stats.index')}?${params.toString()}`;
    };

    const filterOptions = [
        {
            name: 'agent_id',
            placeholder: 'Filter by Agent',
            options: [
                { value: '', label: 'All Agents' },
                ...agents.map(agent => ({ value: agent.id, label: agent.name }))
            ]
        },
        {
            name: 'date_from',
            placeholder: 'From Date',
            type: 'date',
            value: currentFilters.date_from
        },
        {
            name: 'date_to',
            placeholder: 'To Date',
            type: 'date',
            value: currentFilters.date_to
        },
        {
            name: 'min_conversations',
            placeholder: 'Min Conversations',
            type: 'number',
            value: currentFilters.min_conversations
        },
        {
            name: 'min_satisfaction',
            placeholder: 'Min Satisfaction',
            type: 'number',
            step: 0.1,
            min: 0,
            max: 5,
            value: currentFilters.min_satisfaction
        }
    ];

    const statsCards = [
        {
            title: 'Total Conversations',
            value: summary.total_conversations?.toLocaleString() || 0,
            icon: MessageSquare,
            description: 'Across all agents',
            variant: 'primary'
        },
        {
            title: 'Total Messages',
            value: summary.total_messages?.toLocaleString() || 0,
            icon: MessageSquare,
            description: 'Total messages sent',
            variant: 'default'
        },
        {
            title: 'Total Users',
            value: summary.total_users?.toLocaleString() || 0,
            icon: User,
            description: 'Unique users',
            variant: 'success'
        },
        {
            title: 'Avg Satisfaction',
            value: summary.avg_satisfaction ? summary.avg_satisfaction.toFixed(2) : 0,
            icon: Star,
            description: 'Average rating',
            variant: 'default'
        },
    ];

    const handleEdit = (stat) => {
        window.location.href = route('admin.agent-usage-stats.edit', stat.id);
    };

    const handleShow = (stat) => {
        window.location.href = route('admin.agent-usage-stats.show', stat.id);
    };

    const handleDelete = (stat) => {
        if (confirm('Are you sure you want to delete this usage statistic?')) {
            window.location.href = route('admin.agent-usage-stats.destroy', {
                agentUsageStat: stat.id,
                _method: 'DELETE'
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Agent Usage Statistics" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Agent Usage Statistics</h1>
                        <p className="text-muted-foreground">
                            Track and analyze agent performance and usage patterns
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.agent-usage-stats.report')}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Generate Report
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('admin.agent-usage-stats.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Stats
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((stat, index) => (
                        <StatsCard key={index} {...stat} />
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Statistics</CardTitle>
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

                {/* Stats Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>All Usage Statistics</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={stats.data}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onShow={handleShow}
                            pagination={{
                                total: stats.total,
                                from: stats.from,
                                to: stats.to,
                                currentPage: stats.current_page,
                                lastPage: stats.last_page,
                                prevPageUrl: stats.prev_page_url,
                                nextPageUrl: stats.next_page_url,
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Index;
