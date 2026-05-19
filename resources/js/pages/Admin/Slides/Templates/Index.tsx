import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/AdminLayout';

interface SlideTemplate {
    id: string;
    name: string;
    category: string;
    description?: string | null;
    template_format?: string | null;
    source_file_name?: string | null;
    source_file_size?: number | null;
    is_active: boolean;
    is_featured: boolean;
    is_powerpoint_template: boolean;
    created_at: string;
}

interface SlideTemplatesIndexProps {
    templates: {
        data: SlideTemplate[];
        total: number;
    };
    filters: {
        search?: string;
        format?: string;
        is_active?: string;
    };
}

export default function Index({ templates, filters }: SlideTemplatesIndexProps) {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };
    const [search, setSearch] = useState(filters.search || '');
    const [format, setFormat] = useState(filters.format || '');
    const [active, setActive] = useState(filters.is_active || '');

    const handleSearch = () => {
        router.get(route('admin.slide-templates.index'), {
            search: search || undefined,
            format: format || undefined,
            is_active: active || undefined,
        }, { preserveState: true });
    };

    const handleDelete = (template: SlideTemplate) => {
        if (confirm(`Delete "${template.name}"?`)) {
            router.delete(route('admin.slide-templates.destroy', template.id));
        }
    };

    const formatBytes = (bytes?: number | null) => {
        if (!bytes) return 'N/A';
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let unit = 0;
        while (value >= 1024 && unit < units.length - 1) {
            value /= 1024;
            unit += 1;
        }
        return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
    };

    return (
        <AdminLayout>
            <Head title="Slide Templates" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">PowerPoint Slide Templates</h1>
                        <p className="text-muted-foreground">Upload and manage real `.pptx`, `.potx`, or `.pptm` template files.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.slide-templates.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Template
                        </Link>
                    </Button>
                </div>

                {flash?.success && <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">{flash.success}</div>}
                {flash?.error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{flash.error}</div>}

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[220px]">
                                <Input
                                    placeholder="Search templates..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Select value={format || 'all'} onValueChange={(value) => setFormat(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All formats</SelectItem>
                                    <SelectItem value="pptx">PPTX</SelectItem>
                                    <SelectItem value="potx">POTX</SelectItem>
                                    <SelectItem value="pptm">PPTM</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={active || 'all'} onValueChange={(value) => setActive(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
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

                <Card>
                    <CardHeader>
                        <CardTitle>{templates.total} template{templates.total === 1 ? '' : 's'}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates.data.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell>
                                            <div className="font-medium">{template.name}</div>
                                            <div className="text-xs text-muted-foreground">{template.description || 'No description'}</div>
                                        </TableCell>
                                        <TableCell>{template.category}</TableCell>
                                        <TableCell>
                                            <div>{template.source_file_name || 'No file'}</div>
                                            <div className="text-xs text-muted-foreground">{formatBytes(template.source_file_size)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{(template.template_format || 'unknown').toUpperCase()}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                                    {template.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                {template.is_featured ? <Badge variant="outline">Featured</Badge> : null}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('admin.slide-templates.edit', template.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(template)}>
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
            </div>
        </AdminLayout>
    );
}
