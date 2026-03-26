import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Eye, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface AIMode {
    id: number;
    name: string;
    description: string;
    emoji: string;
    system_prompt: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    modes: AIMode[];
}

export default function Index({ modes }: Props) {
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const handleToggleStatus = async (mode: AIMode) => {
        setTogglingId(mode.id);

        try {
            await router.patch(route('admin.ai-modes.toggle', mode.id), {}, {
                onSuccess: () => {
                    toast.success(`Mode ${mode.is_active ? 'deactivated' : 'activated'} successfully`);
                },
                onError: () => {
                    toast.error('Failed to toggle mode status');
                },
                onFinish: () => {
                    setTogglingId(null);
                }
            });
        } catch (error) {
            console.error('Error toggling mode:', error);
            toast.error('Failed to toggle mode status');
            setTogglingId(null);
        }
    };

    const handleDelete = async (mode: AIMode) => {
        if (!confirm(`Are you sure you want to delete "${mode.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await router.delete(route('admin.ai-modes.destroy', mode.id), {
                onSuccess: () => {
                    toast.success('Mode deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete mode');
                }
            });
        } catch (error) {
            console.error('Error deleting mode:', error);
            toast.error('Failed to delete mode');
        }
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">AI Modes</h1>
                        <p className="text-gray-500 mt-1">Manage AI conversation modes and their system prompts</p>
                    </div>
                    <Button onClick={() => router.visit(route('admin.ai-modes.create'))}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Mode
                    </Button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{modes.length}</div>
                            <p className="text-xs text-muted-foreground">Total Modes</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{modes.filter(m => m.is_active).length}</div>
                            <p className="text-xs text-muted-foreground">Active Modes</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{modes.filter(m => !m.is_active).length}</div>
                            <p className="text-xs text-muted-foreground">Inactive Modes</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {modes.length > 0 ? Math.max(...modes.map(m => m.display_order)) : 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Max Display Order</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Modes Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All AI Modes</CardTitle>
                        <CardDescription>
                            Configure different AI personalities and behaviors for conversations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {modes.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No AI modes created yet.</p>
                                <Button onClick={() => router.visit(route('admin.ai-modes.create'))}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Mode
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>System Prompt</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {modes.map((mode) => (
                                        <TableRow key={mode.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{mode.emoji}</span>
                                                    <div>
                                                        <div className="font-medium">{mode.name}</div>
                                                        <div className="text-sm text-gray-500">ID: {mode.id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    {truncateText(mode.description, 80)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded text-gray-700">
                                                        {truncateText(mode.system_prompt, 120)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {mode.display_order}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={mode.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {mode.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.visit(route('admin.ai-modes.show', mode.id))}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.visit(route('admin.ai-modes.edit', mode.id))}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={mode.is_active ? "destructive" : "default"}
                                                        onClick={() => handleToggleStatus(mode)}
                                                        disabled={togglingId === mode.id}
                                                    >
                                                        {togglingId === mode.id ? (
                                                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                        ) : mode.is_active ? (
                                                            <ToggleRight className="w-4 h-4" />
                                                        ) : (
                                                            <ToggleLeft className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(mode)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
