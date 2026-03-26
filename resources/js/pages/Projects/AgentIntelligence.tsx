import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Brain, Zap, Clock, BarChart3 } from 'lucide-react';
import MemoryDashboard from '../../components/AgentIntelligence/MemoryDashboard';
import WorkflowBuilder from '../../components/AgentIntelligence/WorkflowBuilder';
import ScheduleManager from '../../components/AgentIntelligence/ScheduleManager';
import ExecutionMonitor from '../../components/AgentIntelligence/ExecutionMonitor';

interface PageProps {
    project: {
        id: number;
        name: string;
        slug: string;
    };
    agent: {
        id: number;
        name: string;
        type: string;
        description?: string;
        status: string;
        capabilities?: Record<string, any>;
        configuration?: Record<string, any>;
    };
    stats: {
        memory: Record<string, any>;
        schedules: Record<string, any>;
        workflows: Record<string, any>;
    };
    availableTools: Array<{
        id: string;
        name: string;
        description: string;
        category: string;
    }>;
}

export default function AgentIntelligence({ project, agent, stats, availableTools }: PageProps) {
    const [activeTab, setActiveTab] = useState<'memory' | 'workflows' | 'schedules' | 'monitor'>('memory');

    const tabs = [
        {
            id: 'memory',
            label: 'Memory',
            icon: Brain,
            description: 'View and manage agent memories'
        },
        {
            id: 'workflows',
            label: 'Workflows',
            icon: Zap,
            description: 'Create and manage tool compositions'
        },
        {
            id: 'schedules',
            label: 'Schedules',
            icon: Clock,
            description: 'Schedule workflows and executions'
        },
        {
            id: 'monitor',
            label: 'Monitor',
            icon: BarChart3,
            description: 'Track execution history'
        }
    ];

    return (
        <>
            <Head title={`${agent.name} - Intelligence`} />

            <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
                {/* Header */}
                <div className="bg-white dark:bg-gray-900 border-b">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Brain className="text-blue-600" size={28} />
                                <div>
                                    <h1 className="text-3xl font-bold">{agent.name} - Intelligence Hub</h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Manage agent memory, workflows, schedules, and execution monitoring
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    agent.status === 'active'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                }`}>
                                    {agent.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white dark:bg-gray-900 border-b sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex overflow-x-auto gap-1">
                            {tabs.map(tab => {
                                const IconComponent = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                                            activeTab === tab.id
                                                ? 'text-blue-600 border-blue-600'
                                                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        <IconComponent size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto py-6">
                    {activeTab === 'memory' && (
                        <MemoryDashboard projectId={project.id} agentId={agent.id} stats={stats.memory} />
                    )}

                    {activeTab === 'workflows' && (
                        <WorkflowBuilder projectId={project.id} agentId={agent.id} stats={stats.workflows} availableTools={availableTools} />
                    )}

                    {activeTab === 'schedules' && (
                        <ScheduleManager projectId={project.id} agentId={agent.id} stats={stats.schedules} />
                    )}

                    {activeTab === 'monitor' && (
                        <ExecutionMonitor projectId={project.id} agentId={agent.id} />
                    )}
                </div>

                {/* Info Box */}
                <div className="max-w-7xl mx-auto px-4 pb-8">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 How It Works</h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                            <li>• <strong>Memory:</strong> Agent automatically stores context from conversations for future reference</li>
                            <li>• <strong>Workflows:</strong> Chain tools together with sequential, parallel, or conditional execution</li>
                            <li>• <strong>Schedules:</strong> Trigger workflows on a schedule (cron), via webhook, or manually</li>
                            <li>• <strong>Monitor:</strong> Track execution history, performance, and debug issues</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
