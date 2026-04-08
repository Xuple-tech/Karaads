import { Check, Copy, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { apiRequest } from '@/spa/lib/api';

type ShareData = {
    share_token: string;
    is_public: boolean;
    expires_at?: string | null;
};

export default function ConversationShareDialog({
    conversationId,
    conversationTitle,
    open,
    onOpenChange,
}: {
    conversationId: string;
    conversationTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [expiresIn, setExpiresIn] = useState<'never' | '7days' | '30days'>('never');
    const [share, setShare] = useState<ShareData | null>(null);

    const shareUrl = useMemo(
        () => (share?.share_token ? `${window.location.origin}/share/${share.share_token}` : ''),
        [share?.share_token],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        const loadShare = async () => {
            setLoading(true);
            try {
                const response = await apiRequest<{ success: boolean; share: ShareData | null }>(
                    `/api/conversations/${conversationId}/share/details`,
                );
                setShare(response.share);
                setIsPublic(Boolean(response.share?.is_public));
                setExpiresIn(resolveExpiryPreset(response.share?.expires_at));
            } catch {
                toast.error('Failed to load share settings');
            } finally {
                setLoading(false);
            }
        };

        void loadShare();
    }, [conversationId, open]);

    const handleCreateOrUpdate = async () => {
        setLoading(true);
        try {
            const payload = {
                is_public: isPublic,
                expires_at: resolveExpiresAt(expiresIn),
            };

            const response = share
                ? await apiRequest<{ success: boolean; share: ShareData }>(
                      `/api/conversations/${conversationId}/share/update`,
                      { method: 'PUT', json: payload },
                  )
                : await apiRequest<{ success: boolean; share: ShareData }>(
                      `/api/conversations/${conversationId}/share/create`,
                      { method: 'POST', json: payload },
                  );

            setShare(response.share);
            toast.success(share ? 'Share settings updated' : 'Share link created');
        } catch {
            toast.error(share ? 'Failed to update share settings' : 'Failed to create share link');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async () => {
        setLoading(true);
        try {
            await apiRequest(`/api/conversations/${conversationId}/share/revoke`, {
                method: 'POST',
            });
            setShare(null);
            setIsPublic(false);
            setExpiresIn('never');
            toast.success('Share link revoked');
        } catch {
            toast.error('Failed to revoke share link');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!shareUrl) {
            return;
        }

        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
        toast.success('Share link copied');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Conversation</DialogTitle>
                    <DialogDescription>Create a read-only link for "{conversationTitle}".</DialogDescription>
                </DialogHeader>

                {loading && !share ? (
                    <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading share settings...
                    </div>
                ) : (
                    <div className="space-y-4">
                        {share ? (
                            <div className="space-y-2">
                                <Label>Share Link</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={shareUrl} className="bg-muted/40" />
                                    <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
                                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        ) : null}

                        <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-3">
                            <div>
                                <Label htmlFor="conversation-share-public">Public link</Label>
                                <p className="mt-1 text-xs text-muted-foreground">Anyone with the link can view this conversation.</p>
                            </div>
                            <Switch
                                id="conversation-share-public"
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Expiration</Label>
                            <Select disabled={loading} value={expiresIn} onValueChange={(value) => setExpiresIn(value as typeof expiresIn)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select expiration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="never">Never expires</SelectItem>
                                    <SelectItem value="7days">Expires in 7 days</SelectItem>
                                    <SelectItem value="30days">Expires in 30 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-muted-foreground">
                            Shared conversations are read-only. Viewers cannot reply or edit content.
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:justify-between">
                    <div className="flex gap-2">
                        {share ? (
                            <Button type="button" variant="destructive" onClick={handleRevoke} disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                                Revoke
                            </Button>
                        ) : null}
                    </div>
                    <Button type="button" onClick={handleCreateOrUpdate} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {share ? 'Save changes' : 'Create link'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function resolveExpiresAt(preset: 'never' | '7days' | '30days'): string | null {
    const now = new Date();

    switch (preset) {
        case '7days':
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        case '30days':
            return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        default:
            return null;
    }
}

function resolveExpiryPreset(value?: string | null): 'never' | '7days' | '30days' {
    if (!value) {
        return 'never';
    }

    const expiresAt = new Date(value).getTime();
    const remainingDays = Math.round((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));

    if (remainingDays <= 8) {
        return '7days';
    }

    if (remainingDays <= 31) {
        return '30days';
    }

    return 'never';
}
