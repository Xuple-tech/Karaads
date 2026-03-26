import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, Eye, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/AdminLayout';

interface Prompt {
    id: string;
    name: string;
    description: string;
    category: string;
    usage_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface PromptsIndexProps {
    prompts: {
        data: Prompt[];
        links: any[];
        // meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        // };
    };
    filters: {
        search?: string;
        category?: string;
        is_active?: string;
    };
}

export default function Index({ prompts, filters }: PromptsIndexProps) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [activeFilter, setActiveFilter] = useState(filters.is_active || '');

    const handleSearch = () => {
        router.get(route('admin.prompts.index'), {
            search: search || undefined,
            category: categoryFilter || undefined,
            is_active: activeFilter || undefined,
        }, {
            preserveState: true,
        });
    };

    const handleDelete = (prompt: Prompt) => {
        if (confirm(`Are you sure you want to delete "${prompt.name}"?`)) {
            router.delete(route('admin.prompts.destroy', prompt.id));
        }
    };

    const handleTest = (prompt: Prompt) => {
        router.post(route('admin.prompts.test', prompt.id));
    };

    return (
        <AdminLayout>
            <Head title="AI Prompt Templates" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Prompt Templates</h1>
                        <p className="text-muted-foreground">
                            Manage system-wide AI prompt templates
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.prompts.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Prompt
                        </Link>
                    </Button>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="text-sm text-green-700">{flash.success}</div>
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{flash.error}</div>
                    </div>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search prompts..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem >All Categories</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="coding">Coding</SelectItem>
                                    <SelectItem value="writing">Writing</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={activeFilter} onValueChange={setActiveFilter}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem >All</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Prompts Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prompts.data.map((prompt) => (
                                    <TableRow key={prompt.id}>
                                        <TableCell className="font-medium">
                                            {prompt.name}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {prompt.description}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {prompt.category || 'Uncategorized'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {prompt.usage_count}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={prompt.is_active ? 'default' : 'secondary'}>
                                                {prompt.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={route('admin.prompts.show', prompt.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={route('admin.prompts.edit', prompt.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleTest(prompt)}
                                                >
                                                    <TestTube className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(prompt)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {prompts.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {prompts.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    asChild={!link.url ? {} : undefined}
                                    onClick={link.url ? () => router.get(link.url) : undefined}
                                    disabled={!link.url}
                                >
                                    {link.label.includes('&laquo;') ? '« Previous' :
                                        link.label.includes('&raquo;') ? 'Next »' :
                                            link.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
