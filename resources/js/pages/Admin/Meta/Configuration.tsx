import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface MetaConfig {
    id: number;
    client_id: string;
    webhook_verify_token: string;
    max_accounts_per_user: number;
    require_subscription: boolean;
    min_subscription_tier: string;
    enable_facebook: boolean;
    enable_instagram: boolean;
    enable_whatsapp: boolean;
    whatsapp_business_only: boolean;
    default_reply_tone: string;
    enable_auto_analysis: boolean;
    enable_auto_reply: boolean;
    default_auto_reply_delay: number;
}

interface Props {
    config: MetaConfig;
    subscriptionTiers: Array<{ id: string; name: string; }>;
}

export default function MetaConfiguration({ config, subscriptionTiers }: Props) {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showSecrets, setShowSecrets] = useState(false);
    const [formData, setFormData] = useState(config);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);

        try {
            const response = await fetch('/admin/meta/configuration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSaved(true);
                toast.success('Configuration saved successfully!');
                setTimeout(() => setSaved(false), 3000);
            } else {
                toast.error('Failed to save configuration');
            }
        } catch (error) {
            toast.error('Error saving configuration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Meta Configuration' },
        ]}>
            <Head title="Meta Configuration" />

            <div className="space-y-6 max-w-3xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meta Platform Configuration</h1>
                    <p className="text-muted-foreground mt-2">Configure Meta API credentials and automation settings</p>
                </div>

                {/* Status Alert */}
                {saved && (
                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-900 dark:text-green-100">Configuration saved</AlertTitle>
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            Meta platform settings have been updated successfully.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* API Credentials */}
                    <Card>
                        <CardHeader>
                            <CardTitle>API Credentials</CardTitle>
                            <CardDescription>Meta Graph API authentication details from developers.facebook.com</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="client_id">Meta App ID</Label>
                                <Input
                                    id="client_id"
                                    placeholder="Your Meta App ID"
                                    value={formData.client_id}
                                    onChange={(e) =>
                                        setFormData(prev => ({ ...prev, client_id: e.target.value }))
                                    }
                                    type={showSecrets ? 'text' : 'password'}
                                />
                                <p className="text-xs text-muted-foreground">Found in Meta App Dashboard → Settings → Basic</p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="webhook_verify_token">Webhook Verify Token</Label>
                                <Input
                                    id="webhook_verify_token"
                                    placeholder="Your webhook verify token"
                                    value={formData.webhook_verify_token}
                                    onChange={(e) =>
                                        setFormData(prev => ({ ...prev, webhook_verify_token: e.target.value }))
                                    }
                                    type={showSecrets ? 'text' : 'password'}
                                />
                                <p className="text-xs text-muted-foreground">Custom token for webhook verification</p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Switch
                                    checked={showSecrets}
                                    onCheckedChange={setShowSecrets}
                                    id="show_secrets"
                                />
                                <Label htmlFor="show_secrets" className="text-sm cursor-pointer">Show sensitive values</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feature Access Control */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Access</CardTitle>
                            <CardDescription>Control who can access Meta automation features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="require_subscription" className="text-base">Require Subscription</Label>
                                    <p className="text-sm text-muted-foreground">Only allow paid subscribers to use Meta automation</p>
                                </div>
                                <Switch
                                    id="require_subscription"
                                    checked={formData.require_subscription}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, require_subscription: checked }))
                                    }
                                />
                            </div>

                            {formData.require_subscription && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label htmlFor="min_subscription_tier">Minimum Subscription Tier</Label>
                                        <Select
                                            value={formData.min_subscription_tier}
                                            onValueChange={(value) =>
                                                setFormData(prev => ({ ...prev, min_subscription_tier: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subscriptionTiers.map(tier => (
                                                    <SelectItem key={tier.id} value={tier.id}>
                                                        {tier.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="max_accounts_per_user">Max Accounts Per User</Label>
                                <Input
                                    id="max_accounts_per_user"
                                    type="number"
                                    min="1"
                                    value={formData.max_accounts_per_user}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            max_accounts_per_user: parseInt(e.target.value) || 1,
                                        }))
                                    }
                                />
                                <p className="text-xs text-muted-foreground">Limit the number of Meta accounts users can connect</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Platform Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Availability</CardTitle>
                            <CardDescription>Choose which platforms users can connect</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enable_facebook" className="text-base">Facebook</Label>
                                    <p className="text-sm text-muted-foreground">Allow users to connect Facebook Pages</p>
                                </div>
                                <Switch
                                    id="enable_facebook"
                                    checked={formData.enable_facebook}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, enable_facebook: checked }))
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enable_instagram" className="text-base">Instagram</Label>
                                    <p className="text-sm text-muted-foreground">Allow users to connect Instagram Business accounts</p>
                                </div>
                                <Switch
                                    id="enable_instagram"
                                    checked={formData.enable_instagram}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, enable_instagram: checked }))
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="enable_whatsapp" className="text-base">WhatsApp Business</Label>
                                        <p className="text-sm text-muted-foreground">Allow users to connect WhatsApp Business accounts</p>
                                    </div>
                                    <Switch
                                        id="enable_whatsapp"
                                        checked={formData.enable_whatsapp}
                                        onCheckedChange={(checked) =>
                                            setFormData(prev => ({ ...prev, enable_whatsapp: checked }))
                                        }
                                    />
                                </div>

                                {formData.enable_whatsapp && (
                                    <>
                                        <Separator className="mt-4" />
                                        <div className="flex items-center justify-between pt-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="whatsapp_business_only" className="text-base">Business Accounts Only</Label>
                                                <p className="text-sm text-muted-foreground">Restrict WhatsApp to business account holders only</p>
                                            </div>
                                            <Switch
                                                id="whatsapp_business_only"
                                                checked={formData.whatsapp_business_only}
                                                onCheckedChange={(checked) =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        whatsapp_business_only: checked,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Agent Defaults */}
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Agent Defaults</CardTitle>
                            <CardDescription>Default settings for automated message analysis and responses</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enable_auto_analysis" className="text-base">Enable Auto-Analysis</Label>
                                    <p className="text-sm text-muted-foreground">Automatically analyze all incoming messages</p>
                                </div>
                                <Switch
                                    id="enable_auto_analysis"
                                    checked={formData.enable_auto_analysis}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, enable_auto_analysis: checked }))
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enable_auto_reply" className="text-base">Enable Auto-Reply</Label>
                                    <p className="text-sm text-muted-foreground">Automatically send AI-generated responses by default</p>
                                </div>
                                <Switch
                                    id="enable_auto_reply"
                                    checked={formData.enable_auto_reply}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, enable_auto_reply: checked }))
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="default_reply_tone">Default Reply Tone</Label>
                                <Select
                                    value={formData.default_reply_tone}
                                    onValueChange={(value) =>
                                        setFormData(prev => ({ ...prev, default_reply_tone: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="professional">Professional</SelectItem>
                                        <SelectItem value="friendly">Friendly</SelectItem>
                                        <SelectItem value="casual">Casual</SelectItem>
                                        <SelectItem value="formal">Formal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="default_auto_reply_delay">Default Auto-Reply Delay (seconds)</Label>
                                <Input
                                    id="default_auto_reply_delay"
                                    type="number"
                                    min="0"
                                    max="3600"
                                    step="1"
                                    value={formData.default_auto_reply_delay}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            default_auto_reply_delay: parseInt(e.target.value) || 0,
                                        }))
                                    }
                                />
                                <p className="text-xs text-muted-foreground">Delay before sending automatic responses (0 = immediate)</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end gap-2">
                        <Button asChild variant="outline">
                            <Link href="/admin/dashboard">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                            Save Configuration
                        </Button>
                    </div>
                </form>

                {/* Help Card */}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">Setup Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-3">
                        <div>
                            <strong>1. Get Meta API Credentials:</strong>
                            <p className="ml-4 mt-1">
                                Visit <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">developers.facebook.com</a>, create an app, and get your App ID from Settings → Basic.
                            </p>
                        </div>
                        <div>
                            <strong>2. Configure Webhook:</strong>
                            <p className="ml-4 mt-1">
                                In your Meta App Dashboard, set the webhook URL to: <code className="bg-blue-900 px-2 py-1 rounded text-xs">https://yourdomain.com/meta/webhook</code>
                            </p>
                        </div>
                        <div>
                            <strong>3. Test Connection:</strong>
                            <p className="ml-4 mt-1">
                                After saving, navigate to a user account and use the "Test Connection" button to verify the setup.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
