import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useAuthStore } from '@/features/auth/store';
import { FEED_QUERY_KEY } from '@/features/feed/hooks';
import { MOMENT_QUERY_KEY } from '@/features/moment/hooks';
import { NOTIFICATION_INBOX_KEY } from '@/features/notifications/inbox-hooks';
import { ensureNotificationChannels, normalizeNotification, notificationService, type NotificationItem } from '@/features/notifications/service';
import { MY_PROFILE_KEY } from '@/features/profile/hooks';
import { createLogger } from '@/lib/logging/logger';
import { navigationRef, router } from '@/lib/navigation/router';
import { reverbService } from '@/lib/realtime/reverb';

// Dynamically import expo-notifications only on native platforms
// This prevents the module from being evaluated during web bundling
let Notifications: any = null;
const logger = createLogger('push');
if (Platform.OS !== 'web') {
  // Use require to avoid import hoisting issues
  try {
    Notifications = require('expo-notifications');
  } catch (error) {
    logger.warn('failed_to_load_expo_notifications', { error });
  }
}

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'string' && value.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

const readString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
};

const upsertInboxItem = (current: NotificationItem[] | undefined, item: NotificationItem) => {
  const list = current ?? [];
  const withoutCurrent = list.filter((existing) => existing.id !== item.id);
  return [item, ...withoutCurrent];
};

