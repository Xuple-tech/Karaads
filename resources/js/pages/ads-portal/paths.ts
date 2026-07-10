export function isManagerAdsHost() {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  return host === 'manager' || host.startsWith('manager.')
}

export function adsPortalPath(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (isManagerAdsHost()) {
    return normalized === '' ? '/' : normalized
  }
  if (normalized === '/') return '/manager-ads'
  return `/manager-ads${normalized}`
}

export function adsPortalShowPath(creativeId: string) {
  return adsPortalPath(`/${creativeId}`)
}

export function adsPortalEditPath(creativeId: string) {
  return adsPortalPath(`/${creativeId}/edit`)
}

export function formatNaira(value: number | string | null | undefined) {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0)
  if (!Number.isFinite(numeric)) return '₦0'
  return `₦${numeric.toLocaleString()}`
}

export const adStatusLabel: Record<string, string> = {
  active: 'Active',
  in_review: 'In review',
  approved: 'Approved',
  paused: 'Paused',
  completed: 'Completed',
  draft: 'Draft',
  archived: 'Archived',
  rejected: 'Rejected',
}

export function adStatusClasses(status?: string) {
  switch (status) {
    case 'active':
      return 'border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
    case 'in_review':
      return 'border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300'
    case 'approved':
      return 'border-sky-500/30 bg-sky-500/12 text-sky-700 dark:text-sky-300'
    case 'paused':
      return 'border-zinc-500/30 bg-zinc-500/12 text-zinc-700 dark:text-zinc-300'
    case 'rejected':
      return 'border-rose-500/30 bg-rose-500/12 text-rose-700 dark:text-rose-300'
    case 'archived':
      return 'border-zinc-500/30 bg-zinc-500/12 text-zinc-700 dark:text-zinc-300'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}
