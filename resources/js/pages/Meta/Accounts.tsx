import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Facebook, Instagram, MessageCircle, Plus, AlertCircle,
    CheckCircle, Clock, Shield, LogOut, Loader2, Settings, ArrowUpRight,
} from 'lucide-react';
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

const platforms = [
    {
        key: 'facebook',
        icon: Facebook,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        label: 'Facebook',
        description: 'Manage your Facebook Page messages and automate replies.',
    },
    {
        key: 'instagram',
        icon: Instagram,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        label: 'Instagram',
        description: 'Handle Instagram DMs with AI-powered smart responses.',
    },
    {
        key: 'whatsapp',
        icon: MessageCircle,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        label: 'WhatsApp',
        description: 'Deploy an AI bot to your WhatsApp Business number.',
    },
];

export default function Accounts({ accounts = [], canAccessMeta }: Props) {
    const [disconnectingId, setDisconnectingId] = useState<number | null>(null);
    const [linking, setLinking] = useState<string | null>(null);

    const handleLinkAccount = (platform: string) => {
        setLinking(platform);
        fetch('/meta/accounts/initiate-oauth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ platform }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.oauth_url) {
                    window.location.href = data.oauth_url;
                } else {
                    toast.error('Failed to start connection');
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
            const res = await fetch(`/meta/accounts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            if (res.ok) {
                toast.success('Account disconnected');
                window.location.reload();
            } else {
                toast.error('Failed to disconnect');
            }
        } catch {
            toast.error('Error disconnecting');
        } finally {
            setDisconnectingId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { label: 'Automations', href: '/meta/dashboard' },
            { label: 'Accounts' },
        ]}>
            <Head title="Connected Accounts" />

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
                    <p className="mt-1.5 text-muted-foreground">Connect your social platforms to enable AI automation</p>
                </div>

                {/* Connected accounts */}
                {accounts.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold">Connected</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((account) => {
                                const cfg = platforms.find(p => p.key === account.platform) ?? platforms[2];
                                const Icon = cfg.icon;
                                return (
                                    <Card key={account.id} className="overflow-hidden">
                                        {/* Colored top strip */}
                                        <div className={`h-1 w-full ${cfg.bg.replace('/10', '/60')}`} />
                                        <CardContent className="p-5">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.bg}`}>
                                                        <Icon className={`h-5 w-5 ${cfg.color}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold leading-tight">{account.account_name}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{account.platform}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={account.is_active ? 'default' : 'secondary'} className="text-xs">
                                                    {account.is_active
                                                        ? <><CheckCircle className="mr-1 h-2.5 w-2.5" />Active</>
                                                        : <><Clock className="mr-1 h-2.5 w-2.5" />Inactive</>
                                                    }
                                                </Badge>
                                            </div>

                                            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border p-3 text-center text-sm">
                                                <div>
                                                    <p className="text-lg font-bold">{account.conversation_count}</p>
                                                    <p className="text-xs text-muted-foreground">Conversations</p>
                                                </div>
                                                <div>
                                                    <p className={`text-lg font-bold ${account.unread_count > 0 ? 'text-amber-500' : ''}`}>
                                                        {account.unread_count}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Unread</p>
                                                </div>
                                            </div>

                                            <p className="mb-3 text-xs text-muted-foreground">
                                                Connected {new Date(account.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>

                                            <div className="flex gap-2">
                                                <Button asChild variant="outline" size="sm" className="flex-1">
                                                    <Link href={`/meta/accounts/${account.id}/preferences`}>
                                                        <Settings className="mr-1.5 h-3.5 w-3.5" />
                                                        Settings
                                                    </Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                            <LogOut className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Disconnect account?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will stop all automation for <strong>{account.account_name}</strong>. You can reconnect at any time.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <div className="flex justify-end gap-2 mt-4">
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDisconnect(account.id)}
                                                                disabled={disconnectingId === account.id}
                                                                className="bg-destructive hover:bg-destructive/90"
                                                            >
                                                                {disconnectingId === account.id
                                                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Disconnecting…</>
                                                                    : 'Disconnect'
                                                                }
                                                            </AlertDialogAction>
                                                        </div>
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

                {/* Available platforms */}
                <div className="space-y-4">
                    <h2 className="text-base font-semibold">Available Platforms</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {platforms.map(({ key, icon: Icon, color, bg, border, label, description }) => {
                            const isConnected = accounts.some(a => a.platform === key && a.is_active);
                            return (
                                <Card key={key} className={`transition-shadow ${isConnected ? 'opacity-70' : 'hover:shadow-md'}`}>
                                    <CardContent className="p-5">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                                                <Icon className={`h-6 w-6 ${color}`} />
                                            </div>
                                            {isConnected && (
                                                <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Connected
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-semibold">{label}</h3>
                                        <p className="mt-1 mb-4 text-sm text-muted-foreground">{description}</p>
                                        <Button
                                            onClick={() => handleLinkAccount(key)}
                                            disabled={linking === key || isConnected}
                                            variant={isConnected ? 'outline' : 'default'}
                                            className="w-full"
                                            size="sm"
                                        >
                                            {linking === key && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                            {isConnected ? 'Already Connected' : `Connect ${label}`}
                                            {!isConnected && !linking && <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Security notice */}
                <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardContent className="p-5">
                        <div className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                                <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Your data is secure</p>
                                <ul className="space-y-0.5 text-xs text-amber-800 dark:text-amber-200">
                                    <li>Access tokens are encrypted at rest</li>
                                    <li>We never store your login credentials</li>
                                    <li>All API calls are encrypted in transit</li>
                                    <li>Disconnect any account at any time</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
