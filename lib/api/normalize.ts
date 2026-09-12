import { API_BASE_URLS } from '@/lib/api/config';
import type { Comment, Conversation, Message, Post, PostMedia, UserSummary } from '@/lib/types/domain';

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
};

const parseJsonSafe = (value: string): unknown => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

const apiOrigin = (() => {
  try {
    return new URL(API_BASE_URLS.v3).origin;
  } catch {
    return 'https://karaads.com';
  }
})();

const absolutizeUrl = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return `${apiOrigin}${trimmed}`;
  return trimmed;
};

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const asBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value === 'true' || value === '1') {
      return true;
    }

    if (value === 'false' || value === '0') {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return fallback;
};

const unwrapUserPayload = (input: unknown): Record<string, unknown> | null => {
  const base = asRecord(input);
  if (!base) {
    return null;
  }

  const nestedUser = asRecord(base.user);
  if (nestedUser) {
    return nestedUser;
  }

  return base;
};

const normalizeUsername = (value: string | undefined, fallbackName: string | undefined, fallbackId: string): string => {
  if (value && value.trim().length > 0) {
    return value.replace(/^@/, '');
  }

  if (fallbackName && fallbackName.trim().length > 0) {
    return fallbackName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9._-]/g, '');
  }

  return `user.${fallbackId.slice(0, 6)}`;
};

export const normalizeUser = (input: unknown): UserSummary => {
  const payload = unwrapUserPayload(input);
  const id = asString(payload?.id) ?? asString(payload?.user_id) ?? asString(payload?.uuid) ?? `u_${Date.now()}`;
  const name =
    asString(payload?.name) ??
    asString(payload?.display_name) ??
    asString(payload?.full_name) ??
    asString(payload?.username) ??
    'User';

  const username = normalizeUsername(asString(payload?.username) ?? asString(payload?.handle), name, id);

  const rawIsVerified = payload?.is_verified ?? payload?.verified;

  return {
    id,
    name,
    username,
    email: asString(payload?.email) ?? null,
    avatar:
      asString(payload?.avatar) ??
      asString(payload?.avatar_url) ??
      asString(payload?.profile_photo_url) ??
      asString(payload?.profile_image) ??
      null,
    cover:
      asString(payload?.cover) ??
      asString(payload?.cover_url) ??
      asString(payload?.cover_photo) ??
      asString(payload?.cover_photo_url) ??
      asString(payload?.banner) ??
      asString(payload?.banner_url) ??
      null,
    bio: asString(payload?.bio) ?? asString(payload?.about) ?? null,
    followers_count: asNumber(payload?.followers_count ?? payload?.followers ?? payload?.followersCount, 0),
    following_count: asNumber(payload?.following_count ?? payload?.following ?? payload?.followingCount, 0),
    is_verified: rawIsVerified === undefined ? undefined : asBoolean(rawIsVerified, false),
    is_following: asBoolean(payload?.is_following ?? payload?.following, false),
    is_followed_by: asBoolean(payload?.is_followed_by ?? payload?.followed_by ?? payload?.follows_me, false),
    follows_you: asBoolean(payload?.follows_you ?? payload?.is_followed_by ?? payload?.follows_me, false),
    is_follower: asBoolean(payload?.is_follower ?? payload?.follows_me ?? payload?.followed_by, false),
    referral_code:
      asString(payload?.referral_code) ??
      asString(payload?.referralCode) ??
      asString(payload?.invite_code) ??
      asString(payload?.inviteCode) ??
      asString(payload?.ref_code) ??
      null,
    referral_link:
      asString(payload?.referral_link) ??
      asString(payload?.referralLink) ??
      asString(payload?.invite_link) ??
      asString(payload?.inviteLink) ??
      null,
    referral_invited_count: asNumber(
      payload?.referral_invited_count ?? payload?.invited_count ?? payload?.invites_count ?? payload?.referred_count,
      0,
    ),
    referral_verified_count: asNumber(
      payload?.referral_verified_count ?? payload?.verified_count ?? payload?.verified_referrals_count,
      0,
    ),
    referral_pending_amount: asNumber(
      payload?.referral_pending_amount ?? payload?.pending_amount ?? payload?.pending_reward ?? payload?.pending_rewards,
      0,
    ),
    referral_credited_amount: asNumber(
      payload?.referral_credited_amount ?? payload?.credited_amount ?? payload?.credited_reward ?? payload?.credited_rewards,
      0,
    ),
    is_online: asBoolean(payload?.is_online ?? payload?.online ?? payload?.isOnline, false),
    last_seen:
      asString(payload?.last_seen) ??
      asString(payload?.lastSeen) ??
      asString(payload?.seen_at) ??
      asString(payload?.seenAt) ??
      asString(payload?.last_active_at) ??
      asString(payload?.lastActiveAt) ??
      null,
    last_active_at:
      asString(payload?.last_active_at) ??
      asString(payload?.lastActiveAt) ??
      asString(payload?.active_at) ??
      asString(payload?.activeAt) ??
      asString(payload?.last_seen) ??
      asString(payload?.lastSeen) ??
      null,
  };
};

