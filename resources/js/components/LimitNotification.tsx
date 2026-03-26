import { AlertCircle, ArrowRight, LogIn, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { memo } from 'react';

interface LimitErrorData {
    message: string;
    action: 'upgrade' | 'login';
    action_label?: string;
    action_url?: string;
    type?: string;
    code?: string;
    limit?: number;
    used?: number;
    remaining?: number;
    needed?: number;
    reset_at?: string;
    reset_type?: string;
    plan_name?: string;
    upgrade_required?: boolean;
    login_required?: boolean;
}

interface LimitNotificationProps {
    error: LimitErrorData | null;
    onClose?: () => void;
    onUpgrade?: () => void;
    onLogin?: () => void;
}

const LimitNotification = memo(({
    error,
    onClose,
    onUpgrade,
    onLogin
}: LimitNotificationProps) => {
    if (!error) return null;

    const isUpgradeAction = error.action === 'upgrade';
    const isLoginAction = error.action === 'login';

    // Determine styling based on action type
    const getIcon = () => {
        if (isUpgradeAction) return <Zap className="h-5 w-5 text-amber-600" />;
        if (isLoginAction) return <LogIn className="h-5 w-5 text-blue-600" />;
        return <AlertCircle className="h-5 w-5 text-destructive" />;
    };

    const getStyles = () => {
        if (isUpgradeAction) return 'bg-gradient-to-r from-black via-primary to-orange- border-amber-200';
        if (isLoginAction) return 'bg-blue-50 border-blue-200';
        return 'bg-red-50 border-red-200';
    };

    const getTitle = () => {
        if (isUpgradeAction) return 'Upgrade Required';
        if (isLoginAction) return 'Sign In Required';
        return 'Limit Reached';
    };

    const getButtonColor = () => {
        if (isUpgradeAction) return 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700';
        if (isLoginAction) return 'bg-blue-600 hover:bg-blue-700';
        return 'bg-destructive hover:bg-destructive/90';
    };

    // Format reset time for display
    const formatResetTime = (): string | null => {
        if (!error.reset_at) return null;

        try {
            const date = new Date(error.reset_at);
            const now = new Date();

            if (error.reset_type === 'daily') {
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);

                const hoursUntilReset = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));

                if (hoursUntilReset <= 1) {
                    return 'Resets in less than an hour';
                }

                return `Resets in ${hoursUntilReset} hours`;
            }

            return `Resets on ${date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}`;
        } catch (e) {
            return null;
        }
    };

    // Calculate usage percentage
    const getUsagePercentage = (): number => {
        if (error.limit === undefined || error.used === undefined) return 0;
        return Math.min(100, Math.round((error.used / error.limit) * 100));
    };

    const handleAction = () => {
        if (isUpgradeAction && onUpgrade) {
            onUpgrade();
        } else if (isLoginAction && onLogin) {
            onLogin();
        } else if (error.action_url) {
            window.location.href = error.action_url;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 flex items-center justify-center z-[900] fixed top-0 left-0 right-0 bottom-0 backdrop-blur-xl">
            <Card className={`${getStyles()} border-2 shadow-md max-w-md m-auto`}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-background/80">
                            {getIcon()}
                        </div>
                        <span>{getTitle()}</span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Main Message */}
                    <Alert className={isUpgradeAction ? 'bg-amber-00 -amber-300' : isLoginAction ? 'bg-blue-100 border-blue-300' : 'bg-red-100 border-red-300'}>
                        <AlertDescription className="text-foreground font-medium">
                            {error.message}
                        </AlertDescription>
                    </Alert>

                    {/* Usage Details */}
                    {error.limit !== undefined && error.used !== undefined && (
                        <div className="bg-background/50 rounded-lg p-4 space-y-3">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-foreground">
                                        Usage
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {error.used} <span className="text-muted-foreground">/ {error.limit}</span>
                                    </span>
                                </div>
                                <Progress
                                    value={getUsagePercentage()}
                                    className="h-2"
                                />
                                {error.remaining !== undefined && (
                                    <p className="text-xs text-muted-foreground">
                                        {error.remaining} remaining
                                    </p>
                                )}
                            </div>

                            {/* Needed information (for feature requests) */}
                            {error.needed && error.needed > error.remaining! && (
                                <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                                    You need {error.needed} more, but your limit only allows {error.remaining}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reset Time */}
                    {formatResetTime() && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                            {formatResetTime()}
                        </div>
                    )}

                    {/* Plan Information */}
                    {error.plan_name && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Current Plan:</span>
                            <span className="font-semibold text-foreground">{error.plan_name}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={handleAction}
                            className={`${getButtonColor()} flex-1`}
                            size="sm"
                        >
                            {error.action_label || (isUpgradeAction ? 'Upgrade Now' : 'Sign In')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        {onClose && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                className="px-4"
                            >
                                Dismiss
                            </Button>
                        )}
                    </div>

                    {/* Additional Help Text */}
                    {isUpgradeAction && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                            Upgrade to get higher limits and more features
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
});

LimitNotification.displayName = 'LimitNotification';

export default LimitNotification;
