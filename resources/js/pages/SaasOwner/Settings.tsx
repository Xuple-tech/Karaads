import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Building, Users, MessageSquare } from 'lucide-react';

interface SettingsPageProps {
    settings: {
        name: string;
        plan: string;
        message_limit: number;
        created_at: string;
    } | null;
}

const Settings: React.FC<SettingsPageProps> = ({ settings }) => {
    return (
        <>
            <Head title="Settings" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Instance Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Instance Information
                            </CardTitle>
                            <CardDescription>
                                Details about your SaaS instance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Instance Name</label>
                                    <p className="text-lg font-semibold">{settings?.name || 'Not configured'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Plan</label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={settings?.plan === 'pro' ? 'default' : 'secondary'}>
                                            {settings?.plan?.toUpperCase() || 'FREE'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Message Limit</label>
                                    <p className="text-lg font-semibold">
                                        {settings?.message_limit?.toLocaleString() || 'Unlimited'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                                    <p className="text-sm">
                                        {settings?.created_at ? new Date(settings.created_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscription Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" />
                                Subscription Details
                            </CardTitle>
                            <CardDescription>
                                Manage your subscription and billing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">Current Plan</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {settings?.plan === 'pro' ? 'Professional Plan' :
                                             settings?.plan === 'basic' ? 'Basic Plan' :
                                             'Free Plan'}
                                        </p>
                                    </div>
                                    <Badge variant="outline">
                                        {settings?.plan?.toUpperCase() || 'FREE'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Monthly Messages
                                    </span>
                                    <span className="font-medium">
                                        {settings?.message_limit?.toLocaleString() || 'Unlimited'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Team Members
                                    </span>
                                    <span className="font-medium">Unlimited</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Configuration Note */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>
                            Additional settings and configurations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <SettingsIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Advanced configuration options coming soon.</p>
                            <p className="text-sm mt-2">
                                Contact support for custom configurations and enterprise features.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Settings;