const normalizeMediaItem = (input: unknown): PostMedia | null => {
  if (typeof input === 'string') {
    const parsed = parseJsonSafe(input);
    if (parsed && typeof parsed === 'object') {
      return normalizeMediaItem(parsed);
    }
    const directPath = absolutizeUrl(input);
    if (!directPath) return null;
    return {
      path: directPath,
      url: directPath,
      type: undefined,
      mime_type: undefined,
      processing_status: undefined,
    };
  }

  const payload = asRecord(input);
  if (!payload) {
    return null;
  }

  const filePayload = asRecord(payload.file) ?? asRecord(payload.asset) ?? asRecord(payload.media);
  const variants = asRecord(payload.variants);
  const thumbPayload = asRecord(payload.thumbnail);

  const path =
    absolutizeUrl(asString(payload.path)) ??
    absolutizeUrl(asString(payload.url)) ??
    absolutizeUrl(asString(payload.media_url)) ??
    absolutizeUrl(asString(payload.video_url)) ??
    absolutizeUrl(asString(payload.videoUrl)) ??
    absolutizeUrl(asString(payload.playback_url)) ??
    absolutizeUrl(asString(payload.playbackUrl)) ??
    absolutizeUrl(asString(payload.source_url)) ??
    absolutizeUrl(asString(payload.sourceUrl)) ??
    absolutizeUrl(asString(payload.file_url)) ??
    absolutizeUrl(asString(payload.src)) ??
    absolutizeUrl(asString(filePayload?.path)) ??
    absolutizeUrl(asString(filePayload?.url)) ??
    absolutizeUrl(asString(filePayload?.video_url)) ??
    absolutizeUrl(asString(filePayload?.playback_url)) ??
    absolutizeUrl(asString(filePayload?.src)) ??
    absolutizeUrl(asString(payload.thumbnail)) ??
    absolutizeUrl(asString(payload.thumbnail_url)) ??
    absolutizeUrl(asString(thumbPayload?.url)) ??
    absolutizeUrl(asString(variants?.thumb)) ??
    absolutizeUrl(asString(variants?.thumbnail));

  if (!path) {
    return null;
  }

  const type =
    asString(payload.type) ??
    asString(payload.media_type) ??
    asString(payload.kind) ??
    asString(filePayload?.type) ??
    asString(filePayload?.media_type) ??
    asString(payload.mime_type)?.split('/')[0];

  return {
    id: asString(payload.id),
    path,
    url:
      absolutizeUrl(asString(payload.url)) ??
      absolutizeUrl(asString(payload.media_url)) ??
      absolutizeUrl(asString(payload.video_url)) ??
      absolutizeUrl(asString(payload.videoUrl)) ??
      absolutizeUrl(asString(payload.playback_url)) ??
      absolutizeUrl(asString(payload.playbackUrl)) ??
      absolutizeUrl(asString(payload.source_url)) ??
      absolutizeUrl(asString(payload.sourceUrl)) ??
      absolutizeUrl(asString(filePayload?.url)) ??
      absolutizeUrl(asString(filePayload?.video_url)) ??
      absolutizeUrl(asString(filePayload?.playback_url)) ??
      path,
    type,
    mime_type: asString(payload.mime_type) ?? asString(filePayload?.mime_type),
    thumbnail_url:
      absolutizeUrl(asString(payload.thumbnail_url)) ??
      absolutizeUrl(asString(payload.thumb_url)) ??
      absolutizeUrl(asString(thumbPayload?.url)) ??
      absolutizeUrl(asString(variants?.thumb)) ??
      absolutizeUrl(asString(variants?.thumbnail)),
    name: asString(payload.name) ?? asString(filePayload?.name),
    size: asNumber(payload.size ?? filePayload?.size, 0) || undefined,
    duration: asNumber(payload.duration ?? payload.duration_seconds ?? filePayload?.duration, 0) || undefined,
    width: asNumber(payload.width ?? filePayload?.width, 0) || undefined,
    height: asNumber(payload.height ?? filePayload?.height, 0) || undefined,
    aspect_ratio: asNumber(payload.aspect_ratio ?? payload.aspectRatio, 0) || undefined,
    processing_status: asString(payload.processing_status),
  };
};

