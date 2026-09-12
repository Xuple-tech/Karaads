import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { Image as ExpoImage } from 'expo-image';
import { ArrowLeft, AtSign, Bell, Heart, House, MessageCircle, Search, Settings, User, UserPlus } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeStackView } from '@/components/navigation/swipe-stack-view';
import { AppColors, AppRadii } from '@/constants/app-theme';
import { feedService } from '@/features/feed/service';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationInbox } from '@/features/notifications/inbox-hooks';
import { notificationService, type NotificationItem } from '@/features/notifications/service';
import { normalizePost } from '@/lib/api/normalize';
import { router } from '@/lib/navigation/router';
import type { Post } from '@/lib/types/domain';

type NotificationFilter = 'all' | 'likes' | 'follows' | 'mentions';
type FeedCacheData = { pages: Array<{ posts: Post[]; meta?: Record<string, unknown> }>; pageParams: unknown[] };

const FEED_QUERY_KEY = ['feed'] as const;

const filters: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'likes', label: 'Likes' },
  { id: 'follows', label: 'Follows' },
  { id: 'mentions', label: 'Mentions' },
];

const formatRelativeTime = (value: string) => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'now';
  const diff = Math.max(0, Date.now() - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'now';
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  return `${Math.floor(diff / day)}d`;
};

const categoryForNotification = (item: NotificationItem): NotificationFilter => {
  const text = `${item.type ?? ''} ${item.title} ${item.body}`.toLowerCase();
  if (text.includes('like') || text.includes('react')) return 'likes';
  if (text.includes('follow')) return 'follows';
  if (text.includes('mention')) return 'mentions';
  return 'all';
};

const splitNotificationCopy = (item: NotificationItem) => {
  const title = item.title || 'Notification';
  const patterns = [
    ' started following you',
    ' liked your post',
    ' mentioned you',
    ' commented on your post',
    ' replied to your comment',
    ' shared your post',
    ' sent you a message',
  ];
  const pattern = patterns.find((entry) => title.toLowerCase().includes(entry.trim().toLowerCase()));
  if (!pattern) {
    return { actor: title, action: item.body || 'sent you a notification' };
  }
  const index = title.toLowerCase().indexOf(pattern.trim().toLowerCase());
  const actor = title.slice(0, index).trim() || 'Someone';
  const action = title.slice(index).trim();
  return { actor, action };
};

const initialsFor = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'K';

const collectPayloadRecords = (payload: Record<string, unknown>, maxDepth = 4) => {
  const records: Record<string, unknown>[] = [];
  const seen = new Set<unknown>();

  const visit = (value: unknown, depth: number) => {
    if (typeof value === 'string' && value.trim().startsWith('{')) {
      try {
        visit(JSON.parse(value) as unknown, depth);
      } catch {
        // Ignore non-JSON strings.
      }
      return;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value) || depth > maxDepth || seen.has(value)) {
      return;
    }
    seen.add(value);
    const record = value as Record<string, unknown>;
    records.push(record);
    Object.values(record).forEach((child) => visit(child, depth + 1));
  };

  visit(payload, 0);
  return records;
};

const readPayloadString = (payload: Record<string, unknown>, ...keys: string[]) => {
  const records = collectPayloadRecords(payload);

  for (const record of records) {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    }
  }

  return undefined;
};

