import React from 'react';
import { router, usePage } from '@inertiajs/react';
import DeveloperPortalLayout from '@/layouts/developer-portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
    Key,
    Activity,
    TrendingUp,
    BookOpen,
    Wallet,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WalletSummary {
    balance_usd: number;
    lifetime_credited_usd: number;
    lifetime_debited_usd: number;
}

interface UsageStats {
    requests: number;
    success_requests: number;
    error_requests: number;
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
}

interface PageProps {
    wallet: WalletSummary | null;
    stats: UsageStats | null;
    apiBaseUrl: string;
    keyCount: number;
    topupConfig: {
        default_amount_usd: number;
        min_amount_usd: number;
        max_amount_usd: number;
    };
}

function formatUsd(val: number) {
    return '$' + val.toFixed(val < 0.01 ? 6 : 4);
}

export default function DeveloperApiDashboard({ wallet, stats, apiBaseUrl, keyCount, topupConfig }: PageProps) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash ?? {};

    const w = wallet ?? { balance_usd: 0, lifetime_credited_usd: 0, lifetime_debited_usd: 0 };
    const s = stats ?? { requests: 0, success_requests: 0, error_requests: 0, total_tokens: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0 };

    const [topupAmount, setTopupAmount] = useState(String(topupConfig.default_amount_usd));
    const [topupLoading, setTopupLoading] = useState(false);

    function handleTopup() {
        const amount = parseFloat(topupAmount);
        if (isNaN(amount) || amount < topupConfig.min_amount_usd || amount > topupConfig.max_amount_usd) {
            toast.error(`Amount must be between $${topupConfig.min_amount_usd} and $${topupConfig.max_amount_usd}`);
            return;
        }
        setTopupLoading(true);
        router.post('/developer-api/top-up', { amount_usd: amount }, {
            onError: (e) => { toast.error(Object.values(e)[0] as string); setTopupLoading(false); },
            onSuccess: () => setTopupLoading(false),
        });
    }

    const stats_items = [
        { label: 'Total Requests', value: s.requests.toLocaleString(), icon: Activity },
        { label: 'Success Rate', value: s.requests > 0 ? `${((s.success_requests / s.requests) * 100).toFixed(1)}%` : '—', icon: CheckCircle2 },
        { label: 'Total Tokens', value: s.total_tokens.toLocaleString(), icon: Activity },
        { label: 'Total Spend', value: formatUsd(s.cost_usd), icon: TrendingUp },
    ];

    const quick_links = [
        { label: 'API Keys', description: `${keyCount} key${keyCount !== 1 ? 's' : ''} active`, href: '/developer-api/keys', icon: Key, color: 'text-blue-500' },
        { label: 'Usage', description: `${s.requests.toLocaleString()} total requests`, href: '/developer-api/usage', icon: Activity, color: 'text-green-500' },
        { label: 'Billing', description: `${formatUsd(w.balance_usd)} wallet balance`, href: '/developer-api/billing', icon: TrendingUp, color: 'text-purple-500' },
        { label: 'Quickstart', description: 'Docs & code examples', href: '/developer-api/quickstart', icon: BookOpen, color: 'text-orange-500' },
    ];

    return (
        <DeveloperPortalLayout title="Dashboard">
            {flash.success && (
                <Alert className="mb-6">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertDescription>{flash.success}</AlertDescription>
                </Alert>
            )}
            {flash.error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Overview of your API usage and account.
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stats_items.map((item) => (
                        <Card key={item.label}>
                            <CardContent className="pt-4 pb-3">
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className="text-2xl font-semibold mt-0.5">{item.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Wallet card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wallet className="w-4 h-4" /> Wallet Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-3xl font-bold">${w.balance_usd.toFixed(4)}</div>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <div>Total credited: ${w.lifetime_credited_usd.toFixed(2)}</div>
                                <div>Total spent: ${w.lifetime_debited_usd.toFixed(4)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={topupAmount}
                                    onChange={(e) => setTopupAmount(e.target.value)}
                                    min={topupConfig.min_amount_usd}
                                    max={topupConfig.max_amount_usd}
                                    step={1}
                                    className="w-28"
                                />
                                <Button onClick={handleTopup} disabled={topupLoading} size="sm">
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    {topupLoading ? 'Redirecting…' : 'Top up'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* API base URL */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">API Endpoint</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">Use this base URL with any OpenAI-compatible client.</p>
                            <Badge variant="outline" className="font-mono text-xs break-all">{apiBaseUrl}</Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit('/developer-api/quickstart')}
                                className="w-full gap-1.5"
                            >
                                <BookOpen className="w-4 h-4" />
                                View Quickstart Guide
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick navigation cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quick_links.map((item) => (
                        <Card
                            key={item.label}
                            className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => router.visit(item.href)}
                        >
                            <CardContent className="pt-5 pb-4">
                                <item.icon className={`w-6 h-6 mb-2.5 ${item.color}`} />
                                <p className="font-medium text-sm">{item.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DeveloperPortalLayout>
    );
}
