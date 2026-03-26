import ChatInterface from '@/components/Chat/ChatInterface';
import { LanguageProvider } from '@/hooks/use-lang';
import GuestLayout from '@/layouts/GuestLayout';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

interface Conversation {
    id: number;
    title: string;
}

interface Props {
    isAuthenticated: boolean;
    conversations: Conversation[] | null;
}

export default function Index({ isAuthenticated, conversations }: Props) {
    const [currentConversation, setCurrentConversation] = useState<number | null>(null);

    const handleAuthenticatedMessage = (message: string) => {
        // Handle authenticated message sending
        if (currentConversation) {
            // Send to existing conversation
            router.post(`/conversations/${currentConversation}/messages`, {
                message,
                stream: true,
            });
        } else {
            // Create new conversation
            router.post('/conversations', {
                message,
                stream: true,
            });
        }
    };

    return (
        <>
            {/* <LanguageProvider> */}
                <Head title="Chat" />
                {isAuthenticated ? (
                    <AppLayout>
                        <ChatInterface isAuthenticated={isAuthenticated} onSend={handleAuthenticatedMessage} />
                    </AppLayout>
                ) : (
                    <GuestLayout>
                        <ChatInterface isAuthenticated={isAuthenticated} />
                    </GuestLayout>
                )}
            {/* </LanguageProvider> */}
        </>
    );
}
