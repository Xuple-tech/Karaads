import React from 'react';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { Paginated } from './types';

// ─── Panel ────────────────────────────────────────────────────────────────────

export function Panel({
    title,
    description,
    action,
    children,
    className,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('rounded-xl border border-border bg-card shadow-sm', className)}>
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                    {description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

// ─── Field ────────────────────────────────────────────────────────────────────

export function Field({
    label,
    children,
    className,
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <label className={cn('flex flex-col gap-1.5 text-sm', className)}>
            <span className="font-medium text-foreground">{label}</span>
            {children}
        </label>
    );
}

// ─── SelectField ──────────────────────────────────────────────────────────────

export function SelectField({
    label,
    value,
    onChange,
    children,
    className,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Field label={label} className={className}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
            >
                {children}
            </select>
        </Field>
    );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export function StatCard({
    label,
    value,
    sub,
    icon,
}: {
    label: string;
    value: string;
    sub?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
            {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
        </div>
    );
}

// ─── Banner ───────────────────────────────────────────────────────────────────

export function Banner({
    tone,
    text,
    onDismiss,
}: {
    tone: 'success' | 'error' | 'warning';
    text: string;
    onDismiss?: () => void;
}) {
    const cls =
        tone === 'success'
            ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:border-green-400/30 dark:bg-green-400/10 dark:text-green-400'
            : tone === 'warning'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-400';
    return (
        <div className={cn('flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm', cls)}>
            <span>{text}</span>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Dismiss"
                >
                    ✕
                </button>
            )}
        </div>
    );
}

// ─── ModelToggle ──────────────────────────────────────────────────────────────

export function ModelToggle({
    publicId,
    selected,
    onToggle,
}: {
    publicId: string;
    selected: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
        >
            {publicId}
        </button>
    );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable({
    headers,
    children,
    empty,
}: {
    headers: string[];
    children: React.ReactNode;
    empty?: boolean;
}) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/60">
                        {headers.map((h) => (
                            <th
                                key={h}
                                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                    {empty ? (
                        <tr>
                            <td
                                colSpan={headers.length}
                                className="px-4 py-10 text-center text-sm text-muted-foreground"
                            >
                                No data available.
                            </td>
                        </tr>
                    ) : (
                        children
                    )}
                </tbody>
            </table>
        </div>
    );
}

export function Td({
    children,
    mono,
    className,
}: {
    children: React.ReactNode;
    mono?: boolean;
    className?: string;
}) {
    return (
        <td className={cn('px-4 py-3 text-sm text-foreground', mono && 'font-mono text-xs', className)}>
            {children}
        </td>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function Pagination({ links }: { links: Paginated<unknown>['links'] }) {
    if (links.length <= 3) return null;
    return (
        <div className="mt-4 flex items-center justify-end gap-1">
            {links.map((link) => (
                <button
                    key={`${link.label}-${link.url}`}
                    type="button"
                    disabled={!link.url}
                    onClick={() =>
                        link.url &&
                        router.visit(link.url, { preserveScroll: true, preserveState: true })
                    }
                    className={cn(
                        'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                        link.active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export function formatDate(value?: string | null) {
    return value ? new Date(value).toLocaleString() : 'Never';
}
