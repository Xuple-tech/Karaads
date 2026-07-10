import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import admin from '@/routes/admin';

interface PayoutSettingsProps {
    payoutSettings: {
        minimum_payout: number;
        maximum_payout: number;
        payout_frequency: string;
        payout_methods: string[];
        processing_fee_percentage: number;
        processing_time_days: number;
    };
}

export default function PayoutSettings({ payoutSettings }: PayoutSettingsProps) {
    const { data, setData, put, processing, errors } = useForm({
        minimum_payout: typeof payoutSettings.minimum_payout === 'object' 
            ? payoutSettings.minimum_payout?.amount || 1000
            : payoutSettings.minimum_payout || 1000,
        maximum_payout: typeof payoutSettings.maximum_payout === 'object'
            ? payoutSettings.maximum_payout?.amount || 100000
            : payoutSettings.maximum_payout || 100000,
        payout_frequency: payoutSettings.payout_frequency || 'weekly',
        payout_methods: payoutSettings.payout_methods || ['bank_transfer', 'paypal'],
        processing_fee_percentage: typeof payoutSettings.processing_fee_percentage === 'object'
            ? payoutSettings.processing_fee_percentage?.percentage || 2
            : payoutSettings.processing_fee_percentage || 2,
        processing_time_days: typeof payoutSettings.processing_time_days === 'object'
            ? payoutSettings.processing_time_days?.days || 3
            : payoutSettings.processing_time_days || 3,
    });

    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault();
        put(admin.monetizationSettings.payoutSettings.url());
    };

    const togglePayoutMethod = (method: string) => {
        const updated = data.payout_methods.includes(method)
            ? data.payout_methods.filter((m) => m !== method)
            : [...data.payout_methods, method];
        setData('payout_methods', updated);
    };

    const payoutMethods = [
        { id: 'bank_transfer', label: 'Bank Transfer' },
        { id: 'paypal', label: 'PayPal' },
        { id: 'crypto', label: 'Cryptocurrency' },
    ];

    return (
        <>
            <Head title="Payout Settings" />
            <AdminLayout>
                <div className="max-w-4xl">
                    <Link href={admin.monetizationSettings.index.url()} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Settings
                    </Link>

                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payout Configuration</CardTitle>
                                <CardDescription>Configure how creators withdraw their earnings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="minimum_payout">Minimum Payout Amount (₦)</Label>
                                            <Input
                                                id="minimum_payout"
                                                type="number"
                                                value={data.minimum_payout}
                                                onChange={(e) => setData('minimum_payout', parseFloat(e.target.value))}
                                                step="0.01"
                                                min="0"
                                                className={errors.minimum_payout ? 'border-red-500' : ''}
                                            />
                                            <p className="text-xs text-muted-foreground">Minimum balance required to request a payout</p>
                                            {errors.minimum_payout && <p className="text-sm text-red-500">{errors.minimum_payout}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="maximum_payout">Maximum Payout Amount (₦)</Label>
                                            <Input
                                                id="maximum_payout"
                                                type="number"
                                                value={data.maximum_payout}
                                                onChange={(e) => setData('maximum_payout', parseFloat(e.target.value))}
                                                step="0.01"
                                                min="0"
                                                className={errors.maximum_payout ? 'border-red-500' : ''}
                                            />
                                            <p className="text-xs text-muted-foreground">Maximum amount per payout request</p>
                                            {errors.maximum_payout && <p className="text-sm text-red-500">{errors.maximum_payout}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="payout_frequency">Payout Frequency</Label>
                                            <Select value={data.payout_frequency} onValueChange={(value) => setData('payout_frequency', value)}>
                                                <SelectTrigger id="payout_frequency" className={errors.payout_frequency ? 'border-red-500' : ''}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">How often payouts are processed</p>
                                            {errors.payout_frequency && <p className="text-sm text-red-500">{errors.payout_frequency}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="processing_time_days">Processing Time (Days)</Label>
                                            <Input
                                                id="processing_time_days"
                                                type="number"
                                                value={data.processing_time_days}
                                                onChange={(e) => setData('processing_time_days', parseInt(e.target.value))}
                                                step="1"
                                                min="1"
                                                className={errors.processing_time_days ? 'border-red-500' : ''}
                                            />
                                            <p className="text-xs text-muted-foreground">Time to complete payout transfer</p>
                                            {errors.processing_time_days && <p className="text-sm text-red-500">{errors.processing_time_days}</p>}
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold mb-4">Payout Methods</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Select which payment methods are available to users</p>
                                        
                                        <div className="space-y-3">
                                            {payoutMethods.map((method) => (
                                                <div key={method.id} className="flex items-center gap-3 rounded-lg border p-4">
                                                    <Checkbox
                                                        id={method.id}
                                                        checked={data.payout_methods.includes(method.id)}
                                                        onCheckedChange={() => togglePayoutMethod(method.id)}
                                                    />
                                                    <Label htmlFor={method.id} className="flex-1 m-0 cursor-pointer">
                                                        {method.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>

                                        {errors.payout_methods && <p className="text-sm text-red-500 mt-2">{errors.payout_methods}</p>}
                                    </div>

                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold mb-4">Processing Fees</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="processing_fee_percentage">Processing Fee (%)</Label>
                                            <div className="flex items-end gap-4">
                                                <div className="flex-1">
                                                    <Input
                                                        id="processing_fee_percentage"
                                                        type="number"
                                                        value={data.processing_fee_percentage}
                                                        onChange={(e) => setData('processing_fee_percentage', parseFloat(e.target.value))}
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        className={errors.processing_fee_percentage ? 'border-red-500' : ''}
                                                    />
                                                </div>
                                                <div className="text-right pb-2">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {data.processing_fee_percentage.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Fee deducted from payout amount</p>
                                            {errors.processing_fee_percentage && <p className="text-sm text-red-500">{errors.processing_fee_percentage}</p>}
                                        </div>

                                        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                                            <p className="text-sm text-blue-900">
                                                <strong>Example:</strong> If a user requests ₦{Number((10000 - 10000 * (data.processing_fee_percentage / 100)).toFixed(2))}, the platform retains ₦{Number((10000 * (data.processing_fee_percentage / 100)).toFixed(2))} as processing fee
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
