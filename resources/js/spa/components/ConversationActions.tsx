import { Download, Edit3, MoreHorizontal, Share2, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ConversationShareDialog from '@/spa/components/ConversationShareDialog';
import { apiRequest } from '@/spa/lib/api';
import { authHeaders } from '@/spa/lib/auth-token';

export default function ConversationActions({
    conversationId,
    conversationTitle,
    trigger = 'icon',
    align = 'end',
    onChanged,
    onDeleted,
}: {
    conversationId: string;
    conversationTitle: string;
    trigger?: 'icon' | 'button';
    align?: 'start' | 'end';
    onChanged?: () => void;
    onDeleted?: () => void;
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [renameOpen, setRenameOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [title, setTitle] = useState(conversationTitle);

    const refreshQueries = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['spa', 'conversations'] }),
            queryClient.invalidateQueries({ queryKey: ['spa', 'conversation', conversationId] }),
        ]);
        onChanged?.();
    };

    const handleRename = async () => {
        const nextTitle = title.trim();
        if (!nextTitle) {
            return;
        }

        setIsBusy(true);
        try {
            await apiRequest(`/api/chat/conversations/${conversationId}`, {
                method: 'PATCH',
                json: { title: nextTitle },
            });
            setRenameOpen(false);
            toast.success('Conversation renamed');
            await refreshQueries();
        } catch {
            toast.error('Failed to rename conversation');
        } finally {
            setIsBusy(false);
        }
    };

    const handleDelete = async () => {
        setIsBusy(true);
        try {
            await apiRequest(`/api/chat/conversations/${conversationId}`, {
                method: 'DELETE',
            });
            toast.success('Conversation deleted');
            setDeleteOpen(false);
            await queryClient.invalidateQueries({ queryKey: ['spa', 'conversations'] });
            onDeleted?.();
            if (location.pathname === `/c/${conversationId}`) {
                navigate('/new');
            }
        } catch {
            toast.error('Failed to delete conversation');
        } finally {
            setIsBusy(false);
        }
    };

    const handleExport = async (format: 'md' | 'json') => {
        setIsBusy(true);
        try {
            const response = await fetch(`/api/chat/conversations/${conversationId}/export?format=${format}`, {
                headers: {
                    Accept: '*/*',
                    ...authHeaders(),
                },
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const disposition = response.headers.get('content-disposition') ?? '';
            const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);
            const fileName = fileNameMatch?.[1] ?? `conversation.${format}`;
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`Conversation exported as ${format.toUpperCase()}`);
        } catch {
            toast.error('Failed to export conversation');
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {trigger === 'button' ? (
                        <Button variant="outline" size="sm" className="gap-2">
                            <MoreHorizontal className="h-4 w-4" />
                            Actions
                        </Button>
                    ) : (
                        <button
                            type="button"
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align={align} className="w-44">
                    <DropdownMenuItem
                        onSelect={() => {
                            setTitle(conversationTitle);
                            setRenameOpen(true);
                        }}
                    >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setShareOpen(true)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void handleExport('md')}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void handleExport('json')}>
                        <Download className="mr-2 h-4 w-4" />
                        Export JSON
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setDeleteOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rename Conversation</DialogTitle>
                        <DialogDescription>Give this conversation a clearer title.</DialogDescription>
                    </DialogHeader>
                    <Input
                        autoFocus
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                void handleRename();
                            }
                        }}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
                        <Button onClick={() => void handleRename()} disabled={isBusy || title.trim() === ''}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConversationShareDialog
                conversationId={conversationId}
                conversationTitle={conversationTitle}
                open={shareOpen}
                onOpenChange={setShareOpen}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes "{conversationTitle}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => void handleDelete()}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
