import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';

import { API_BASE_URLS, REVERB_WS_URL } from '@/lib/api/config';
import { normalizeMessage } from '@/lib/api/normalize';
import { createLogger } from '@/lib/logging/logger';
import type { CallEventType, Message, RealtimeCallEvent } from '@/lib/types/domain';

type EchoChannel = ReturnType<Echo<'reverb'>['private']>;
type RealtimeNotificationEvent = Record<string, unknown>;
type RealtimeActivityEvent = Record<string, unknown>;

const dedupeSet = new Set<string>();

const remember = (key: string) => {
  dedupeSet.add(key);
  if (dedupeSet.size > 4000) {
    const firstKey = dedupeSet.values().next().value;
    if (firstKey) {
      dedupeSet.delete(firstKey);
    }
  }
};

const alreadySeen = (key: string) => dedupeSet.has(key);

const eventKeyFromPayload = (eventName: CallEventType, payload: RealtimeCallEvent) => {
  if (eventName === 'CallIceCandidate') {
    return `${eventName}:${payload.call_id}:${String(payload.from_user_id ?? '')}:${stringifyPayload(payload.candidate ?? {})}`;
  }

  return `${eventName}:${payload.call_id}:${String(payload.from_user_id ?? '')}:${payload.offer_signal_id ?? ''}:${payload.answer_signal_id ?? ''}`;
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
};

const parseMaybeJson = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const unwrapEchoDataEnvelope = (payload: unknown): unknown => {
  const parsed = parseMaybeJson(payload);
  const record = asRecord(parsed);
  if (!('data' in record)) {
    return parsed;
  }
  return parseMaybeJson(record.data);
};

const unwrapRealtimePayload = (payload: unknown): Record<string, unknown> => {
  const record = asRecord(unwrapEchoDataEnvelope(payload));
  const nested = record.notification ?? record.data;
  if (nested && typeof nested === 'object') {
    return nested as Record<string, unknown>;
  }
  return record;
};

const normalizeMessageRealtimePayload = (payload: unknown): Message | null => {
  const unwrapped = unwrapEchoDataEnvelope(payload);
  const record = asRecord(unwrapped);
  const messageCandidate = record.message ?? record.data ?? record;
  const message = asRecord(parseMaybeJson(messageCandidate));
  if (!message.id && !message.conversation_id) {
    return null;
  }
  return normalizeMessage(message);
};

const normalizeCallRealtimePayload = (payload: unknown): RealtimeCallEvent | null => {
  const unwrapped = unwrapEchoDataEnvelope(payload);
  const record = asRecord(unwrapped);
  const callCandidate = record.call ?? record.data ?? record;
  const call = asRecord(parseMaybeJson(callCandidate));
  if (!call.call_id) {
    return null;
  }
  return call as RealtimeCallEvent;
};

const stringifyPayload = (payload: unknown) => {
  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
};

const notificationEventKeyFromPayload = (eventName: 'NotificationCreated', payload: unknown) => {
  const record = unwrapRealtimePayload(payload);
  const eventId = record.id ?? record.notification_id ?? record.uuid;
  if (eventId) {
    return `${eventName}:${String(eventId)}`;
  }
  return `${eventName}:${String(record.type ?? '')}:${String(record.actor_id ?? '')}:${String(record.created_at ?? '')}:${stringifyPayload(record).slice(0, 240)}`;
};

const activityEventKeyFromPayload = (eventName: 'PostCreated', payload: unknown) => {
  const record = unwrapRealtimePayload(payload);
  const eventId = record.id ?? record.post_id ?? record.uuid;
  if (eventId) {
    return `${eventName}:${String(eventId)}`;
  }
  return `${eventName}:${String(record.actor_id ?? record.user_id ?? '')}:${String(record.created_at ?? '')}:${stringifyPayload(record).slice(0, 240)}`;
};

