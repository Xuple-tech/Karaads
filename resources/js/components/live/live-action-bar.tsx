import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LiveActionBarItem {
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'default' | 'primary' | 'danger';
}

interface LiveActionBarProps {
    actions: LiveActionBarItem[];
    className?: string;
}

export function LiveActionBar({ actions, className }: LiveActionBarProps) {
    return (
        <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 z-30', className)}>
            <div className="pointer-events-auto mx-auto w-full max-w-[720px] px-3 pb-3 mobile-safe-bottom">
                <div className="live-glass rounded-2xl px-3 py-3">
                    <div
                        className="grid gap-2"
                        style={{
                            gridTemplateColumns: `repeat(${Math.max(actions.length, 1)}, minmax(0, 1fr))`,
                        }}
                    >
                        {actions.map((action) => {
                            const Icon = action.icon;
                            const variantClass =
                                action.variant === 'danger'
                                    ? 'live-danger'
                                    : action.variant === 'primary'
                                      ? 'live-primary'
                                      : 'live-control';

                            return (
                                <button
                                    key={action.label}
                                    type="button"
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                    className={cn(
                                        'flex h-12 w-full flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold uppercase tracking-wide',
                                        variantClass,
                                        action.disabled && 'opacity-60',
                                    )}
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                    <span>{action.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
