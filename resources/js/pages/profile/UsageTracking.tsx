import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertTriangle,
    Zap,
    MessageSquare,
    Image as ImageIcon,
    Volume2,
    Mail,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageStats {
    daily: {
        requests_used: number;
        requests_limit: number | null;
        tokens_used: number;
        tokens_limit: number | null;
        images_generated: number;
        images_limit: number | null;
        voice_messages: number;
        voice_limit: number | null;
        emails_processed: number;
        emails_limit: number | null;
    };
    monthly: {
        requests_used: number;
        requests_limit: number | null;
        tokens_used: number;
        tokens_limit: number | null;
        images_generated: number;
        images_limit: number | null;
        voice_messages: number;
        voice_limit: number | null;
        emails_processed: number;
        emails_limit: number | null;
    };
}

interface UsageItem {
    label: string;
    icon: React.ReactNode;
    daily: {
        used: number;
        limit: number | null;
    };
    monthly: {
        used: number;
        limit: number | null;
    };
    color: string;
}

export default function UsageTracking() {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');

    useEffect(() => {
        fetchUsageStats();
    }, []);

    const fetchUsageStats = async () => {
        try {
            const response = await fetch('/api/subscription/usage-stats');
            const data = await response.json();
            if (data.success) {
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch usage stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">Loading usage data...</div>
                </CardContent>
            </Card>
        );
    }

    const currentStats = stats[period];

    const usageItems: UsageItem[] = [
        {
            label: 'API Requests',
            icon: <Zap className="h-5 w-5" />,
            daily: { used: currentStats.requests_used, limit: currentStats.requests_limit },
            monthly: stats.monthly.requests_used >= 0 ? {
                used: stats.monthly.requests_used,
                limit: stats.monthly.requests_limit
            } : { used: 0, limit: null },
            color: 'bg-blue-500',
        },
        {
            label: 'Tokens',
            icon: <MessageSquare className="h-5 w-5" />,
            daily: { used: currentStats.tokens_used, limit: currentStats.tokens_limit },
            monthly: stats.monthly.tokens_used >= 0 ? {
                used: stats.monthly.tokens_used,
                limit: stats.monthly.tokens_limit
            } : { used: 0, limit: null },
            color: 'bg-purple-500',
        },
        {
            label: 'Images Generated',
            icon: <ImageIcon className="h-5 w-5" />,
            daily: { used: currentStats.images_generated, limit: currentStats.images_limit },
            monthly: stats.monthly.images_generated >= 0 ? {
                used: stats.monthly.images_generated,
                limit: stats.monthly.images_limit
            } : { used: 0, limit: null },
            color: 'bg-pink-500',
        },
        {
            label: 'Voice Messages',
            icon: <Volume2 className="h-5 w-5" />,
            daily: { used: currentStats.voice_messages, limit: currentStats.voice_limit },
            monthly: stats.monthly.voice_messages >= 0 ? {
                used: stats.monthly.voice_messages,
                limit: stats.monthly.voice_limit
            } : { used: 0, limit: null },
            color: 'bg-green-500',
        },
        {
            label: 'Emails Processed',
            icon: <Mail className="h-5 w-5" />,
            daily: { used: currentStats.emails_processed, limit: currentStats.emails_limit },
            monthly: stats.monthly.emails_processed >= 0 ? {
                used: stats.monthly.emails_processed,
                limit: stats.monthly.emails_limit
            } : { used: 0, limit: null },
            color: 'bg-yellow-500',
        },
    ];

    const getUsagePercentage = (used: number, limit: number | null): number => {
        if (!limit) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    const isNearLimit = (used: number, limit: number | null): boolean => {
        if (!limit) return false;
        return (used / limit) >= 0.8;
    };

    const isExceeded = (used: number, limit: number | null): boolean => {
        if (!limit) return false;
        return used > limit;
    };

    const formatNumber = (num: number): string => {
        return num.toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Period Toggle */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Usage Overview
                            </CardTitle>
                            <CardDescription>
                                Track your API usage and limits
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {(['daily', 'monthly'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={cn(
                                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                                        period === p
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    )}
                                >
                                    {p === 'daily' ? 'Today' : 'This Month'}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Usage Cards */}
            <div className="grid md:grid-cols-1 gap-6">
                {usageItems.map((item) => {
                    const current = period === 'daily' ? item.daily : item.monthly;
                    const percentage = getUsagePercentage(current.used, current.limit);
                    const nearLimit = isNearLimit(current.used, current.limit);
                    const exceeded = isExceeded(current.used, current.limit);

                    if (current.limit === null && current.used === 0) {
                        return null; // Skip if no limit and no usage
                    }

                    return (
                        <Card key={item.label} className={cn(
                            'transition-colors',
                            exceeded && 'border-red-200 dark:border-red-900'
                        )}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'p-2 rounded-lg text-white',
                                            item.color
                                        )}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{item.label}</CardTitle>
                                            <CardDescription>
                                                {period === 'daily' ? 'Daily' : 'Monthly'} usage
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {nearLimit && (
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    )}
                                    {exceeded && (
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Usage Display */}
                                <div className="flex items-baseline justify-between">
                                    <span className="text-3xl font-bold">
                                        {formatNumber(current.used)}
                                    </span>
                                    {current.limit && (
                                        <span className="text-sm text-muted-foreground">
                                            / {formatNumber(current.limit)}
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                {current.limit && (
                                    <>
                                        <Progress
                                            value={Math.min(percentage, 100)}
                                            className="h-2"
                                        />
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {percentage.toFixed(1)}% used
                                            </span>
                                            {exceeded ? (
                                                <span className="text-red-600 dark:text-red-400 font-medium">
                                                    Over limit
                                                </span>
                                            ) : nearLimit ? (
                                                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                                    Approaching limit
                                                </span>
                                            ) : (
                                                <span className="text-green-600 dark:text-green-400">
                                                    {formatNumber(current.limit - current.used)} remaining
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}

                                {!current.limit && (
                                    <p className="text-sm text-muted-foreground">
                                        Unlimited usage
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Exceeded Limits Alert */}
            {Object.values(currentStats).some((stat, idx) => {
                if (typeof stat !== 'object' || idx >= 10) return false;
                const item = stat as { requests_used: number; requests_limit: number | null } | any;
                return item && isExceeded(item.used || 0, item.limit);
            }) && (
                <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <p className="font-semibold mb-1">Usage Limit Exceeded</p>
                        <p className="text-sm">
                            You've exceeded your {period} usage limit. Your requests are currently blocked.
                            Consider upgrading your plan or wait for the {period === 'daily' ? 'daily' : 'monthly'} reset.
                        </p>
                    </AlertDescription>
                </Alert>
            )}

            {/* Tips */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-base">Usage Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>• API requests reset daily at midnight UTC and monthly on the 1st</p>
                    <p>• Upgrade your plan to increase your limits</p>
                    <p>• Monitor your usage regularly to avoid hitting limits</p>
                    <p>• Contact support if you need higher limits for your use case</p>
                </CardContent>
            </Card>
        </div>
    );
}
