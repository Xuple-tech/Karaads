import { appKeyValueStorage } from '@/lib/storage/secure-store';
import type { MomentPost, Post } from '@/lib/types/domain';
import { hasRenderableMedia, isMomentPost, isRenderablePost } from '@/lib/utils/post';

const FEED_CACHE_PREFIX = 'karaads_recent_feed';
const MOMENT_CACHE_PREFIX = 'karaads_recent_moments';
const FEED_CACHE_LIMIT = 24;
const MOMENT_CACHE_LIMIT = 18;

type CachedCollection<T> = {
  items: T[];
  updatedAt: number;
};

const getScopedKey = (prefix: string, userId: string | undefined) => `${prefix}_${userId ?? 'guest'}`;

const dedupeById = <T extends { id: string }>(items: T[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

const sanitizeFeedPosts = (items: Post[]) => {
  return dedupeById(items.filter((item): item is Post => Boolean(item?.id) && isRenderablePost(item))).slice(0, FEED_CACHE_LIMIT);
};

const sanitizeMoments = (items: MomentPost[]) => {
  return dedupeById(
    items.filter((item): item is MomentPost => Boolean(item?.id) && isMomentPost(item) && hasRenderableMedia(item)),
  ).slice(0, MOMENT_CACHE_LIMIT);
};

const readCollection = async <T extends { id: string }>(
  key: string,
  sanitize: (items: T[]) => T[],
): Promise<T[]> => {
  try {
    const raw = await appKeyValueStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CachedCollection<T> | T[];
    const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
    return sanitize(items);
  } catch {
    return [];
  }
};

const writeCollection = async <T extends { id: string }>(
  key: string,
  items: T[],
  sanitize: (items: T[]) => T[],
): Promise<void> => {
  const next = sanitize(items);
  const payload: CachedCollection<T> = {
    items: next,
    updatedAt: Date.now(),
  };
  await appKeyValueStorage.setItem(key, JSON.stringify(payload));
};

const prependRecentItem = <T extends { id: string }>(current: T[], item: T, limit: number) => {
  return dedupeById([item, ...current]).slice(0, limit);
};

export const postCacheStorage = {
  async readRecentFeed(userId: string | undefined): Promise<Post[]> {
    return readCollection(getScopedKey(FEED_CACHE_PREFIX, userId), sanitizeFeedPosts);
  },

  async writeRecentFeed(userId: string | undefined, posts: Post[]): Promise<void> {
    await writeCollection(getScopedKey(FEED_CACHE_PREFIX, userId), posts, sanitizeFeedPosts);
  },

  async rememberViewedFeedPost(userId: string | undefined, post: Post): Promise<void> {
    if (!userId || !isRenderablePost(post)) {
      return;
    }
    const current = await this.readRecentFeed(userId);
    await this.writeRecentFeed(userId, prependRecentItem(current, post, FEED_CACHE_LIMIT));
  },

  async readRecentMoments(userId: string | undefined): Promise<MomentPost[]> {
    return readCollection(getScopedKey(MOMENT_CACHE_PREFIX, userId), sanitizeMoments);
  },

  async writeRecentMoments(userId: string | undefined, moments: MomentPost[]): Promise<void> {
    await writeCollection(getScopedKey(MOMENT_CACHE_PREFIX, userId), moments, sanitizeMoments);
  },

  async rememberViewedMoment(userId: string | undefined, moment: MomentPost): Promise<void> {
    if (!userId || !isMomentPost(moment) || !hasRenderableMedia(moment)) {
      return;
    }
    const current = await this.readRecentMoments(userId);
    await this.writeRecentMoments(userId, prependRecentItem(current, moment, MOMENT_CACHE_LIMIT));
  },
};
