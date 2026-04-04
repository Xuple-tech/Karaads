import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { apiRequest } from '@/spa/lib/api';

export function Component() {
    const { token = '' } = useParams();
    const shared = useQuery({
        queryKey: ['spa', 'shared-conversation', token],
        queryFn: () => apiRequest<any>(`/api/share/${token}/data`),
    });

    return (
        <section className="mx-auto max-w-4xl space-y-6 px-6 py-16">
            <h1 className="text-3xl font-semibold">Shared conversation</h1>
            <div className="space-y-4 rounded-3xl border border-border/70 bg-card p-6">
                <p className="text-sm text-muted-foreground">{shared.data?.title ?? 'Conversation preview'}</p>
                <pre className="overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
                    {JSON.stringify(shared.data, null, 2)}
                </pre>
            </div>
        </section>
    );
}
