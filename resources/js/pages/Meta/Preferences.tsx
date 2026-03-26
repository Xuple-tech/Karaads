import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface MetaAccount {
    id: number;
    account_name: string;
    platform: string;
}

interface Preference {
    id: number;
    enable_auto_reply: boolean;
    enable_message_analysis: boolean;
    require_approval_before_send: boolean;
    reply_tone: string;
    custom_instructions: string;
    auto_reply_delay_seconds: number;
    enabled_platforms: string[];
}

interface Props {
    metaAccount: MetaAccount;
    preference: Preference;
    availableTones: string[];
}

const toneDescriptions: Record<string, string> = {
    professional: 'Formal, business-appropriate responses',
    friendly: 'Warm, conversational tone',
    casual: 'Relaxed, informal responses',
    formal: 'Very formal and detailed responses',
};

export default function Preferences({ metaAccount, preference, availableTones = ['professional', 'friendly', 'casual', 'formal'] }: Props) {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        enable_auto_reply: preference.enable_auto_reply,
        enable_message_analysis: preference.enable_message_analysis,
        require_approval_before_send: preference.require_approval_before_send,
        reply_tone: preference.reply_tone,
        custom_instructions: preference.custom_instructions,
        auto_reply_delay_seconds: preference.auto_reply_delay_seconds,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);

        try {
            const response = await fetch(`/meta/accounts/${metaAccount.id}/preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSaved(true);
                toast.success('Preferences saved successfully!');
                setTimeout(() => setSaved(false), 3000);
            } else {
                toast.error('Failed to save preferences');
            }
        } catch (error) {
            toast.error('Error saving preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { label: 'Meta Automation', href: '/meta/dashboard' },
            { label: 'Accounts', href: '/meta/accounts' },
            { label: metaAccount.account_name, href: `/meta/accounts/${metaAccount.id}/conversations` },
            { label: 'Settings' },
        ]}>
            <Head title={`Preferences - ${metaAccount.account_name}`} />

            <div className="space-y-6 max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Automation Settings</h1>
                        <p className="text-muted-foreground mt-2">{metaAccount.account_name}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/meta/accounts/${metaAccount.id}/conversations`}>
                            ← Back
                        </Link>
                    </Button>
                </div>

                {/* Status Alert */}
                {saved && (
                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-900 dark:text-green-100">Changes saved</AlertTitle>
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            Your automation preferences have been updated successfully.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* AI Analysis Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Message Analysis</CardTitle>
                            <CardDescription>Control how messages are analyzed by the AI agent</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enable_message_analysis" className="text-base">Enable AI Analysis</Label>
                                    <p className="text-sm text-muted-foreground">Automatically analyze incoming messages for sentiment and intent</p>
                                </div>
                                <Switch
                                    id="enable_message_analysis"
                                    checked={formData.enable_message_analysis}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, enable_message_analysis: checked }))
                                    }
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="reply_tone" className="text-base">Reply Tone</Label>
                                <p className="text-sm text-muted-foreground mb-3">Choose how AI responses should sound</p>
                                <Select
                                    value={formData.reply_tone}
                                    onValueChange={(value) =>
                                        setFormData(prev => ({ ...prev, reply_tone: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTones.map(tone => (
                                            <SelectItem key={tone} value={tone} className="capitalize">
                                                <div>
                                                    <span className="capitalize">{tone}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        {toneDescriptions[tone]}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Auto-Reply Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Automatic Responses</CardTitle>
                            <CardDescription>Configure how the AI agent responds to messages</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enable_auto_reply" className="text-base">Enable Auto-Reply</Label>
                                    <p className="text-sm text-muted-foreground">Automatically send drafted replies without requiring approval</p>
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

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="require_approval_before_send" className="text-base">Require Approval</Label>
                                    <p className="text-sm text-muted-foreground">Review and approve each AI-generated response before sending</p>
                                </div>
                                <Switch
                                    id="require_approval_before_send"
                                    checked={formData.require_approval_before_send}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, require_approval_before_send: checked }))
                                    }
                                />
                            </div>

                            {formData.enable_auto_reply && !formData.require_approval_before_send && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label htmlFor="auto_reply_delay" className="text-base">Response Delay</Label>
                                        <p className="text-sm text-muted-foreground mb-3">Wait before auto-sending responses (in seconds)</p>
                                        <Input
                                            id="auto_reply_delay"
                                            type="number"
                                            min="0"
                                            max="3600"
                                            step="1"
                                            value={formData.auto_reply_delay_seconds}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    auto_reply_delay_seconds: parseInt(e.target.value) || 0,
                                                }))
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">0 = send immediately</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Custom Instructions Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Custom Instructions</CardTitle>
                            <CardDescription>Guide the AI with specific rules and preferences</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="custom_instructions" className="text-base">Instructions</Label>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Provide specific guidelines for how the AI should respond. Examples: "Always be brief", "Recommend our Pro plan", "Refer to ticket system for issues"
                                </p>
                                <Textarea
                                    id="custom_instructions"
                                    placeholder="e.g., Always end responses with 'Is there anything else I can help with?'"
                                    value={formData.custom_instructions}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            custom_instructions: e.target.value,
                                        }))
                                    }
                                    rows={5}
                                    className="font-mono text-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/meta/accounts/${metaAccount.id}/conversations`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
                            Save Settings
                        </Button>
                    </div>
                </form>

                {/* Help Card */}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">🤖 How AI Agent Works</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                        <p>
                            <strong>1. Analyze:</strong> Each incoming message is analyzed for sentiment (positive/negative/neutral) and category (question/complaint/feedback/etc).
                        </p>
                        <p>
                            <strong>2. Draft:</strong> The AI generates a response using your configured tone, instructions, and conversation context.
                        </p>
                        <p>
                            <strong>3. Review/Send:</strong> If approval is required, you review and can edit before sending. Otherwise, it sends automatically after the configured delay.
                        </p>
                        <p>
                            <strong>Tip:</strong> Start with "Require Approval" enabled to review how the AI works, then enable auto-reply once you're confident in the responses.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
