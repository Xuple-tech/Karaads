import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';

const Edit = ({ template, categories, industries }) => {
    const { data, setData, put, errors, processing } = useForm({
        name: template.name,
        description: template.description,
        category: template.category,
        industry: template.industry,
        welcome_message: template.welcome_message,
        suggested_questions: template.suggested_questions || [],
        default_config: template.default_config || {},
        tools_config: template.tools_config || {},
        knowledge_base_structure: template.knowledge_base_structure || {},
        widget_settings: template.widget_settings || {},
        is_active: template.is_active,
        is_premium: template.is_premium,
        price: template.price,
    });

    const [currentQuestion, setCurrentQuestion] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.agent-templates.update', template.id));
    };

    const addSuggestedQuestion = () => {
        if (currentQuestion.trim()) {
            setData('suggested_questions', [...data.suggested_questions, currentQuestion]);
            setCurrentQuestion('');
        }
    };

    const removeSuggestedQuestion = (index) => {
        const newQuestions = [...data.suggested_questions];
        newQuestions.splice(index, 1);
        setData('suggested_questions', newQuestions);
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${template.name}`} />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Agent Template</h1>
                    <p className="text-muted-foreground">
                        Update the configuration for {template.name}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Template Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Template Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter template name"
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(category => (
                                                <SelectItem key={category} value={category}>
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter template description"
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <Select value={data.industry} onValueChange={(value) => setData('industry', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {industries.map(industry => (
                                                <SelectItem key={industry} value={industry}>
                                                    {industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.industry && <p className="text-sm text-red-600">{errors.industry}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={data.price || ''}
                                        onChange={(e) => setData('price', e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Enter price (optional)"
                                    />
                                    {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="welcome_message">Welcome Message</Label>
                                <Textarea
                                    id="welcome_message"
                                    value={data.welcome_message}
                                    onChange={(e) => setData('welcome_message', e.target.value)}
                                    placeholder="Enter welcome message"
                                    rows={3}
                                />
                                {errors.welcome_message && <p className="text-sm text-red-600">{errors.welcome_message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Suggested Questions</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={currentQuestion}
                                        onChange={(e) => setCurrentQuestion(e.target.value)}
                                        placeholder="Add a suggested question"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addSuggestedQuestion();
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={addSuggestedQuestion} size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {errors.suggested_questions && <p className="text-sm text-red-600">{errors.suggested_questions}</p>}

                                {data.suggested_questions.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {data.suggested_questions.map((question, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="text-sm">{question}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSuggestedQuestion(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="is_active">Active</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <span>Make this template available for use</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="is_premium">Premium</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_premium"
                                            checked={data.is_premium}
                                            onCheckedChange={(checked) => setData('is_premium', checked)}
                                        />
                                        <span>Mark as premium template</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button variant="outline" asChild>
                                    <a href={route('admin.agent-templates.index')}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Template'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Edit;
