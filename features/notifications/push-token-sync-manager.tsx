import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useAuthStore } from '@/features/auth/store';
import { createLogger } from '@/lib/logging/logger';

import { notificationService } from './service';

let Notifications: any = null;
const logger = createLogger('push');
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
  } catch {
    // unavailable
  }
}

export const PushTokenSyncManager = () => {
  const status = useAuthStore((state) => state.status);
  const token = useAuthStore((state) => state.token);
  const lastPushTokenRef = useRef<string | null>(null);
  const lastAuthTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let cancelled = false;
    const bootstrap = async () => {
      if (status !== 'authenticated' || !token) {
        if (lastPushTokenRef.current && lastAuthTokenRef.current) {
          await notificationService.unregisterExpoPushToken(lastPushTokenRef.current, lastAuthTokenRef.current);
          logger.info('push_token_cleanup_on_logout');
          lastPushTokenRef.current = null;
          lastAuthTokenRef.current = null;
        }
        return;
      }

      let permission = await notificationService.getPermission();
      if (permission !== 'granted') {
        permission = await notificationService.requestPermission();
      }
      if (permission !== 'granted') {
        logger.info('push_token_sync_skipped_permission', { permission });
        return;
      }

      const pushToken = await notificationService.getExpoPushToken(token);
      if (cancelled) {
        return;
      }
      lastPushTokenRef.current = pushToken;
      lastAuthTokenRef.current = token;
      logger.info('push_token_bootstrap_complete');
    };

    bootstrap().catch((error) => {
      logger.warn('push_token_bootstrap_failed', { error });
    });

    // Listen for push token changes mid-session
    let tokenSub: { remove: () => void } | null = null;
    if (Notifications?.addPushTokenListener && status === 'authenticated' && token) {
      tokenSub = Notifications.addPushTokenListener(({ data: newToken }: { data: string }) => {
        if (newToken && newToken !== lastPushTokenRef.current) {
          lastPushTokenRef.current = newToken;
          notificationService.getExpoPushToken(token).catch(() => {});
          logger.info('push_token_refreshed', { newToken: newToken.slice(0, 12) });
        }
      });
    }

    return () => {
      cancelled = true;
      tokenSub?.remove();
    };
  }, [status, token]);

  return null;
};
