import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store';
import { MOMENT_QUERY_KEY } from '@/features/moment/hooks';
import { MY_PROFILE_KEY } from '@/features/profile/hooks';
import { postCacheStorage } from '@/lib/storage/post-cache';
import type { Comment, Post } from '@/lib/types/domain';
import { feedService, type CreatePostInput, type UpdatePostInput } from './service';

export const FEED_QUERY_KEY = ['feed'] as const;
export const STORIES_QUERY_KEY = ['stories'] as const;

type FeedPage = { posts: Post[]; meta?: Record<string, unknown> };
type FeedInfiniteData = InfiniteData<FeedPage, number>;

const buildCachedFeedData = (posts: Post[]): FeedInfiniteData => ({
  pages: [{ posts, meta: { source: 'cache' } }],
  pageParams: [1],
});

const patchPostTree = (post: Post, postId: string, updater: (post: Post) => Post): Post => {
  let next = post.id === postId ? updater(post) : post;
  const originalPost = next.original_post;
  if (originalPost) {
    const patchedOriginal = patchPostTree(originalPost, postId, updater);
    if (patchedOriginal !== originalPost) {
      next = { ...next, original_post: patchedOriginal };
    }
  }
  return next;
};

const updateFeedPost = (
  data: FeedInfiniteData | undefined,
  postId: string,
  updater: (post: Post) => Post,
): FeedInfiniteData | undefined => {
  if (!data) return data;
  let changed = false;
  const pages = data.pages.map((page) => {
    let pageChanged = false;
    const posts = page.posts.map((post) => {
      const next = patchPostTree(post, postId, updater);
      if (next !== post) pageChanged = true;
      return next;
    });
    if (!pageChanged) return page;
    changed = true;
    return { ...page, posts };
  });
  return changed ? { ...data, pages } : data;
};

export const useFeed = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    let cancelled = false;

    postCacheStorage.readRecentFeed(userId).then((posts) => {
      if (cancelled || posts.length === 0) {
        return;
      }

      queryClient.setQueryData<FeedInfiniteData>(FEED_QUERY_KEY, (current) => current ?? buildCachedFeedData(posts));
    });

    return () => {
      cancelled = true;
    };
  }, [queryClient, userId]);

  return useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => feedService.getFeed(pageParam),
    getNextPageParam: (lastPage, pages) => {
      const lastPageIndex = Number(lastPage.meta?.last_page);
      if (!Number.isNaN(lastPageIndex) && lastPageIndex > pages.length) {
        return pages.length + 1;
      }

      const count = lastPage.posts.length;
      return count > 0 ? pages.length + 1 : undefined;
    },
  });
};

export const useStories = () => {
  return useQuery({
    queryKey: STORIES_QUERY_KEY,
    // 30s stale time so returning to the home tab re-fetches stories and picks
    // up any edits made on the web without hitting the server on every render.
    staleTime: 30 * 1000,
    queryFn: () => feedService.getStories(),
  });
};

export const useLikeToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { postId: string; liked: boolean }) => {
      if (input.liked) {
        await feedService.unlikePost(input.postId);
        return;
      }

      await feedService.likePost(input.postId);
    },
    onMutate: async ({ postId, liked }) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previousFeed = queryClient.getQueryData<FeedInfiniteData>(FEED_QUERY_KEY);

      queryClient.setQueryData<FeedInfiniteData>(FEED_QUERY_KEY, (current) =>
        updateFeedPost(current, postId, (post) => {
          const nextLiked = !liked;
          return {
            ...post,
            user_liked: nextLiked,
            like_count: Math.max(0, (post.like_count ?? 0) + (nextLiked ? 1 : -1)),
          };
        }),
      );

      return { previousFeed };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previousFeed);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY, refetchType: 'none' }),
        queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY, refetchType: 'none' }),
      ]);
    },
  });
};

export const useSaveToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await feedService.savePost(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previousFeed = queryClient.getQueryData<FeedInfiniteData>(FEED_QUERY_KEY);

      queryClient.setQueryData<FeedInfiniteData>(FEED_QUERY_KEY, (current) =>
        updateFeedPost(current, postId, (post) => {
          const nextSaved = !Boolean(post.user_saved);
          return {
            ...post,
            user_saved: nextSaved,
            save_count: Math.max(0, (post.save_count ?? 0) + (nextSaved ? 1 : -1)),
          };
        }),
      );

      return { previousFeed };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previousFeed);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY, refetchType: 'none' }),
        queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY, refetchType: 'none' }),
      ]);
    },
  });
};