const normalizeMedia = (input: unknown): PostMedia[] => {
  if (typeof input === 'string') {
    const parsed = parseJsonSafe(input);
    if (Array.isArray(parsed) || (parsed && typeof parsed === 'object')) {
      return normalizeMedia(parsed);
    }
    const single = normalizeMediaItem(input);
    return single ? [single] : [];
  }

  let items: PostMedia[];

  if (Array.isArray(input)) {
    items = input.map(normalizeMediaItem).filter((item): item is PostMedia => Boolean(item));
  } else {
    const payload = asRecord(input);
    if (payload) {
      if (Array.isArray(payload.data)) {
        items = payload.data.map(normalizeMediaItem).filter((item): item is PostMedia => Boolean(item));
      } else if (Array.isArray(payload.items)) {
        items = payload.items.map(normalizeMediaItem).filter((item): item is PostMedia => Boolean(item));
      } else {
        const single = normalizeMediaItem(input);
        items = single ? [single] : [];
      }
    } else {
      const single = normalizeMediaItem(input);
      items = single ? [single] : [];
    }
  }

  // Deduplicate by URL to defend against server-side duplicate media records
  // (caused by previous clients sending the same file multiple times in FormData).
  const seenUrls = new Set<string>();
  return items.filter((item) => {
    const key = item.url ?? item.path ?? '';
    if (!key || seenUrls.has(key)) return false;
    seenUrls.add(key);
    return true;
  });
};

const unwrapPostPayload = (input: unknown): Record<string, unknown> | null => {
  const payload = asRecord(input);
  if (!payload) {
    return null;
  }

  const nestedPost = asRecord(payload.post);
  if (nestedPost) {
    return nestedPost;
  }

  return payload;
};

export const normalizePost = (input: unknown, depth = 0): Post => {
  const payload = unwrapPostPayload(input) ?? {};
  const id = asString(payload.id) ?? asString(payload.post_id) ?? `p_${Date.now()}`;
  const author = payload.user ?? payload.author ?? payload.creator ?? payload.owner;
  const topLevelMedia =
    payload.media_url ||
    payload.video_url ||
    payload.videoUrl ||
    payload.playback_url ||
    payload.playbackUrl ||
    payload.source_url ||
    payload.sourceUrl
      ? {
          id: asString(payload.media_id) ?? asString(payload.file_id),
          url:
            asString(payload.media_url) ??
            asString(payload.video_url) ??
            asString(payload.videoUrl) ??
            asString(payload.playback_url) ??
            asString(payload.playbackUrl) ??
            asString(payload.source_url) ??
            asString(payload.sourceUrl),
          path:
            asString(payload.path) ??
            asString(payload.media_url) ??
            asString(payload.video_url) ??
            asString(payload.videoUrl) ??
            asString(payload.playback_url) ??
            asString(payload.playbackUrl) ??
            asString(payload.source_url) ??
            asString(payload.sourceUrl),
          media_type: asString(payload.media_type) ?? asString(payload.type),
          mime_type: asString(payload.mime_type),
          thumbnail_url: asString(payload.thumbnail_url),
          width: payload.width,
          height: payload.height,
          aspect_ratio: payload.aspect_ratio ?? payload.aspectRatio,
          processing_status: asString(payload.processing_status),
        }
      : undefined;
  const media = normalizeMedia(payload.media ?? payload.attachments ?? payload.asset ?? topLevelMedia);
  const rawOriginalPost = payload.original_post;
  const original_post =
    depth < 3 && rawOriginalPost && typeof rawOriginalPost === 'object'
      ? normalizePost(rawOriginalPost, depth + 1)
      : null;

  return {
    id,
    content: asString(payload.content) ?? asString(payload.caption) ?? asString(payload.body) ?? null,
    type: asString(payload.type) ?? asString(payload.post_type),
    visibility: asString(payload.visibility),
    like_count: asNumber(payload.like_count ?? payload.likes_count ?? payload.likes, 0),
    comment_count: asNumber(payload.comment_count ?? payload.comments_count ?? payload.comments, 0),
    repost_count: asNumber(payload.repost_count ?? payload.reshare_count ?? payload.share_count, 0),
    view_count: asNumber(payload.view_count ?? payload.views_count ?? payload.play_count ?? payload.views, 0),
    save_count: asNumber(payload.save_count ?? payload.bookmark_count ?? payload.bookmarks_count, 0),
    earning_amount: asNumber(
      payload.earning_amount ??
        payload.earned_amount ??
        payload.post_earning ??
        payload.post_earnings ??
        payload.total_earning ??
        payload.total_earnings ??
        payload.totalEarned,
      0,
    ),
    earning_currency: asString(payload.earning_currency ?? payload.currency),
    earning_rate: asNumber(payload.earning_rate ?? payload.rate_per_view ?? payload.reward_per_view ?? payload.earning_per_view, 0),
    earning_status: asString(payload.earning_status ?? payload.reward_status),
    user_liked: asBoolean(payload.user_liked ?? payload.liked, false),
    user_saved: asBoolean(payload.user_saved ?? payload.saved, false),
    user_viewed: asBoolean(payload.user_viewed ?? payload.viewed, false),
    user_reshared: asBoolean(payload.user_reshared ?? payload.reshared, false),
    created_at: asString(payload.created_at) ?? asString(payload.createdAt) ?? new Date().toISOString(),
    user: normalizeUser(author),
    media,
    original_post,
  };
};

