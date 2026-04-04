import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/spa/lib/api';

export function Component() {
    const plans = useQuery({
        queryKey: ['spa', 'billing', 'plans'],
        queryFn: () => apiRequest<any>('/api/subscription/plans'),
    });
    const mine = useQuery({
        queryKey: ['spa', 'billing', 'current'],
        queryFn: () => apiRequest<any>('/api/subscription/my-subscription'),
    });
    const usage = useQuery({
        queryKey: ['spa', 'billing', 'usage'],
        queryFn: () => apiRequest<any>('/api/subscription/usage-stats'),
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold">Subscription</h1>
                <p className="text-muted-foreground">Billing stays on Laravel, but the user experience now runs in the SPA.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl border border-border/70 bg-background p-6">
                    <h2 className="text-lg font-semibold">Current</h2>
                    <pre className="mt-3 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">{JSON.stringify(mine.data, null, 2)}</pre>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background p-6">
                    <h2 className="text-lg font-semibold">Usage</h2>
                    <pre className="mt-3 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">{JSON.stringify(usage.data, null, 2)}</pre>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background p-6">
                    <h2 className="text-lg font-semibold">Plans</h2>
                    <pre className="mt-3 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">{JSON.stringify(plans.data, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}
