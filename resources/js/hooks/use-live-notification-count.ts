import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/lib/axios";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

interface NotificationCountResponse {
  meta?: {
    total?: number;
  };
  data?: Array<NotificationLikeItem | unknown>;
}

type NotificationLikeItem = {
  id?: string;
  type?: string;
  action?: string;
  content?: string;
  created_at?: string;
  related_id?: string;
  conversation_id?: string;
  user?: {
    id?: string;
  };
};

const getSeenStorageKey = (userId?: string) =>
  userId ? `karaads:notifications:last-seen:${userId}` : "";

const readSeenAt = (userId?: string): string | null => {
  if (!userId || typeof window === "undefined") return null;
  return window.localStorage.getItem(getSeenStorageKey(userId));
};

const writeSeenAt = (userId?: string, seenAt?: string | null) => {
  if (!userId || typeof window === "undefined" || !seenAt) return;
  window.localStorage.setItem(getSeenStorageKey(userId), seenAt);
};

const resolveNewestTimestamp = (items?: Array<{ created_at?: string } | unknown>): string | null => {
  if (!Array.isArray(items) || items.length === 0) return null;

  for (const item of items) {
    if (item && typeof item === "object" && "created_at" in item) {
      const createdAt = (item as { created_at?: string }).created_at;
      if (createdAt) return createdAt;
    }
  }

  return null;
};

const getNotificationIdentity = (item: NotificationLikeItem | unknown) => {
  if (!item || typeof item !== "object") return null;

  const notification = item as NotificationLikeItem;
  return [
    notification.type || "",
    notification.user?.id || "",
    notification.related_id || "",
    notification.conversation_id || "",
    notification.action || "",
    notification.content || "",
    notification.created_at || "",
  ].join("|");
};

const dedupeNotifications = (items: Array<NotificationLikeItem | unknown>) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const identity = getNotificationIdentity(item);
    if (!identity) return false;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
};

const countUnseen = (
  items: Array<{ created_at?: string } | unknown> | undefined,
  seenAt: string | null,
) => {
  if (!Array.isArray(items)) return 0;
  if (!seenAt) return items.length;

  const seenTime = new Date(seenAt).getTime();
  if (Number.isNaN(seenTime)) return items.length;

  return items.filter((item) => {
    if (!item || typeof item !== "object" || !("created_at" in item)) return false;
    const createdAt = (item as { created_at?: string }).created_at;
    if (!createdAt) return false;
    const createdTime = new Date(createdAt).getTime();
    return !Number.isNaN(createdTime) && createdTime > seenTime;
  }).length;
};

export function useLiveNotificationCount({
  userId,
  enabled = true,
  clearOnActive = false,
}: {
  userId?: string;
  enabled?: boolean;
  clearOnActive?: boolean;
}) {
  const [count, setCount] = useState(0);
  const [seenAt, setSeenAt] = useState<string | null>(() => readSeenAt(userId));
  const [liveNotifications, setLiveNotifications] = useState<NotificationLikeItem[]>([]);

  useEffect(() => {
    setSeenAt(readSeenAt(userId));
    setLiveNotifications([]);
  }, [userId]);

  const { data } = useQuery({
    queryKey: ["notifications", "live-count", userId],
    queryFn: async () => {
      const response = await axiosInstance.get<NotificationCountResponse>("/api/users/notifications", {
        params: { page: 1, per_page: 20 },
      });
      return response.data;
    },
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });

  const apiNotifications = useMemo(
    () => (Array.isArray(data?.data) ? data.data : []),
    [data?.data],
  );

  const mergedNotifications = useMemo(() => {
    const combined = [...liveNotifications, ...apiNotifications];
    return dedupeNotifications(combined);
  }, [apiNotifications, liveNotifications]);

  useEffect(() => {
    if (!enabled) return;
    const nextCount = countUnseen(mergedNotifications, seenAt);
    setCount((current) => (current === nextCount ? current : nextCount));
  }, [enabled, mergedNotifications, seenAt]);

  useEffect(() => {
    if (!liveNotifications.length || !apiNotifications.length) return;

    const apiIdentities = new Set(
      apiNotifications
        .map((item) => getNotificationIdentity(item))
        .filter((identity): identity is string => Boolean(identity)),
    );

    setLiveNotifications((current) =>
      current.filter((item) => {
        const identity = getNotificationIdentity(item);
        return !identity || !apiIdentities.has(identity);
      }),
    );
  }, [apiNotifications, liveNotifications.length]);

  useRealtimeNotifications({
    userId: userId || "",
    onNotificationReceived: (notification) => {
      if (clearOnActive) return;

      setLiveNotifications((current) => {
        const identity = getNotificationIdentity(notification);
        if (!identity) return current;

        const existsInLive = current.some((item) => getNotificationIdentity(item) === identity);
        const existsInApi = apiNotifications.some((item) => getNotificationIdentity(item) === identity);
        if (existsInLive || existsInApi) {
          return current;
        }

        return [notification, ...current];
      });
    },
  });

  useEffect(() => {
    if (!clearOnActive || !enabled) return;

    const newestSeenAt = resolveNewestTimestamp(mergedNotifications) ?? new Date().toISOString();
    if (seenAt !== newestSeenAt) {
      writeSeenAt(userId, newestSeenAt);
      setSeenAt(newestSeenAt);
    }
    setLiveNotifications((current) => (current.length === 0 ? current : []));
    setCount((current) => (current === 0 ? current : 0));
  }, [clearOnActive, enabled, mergedNotifications, seenAt, userId]);

  const markAllSeen = () => {
    const newestSeenAt = resolveNewestTimestamp(mergedNotifications) ?? new Date().toISOString();
    writeSeenAt(userId, newestSeenAt);
    setSeenAt(newestSeenAt);
    setLiveNotifications([]);
    setCount(0);
  };

  return {
    notificationCount: count,
    clearNotificationCount: markAllSeen,
  };
}