export const useRepostToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { postId: string; reposted: boolean }) => {
      if (input.reposted) {
        await feedService.unrepostPost(input.postId);
        return;
      }

      await feedService.repostPost(input.postId);
    },
    onMutate: async ({ postId, reposted }) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previousFeed = queryClient.getQueryData<FeedInfiniteData>(FEED_QUERY_KEY);

      queryClient.setQueryData<FeedInfiniteData>(FEED_QUERY_KEY, (current) =>
        updateFeedPost(current, postId, (post) => {
          const nextReposted = !reposted;
          return {
            ...post,
            user_reshared: nextReposted,
            repost_count: Math.max(0, (post.repost_count ?? 0) + (nextReposted ? 1 : -1)),
          };
        }),
      );

      return { previousFeed };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previousFeed);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY, refetchType: 'none' });
    },
  });
};

export const usePostComments = (postId: string, enabled = true) => {
  return useQuery({
    queryKey: ['post', postId, 'comments'],
    queryFn: () => feedService.getComments(postId),
    enabled: Boolean(postId) && enabled,
  });
};

export const useAddComment = (postId: string) => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (input: string | { content: string; parentId?: string }) => {
      const content = typeof input === 'string' ? input : input.content;
      const parentId = typeof input === 'string' ? undefined : input.parentId;
      return feedService.addComment(postId, content, parentId);
    },
    onMutate: async (input) => {
      const content = typeof input === 'string' ? input : input.content;
      const parentId = typeof input === 'string' ? undefined : input.parentId;
      await queryClient.cancelQueries({ queryKey: ['post', postId, 'comments'] });

      const previous = queryClient.getQueryData<Comment[]>(['post', postId, 'comments']);
      const previousFeed = queryClient.getQueryData<FeedInfiniteData>(FEED_QUERY_KEY);

      const optimisticComment: Comment = {
        id: `temp-comment-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        post_id: postId,
        parent_id: parentId ?? null,
        reply_count: 0,
        user_id: currentUser?.id,
        user: currentUser ?? undefined,
      };

      queryClient.setQueryData<Comment[]>(['post', postId, 'comments'], (current = []) => [optimisticComment, ...current]);
      queryClient.setQueryData<FeedInfiniteData>(FEED_QUERY_KEY, (current) =>
        updateFeedPost(current, postId, (post) => ({
          ...post,
          comment_count: Math.max(0, (post.comment_count ?? 0) + 1),
        })),
      );

      return { previous, previousFeed, optimisticId: optimisticComment.id };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['post', postId, 'comments'], context.previous);
      }
      if (context?.previousFeed) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previousFeed);
      }
    },
    onSuccess: (comment, _variables, context) => {
      queryClient.setQueryData<Comment[]>(['post', postId, 'comments'], (current = []) =>
        current.map((entry) => (entry.id === context?.optimisticId ? comment : entry)),
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId, 'comments'], refetchType: 'none' });
      await queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY, refetchType: 'none' });
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePostInput) => feedService.createPost(input),
    onSuccess: (createdPost) => {
      const postType = (createdPost.type ?? '').toLowerCase();

      // Persist newly created moments to the local cache so they survive app restarts.
      if (postType === 'moment') {
        const userId = useAuthStore.getState().user?.id;
        postCacheStorage.rememberViewedMoment(userId, createdPost as import('@/lib/types/domain').MomentPost).catch(() => undefined);
      }

      // Persist own story into STORIES_QUERY_KEY (the canonical story store) and
      // local cache so it survives app restarts. Stories are never returned by
      // /posts/feed so we must not mix them into FEED_QUERY_KEY — the feed refetch
      // would wipe them immediately.
      if (postType === 'story' || postType === 'status') {
        const userId = useAuthStore.getState().user?.id;
        postCacheStorage.rememberViewedFeedPost(userId, createdPost).catch(() => undefined);
        queryClient.setQueryData<Post[]>(STORIES_QUERY_KEY, (current) =>
          current ? [createdPost, ...current.filter((s) => s.id !== createdPost.id)] : [createdPost],
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      const promises: Promise<void>[] = [
        queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY }),
      ];
      // /posts/feed never includes stories — invalidating it would wipe the
      // story we just injected into the cache in onSuccess.
      if ((variables?.type ?? 'post') !== 'story') {
        promises.push(queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }));
      }
      // A successful upload should settle as soon as the API confirms the
      // post. Cache refreshes are follow-up work and must not keep the global
      // upload indicator pinned near completion when a refetch is slow.
      void Promise.all(promises).catch(() => undefined);
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePostInput) => feedService.updatePost(input),
    onMutate: async ({ postId, content, visibility }) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const previousFeed = queryClient.getQueryData<FeedInfiniteData>(FEED_QUERY_KEY);

      queryClient.setQueryData<FeedInfiniteData>(FEED_QUERY_KEY, (current) =>
        updateFeedPost(current, postId, (post) => ({
          ...post,
          content: content ?? post.content,
          visibility: visibility ?? post.visibility,
        })),
      );

      return { previousFeed };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.previousFeed);
      }
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueryData<FeedInfiniteData>(FEED_QUERY_KEY, (current) =>
        updateFeedPost(current, updatedPost.id, () => updatedPost),
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
      ]);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => feedService.deletePost(postId),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
      ]);
    },
  });
};
