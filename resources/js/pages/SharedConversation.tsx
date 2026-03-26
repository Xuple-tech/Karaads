import { type ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { type Chat, type Conversation, type User } from '@/types';
import ChatMessage from '@/components/chat/ChatMessage';
import { Copy, ExternalLink } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SharedConversationProps {
    conversation: Conversation & { chats: Chat[] };
    owner: User;
    shareToken: string;
    isSharedView: boolean;
}

export default function SharedConversation({
    conversation,
    owner,
    shareToken,
    isSharedView,
}: SharedConversationProps) {
    const [chats, setChats] = useState<Chat[]>(conversation.chats || []);
    // const { toast } = useToast();
    const shareUrl = `${window.location.origin}/share/${shareToken}`;

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard');
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border px-6 py-4 bg-card">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground">
                            {conversation.title}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Shared by <span className="font-medium">{owner.name}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyUrl}
                            className="flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Copy Link
                        </Button>
                    </div>
                </div>

                {/* Share Info Banner */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
                    This is a read-only view of a shared conversation. You can view messages but cannot reply.
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {chats.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No messages in this conversation</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {chats.map((chat) => (
                            <ChatMessage
                                key={chat.id}
                                chat={chat}
                                isSharedView={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-4 bg-card text-center text-sm text-muted-foreground">
                <p>This conversation was shared via a read-only link</p>
            </div>
        </div>
    );
}
