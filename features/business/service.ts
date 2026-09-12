import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';
import { normalizePostList } from '@/lib/api/normalize';
import { appKeyValueStorage } from '@/lib/storage/secure-store';
import type { Post } from '@/lib/types/domain';

export type BusinessPage = {
  id: string;
  name: string;
  username?: string;
  category: string;
  description?: string;
  avatar?: string;
  cover?: string;
  followers_count?: number;
  like_count?: number;
  view_count?: number;
  post_count?: number;
  posts?: Post[];
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  created_at?: string;
};

export type CreateBusinessPageInput = {
  name: string;
  category: string;
  description?: string;
  avatar?: {
    uri: string;
    name: string;
    mimeType: string;
  } | null;
  cover?: {
    uri: string;
    name: string;
    mimeType: string;
  } | null;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
};

export type CreateBusinessPagePostInput = {
  pageId: string;
  content?: string;
  media?: {
    uri: string;
    name: string;
    mimeType: string;
  }[];
};

const asString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
};

const asNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);

const localStorageKey = () => `karaads_business_page_${useAuthStore.getState().user?.id ?? 'guest'}`;
const localPagesStorageKey = () => `karaads_business_pages_${useAuthStore.getState().user?.id ?? 'guest'}`;
const followedPagesStorageKey = () => `karaads_followed_business_pages_${useAuthStore.getState().user?.id ?? 'guest'}`;

const normalizeBusinessPage = (value: unknown, fallback?: CreateBusinessPageInput): BusinessPage => {
  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const nested =
    payload.page && typeof payload.page === 'object'
      ? (payload.page as Record<string, unknown>)
      : payload.business && typeof payload.business === 'object'
        ? (payload.business as Record<string, unknown>)
        : payload;

  return {
    id: asString(nested.id, `local-${Date.now()}`),
    name: asString(nested.name ?? nested.page_name ?? nested.title, fallback?.name ?? 'Business Page'),
    username: asString(nested.username ?? nested.slug) || undefined,
    category: asString(nested.category ?? nested.business_category, fallback?.category ?? 'Business'),
    description: asString(nested.description ?? nested.bio, fallback?.description) || undefined,
    avatar: asString(nested.avatar ?? nested.avatar_url ?? nested.logo ?? nested.logo_url, fallback?.avatar?.uri) || undefined,
    cover: asString(nested.cover ?? nested.cover_url ?? nested.cover_photo ?? nested.cover_image, fallback?.cover?.uri) || undefined,
    followers_count: asNumber(nested.followers_count ?? nested.followersCount ?? nested.followers),
    like_count: asNumber(nested.like_count ?? nested.likes_count ?? nested.likes),
    view_count: asNumber(nested.view_count ?? nested.views_count ?? nested.views),
    post_count: asNumber(nested.post_count ?? nested.posts_count),
    posts: normalizePostList(nested.posts ?? nested.feed ?? nested.page_posts),
    phone: asString(nested.phone ?? nested.phone_number, fallback?.phone) || undefined,
    email: asString(nested.email, fallback?.email) || undefined,
    website: asString(nested.website ?? nested.url, fallback?.website) || undefined,
    address: asString(nested.address ?? nested.location, fallback?.address) || undefined,
    created_at: asString(nested.created_at ?? nested.createdAt, new Date().toISOString()),
  };
};

const saveLocalPage = async (page: BusinessPage): Promise<void> => {
  await appKeyValueStorage.setItem(localStorageKey(), JSON.stringify(page));
  await appendLocalPage(page);
};

const saveLocalPages = async (pages: BusinessPage[]): Promise<void> => {
  await appKeyValueStorage.setItem(localPagesStorageKey(), JSON.stringify(pages));
  if (pages[0]) {
    await appKeyValueStorage.setItem(localStorageKey(), JSON.stringify(pages[0]));
  }
};

const getLocalPage = async (): Promise<BusinessPage | null> => {
  const raw = await appKeyValueStorage.getItem(localStorageKey());
  if (!raw) return null;
  try {
    return normalizeBusinessPage(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
};

const getLocalPages = async (): Promise<BusinessPage[]> => {
  const raw = await appKeyValueStorage.getItem(localPagesStorageKey());
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.map((item) => normalizeBusinessPage(item));
    } catch {
      // Fall back to the legacy single-page cache.
    }
  }

  const legacy = await getLocalPage();
  return legacy ? [legacy] : [];
};

