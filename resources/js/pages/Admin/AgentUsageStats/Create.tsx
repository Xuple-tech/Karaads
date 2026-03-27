import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

const Create = ({ agents }) => {
    const { data, setData, post, errors, processing } = useForm({
        agent_id: '',
        date: new Date().toISOString().split('T')[0],
        conversations_count: 0,
        messages_count: 0,
        users_count: 0,
        avg_response_time: null,
        satisfaction_score: null,
        common_questions: [],
        peak_hours: [],
        knowledge_base_hits: 0,
        tool_usage: {},
    });

    const [currentQuestion, setCurrentQuestion] = useState({ question: '', count: 1 });
    const [currentPeakHour, setCurrentPeakHour] = useState({ hour: '0', count: 1 });
    const [currentTool, setCurrentTool] = useState({ name: '', count: 1 });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.agent-usage-stats.store'));
    };

    const addCommonQuestion = () => {
        if (currentQuestion.question.trim() && currentQuestion.count > 0) {
            setData('common_questions', [
                ...data.common_questions,
                { question: currentQuestion.question, count: parseInt(currentQuestion.count) }
            ]);
            setCurrentQuestion({ question: '', count: 1 });
        }
    };

    const removeCommonQuestion = (index) => {
        const newQuestions = [...data.common_questions];
        newQuestions.splice(index, 1);
        setData('common_questions', newQuestions);
    };

    const addPeakHour = () => {
        if (currentPeakHour.hour && currentPeakHour.count > 0) {
            setData('peak_hours', [
                ...data.peak_hours,
                { hour: currentPeakHour.hour, count: parseInt(currentPeakHour.count) }
            ]);
            setCurrentPeakHour({ hour: '0', count: 1 });
        }
    };

    const removePeakHour = (index) => {
        const newHours = [...data.peak_hours];
        newHours.splice(index, 1);
        setData('peak_hours', newHours);
    };

    const addToolUsage = () => {
        if (currentTool.name.trim() && currentTool.count > 0) {
            setData('tool_usage', {
                ...data.tool_usage,
                [currentTool.name]: parseInt(currentTool.count)
            });
            setCurrentTool({ name: '', count: 1 });
        }
    };

    const removeToolUsage = (toolName) => {
        const newTools = { ...data.tool_usage };
        delete newTools[toolName];
        setData('tool_usage', newTools);
    };

    return (
        <AdminLayout>
            <Head title="Add Usage Statistics" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add Usage Statistics</h1>
                    <p className="text-muted-foreground">
                        Add usage statistics for an agent on a specific date
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Usage Statistics Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="agent_id">Agent *</Label>
                                    <Select value={data.agent_id} onValueChange={(value) => setData('agent_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select agent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {agents.map(agent => (
                                                <SelectItem key={agent.id} value={agent.id}>
                                                    {agent.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.agent_id && <p className="text-sm text-red-600">{errors.agent_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                    />
                                    {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="conversations_count">Conversations Count *</Label>
                                    <Input
                                        id="conversations_count"
                                        type="number"
                                        value={data.conversations_count}
                                        onChange={(e) => setData('conversations_count', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                    {errors.conversations_count && <p className="text-sm text-red-600">{errors.conversations_count}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="messages_count">Messages Count *</Label>
                                    <Input
                                        id="messages_count"
                                        type="number"
                                        value={data.messages_count}
                                        onChange={(e) => setData('messages_count', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                    {errors.messages_count && <p className="text-sm text-red-600">{errors.messages_count}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="users_count">Users Count *</Label>
                                    <Input
                                        id="users_count"
                                        type="number"
                                        value={data.users_count}
                                        onChange={(e) => setData('users_count', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                    {errors.users_count && <p className="text-sm text-red-600">{errors.users_count}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="avg_response_time">Average Response Time (seconds)</Label>
                                    <Input
                                        id="avg_response_time"
                                        type="number"
                                        step="0.01"
                                        value={data.avg_response_time || ''}
                                        onChange={(e) => setData('avg_response_time', e.target.value ? parseFloat(e.target.value) : null)}
                                        min="0"
                                    />
                                    {errors.avg_response_time && <p className="text-sm text-red-600">{errors.avg_response_time}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="satisfaction_score">Satisfaction Score (0-5)</Label>
                                    <Input
                                        id="satisfaction_score"
                                        type="number"
                                        step="0.1"
                                        max="5"
                                        min="0"
                                        value={data.satisfaction_score || ''}
                                        onChange={(e) => setData('satisfaction_score', e.target.value ? parseFloat(e.target.value) : null)}
                                    />
                                    {errors.satisfaction_score && <p className="text-sm text-red-600">{errors.satisfaction_score}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="knowledge_base_hits">Knowledge Base Hits</Label>
                                <Input
                                    id="knowledge_base_hits"
                                    type="number"
                                    value={data.knowledge_base_hits}
                                    onChange={(e) => setData('knowledge_base_hits', parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                                {errors.knowledge_base_hits && <p className="text-sm text-red-600">{errors.knowledge_base_hits}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Common Questions</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Input
                                        value={currentQuestion.question}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                                        placeholder="Question text"
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={currentQuestion.count}
                                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, count: parseInt(e.target.value) || 1 })}
                                            min="1"
                                            placeholder="Count"
                                        />
                                        <Button type="button" onClick={addCommonQuestion} size="sm">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {errors.common_questions && <p className="text-sm text-red-600">{errors.common_questions}</p>}

                                {data.common_questions.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {data.common_questions.map((question, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="text-sm">{question.question} (x{question.count})</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeCommonQuestion(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Peak Hours</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Select value={currentPeakHour.hour} onValueChange={(value) => setCurrentPeakHour({ ...currentPeakHour, hour: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select hour (0-23)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <SelectItem key={i} value={i.toString()}>
                                                    {i.toString().padStart(2, '0')}:00
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={currentPeakHour.count}
                                            onChange={(e) => setCurrentPeakHour({ ...currentPeakHour, count: parseInt(e.target.value) || 1 })}
                                            min="1"
                                            placeholder="Count"
                                        />
                                        <Button type="button" onClick={addPeakHour} size="sm">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {data.peak_hours.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {data.peak_hours.map((hour, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="text-sm">{hour.hour}:00 - {hour.count} interactions</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removePeakHour(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Tool Usage</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Input
                                        value={currentTool.name}
                                        onChange={(e) => setCurrentTool({ ...currentTool, name: e.target.value })}
                                        placeholder="Tool name"
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={currentTool.count}
                                            onChange={(e) => setCurrentTool({ ...currentTool, count: parseInt(e.target.value) || 1 })}
                                            min="1"
                                            placeholder="Usage count"
                                        />
                                        <Button type="button" onClick={addToolUsage} size="sm">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {Object.keys(data.tool_usage).length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {Object.entries(data.tool_usage).map(([tool, count]) => (
                                            <div key={tool} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="text-sm">{tool} - {count} times</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeToolUsage(tool)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button variant="outline" asChild>
                                    <a href={route('admin.agent-usage-stats.index')}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Statistics'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Create;
