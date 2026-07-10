import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface AdApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    adId: string;
    adTitle: string;
    onSuccess?: () => void;
}

export function AdApprovalModal({ isOpen, onClose, adId, adTitle, onSuccess }: AdApprovalModalProps) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            await axiosInstance.post(`/admin/ads/${adId}/approve`);
            toast.success('Ad approved successfully');
            onClose();
            onSuccess?.();
        } catch (error) {
            toast.error('Failed to approve ad');
            console.error(error);
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setIsRejecting(true);
        try {
            await axiosInstance.post(`/admin/ads/${adId}/reject`, {
                rejection_reason: rejectionReason,
            });
            toast.success('Ad rejected successfully');
            setRejectionReason('');
            setShowRejectForm(false);
            onClose();
            onSuccess?.();
        } catch (error) {
            toast.error('Failed to reject ad');
            console.error(error);
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Review Ad: {adTitle}</DialogTitle>
                    <DialogDescription>
                        Approve or reject this advertising content
                    </DialogDescription>
                </DialogHeader>

                {!showRejectForm ? (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please review the ad details and decide whether to approve or reject it.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Rejection Reason</label>
                            <Textarea
                                placeholder="Explain why you're rejecting this ad (minimum 10 characters)..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="mt-2 min-h-[100px]"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {rejectionReason.length} / 500 characters
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    {!showRejectForm ? (
                        <>
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowRejectForm(true)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                            <Button onClick={handleApprove} disabled={isApproving}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {isApproving ? 'Approving...' : 'Approve'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRejectForm(false);
                                    setRejectionReason('');
                                }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={isRejecting || rejectionReason.length < 10}
                            >
                                {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
