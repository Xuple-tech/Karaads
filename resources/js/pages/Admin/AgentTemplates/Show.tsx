import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Users, DollarSign, Clock, Eye, Edit, ToggleLeft } from 'lucide-react';

const Show = ({ template }) => {
    const handleToggleStatus = () => {
        window.location.href = route('admin.agent-templates.toggle-status', template.id);
    };

    const handleEdit = () => {
        window.location.href = route('admin.agent-templates.edit', template.id);
    };

    return (
        <AdminLayout>
            <Head title={template.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
                        <p className="text-muted-foreground">
                            View details and configuration for this agent template
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleToggleStatus}>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            {template.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button onClick={handleEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Bot className="h-8 w-8 text-blue-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Agents Using</p>
                                    <p className="text-2xl font-bold">{template.agents_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <DollarSign className="h-8 w-8 text-green-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                                    <p className="text-2xl font-bold">
                                        {template.price ? `$${template.price}` : 'Free'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-purple-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                        {template.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Eye className="h-8 w-8 text-orange-500" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Premium</p>
                                    <Badge variant={template.is_premium ? 'default' : 'secondary'}>
                                        {template.is_premium ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">Category</h3>
                                <Badge variant="outline" className="mt-1">
                                    {template.category}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="font-medium">Industry</h3>
                                <Badge variant="outline" className="mt-1">
                                    {template.industry || 'Not specified'}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="font-medium">Description</h3>
                                <p className="text-muted-foreground mt-1">
                                    {template.description || 'No description provided'}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Created At</h3>
                                <p className="text-muted-foreground mt-1">
                                    {new Date(template.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Last Updated</h3>
                                <p className="text-muted-foreground mt-1">
                                    {new Date(template.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">Welcome Message</h3>
                                <p className="text-muted-foreground mt-1">
                                    {template.welcome_message || 'No welcome message set'}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium">Suggested Questions</h3>
                                <ul className="mt-1 space-y-1">
                                    {template.suggested_questions && template.suggested_questions.length > 0 ? (
                                        template.suggested_questions.map((question, index) => (
                                            <li key={index} className="text-sm text-muted-foreground pl-2 border-l-2 border-gray-200">
                                                {question}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-muted-foreground">No suggested questions</li>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium">Tools Configuration</h3>
                                <pre className="text-sm bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                                    {JSON.stringify(template.tools_config || {}, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Associated Agents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {template.agents && template.agents.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Name</th>
                                            <th className="text-left py-2">Status</th>
                                            <th className="text-left py-2">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {template.agents.map((agent) => (
                                            <tr key={agent.id} className="border-b">
                                                <td className="py-2">{agent.name}</td>
                                                <td className="py-2">
                                                    <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                                                        {agent.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="py-2">
                                                    {new Date(agent.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No agents are currently using this template.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Show;
