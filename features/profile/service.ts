import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';
import { normalizePostList, normalizeUser } from '@/lib/api/normalize';
import type { Post, UserSummary } from '@/lib/types/domain';

export type ProfileBundle = {
  user: UserSummary;
  posts: Post[];
  moments: Post[];
  saved: Post[];
};

export type UpdateMyProfileInput = {
  name?: string;
  username?: string;
  bio?: string;
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
};

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

const uniqueById = (items: Post[]): Post[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const sortNewestFirst = (items: Post[]): Post[] => {
  return [...items].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
};

export const profileService = {
  async me(): Promise<UserSummary> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<UserSummary>('/users/profile', {
      token,
      version: 'v1_2',
    });

    return normalizeUser(response.data);
  },

  async byUsername(username: string): Promise<UserSummary> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<UserSummary>(`/users/by-username/${username}`, {
      token,
      version: 'v1_2',
    });

    return normalizeUser(response.data);
  },

  async follow(userId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/users/${userId}/follow`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async unfollow(userId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/users/${userId}/unfollow`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async followers(userId: string): Promise<UserSummary[]> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>(`/users/${userId}/followers`, {
      token,
      version: 'v1_2',
    });

    if (Array.isArray(response.data)) {
      return response.data.map((item) => normalizeUser(item));
    }

    if (response.data && typeof response.data === 'object') {
      const payload = response.data as Record<string, unknown>;
      return asArray(payload.data ?? payload.followers).map((item) => normalizeUser(item));
    }

    return [];
  },

  async following(userId: string): Promise<UserSummary[]> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>(`/users/${userId}/following`, {
      token,
      version: 'v1_2',
    });

    if (Array.isArray(response.data)) {
      return response.data.map((item) => normalizeUser(item));
    }

    if (response.data && typeof response.data === 'object') {
      const payload = response.data as Record<string, unknown>;
      return asArray(payload.data ?? payload.following).map((item) => normalizeUser(item));
    }

    return [];
  },

  async getProfileBundle(): Promise<ProfileBundle> {
    const token = useAuthStore.getState().token;
    const localUser = useAuthStore.getState().user;
    const normalizedLocalUser = localUser ? normalizeUser(localUser) : normalizeUser({});

    const me = await profileService.me().catch(() => normalizedLocalUser);

    const postsResponse = await apiRequest<unknown>(`/users/${me.id}/posts`, {
      token,
      version: 'v1_2',
      query: { page: 1 },
    }).catch(() => null);

    // v1.2 has no dedicated per-user moments/reposts/saved collection routes.
    // Moments are derived client-side from the post type; "saved" only exists
    // for the current user via /bookmarks (no per-user route for others'
    // saved posts); reposts have no v1.2 equivalent yet.
    const allPosts = sortNewestFirst(uniqueById(normalizePostList(postsResponse?.data)));
    const posts = allPosts.filter((post) => post.type !== 'moment');
    const moments = allPosts.filter((post) => post.type === 'moment');

    let saved: Post[] = [];
    const isOwnProfile = localUser?.id && me.id === localUser.id;
    if (isOwnProfile) {
      const bookmarksResponse = await apiRequest<unknown>('/bookmarks', { token, version: 'v1_2' }).catch(() => null);
      saved = sortNewestFirst(uniqueById(normalizePostList(bookmarksResponse?.data)));
    }

    return {
      user: me,
      posts,
      moments,
      saved,
    };
  },

  async updateMyProfile(input: UpdateMyProfileInput): Promise<UserSummary> {
    const token = useAuthStore.getState().token;

    const hasTextFields = input.name !== undefined || input.username !== undefined || input.bio !== undefined;
    if (hasTextFields) {
      const jsonBody: Record<string, unknown> = {};
      if (input.name !== undefined) jsonBody.name = input.name;
      if (input.username !== undefined) jsonBody.username = input.username;
      if (input.bio !== undefined) jsonBody.bio = input.bio;
      await apiRequest<unknown>('/users/profile', {
        method: 'PATCH',
        token,
        version: 'v1_2',
        body: jsonBody,
      });
    }

    if (input.avatar) {
      const avatarFile = { uri: input.avatar.uri, name: input.avatar.name, type: input.avatar.mimeType } as unknown as Blob;
      const form = new FormData();
      form.append('avatar', avatarFile);
      await apiRequest<unknown>('/users/profile/avatar', { method: 'POST', token, version: 'v1_2', body: form });
    }

    if (input.cover) {
      const coverFile = { uri: input.cover.uri, name: input.cover.name, type: input.cover.mimeType } as unknown as Blob;
      const form = new FormData();
      form.append('cover', coverFile);
      await apiRequest<unknown>('/users/profile/cover', { method: 'POST', token, version: 'v1_2', body: form });
    }

    return profileService.me();
  },
};
