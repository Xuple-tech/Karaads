import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';
import { createLogger } from '@/lib/logging/logger';

// Lazy load expo-notifications to avoid web bundling issues
let Notifications: any = null;
const logger = createLogger('push');

const getNotifications = () => {
  if (!Notifications && Platform.OS !== 'web') {
    try {
      Notifications = require('expo-notifications');
      // Initialize notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (error) {
      logger.warn('failed_to_load_expo_notifications', { error });
      Notifications = {
        setNotificationHandler: () => {},
        getPermissionsAsync: async () => ({ status: 'denied' }),
        requestPermissionsAsync: async () => ({ status: 'denied' }),
        getExpoPushTokenAsync: async () => ({ data: '' }),
        scheduleNotificationAsync: async () => {},
        setNotificationChannelAsync: async () => {},
        AndroidImportance: { DEFAULT: 3, HIGH: 4, MAX: 5 },
      };
    }
  }
  return Notifications;
};

const PUSH_CHANNEL_ID = 'default';
const PUSH_CHANNEL_MESSAGES = 'messages';
const PUSH_CHANNEL_CALLS = 'calls';
const PUSH_CHANNEL_POSTS = 'posts';
const PUSH_CHANNEL_ACTIVITY = 'activity';

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read_at?: string | null;
  type?: string;
  conversation_id?: string;
  post_id?: string;
  actor_id?: string;
  data?: Record<string, unknown>;
};

export type NotificationStackType = 'messages' | 'calls' | 'posts' | 'activity';

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

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

const readString = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

const pickFirstString = (...candidates: unknown[]): string | null => {
  for (const candidate of candidates) {
    const normalized = readString(candidate);
    if (normalized) {
      return normalized;
    }
  }
  return null;
};

const recordLooksLikePost = (record: Record<string, unknown>) => {
  const type = `${record.type ?? record.kind ?? record.model ?? record.class ?? record.notifiable_type ?? ''}`.toLowerCase();
  return (
    type.includes('post') ||
    Boolean(record.post_type ?? record.content ?? record.caption ?? record.media ?? record.media_url ?? record.video_url)
  );
};

