import React, { useState, FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, router } from '@inertiajs/react';

interface FormData {
    api_key: string;
    model: string;
    rate_limit: string;
    notes: string;
    allowed_features: string[];
}

export default function GrokApiCreate() {
    const [formData, setFormData] = useState<FormData>({
        api_key: '',
        model: 'grok-3',
        rate_limit: '1000',
        notes: '',
        allowed_features: [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post(route('admin.grok-api.store'), formData, {
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setLoading(false);
            },
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Add Grok API Key</h1>
                    <p className="text-gray-500 mt-1">Configure a new Grok API key for your system</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>API Configuration</CardTitle>
                        <CardDescription>Enter your Grok API credentials</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="api_key">API Key</Label>
                                <Input
                                    id="api_key"
                                    name="api_key"
                                    type="password"
                                    value={formData.api_key}
                                    onChange={handleChange}
                                    placeholder="sk-..."
                                    required
                                    className="mt-2"
                                />
                                {errors.api_key && (
                                    <p className="text-sm text-red-600 mt-1">{errors.api_key}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Get your API key from your Grok account dashboard
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="model">Model</Label>
                                <select
                                    id="model"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="grok-3">Grok 3</option>
                                    <option value="grok-4">Grok 4</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="rate_limit">Rate Limit (requests/min)</Label>
                                <Input
                                    id="rate_limit"
                                    name="rate_limit"
                                    type="number"
                                    value={formData.rate_limit}
                                    onChange={handleChange}
                                    min="100"
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Add any notes or description for this API key"
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Adding...' : 'Add API Key'}
                                </Button>
                                <Link href={route('admin.grok-api.index')}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