const appendLocalPage = async (page: BusinessPage): Promise<void> => {
  const current = await getLocalPages();
  const withoutDuplicate = current.filter((item) => item.id !== page.id);
  await saveLocalPages([page, ...withoutDuplicate]);
};

const replaceLocalPage = async (page: BusinessPage): Promise<void> => {
  const current = await getLocalPages();
  const next = current.some((item) => item.id === page.id)
    ? current.map((item) => (item.id === page.id ? page : item))
    : [page, ...current];
  await saveLocalPages(next);
};

const extractBusinessPages = (value: unknown): BusinessPage[] => {
  if (Array.isArray(value)) return value.map((item) => normalizeBusinessPage(item));

  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const candidates = [payload.pages, payload.business_pages, payload.businesses, payload.items, payload.data];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.map((item) => normalizeBusinessPage(item));
  }

  const page = normalizeBusinessPage(value);
  return page.name ? [page] : [];
};

const createLocalPage = async (input: CreateBusinessPageInput): Promise<BusinessPage> => {
  const page: BusinessPage = {
    id: `local-${Date.now()}`,
    name: input.name.trim(),
    username: slugify(input.name.trim()) || undefined,
    category: input.category.trim(),
    description: input.description?.trim() || undefined,
    avatar: input.avatar?.uri,
    cover: input.cover?.uri,
    followers_count: 0,
    like_count: 0,
    view_count: 0,
    post_count: 0,
    posts: [],
    phone: input.phone?.trim() || undefined,
    email: input.email?.trim() || undefined,
    website: input.website?.trim() || undefined,
    address: input.address?.trim() || undefined,
    created_at: new Date().toISOString(),
  };
  await saveLocalPage(page);
  return page;
};

