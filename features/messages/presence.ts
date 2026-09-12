import type { UserSummary } from '@/lib/types/domain';

const getPresenceDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const formatRelativeTime = (value?: string | null, compact = false) => {
  const date = getPresenceDate(value);
  if (!date) return '';

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < minute) return compact ? 'now' : 'just now';
  if (diffMs < hour) {
    const amount = Math.floor(diffMs / minute);
    return compact ? `${amount}m ago` : `${amount} min ago`;
  }
  if (diffMs < day) {
    const amount = Math.floor(diffMs / hour);
    return compact ? `${amount}h ago` : `${amount} hour${amount === 1 ? '' : 's'} ago`;
  }
  if (diffMs < week) {
    const amount = Math.floor(diffMs / day);
    return compact ? `${amount}d ago` : `${amount} day${amount === 1 ? '' : 's'} ago`;
  }

  return compact
    ? date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

export const isUserOnline = (user?: UserSummary | null) => Boolean(user?.is_online);

export const getUserLastSeen = (user?: UserSummary | null) => user?.last_seen ?? user?.last_active_at ?? null;

export const formatPresenceLabel = (user?: UserSummary | null) => {
  if (isUserOnline(user)) return 'Online';
  const lastSeen = getUserLastSeen(user);
  const relative = formatRelativeTime(lastSeen, false);
  return relative ? `Last seen ${relative}` : 'Last seen recently';
};

export const formatPresenceListTime = (user?: UserSummary | null) => {
  if (isUserOnline(user)) return 'Online';
  return formatRelativeTime(getUserLastSeen(user), true);
};
