import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    limitType?: string;
    message?: string;
}

export function LoginDialog({ open, onOpenChange, limitType = 'unauthenticated', message }: LoginDialogProps) {
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        setIsOpen(open);
    }, [open]);

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen);
        onOpenChange(newOpen);
    };

    const handleSignInClick = () => {
        window.location.href = '/login';
    };

    const titleMap: Record<string, string> = {
        'unauthenticated': 'Sign In Required',
        'subscription_required': 'Subscription Required',
        'no_plan': 'Plan Required',
    };

    const messageMap: Record<string, string> = {
        'unauthenticated': 'Sign in to your account to access all features and start using Kwati AI.',
        'subscription_required': 'A subscription is required to use this feature. Sign in to view subscription options.',
        'no_plan': 'Please subscribe to use this feature. Sign in to explore our plans.',
    };

    const title = titleMap[limitType] || 'Sign In Required';
    const displayMessage = message || messageMap[limitType] || 'Sign in to your account to continue.';

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <LogIn className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-foreground/90 pt-2">
                        {displayMessage}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                You need to be signed in to access this feature. Create a free account or sign in to your existing account.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSignInClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
