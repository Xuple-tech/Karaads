import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axiosInstance from '@/lib/axios';
import { getSafeMediaUrl } from '@/lib/url-guard';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface Ad {
    id: string;
    title: string;
    description: string;
    media_url: string;
    media_type: string;
    target_url: string;
}

interface AdEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ad: Ad | null;
    onSuccess: () => void;
}

export function AdEditDialog({ open, onOpenChange, ad, onSuccess }: AdEditDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetUrl, setTargetUrl] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const localPreviewUrlRef = useRef<string | null>(null);

    const clearLocalPreviewUrl = () => {
        if (!localPreviewUrlRef.current) return;
        URL.revokeObjectURL(localPreviewUrlRef.current);
        localPreviewUrlRef.current = null;
    };

    useEffect(() => {
        clearLocalPreviewUrl();
        if (ad) {
            setTitle(ad.title);
            setDescription(ad.description);
            setTargetUrl(ad.target_url);
            setMediaPreview(getSafeMediaUrl(ad.media_url) || null);
            setMedia(null);
        }
    }, [ad]);

    useEffect(() => {
        return () => {
            clearLocalPreviewUrl();
        };
    }, []);

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMedia(file);
            clearLocalPreviewUrl();
            const objectUrl = URL.createObjectURL(file);
            localPreviewUrlRef.current = objectUrl;
            setMediaPreview(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ad) return;

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('target_url', targetUrl);
            if (media) {
                formData.append('media', media);
            }

            // Using POST with _method=PATCH or just POST if the route is defined as POST
            // Laravel handles FormData better with POST
            await axiosInstance.post(`/api/ads/${ad.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Ad updated successfully');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update ad');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Ad</DialogTitle>
                    <DialogDescription>
                        Update your ad details. Some changes may require re-approval.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="target_url">Target URL</Label>
                        <Input
                            id="target_url"
                            type="url"
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Ad Creative (Optional)</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*,video/*"
                                onChange={handleMediaChange}
                            />
                            {mediaPreview ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                                    {media ? media.type.startsWith('video') : ad?.media_type === 'video' ? (
                                        <video src={mediaPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <img
                                            src={mediaPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                            referrerPolicy="no-referrer"
                                            onError={() => setMediaPreview(null)}
                                        />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs font-medium">Change Media</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-muted-foreground py-4">
                                    <ImageIcon className="w-6 h-6" />
                                    <p className="text-sm">Click to upload</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
