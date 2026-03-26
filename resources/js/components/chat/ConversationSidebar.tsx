// components/chat/ConversationSidebar.tsx
import { useState } from 'react';
import {
    Plus,
    Search,
    Bot,
    MoreVertical,
    Trash2,
    Edit3,
    Download,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationSidebarProps {
    conversations: any[];
    currentConversation: any;
    onConversationSelect: (conversation: any) => void;
    onNewConversation: () => void;
    isLoading?: boolean;
}

export default function ConversationSidebar({
    conversations,
    currentConversation,
    onConversationSelect,
    onNewConversation,
    isLoading = false
}: ConversationSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (window.confirm('Are you sure you want to delete this conversation?')) {
            await deleteConversationById(conversationId);
        }
    };

    const handleExportConversation = async (conversationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        // Implement export functionality
        console.log('Export conversation:', conversationId);
    };

    return (
        <div className="w-80 border-r border-border bg-card/50 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                                <Bot size={16} className="text-primary-foreground" />
                            </div>
                            <h2 className="text-sm font-semibold">Conversations</h2>
                        </div>
                        <Button
                            size="sm"
                            className="gap-2 rounded-lg"
                            onClick={onNewConversation}
                            disabled={isLoading}
                        >
                            <Plus size={16} />
                            New
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                    {isLoading ? (
                        <div className="text-center text-muted-foreground py-4">
                            Loading...
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                                {searchQuery ? 'No conversations found' : 'No conversations yet'}
                            </p>
                            {!searchQuery && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={onNewConversation}
                                >
                                    <Plus size={14} className="mr-1" />
                                    Start chatting
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`relative p-3 rounded-lg cursor-pointer transition-all group ${currentConversation?.id === conv.id
                                        ? 'bg-primary/10 border border-primary/20'
                                        : 'hover:bg-accent border border-transparent hover:border-border/50'
                                    }`}
                                onClick={() => onConversationSelect(conv)}
                            >
                                <div className="flex items-start gap-2.5 min-w-0">
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${currentConversation?.id === conv.id
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                        }`}>
                                        <Bot size={12} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${currentConversation?.id === conv.id
                                                ? 'text-foreground'
                                                : 'text-foreground'
                                            }`}>
                                            {conv.title}
                                        </p>

                                        {conv.last_message && (
                                            <p className="text-xs text-muted-foreground truncate mt-1">
                                                {conv.last_message}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock size={10} className="text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(conv.updated_at)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                • {conv.chats_count} messages
                                            </span>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreVertical size={12} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem>
                                                <Edit3 size={14} className="mr-2" />
                                                Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => handleExportConversation(conv.id, e)}
                                            >
                                                <Download size={14} className="mr-2" />
                                                Export
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={(e) => handleDeleteConversation(conv.id, e)}
                                            >
                                                <Trash2 size={14} className="mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground text-center">
                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </div>
            </div>
        </div>
    );
}
