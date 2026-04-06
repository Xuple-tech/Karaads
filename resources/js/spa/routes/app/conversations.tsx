import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

import { apiRequest } from '@/spa/lib/api';

export function Component() {
    const conversations = useQuery({
        queryKey: ['spa', 'conversations'],
        queryFn: () => apiRequest<{ conversations: Array<{ id: string; title: string; last_message?: string | null }> }>('/api/chat/conversations'),
    });

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Conversations</h1>
                <p className="mt-1 text-sm text-muted-foreground">Your full conversation history.</p>
            </div>

            {conversations.isLoading && (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 rounded-xl bg-card/50 animate-pulse" />
                    ))}
                </div>
            )}

            {!conversations.isLoading && conversations.data?.conversations?.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/50 bg-card/30 px-6 py-12 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-foreground">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Start a new chat to see it here.</p>
                </div>
            )}

            <div className="space-y-1.5">
                {conversations.data?.conversations?.map((conv) => (
                    <Link
                        key={conv.id}
                        to={`/c/${conv.id}`}
                        className="flex flex-col gap-1 rounded-xl border border-border/40 bg-card px-4 py-3.5 transition-colors hover:border-primary/30 hover:bg-accent/40"
                    >
                        <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                        {conv.last_message && (
                            <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
