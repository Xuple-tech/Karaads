import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { PlanFeaturesPanel } from './PlanFeaturesPanel';

interface SubscriptionPlan {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    billing_cycle: string;
    status: string;
    supports_api: boolean;
    supports_voice: boolean;
    supports_email_automation: boolean;
    supports_projects: boolean;
}

interface SubscriptionPlanEditorProps {
    planId: string;
    onBack?: () => void;
}

export const SubscriptionPlanEditor: React.FC<SubscriptionPlanEditorProps> = ({ planId, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const { data: plan, isLoading, error } = useQuery({
        queryKey: ['subscription-plan', planId],
        queryFn: async () => {
            const { data } = await axios.get(`/admin/subscriptions/plans/${planId}`);
            return data.plan as SubscriptionPlan;
        },
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
                    <p>Loading plan details...</p>
                </div>
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-red-500">Failed to load subscription plan</p>
                        {onBack && (
                            <Button className="mt-4 w-full" onClick={onBack}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go Back
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const featureFlags = [
        { label: 'API Access', enabled: plan.supports_api },
        { label: 'Voice Chat', enabled: plan.supports_voice },
        { label: 'Email Automation', enabled: plan.supports_email_automation },
        { label: 'Projects', enabled: plan.supports_projects },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        {onBack && (
                            <Button variant="ghost" size="sm" onClick={onBack}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <h1 className="text-3xl font-bold">{plan.name}</h1>
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>{plan.status}</Badge>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold">${plan.price}</p>
                    <p className="text-sm text-muted-foreground">/{plan.billing_cycle}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {featureFlags.map((item) => (
                    <Card key={item.label}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{item.enabled ? 'Yes' : 'No'}</p>
                            <p className="text-xs text-muted-foreground">availability</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Overview</CardTitle>
                            <CardDescription>General billing configuration for this subscription tier</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-2 font-medium">Basic Information</h3>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Plan ID:</dt>
                                            <dd className="font-mono">{plan.id}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Slug:</dt>
                                            <dd className="font-mono">{plan.slug}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Billing Cycle:</dt>
                                            <dd>{plan.billing_cycle}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h3 className="mb-2 font-medium">Feature Flags</h3>
                                    <dl className="space-y-2 text-sm">
                                        {featureFlags.map((item) => (
                                            <div key={item.label} className="flex justify-between">
                                                <dt className="text-muted-foreground">{item.label}:</dt>
                                                <dd>
                                                    <Badge variant={item.enabled ? 'default' : 'secondary'}>
                                                        {item.enabled ? 'Enabled' : 'Disabled'}
                                                    </Badge>
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                    <PlanFeaturesPanel planId={planId} planName={plan.name} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SubscriptionPlanEditor;
