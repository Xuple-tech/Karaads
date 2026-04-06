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

function ChatSkeleton() {
    return (
        <div className="relative flex w-full flex-1 flex-col overflow-hidden">
            {/* Messages skeleton */}
            <div className="flex-1 overflow-hidden pt-6 pb-48">
                <div className="mx-auto w-full max-w-2xl px-4 space-y-8">
                    {/* User bubble */}
                    <div className="flex justify-end">
                        <div className="h-10 w-56 rounded-2xl bg-[#2a2a2a] animate-pulse" />
                    </div>

                    {/* Assistant reply */}
                    <div className="flex gap-3">
                        <div className="mt-0.5 h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-[#8b5cf6]/30 to-[#6d28d9]/30 animate-pulse" />
                        <div className="flex-1 space-y-2.5 pt-1">
                            <div className="h-2.5 w-full rounded-full bg-muted/25 animate-pulse" />
                            <div className="h-2.5 w-5/6 rounded-full bg-muted/25 animate-pulse" />
                            <div className="h-2.5 w-4/6 rounded-full bg-muted/25 animate-pulse" />
                            <div className="h-2.5 w-3/4 rounded-full bg-muted/20 animate-pulse mt-4" />
                            <div className="h-2.5 w-full rounded-full bg-muted/20 animate-pulse" />
                            <div className="h-2.5 w-2/3 rounded-full bg-muted/20 animate-pulse" />
                        </div>
                    </div>

                    {/* Second user bubble */}
                    <div className="flex justify-end">
                        <div className="h-10 w-40 rounded-2xl bg-[#2a2a2a] animate-pulse" />
                    </div>

                    {/* Second assistant reply */}
                    <div className="flex gap-3">
                        <div className="mt-0.5 h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-[#8b5cf6]/30 to-[#6d28d9]/30 animate-pulse" />
                        <div className="flex-1 space-y-2.5 pt-1">
                            <div className="h-2.5 w-4/5 rounded-full bg-muted/25 animate-pulse" />
                            <div className="h-2.5 w-full rounded-full bg-muted/25 animate-pulse" />
                            <div className="h-2.5 w-3/5 rounded-full bg-muted/20 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Input skeleton */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
                <div className="mx-auto max-w-2xl">
                    <div className="h-[56px] w-full rounded-2xl bg-[#2a2a2a] animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export function Component() {
    const { conversationId = '' } = useParams();
    const session = useSessionQuery();
    const conversation = useQuery({
        queryKey: ['spa', 'conversation', conversationId],
        queryFn: () => apiRequest<ConversationResponse>(`/api/chat/conversations/${conversationId}`),
    });

    if (conversation.isLoading) {
        return <ChatSkeleton />;
    }

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
