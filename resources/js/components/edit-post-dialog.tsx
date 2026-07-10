import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { ImagePlus, X } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface EditPostMedia {
    id: string;
    path: string;
    type: string;
    mime_type?: string;
}

export interface EditPostUpdatePayload {
    content: string;
    media: EditPostMedia[];
}

interface PendingMediaFile {
    id: string;
    file: File;
    previewUrl: string;
    type: 'image' | 'video';
}

interface EditPostDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: string;
    initialContent: string;
    initialMedia?: EditPostMedia[];
    onUpdated: (payload: EditPostUpdatePayload) => void;
}

export function EditPostDialog({
    open,
    onOpenChange,
    postId,
    initialContent,
    initialMedia = [],
    onUpdated,
}: EditPostDialogProps) {
    const [content, setContent] = useState(initialContent);
    const [removeExistingMedia, setRemoveExistingMedia] = useState(false);
    const [pendingMedia, setPendingMedia] = useState<PendingMediaFile[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setContent(initialContent);
            setRemoveExistingMedia(false);
            setPendingMedia((prev) => {
                prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
                return [];
            });
        }
    }, [initialContent, open, initialMedia]);

    useEffect(() => {
        return () => {
            pendingMedia.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        };
    }, [pendingMedia]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files ? Array.from(event.target.files) : [];
        if (files.length === 0) return;

        const next: PendingMediaFile[] = [];
        const hasVideo = files.some((file) => file.type.startsWith('video/'));
        const hasImage = files.some((file) => file.type.startsWith('image/'));

        if (hasVideo && hasImage) {
            toast.error('Upload images or one video, not both.');
            event.target.value = '';
            return;
        }

        const maxCount = hasVideo ? 1 : 4;
        if (files.length > maxCount) {
            toast.error(hasVideo ? 'Only one video is allowed.' : 'Maximum 4 images are allowed.');
            event.target.value = '';
            return;
        }

        for (const file of files) {
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                toast.error('Only image or video files are supported.');
                event.target.value = '';
                return;
            }
            if (file.size > 100 * 1024 * 1024) {
                toast.error(`${file.name} exceeds the 100MB limit.`);
                event.target.value = '';
                return;
            }

            next.push({
                id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
                file,
                previewUrl: URL.createObjectURL(file),
                type: file.type.startsWith('video/') ? 'video' : 'image',
            });
        }

        setPendingMedia((prev) => {
            prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
            return next;
        });
        setRemoveExistingMedia(false);
        event.target.value = '';
    };

    const handleSubmit = async () => {
        const next = content.trim();
        const existingMediaAfterSave = removeExistingMedia ? [] : initialMedia;
        const willHaveMedia = pendingMedia.length > 0 || existingMediaAfterSave.length > 0;

        if (!next && !willHaveMedia) {
            toast.error('Post must include content or media.');
            return;
        }

        const didContentChange = next !== initialContent.trim();
        const didMediaChange = removeExistingMedia || pendingMedia.length > 0;

        if (!didContentChange && !didMediaChange) {
            onOpenChange(false);
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('content', next);
            if (removeExistingMedia) {
                formData.append('remove_existing_media', '1');
            }
            pendingMedia.forEach((item, index) => {
                formData.append(`media[${index}]`, item.file);
            });

            const response = await axios.patch(`/api/posts/${postId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const updated = response.data?.data ?? response.data;
            onUpdated({
                content: typeof updated?.content === 'string' ? updated.content : next,
                media: Array.isArray(updated?.media)
                    ? updated.media
                    : pendingMedia.length > 0
                      ? []
                      : existingMediaAfterSave,
            });
            toast.success('Post updated.');
            onOpenChange(false);
        } catch {
            toast.error('Failed to update post.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit post</DialogTitle>
                    <DialogDescription>Update your post content.</DialogDescription>
                </DialogHeader>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    maxLength={5000}
                    placeholder="Write your update"
                />

                {initialMedia.length > 0 && pendingMedia.length === 0 && !removeExistingMedia && (
                    <div className="grid grid-cols-2 gap-2">
                        {initialMedia.map((item) => (
                            <div key={item.id} className="overflow-hidden rounded-md border border-border">
                                {item.type === 'video' || item.mime_type?.startsWith('video/') ? (
                                    <video src={item.path} className="h-28 w-full object-cover" muted playsInline />
                                ) : (
                                    <img src={item.path} alt="Post media" className="h-28 w-full object-cover" />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {pendingMedia.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {pendingMedia.map((item) => (
                            <div key={item.id} className="relative overflow-hidden rounded-md border border-border">
                                {item.type === 'video' ? (
                                    <video src={item.previewUrl} className="h-28 w-full object-cover" muted playsInline />
                                ) : (
                                    <img src={item.previewUrl} alt={item.file.name} className="h-28 w-full object-cover" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPendingMedia((prev) => {
                                            const target = prev.find((m) => m.id === item.id);
                                            if (target) URL.revokeObjectURL(target.previewUrl);
                                            return prev.filter((m) => m.id !== item.id);
                                        });
                                    }}
                                    className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">
                        <ImagePlus className="h-4 w-4" />
                        Replace media
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleFileChange}
                            disabled={submitting}
                        />
                    </label>
                    {initialMedia.length > 0 && pendingMedia.length === 0 && !removeExistingMedia && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRemoveExistingMedia(true)}
                            disabled={submitting}
                        >
                            Remove media
                        </Button>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
