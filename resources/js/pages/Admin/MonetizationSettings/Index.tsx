import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, DollarSign, Percent, Wallet, TrendingUp } from 'lucide-react';
import admin from '@/routes/admin';

interface Setting {
    id: string;
    key: string;
    value: unknown;
    description: string;
    data_type: string;
    category: string;
    is_editable: boolean;
    min_value: number | null;
    max_value: number | null;
    options: unknown;
}

interface IndexProps {
    ad_revenue?: Setting[];
    user_payout?: Setting[];
    [key: string]: unknown;
}

function extractValue(value: unknown): number | string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        if (obj.percentage !== undefined) return obj.percentage as number;
        if (obj.amount !== undefined) return obj.amount as number;
        return 'N/A';
    }
    return value as number | string;
}

function getRevenueDistribution(settings: Setting[]) {
    const distribution: Record<string, number> = {};
    
    settings.forEach(setting => {
        if (setting.key.includes('split')) {
            const match = setting.key.match(/split_(\w+)/);
            if (match) {
                const audience = match[1];
                const percentage = extractValue(setting.value);
                distribution[audience] = typeof percentage === 'number' ? percentage : 0;
            }
        }
    });
    
    return distribution;
}

export default function Index({ ad_revenue = [], user_payout = [] }: IndexProps) {
    const revenueDistribution = getRevenueDistribution(ad_revenue);
    const totalPercentage = Object.values(revenueDistribution).reduce((a, b) => a + b, 0);
    
    const getRates = () => {
        return ad_revenue
            .filter(s => s.key.includes('_rate'))
            .map(s => ({
                label: s.key === 'cpc_base_rate' ? 'CPC Rate' : 'Per View Rate',
                value: extractValue(s.value),
                description: s.description,
            }));
    };

    const rates = getRates();
    const hasData = ad_revenue.length > 0 || user_payout.length > 0;

    return (
        <>
            <Head title="Monetization Settings" />
            <AdminLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Monetization Settings</h1>
                            <p className="text-muted-foreground">Configure platform monetization and revenue sharing</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={admin.monetizationSettings.revenueSplit.url()}>
                                <Button variant="outline">
                                    <Percent className="mr-2 h-4 w-4" />
                                    Revenue Split
                                </Button>
                            </Link>
                            <Link href={admin.monetizationSettings.payoutSettings.url()}>
                                <Button variant="outline">
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Payout Settings
                                </Button>
                            </Link>
                            <Link href={admin.monetizationSettings.edit.url()}>
                                <Button>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Settings
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* No Data Message */}
                    {!hasData && (
                        <Card className="border-amber-200 bg-amber-50">
                            <CardContent className="pt-6">
                                <p className="text-amber-900">
                                    No monetization settings data available. Please ensure the backend is returning <code className="bg-amber-100 px-2 py-1 rounded">ad_revenue</code> and <code className="bg-amber-100 px-2 py-1 rounded">user_payout</code> props.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Revenue Split Overview */}
                    {ad_revenue.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Percent className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <CardTitle>Ad Revenue Distribution</CardTitle>
                                        <CardDescription>Revenue split percentages across stakeholders</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Pie-like visual distribution */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            {Object.entries(revenueDistribution).map(([audience, percentage]) => {
                                                const colors: Record<string, string> = {
                                                    platform: 'bg-blue-500',
                                                    content_creator: 'bg-green-500',
                                                    viewer: 'bg-purple-500',
                                                };
                                                const displayName = audience === 'content_creator' ? 'Content Creator' : audience.charAt(0).toUpperCase() + audience.slice(1);
                                                
                                                return (
                                                    <div key={audience} className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium text-sm">{displayName}</span>
                                                            <span className="text-lg font-bold text-gray-900">{percentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                            <div
                                                                className={`h-full ${colors[audience] || 'bg-gray-500'} transition-all`}
                                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Summary Stats */}
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
                                                <div className="text-sm text-blue-600 font-medium">Total Distribution</div>
                                                <div className="text-3xl font-bold text-blue-900 mt-1">{totalPercentage}%</div>
                                            </div>
                                            {Object.entries(revenueDistribution).map(([audience, percentage]) => {
                                                const displayName = audience === 'content_creator' ? 'Creator' : audience.charAt(0).toUpperCase() + audience.slice(1);
                                                return (
                                                    <div key={audience} className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                                                        <div className="text-xs text-gray-600">{displayName}</div>
                                                        <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Status indicator */}
                                    {totalPercentage !== 100 && (
                                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                                            <p className="text-sm text-yellow-800">
                                                ⚠️ Distribution total is <strong>{totalPercentage}%</strong> (expected 100%). Please adjust percentages accordingly.
                                            </p>
                                        </div>
                                    )}
                                    {totalPercentage === 100 && (
                                        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                                            <p className="text-sm text-green-800">
                                                ✓ Revenue distribution is balanced at 100%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rates Cards */}
                    {rates.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <div>
                                    <CardTitle>Advertising Rates</CardTitle>
                                    <CardDescription>Base rates for cost-per-click and cost-per-view</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {rates.map((rate, idx) => (
                                        <div key={idx} className="rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
                                            <div className="text-sm text-gray-600 font-medium">{rate.label}</div>
                                            <div className="text-4xl font-bold text-gray-900 mt-2">
                                                ₦{typeof rate.value === 'number' ? rate.value.toFixed(4) : rate.value}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-3">{rate.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payout Settings */}
                    {user_payout.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <CardTitle>Payout Configuration</CardTitle>
                                        <CardDescription>User withdrawal settings and limits</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {user_payout.map((setting) => (
                                        <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{setting.key.replace(/_/g, ' ').toUpperCase()}</div>
                                                <p className="text-xs text-gray-600 mt-1">{setting.description}</p>
                                            </div>
                                            <div className="flex items-center gap-3 ml-4">
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        ₦{extractValue(setting.value)}
                                                    </div>
                                                </div>
                                                {setting.is_editable && (
                                                    <Badge variant="secondary" className="whitespace-nowrap">Editable</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
