import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import admin from '@/routes/admin';

interface RevenueSplitProps {
    revenueSplits: {
        platform_share: number;
        creator_share: number;
        viewer_share: number;
        cpm_rate: number;
        cpc_rate: number;
        cpa_rate: number;
    };
    settings: unknown[];
}

export default function RevenueSplit({ revenueSplits }: RevenueSplitProps) {
    const { data, setData, put, processing, errors } = useForm({
        platform_share: revenueSplits.platform_share || 50,
        creator_share: revenueSplits.creator_share || 40,
        viewer_share: revenueSplits.viewer_share || 10,
        cpm_rate: revenueSplits.cpm_rate || 2,
        cpc_rate: revenueSplits.cpc_rate || 0.5,
        cpa_rate: revenueSplits.cpa_rate || 2,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(admin.monetizationSettings.revenueSplit.url());
    };

    const totalShare = data.platform_share + data.creator_share + data.viewer_share;
    const isBalanced = totalShare === 100;

    return (
        <>
            <Head title="Revenue Split Settings" />
            <AdminLayout>
                <div className="max-w-4xl">
                    <Link href={admin.monetizationSettings.index.url()} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Settings
                    </Link>

                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Share Distribution</CardTitle>
                                <CardDescription>Define how platform revenue is distributed among stakeholders</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="platform_share">Platform Share (%)</Label>
                                                <span className="text-sm font-semibold text-blue-600">{data.platform_share}%</span>
                                            </div>
                                            <Input
                                                id="platform_share"
                                                type="number"
                                                value={data.platform_share}
                                                onChange={(e) => setData('platform_share', parseFloat(e.target.value) || 0)}
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className={errors.platform_share ? 'border-red-500' : ''}
                                            />
                                            <div className="w-full h-2 bg-gray-200 rounded" style={{background: `linear-gradient(to right, #2563eb ${data.platform_share}%, #e5e7eb 0%)`}} />
                                            {errors.platform_share && <p className="text-sm text-red-500">{errors.platform_share}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="creator_share">Creator Share (%)</Label>
                                                <span className="text-sm font-semibold text-green-600">{data.creator_share}%</span>
                                            </div>
                                            <Input
                                                id="creator_share"
                                                type="number"
                                                value={data.creator_share}
                                                onChange={(e) => setData('creator_share', parseFloat(e.target.value) || 0)}
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className={errors.creator_share ? 'border-red-500' : ''}
                                            />
                                            <div className="w-full h-2 bg-gray-200 rounded" style={{background: `linear-gradient(to right, #16a34a ${data.creator_share}%, #e5e7eb 0%)`}} />
                                            {errors.creator_share && <p className="text-sm text-red-500">{errors.creator_share}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="viewer_share">Viewer Share (%)</Label>
                                                <span className="text-sm font-semibold text-purple-600">{data.viewer_share}%</span>
                                            </div>
                                            <Input
                                                id="viewer_share"
                                                type="number"
                                                value={data.viewer_share}
                                                onChange={(e) => setData('viewer_share', parseFloat(e.target.value) || 0)}
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className={errors.viewer_share ? 'border-red-500' : ''}
                                            />
                                            <div className="w-full h-2 bg-gray-200 rounded" style={{background: `linear-gradient(to right, #a855f7 ${data.viewer_share}%, #e5e7eb 0%)`}} />
                                            {errors.viewer_share && <p className="text-sm text-red-500">{errors.viewer_share}</p>}
                                        </div>

                                        <div className={`rounded-lg p-4 flex items-center justify-between ${isBalanced ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className={`h-5 w-5 ${isBalanced ? 'text-green-600' : 'text-yellow-600'}`} />
                                                <span className={`text-sm font-semibold ${isBalanced ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    Total: {totalShare}%
                                                </span>
                                            </div>
                                            {!isBalanced && (
                                                <span className="text-xs text-yellow-600">Must equal 100%</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold mb-4">Pricing Models</h3>
                                        <div className="grid gap-6 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="cpm_rate">Per View Rate (₦)</Label>
                                                <div className="text-2xl font-bold text-blue-600">₦{data.cpm_rate.toFixed(2)}</div>
                                                <Input
                                                    id="cpm_rate"
                                                    type="number"
                                                    value={data.cpm_rate}
                                                    onChange={(e) => setData('cpm_rate', parseFloat(e.target.value) || 0)}
                                                    step="0.01"
                                                    min="0"
                                                    className={errors.cpm_rate ? 'border-red-500' : ''}
                                                />
                                                <p className="text-xs text-muted-foreground">Cost per 1,000 impressions</p>
                                                {errors.cpm_rate && <p className="text-sm text-red-500">{errors.cpm_rate}</p>}
                                            </div>

                                            <div className="space-y-2">
                                            <Label htmlFor="cpc_rate">CPC Rate (₦)</Label>
                                                <div className="text-2xl font-bold text-green-600">₦{data.cpc_rate.toFixed(2)}</div>
                                                <Input
                                                    id="cpc_rate"
                                                    type="number"
                                                    value={data.cpc_rate}
                                                    onChange={(e) => setData('cpc_rate', parseFloat(e.target.value) || 0)}
                                                    step="0.01"
                                                    min="0"
                                                    className={errors.cpc_rate ? 'border-red-500' : ''}
                                                />
                                                <p className="text-xs text-muted-foreground">Cost per click</p>
                                                {errors.cpc_rate && <p className="text-sm text-red-500">{errors.cpc_rate}</p>}
                                            </div>

                                            <div className="space-y-2">
                                            <Label htmlFor="cpa_rate">CPA Rate (₦)</Label>
                                                <div className="text-2xl font-bold text-purple-600">₦{data.cpa_rate.toFixed(2)}</div>
                                                <Input
                                                    id="cpa_rate"
                                                    type="number"
                                                    value={data.cpa_rate}
                                                    onChange={(e) => setData('cpa_rate', parseFloat(e.target.value) || 0)}
                                                    step="0.01"
                                                    min="0"
                                                    className={errors.cpa_rate ? 'border-red-500' : ''}
                                                />
                                                <p className="text-xs text-muted-foreground">Cost per action/conversion</p>
                                                {errors.cpa_rate && <p className="text-sm text-red-500">{errors.cpa_rate}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {errors.error && (
                                        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                            <p className="text-sm text-red-600">{errors.error}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-6 border-t">
                                        <Button type="submit" disabled={processing || !isBalanced}>
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
