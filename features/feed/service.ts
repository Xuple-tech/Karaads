import { useAuthStore } from '@/features/auth/store';
import { apiRequest } from '@/lib/api/http';
import { normalizeComment, normalizeCommentList, normalizePost, normalizePostList } from '@/lib/api/normalize';
import type { Comment, Post } from '@/lib/types/domain';
import { isRenderablePost } from '@/lib/utils/post';

type FeedResponse = Post[];

export type CreatePostInput = {
  content?: string;
  visibility?: 'everyone' | 'followers' | 'private';
  type?: 'post' | 'moment' | 'story';
  media?: {
    uri: string;
    name: string;
    mimeType: string;
    durationSeconds?: number;
  }[];
};

export type UpdatePostInput = {
  postId: string;
  content?: string;
  visibility?: 'everyone' | 'followers' | 'private';
};

export const feedService = {
  async getFeed(page: number): Promise<{ posts: Post[]; meta?: Record<string, unknown> }> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<FeedResponse>('/posts/feed', {
      query: { page, per_page: 20 },
      token,
      version: 'v1_2',
    });

    const posts = normalizePostList(response.data).filter(isRenderablePost);
    const payload = response.data && typeof response.data === 'object' && !Array.isArray(response.data)
      ? response.data as unknown as Record<string, unknown>
      : {};
    const nestedMeta = payload.meta && typeof payload.meta === 'object'
      ? payload.meta as Record<string, unknown>
      : payload.pagination && typeof payload.pagination === 'object'
        ? payload.pagination as Record<string, unknown>
        : undefined;
    return { posts, meta: response.meta ?? nestedMeta };
  },

  async getPost(postId: string): Promise<Post> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<Post>(`/posts/${postId}`, {
      token,
      version: 'v1_2',
    });

    return normalizePost(response.data);
  },

  async getStories(): Promise<Post[]> {
    const token = useAuthStore.getState().token;
    try {
      const response = await apiRequest<unknown>('/stories', {
        token,
        version: 'v1_2',
      });

      // GET /stories returns story groups: [{ user, has_unseen, stories: [...] }]
      // We must flatten group.stories[] into individual Post objects.
      const groups = Array.isArray(response.data) ? response.data : [];
      const posts: Post[] = [];

      for (const group of groups) {
        if (!group || typeof group !== 'object') continue;
        const g = group as Record<string, unknown>;
        const groupUser = g.user;
        const storyItems = Array.isArray(g.stories) ? g.stories : [];

        for (const story of storyItems) {
          if (!story || typeof story !== 'object') continue;
          const s = story as Record<string, unknown>;
          // Attach group-level user to story if story lacks one.
          // Also mark is_following=true so the story tray's follow-filter
          // passes — the server already guarantees these are from followed users.
          const storyUser = (s.user && typeof s.user === 'object')
            ? { is_following: true, ...(s.user as Record<string, unknown>) }
            : (groupUser && typeof groupUser === 'object')
              ? { is_following: true, ...(groupUser as Record<string, unknown>) }
              : s.user ?? groupUser;
          const post = normalizePost({ ...s, user: storyUser });
          posts.push({ ...post, type: 'story' });
        }
      }

      return posts;
    } catch {
      return [];
    }
  },

  async likePost(postId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/posts/${postId}/like`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async unlikePost(postId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/posts/${postId}/unlike`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async savePost(postId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/posts/${postId}/save`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async unsavePost(postId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/posts/${postId}/unsave`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async repostPost(postId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/posts/${postId}/reshare`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async unrepostPost(postId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/posts/${postId}/unreshare`, {
      method: 'POST',
      token,
      version: 'v1_2',
    });
  },

  async getComments(postId: string): Promise<Comment[]> {
    const token = useAuthStore.getState().token;
    try {
      const response = await apiRequest<Comment[]>(`/posts/${postId}/comments`, {
        token,
        version: 'v1_2',
      });
      return normalizeCommentList(response.data);
    } catch {
      return [];
    }
  },

  async addComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    const token = useAuthStore.getState().token;
    const payload: Record<string, unknown> = { content };
    if (parentId) payload.parent_id = parentId;
    const response = await apiRequest<Comment>(`/posts/${postId}/comment`, {
      method: 'POST',
      token,
      version: 'v1_2',
      body: payload,
    });

    return normalizeComment(response.data);
  },

  async createPost(input: CreatePostInput): Promise<Post> {
    const token = useAuthStore.getState().token;
    const trimmedContent = input.content?.trim();
    const hasMedia = (input.media?.length ?? 0) > 0;

    if (!trimmedContent && !hasMedia) {
      throw new Error('Add text or media before publishing.');
    }

    if (input.type === 'story') {
      const formData = new FormData();

      if (trimmedContent) {
        formData.append('content', trimmedContent);
        formData.append('caption', trimmedContent);
      }

      formData.append('visibility', 'everyone');

      (input.media ?? []).forEach((mediaItem) => {
        const file = { uri: mediaItem.uri, name: mediaItem.name, type: mediaItem.mimeType } as unknown as Blob;
        formData.append('media[]', file);
        if (typeof mediaItem.durationSeconds === 'number' && Number.isFinite(mediaItem.durationSeconds)) {
          formData.append('duration_seconds[]', String(mediaItem.durationSeconds));
        }
      });

      const response = await apiRequest<Post>('/stories', {
        method: 'POST',
        token,
        version: 'v1_2',
        body: formData,
      });

      return { ...normalizePost(response.data), type: 'story' };
    }

    const formData = new FormData();
    if (trimmedContent) {
      formData.append('content', trimmedContent);
      formData.append('caption', trimmedContent);
    }

    formData.append('type', 'post');
    formData.append('post_type', input.type === 'moment' ? 'moment' : 'post');
    formData.append('visibility', input.visibility ?? 'everyone');

    (input.media ?? []).forEach((mediaItem, i) => {
      const file = { uri: mediaItem.uri, name: mediaItem.name, type: mediaItem.mimeType } as unknown as Blob;
      formData.append(`media[${i}]`, file);
      if (typeof mediaItem.durationSeconds === 'number' && Number.isFinite(mediaItem.durationSeconds)) {
        formData.append(`duration_seconds[${i}]`, String(mediaItem.durationSeconds));
      }
    });

    const response = await apiRequest<Post>('/posts', {
      method: 'POST',
      token,
      version: 'v1_2',
      body: formData,
      // Videos commonly need longer than the global 15-second request timeout
      // on mobile connections. Keep the request alive while Android uploads it.
      timeoutMs: hasMedia ? 10 * 60 * 1000 : undefined,
    });

    return normalizePost(response.data);
  },

  async updatePost(input: UpdatePostInput): Promise<Post> {
    const token = useAuthStore.getState().token;
    const response = await apiRequest<Post>(`/posts/${input.postId}`, {
      method: 'PATCH',
      token,
      version: 'v1_2',
      body: {
        content: input.content?.trim() ?? '',
        caption: input.content?.trim() ?? '',
        visibility: input.visibility ?? 'everyone',
      },
    });

    return normalizePost(response.data);
  },

  async deletePost(postId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/posts/${postId}`, {
      method: 'DELETE',
      token,
      version: 'v1_2',
    });
  },

  async recordStoryView(storyId: string): Promise<void> {
    const token = useAuthStore.getState().token;
    try {
      await apiRequest(`/stories/${storyId}/view`, {
        method: 'POST',
        token,
        version: 'v1_2',
      });
    } catch {
      // silent — view tracking is best-effort
    }
  },

  async reactToStory(storyId: string, reaction: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/stories/${storyId}/reaction`, {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { reaction },
    });
  },

  async reportPost(postId: string, reason: string, description?: string): Promise<void> {
    const token = useAuthStore.getState().token;
    await apiRequest(`/posts/${postId}/report`, {
      method: 'POST',
      token,
      version: 'v1_2',
      body: { reason, ...(description ? { description } : {}) },
    });
  },
};
