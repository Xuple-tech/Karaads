import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import SpaChatInterface from '@/spa/components/SpaChatInterface';
import { apiRequest } from '@/spa/lib/api';
import { useSessionQuery } from '@/spa/lib/session';

type ConversationResponse = {
    conversation: {
        id: string;
        title: string;
        messages: Array<{
            id: string;
            role: string;
            message: string;
            thinking?: string;
            metadata?: Record<string, unknown>;
            type?: string;
        }>;
    };
};

export function Component() {
    const { conversationId = '' } = useParams();
    const session = useSessionQuery();
    const conversation = useQuery({
        queryKey: ['spa', 'conversation', conversationId],
        queryFn: () => apiRequest<ConversationResponse>(`/api/spa/conversations/${conversationId}`),
    });

    const messages =
        conversation.data?.conversation.messages.map((item) => ({
            id: item.id,
            role: item.role,
            content: item.message,
            message: item.message,
            thinking: item.thinking,
            metadata: item.metadata ?? {},
            type: item.type ?? 'text',
        })) ?? [];

    return (
        <SpaChatInterface
            initialConversationId={conversationId}
            initialMessages={messages as any}
            isAuthenticated={true}
            userName={session.data?.user?.name?.split(' ')[0]}
        />
    );
}
