import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import MarkdownMessage from './MarkdownMessage';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
    message: {
        content: string;
        role: 'user' | 'assistant';
        created_at: string;
        type?: 'text' | 'image';
        metadata?: {
            prompt?: string;
            remaining_generations?: number;
        };
    };
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn(
            'flex w-full gap-4 p-4',
            isUser ? 'bg-gray-900/50' : 'bg-gray-900/20'
        )}>
            <Avatar className="h-8 w-8">
                {isUser ? (
                    <>
                        <AvatarImage src="/avatars/user.png" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                    </>
                ) : (
                    <>
                        <AvatarImage src="/avatars/assistant.png" alt="Assistant" />
                        <AvatarFallback>A</AvatarFallback>
                    </>
                )}
            </Avatar>
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200">
                        {isUser ? 'You' : 'Assistant'}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                </div>                <MarkdownMessage
                    content={message.content}
                    className={cn(
                        'text-sm text-gray-200',
                        isUser ? 'text-blue-100' : 'text-gray-100'
                    )}
                    role={message.role}
                    type={message.type}
                    metadata={message.metadata}
                />
            </div>
        </div>
    );
}
