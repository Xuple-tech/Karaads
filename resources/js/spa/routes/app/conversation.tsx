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
            status?: string;
            provider?: string | null;
            model?: string | null;
            content_markdown: string;
            content_text: string;
            attachments?: Array<{
                id: string;
                kind: string;
                name: string;
                mime_type?: string | null;
                size?: number | null;
                url?: string | null;
            }>;
            type?: string;
            created_at?: string;
        }>;
    };
};

export function Component() {
    const { conversationId = '' } = useParams();
    const session = useSessionQuery();
    const conversation = useQuery({
        queryKey: ['spa', 'conversation', conversationId],
        queryFn: () => apiRequest<ConversationResponse>(`/api/chat/conversations/${conversationId}`),
    });

    const messages =
        conversation.data?.conversation.messages.map((item) => ({
            id: item.id,
            role: item.role,
            status: item.status,
            provider: item.provider,
            model: item.model,
            content: item.content_markdown,
            content_markdown: item.content_markdown,
            content_text: item.content_text,
            attachments: item.attachments ?? [],
            type: item.type ?? 'text',
            created_at: item.created_at,
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
