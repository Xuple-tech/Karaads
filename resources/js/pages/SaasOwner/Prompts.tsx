import React, { useState } from 'react';
import SaasOwnerLayout from '@/layouts/SaasOwnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit2, Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface Prompt {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    is_active: boolean;
    usage_count: number;
    created_at: string;
}

interface SaasOwnerPromptsProps {
    prompts: {
        data: Prompt[];
        current_page: number;
        last_page: number;
    };
    stats: {
        total_prompts: number;
        active_prompts: number;
        total_usage: number;
    };
}

export default function SaasOwnerCustomPrompts({ prompts, stats }: SaasOwnerPromptsProps) {
    const [copied, setCopied] = useState<string | null>(null);
    const { delete: deletePrompt } = useForm();

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this prompt?')) {
            deletePrompt(route('saas-owner.prompts.destroy', id));
        }
    };

    const categories = [...new Set(prompts.data.map(p => p.category))];

    return (
        <SaasOwnerLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Custom Prompts</h1>
                        <p className="text-gray-500 mt-1">Create and manage AI prompts for your team</p>
                    </div>
                    <Link href={route('saas-owner.prompts.create')}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Prompt
                        </Button>
                    </Link>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_prompts}</div>
                            <p className="text-xs text-gray-500 mt-1">Created</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.active_prompts}</div>
                            <p className="text-xs text-gray-500 mt-1">In use</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_usage.toLocaleString()}</div>
                            <p className="text-xs text-gray-500 mt-1">Times used</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Prompts by Category */}
                {categories.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => {
                                    const count = prompts.data.filter(p => p.category === category).length;
                                    return (
                                        <button
                                            key={category}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition"
                                        >
                                            {category} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Prompts List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Prompts</CardTitle>
                        <CardDescription>{prompts.data.length} prompts available</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {prompts.data.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Prompts Yet</h3>
                                <p className="text-gray-500 mb-4">Create your first custom prompt to get started</p>
                                <Link href={route('saas-owner.prompts.create')}>
                                    <Button>Create Prompt</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {prompts.data.map((prompt) => (
                                    <div
                                        key={prompt.id}
                                        className="p-4 border rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg">{prompt.title}</h3>
                                                    {prompt.is_active ? (
                                                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">{prompt.description}</p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleCopy(prompt.content, prompt.id)}
                                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition"
                                                    title="Copy prompt"
                                                >
                                                    {copied === prompt.id ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <Link href={route('saas-owner.prompts.edit', prompt.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(prompt.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 line-clamp-2">
                                                {prompt.content}
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>Category: <span className="font-medium">{prompt.category}</span></span>
                                                <span>Used {prompt.usage_count} times</span>
                                                <span>Created {new Date(prompt.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {prompts.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: Math.min(prompts.last_page, 5) }).map((_, i) => (
                            <Link
                                key={i + 1}
                                href={route('saas-owner.prompts.index', { page: i + 1 })}
                            >
                                <Button
                                    variant={prompts.current_page === i + 1 ? 'default' : 'outline'}
                                    size="sm"
                                >
                                    {i + 1}
                                </Button>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </SaasOwnerLayout>
    );
}
