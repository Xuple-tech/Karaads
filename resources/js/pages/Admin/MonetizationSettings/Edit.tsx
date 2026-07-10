import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertCircle, DollarSign, Percent, TrendingUp } from 'lucide-react';
import admin from '@/routes/admin';

interface Setting {
    id: string;
    key: string;
    value: unknown;
    description: string;
    data_type: string;
    category: string;
    min_value: string | null;
    max_value: string | null;
    options: unknown;
}

interface EditProps {
    settings: Setting[];
}

function extractNumericValue(value: unknown): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        if (obj.percentage !== undefined) return Number(obj.percentage);
        if (obj.amount !== undefined) return Number(obj.amount);
        return 0;
    }
    return Number(value) || 0;
}

function wrapValue(value: number, key: string): string | object {
    // If it's a percentage key, wrap in {percentage: value}
    if (key.includes('percentage') || key.includes('split')) {
        return { percentage: value };
    }
    // If it's an amount/rate key, wrap in {amount: value}
    if (key.includes('rate') || key.includes('amount') || key.includes('payout')) {
        return { amount: value };
    }
    return value;
}

export default function Edit({ settings }: EditProps) {
    const initialSettings = settings.map((s) => ({
        key: s.key,
        value: extractNumericValue(s.value),
    }));

    const { data, setData, put, processing, errors } = useForm({
        settings: initialSettings,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Transform values to proper format before sending
        const transformedSettings = data.settings.map((s) => ({
            key: s.key,
            value: wrapValue(s.value as number, s.key),
        }));
        
        put(admin.monetizationSettings.update.url(), {
            data: { settings: transformedSettings },
        });
    };

    const handleSettingChange = (key: string, value: number) => {
        const newSettings = data.settings.map((s) =>
            s.key === key ? { ...s, value } : s
        );
        setData('settings', newSettings);
    };

    // Group settings by category
    const settingsByCategory = settings.reduce(
        (acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting);
            return acc;
        },
        {} as Record<string, Setting[]>
    );

    const categoryConfig: Record<string, { icon: React.ReactNode; title: string; color: string }> = {
        ad_revenue: {
            icon: <DollarSign className="h-5 w-5" />,
            title: 'Ad Revenue Settings',
            color: 'blue',
        },
        user_payout: {
            icon: <Percent className="h-5 w-5" />,
            title: 'User Payout Settings',
            color: 'purple',
        },
    };

    return (
        <>
            <Head title="Edit Monetization Settings" />
            <AdminLayout>
                <div className="max-w-4xl">
                    <Link
                        href={admin.monetizationSettings.index.url()}
                        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Settings
                    </Link>

                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Monetization Settings</CardTitle>
                            <CardDescription>
                                Update platform monetization configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {Object.entries(settingsByCategory).map(([category, categorySettings]) => {
                                    const config = categoryConfig[category];
                                    const colors = {
                                        blue: 'border-blue-200 bg-blue-50',
                                        purple: 'border-purple-200 bg-purple-50',
                                    };

                                    return (
                                        <div
                                            key={category}
                                            className={`rounded-lg border p-6 ${colors[config?.color as keyof typeof colors] || 'border-gray-200'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-6">
                                                {config?.icon}
                                                <h3 className="text-lg font-semibold">{config?.title}</h3>
                                            </div>

                                            <div className="grid gap-6">
                                                {categorySettings.map((setting) => {
                                                    const settingData = data.settings.find(
                                                        (s) => s.key === setting.key
                                                    );
                                                    const currentValue = settingData?.value ?? 0;

                                                    const isPercentage = setting.key.includes('split') || setting.key.includes('percentage');
                                                    const suffix = isPercentage ? '%' : '₦';

                                                    return (
                                                        <div key={setting.id} className="space-y-3">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <Label
                                                                        htmlFor={setting.key}
                                                                        className="block font-medium text-sm"
                                                                    >
                                                                        {setting.key
                                                                            .replace(/_/g, ' ')
                                                                            .replace(/\b\w/g, (l) =>
                                                                                l.toUpperCase()
                                                                            )}
                                                                    </Label>
                                                                    {setting.description && (
                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {setting.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-2xl font-bold text-gray-900">
                                                                        {suffix}
                                                                        {typeof currentValue === 'number'
                                                                            ? currentValue.toFixed(
                                                                                isPercentage ? 1 : 2
                                                                            )
                                                                            : '0'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <Input
                                                                id={setting.key}
                                                                type="number"
                                                                value={currentValue}
                                                                onChange={(e) =>
                                                                    handleSettingChange(
                                                                        setting.key,
                                                                        parseFloat(e.target.value) || 0
                                                                    )
                                                                }
                                                                step={isPercentage ? '0.1' : '0.01'}
                                                                min={setting.min_value || '0'}
                                                                max={setting.max_value || undefined}
                                                                className="text-lg font-semibold"
                                                            />

                                                            {setting.min_value !== null &&
                                                                setting.max_value !== null && (
                                                                    <div className="flex justify-between text-xs text-gray-500">
                                                                        <span>
                                                                            Min: {suffix}
                                                                            {Number(setting.min_value).toFixed(2)}
                                                                        </span>
                                                                        <span>
                                                                            Max: {suffix}
                                                                            {Number(setting.max_value).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {errors.settings && (
                                    <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600">{errors.settings}</p>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-6 border-t">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        </>
    );
}
