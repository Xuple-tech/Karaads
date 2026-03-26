// @/Pages/Admin/AgentKnowledgeBases/Index.tsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '@/components/Admin/DataTable';
import FilterBar from '@/components/Admin/FilterBar';
import BulkActions from '@/components/Admin/BulkActions';

const Index = ({
    knowledgeBases,
    filters: initialFilters,
    agents,
    contentTypes
}) => {
    const [selectedItems, setSelectedItems] = useState([]);

    const columns = [
        { key: 'title', title: 'Title' },
        { key: 'agent.name', title: 'Agent' },
        { key: 'content_type', title: 'Type', type: 'badge' },
        { key: 'is_active', title: 'Status', type: 'boolean' },
        { key: 'order', title: 'Order', type: 'number' },
        { key: 'created_at', title: 'Created', type: 'datetime' },
    ];

    const filterOptions = [
        {
            name: 'agent_id',
            placeholder: 'Filter by Agent',
            options: [{ value: '', label: 'All Agents' }, ...agents.map(a => ({ value: a.id, label: a.name }))]
        },
        {
            name: 'content_type',
            placeholder: 'Filter by Type',
            options: [{ value: '', label: 'All Types' }, ...contentTypes.map(t => ({ value: t, label: t }))]
        },
    ];

    const handleEdit = (item) => {
        router.visit(route('admin.agent-knowledge-bases.edit', item.id));
    };

    const handleShow = (item) => {
        router.visit(route('admin.agent-knowledge-bases.show', item.id));
    };

    const handleDelete = (item) => {
        if (confirm('Are you sure you want to delete this knowledge base item?')) {
            router.delete(route('admin.agent-knowledge-bases.destroy', item.id));
        }
    };

    const handleToggleStatus = (item, e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to ${item.is_active ? 'deactivate' : 'activate'} this item?`)) {
            router.post(route('admin.agent-knowledge-bases.toggle-status', item.id));
        }
    };

    const handleBulkAction = (action) => {
        if (selectedItems.length === 0) {
            alert('Please select items first');
            return;
        }

        const message = {
            activate: 'Are you sure you want to activate the selected items?',
            deactivate: 'Are you sure you want to deactivate the selected items?',
            delete: 'Are you sure you want to delete the selected items?'
        }[action];

        if (confirm(message)) {
            router.post(route('admin.agent-knowledge-bases.bulk-action'), {
                ids: selectedItems,
                action: action
            });
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(knowledgeBases.data.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    const additionalColumns = [
        {
            key: 'select',
            title: '',
            render: (item) => (
                <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleSelectItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                />
            )
        }
    ];

    return (
        <AdminLayout>
            <Head title="Knowledge Base" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                        <p className="text-muted-foreground">
                            Manage knowledge base items for AI agents
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.agent-knowledge-bases.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Knowledge Item
                        </Link>
                    </Button>
                </div>

                {/* Bulk Actions */}
                {selectedItems.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <BulkActions
                                    onActivate={() => handleBulkAction('activate')}
                                    onDeactivate={() => handleBulkAction('deactivate')}
                                    onDelete={() => handleBulkAction('delete')}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Knowledge Base</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterBar
                            filters={filterOptions}
                            onReset={() => router.visit(route('admin.agent-knowledge-bases.index'))}
                        />
                    </CardContent>
                </Card>

                {/* Knowledge Base Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Knowledge Base Items</CardTitle>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all"
                                    checked={selectedItems.length === knowledgeBases.data.length && knowledgeBases.data.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label htmlFor="select-all" className="text-sm text-muted-foreground">
                                    Select all
                                </label>
                            </div>
                            <Button variant="outline" size="sm">
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={additionalColumns.concat(columns)}
                            data={knowledgeBases.data}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onShow={handleShow}
                            additionalActions={(item) => [
                                {
                                    label: item.is_active ? 'Deactivate' : 'Activate',
                                    onClick: (e) => handleToggleStatus(item, e),
                                    variant: 'outline'
                                }
                            ]}
                            pagination={{
                                total: knowledgeBases.total,
                                from: knowledgeBases.from,
                                to: knowledgeBases.to,
                                currentPage: knowledgeBases.current_page,
                                lastPage: knowledgeBases.last_page,
                                prevPageUrl: knowledgeBases.prev_page_url,
                                nextPageUrl: knowledgeBases.next_page_url,
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Index;
