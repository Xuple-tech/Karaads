import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useAuthStore } from '@/features/auth/store';
import { callsService } from '@/features/calls/service';
import { FEED_QUERY_KEY } from '@/features/feed/hooks';
import { CONVERSATIONS_KEY } from '@/features/messages/hooks';
import { MOMENT_QUERY_KEY } from '@/features/moment/hooks';
import { NOTIFICATION_INBOX_KEY } from '@/features/notifications/inbox-hooks';
import { reverbService } from '@/lib/realtime/reverb';

const INVALIDATE_DEBOUNCE_MS = 320;

export const RealtimeSyncManager = () => {
  const authStatus = useAuthStore((state) => state.status);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const feedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inboxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web' || authStatus !== 'authenticated' || !token || !user?.id) {
      return;
    }

    const queueFeedInvalidation = () => {
      if (feedTimerRef.current) {
        clearTimeout(feedTimerRef.current);
      }
      feedTimerRef.current = setTimeout(() => {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
          queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEY }),
        ]).catch(() => undefined);
      }, INVALIDATE_DEBOUNCE_MS);
    };

    const queueInboxInvalidation = () => {
      if (inboxTimerRef.current) {
        clearTimeout(inboxTimerRef.current);
      }
      inboxTimerRef.current = setTimeout(() => {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: NOTIFICATION_INBOX_KEY }),
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
        ]).catch(() => undefined);
      }, INVALIDATE_DEBOUNCE_MS);
    };

    reverbService.connect(token);
    reverbService.subscribeFeed(user.id);
    reverbService.subscribeNotifications(user.id);

    const removeFeedListener = reverbService.onActivityEvent(() => {
      queueFeedInvalidation();
    });

    const removeNotificationListener = reverbService.onNotificationEvent(() => {
      queueInboxInvalidation();
    });

    // On WebSocket reconnect, re-sync active call + re-subscribe channels
    const removeConnectionListener = reverbService.onConnectionState((isConnected) => {
      if (isConnected && !wasConnectedRef.current) {
        // Reconnected after a drop — resync everything
        queueFeedInvalidation();
        queueInboxInvalidation();
        // Re-sync any active call so its state doesn't go stale
        callsService.getActiveCall().then((call) => {
          if (call) {
            reverbService.subscribeCall(call.id);
          }
        }).catch(() => undefined);
      }
      wasConnectedRef.current = isConnected;
    });

    return () => {
      removeFeedListener();
      removeNotificationListener();
      removeConnectionListener();
      if (feedTimerRef.current) {
        clearTimeout(feedTimerRef.current);
        feedTimerRef.current = null;
      }
      if (inboxTimerRef.current) {
        clearTimeout(inboxTimerRef.current);
        inboxTimerRef.current = null;
      }
      reverbService.unsubscribeFeed(user.id);
      reverbService.unsubscribeNotifications(user.id);
    };
  }, [authStatus, queryClient, token, user?.id]);

  return null;
};
