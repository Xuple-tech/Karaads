import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Clipboard, Loader2, ShieldCheck, Smartphone, TestTube2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, apiRequest } from '@/spa/lib/api';

type WebhookInfo = {
    webhook_url: string;
    verify_token: string;
    platform: string;
};

export function Component() {
    const { accountId } = useParams();

    const webhookQuery = useQuery({
        queryKey: ['spa', 'meta', 'account', accountId, 'webhook-info'],
        queryFn: () => apiRequest<WebhookInfo>(`/api/meta/accounts/${accountId}/webhook-info`),
        enabled: Boolean(accountId),
    });

    const testMutation = useMutation({
        mutationFn: () => apiRequest<{ success: boolean; message: string }>(`/api/meta/accounts/${accountId}/test-connection`, { method: 'POST', json: {} }),
        onSuccess: (result) => toast.success(result.message || 'Connection successful'),
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to test connection.'),
    });

    const copy = async (value: string, label: string) => {
        await navigator.clipboard.writeText(value);
        toast.success(`${label} copied`);
    };

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-emerald-500/8 via-background to-primary/8 p-6 sm:p-8">
                <div className="space-y-4">
                    <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-foreground">
                        <Link to="/automations">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to automations
                        </Link>
                    </Button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-emerald-600" />
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">WhatsApp Setup Guide</h1>
                                <Badge variant="outline" className="capitalize">
                                    {webhookQuery.data?.platform ?? 'whatsapp'}
                                </Badge>
                            </div>
                            <p className="max-w-2xl text-sm text-muted-foreground">
                                Copy the exact values below into your Meta developer console, then verify the connection from this page.
                            </p>
                        </div>
                        <Badge variant="secondary" className="w-fit">3-step setup</Badge>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 md:grid-cols-3">
                <SetupCard
                    step="Step 1"
                    title="Copy webhook URL"
                    description="Paste this URL into the WhatsApp webhook field in Meta."
                    action={webhookQuery.isLoading ? (
                        <Skeleton className="h-11 w-full rounded-xl" />
                    ) : (
                        <CopyField value={webhookQuery.data?.webhook_url ?? ''} onCopy={() => copy(webhookQuery.data?.webhook_url ?? '', 'Webhook URL')} />
                    )}
                />

                <SetupCard
                    step="Step 2"
                    title="Configure Meta"
                    description="Use these exact steps in developers.facebook.com."
                    action={
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <ol className="list-decimal space-y-2 pl-4">
                                <li>Open your app in Meta Developers and go to WhatsApp → Configuration.</li>
                                <li>Paste the webhook URL from Step 1.</li>
                                <li>Paste the verify token below and subscribe to the <code>messages</code> field.</li>
                                <li>Click Verify and Save.</li>
                            </ol>
                            {webhookQuery.isLoading ? (
                                <Skeleton className="h-11 w-full rounded-xl" />
                            ) : (
                                <CopyField value={webhookQuery.data?.verify_token ?? ''} onCopy={() => copy(webhookQuery.data?.verify_token ?? '', 'Verify token')} />
                            )}
                        </div>
                    }
                />

                <SetupCard
                    step="Step 3"
                    title="Test connection"
                    description="Run a live check against the connected Meta account."
                    action={
                        <div className="space-y-4">
                            <Button type="button" onClick={() => testMutation.mutate()} disabled={testMutation.isPending} className="w-full">
                                {testMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
                                Send test request
                            </Button>
                            <div className="rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                                Once Meta verifies your webhook, incoming customer messages will start reaching the automation workspace.
                            </div>
                        </div>
                    }
                />
            </div>

            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Before you leave
                    </CardTitle>
                    <CardDescription>Use this checklist to avoid the common setup mistakes.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                    {[
                        'Webhook URL pasted exactly as shown',
                        'Verify token copied without editing',
                        'messages field subscribed in Meta',
                        'Test connection returns success',
                    ].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/60 p-4 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>{item}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function SetupCard({
    step,
    title,
    description,
    action,
}: {
    step: string;
    title: string;
    description: string;
    action: React.ReactNode;
}) {
    return (
        <Card className="border-border/60">
            <CardHeader>
                <Badge variant="outline" className="w-fit">{step}</Badge>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{action}</CardContent>
        </Card>
    );
}

function CopyField({ value, onCopy }: { value: string; onCopy: () => void }) {
    return (
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
            <div className="break-all text-sm text-foreground">{value}</div>
            <Button type="button" variant="outline" className="mt-3 w-full" onClick={onCopy}>
                <Clipboard className="mr-2 h-4 w-4" />
                Copy
            </Button>
        </div>
    );
}