export const normalizePostList = (input: unknown): Post[] => {
  if (Array.isArray(input)) {
    return input.map(normalizePost);
  }

  const payload = asRecord(input);
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload.posts)) {
    return payload.posts.map(normalizePost);
  }

  if (Array.isArray(payload.data)) {
    return payload.data.map(normalizePost);
  }

  return [];
};

export const normalizeMessage = (input: unknown): Message => {
  const payload = asRecord(input) ?? {};
  const attachments = normalizeMedia(payload.attachments ?? payload.media ?? payload.attachment ?? payload.file);
  const messageType =
    asString(payload.message_type) ??
    asString(payload.type) ??
    (attachments[0]?.mime_type?.split('/')[0] ?? attachments[0]?.type);
  const content =
    asString(payload.content) ??
    asString(payload.message) ??
    (messageType === 'audio'
      ? '[Voice note]'
      : messageType === 'video'
        ? '[Video]'
        : messageType === 'image'
          ? '[Image]'
          : '');

  return {
    id: asString(payload.id) ?? asString(payload.message_id) ?? `m_${Date.now()}`,
    content,
    message_type: messageType,
    attachments,
    user_id: asString(payload.user_id) ?? asString(payload.sender_id),
    user: payload.user || payload.sender ? normalizeUser(payload.user ?? payload.sender) : undefined,
    conversation_id: asString(payload.conversation_id),
    read_at: asString(payload.read_at) ?? asString(payload.readAt) ?? asString(payload.seen_at) ?? asString(payload.seenAt) ?? null,
    delivered_at: asString(payload.delivered_at) ?? asString(payload.deliveredAt) ?? asString(payload.sent_at) ?? null,
    created_at: asString(payload.created_at) ?? new Date().toISOString(),
  };
};

export const normalizeComment = (input: unknown): Comment => {
  const payload = asRecord(input) ?? {};
  const author =
    payload.user ??
    payload.author ??
    payload.creator ??
    payload.owner ??
    payload.commenter ??
    payload.from_user;
  const fallbackAuthor =
    !author && (payload.username || payload.name || payload.avatar || payload.avatar_url || payload.profile_photo_url)
      ? {
          id: payload.user_id ?? payload.author_id ?? payload.commenter_id,
          name: payload.name,
          username: payload.username,
          avatar: payload.avatar ?? payload.avatar_url ?? payload.profile_photo_url,
        }
      : null;

  return {
    id: asString(payload.id) ?? asString(payload.comment_id) ?? `cm_${Date.now()}`,
    content: asString(payload.content) ?? asString(payload.body) ?? '',
    user_id: asString(payload.user_id),
    user: author || fallbackAuthor ? normalizeUser(author ?? fallbackAuthor) : undefined,
    post_id: asString(payload.post_id),
    parent_id: asString(payload.parent_id ?? payload.parentId) ?? null,
    reply_count: asNumber(payload.reply_count ?? payload.replyCount, 0),
    created_at: asString(payload.created_at) ?? new Date().toISOString(),
  };
};

export const normalizeCommentList = (input: unknown): Comment[] => {
  if (Array.isArray(input)) {
    return input.map((comment) => normalizeComment(comment));
  }

  const payload = asRecord(input);
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload.comments)) {
    return payload.comments.map((comment) => normalizeComment(comment));
  }

  if (Array.isArray(payload.data)) {
    return payload.data.map((comment) => normalizeComment(comment));
  }

  return [];
};

export const normalizeConversation = (input: unknown): Conversation => {
  const payload = asRecord(input) ?? {};

  return {
    id: asString(payload.id) ?? asString(payload.conversation_id) ?? `c_${Date.now()}`,
    type: asString(payload.type),
    name: asString(payload.name) ?? asString(payload.title),
    participants: Array.isArray(payload.participants)
      ? payload.participants.map((participant) => normalizeUser(participant))
      : [],
    last_message: payload.last_message ? normalizeMessage(payload.last_message) : undefined,
    unread_count: asNumber(payload.unread_count ?? payload.unread, 0),
  };
};
