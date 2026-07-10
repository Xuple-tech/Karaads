import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmojiStickerPicker } from '@/components/emoji-sticker-picker';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
} from '@/components/ui/dialog';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';
import { useState } from 'react';

interface ComposeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPostSuccess?: () => void;
    currentUser?: {
        id: string;
        name: string;
        username: string;
        avatar?: string;
    };
}

export function ComposeDialog({
    open,
    onOpenChange,
    onPostSuccess,
    currentUser,
}: ComposeDialogProps) {
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handlePost = async () => {
        if (!content.trim() || isPosting) return;

        setIsPosting(true);
        try {
            const response = await axios.post('/api/posts', {
                content: content.trim(),
                type: 'post',
            });

            setContent('');
            onOpenChange(false);
            onPostSuccess?.();
            window.dispatchEvent(
                new CustomEvent('post:created', {
                    detail: response.data,
                }),
            );
        } catch (error) {
            console.error('Failed to post:', error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleClose = () => {
        setContent('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-full max-w-2xl gap-0 p-0">
                <DialogHeader className="border-b border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-8 w-8"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <DialogDescription className="hidden" />
                    </div>
                </DialogHeader>

                <div className="flex gap-4 px-6 py-4">
                    {/* User Avatar */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback>
                            {currentUser?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Compose Area */}
                    <div className="flex-1">
                        <textarea
                            placeholder="Share an update..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full resize-none border-0 bg-transparent text-2xl placeholder:text-muted-foreground focus:outline-none"
                            rows={6}
                            autoFocus
                        />

                        {/* Post Actions */}
                        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-primary hover:bg-primary/10"
                                >
                                    <ImageIcon className="h-5 w-5" />
                                </Button>
                                <EmojiStickerPicker
                                    onSelect={(value) => setContent((current) => `${current}${value}`)}
                                />
                            </div>
                            <Button
                                onClick={handlePost}
                                disabled={!content.trim() || isPosting}
                                className="rounded-full px-8 py-2 font-bold"
                                size="lg"
                            >
                                {isPosting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    'Post'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
