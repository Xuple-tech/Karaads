import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Zap, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UpgradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    limitType?: string;
    message?: string;
}

export function UpgradeDialog({ open, onOpenChange, limitType = 'rate_limit_exceeded', message }: UpgradeDialogProps) {
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        setIsOpen(open);
    }, [open]);

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen);
        onOpenChange(newOpen);
    };

    const handleUpgradeClick = () => {
        window.location.href = '/pricing';
    };

    const titleMap: Record<string, string> = {
        'rate_limit_exceeded': 'Daily Request Limit Reached',
        'daily_limit_exceeded': 'Daily Limit Reached',
        'monthly_limit_exceeded': 'Monthly Limit Reached',
        'image_limit_exceeded': 'Image Generation Limit Reached',
        'token_limit_exceeded': 'Token Usage Limit Exceeded',
        'unauthenticated': 'Sign In Required',
    };

    const messageMap: Record<string, string> = {
        'rate_limit_exceeded': 'You\'ve used your allotted requests for today. Upgrade your plan to get more requests.',
        'daily_limit_exceeded': 'You\'ve reached your daily limit. Upgrade to continue using unlimited requests.',
        'monthly_limit_exceeded': 'You\'ve reached your monthly limit. Upgrade your plan for higher limits.',
        'image_limit_exceeded': 'You\'ve reached your daily image generation limit. Upgrade for more image generations.',
        'token_limit_exceeded': 'You\'ve reached your token usage limit. Upgrade for more tokens.',
        'unauthenticated': 'Sign in to your account to continue using Kwati AI.',
    };

    const title = titleMap[limitType] || 'Upgrade Required';
    const displayMessage = message || messageMap[limitType] || 'Upgrade your plan to unlock premium features.';

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg mt-0.5">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription className="mt-2">
                                {displayMessage}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 my-4">
                    <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-foreground">Upgrade to Pro</h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Unlimited daily requests
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Priority support
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    Advanced features
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpgradeClick} className="gap-2">
                        <Zap className="h-4 w-4" />
                        View Plans
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
