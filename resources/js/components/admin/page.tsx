import { type PropsWithChildren, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, type LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function AdminPage({
    className,
    children,
}: PropsWithChildren<{ className?: string }>) {
    return <div className={cn('space-y-6', className)}>{children}</div>;
}

export function AdminPageHeader({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
                {eyebrow ? (
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em]">
                        {eyebrow}
                    </Badge>
                ) : null}
                <div className="space-y-1">
                    <h1 className="karads-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        {title}
                    </h1>
                    {description ? <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">{description}</p> : null}
                </div>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
    );
}

export function AdminSection({
    title,
    description,
    action,
    children,
    className,
}: PropsWithChildren<{
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}>) {
    return (
        <section className={cn('space-y-4', className)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h2 className="karads-heading text-xl font-semibold text-foreground">{title}</h2>
                    {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export function AdminMetricCard({
    label,
    value,
    hint,
    icon: Icon,
    tone = 'default',
}: {
    label: string;
    value: ReactNode;
    hint?: string;
    icon: LucideIcon;
    tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const toneClasses = {
        default: 'from-sky-500/12 to-cyan-500/8 text-sky-700 dark:text-sky-200',
        success: 'from-emerald-500/12 to-teal-500/8 text-emerald-700 dark:text-emerald-200',
        warning: 'from-amber-500/12 to-orange-500/8 text-amber-700 dark:text-amber-200',
        danger: 'from-rose-500/12 to-red-500/8 text-rose-700 dark:text-rose-200',
    };

    return (
        <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                    <div className="karads-heading text-3xl font-semibold tracking-tight text-foreground">{value}</div>
                    {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
                </div>
                <div className={cn('rounded-2xl bg-gradient-to-br p-3', toneClasses[tone])}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    );
}

export function AdminActionCard({
    title,
    description,
    href,
    icon: Icon,
    meta,
}: {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    meta?: ReactNode;
}) {
    return (
        <Link href={href} className="group block h-full">
            <Card className="h-full border-border/70 bg-card/90 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <CardContent className="flex h-full flex-col justify-between gap-6 p-5">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <Icon className="h-5 w-5" />
                            </div>
                            {meta ? <div>{meta}</div> : null}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-foreground">{title}</h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        Open
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

export function AdminPanel({
    title,
    description,
    children,
    className,
}: PropsWithChildren<{
    title: string;
    description?: string;
    className?: string;
}>) {
    return (
        <Card className={cn('border-border/70 bg-card/90 shadow-sm', className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description ? <CardDescription>{description}</CardDescription> : null}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
