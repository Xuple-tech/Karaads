import type { Post, PostMedia } from '@/lib/types/domain';

export const getDisplayPost = (post: Post): Post => {
  if ((post.media?.length ?? 0) > 0) {
    return post;
  }

  if (post.original_post) {
    return getDisplayPost(post.original_post);
  }

  return post;
};

export const getPrimaryMedia = (post: Post): PostMedia | undefined => {
  const display = getDisplayPost(post);
  return display.media?.[0];
};

export const hasRenderableMedia = (post: Post): boolean => {
  const media = getPrimaryMedia(post);
  if (!media) {
    return false;
  }

  const uri = media.url ?? media.path;
  return Boolean(uri && uri.trim().length > 0);
};

export const getPostTextContent = (post: Post): string => {
  const display = getDisplayPost(post);
  const candidates = [display.content, post.content];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return '';
};

export const hasMeaningfulPostContent = (post: Post): boolean => {
  return getPostTextContent(post).length > 0;
};

export const isRenderablePost = (post: Post): boolean => {
  return hasRenderableMedia(post) || hasMeaningfulPostContent(post);
};

export const isStoryLikePost = (post: Post): boolean => {
  const normalized = `${post.type ?? ''}`.toLowerCase();
  return normalized === 'moment' || normalized === 'story' || normalized === 'status';
};

export const isMomentPost = (post: Post): boolean => {
  return `${post.type ?? ''}`.toLowerCase() === 'moment';
};
