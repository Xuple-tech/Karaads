import { formatDistanceToNow } from "date-fns";

export interface PresenceUserLike {
  is_online?: boolean;
  last_seen_at?: string | null;
}

export function getPresenceState(user?: PresenceUserLike | null) {
  const isOnline = Boolean(user?.is_online);
  const lastSeenAt = user?.last_seen_at ? new Date(user.last_seen_at) : null;

  if (isOnline) {
    return {
      isOnline: true,
      statusLabel: "Online",
      detailLabel: "Active now",
    };
  }

  if (!lastSeenAt || Number.isNaN(lastSeenAt.getTime())) {
    return {
      isOnline: false,
      statusLabel: "Offline",
      detailLabel: "Last seen unavailable",
    };
  }

  return {
    isOnline: false,
    statusLabel: "Offline",
    detailLabel: `Last seen ${formatDistanceToNow(lastSeenAt, { addSuffix: true })}`,
  };
}