export const businessService = {
  async getMyPages(): Promise<BusinessPage[]> {
    const token = useAuthStore.getState().token;

    try {
      const response = await apiRequest<unknown>('/business-pages', { token, version: 'v1_2' });
      const pages = extractBusinessPages(response.data);
      if (pages.length) {
        await saveLocalPages(pages);
        return pages;
      }
    } catch {
      // Fall back to the local cache if the request fails (e.g. offline).
    }

    return getLocalPages();
  },

  async getMyPage(): Promise<BusinessPage | null> {
    const token = useAuthStore.getState().token;

    try {
      const response = await apiRequest<unknown>('/business-pages/me', { token, version: 'v1_2' });
      const page = normalizeBusinessPage(response.data);
      await saveLocalPage(page);
      return page;
    } catch {
      // Fall back to the local cache if the request fails (e.g. offline).
    }

    const pages = await this.getMyPages();
    return pages[0] ?? getLocalPage();
  },

  async createPage(input: CreateBusinessPageInput): Promise<BusinessPage> {
    const token = useAuthStore.getState().token;
    const body = {
      name: input.name.trim(),
      page_name: input.name.trim(),
      category: input.category.trim(),
      description: input.description?.trim(),
      bio: input.description?.trim(),
      phone: input.phone?.trim(),
      phone_number: input.phone?.trim(),
      email: input.email?.trim(),
      website: input.website?.trim(),
      address: input.address?.trim(),
      avatar: input.avatar?.uri,
      logo: input.avatar?.uri,
      cover: input.cover?.uri,
      cover_photo: input.cover?.uri,
    };

    try {
      if (input.avatar || input.cover) {
        const form = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            form.append(key, String(value));
          }
        });
        if (input.avatar) {
          const avatarFile = { uri: input.avatar.uri, name: input.avatar.name, type: input.avatar.mimeType } as unknown as Blob;
          form.append('avatar', avatarFile);
          form.append('logo', avatarFile);
        }
        if (input.cover) {
          const coverFile = { uri: input.cover.uri, name: input.cover.name, type: input.cover.mimeType } as unknown as Blob;
          form.append('cover', coverFile);
          form.append('cover_photo', coverFile);
        }

        const response = await apiRequest<unknown>('/business-pages', {
          method: 'POST',
          token,
          version: 'v1_2',
          body: form,
        });
        const page = normalizeBusinessPage(response.data, input);
        await saveLocalPage(page);
        return page;
      }

      const response = await apiRequest<unknown>('/business-pages', {
        method: 'POST',
        token,
        version: 'v1_2',
        body,
      });
      const page = normalizeBusinessPage(response.data, input);
      await saveLocalPage(page);
      return page;
    } catch {
      // Fall back to local creation if the request fails (e.g. offline).
    }

    return createLocalPage(input);
  },

  async createPagePost(input: CreateBusinessPagePostInput): Promise<Post> {
    const token = useAuthStore.getState().token;
    const trimmedContent = input.content?.trim();
    const hasMedia = (input.media?.length ?? 0) > 0;

    if (!trimmedContent && !hasMedia) {
      throw new Error('Add text or media before publishing.');
    }

    try {
      const form = new FormData();
      if (trimmedContent) {
        form.append('content', trimmedContent);
        form.append('caption', trimmedContent);
      }
      form.append('type', 'post');
      form.append('page_id', input.pageId);
      form.append('business_page_id', input.pageId);
      (input.media ?? []).forEach((mediaItem, index) => {
        const file = { uri: mediaItem.uri, name: mediaItem.name, type: mediaItem.mimeType } as unknown as Blob;
        form.append(`media[${index}]`, file);
        form.append('media[]', file);
      });

      const response = await apiRequest<unknown>('/posts', {
        method: 'POST',
        token,
        version: 'v1_2',
        body: form,
      });
      const post = normalizePostList([response.data])[0] ?? normalizePostList((response.data as Record<string, unknown>)?.post)[0];
      if (post) {
        const pages = await getLocalPages();
        const page = pages.find((item) => item.id === input.pageId);
        if (page) {
          await replaceLocalPage({
            ...page,
            posts: [post, ...(page.posts ?? []).filter((item) => item.id !== post.id)],
            post_count: Math.max(Number(page.post_count ?? 0), (page.posts?.length ?? 0) + 1),
          });
        }
        return post;
      }
    } catch {
      // Fall back to a local-only post if the request fails (e.g. offline).
    }

    const pages = await getLocalPages();
    const page = pages.find((item) => item.id === input.pageId) ?? pages[0];
    const localPost: Post = {
      id: `page-post-${Date.now()}`,
      content: trimmedContent ?? '',
      type: 'page_post',
      visibility: 'everyone',
      like_count: 0,
      comment_count: 0,
      repost_count: 0,
      view_count: 0,
      save_count: 0,
      created_at: new Date().toISOString(),
      media: (input.media ?? []).map((item, index) => ({
        id: `media-${Date.now()}-${index}`,
        url: item.uri,
        path: item.uri,
        type: item.mimeType.startsWith('video') ? 'video' : 'image',
        mime_type: item.mimeType,
        name: item.name,
      })),
    };

    if (page) {
      await replaceLocalPage({
        ...page,
        posts: [localPost, ...(page.posts ?? [])],
        post_count: (page.posts?.length ?? 0) + 1,
      });
    }

    return localPost;
  },

  async followPage(pageId: string, isFollowing: boolean): Promise<boolean> {
    const token = useAuthStore.getState().token;
    const next = !isFollowing;
    const endpoint = next ? `/business-pages/${pageId}/follow` : `/business-pages/${pageId}/unfollow`;

    try {
      await apiRequest(endpoint, { method: 'POST', token, version: 'v1_2' });
    } catch {
      // Local follow state keeps the app responsive if the backend endpoint is absent.
    }

    const raw = await appKeyValueStorage.getItem(followedPagesStorageKey());
    const current = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    current[pageId] = next;
    await appKeyValueStorage.setItem(followedPagesStorageKey(), JSON.stringify(current));
    return next;
  },

  async getFollowedPageMap(): Promise<Record<string, boolean>> {
    const raw = await appKeyValueStorage.getItem(followedPagesStorageKey());
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, boolean>;
    } catch {
      return {};
    }
  },
};