const titleCase = (value: string): string => {
  if (!value) return 'Notification';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const normalizeNotificationCopy = (payload: Record<string, unknown>) => {
  const actor = asRecord(payload.actor ?? payload.user ?? payload.from_user ?? payload.sender);
  const actorName = pickFirstString(actor.name, actor.username, payload.actor_name, payload.username) ?? 'Someone';
  const typeRaw = pickFirstString(payload.type, payload.event, payload.action) ?? '';
  const type = typeRaw.toLowerCase();
  const messagePreview = pickFirstString(payload.message, payload.body, payload.content, payload.text);

  if (messagePreview && (type.includes('message') || type.includes('dm') || type.includes('chat'))) {
    return {
      title: `${actorName} sent you a message`,
      body: messagePreview,
    };
  }

  if (type.includes('follow')) {
    return {
      title: `${actorName} started following you`,
      body: 'Tap to view profile updates.',
    };
  }

  if (type.includes('like')) {
    return {
      title: `${actorName} liked your post`,
      body: messagePreview ?? 'Someone reacted to your content.',
    };
  }

  if (type.includes('comment')) {
    return {
      title: `${actorName} commented on your post`,
      body: messagePreview ?? 'New comment on your content.',
    };
  }

  if (type.includes('share') || type.includes('repost') || type.includes('reshare')) {
    return {
      title: `${actorName} shared your post`,
      body: messagePreview ?? 'Your post was shared with more people.',
    };
  }

  if (type.includes('story')) {
    if (type.includes('react') || type.includes('like')) {
      return {
        title: `${actorName} reacted to your story`,
        body: messagePreview ?? 'Someone reacted to your status update.',
      };
    }
    if (type.includes('reply') || type.includes('message')) {
      return {
        title: `${actorName} replied to your story`,
        body: messagePreview ?? 'New reply on your status update.',
      };
    }
    if (type.includes('view')) {
      return {
        title: `${actorName} viewed your story`,
        body: null,
      };
    }
    return {
      title: `${actorName} interacted with your story`,
      body: messagePreview ?? null,
    };
  }

  if (type.includes('reply')) {
    return {
      title: `${actorName} replied to your comment`,
      body: messagePreview ?? 'New reply in your thread.',
    };
  }

  if (type.includes('mention')) {
    return {
      title: `${actorName} mentioned you`,
      body: messagePreview ?? 'You were mentioned in a post.',
    };
  }

  const fallbackTitle = pickFirstString(payload.title, payload.subject, payload.kind);
  const fallbackBody = messagePreview;

  return {
    title: fallbackTitle ? titleCase(fallbackTitle) : titleCase(typeRaw || 'notification'),
    body: fallbackBody ?? '',
  };
};

export const normalizeNotification = (value: unknown): NotificationItem => {
  const root = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const rootData = asRecord(root.data);
  const wrappedNotification = asRecord(root.notification ?? rootData.notification);
  const payload =
    Object.keys(wrappedNotification).length > 0
      ? {
          ...root,
          ...wrappedNotification,
          data: {
            ...rootData,
            ...asRecord(wrappedNotification.data),
          },
        }
      : root;
  const nestedData = asRecord(payload.data);
  const nestedPost = asRecord(payload.post ?? nestedData.post);
  const nestedTarget = asRecord(payload.target ?? nestedData.target);
  const nestedObject = asRecord(payload.object ?? nestedData.object);
  const nestedSubject = asRecord(payload.subject ?? nestedData.subject);
  const nestedResource = asRecord(payload.resource ?? nestedData.resource);
  const nestedNotifiable = asRecord(payload.notifiable ?? nestedData.notifiable);
  const nestedComment = asRecord(payload.comment ?? nestedData.comment);
  const nestedLike = asRecord(payload.like ?? nestedData.like ?? payload.reaction ?? nestedData.reaction);
  const nestedActor = asRecord(payload.actor ?? payload.user ?? payload.from_user ?? payload.sender ?? nestedData.actor ?? nestedData.user ?? nestedData.from_user ?? nestedData.sender);
  const notifiableType = `${payload.notifiable_type ?? payload.notifiableType ?? nestedData.notifiable_type ?? nestedData.notifiableType ?? ''}`.toLowerCase();
  const resourceType = `${payload.resource_type ?? payload.resourceType ?? nestedData.resource_type ?? nestedData.resourceType ?? ''}`.toLowerCase();
  const subjectType = `${payload.subject_type ?? payload.subjectType ?? nestedData.subject_type ?? nestedData.subjectType ?? ''}`.toLowerCase();
  const mergedData = {
    ...nestedData,
    ...(payload.post_id ? { post_id: payload.post_id } : null),
    ...(payload.postId ? { postId: payload.postId } : null),
    ...(payload.target_post_id ? { target_post_id: payload.target_post_id } : null),
    ...(payload.targetPostId ? { targetPostId: payload.targetPostId } : null),
    ...(payload.related_post_id ? { related_post_id: payload.related_post_id } : null),
    ...(payload.relatedPostId ? { relatedPostId: payload.relatedPostId } : null),
    ...(payload.liked_post_id ? { liked_post_id: payload.liked_post_id } : null),
    ...(payload.likedPostId ? { likedPostId: payload.likedPostId } : null),
    ...(payload.parent_post_id ? { parent_post_id: payload.parent_post_id } : null),
    ...(payload.parentPostId ? { parentPostId: payload.parentPostId } : null),
    ...(payload.commentable_id ? { commentable_id: payload.commentable_id } : null),
    ...(payload.commentable_type ? { commentable_type: payload.commentable_type } : null),
    ...(payload.comment_id ? { comment_id: payload.comment_id } : null),
    ...(payload.commentId ? { commentId: payload.commentId } : null),
    ...(payload.reply_id ? { reply_id: payload.reply_id } : null),
    ...(payload.replyId ? { replyId: payload.replyId } : null),
    ...(payload.like_id ? { like_id: payload.like_id } : null),
    ...(payload.likeId ? { likeId: payload.likeId } : null),
    ...(payload.reaction_id ? { reaction_id: payload.reaction_id } : null),
    ...(payload.reactionId ? { reactionId: payload.reactionId } : null),
    ...(Object.keys(nestedPost).length > 0 ? { post: nestedPost } : null),
    ...(Object.keys(nestedTarget).length > 0 ? { target: nestedTarget } : null),
    ...(Object.keys(nestedObject).length > 0 ? { object: nestedObject } : null),
    ...(Object.keys(nestedSubject).length > 0 ? { subject: nestedSubject } : null),
    ...(Object.keys(nestedResource).length > 0 ? { resource: nestedResource } : null),
    ...(Object.keys(nestedNotifiable).length > 0 ? { notifiable: nestedNotifiable } : null),
    ...(Object.keys(nestedComment).length > 0 ? { comment: nestedComment } : null),
    ...(Object.keys(nestedLike).length > 0 ? { like: nestedLike } : null),
    ...(Object.keys(nestedActor).length > 0 ? { actor: nestedActor } : null),
  };
  const idValue = payload.id ?? payload.notification_id ?? payload.uuid;
  const createdAtValue = payload.created_at ?? payload.createdAt ?? payload.time ?? new Date().toISOString();
  const readAtValue = payload.read_at ?? payload.readAt ?? nestedData.read_at ?? nestedData.readAt ?? null;
  const readFlag =
    payload.read ??
    payload.is_read ??
    payload.isRead ??
    payload.seen ??
    payload.viewed ??
    nestedData.read ??
    nestedData.is_read ??
    nestedData.isRead ??
    nestedData.seen ??
    nestedData.viewed;
  const normalizedReadAt =
    typeof readAtValue === 'string' && readAtValue.trim().length > 0
      ? readAtValue
      : readFlag === true || readFlag === 1 || readFlag === '1' || readFlag === 'true'
        ? String(createdAtValue ?? new Date().toISOString())
        : null;
  const copy = normalizeNotificationCopy(payload);

  return {
    id: String(idValue ?? `${createdAtValue}-${Math.random().toString(36).slice(2, 8)}`),
    title: copy.title,
    body: copy.body ?? '',
    created_at: String(createdAtValue ?? new Date().toISOString()),
    read_at: normalizedReadAt,
    type:
      typeof payload.type === 'string'
        ? payload.type
        : typeof nestedData.type === 'string'
          ? nestedData.type
          : undefined,
    conversation_id:
      typeof payload.conversation_id === 'string'
        ? payload.conversation_id
        : typeof nestedData.conversationId === 'string'
          ? nestedData.conversationId
          : typeof nestedData.conversation_id === 'string'
            ? nestedData.conversation_id
            : undefined,
    post_id:
      pickFirstString(
        payload.post_id,
        payload.postId,
        payload.target_post_id,
        payload.targetPostId,
        payload.related_post_id,
        payload.relatedPostId,
        nestedData.postId,
        nestedData.post_id,
        nestedData.targetPostId,
        nestedData.target_post_id,
        nestedData.relatedPostId,
        nestedData.related_post_id,
        payload.liked_post_id,
        payload.likedPostId,
        nestedData.liked_post_id,
        nestedData.likedPostId,
        payload.parent_post_id,
        payload.parentPostId,
        nestedData.parent_post_id,
        nestedData.parentPostId,
        `${payload.commentable_type ?? nestedData.commentable_type ?? ''}`.toLowerCase().includes('post') ? (payload.commentable_id ?? nestedData.commentable_id) : null,
        nestedPost.id,
        nestedPost.post_id,
        nestedTarget.post_id,
        nestedTarget.postId,
        nestedObject.post_id,
        nestedObject.postId,
        nestedSubject.post_id,
        nestedSubject.postId,
        nestedResource.post_id,
        nestedResource.postId,
        nestedNotifiable.post_id,
        nestedNotifiable.postId,
        nestedComment.post_id,
        nestedComment.postId,
        nestedLike.post_id,
        nestedLike.postId,
        recordLooksLikePost(nestedTarget) ? nestedTarget.id : null,
        recordLooksLikePost(nestedObject) ? nestedObject.id : null,
        recordLooksLikePost(nestedSubject) ? nestedSubject.id : null,
        recordLooksLikePost(nestedResource) ? nestedResource.id : null,
        recordLooksLikePost(nestedNotifiable) ? nestedNotifiable.id : null,
        notifiableType.includes('post') ? (payload.notifiable_id ?? payload.notifiableId ?? nestedData.notifiable_id ?? nestedData.notifiableId) : null,
        resourceType.includes('post') ? (payload.resource_id ?? payload.resourceId ?? nestedData.resource_id ?? nestedData.resourceId) : null,
        subjectType.includes('post') ? (payload.subject_id ?? payload.subjectId ?? nestedData.subject_id ?? nestedData.subjectId) : null,
      ) ?? undefined,
    actor_id:
      pickFirstString(
        payload.actor_id,
        payload.actorId,
        payload.user_id,
        payload.userId,
        nestedData.actorId,
        nestedData.actor_id,
        nestedData.userId,
        nestedData.user_id,
        nestedActor.id,
      ) ?? undefined,
    data: Object.keys(mergedData).length > 0 ? mergedData : undefined,
  };
};

const getProjectId = () => {
  const fromEas = Constants?.expoConfig?.extra?.eas?.projectId;
  const fromManifest = (Constants as unknown as { easConfig?: { projectId?: string } })?.easConfig?.projectId;
  return fromEas ?? fromManifest ?? undefined;
};

const maybeSyncPushToken = async (token: string, authToken: string | null) => {
  if (!authToken) {
    return;
  }

  const endpoint = process.env.EXPO_PUBLIC_PUSH_TOKEN_ENDPOINT || '/push-tokens';

  const attempt = () =>
    apiRequest(endpoint, {
      method: 'POST',
      token: authToken,
      version: 'v1_2',
      body: {
        token,
        provider: 'expo',
        platform: Platform.OS,
      },
    });

  try {
    await attempt();
    logger.info('push_token_synced', { endpoint, platform: Platform.OS });
  } catch {
    // Retry once after 3 seconds
    try {
      await new Promise((r) => setTimeout(r, 3000));
      await attempt();
      logger.info('push_token_synced_retry', { endpoint, platform: Platform.OS });
    } catch {
      logger.warn('push_token_sync_failed', { endpoint });
    }
  }
};

const maybeUnregisterPushToken = async (token: string, authToken: string | null) => {
  if (!authToken || !token) {
    return;
  }

  const endpointRoot = process.env.EXPO_PUBLIC_PUSH_TOKEN_ENDPOINT || '/push-tokens';
  const endpoint = `${endpointRoot}/${encodeURIComponent(token)}`;
  try {
    await apiRequest(endpoint, {
      method: 'DELETE',
      token: authToken,
      version: 'v1_2',
    });
    logger.info('push_token_unregistered', { endpointRoot });
  } catch {
    logger.warn('push_token_unregister_failed', { endpointRoot });
  }
};

export const inferStackType = (item: Pick<NotificationItem, 'type' | 'title' | 'body'>): NotificationStackType => {
  const type = `${item.type ?? ''}`.toLowerCase();
  const title = `${item.title ?? ''}`.toLowerCase();
  const body = `${item.body ?? ''}`.toLowerCase();
  const source = `${type} ${title} ${body}`;

  if (source.includes('message') || source.includes('dm') || source.includes('chat')) {
    return 'messages';
  }
  if (source.includes('call') || source.includes('ring') || source.includes('missed')) {
    return 'calls';
  }
  if (source.includes('post') || source.includes('feed') || source.includes('story') || source.includes('moment')) {
    return 'posts';
  }
  return 'activity';
};

const getChannelForType = (type: NotificationStackType) => {
  if (type === 'messages') return PUSH_CHANNEL_MESSAGES;
  if (type === 'calls') return PUSH_CHANNEL_CALLS;
  if (type === 'posts') return PUSH_CHANNEL_POSTS;
  return PUSH_CHANNEL_ACTIVITY;
};

export const ensureNotificationChannels = async () => {
  if (Platform.OS !== 'android') {
    return;
  }
  const Notifications = getNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.setNotificationChannelAsync(PUSH_CHANNEL_ID, {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  await Notifications.setNotificationChannelAsync(PUSH_CHANNEL_MESSAGES, {
    name: 'Messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 220, 120, 220],
  });
  await Notifications.setNotificationChannelAsync(PUSH_CHANNEL_CALLS, {
    name: 'Calls',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 280, 120, 280],
  });
  await Notifications.setNotificationChannelAsync(PUSH_CHANNEL_POSTS, {
    name: 'Posts',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180, 80, 180],
  });
  await Notifications.setNotificationChannelAsync(PUSH_CHANNEL_ACTIVITY, {
    name: 'Activity',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 140, 70, 140],
  });
};

