import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit2, ToggleLeft, ToggleRight, Calendar, Hash } from 'lucide-react';
import { router } from '@inertiajs/react';
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
    mode: AIMode;
}

export default function Show({ mode }: Props) {
    const handleToggleStatus = async () => {
        try {
            await router.patch(route('admin.ai-modes.toggle', mode.id), {}, {
                onSuccess: () => {
                    toast.success(`Mode ${mode.is_active ? 'deactivated' : 'activated'} successfully`);
                    // Reload the page to show updated status
                    window.location.reload();
                },
                onError: () => {
                    toast.error('Failed to toggle mode status');
                }
            });
        } catch (error) {
            console.error('Error toggling mode:', error);
            toast.error('Failed to toggle mode status');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.visit(route('admin.ai-modes.index'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to AI Modes
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant={mode.is_active ? "destructive" : "default"}
                            onClick={handleToggleStatus}
                        >
                            {mode.is_active ? (
                                <>
                                    <ToggleRight className="w-4 h-4 mr-2" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <ToggleLeft className="w-4 h-4 mr-2" />
                                    Activate
                                </>
                            )}
                        </Button>
                        <Button onClick={() => router.visit(route('admin.ai-modes.edit', mode.id))}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Mode
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-4xl">{mode.emoji}</span>
                    <div>
                        <h1 className="text-3xl font-bold">{mode.name}</h1>
                        <p className="text-gray-500 mt-1">{mode.description}</p>
                    </div>
                    <Badge className={mode.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {mode.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Hash className="w-5 h-5 text-gray-500" />
                                <div>
                                    <div className="text-sm text-gray-500">Mode ID</div>
                                    <div className="font-medium">{mode.id}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">
                                    {mode.display_order}
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Display Order</div>
                                    <div className="font-medium">{mode.display_order}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <div>
                                    <div className="text-sm text-gray-500">Created</div>
                                    <div className="font-medium">{formatDate(mode.created_at)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>System Prompt</CardTitle>
                        <CardDescription>
                            The instructions that define how the AI behaves in this mode
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                                {mode.system_prompt}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Created At</div>
                                <div className="font-medium">{formatDate(mode.created_at)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                                <div className="font-medium">{formatDate(mode.updated_at)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Status</div>
                                <Badge className={mode.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {mode.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Display Order</div>
                                <div className="font-medium">{mode.display_order}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
