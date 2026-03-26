import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Play, Clock, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Schedule {
    id: string;
    name: string;
    trigger_type: 'cron' | 'webhook' | 'manual';
    cron_expression?: string;
    webhook_url?: string;
    webhook_token?: string;
    is_active: boolean;
    next_run_at?: string;
    last_run_at?: string;
}

interface ScheduleManagerProps {
    projectId: string;
    agentId: string;
}

export default function ScheduleManager({ projectId, agentId }: ScheduleManagerProps) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [triggerType, setTriggerType] = useState<'cron' | 'webhook' | 'manual'>('cron');
    const [cronExpr, setCronExpr] = useState('0 12 * * *'); // Daily at noon
    const [workflowId, setWorkflowId] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);

    // Cron presets
    const cronPresets = [
        { label: 'Every hour', value: '0 * * * *' },
        { label: 'Daily at noon', value: '0 12 * * *' },
        { label: 'Daily at midnight', value: '0 0 * * *' },
        { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
        { label: 'Weekly (Sunday 6 PM)', value: '0 18 * * 0' },
        { label: 'Monthly (1st at 8 AM)', value: '0 8 1 * *' },
        { label: 'Every 30 minutes', value: '*/30 * * * *' },
    ];

    useEffect(() => {
        loadSchedules();
    }, []);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `/api/projects/${projectId}/agents/${agentId}/schedules`
            );
            setSchedules(response.data.schedules || []);
        } catch (error) {
            toast.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    const saveSchedule = async () => {
        if (!name.trim() || !workflowId) {
            toast.error('Name and workflow are required');
            return;
        }

        if (triggerType === 'cron' && !cronExpr.trim()) {
            toast.error('Cron expression is required');
            return;
        }

        try {
            setSaving(true);
            const payload: any = {
                name,
                trigger_type: triggerType,
                workflow_id: workflowId,
                is_active: isActive,
            };

            if (triggerType === 'cron') {
                payload.cron_expression = cronExpr;
            }

            if (editingId) {
                await axios.put(
                    `/api/projects/${projectId}/agents/${agentId}/schedules/${editingId}`,
                    payload
                );
                toast.success('Schedule updated');
            } else {
                await axios.post(
                    `/api/projects/${projectId}/agents/${agentId}/schedules`,
                    payload
                );
                toast.success('Schedule created');
            }

            resetForm();
            await loadSchedules();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save schedule');
        } finally {
            setSaving(false);
        }
    };

    const deleteSchedule = async (id: string) => {
        if (!confirm('Delete this schedule?')) return;

        try {
            await axios.delete(
                `/api/projects/${projectId}/agents/${agentId}/schedules/${id}`
            );
            toast.success('Schedule deleted');
            await loadSchedules();
        } catch (error) {
            toast.error('Failed to delete schedule');
        }
    };

    const executeSchedule = async (id: string) => {
        try {
            await axios.post(
                `/api/projects/${projectId}/agents/${agentId}/schedules/${id}/execute`
            );
            toast.success('Schedule executed');
            await loadSchedules();
        } catch (error) {
            toast.error('Failed to execute schedule');
        }
    };

    const toggleActive = async (schedule: Schedule) => {
        try {
            await axios.put(
                `/api/projects/${projectId}/agents/${agentId}/schedules/${schedule.id}`,
                { is_active: !schedule.is_active }
            );
            await loadSchedules();
        } catch (error) {
            toast.error('Failed to update schedule');
        }
    };

    const resetForm = () => {
        setName('');
        setTriggerType('cron');
        setCronExpr('0 12 * * *');
        setWorkflowId('');
        setIsActive(true);
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return <div className="text-center py-8">Loading schedules...</div>;
    }

    return (
        <div className="space-y-4 max-w-4xl mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg border">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Schedule Manager</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={18} /> New Schedule
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Daily Sync"
                                className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Trigger Type</label>
                            <select
                                value={triggerType}
                                onChange={(e) => setTriggerType(e.target.value as any)}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                            >
                                <option value="cron">Cron (Scheduled)</option>
                                <option value="webhook">Webhook</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Workflow</label>
                        <input
                            type="text"
                            value={workflowId}
                            onChange={(e) => setWorkflowId(e.target.value)}
                            placeholder="Workflow ID or name"
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                        />
                    </div>

                    {triggerType === 'cron' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Cron Expression</label>
                            <input
                                type="text"
                                value={cronExpr}
                                onChange={(e) => setCronExpr(e.target.value)}
                                placeholder="0 12 * * *"
                                className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 font-mono"
                            />
                            <div className="mt-2 flex flex-wrap gap-1">
                                {cronPresets.map(preset => (
                                    <button
                                        key={preset.value}
                                        onClick={() => setCronExpr(preset.value)}
                                        className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <label htmlFor="isActive" className="text-sm">Active</label>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={saveSchedule}
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Save
                        </button>
                        <button
                            onClick={resetForm}
                            className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Schedules List */}
            <div className="space-y-2">
                {schedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No schedules yet. Create one to automate your workflows.
                    </div>
                ) : (
                    schedules.map(schedule => (
                        <div
                            key={schedule.id}
                            className={`p-4 border rounded flex items-start justify-between gap-4 ${
                                schedule.is_active
                                    ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    {schedule.trigger_type === 'cron' && <Clock size={18} className="text-blue-600" />}
                                    {schedule.trigger_type === 'webhook' && <Zap size={18} className="text-orange-600" />}
                                    <h3 className="font-semibold">{schedule.name}</h3>
                                    {schedule.is_active ? (
                                        <span className="text-xs bg-green-200 dark:bg-green-700 px-2 py-1 rounded">Active</span>
                                    ) : (
                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Inactive</span>
                                    )}
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {schedule.trigger_type === 'cron' && `Cron: ${schedule.cron_expression}`}
                                    {schedule.trigger_type === 'webhook' && `Webhook: ${schedule.webhook_url?.substring(0, 40)}...`}
                                    {schedule.trigger_type === 'manual' && 'Manual trigger'}
                                </div>

                                {schedule.last_run_at && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Last run: {new Date(schedule.last_run_at).toLocaleString()}
                                    </div>
                                )}
                                {schedule.next_run_at && (
                                    <div className="text-xs text-gray-500">
                                        Next run: {new Date(schedule.next_run_at).toLocaleString()}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => executeSchedule(schedule.id)}
                                    className="p-2 hover:bg-blue-200 dark:hover:bg-blue-800 rounded text-blue-600"
                                    title="Execute now"
                                >
                                    <Play size={18} />
                                </button>
                                <button
                                    onClick={() => toggleActive(schedule)}
                                    className={`p-2 rounded ${
                                        schedule.is_active
                                            ? 'hover:bg-red-200 dark:hover:bg-red-800 text-red-600'
                                            : 'hover:bg-green-200 dark:hover:bg-green-800 text-green-600'
                                    }`}
                                    title={schedule.is_active ? 'Deactivate' : 'Activate'}
                                >
                                    {schedule.is_active ? '◉' : '○'}
                                </button>
                                <button
                                    onClick={() => deleteSchedule(schedule.id)}
                                    className="p-2 hover:bg-red-200 dark:hover:bg-red-800 rounded text-red-600"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