const readPayloadUrlPostId = (payload: Record<string, unknown>) => {
  const urlKeys = new Set([
    'url',
    'link',
    'href',
    'path',
    'target_url',
    'targetUrl',
    'action_url',
    'actionUrl',
    'post_url',
    'postUrl',
    'permalink',
  ]);

  for (const record of collectPayloadRecords(payload)) {
    for (const [key, value] of Object.entries(record)) {
      if (!urlKeys.has(key) || typeof value !== 'string') continue;
      const text = value.trim();
      const fromPath = /\/(?:posts?|feed|moments?)\/([^/?#]+)/i.exec(text);
      if (fromPath?.[1]) return decodeURIComponent(fromPath[1]);
      const fromPostDetail = /\/post\/([^/?#]+)/i.exec(text);
      if (fromPostDetail?.[1]) return decodeURIComponent(fromPostDetail[1]);
      const fromQuery = /(?:post_id|postId|target_post_id|targetPostId)=([^&#]+)/i.exec(text);
      if (fromQuery?.[1]) return decodeURIComponent(fromQuery[1]);
    }
  }

  return undefined;
};

const readNotificationTargetUrl = (payload: Record<string, unknown>) =>
  readPayloadString(
    payload,
    'app_url',
    'appUrl',
    'deep_link',
    'deepLink',
    'url',
    'link',
    'href',
    'path',
    'target_url',
    'targetUrl',
    'action_url',
    'actionUrl',
    'post_url',
    'postUrl',
    'permalink',
  );

const getUrlPathAndParams = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed, 'https://karaads.local');
    return { path: parsed.pathname, params: parsed.searchParams };
  } catch {
    return null;
  }
};

const routeFromNotificationUrl = (url: string, queryClient: QueryClient) => {
  const parsed = getUrlPathAndParams(url);
  if (!parsed) return false;
  const path = parsed.path.replace(/\/+$/, '') || '/';

  const postId =
    parsed.params.get('post_id') ??
    parsed.params.get('postId') ??
    parsed.params.get('target_post_id') ??
    parsed.params.get('targetPostId') ??
    /\/(?:posts?|feed|moments?)\/([^/?#]+)/i.exec(path)?.[1] ??
    /\/post\/([^/?#]+)/i.exec(path)?.[1];

  if (postId) {
    const decodedPostId = decodeURIComponent(postId);
    feedService.getPost(decodedPostId)
      .then((post) => cacheNotificationPost(queryClient, post))
      .catch(() => undefined);
    router.push('MainTabs', { screen: 'Home', params: { pinPostId: decodedPostId } });
    return true;
  }

  const conversationId =
    parsed.params.get('conversation_id') ??
    parsed.params.get('conversationId') ??
    parsed.params.get('thread_id') ??
    parsed.params.get('threadId') ??
    /\/(?:messages|chats|conversations)\/([^/?#]+)/i.exec(path)?.[1];

  if (conversationId) {
    router.push('Conversation', { conversationId: decodeURIComponent(conversationId) });
    return true;
  }

  const username =
    parsed.params.get('username') ??
    /\/@([^/?#]+)/i.exec(path)?.[1] ??
    /\/(?:profile|users?)\/([^/?#]+)/i.exec(path)?.[1];

  if (username) {
    router.push('ProfileByUsername', { username: decodeURIComponent(username).replace(/^@/, '') });
    return true;
  }

  if (/\/notifications?/i.test(path)) {
    router.push('Notifications');
    return true;
  }

  return false;
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value === 'string' && value.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
};

const recordLooksLikePost = (record: Record<string, unknown> | null) => {
  if (!record) return false;
  const type = `${record.type ?? record.kind ?? record.model ?? record.class ?? record.notifiable_type ?? ''}`.toLowerCase();
  return (
    type.includes('post') ||
    Boolean(record.post_type ?? record.content ?? record.caption ?? record.media ?? record.media_url ?? record.video_url)
  );
};

const readPostObjectId = (payload: Record<string, unknown>) => {
  for (const parent of collectPayloadRecords(payload)) {
    const post = asRecord(parent.post);
    if (post) {
      const id = readPayloadString(post, 'id', 'postId', 'post_id', 'uuid');
      if (id) return id;
    }

    for (const key of ['target', 'object', 'entity', 'subject', 'resource', 'notifiable']) {
      const record = asRecord(parent[key]);
      if (record && recordLooksLikePost(record)) {
        const id = readPayloadString(record, 'id', 'postId', 'post_id', 'uuid');
        if (id) return id;
      }
    }
  }

  return undefined;
};

const readTypedPostReferenceId = (payload: Record<string, unknown>) => {
  const pairs = [
    ['notifiable_type', 'notifiable_id'],
    ['notifiableType', 'notifiableId'],
    ['resource_type', 'resource_id'],
    ['resourceType', 'resourceId'],
    ['subject_type', 'subject_id'],
    ['subjectType', 'subjectId'],
    ['object_type', 'object_id'],
    ['objectType', 'objectId'],
    ['entity_type', 'entity_id'],
    ['entityType', 'entityId'],
    ['target_type', 'target_id'],
    ['targetType', 'targetId'],
    ['model_type', 'model_id'],
    ['modelType', 'modelId'],
    ['item_type', 'item_id'],
    ['itemType', 'itemId'],
    ['commentable_type', 'commentable_id'],
    ['commentableType', 'commentableId'],
  ];

  for (const record of collectPayloadRecords(payload)) {
    for (const [typeKey, idKey] of pairs) {
      const type = `${record[typeKey] ?? ''}`.toLowerCase();
      if (type.includes('post')) {
        const id = readPayloadString(record, idKey);
        if (id) return id;
      }
    }
  }

  return undefined;
};

const readTypedReferenceId = (payload: Record<string, unknown>, typeHints: string[]) => {
  const pairs = [
    ['notifiable_type', 'notifiable_id'],
    ['notifiableType', 'notifiableId'],
    ['resource_type', 'resource_id'],
    ['resourceType', 'resourceId'],
    ['subject_type', 'subject_id'],
    ['subjectType', 'subjectId'],
    ['object_type', 'object_id'],
    ['objectType', 'objectId'],
    ['entity_type', 'entity_id'],
    ['entityType', 'entityId'],
    ['target_type', 'target_id'],
    ['targetType', 'targetId'],
    ['model_type', 'model_id'],
    ['modelType', 'modelId'],
    ['item_type', 'item_id'],
    ['itemType', 'itemId'],
    ['commentable_type', 'commentable_id'],
    ['commentableType', 'commentableId'],
  ];

  for (const record of collectPayloadRecords(payload)) {
    for (const [typeKey, idKey] of pairs) {
      const type = `${record[typeKey] ?? ''}`.toLowerCase();
      if (typeHints.some((hint) => type.includes(hint))) {
        const id = readPayloadString(record, idKey);
        if (id) return id;
      }
    }
  }

  return undefined;
};

const readMessageThreadId = (payload: Record<string, unknown>, fallback?: string) => {
  return readPayloadString(
    payload,
    'conversationId',
    'conversation_id',
    'conversationID',
    'threadId',
    'thread_id',
    'chatId',
    'chat_id',
    'roomId',
    'room_id',
  ) ?? fallback;
};

const isMessageNotification = (item: NotificationItem) => {
  const text = `${item.type ?? ''} ${item.title} ${item.body}`.toLowerCase();
  return (
    text.includes('message') ||
    text.includes('chat') ||
    text.includes('dm') ||
    Boolean(item.conversation_id) ||
    Boolean(readMessageThreadId(item.data ?? {}))
  );
};

const summarizeNotificationTarget = (item: NotificationItem, payload: Record<string, unknown>) => {
  const records = collectPayloadRecords(payload);
  const keys = Array.from(new Set(records.flatMap((record) => Object.keys(record)))).slice(0, 28);
  const values = {
    notificationId: item.id,
    type: item.type,
    post_id: readPayloadString(payload, 'post_id', 'postId', 'target_post_id', 'targetPostId'),
    comment_id: readPayloadString(payload, 'comment_id', 'commentId', 'reply_id', 'replyId'),
    like_id: readPayloadString(payload, 'like_id', 'likeId', 'reaction_id', 'reactionId'),
    notifiable_type: readPayloadString(payload, 'notifiable_type', 'notifiableType'),
    notifiable_id: readPayloadString(payload, 'notifiable_id', 'notifiableId'),
    url: readPayloadString(payload, 'url', 'link', 'href', 'action_url', 'actionUrl', 'post_url', 'postUrl'),
  };

  return `The notification does not include a post target the app can read.\n\n${JSON.stringify(values, null, 2)}\n\nFields found: ${keys.join(', ') || 'none'}`;
};

const getNotificationActorUsername = (item: NotificationItem) => {
  const payload = item.data ?? {};
  const actor = asRecord(payload.actor) ?? asRecord(payload.user) ?? asRecord(payload.from_user) ?? asRecord(payload.sender);
  const username =
    readPayloadString(payload, 'actorUsername', 'actor_username', 'username', 'userName', 'user_name') ??
    (actor ? readPayloadString(actor, 'username', 'handle', 'userName', 'user_name') : undefined);

  return username?.replace(/^@/, '').trim() || undefined;
};

const getNotificationActorAvatar = (item: NotificationItem) => {
  const payload = item.data ?? {};
  const actor = asRecord(payload.actor) ?? asRecord(payload.user) ?? asRecord(payload.from_user) ?? asRecord(payload.sender);
  return (
    readPayloadString(payload, 'actorAvatar', 'actor_avatar', 'avatar', 'avatar_url', 'profile_photo_url', 'profile_image') ??
    (actor ? readPayloadString(actor, 'avatar', 'avatar_url', 'profile_photo_url', 'profile_image') : undefined)
  );
};

const findFirstMediaUrl = (value: unknown, depth = 0): string | undefined => {
  if (!value || depth > 5) return undefined;
  if (typeof value === 'string') {
    return /^https?:\/\//i.test(value) || value.startsWith('/') ? value : undefined;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findFirstMediaUrl(entry, depth + 1);
      if (found) return found;
    }
    return undefined;
  }
  if (typeof value !== 'object') return undefined;

  const record = value as Record<string, unknown>;
  const direct =
    readPayloadString(
      record,
      'thumbnail_url',
      'thumbnailUrl',
      'thumb',
      'image',
      'image_url',
      'imageUrl',
      'media_url',
      'mediaUrl',
      'url',
      'path',
    );
  if (direct && (direct.startsWith('http') || direct.startsWith('/'))) return direct;

  for (const key of ['media', 'attachments', 'asset', 'files', 'images', 'video']) {
    const found = findFirstMediaUrl(record[key], depth + 1);
    if (found) return found;
  }

  return undefined;
};

const getNotificationPostPreview = (item: NotificationItem) => {
  const category = categoryForNotification(item);
  const sourceText = `${item.type ?? ''} ${item.title} ${item.body}`.toLowerCase();
  const isPostActivity =
    category === 'likes' ||
    category === 'mentions' ||
    sourceText.includes('comment') ||
    sourceText.includes('reply') ||
    sourceText.includes('post') ||
    sourceText.includes('reaction');

  if (!isPostActivity) return null;

  const payload = item.data ?? {};
  const candidates = collectPayloadRecords(payload).filter((record) => recordLooksLikePost(record));
  const post = candidates[0] ?? asRecord(payload.post) ?? asRecord(payload.notifiable);
  const text =
    (post ? readPayloadString(post, 'content', 'caption', 'body', 'text', 'description') : undefined) ??
    readPayloadString(payload, 'post_content', 'postContent', 'caption', 'content_preview', 'contentPreview');
  const mediaUrl = findFirstMediaUrl(post ?? payload);

  if (!text && !mediaUrl) return null;
  return { text, mediaUrl };
};

const readPostFromPayload = (payload: Record<string, unknown>, postId?: string) => {
  const records = collectPayloadRecords(payload).filter((record) => recordLooksLikePost(record));
  const match = records.find((record) => {
    const id = readPayloadString(record, 'id', 'postId', 'post_id', 'uuid');
    return id && (!postId || id === postId);
  }) ?? records[0];

  if (!match) return null;
  try {
    const post = normalizePost(match);
    return post.id ? post : null;
  } catch {
    return null;
  }
};

const cacheNotificationPost = (queryClient: QueryClient, post: Post) => {
  queryClient.setQueryData(['post', post.id], post);
  queryClient.setQueryData<FeedCacheData>(FEED_QUERY_KEY, (current) => {
    if (!current?.pages?.length) {
      return { pages: [{ posts: [post], meta: { source: 'notification' } }], pageParams: [1] };
    }

    let found = false;
    const pages = current.pages.map((page, index) => {
      const posts = page.posts.map((item) => {
        if (item.id !== post.id) return item;
        found = true;
        return { ...item, ...post };
      });
      if (!found && index === 0) {
        posts.unshift(post);
      }
      return { ...page, posts };
    });
    return { ...current, pages };
  });
};

const getNotificationPostActivity = (item: NotificationItem) => {
  const category = categoryForNotification(item);
  const sourceText = `${item.type ?? ''} ${item.title} ${item.body}`.toLowerCase();
  return (
    category === 'likes' ||
    category === 'mentions' ||
    sourceText.includes('comment') ||
    sourceText.includes('reply') ||
    sourceText.includes('post') ||
    sourceText.includes('reaction')
  );
};

const resolveNotificationTargetItem = async (item: NotificationItem) => {
  // The v3 API has no single-notification detail endpoint — the inbox row
  // itself is the only source of target fields, inline or not.
  return item;
};

const resolveNotificationPostId = async (item: NotificationItem) => {
  const targetItem = await resolveNotificationTargetItem(item);

  const payload = targetItem.data ?? {};
  const explicitPostId =
    targetItem.post_id ??
    readPayloadString(
      payload,
      'postId',
      'post_id',
      'postID',
      'targetPostId',
      'target_post_id',
      'relatedPostId',
      'related_post_id',
      'likedPostId',
      'liked_post_id',
      'parentPostId',
      'parent_post_id',
      'postUuid',
      'post_uuid',
      'postUUID',
    ) ??
    readPostObjectId(payload) ??
    readPayloadUrlPostId(payload);
  const typedTargetPostId = getNotificationPostActivity(targetItem) ? readTypedPostReferenceId(payload) : undefined;
  const payloadPost = readPostFromPayload(payload, explicitPostId ?? typedTargetPostId);
  let postId = explicitPostId ?? typedTargetPostId ?? payloadPost?.id;
  const commentId =
    readPayloadString(payload, 'commentId', 'comment_id', 'replyId', 'reply_id') ??
    readTypedReferenceId(payload, ['comment', 'reply']);
  const likeId =
    readPayloadString(payload, 'likeId', 'like_id', 'reactionId', 'reaction_id') ??
    readTypedReferenceId(payload, ['like', 'reaction']);

  return { postId, commentId, likeId, targetItem };
};

const openNotificationActorProfile = (item: NotificationItem) => {
  const username = getNotificationActorUsername(item);
  if (!username) {
    Alert.alert('Profile unavailable', 'This notification did not include the user profile name.');
    return;
  }

  router.push('ProfileByUsername', { username });
};

const openNotificationTarget = async (item: NotificationItem, queryClient: QueryClient) => {
  const targetItem = await resolveNotificationTargetItem(item).catch(() => item);
  const payload = targetItem.data ?? {};
  const targetUrl = readNotificationTargetUrl(payload);
  if (targetUrl && routeFromNotificationUrl(targetUrl, queryClient)) {
    return;
  }

  if (isMessageNotification(targetItem)) {
    const conversationId = readMessageThreadId(payload, targetItem.conversation_id ?? item.conversation_id);
    if (conversationId) {
      router.push('Conversation', { conversationId });
      return;
    }
    router.push('MainTabs', { screen: 'Messages' });
    return;
  }

  const {
    postId,
    commentId,
    likeId,
    targetItem: postTargetItem,
  } = await resolveNotificationPostId(item).catch(() => ({
    postId: undefined,
    commentId: undefined,
    likeId: undefined,
    targetItem,
  }));
  const targetPayload = postTargetItem.data ?? {};
  const category = categoryForNotification(postTargetItem);
  const isPostActivity = getNotificationPostActivity(postTargetItem);

  if (postId) {
    const focus = commentId || category === 'mentions' || `${item.type ?? ''}`.toLowerCase().includes('comment') ? 'comments' : category === 'likes' ? 'likes' : undefined;
    const payloadPost = readPostFromPayload(targetPayload, postId);
    if (payloadPost) {
      cacheNotificationPost(queryClient, payloadPost);
    } else {
      feedService.getPost(postId)
        .then((post) => cacheNotificationPost(queryClient, post))
        .catch(() => undefined);
    }

    router.push('MainTabs', { screen: 'Home', params: { pinPostId: postId } });
    return;
  }

  if (isPostActivity) {
    Alert.alert('Post target missing', summarizeNotificationTarget(postTargetItem, targetPayload));
    return;
  }

  const normalizedUsername = getNotificationActorUsername(item) ?? '';
  if (normalizedUsername) {
    router.push('ProfileByUsername', { username: normalizedUsername });
    return;
  }

  router.push('Notifications');
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const inbox = useNotificationInbox();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const markedVisibleRef = useRef(false);
  const notifications = inbox.data ?? [];
  const sortedNotifications = useMemo(() => [...notifications].sort((a, b) => {
    const leftUnread = !a.read_at;
    const rightUnread = !b.read_at;
    if (leftUnread !== rightUnread) {
      return leftUnread ? -1 : 1;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }), [notifications]);
  const visibleNotifications = useMemo(() => {
    if (activeFilter === 'all') return sortedNotifications;
    return sortedNotifications.filter((item) => categoryForNotification(item) === activeFilter);
  }, [activeFilter, sortedNotifications]);
  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications]);

  useFocusEffect(
    useCallback(() => {
      if (markedVisibleRef.current || unreadCount === 0) return;
      markedVisibleRef.current = true;
      markAllRead.mutate(undefined, {
        onError: () => {
          markedVisibleRef.current = false;
        },
      });
    }, [markAllRead, unreadCount]),
  );

  return (
    <SwipeStackView>
      <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.circleBtn} onPress={() => router.back()}>
          <ArrowLeft size={21} color={AppColors.white} />
        </Pressable>
        <Text style={styles.title} pointerEvents="none">Notifications</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.circleBtn} onPress={() => router.push('MainTabs', { screen: 'Messages' })}>
            <MessageCircle size={21} color={AppColors.white} />
          </Pressable>
          <Pressable style={styles.circleBtn} onPress={() => router.push('Settings')}>
            <Settings size={21} color={AppColors.white} />
          </Pressable>
        </View>
      </View>

      <View style={styles.filterBand}>
        <View style={styles.filterPill}>
          {filters.map((filter) => {
            const selected = activeFilter === filter.id;
            return (
              <Pressable key={filter.id} style={[styles.filterTab, selected && styles.filterTabActive]} onPress={() => setActiveFilter(filter.id)}>
                <Text style={[styles.filterText, selected && styles.filterTextActive]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <FlatList
          scrollEnabled={false}
          data={visibleNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.inboxList}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
          renderItem={({ item }) => {
            const isUnread = !item.read_at;
            const isUpdating = markRead.isPending && markRead.variables === item.id;
            return (
              <NotificationRow
                item={item}
                disabled={isUpdating}
                onPress={() => {
                  if (isUpdating) return;
                  openNotificationTarget(item, queryClient).catch(() => {
                    Alert.alert('Unable to open', 'Please try opening this notification again.');
                  });
                  if (isUnread) {
                    markRead.mutate(item.id);
                  }
                }}
                onOpenProfile={() => openNotificationActorProfile(item)}
              />
          );
          }}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Bell size={20} color={AppColors.textMuted} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyBody}>Activity updates will appear here.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              tintColor={AppColors.accent}
              refreshing={inbox.isRefetching}
              onRefresh={() => {
                inbox.refetch();
              }}
            />
          }
        />
      </ScrollView>
      <View style={[styles.navWrap, { paddingBottom: Math.max(insets.bottom, 6) }]}>
        <View style={styles.navBar}>
          <Pressable style={styles.navItem} onPress={() => router.push('MainTabs', { screen: 'Home' })}>
            <House size={22} color="rgba(255,255,255,0.70)" />
            <Text style={styles.navLabel}>Home</Text>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push('MainTabs', { screen: 'Browse' })}>
            <Search size={23} color="rgba(255,255,255,0.70)" />
            <Text style={styles.navLabel}>Search</Text>
          </Pressable>
          <Pressable style={styles.navCenter} onPress={() => router.push('MainTabs', { screen: 'Earn' })}>
            <View style={styles.navLogoShell}>
              <ExpoImage source={require('@/assets/images/favicon.png')} style={styles.navLogo} contentFit="contain" />
            </View>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push('MainTabs', { screen: 'Messages' })}>
            <MessageCircle size={22} color="rgba(255,255,255,0.70)" />
            <Text style={styles.navLabel}>Messages</Text>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push('MainTabs', { screen: 'Profile' })}>
            <User size={22} color="rgba(255,255,255,0.70)" />
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
        </View>
      </View>
      </View>
    </SwipeStackView>
  );
}

const NotificationRow = ({
  item,
  disabled,
  onPress,
  onOpenProfile,
}: {
  item: NotificationItem;
  disabled?: boolean;
  onPress: () => void;
  onOpenProfile: () => void;
}) => {
  const category = categoryForNotification(item);
  const copy = splitNotificationCopy(item);
  const isUnread = !item.read_at;
  const avatarTone = category === 'follows' ? styles.avatarFollow : category === 'likes' ? styles.avatarLike : styles.avatarMention;
  const avatarUri = getNotificationActorAvatar(item);
  const postPreview = getNotificationPostPreview(item);
  const stopAndOpenProfile = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.();
    onOpenProfile();
  };

  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.notificationRow, disabled && styles.notificationRowDisabled]}>
      <Pressable disabled={disabled} onPress={stopAndOpenProfile} style={[styles.avatar, avatarTone]}>
        {avatarUri ? (
          <ExpoImage source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" cachePolicy="memory-disk" />
        ) : (
          <Text style={styles.avatarText}>{initialsFor(copy.actor)}</Text>
        )}
        <View style={styles.actionBadge}>
          {category === 'likes' ? (
            <Heart size={18} color="#FF3B6B" fill="#FF3B6B" />
          ) : category === 'follows' ? (
            <UserPlus size={18} color="#4C8BFF" />
          ) : (
            <AtSign size={17} color="#B888FF" />
          )}
        </View>
      </Pressable>

      <View style={styles.notificationCopy}>
        <View style={styles.notificationLine}>
          <Pressable disabled={disabled} onPress={stopAndOpenProfile} style={styles.actorNamePressable}>
            <Text style={[styles.actorName, isUnread && styles.actorNameUnread]} numberOfLines={1}>{copy.actor}</Text>
          </Pressable>
          <Text style={styles.notificationTime}>{formatRelativeTime(item.created_at)}</Text>
        </View>
        <Text style={styles.actionText} numberOfLines={2}>{copy.action}</Text>
        {postPreview ? (
          <View style={styles.postPreview}>
            {postPreview.mediaUrl ? (
              <ExpoImage source={{ uri: postPreview.mediaUrl }} style={styles.postPreviewImage} contentFit="cover" cachePolicy="memory-disk" />
            ) : null}
            <View style={styles.postPreviewCopy}>
              <Text style={styles.postPreviewLabel}>Post</Text>
              {postPreview.text ? <Text style={styles.postPreviewText} numberOfLines={2}>{postPreview.text}</Text> : null}
            </View>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  header: {
    minHeight: 86,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#09111E',
  },
  circleBtn: {
    width: 39,
    height: 39,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    textAlign: 'center',
    color: AppColors.white,
    fontSize: 19,
    fontFamily: undefined, fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterBand: {
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#0A101C',
  },
  filterPill: {
    flexDirection: 'row',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 5,
    gap: 4,
  },
  filterTab: {
    minWidth: 68,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: AppColors.white,
  },
  filterText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
  filterTextActive: {
    color: '#080D18',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 124,
  },
  inboxList: {
    gap: 0,
  },
  notificationRow: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 13,
  },
  notificationRowDisabled: { opacity: 0.68 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarFollow: { backgroundColor: '#BCEB6C' },
  avatarLike: { backgroundColor: '#64B7E8' },
  avatarMention: { backgroundColor: '#D934D5' },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  avatarText: {
    color: '#07111F',
    fontSize: 16,
    fontFamily: undefined, fontWeight: '800',
  },
  actionBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#05070D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#07111F',
  },
  notificationCopy: {
    flex: 1,
    minWidth: 0,
  },
  notificationLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actorNamePressable: {
    flex: 1,
    minWidth: 0,
  },
  actorName: {
    color: AppColors.white,
    fontSize: 19,
    lineHeight: 23,
    fontFamily: undefined, fontWeight: '800',
  },
  actorNameUnread: {
    color: AppColors.white,
  },
  actionText: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 16,
    lineHeight: 21,
    fontFamily: undefined, fontWeight: '800',
    marginTop: 4,
  },
  postPreview: {
    marginTop: 10,
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  postPreviewImage: {
    width: 58,
    height: 58,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  postPreviewCopy: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  postPreviewLabel: {
    color: AppColors.accent,
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
    textTransform: 'uppercase',
  },
  postPreviewText: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 13,
    lineHeight: 17,
    fontFamily: undefined, fontWeight: '700',
    marginTop: 2,
  },
  notificationTime: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontFamily: undefined, fontWeight: '800',
  },
  navWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#09111E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  navBar: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  navCenter: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLogoShell: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogo: {
    width: 24,
    height: 24,
  },
  navLabel: { color: AppColors.textMuted, fontSize: 10, fontFamily: undefined, fontWeight: '600' },
  notificationCard: {
    position: 'relative',
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.15)',
    backgroundColor: 'rgba(10,18,32,0.8)',
    paddingVertical: 12,
    paddingLeft: 18,
    paddingRight: 12,
    gap: 6,
  },
  notificationCardUnread: {
    borderColor: 'rgba(46,144,255,0.45)',
    backgroundColor: 'rgba(14,26,52,0.9)',
  },
  notificationCardDisabled: {
    opacity: 0.92,
  },
  statusDot: {
    position: 'absolute',
    left: 8,
    top: 14,
    width: 6,
    height: 6,
    borderRadius: AppRadii.pill,
  },
  statusDotUnread: {
    backgroundColor: AppColors.accentStrong,
    shadowColor: '#2E90FF',
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  statusDotRead: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  notificationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  notificationState: {
    fontSize: 10,
    fontFamily: undefined, fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  notificationStateUnread: {
    color: '#9CC9FF',
  },
  notificationStateRead: {
    color: AppColors.textMuted,
  },
  notificationTitle: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '700',
  },
  notificationBody: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: undefined, fontWeight: '400',
  },
  notificationMeta: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontFamily: undefined, fontWeight: '400',
  },
  emptyCard: {
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.18)',
    backgroundColor: 'rgba(10,18,32,0.8)',
    padding: 16,
    gap: 8,
  },
  emptyTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '700',
  },
  emptyBody: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: undefined, fontWeight: '400',
  },
});
