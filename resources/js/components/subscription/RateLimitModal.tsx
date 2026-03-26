import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Zap, ArrowRight } from 'lucide-react';

interface RateLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    error: {
        reason: string;
        limit?: number;
        used?: number;
        reset_at?: string;
        plan_name?: string;
        plan_id?: string;
    };
}

export default function RateLimitModal({ isOpen, onClose, error }: RateLimitModalProps) {
    const [timeUntilReset, setTimeUntilReset] = useState<string>('');

    useEffect(() => {
        if (!error.reset_at) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const resetTime = new Date(error.reset_at!).getTime();
            const diff = resetTime - now;

            if (diff <= 0) {
                setTimeUntilReset('Now');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [error.reset_at]);

    const handleUpgrade = () => {
        window.location.href = '/subscription/pricing';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <DialogTitle>Rate Limit Reached</DialogTitle>
                    </div>
                    <DialogDescription>
                        You've reached your usage limit for your current plan
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Error Details */}
                    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <AlertTitle className="text-amber-900 dark:text-amber-100">
                            {error.reason}
                        </AlertTitle>
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                            {error.plan_name && (
                                <div>
                                    Current plan: <span className="font-semibold">{error.plan_name}</span>
                                </div>
                            )}
                            {error.limit && error.used !== undefined && (
                                <div>
                                    Used: <span className="font-semibold">{error.used.toLocaleString()}</span> of{' '}
                                    <span className="font-semibold">{error.limit.toLocaleString()}</span>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>

                    {/* Reset Timer */}
                    {error.reset_at && timeUntilReset && (
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Resets in:
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {timeUntilReset}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleUpgrade}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Upgrade Your Plan
                        </Button>

                        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                            Upgrade to a higher tier to get more usage limits
                        </p>

                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="w-full"
                        >
                            OK, I understand
                        </Button>
                    </div>

                    {/* Benefits Teaser */}
                    <div className="border-t pt-4">
                        <p className="text-sm font-semibold mb-2">Next tier benefits:</p>
                        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <li className="flex items-center">
                                <ArrowRight className="h-3 w-3 mr-2 text-green-500" />
                                3x higher usage limits
                            </li>
                            <li className="flex items-center">
                                <ArrowRight className="h-3 w-3 mr-2 text-green-500" />
                                Priority support
                            </li>
                            <li className="flex items-center">
                                <ArrowRight className="h-3 w-3 mr-2 text-green-500" />
                                Advanced features
                            </li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
