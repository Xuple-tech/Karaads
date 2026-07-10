import type { ReactNode } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Link } from '@/components/page-head';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type AdFlowStep = {
    number: number;
    title: string;
    shortTitle?: string;
    icon: LucideIcon;
};

type AdsFlowScaffoldProps = {
    title: string;
    subtitle?: string;
    steps?: AdFlowStep[];
    currentStep?: number;
    backHref?: string;
    onBack?: () => void;
    headerActions?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
};

type AdsStickyActionBarProps = {
    children: ReactNode;
    className?: string;
    withBottomNavOffset?: boolean;
};

type AdsSurfaceCardProps = {
    children: ReactNode;
    className?: string;
};

export function AdsFlowScaffold({
    title,
    subtitle,
    steps,
    currentStep,
    backHref,
    onBack,
    headerActions,
    children,
    className,
    contentClassName,
}: AdsFlowScaffoldProps) {
    const showSteps = Array.isArray(steps) && steps.length > 0 && typeof currentStep === 'number';

    return (
        <div className={cn('min-h-screen bg-[#0b0e13] text-white', className)}>
            <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0e13]/85 backdrop-blur-2xl">
                <div className="mobile-safe-top mobile-safe-x mx-auto max-w-4xl px-3 pb-3 pt-2 sm:px-4">
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
                        <div className="flex">
                            {onBack ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={onBack}
                                    className="h-11 w-11 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    aria-label="Go back"
                                >
                                    <ArrowLeft className="h-4.5 w-4.5" />
                                </Button>
                            ) : backHref ? (
                                <Link href={backHref}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-11 w-11 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                        aria-label="Go back"
                                    >
                                        <ArrowLeft className="h-4.5 w-4.5" />
                                    </Button>
                                </Link>
                            ) : (
                                <div className="h-11 w-11" />
                            )}
                        </div>

                        <div className="min-w-0 text-center">
                            <p className="karads-heading truncate text-[17px] font-semibold tracking-tight text-white">
                                {title}
                            </p>
                            {subtitle ? (
                                <p className="truncate text-[11px] text-white/55">{subtitle}</p>
                            ) : null}
                        </div>

                        <div className="flex min-w-11 justify-end">
                            {headerActions || <div className="h-11 w-11" />}
                        </div>
                    </div>

                    {showSteps ? (
                        <AdsStepProgress
                            steps={steps}
                            currentStep={currentStep}
                            className="mt-3"
                        />
                    ) : null}
                </div>
            </div>

            <div className={cn('mobile-safe-x mx-auto w-full max-w-4xl px-3 pb-24 pt-4 sm:px-4 sm:pb-10 sm:pt-6', contentClassName)}>
                {children}
            </div>
        </div>
    );
}

function AdsStepProgress({
    steps,
    currentStep,
    className,
}: {
    steps: AdFlowStep[];
    currentStep: number;
    className?: string;
}) {
    return (
        <div className={cn('no-scrollbar flex gap-2 overflow-x-auto pb-1', className)}>
            {steps.map((step) => {
                const complete = currentStep > step.number;
                const active = currentStep === step.number;
                const Icon = step.icon;

                return (
                    <div
                        key={step.number}
                        className={cn(
                            'flex min-w-[116px] flex-1 items-center gap-2 rounded-2xl border px-2.5 py-2',
                            active
                                ? 'border-white/30 bg-white/16'
                                : complete
                                  ? 'border-emerald-400/35 bg-emerald-500/10'
                                  : 'border-white/10 bg-white/5',
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold',
                                active
                                    ? 'border-white/35 bg-white text-black'
                                    : complete
                                      ? 'border-emerald-400/40 bg-emerald-500/25 text-emerald-100'
                                      : 'border-white/20 bg-transparent text-white/60',
                            )}
                        >
                            {complete ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] uppercase tracking-[0.14em] text-white/50">
                                Step {step.number}
                            </p>
                            <p className={cn('truncate text-xs font-semibold', active ? 'text-white' : 'text-white/75')}>
                                {step.shortTitle || step.title}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function AdsSurfaceCard({ children, className }: AdsSurfaceCardProps) {
    return (
        <section className={cn('mobile-card-elevated rounded-3xl p-4 sm:p-5', className)}>
            {children}
        </section>
    );
}

export function AdsStickyActionBar({
    children,
    className,
    withBottomNavOffset = true,
}: AdsStickyActionBarProps) {
    return (
        <div
            className={cn(
                'mobile-safe-x fixed inset-x-0 z-40 px-3 sm:static sm:px-0',
                withBottomNavOffset
                    ? 'bottom-[calc(4rem+env(safe-area-inset-bottom)+0.4rem)]'
                    : 'bottom-[calc(env(safe-area-inset-bottom)+0.4rem)]',
                className,
            )}
        >
            <div className="mobile-content-max">
                <div className="rounded-none border border-white/10 bg-[#0e1420]/90 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
                    {children}
                </div>
            </div>
        </div>
    );
}
