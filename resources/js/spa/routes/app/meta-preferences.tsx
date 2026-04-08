import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, BotMessageSquare, CheckCircle, Loader2, Save, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';

type AIMode = {
    id: number;
    name: string;
    description: string;
    emoji: string;
};

type PreferenceResponse = {
    metaAccount: {
        id: string;
        account_name: string;
        platform: string;
    };
    preference: {
        id: string;
        enable_auto_reply: boolean;
        enable_message_analysis: boolean;
        require_approval_before_send: boolean;
        reply_tone: string;
        ai_mode_id: number | null;
        custom_instructions: string | null;
        auto_reply_delay_seconds: number;
    };
    availableTones: string[];
    availableAiModes: AIMode[];
};

export function Component() {
    const { accountId } = useParams();
    const [form, setForm] = useState({
        enable_auto_reply: false,
        enable_message_analysis: true,
        require_approval_before_send: true,
        reply_tone: 'professional',
        ai_mode_id: null as number | null,
        custom_instructions: '',
        auto_reply_delay_seconds: 0,
    });

    const preferencesQuery = useQuery({
        queryKey: ['spa', 'meta', 'account', accountId, 'preferences'],
        queryFn: () => apiRequest<PreferenceResponse>(`/api/meta/accounts/${accountId}/preferences`),
        enabled: Boolean(accountId),
    });

    useEffect(() => {
        const preference = preferencesQuery.data?.preference;

        if (!preference) {
            return;
        }

        setForm({
            enable_auto_reply: preference.enable_auto_reply,
            enable_message_analysis: preference.enable_message_analysis,
            require_approval_before_send: preference.require_approval_before_send,
            reply_tone: preference.reply_tone,
            ai_mode_id: preference.ai_mode_id,
            custom_instructions: preference.custom_instructions ?? '',
            auto_reply_delay_seconds: preference.auto_reply_delay_seconds,
        });
    }, [preferencesQuery.data?.preference]);

    const saveMutation = useMutation({
        mutationFn: () =>
            apiRequest(`/api/meta/accounts/${accountId}/preferences`, {
                method: 'PUT',
                json: form,
            }),
        onSuccess: async () => {
            toast.success('Bot preferences updated');
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'account', accountId, 'preferences'] }),
                queryClient.invalidateQueries({ queryKey: ['spa', 'meta', 'dashboard'] }),
            ]);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to save preferences.'),
    });

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            <div className="space-y-2">
                <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-foreground">
                    <Link to={`/meta/accounts/${accountId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to workspace
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {preferencesQuery.data?.metaAccount.account_name ?? 'Bot preferences'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure approvals, tone, and the AI personality used for this Meta account.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Message Analysis</CardTitle>
                        <CardDescription>Control whether inbound messages should be analyzed and drafted by AI.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <Label className="font-medium">Enable message analysis</Label>
                                <p className="mt-1 text-sm text-muted-foreground">Analyze incoming messages and prepare structured AI drafts.</p>
                            </div>
                            <Switch
                                checked={form.enable_message_analysis}
                                onCheckedChange={(value) => setForm((current) => ({ ...current, enable_message_analysis: value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Reply tone</Label>
                            <Select value={form.reply_tone} onValueChange={(value) => setForm((current) => ({ ...current, reply_tone: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(preferencesQuery.data?.availableTones ?? []).map((tone) => (
                                        <SelectItem key={tone} value={tone} className="capitalize">
                                            {tone}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Bot Personality
                        </CardTitle>
                        <CardDescription>Choose the persona your Meta bot should use when drafting and sending replies.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setForm((current) => ({ ...current, ai_mode_id: null }))}
                                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                                    form.ai_mode_id === null ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/30'
                                }`}
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                                    <BotMessageSquare className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-foreground">Default Assistant</p>
                                    <p className="text-sm text-muted-foreground">Uses the selected reply tone without a special business persona.</p>
                                </div>
                                {form.ai_mode_id === null && <CheckCircle className="h-4 w-4 text-primary" />}
                            </button>

                            {(preferencesQuery.data?.availableAiModes ?? []).map((mode) => (
                                <button
                                    key={mode.id}
                                    type="button"
                                    onClick={() => setForm((current) => ({ ...current, ai_mode_id: mode.id }))}
                                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                                        form.ai_mode_id === mode.id ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/30'
                                    }`}
                                >
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-lg">
                                        {mode.emoji}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-foreground">{mode.name}</p>
                                        <p className="text-sm text-muted-foreground">{mode.description}</p>
                                    </div>
                                    {form.ai_mode_id === mode.id && <CheckCircle className="h-4 w-4 text-primary" />}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Automatic Responses</CardTitle>
                        <CardDescription>Control approvals, delayed sending, and automated response behavior.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <Label className="font-medium">Enable auto-reply</Label>
                                <p className="mt-1 text-sm text-muted-foreground">Allow the bot to send approved responses automatically.</p>
                            </div>
                            <Switch
                                checked={form.enable_auto_reply}
                                onCheckedChange={(value) => setForm((current) => ({ ...current, enable_auto_reply: value }))}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <Label className="font-medium">Require approval before send</Label>
                                <p className="mt-1 text-sm text-muted-foreground">Keep drafts pending until a human reviews them.</p>
                            </div>
                            <Switch
                                checked={form.require_approval_before_send}
                                onCheckedChange={(value) => setForm((current) => ({ ...current, require_approval_before_send: value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="delay">Auto-reply delay in seconds</Label>
                            <Input
                                id="delay"
                                type="number"
                                min="0"
                                max="3600"
                                value={form.auto_reply_delay_seconds}
                                onChange={(event) => setForm((current) => ({
                                    ...current,
                                    auto_reply_delay_seconds: Number.parseInt(event.target.value, 10) || 0,
                                }))}
                                className="max-w-[180px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Custom Instructions</CardTitle>
                        <CardDescription>These instructions stack on top of the selected bot personality.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={form.custom_instructions}
                            onChange={(event) => setForm((current) => ({ ...current, custom_instructions: event.target.value }))}
                            rows={6}
                            placeholder="Example: Always offer the customer our Lagos delivery option first. Escalate refund requests to a human agent."
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {!saveMutation.isPending && <Save className="mr-2 h-4 w-4" />}
                        Save bot settings
                    </Button>
                </div>
            </div>
        </div>
    );
}
