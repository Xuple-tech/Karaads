import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UsageData {
    requests_used: number;
    requests_limit?: number;
    tokens_used: number;
    tokens_limit?: number;
    images_generated: number;
    images_limit?: number;
    voice_messages: number;
    voice_limit?: number;
    emails_processed: number;
    emails_limit?: number;
}

interface UsageStatsProps {
    showMonthly?: boolean;
}

export default function UsageStats({ showMonthly = true }: UsageStatsProps) {
    const [dailyUsage, setDailyUsage] = useState<UsageData | null>(null);
    const [monthlyUsage, setMonthlyUsage] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsageStats();
    }, []);

    const fetchUsageStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/subscription/usage-stats', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch usage stats');
            }

            const data = await response.json();
            setDailyUsage(data.daily);
            if (showMonthly) {
                setMonthlyUsage(data.monthly);
            }
        } catch (err) {
            console.error('Error fetching usage stats:', err);
            setError('Failed to load usage statistics');
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (used: number, limit?: number): string => {
        if (!limit) return 'bg-blue-500';
        const percentage = (used / limit) * 100;
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-amber-500';
        return 'bg-green-500';
    };

    const renderUsageCard = (label: string, used: number, limit?: number) => {
        const percentage = limit ? Math.round((used / limit) * 100) : 0;

        return (
            <div key={label} className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {used.toLocaleString()}
                        {limit && ` / ${limit.toLocaleString()}`}
                        {percentage > 0 && ` (${percentage}%)`}
                    </span>
                </div>
                {limit && (
                    <Progress value={percentage} className="h-2" />
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Tabs defaultValue="daily" className="w-full">
            <TabsList>
                <TabsTrigger value="daily" className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Daily
                </TabsTrigger>
                {showMonthly && (
                    <TabsTrigger value="monthly" className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Monthly
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="daily" className="mt-6">
                <Card className="p-6">
                    <h3 className="font-semibold mb-6">Today's Usage</h3>
                    <div className="space-y-6">
                        {dailyUsage && (
                            <>
                                {renderUsageCard('Requests', dailyUsage.requests_used, dailyUsage.requests_limit)}
                                {renderUsageCard('Tokens', dailyUsage.tokens_used, dailyUsage.tokens_limit)}
                                {renderUsageCard('Images Generated', dailyUsage.images_generated, dailyUsage.images_limit)}
                                {renderUsageCard('Voice Messages', dailyUsage.voice_messages, dailyUsage.voice_limit)}
                                {renderUsageCard('Emails Processed', dailyUsage.emails_processed, dailyUsage.emails_limit)}
                            </>
                        )}
                    </div>

                    {dailyUsage && !dailyUsage.requests_limit && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                ✨ You have <strong>unlimited usage</strong> on your current plan
                            </p>
                        </div>
                    )}
                </Card>
            </TabsContent>

            {showMonthly && (
                <TabsContent value="monthly" className="mt-6">
                    <Card className="p-6">
                        <h3 className="font-semibold mb-6">This Month's Usage</h3>
                        <div className="space-y-6">
                            {monthlyUsage && (
                                <>
                                    {renderUsageCard('Requests', monthlyUsage.requests_used, monthlyUsage.requests_limit)}
                                    {renderUsageCard('Tokens', monthlyUsage.tokens_used, monthlyUsage.tokens_limit)}
                                    {renderUsageCard('Images Generated', monthlyUsage.images_generated, monthlyUsage.images_limit)}
                                    {renderUsageCard('Voice Messages', monthlyUsage.voice_messages, monthlyUsage.voice_limit)}
                                    {renderUsageCard('Emails Processed', monthlyUsage.emails_processed, monthlyUsage.emails_limit)}
                                </>
                            )}
                        </div>

                        {monthlyUsage && !monthlyUsage.requests_limit && (
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    ✨ You have <strong>unlimited usage</strong> on your current plan
                                </p>
                            </div>
                        )}
                    </Card>
                </TabsContent>
            )}
        </Tabs>
    );
}
