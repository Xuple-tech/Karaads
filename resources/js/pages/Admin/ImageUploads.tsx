import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Download, Filter, Search } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface ImageUpload {
    id: number;
    file_name: string;
    file_type: string;
    file_size: string;
    file_path: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    conversation_id: number;
    chat_id: number;
}

interface Props {
    imageUploads: {
        data: ImageUpload[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        user_id?: string;
        date_from?: string;
        date_to?: string;
        file_type?: string;
    };
}

export default function ImageUploads({ imageUploads, filters }: Props) {
    const [currentFilters, setCurrentFilters] = useState(filters);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        setCurrentFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        router.get(route('admin.image-uploads'), currentFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setCurrentFilters({});
        router.get(route('admin.image-uploads'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = async (id: number, fileName: string) => {
        if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await router.delete(route('admin.image-uploads.delete', id), {
                onSuccess: () => {
                    toast.success('Image deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete image');
                }
            });
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to delete image');
        }
    };

    const handleViewImage = (filePath: string) => {
        window.open(filePath, '_blank');
    };

    const handleDownload = (filePath: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = filePath;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFileTypeBadgeColor = (fileType: string) => {
        if (fileType?.startsWith('image/')) return 'bg-blue-100 text-blue-800';
        if (fileType?.startsWith('video/')) return 'bg-red-100 text-red-800';
        if (fileType?.startsWith('audio/')) return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Image Uploads</h1>
                        <p className="text-gray-500 mt-1">Manage user uploaded images and files</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="user_id">User ID</Label>
                                    <Input
                                        id="user_id"
                                        type="number"
                                        value={currentFilters.user_id || ''}
                                        onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                        placeholder="Filter by user ID"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="date_from">Date From</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={currentFilters.date_from || ''}
                                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="date_to">Date To</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={currentFilters.date_to || ''}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="file_type">File Type</Label>
                                    <Select
                                        value={currentFilters.file_type || ''}
                                        onValueChange={(value) => handleFilterChange('file_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select file type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All types</SelectItem>
                                            <SelectItem value="image">Images</SelectItem>
                                            <SelectItem value="video">Videos</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={applyFilters}>
                                    Apply Filters
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{imageUploads.total}</div>
                            <p className="text-xs text-muted-foreground">Total Uploads</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{imageUploads.data.filter(u => u.file_type?.startsWith('image/')).length}</div>
                            <p className="text-xs text-muted-foreground">Images</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{imageUploads.data.filter(u => u.file_type?.startsWith('video/')).length}</div>
                            <p className="text-xs text-muted-foreground">Videos</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{imageUploads.data.filter(u => !u.user).length}</div>
                            <p className="text-xs text-muted-foreground">Orphaned Files</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Uploads Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Uploads</CardTitle>
                        <CardDescription>
                            Showing {imageUploads.data.length} of {imageUploads.total} uploads
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {imageUploads.data.map((upload) => (
                                    <TableRow key={upload.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {upload.file_type?.startsWith('image/') && (
                                                    <img
                                                        src={upload.file_path}
                                                        alt={upload.file_name}
                                                        className="w-10 h-10 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium">{upload.file_name}</div>
                                                    <div className="text-sm text-gray-500">ID: {upload.id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getFileTypeBadgeColor(upload.file_type)}>
                                                {upload.file_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{upload.file_size}</TableCell>
                                        <TableCell>
                                            {upload.user ? (
                                                <div>
                                                    <div className="font-medium">{upload.user.name}</div>
                                                    <div className="text-sm text-gray-500">{upload.user.email}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Unknown</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{upload.created_at}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewImage(upload.file_path)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(upload.file_path, upload.file_name)}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(upload.id, upload.file_name)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {imageUploads.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-500">
                                    Showing page {imageUploads.current_page} of {imageUploads.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {imageUploads.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.get(route('admin.image-uploads'), {
                                                ...currentFilters,
                                                page: imageUploads.current_page - 1
                                            })}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {imageUploads.current_page < imageUploads.last_page && (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.get(route('admin.image-uploads'), {
                                                ...currentFilters,
                                                page: imageUploads.current_page + 1
                                            })}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
