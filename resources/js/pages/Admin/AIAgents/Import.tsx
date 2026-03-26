// @/Pages/Admin/AIAgents/Import.tsx
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, FileJson } from 'lucide-react';

const Import = ({ users, sites }) => {
    const [fileName, setFileName] = useState('');
    const { data, setData, errors, processing, post } = useForm({
        config_file: null,
        user_id: '',
        site_id: '',
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('config_file', file);
            setFileName(file.name);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.ai-agents.import'));
    };

    return (
        <AdminLayout>
            <Head title="Import AI Agent" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.ai-agents.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Import AI Agent</h1>
                            <p className="text-muted-foreground">
                                Import an AI agent from a configuration file
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Import Configuration</CardTitle>
                        <CardDescription>
                            Upload a JSON configuration file to import an AI agent
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="config_file">Configuration File *</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <FileJson className="h-12 w-12 text-gray-400 mb-4" />
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">
                                                    {fileName || 'No file selected'}
                                                </p>
                                            </div>
                                            <div>
                                                <Input
                                                    id="config_file"
                                                    type="file"
                                                    accept=".json"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <Label htmlFor="config_file">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="cursor-pointer"
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Choose File
                                                    </Button>
                                                </Label>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-4">
                                                Upload a JSON configuration file exported from another agent
                                            </p>
                                        </div>
                                    </div>
                                    {errors.config_file && (
                                        <p className="text-sm text-red-500">{errors.config_file}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="user_id">Owner *</Label>
                                        <Select
                                            value={data.user_id}
                                            onValueChange={(value) => setData('user_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an owner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name} ({user.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.user_id && <p className="text-sm text-red-500">{errors.user_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="site_id">Site (Optional)</Label>
                                        <Select
                                            value={data.site_id}
                                            onValueChange={(value) => setData('site_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a site" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">No Site</SelectItem>
                                                {sites.map((site) => (
                                                    <SelectItem key={site.id} value={site.id.toString()}>
                                                        {site.name} ({site.domain})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.site_id && <p className="text-sm text-red-500">{errors.site_id}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.ai-agents.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {processing ? 'Importing...' : 'Import Agent'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Import Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Only JSON files are accepted</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>The imported agent will be created as inactive by default</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Knowledge base items and tools will be imported if included in the configuration</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Conversations and usage statistics are not included in imports</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>The agent slug will be modified to ensure uniqueness</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Import;
