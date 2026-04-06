import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Copy, Check, X } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { toast } from 'sonner';

interface ConversationShareDialogProps {
    open: boolean;
    conversationId: string;
    onOpenChange: (open: boolean) => void;
    conversationTitle: string;
}

interface ShareData {
    share_token?: string;
    is_public?: boolean;
    expires_at?: string | null;
}

export default function ConversationShareDialog({
    open,
    conversationId,
    onOpenChange,
    conversationTitle,
}: ConversationShareDialogProps) {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [expiresIn, setExpiresIn] = useState<'never' | '7days' | '30days'>('never');
    const [shareData, setShareData] = useState<ShareData | null>(null);
    // const { toast } = useToast();

    const getExpiresAt = () => {
        const now = new Date();
        switch (expiresIn) {
            case '7days':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            case '30days':
                return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            default:
                return null;
        }
    };

    const fetchExistingShare = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `/api/conversations/${conversationId}/share/details`
            );
            if (response.data.success && response.data.share) {
                setShareData(response.data.share);
                setIsPublic(response.data.share.is_public);
            }
        } catch (error) {
            console.error('Error fetching share:', error);
        } finally {
            setLoading(false);
        }
    };

    const createShare = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `/api/conversations/${conversationId}/share/create`,
                {
                    is_public: isPublic,
                    expires_at: getExpiresAt(),
                }
            );
            if (response.data.success) {
                setShareData(response.data.share);
                toast.success('Share link created successfully');
            }
        } catch (error) {
            console.error('Error creating share:', error);
            toast.error('Failed to create share link');

        } finally {
            setLoading(false);
        }
    };

    const updateShare = async () => {
        if (!shareData?.share_token) return;

        try {
            setLoading(true);
            const response = await axios.put(
                `/api/conversations/${conversationId}/share/update`,
                {
                    is_public: isPublic,
                    expires_at: getExpiresAt(),
                }
            );
            if (response.data.success) {
                setShareData(response.data.share);
                toast.success('Share settings updated successfully');
            }
        } catch (error) {
            console.error('Error updating share:', error);
            toast.error('Failed to update share settings');

        } finally {
            setLoading(false);
        }
    };

    const revokeShare = async () => {
        if (!shareData?.share_token) return;

        try {
            setLoading(true);
            const response = await axios.post(
                `/api/conversations/${conversationId}/share/revoke`
            );
            if (response.data.success) {
                setShareData(null);
                toast.success('Share link has been disabled');
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Error revoking share:', error);
            toast.error('Failed to revoke share link');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!shareData?.share_token) return;
        const shareUrl = `${window.location.origin}/share/${shareData.share_token}`;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Share link copied to clipboard');
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && !shareData) {
            fetchExistingShare();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Conversation</DialogTitle>
                    <DialogDescription>
                        Create a shareable link for "{conversationTitle}"
                    </DialogDescription>
                </DialogHeader>

                {loading && !shareData ? (
                    <div className="space-y-3 py-6 animate-pulse">
                        <div className="h-4 w-32 rounded bg-muted/60 mx-auto" />
                        <div className="h-9 w-full rounded-lg bg-muted/40" />
                        <div className="h-4 w-3/4 rounded bg-muted/30 mx-auto" />
                    </div>
                ) : shareData?.share_token ? (
                    <div className="space-y-4">
                        {/* Share URL */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Share Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={`${window.location.origin}/share/${shareData.share_token}`}
                                    className="text-sm bg-muted"
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={copyToClipboard}
                                    className="w-10 px-0"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Sharing Options */}
                        <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="is-public" className="text-sm font-medium">
                                        Public Sharing
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {isPublic
                                            ? 'Anyone with the link can view'
                                            : 'Only invited users can view'}
                                    </p>
                                </div>
                                <Switch
                                    id="is-public"
                                    checked={isPublic}
                                    onCheckedChange={setIsPublic}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expires" className="text-sm font-medium">
                                    Expiration
                                </Label>
                                <select
                                    id="expires"
                                    value={expiresIn}
                                    onChange={(e) =>
                                        setExpiresIn(
                                            e.target.value as 'never' | '7days' | '30days'
                                        )
                                    }
                                    disabled={loading}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                                >
                                    <option value="never">Never expires</option>
                                    <option value="7days">Expires in 7 days</option>
                                    <option value="30days">Expires in 30 days</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 border-t pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={updateShare}
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                Save Changes
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={revokeShare}
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <X className="w-4 h-4 mr-2" />
                                )}
                                Revoke
                            </Button>
                        </div>

                        {/* Info Message */}
                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 text-xs text-blue-800 dark:text-blue-200">
                            Shared conversations are read-only. Viewers cannot send messages or
                            modify content.
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Initial Share Setup */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="is-public-new" className="text-sm font-medium">
                                        Public Sharing
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Allow anyone with the link to view
                                    </p>
                                </div>
                                <Switch
                                    id="is-public-new"
                                    checked={isPublic}
                                    onCheckedChange={setIsPublic}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expires-new" className="text-sm font-medium">
                                    Expiration
                                </Label>
                                <select
                                    id="expires-new"
                                    value={expiresIn}
                                    onChange={(e) =>
                                        setExpiresIn(
                                            e.target.value as 'never' | '7days' | '30days'
                                        )
                                    }
                                    disabled={loading}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                                >
                                    <option value="never">Never expires</option>
                                    <option value="7days">Expires in 7 days</option>
                                    <option value="30days">Expires in 30 days</option>
                                </select>
                            </div>
                        </div>

                        {/* Info Message */}
                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 text-xs text-blue-800 dark:text-blue-200">
                            Shared conversations are read-only. Viewers cannot send messages or
                            modify content.
                        </div>

                        {/* Create Button */}
                        <Button
                            onClick={createShare}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Create Share Link
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
