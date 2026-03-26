import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Facebook, Instagram, MessageCircle, Plus, Trash2, AlertCircle, CheckCircle, Clock, Shield, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface MetaAccount {
    id: number;
    platform: string;
    account_name: string;
    account_id: string;
    is_active: boolean;
    last_sync_at: string | null;
    created_at: string;
    unread_count: number;
    conversation_count: number;
}

interface Props {
    accounts: MetaAccount[];
    canAccessMeta: boolean;
}

const getPlatformDetails = (platform: string) => {
    const details: Record<string, { icon: typeof Facebook; color: string; description: string }> = {
        facebook: {
            icon: Facebook,
            color: 'text-blue-600',
            description: 'Connect your Facebook Page to manage page messages',
        },
        instagram: {
            icon: Instagram,
            color: 'text-pink-600',
            description: 'Connect your Instagram Business account for DM management',
        },
        whatsapp: {
            icon: MessageCircle,
            color: 'text-green-600',
            description: 'Connect your WhatsApp Business account (business owners only)',
        },
    };
    return details[platform];
};

export default function Accounts({ accounts = [], canAccessMeta }: Props) {
    const [disconnectingId, setDisconnectingId] = useState<number | null>(null);
    const [linking, setLinking] = useState<string | null>(null);

    const handleLinkAccount = (platform: string) => {
        setLinking(platform);
        // Initiate OAuth flow
        fetch('/meta/accounts/initiate-oauth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ platform }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.oauth_url) {
                    window.location.href = data.oauth_url;
                } else {
                    toast.error('Failed to initiate connection');
                    setLinking(null);
                }
            })
            .catch(() => {
                toast.error('Error connecting account');
                setLinking(null);
            });
    };

    const handleDisconnect = async (id: number) => {
        setDisconnectingId(id);
        try {
            const response = await fetch(`/meta/accounts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                toast.success('Account disconnected successfully');
                window.location.reload();
            } else {
                toast.error('Failed to disconnect account');
            }
        } catch (error) {
            toast.error('Error disconnecting account');
        } finally {
            setDisconnectingId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { label: 'Meta Automation', href: '/meta/dashboard' },
            { label: 'Accounts' },
        ]}>
            <Head title="Meta Accounts" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Connected Accounts</h1>
                    <p className="text-muted-foreground mt-2">Link and manage your Meta platform accounts</p>
                </div>

                {/* Connected Accounts */}
                {accounts.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Your Connected Accounts</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((account) => {
                                const details = getPlatformDetails(account.platform);
                                const Icon = details.icon;

                                return (
                                    <Card key={account.id} className="relative overflow-hidden">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`${details.color}`}>
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-base capitalize">{account.platform}</CardTitle>
                                                        <CardDescription className="text-sm">{account.account_name}</CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant={account.is_active ? 'default' : 'secondary'} className="capitalize">
                                                    {account.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pb-3">
                                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                                <div>
                                                    <div className="text-2xl font-bold">{account.conversation_count}</div>
                                                    <div className="text-xs text-muted-foreground">Conversations</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold">{account.unread_count}</div>
                                                    <div className="text-xs text-muted-foreground">Unread</div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-4">
                                                Connected on {new Date(account.created_at).toLocaleDateString()}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button asChild variant="outline" size="sm" className="flex-1">
                                                    <Link href={`/meta/accounts/${account.id}/preferences`}>
                                                        Settings
                                                    </Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">
                                                            <LogOut className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Disconnect Account</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to disconnect this account? This action cannot be undone, and you will lose access to its messages.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDisconnect(account.id)}
                                                            disabled={disconnectingId === account.id}
                                                            className="bg-destructive hover:bg-destructive/90"
                                                        >
                                                            {disconnectingId === account.id ? 'Disconnecting...' : 'Disconnect'}
                                                        </AlertDialogAction>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Available Platforms */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Available Platforms</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {['facebook', 'instagram', 'whatsapp'].map((platform) => {
                            const details = getPlatformDetails(platform);
                            const Icon = details.icon;
                            const isConnected = accounts.some(a => a.platform === platform && a.is_active);

                            return (
                                <Card key={platform} className={isConnected ? 'opacity-60' : ''}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className={`${details.color}`}>
                                                <Icon className="h-8 w-8" />
                                            </div>
                                            {isConnected && (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                        <CardTitle className="text-lg capitalize mt-2">{platform}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {details.description}
                                        </p>
                                        <Button
                                            onClick={() => handleLinkAccount(platform)}
                                            disabled={linking === platform || isConnected}
                                            className="w-full"
                                        >
                                            {linking === platform && <span className="animate-spin mr-2">⏳</span>}
                                            {isConnected ? 'Connected' : `Connect ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Security Info */}
                <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                            <Shield className="h-5 w-5" />
                            Security Notice
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-amber-800 dark:text-amber-200">
                        <ul className="list-disc list-inside space-y-1">
                            <li>Your Meta access tokens are encrypted and stored securely</li>
                            <li>We never store your Meta login credentials</li>
                            <li>All API communications are encrypted in transit</li>
                            <li>You can disconnect any account at any time</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
