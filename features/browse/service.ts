import { apiRequest } from '@/lib/api/http';
import { normalizePostList, normalizeUser } from '@/lib/api/normalize';
import type { Post, UserSummary } from '@/lib/types/domain';
import { useAuthStore } from '@/features/auth/store';

export type BrowseResult = {
  users: UserSummary[];
  posts: Post[];
};

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
};

const looksLikeUser = (value: unknown) => {
  const record = asRecord(value);
  if (!record || Object.keys(record).length === 0) return false;
  return Boolean(record.username ?? record.name ?? record.handle ?? record.avatar ?? record.profile_photo_url);
};

const looksLikePost = (value: unknown) => {
  const record = asRecord(value);
  if (!record || Object.keys(record).length === 0) return false;
  return Boolean(record.content ?? record.caption ?? record.body ?? record.media ?? record.post_id ?? record.post_type);
};

const splitMixedArray = (value: unknown): { users: unknown[]; posts: unknown[] } => {
  const items = asArray(value);
  const users = items.filter((item) => looksLikeUser(item) && !looksLikePost(item));
  const posts = items.filter((item) => looksLikePost(item));
  return { users, posts };
};

const mergeUsers = (...lists: UserSummary[][]): UserSummary[] => {
  const seen = new Set<string>();
  return lists
    .flat()
    .filter((user) => {
      if (!user?.id || seen.has(user.id)) return false;
      seen.add(user.id);
      return true;
    });
};

const mergePosts = (...lists: Post[][]): Post[] => {
  const seen = new Set<string>();
  return lists
    .flat()
    .filter((post) => {
      if (!post?.id || seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
};

const matchesUserQuery = (user: UserSummary | undefined, query: string) => {
  if (!user) return false;
  const q = query.toLowerCase();
  const name = (user.name ?? '').toLowerCase();
  const username = (user.username ?? '').toLowerCase();
  return name.includes(q) || username.includes(q);
};

const matchesPostQuery = (post: Post, query: string) => {
  const q = query.toLowerCase();
  const content = (post.content ?? '').toLowerCase();
  const authorName = (post.user?.name ?? '').toLowerCase();
  const authorUsername = (post.user?.username ?? '').toLowerCase();
  return content.includes(q) || authorName.includes(q) || authorUsername.includes(q);
};

const parseSearchPayload = (payload: unknown): BrowseResult => {
  if (Array.isArray(payload)) {
    const mixed = splitMixedArray(payload);
    return {
      users: mixed.users.map((user) => normalizeUser(user)),
      posts: normalizePostList(mixed.posts),
    };
  }

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const nestedData = asRecord(data.data);
    const nestedResult = asRecord(data.result);
    const nestedResults = asRecord(data.results);
    const topLevelDataArray = splitMixedArray(data.data);
    const topLevelResultsArray = splitMixedArray(data.results);
    const nestedDataArray = splitMixedArray(nestedData.data);
    const nestedResultArray = splitMixedArray(nestedResult.data);
    const nestedResultsArray = splitMixedArray(nestedResults.data);
    const usersRaw = [
      ...asArray(data.users ?? data.people ?? data.accounts ?? data.creators),
      ...topLevelDataArray.users,
      ...topLevelResultsArray.users,
      ...asArray(nestedData.users ?? nestedData.people ?? nestedData.accounts ?? nestedData.creators),
      ...nestedDataArray.users,
      ...asArray(nestedResult.users ?? nestedResult.people ?? nestedResult.accounts ?? nestedResult.creators),
      ...nestedResultArray.users,
      ...asArray(nestedResults.users ?? nestedResults.people ?? nestedResults.accounts ?? nestedResults.creators),
      ...nestedResultsArray.users,
    ];
    const postsRaw = [
      ...asArray(data.posts ?? data.results ?? data.items),
      ...topLevelDataArray.posts,
      ...topLevelResultsArray.posts,
      ...asArray(nestedData.posts ?? nestedData.results ?? nestedData.items),
      ...nestedDataArray.posts,
      ...asArray(nestedResult.posts ?? nestedResult.results ?? nestedResult.items),
      ...nestedResultArray.posts,
      ...asArray(nestedResults.posts ?? nestedResults.results ?? nestedResults.items),
      ...nestedResultsArray.posts,
    ];

    return {
      users: usersRaw.map((user) => normalizeUser(user)),
      posts: normalizePostList(postsRaw),
    };
  }

  return { users: [], posts: [] };
};

export const browseService = {
  async searchUsersOnly(query: string): Promise<UserSummary[]> {
    const q = query.trim();
    if (!q) {
      return [];
    }

    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/users/search', { query: { q }, token, version: 'v1_2' });
    const { users } = parseSearchPayload(response.data);
    const filteredUsers = users.filter((user) => matchesUserQuery(user, q));
    return filteredUsers.length ? filteredUsers : users;
  },

  async search(query: string): Promise<BrowseResult> {
    const q = query.trim();
    if (!q) {
      return { users: [], posts: [] };
    }

    const token = useAuthStore.getState().token;
    const response = await apiRequest<unknown>('/search', { query: { q }, token, version: 'v1_2' });
    const { users, posts } = parseSearchPayload(response.data);
    const mergedUsers = mergeUsers(
      users,
      posts.map((post) => post.user).filter((user): user is UserSummary => Boolean(user?.id)),
    );
    const filteredUsers = mergedUsers.filter((user) => matchesUserQuery(user, q));
    const filteredPosts = posts.filter((post) => matchesPostQuery(post, q));

    return {
      users: filteredUsers.length ? filteredUsers : mergedUsers,
      posts: filteredPosts.length ? filteredPosts : posts,
    };
  },

  async userByUsername(username: string): Promise<UserSummary> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<UserSummary>(`/users/by-username/${username}`, {
      token,
      version: 'v1_2',
    });

    return normalizeUser(response.data);
  },
};
