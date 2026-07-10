import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LiveOverlayHeaderProps {
    title: string;
    subtitle?: string;
    viewerCount?: number;
    statusLabel?: string;
    statusClassName?: string;
    onBack?: () => void;
    rightSlot?: React.ReactNode;
    className?: string;
}

export function LiveOverlayHeader({
    title,
    subtitle,
    viewerCount,
    statusLabel,
    statusClassName,
    onBack,
    rightSlot,
    className,
}: LiveOverlayHeaderProps) {
    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-x-0 top-0 z-30 mobile-safe-top mobile-safe-x',
                className,
            )}
        >
            <div className="pointer-events-auto mx-auto w-full max-w-[720px] px-3 pt-3">
                <div className="live-glass rounded-2xl px-3 py-2">
                    <div className="flex items-center gap-3">
                        {onBack ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onBack}
                                className="live-control h-10 w-10 rounded-full"
                                aria-label="Back"
                            >
                                <ArrowLeft className="h-4.5 w-4.5" />
                            </Button>
                        ) : (
                            <div className="h-10 w-10" />
                        )}

                        <div className="min-w-0 flex-1">
                            <p className="karads-heading truncate text-sm font-semibold text-white">
                                {title}
                            </p>
                            {subtitle ? (
                                <p className="truncate text-[11px] text-white/60">
                                    {subtitle}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                            {typeof viewerCount === 'number' ? (
                                <span className="live-chip inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold">
                                    {viewerCount} watching
                                </span>
                            ) : null}
                            {statusLabel ? (
                                <span
                                    className={cn(
                                        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold',
                                        statusClassName ?? 'live-chip',
                                    )}
                                >
                                    {statusLabel}
                                </span>
                            ) : null}
                            {rightSlot}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
