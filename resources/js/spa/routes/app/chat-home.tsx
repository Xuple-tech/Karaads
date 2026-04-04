import { useMutation, useQuery } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';

type ConversationsResponse = {
    conversations: Array<{
        id: string;
        title: string;
        last_message?: string | null;
    }>;
};

export function Component() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const conversations = useQuery({
        queryKey: ['spa', 'conversations'],
        queryFn: () => apiRequest<ConversationsResponse>('/api/spa/conversations'),
    });

    const send = useMutation({
        mutationFn: async () => {
            const created = await apiRequest<{ conversation: { id: string } }>('/api/conversations/c-sdnsnd-smmsm', {
                method: 'POST',
                json: {},
            });

            await apiRequest('/create-two-step-challagene', {
                method: 'POST',
                json: {
                    message,
                    conversation_id: created.conversation.id,
                    stream: false,
                },
            });

            return created.conversation.id;
        },
        onSuccess: async (conversationId) => {
            setMessage('');
            await queryClient.invalidateQueries({ queryKey: ['spa', 'conversations'] });
            navigate(`/c/${conversationId}`);
        },
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!message.trim()) {
            return;
        }
        send.mutate();
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-primary">Chat</p>
                <h1 className="text-3xl font-semibold">Start a new conversation</h1>
            </div>
            <form className="space-y-3" onSubmit={onSubmit}>
                <textarea className="min-h-40 w-full rounded-3xl border border-border bg-background px-5 py-4" onChange={(e) => setMessage(e.target.value)} placeholder="Ask something..." value={message} />
                <Button disabled={send.isPending} type="submit">
                    {send.isPending ? 'Starting chat...' : 'Send'}
                </Button>
            </form>
            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Recent conversations</h2>
                <div className="grid gap-3">
                    {conversations.data?.conversations?.map((conversation) => (
                        <Link className="rounded-2xl border border-border/70 bg-background px-4 py-4 transition hover:border-primary/40" key={conversation.id} to={`/c/${conversation.id}`}>
                            <p className="font-medium">{conversation.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{conversation.last_message || 'No messages yet'}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
