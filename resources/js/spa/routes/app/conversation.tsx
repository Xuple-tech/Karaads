import { useMutation, useQuery } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { apiRequest } from '@/spa/lib/api';
import { queryClient } from '@/spa/lib/query-client';

type ConversationResponse = {
    conversation: {
        id: string;
        title: string;
        messages: Array<{
            id: string;
            role: string;
            message: string;
        }>;
    };
};

export function Component() {
    const { conversationId = '' } = useParams();
    const [message, setMessage] = useState('');
    const conversation = useQuery({
        queryKey: ['spa', 'conversation', conversationId],
        queryFn: () => apiRequest<ConversationResponse>(`/api/spa/conversations/${conversationId}`),
    });

    const send = useMutation({
        mutationFn: () =>
            apiRequest('/create-two-step-challagene', {
                method: 'POST',
                json: {
                    message,
                    conversation_id: conversationId,
                    stream: false,
                },
            }),
        onSuccess: async () => {
            setMessage('');
            await queryClient.invalidateQueries({ queryKey: ['spa', 'conversation', conversationId] });
            await queryClient.invalidateQueries({ queryKey: ['spa', 'conversations'] });
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
            <div>
                <h1 className="text-3xl font-semibold">{conversation.data?.conversation.title ?? 'Conversation'}</h1>
            </div>
            <div className="space-y-3">
                {conversation.data?.conversation.messages?.map((item) => (
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3" key={item.id}>
                        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.role}</p>
                        <p className="whitespace-pre-wrap text-sm">{item.message}</p>
                    </div>
                ))}
            </div>
            <form className="space-y-3" onSubmit={onSubmit}>
                <textarea className="min-h-32 w-full rounded-3xl border border-border bg-background px-5 py-4" onChange={(e) => setMessage(e.target.value)} placeholder="Continue the conversation..." value={message} />
                <Button disabled={send.isPending} type="submit">
                    {send.isPending ? 'Sending...' : 'Send'}
                </Button>
            </form>
        </div>
    );
}
