import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { apiRequest } from '@/spa/lib/api';

export function Component() {
    const conversations = useQuery({
        queryKey: ['spa', 'conversations'],
        queryFn: () => apiRequest<{ conversations: Array<{ id: string; title: string; last_message?: string | null }> }>('/api/spa/conversations'),
    });

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-semibold">Conversation history</h1>
            <div className="grid gap-3">
                {conversations.data?.conversations.map((conversation) => (
                    <Link className="rounded-2xl border border-border/70 bg-background px-4 py-4 transition hover:border-primary/40" key={conversation.id} to={`/c/${conversation.id}`}>
                        <p className="font-medium">{conversation.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{conversation.last_message || 'No preview available'}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