const mergeInboxItems = (current: NotificationItem[] | undefined, incoming: NotificationItem[]) => {
  const map = new Map<string, NotificationItem>();
  (current ?? []).forEach((item) => map.set(item.id, item));
  incoming.forEach((item) => map.set(item.id, item));
  return [...map.values()].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const PushEventManager = () => {
  const authStatus = useAuthStore((state) => state.status);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const pathnameRef = useRef<string>('');
  const routeConversationIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const syncFromCurrentRoute = () => {
      const route = router.getCurrentRoute();
      pathnameRef.current = route?.name ?? '';
      const conversationId = (route?.params as { conversationId?: string } | undefined)?.conversationId;
      routeConversationIdRef.current = typeof conversationId === 'string' ? conversationId : undefined;
    };
    syncFromCurrentRoute();
    return navigationRef.addListener('state', syncFromCurrentRoute);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' || !Notifications?.addNotificationResponseReceivedListener) {
      return;
    }

    // Create Android notification channels early so local notifications always work
    ensureNotificationChannels().catch(() => {});

    const responseSub = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = asRecord(response.notification.request.content.data);
      const conversationId = readString(data.conversationId ?? data.conversation_id);
      const postId = readString(data.postId ?? data.post_id);
      const commentId = readString(data.commentId ?? data.comment_id ?? data.replyId ?? data.reply_id);
      const likeId = readString(data.likeId ?? data.like_id ?? data.reactionId ?? data.reaction_id);
      const type = readString(data.type);
      const stackType = readString(data.stackType);
      const callId = readString(data.callId ?? data.call_id);
      const mode = data.mode === 'video' || data.mode === 'audio' ? data.mode : undefined;
      const notificationId =
        readString(data.notificationId ?? data.notification_id);

      const openTarget = async () => {
        if (notificationId) {
          try {
            await notificationService.markRead(notificationId);
          } catch {
            // ignore mark-read failure for push tap routing
          }
        }

        if (conversationId) {
          const callMode = mode === 'video' ? 'video' : mode === 'audio' ? 'audio' : undefined;
          if (type === 'IncomingCall' || callId || stackType === 'calls') {
            router.push('Conversation', { conversationId, ...(callMode ? { mode: callMode } : {}) });
            return;
          }

          router.push('Conversation', { conversationId });
          return;
        }

        if (postId) {
          const focus = commentId ? 'comments' : likeId ? 'likes' : undefined;
          router.push('PostDetail', {
            postId,
            ...(focus ? { focus } : null),
            ...(commentId ? { commentId } : null),
            ...(likeId ? { likeId } : null),
          });
          return;
        }

        router.push('Notifications');
      };

      openTarget().catch(() => undefined);
    });

    return () => {
      responseSub.remove();
    };
  }, []);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !token || !user?.id) {
      return;
    }

    let cancelled = false;
    let dispose: (() => void) | undefined;

    const bootstrap = async () => {
      let allowLocalNotifications = false;
      if (Platform.OS !== 'web') {
        const permission = await notificationService.getPermission();
        allowLocalNotifications = permission === 'granted';
      }

      reverbService.connect(token);
      reverbService.subscribeUser(user.id);
      reverbService.subscribeNotifications(user.id);
      reverbService.subscribeFeed(user.id);

      const removeMessageListener = reverbService.onMessage((message) => {
        if (message.user_id && message.user_id === user.id) {
          return;
        }
        const isConversationOpen =
          pathnameRef.current === 'Conversation' &&
          typeof routeConversationIdRef.current === 'string' &&
          routeConversationIdRef.current === message.conversation_id;
        if (isConversationOpen) {
          return;
        }

        notificationService
          .sendStackedLocal({
            title: message.user?.name ?? 'New message',
            body: message.content || 'You have a new message',
            stackType: 'messages',
            data: {
              conversationId: message.conversation_id,
              messageId: message.id,
            },
          })
          .catch(() => undefined);
      });

      const removeCallListener = reverbService.onCallEvent((event) => {
        if (event.type === 'IncomingCall') {
          return;
        }

        const body =
          event.type === 'CallAccepted'
            ? 'Your call was accepted'
            : event.type === 'CallDeclined'
              ? 'Your call was declined'
              : 'Call ended';

        notificationService
          .sendStackedLocal({
            title: 'Call update',
            body,
            stackType: 'calls',
            data: { conversationId: event.conversation_id, callId: event.call_id, type: event.type },
          })
          .catch(() => undefined);
      });

      const removeNotificationListener = reverbService.onNotificationEvent((event) => {
        const payload = asRecord((event as Record<string, unknown>).notification ?? (event as Record<string, unknown>).data ?? event);
        const item = normalizeNotification(payload);
        const isDuplicate = seenNotificationIdsRef.current.has(item.id);
        seenNotificationIdsRef.current.add(item.id);
        queryClient.setQueryData<NotificationItem[]>(NOTIFICATION_INBOX_KEY, (current) => upsertInboxItem(current, item));
        if (isDuplicate || !allowLocalNotifications) {
          return;
        }
        notificationService.sendStackedFromInbox(item).catch(() => undefined);
      });

      const removeActivityListener = reverbService.onActivityEvent((event) => {
        const payload = asRecord((event as Record<string, unknown>).post ?? (event as Record<string, unknown>).data ?? event);
        const actorId = payload.actor_id ?? payload.user_id ?? asRecord(payload.user).id;
        queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }).catch(() => undefined);
        queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEY }).catch(() => undefined);
        queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY }).catch(() => undefined);
        if (!allowLocalNotifications || (typeof actorId === 'string' && actorId === user.id)) {
          return;
        }

        const title = typeof payload.title === 'string' && payload.title.trim() ? payload.title : 'Activity update';
        const body =
          typeof payload.body === 'string' && payload.body.trim()
            ? payload.body
            : typeof payload.content === 'string' && payload.content.trim()
              ? payload.content
              : 'New post in your feed';
        notificationService
          .sendStackedLocal({
            title,
            body,
            stackType: 'posts',
            data: {
              postId:
                readString(payload.post_id) ??
                readString(payload.postId) ??
                readString(payload.id),
              actorId: typeof actorId === 'string' ? actorId : undefined,
              event: 'PostCreated',
            },
          })
          .catch(() => undefined);
      });

      let pollTimer: ReturnType<typeof setInterval> | null = null;
      const syncInboxFromServer = async (notifyIfNew: boolean) => {
        try {
          const latest = await notificationService.getInbox();
          latest.forEach((item) => {
            if (!seenNotificationIdsRef.current.has(item.id) && notifyIfNew && allowLocalNotifications) {
              seenNotificationIdsRef.current.add(item.id);
              notificationService.sendStackedFromInbox(item).catch(() => undefined);
            } else {
              seenNotificationIdsRef.current.add(item.id);
            }
          });
          queryClient.setQueryData<NotificationItem[]>(NOTIFICATION_INBOX_KEY, (current) => mergeInboxItems(current, latest));
        } catch {
          // ignore polling failures
        }
      };

      // prime known ids without firing local notifications
      syncInboxFromServer(false).catch(() => undefined);
      // fallback for environments where realtime delivery is intermittent
      pollTimer = setInterval(() => {
        syncInboxFromServer(true).catch(() => undefined);
      }, 20000);

      return () => {
        removeMessageListener();
        removeCallListener();
        removeNotificationListener();
        removeActivityListener();
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
        reverbService.unsubscribeUser(user.id);
        reverbService.unsubscribeNotifications(user.id);
        reverbService.unsubscribeFeed(user.id);
      };
    };

    bootstrap()
      .then((cleanup) => {
        if (cancelled) {
          cleanup?.();
          return;
        }
        dispose = cleanup;
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [authStatus, queryClient, token, user?.id]);

  return null;
};
