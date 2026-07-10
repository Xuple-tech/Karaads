import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, DollarSign, TrendingUp, Users } from 'lucide-react';

interface Settings {
    earnings_per_second: number;
    min_completed_view_earnings: number;
    min_partial_view_earnings: number;
    min_view_duration: number;
    max_daily_earnings: number;
    ads_per_user_per_day: number;
    withdrawal_minimum: number;
    withdrawal_fee_percentage: number;
    currency: string;
    payment_methods: string[];
}

interface EarningsSettingsProps {
    settings: Settings;
}

export default function EarningsSettingsIndex({
    settings,
}: EarningsSettingsProps) {
    const { data, setData, post, processing, errors } = useForm(settings);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/earnings-settings');
    };

    return (
        <>
            <Head title="Earnings Settings" />
            <AdminLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Earnings Configuration
                        </h1>
                        <p className="text-muted-foreground">
                            Configure user earnings, ad rewards, and withdrawal
                            settings
                        </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <DollarSign className="h-4 w-4" />
                                    Earnings Per Second
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    ${data.earnings_per_second.toFixed(4)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <TrendingUp className="h-4 w-4" />
                                    Min Completed View
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    $
                                    {data.min_completed_view_earnings.toFixed(
                                        2,
                                    )}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                    Min View Duration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {data.min_view_duration}s
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    Ads Per User/Day
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {data.ads_per_user_per_day}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Settings Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Earning Rates</CardTitle>
                            <CardDescription>
                                Configure how much users earn for viewing ads
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="earnings_per_second">
                                            Earnings Per Second ($)
                                        </Label>
                                        <Input
                                            id="earnings_per_second"
                                            type="number"
                                            step="0.0001"
                                            value={data.earnings_per_second}
                                            onChange={(e) =>
                                                setData(
                                                    'earnings_per_second',
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                        />
                                        {errors.earnings_per_second && (
                                            <p className="text-sm text-red-600">
                                                {errors.earnings_per_second}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="min_completed_view_earnings">
                                            Min Completed View Earnings ($)
                                        </Label>
                                        <Input
                                            id="min_completed_view_earnings"
                                            type="number"
                                            step="0.01"
                                            value={
                                                data.min_completed_view_earnings
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'min_completed_view_earnings',
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                        />
                                        {errors.min_completed_view_earnings && (
                                            <p className="text-sm text-red-600">
                                                {
                                                    errors.min_completed_view_earnings
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="min_partial_view_earnings">
                                            Min Partial View Earnings ($)
                                        </Label>
                                        <Input
                                            id="min_partial_view_earnings"
                                            type="number"
                                            step="0.0001"
                                            value={
                                                data.min_partial_view_earnings
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'min_partial_view_earnings',
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                        />
                                        {errors.min_partial_view_earnings && (
                                            <p className="text-sm text-red-600">
                                                {
                                                    errors.min_partial_view_earnings
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="min_view_duration">
                                            Min View Duration (seconds)
                                        </Label>
                                        <Input
                                            id="min_view_duration"
                                            type="number"
                                            value={data.min_view_duration}
                                            onChange={(e) =>
                                                setData(
                                                    'min_view_duration',
                                                    parseInt(e.target.value),
                                                )
                                            }
                                        />
                                        {errors.min_view_duration && (
                                            <p className="text-sm text-red-600">
                                                {errors.min_view_duration}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <hr />

                                <h3 className="font-semibold">
                                    Daily Limits & Withdrawals
                                </h3>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="max_daily_earnings">
                                            Max Daily Earnings ($)
                                        </Label>
                                        <Input
                                            id="max_daily_earnings"
                                            type="number"
                                            step="0.01"
                                            value={data.max_daily_earnings}
                                            onChange={(e) =>
                                                setData(
                                                    'max_daily_earnings',
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                        />
                                        {errors.max_daily_earnings && (
                                            <p className="text-sm text-red-600">
                                                {errors.max_daily_earnings}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ads_per_user_per_day">
                                            Ads Per User Per Day
                                        </Label>
                                        <Input
                                            id="ads_per_user_per_day"
                                            type="number"
                                            value={data.ads_per_user_per_day}
                                            onChange={(e) =>
                                                setData(
                                                    'ads_per_user_per_day',
                                                    parseInt(e.target.value),
                                                )
                                            }
                                        />
                                        {errors.ads_per_user_per_day && (
                                            <p className="text-sm text-red-600">
                                                {errors.ads_per_user_per_day}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="withdrawal_minimum">
                                            Withdrawal Minimum ($)
                                        </Label>
                                        <Input
                                            id="withdrawal_minimum"
                                            type="number"
                                            step="0.01"
                                            value={data.withdrawal_minimum}
                                            onChange={(e) =>
                                                setData(
                                                    'withdrawal_minimum',
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                        />
                                        {errors.withdrawal_minimum && (
                                            <p className="text-sm text-red-600">
                                                {errors.withdrawal_minimum}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="withdrawal_fee_percentage">
                                            Withdrawal Fee (%)
                                        </Label>
                                        <Input
                                            id="withdrawal_fee_percentage"
                                            type="number"
                                            step="0.1"
                                            value={
                                                data.withdrawal_fee_percentage
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'withdrawal_fee_percentage',
                                                    parseFloat(e.target.value),
                                                )
                                            }
                                        />
                                        {errors.withdrawal_fee_percentage && (
                                            <p className="text-sm text-red-600">
                                                {
                                                    errors.withdrawal_fee_percentage
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Settings'}
                                    </Button>
                                    <Button type="button" variant="outline">
                                        Reset to Defaults
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                            <CardDescription>
                                Supported payment methods for user withdrawals
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                {data.payment_methods.map((method) => (
                                    <Badge
                                        key={method}
                                        variant="secondary"
                                        className="capitalize"
                                    >
                                        {method.replace('_', ' ')}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        </>
    );
}
