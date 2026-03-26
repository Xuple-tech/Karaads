import React, { useEffect, useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Facebook, Instagram, MessageCircle, Plus, RefreshCw, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MetaAccount {
    id: number;
    platform: string;
    account_name: string;
    is_active: boolean;
    last_sync_at: string | null;
    unread_count: number;
    conversation_count: number;
    message_count: number;
}

interface Stats {
    total_accounts: number;
    total_conversations: number;
    total_messages: number;
    auto_replies_sent: number;
    pending_drafts: number;
}

interface Props {
    accounts: MetaAccount[];
    stats: Stats;
    canAccessMeta: boolean;
    subscriptionTier: string;
}

const getPlatformIcon = (platform: string) => {
    switch (platform) {
        case 'facebook':
            return <Facebook className="h-5 w-5 text-blue-600" />;
        case 'instagram':
            return <Instagram className="h-5 w-5 text-pink-600" />;
        case 'whatsapp':
            return <MessageCircle className="h-5 w-5 text-green-600" />;
        default:
            return null;
    }
};

export default function Dashboard({ accounts = [], stats, canAccessMeta, subscriptionTier }: Props) {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefreshMessages = async () => {
        setRefreshing(true);
        try {
            const response = await fetch('/meta/accounts/refresh-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                toast.success('Messages refreshed successfully');
                // Reload component data
                window.location.reload();
            } else {
                toast.error('Failed to refresh messages');
            }
        } catch (error) {
            toast.error('Error refreshing messages');
        } finally {
            setRefreshing(false);
        }
    };

    if (!canAccessMeta) {
        return (
            <AppLayout breadcrumbs={[{ label: 'Meta Automation' }]}>
                <Head title="Meta Automation" />
                <div className="space-y-4">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>
                            Meta Platform Automation is only available on Pro and above plans.
                        </AlertDescription>
                    </Alert>
                    <Button asChild>
                        <Link href="/pricing">Upgrade to Pro</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[{ label: 'Meta Automation' }]}>
            <Head title="Meta Automation Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Meta Automation</h1>
                        <p className="text-muted-foreground mt-2">AI-powered management of Facebook, Instagram, and WhatsApp</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefreshMessages}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button asChild>
                            <Link href="/meta/accounts">
                                <Plus className="h-4 w-4 mr-2" />
                                Link Account
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Linked Accounts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_accounts || 0}</div>
                            <p className="text-xs text-muted-foreground">Connected platforms</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_conversations || 0}</div>
                            <p className="text-xs text-muted-foreground">Active threads</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Messages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_messages || 0}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Auto Replies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.auto_replies_sent || 0}</div>
                            <p className="text-xs text-muted-foreground">Sent by AI</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.pending_drafts || 0}</div>
                            <p className="text-xs text-muted-foreground">Draft reviews</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Accounts Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
                    {accounts.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="pt-6 text-center">
                                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground mb-4">No accounts connected yet</p>
                                <Button asChild>
                                    <Link href="/meta/accounts">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Connect Your First Account
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((account) => (
                                <Card key={account.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getPlatformIcon(account.platform)}
                                                <CardTitle className="text-base">{account.account_name}</CardTitle>
                                            </div>
                                            <Badge variant={account.is_active ? 'default' : 'secondary'}>
                                                {account.is_active ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                                {account.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-xs">
                                            Last synced: {account.last_sync_at ? new Date(account.last_sync_at).toLocaleDateString() : 'Never'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                                            <div>
                                                <div className="font-semibold text-lg">{account.conversation_count}</div>
                                                <div className="text-xs text-muted-foreground">Conversations</div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-lg">{account.message_count}</div>
                                                <div className="text-xs text-muted-foreground">Messages</div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-lg">{account.unread_count}</div>
                                                <div className="text-xs text-muted-foreground">Unread</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button asChild variant="outline" size="sm" className="flex-1">
                                                <Link href={`/meta/accounts/${account.id}/conversations`}>
                                                    View Messages
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm" className="flex-1">
                                                <Link href={`/meta/accounts/${account.id}/preferences`}>
                                                    Settings
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">🤖 AI Agent Automation</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="mb-2">
                            Your Meta accounts are continuously monitored by our AI agent. When new messages arrive, the system automatically:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Analyzes message sentiment and intent</li>
                            <li>Generates intelligent reply drafts based on your preferences</li>
                            <li>Respects your configured tone and style</li>
                            <li>Applies your custom instructions and rules</li>
                        </ul>
                        <p className="mt-3 text-xs">
                            Configure automation preferences in your account settings to customize behavior.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