const getBroadcastAuthEndpoints = () => {
  const configured = process.env.EXPO_PUBLIC_REVERB_AUTH_ENDPOINT?.trim();
  const candidates = [
    configured,
    `${API_BASE_URLS.v1_2}/broadcasting/auth`,
    `${API_BASE_URLS.v1_1}/broadcasting/auth`,
    `${API_BASE_URLS.v3}/broadcasting/auth`,
  ].filter((item): item is string => Boolean(item));

  const seen = new Set<string>();
  return candidates.filter((endpoint) => {
    const normalized = endpoint.replace(/\/+$/, '');
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

const postBroadcastAuth = async ({
  endpoint,
  token,
  socketId,
  channelName,
}: {
  endpoint: string;
  token: string;
  socketId: string;
  channelName: string;
}) => {
  const body = new URLSearchParams({
    socket_id: socketId,
    channel_name: channelName,
  }).toString();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body,
  });

  const payload = await response
    .json()
    .catch(() => ({ error: { message: `Auth response parse failed (${response.status})` } }));

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && (payload as Record<string, unknown>).error
        ? String((((payload as Record<string, unknown>).error as Record<string, unknown>).message ?? 'Auth request failed'))
        : `Auth request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as Record<string, unknown>;
};

export class ReverbService {
  private logger = createLogger('reverb');

  private echo: Echo<'reverb'> | null = null;

  private conversationChannels = new Map<string, EchoChannel>();

  private callChannels = new Map<string, EchoChannel>();

  private userChannelId: string | null = null;

  private notificationsChannelUserId: string | null = null;

  private feedChannelUserId: string | null = null;

  private connectionState = false;

  private messageListeners = new Set<(message: Message) => void>();

  private callListeners = new Set<(event: RealtimeCallEvent) => void>();

  private recentCallEvents = new Map<string, RealtimeCallEvent[]>();

  private notificationListeners = new Set<(event: RealtimeNotificationEvent) => void>();

  private activityListeners = new Set<(event: RealtimeActivityEvent) => void>();

  private connectionListeners = new Set<(connected: boolean) => void>();

  private authToken: string | null = null;

  private debugLog(level: 'log' | 'warn' | 'error', message: string, payload?: unknown) {
    if (level === 'error') {
      this.logger.error(message, payload as Record<string, unknown> | undefined);
      return;
    }
    if (level === 'warn') {
      this.logger.warn(message, payload as Record<string, unknown> | undefined);
      return;
    }
    this.logger.debug(message, payload as Record<string, unknown> | undefined);
  }

  connect(token: string) {
    if (this.echo && this.authToken === token) {
      this.debugLog('log', 'connect skipped: echo already initialized');
      return;
    }
    if (this.echo && this.authToken !== token) {
      this.debugLog('log', 'token changed, reconnecting echo client');
      this.disconnect();
    }

    const parsed = new URL(REVERB_WS_URL);
    const forceTLS = parsed.protocol === 'wss:';
    const key = process.env.EXPO_PUBLIC_REVERB_KEY?.trim();
    if (!key) {
      this.debugLog(
        'warn',
        'connect skipped: missing EXPO_PUBLIC_REVERB_KEY. Realtime disabled until a valid Reverb app key is configured.',
      );
      this.setConnectionState(false);
      return;
    }
    const wsPath = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : undefined;
    const authEndpoints = getBroadcastAuthEndpoints();

    const pusher = new Pusher(key, {
      wsHost: parsed.hostname,
      wsPort: Number(parsed.port || 80),
      wssPort: Number(parsed.port || 443),
      wsPath,
      forceTLS,
      enabledTransports: ['ws', 'wss'],
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          const tryAuthorize = async () => {
            let lastError: unknown = null;
            for (const endpoint of authEndpoints) {
              try {
                const payload = await postBroadcastAuth({
                  endpoint,
                  token,
                  socketId,
                  channelName: channel.name,
                });
                callback(false as any, payload as any);
                return;
              } catch (error) {
                lastError = error;
              }
            }
            callback(true as any, {
              type: 'AuthError',
              error: lastError instanceof Error ? lastError.message : 'Channel authorization failed',
            } as any);
          };
          tryAuthorize().catch((error) => {
            callback(true as any, {
              type: 'AuthError',
              error: error instanceof Error ? error.message : 'Channel authorization failed',
            } as any);
          });
        },
      }),
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      cluster: 'mt1',
    });

    this.debugLog('log', 'socket config', {
      wsHost: parsed.hostname,
      wsPort: Number(parsed.port || 80),
      wssPort: Number(parsed.port || 443),
      wsPath: wsPath ?? '/',
      forceTLS,
      key,
      authEndpoints,
    });

    pusher.connection.bind('connected', () => {
      this.debugLog('log', 'pusher connected');
      this.setConnectionState(true);
    });

    pusher.connection.bind('disconnected', () => {
      this.debugLog('warn', 'pusher disconnected');
      this.setConnectionState(false);
    });

    pusher.connection.bind('error', (error: unknown) => {
      this.debugLog('error', 'pusher connection error', error);
      const code =
        error && typeof error === 'object'
          ? Number(((error as { data?: { code?: number } }).data?.code ?? 0))
          : 0;
      const message =
        error && typeof error === 'object'
          ? String(
              (
                error as {
                  error?: {
                    data?: { message?: string };
                  };
                }
              )?.error?.data?.message ?? '',
            )
          : '';

      if (message.toLowerCase().includes('application does not exist')) {
        this.debugLog('warn', 'disconnecting reverb client due to invalid app key');
        pusher.disconnect();
      }
      if (code === 4009 || message.toLowerCase().includes('unauthorized')) {
        this.debugLog('warn', 'disconnecting reverb client due to unauthorized connection');
        pusher.disconnect();
      }
      this.setConnectionState(false);
    });

    this.echo = new Echo({
      broadcaster: 'reverb',
      client: pusher,
    });
    this.authToken = token;
    this.debugLog('log', 'echo initialized');
  }

  onConnectionState(listener: (connected: boolean) => void) {
    this.connectionListeners.add(listener);
    listener(this.connectionState);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  onMessage(listener: (message: Message) => void) {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  onCallEvent(listener: (event: RealtimeCallEvent) => void) {
    this.callListeners.add(listener);
    return () => {
      this.callListeners.delete(listener);
    };
  }

  getRecentCallEvents(callId: string) {
    return [...(this.recentCallEvents.get(callId) ?? [])];
  }

  onNotificationEvent(listener: (event: RealtimeNotificationEvent) => void) {
    this.notificationListeners.add(listener);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  onActivityEvent(listener: (event: RealtimeActivityEvent) => void) {
    this.activityListeners.add(listener);
    return () => {
      this.activityListeners.delete(listener);
    };
  }

  subscribeUser(userId: string) {
    if (!this.echo || !userId || this.userChannelId === userId) {
      this.debugLog('warn', 'subscribeUser skipped', { hasEcho: Boolean(this.echo), userId, userChannelId: this.userChannelId });
      return;
    }

    if (this.userChannelId) {
      this.unsubscribeUser(this.userChannelId);
    }

    const channelName = `App.Models.User.${userId}`;
    const channel = this.echo.private(channelName);
    this.debugLog('log', `subscribed user channel ${channelName}`);
    const events: CallEventType[] = ['IncomingCall', 'CallAccepted', 'CallDeclined'];

    events.forEach((eventName) => {
      channel.listen(eventName, (payload: unknown) => {
        const callEvent = normalizeCallRealtimePayload(payload);
        if (!callEvent) {
          this.debugLog('warn', `user event ${eventName} payload missing call body`, payload);
          return;
        }
        this.debugLog('log', `user event ${eventName}`, callEvent);
        this.emitCallEvent(eventName, callEvent);
      });
    });

    this.userChannelId = userId;
  }

  unsubscribeUser(userId: string) {
    if (!this.echo || !userId || this.userChannelId !== userId) {
      this.debugLog('warn', 'unsubscribeUser skipped', { hasEcho: Boolean(this.echo), userId, userChannelId: this.userChannelId });
      return;
    }

    const channelName = `App.Models.User.${userId}`;
    this.echo.leave(channelName);
    this.debugLog('log', `left user channel ${channelName}`);
    this.userChannelId = null;
  }

  subscribeNotifications(userId: string) {
    if (!this.echo || !userId || this.notificationsChannelUserId === userId) {
      this.debugLog('warn', 'subscribeNotifications skipped', {
        hasEcho: Boolean(this.echo),
        userId,
        notificationsChannelUserId: this.notificationsChannelUserId,
      });
      return;
    }

    if (this.notificationsChannelUserId) {
      this.unsubscribeNotifications(this.notificationsChannelUserId);
    }

    const channelName = `notifications.${userId}`;
    const channel = this.echo.private(channelName);
    this.debugLog('log', `subscribed notifications channel ${channelName}`);
    channel.listen('NotificationCreated', (payload: unknown) => {
      this.debugLog('log', 'notifications event NotificationCreated', payload);
      this.emitNotificationEvent('NotificationCreated', payload);
    });
    this.notificationsChannelUserId = userId;
  }

  unsubscribeNotifications(userId: string) {
    if (!this.echo || !userId || this.notificationsChannelUserId !== userId) {
      this.debugLog('warn', 'unsubscribeNotifications skipped', {
        hasEcho: Boolean(this.echo),
        userId,
        notificationsChannelUserId: this.notificationsChannelUserId,
      });
      return;
    }

    const channelName = `notifications.${userId}`;
    this.echo.leave(channelName);
    this.debugLog('log', `left notifications channel ${channelName}`);
    this.notificationsChannelUserId = null;
  }

  subscribeFeed(userId: string) {
    if (!this.echo || !userId || this.feedChannelUserId === userId) {
      this.debugLog('warn', 'subscribeFeed skipped', {
        hasEcho: Boolean(this.echo),
        userId,
        feedChannelUserId: this.feedChannelUserId,
      });
      return;
    }

    if (this.feedChannelUserId) {
      this.unsubscribeFeed(this.feedChannelUserId);
    }

    const channelName = `feed.${userId}`;
    const channel = this.echo.private(channelName);
    this.debugLog('log', `subscribed feed channel ${channelName}`);
    channel.listen('PostCreated', (payload: unknown) => {
      this.debugLog('log', 'feed event PostCreated', payload);
      this.emitActivityEvent('PostCreated', payload);
    });
    this.feedChannelUserId = userId;
  }

  unsubscribeFeed(userId: string) {
    if (!this.echo || !userId || this.feedChannelUserId !== userId) {
      this.debugLog('warn', 'unsubscribeFeed skipped', { hasEcho: Boolean(this.echo), userId, feedChannelUserId: this.feedChannelUserId });
      return;
    }

    const channelName = `feed.${userId}`;
    this.echo.leave(channelName);
    this.debugLog('log', `left feed channel ${channelName}`);
    this.feedChannelUserId = null;
  }

  subscribeConversation(conversationId: string) {
    if (!this.echo || !conversationId || this.conversationChannels.has(conversationId)) {
      this.debugLog('warn', 'subscribeConversation skipped', {
        hasEcho: Boolean(this.echo),
        conversationId,
        alreadySubscribed: this.conversationChannels.has(conversationId),
      });
      return;
    }

    const channelName = `conversation.${conversationId}`;
    const channel = this.echo.private(channelName);
    this.debugLog('log', `subscribed conversation channel ${channelName}`);

    channel.listen('MessageSent', (payload: unknown) => {
      const message = normalizeMessageRealtimePayload(payload);
      if (!message) {
        this.debugLog('warn', 'MessageSent payload missing message body', payload);
        return;
      }

      const key = message.id;
      if (key && alreadySeen(key)) {
        this.debugLog('log', 'duplicate MessageSent ignored', { conversationId, messageId: key });
        return;
      }

      if (key) {
        remember(key);
      }

      this.messageListeners.forEach((listener) => {
        listener(message);
      });
      this.debugLog('log', 'message received', {
        conversationId,
        messageId: message.id,
        userId: message.user_id,
        hasContent: Boolean(message.content?.trim()),
        contentPreview: message.content?.slice(0, 80) ?? '',
        createdAt: message.created_at,
      });
    });

    this.conversationChannels.set(conversationId, channel);
  }

  unsubscribeConversation(conversationId: string) {
    if (!this.echo || !this.conversationChannels.has(conversationId)) {
      this.debugLog('warn', 'unsubscribeConversation skipped', { hasEcho: Boolean(this.echo), conversationId });
      return;
    }

    const channelName = `conversation.${conversationId}`;
    this.echo.leave(channelName);
    this.debugLog('log', `left conversation channel ${channelName}`);
    this.conversationChannels.delete(conversationId);
  }

  subscribeCall(callId: string) {
    if (!this.echo || !callId || this.callChannels.has(callId)) {
      this.debugLog('warn', 'subscribeCall skipped', { hasEcho: Boolean(this.echo), callId, alreadySubscribed: this.callChannels.has(callId) });
      return;
    }

    const channelName = `call.${callId}`;
    const channel = this.echo.private(channelName);
    this.debugLog('log', `subscribed call channel ${channelName}`);
    const events: CallEventType[] = ['CallOffer', 'CallAnswer', 'CallIceCandidate', 'CallEnded'];

    events.forEach((eventName) => {
      channel.listen(eventName, (payload: unknown) => {
        const callEvent = normalizeCallRealtimePayload(payload);
        if (!callEvent) {
          this.debugLog('warn', `call event ${eventName} payload missing call body`, payload);
          return;
        }
        this.debugLog('log', `call event ${eventName}`, callEvent);
        this.emitCallEvent(eventName, callEvent);
      });
    });

    this.callChannels.set(callId, channel);
  }

  unsubscribeCall(callId: string) {
    if (!this.echo || !this.callChannels.has(callId)) {
      this.debugLog('warn', 'unsubscribeCall skipped', { hasEcho: Boolean(this.echo), callId });
      return;
    }

    const channelName = `call.${callId}`;
    this.echo.leave(channelName);
    this.debugLog('log', `left call channel ${channelName}`);
    this.callChannels.delete(callId);
    this.recentCallEvents.delete(callId);
  }

  disconnect() {
    if (!this.echo) {
      this.debugLog('warn', 'disconnect skipped: no echo client');
      return;
    }

    this.conversationChannels.forEach((_channel, conversationId) => {
      this.unsubscribeConversation(conversationId);
    });

    this.callChannels.forEach((_channel, callId) => {
      this.unsubscribeCall(callId);
    });

    if (this.userChannelId) {
      this.unsubscribeUser(this.userChannelId);
    }
    if (this.notificationsChannelUserId) {
      this.unsubscribeNotifications(this.notificationsChannelUserId);
    }
    if (this.feedChannelUserId) {
      this.unsubscribeFeed(this.feedChannelUserId);
    }

    this.echo.disconnect();
    this.echo = null;
    this.authToken = null;
    this.recentCallEvents.clear();
    this.debugLog('log', 'echo disconnected');
    this.setConnectionState(false);
  }

  private emitCallEvent(eventName: CallEventType, payload: RealtimeCallEvent) {
    const key = eventKeyFromPayload(eventName, payload);
    if (alreadySeen(key)) {
      this.debugLog('log', 'duplicate call event ignored', { eventName, callId: payload.call_id });
      return;
    }

    remember(key);
    const eventPayload: RealtimeCallEvent = { ...payload, type: eventName };
    this.rememberRecentCallEvent(eventPayload);
    this.callListeners.forEach((listener) => {
      listener(eventPayload);
    });
    this.debugLog('log', 'call event delivered', { eventName, callId: payload.call_id, conversationId: payload.conversation_id });
  }

  private rememberRecentCallEvent(event: RealtimeCallEvent) {
    const existing = this.recentCallEvents.get(event.call_id) ?? [];
    const next = [...existing, event].slice(-12);
    this.recentCallEvents.set(event.call_id, next);

    if (this.recentCallEvents.size > 40) {
      const firstKey = this.recentCallEvents.keys().next().value;
      if (firstKey) {
        this.recentCallEvents.delete(firstKey);
      }
    }
  }

  private emitNotificationEvent(eventName: 'NotificationCreated', payload: unknown) {
    const key = notificationEventKeyFromPayload(eventName, payload);
    if (alreadySeen(key)) {
      this.debugLog('log', 'duplicate notification event ignored', { eventName, key });
      return;
    }
    remember(key);
    const eventPayload = unwrapRealtimePayload(payload);
    this.notificationListeners.forEach((listener) => {
      listener(eventPayload);
    });
    this.debugLog('log', 'notification event delivered', { eventName, id: eventPayload.id ?? eventPayload.notification_id });
  }

  private emitActivityEvent(eventName: 'PostCreated', payload: unknown) {
    const key = activityEventKeyFromPayload(eventName, payload);
    if (alreadySeen(key)) {
      this.debugLog('log', 'duplicate activity event ignored', { eventName, key });
      return;
    }
    remember(key);
    const eventPayload = unwrapRealtimePayload(payload);
    this.activityListeners.forEach((listener) => {
      listener(eventPayload);
    });
    this.debugLog('log', 'activity event delivered', { eventName, id: eventPayload.id ?? eventPayload.post_id });
  }

  private setConnectionState(connected: boolean) {
    if (this.connectionState === connected) {
      return;
    }

    this.connectionState = connected;
    this.debugLog('log', `connection state changed: ${connected ? 'connected' : 'disconnected'}`);
    this.connectionListeners.forEach((listener) => {
      listener(connected);
    });
  }
}

export const reverbService = new ReverbService();