export const notificationService = {
  async getPermission() {
    if (Platform.OS === 'web') {
      return 'denied' as const;
    }
    const Notifications = getNotifications();
    if (!Notifications) {
      return 'denied' as const;
    }
    const permissions = await Notifications.getPermissionsAsync();
    return permissions.status;
  },

  async requestPermission() {
    if (Platform.OS === 'web') {
      return 'denied' as const;
    }
    const Notifications = getNotifications();
    if (!Notifications) {
      return 'denied' as const;
    }
    const permissions = await Notifications.requestPermissionsAsync();
    return permissions.status;
  },

  async getExpoPushToken(authToken: string | null): Promise<string> {
    if (Platform.OS === 'web') {
      throw new Error('Push notifications are not supported on web.');
    }
    const Notifications = getNotifications();
    if (!Notifications) {
      throw new Error('Notifications module unavailable.');
    }
    await ensureNotificationChannels();

    const projectId = getProjectId();
    if (!projectId) {
      throw new Error('Missing Expo projectId for push notifications.');
    }

    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
    await maybeSyncPushToken(pushToken.data, authToken);
    return pushToken.data;
  },

  async unregisterExpoPushToken(pushToken: string, authToken: string | null): Promise<void> {
    await maybeUnregisterPushToken(pushToken, authToken);
  },

  async sendLocalTest() {
    if (Platform.OS === 'web') {
      return;
    }
    const Notifications = getNotifications();
    if (!Notifications) {
      return;
    }
    await ensureNotificationChannels();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'KaraAds',
        body: 'Push notifications are enabled.',
        threadIdentifier: 'activity',
      },
      trigger: null,
    });
  },

  async sendStackedLocal(input: {
    title: string;
    body: string;
    stackType: NotificationStackType;
    data?: Record<string, unknown>;
  }) {
    if (Platform.OS === 'web') {
      return;
    }
    const Notifications = getNotifications();
    if (!Notifications) {
      return;
    }

    await ensureNotificationChannels();
    const channelId = getChannelForType(input.stackType);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: input.title,
        body: input.body,
        data: { ...(input.data ?? {}), stackType: input.stackType },
        threadIdentifier: input.stackType,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger: null,
    });
  },

  async sendStackedFromInbox(item: NotificationItem) {
    if (Platform.OS === 'web') {
      return;
    }
    const Notifications = getNotifications();
    if (!Notifications) {
      return;
    }
    const stackType = inferStackType(item);
    const channelId = getChannelForType(stackType);
    await ensureNotificationChannels();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.body,
        data: {
          ...(item.data ?? {}),
          notificationId: item.id,
          type: item.type,
          conversationId: item.conversation_id,
          postId: item.post_id,
          actorId: item.actor_id,
          stackType,
        },
        threadIdentifier: stackType,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger: null,
    });
  },

  async getInbox(): Promise<NotificationItem[]> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/users/notifications', {
      token,
      version: 'v1_2',
    });

    const payload = response.data;
    if (Array.isArray(payload)) {
      return payload.map((item) => normalizeNotification(item));
    }

    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      const list = asArray(record.data ?? record.notifications ?? record.items);
      return list.map((item) => normalizeNotification(item));
    }

    return [];
  },

  async markAllRead(): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest('/users/notifications/read-all', {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async markRead(notificationId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/users/notifications/${notificationId}/read`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },
};
