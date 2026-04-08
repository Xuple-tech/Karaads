import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import ConversationActions from '@/spa/components/ConversationActions';
import { apiRequest } from '@/spa/lib/api';

export function Component() {
    const navigate = useNavigate();
    const [clearOpen, setClearOpen] = useState(false);
    const conversations = useQuery({
        queryKey: ['spa', 'conversations'],
        queryFn: () => apiRequest<{ conversations: Array<{ id: string; title: string; last_message?: string | null }> }>('/api/chat/conversations'),
    });

    const clearHistory = async () => {
        try {
            await apiRequest('/api/chat/conversations', {
                method: 'DELETE',
            });
            await conversations.refetch();
            setClearOpen(false);
            navigate('/new');
            toast.success('Conversation history cleared');
        } catch {
            toast.error('Failed to clear conversation history');
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Conversations</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Your full conversation history.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setClearOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    Clear history
                </Button>
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
                    <div
                        key={conv.id}
                        className="flex items-start gap-3 rounded-xl border border-border/40 bg-card px-4 py-3.5 transition-colors hover:border-primary/30 hover:bg-accent/40"
                    >
                        <Link to={`/c/${conv.id}`} className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                            {conv.last_message && (
                                <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                            )}
                        </Link>
                        <ConversationActions
                            conversationId={conv.id}
                            conversationTitle={conv.title}
                            onChanged={() => void conversations.refetch()}
                            onDeleted={() => void conversations.refetch()}
                        />
                    </div>
                ))}
            </div>

            <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear all conversation history?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently deletes all saved chat conversations for this account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => void clearHistory()}>
                            Clear history
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
