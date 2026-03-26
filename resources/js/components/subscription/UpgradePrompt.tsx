import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react';

type Severity = 'info' | 'warning' | 'critical';

interface UpgradePromptProps {
    severity?: Severity;
    title?: string;
    message?: string;
    currentLimit?: number;
    currentUsage?: number;
    planName?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
}

export default function UpgradePrompt({
    severity = 'info',
    title,
    message,
    currentLimit,
    currentUsage,
    planName,
    dismissible = true,
    onDismiss,
}: UpgradePromptProps) {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) return null;

    const handleDismiss = () => {
        setIsDismissed(true);
        onDismiss?.();
    };

    const getAlertConfig = () => {
        switch (severity) {
            case 'critical':
                return {
                    icon: AlertTriangle,
                    className: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
                    titleColor: 'text-red-900 dark:text-red-100',
                    descColor: 'text-red-800 dark:text-red-200',
                    buttonColor: 'bg-red-600 hover:bg-red-700',
                };
            case 'warning':
                return {
                    icon: AlertCircle,
                    className: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
                    titleColor: 'text-amber-900 dark:text-amber-100',
                    descColor: 'text-amber-800 dark:text-amber-200',
                    buttonColor: 'bg-amber-600 hover:bg-amber-700',
                };
            default:
                return {
                    icon: Info,
                    className: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
                    titleColor: 'text-blue-900 dark:text-blue-100',
                    descColor: 'text-blue-800 dark:text-blue-200',
                    buttonColor: 'bg-blue-600 hover:bg-blue-700',
                };
        }
    };

    const config = getAlertConfig();
    const IconComponent = config.icon;

    return (
        <Alert className={`${config.className} relative pr-12`}>
            <div className="flex items-start space-x-3">
                <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    {title && (
                        <AlertTitle className={config.titleColor}>
                            {title}
                        </AlertTitle>
                    )}
                    <AlertDescription className={config.descColor}>
                        {message && <p>{message}</p>}

                        {currentLimit && currentUsage !== undefined && (
                            <div className="mt-2 text-sm">
                                <p>
                                    You've used{' '}
                                    <span className="font-semibold">
                                        {currentUsage.toLocaleString()}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-semibold">
                                        {currentLimit.toLocaleString()}
                                    </span>
                                    {' '}requests
                                </p>
                            </div>
                        )}

                        {planName && (
                            <div className="mt-2 text-sm">
                                <p>
                                    Current plan: <span className="font-semibold">{planName}</span>
                                </p>
                            </div>
                        )}

                        <div className="mt-4">
                            <Button
                                onClick={() => window.location.href = '/subscription/pricing'}
                                className={config.buttonColor}
                                size="sm"
                            >
                                <Zap className="h-3 w-3 mr-2" />
                                View Plans
                            </Button>
                        </div>
                    </AlertDescription>
                </div>
            </div>

            {dismissible && (
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </Alert>
    );
}
