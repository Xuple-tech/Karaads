import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, Info } from 'lucide-react';

interface PlanAgentLimitsPanelProps {
    planId: string;
    planName: string;
}

export const PlanAgentLimitsPanel: React.FC<PlanAgentLimitsPanelProps> = ({ planId, planName }) => {
    const [formData, setFormData] = useState({
        max_concurrent_agents: null as number | null,
        max_agents_per_team: null as number | null,
        max_active_agents: null as number | null,
    });

    const { data: plan, isLoading } = useQuery({
        queryKey: ['agent-limits', planId],
        queryFn: async () => {
            const { data } = await axios.get(`/admin/subscriptions/plans/${planId}/agent-limits`);
            return data.plan;
        },
        onSuccess: (data) => {
            setFormData({
                max_concurrent_agents: data.max_concurrent_agents,
                max_agents_per_team: data.max_agents_per_team,
                max_active_agents: data.max_active_agents,
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { data: response } = await axios.put(`/admin/subscriptions/plans/${planId}/agent-limits`, data);
            return response;
        },
        onSuccess: () => {
            toast.success('Agent limits updated successfully');
        },
        onError: () => {
            toast.error('Failed to update agent limits');
        },
    });

    const setUnlimitedMutation = useMutation({
        mutationFn: async (type: 'concurrent' | 'per_team' | 'active') => {
            const { data } = await axios.post(`/admin/subscriptions/plans/${planId}/agent-limits/set-unlimited`, { type });
            return data;
        },
        onSuccess: (data) => {
            const type = data.plan[0] === 'concurrent' ? 'Concurrent' : data.plan[0] === 'per_team' ? 'Per Team' : 'Active';
            toast.success(`${type} agents set to unlimited`);
            // Refetch the data
        },
        onError: () => {
            toast.error('Failed to update agent limits');
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value ? parseInt(value) : null,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) {
        return <div className="flex justify-center p-8">Loading...</div>;
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Agent Limits - {planName}
                    </CardTitle>
                    <CardDescription>
                        Configure the maximum number of agents users on this plan can create and use
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Concurrent Agents */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <label className="block text-sm font-medium">Max Concurrent Agents</label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Maximum agents running simultaneously across all workflows
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {plan?.max_concurrent_agents ? `${plan.max_concurrent_agents} agents` : 'Unlimited'}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    name="max_concurrent_agents"
                                    value={formData.max_concurrent_agents || ''}
                                    onChange={handleInputChange}
                                    placeholder="Leave empty for unlimited"
                                    min="1"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setUnlimitedMutation.mutate('concurrent')}
                                    disabled={setUnlimitedMutation.isPending}
                                >
                                    Set Unlimited
                                </Button>
                            </div>
                        </div>

                        {/* Agents Per Team */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <label className="block text-sm font-medium">Max Agents Per Team</label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Maximum agents each team/workspace can create
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {plan?.max_agents_per_team ? `${plan.max_agents_per_team} agents` : 'Unlimited'}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    name="max_agents_per_team"
                                    value={formData.max_agents_per_team || ''}
                                    onChange={handleInputChange}
                                    placeholder="Leave empty for unlimited"
                                    min="1"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setUnlimitedMutation.mutate('per_team')}
                                    disabled={setUnlimitedMutation.isPending}
                                >
                                    Set Unlimited
                                </Button>
                            </div>
                        </div>

                        {/* Active Agents */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <label className="block text-sm font-medium">Max Active Agents</label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Maximum agents that can be actively scheduled at any given time
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {plan?.max_active_agents ? `${plan.max_active_agents} agents` : 'Unlimited'}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    name="max_active_agents"
                                    value={formData.max_active_agents || ''}
                                    onChange={handleInputChange}
                                    placeholder="Leave empty for unlimited"
                                    min="1"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setUnlimitedMutation.mutate('active')}
                                    disabled={setUnlimitedMutation.isPending}
                                >
                                    Set Unlimited
                                </Button>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">About Agent Limits</p>
                                <p className="text-xs text-blue-800 mt-1">
                                    These limits control how many agents can be created and used. Leave fields empty to allow unlimited agents in that category. A more restrictive limit takes precedence (e.g., if max concurrent is 5 and max per team is 3, users can only run 3 agents concurrently per team).
                                </p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Save Agent Limits'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PlanAgentLimitsPanel;
