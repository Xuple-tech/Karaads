import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Upload } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category: '',
        description: '',
        template_file: null as File | null,
        is_active: true,
        is_featured: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.slide-templates.store'));
    };

    return (
        <AdminLayout>
            <Head title="Upload Slide Template" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('admin.slide-templates.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Templates
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Upload PowerPoint Template</h1>
                        <p className="text-muted-foreground">Prepare the admin system for real PowerPoint templates you will use later.</p>
                    </div>
                </div>

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Template Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="name">Template name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Business">Business</SelectItem>
                                            <SelectItem value="Startup Pitch Deck">Startup Pitch Deck</SelectItem>
                                            <SelectItem value="Education">Education</SelectItem>
                                            <SelectItem value="Church">Church</SelectItem>
                                            <SelectItem value="Technology">Technology</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="Finance">Finance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.category} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" rows={4} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                <InputError message={errors.description} />
                            </div>

                            <div>
                                <Label htmlFor="template_file">PowerPoint template file</Label>
                                <Input
                                    id="template_file"
                                    type="file"
                                    accept=".pptx,.potx,.pptm"
                                    onChange={(e) => setData('template_file', e.target.files?.[0] ?? null)}
                                />
                                <p className="mt-2 text-sm text-muted-foreground">Accepted formats: `.pptx`, `.potx`, `.pptm` up to 50MB.</p>
                                <InputError message={errors.template_file} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <div className="font-medium">Active</div>
                                        <div className="text-sm text-muted-foreground">Template is available in the system.</div>
                                    </div>
                                    <Switch checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <div className="font-medium">Featured</div>
                                        <div className="text-sm text-muted-foreground">Highlight this template in admin-curated lists.</div>
                                    </div>
                                    <Switch checked={data.is_featured} onCheckedChange={(checked) => setData('is_featured', checked)} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.slide-templates.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? <Upload className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                    {processing ? 'Uploading...' : 'Upload Template'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
