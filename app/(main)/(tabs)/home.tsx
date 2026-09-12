import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useEvent } from 'expo';
import * as Clipboard from 'expo-clipboard';
import { Image as ExpoImage } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
    Bell,
    BadgeCheck,
    Bookmark,
    Coins,
    Copy,
    Ellipsis,
    Heart,
    Mail,
    MessageCircle,
    Pencil,
    Plus,
    Radio,
    Rocket,
    Send,
    Share2,
    ThumbsUp,
    Volume2,
    VolumeX,
    X
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
    type ViewToken
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SwipeTabsView } from '@/components/navigation/swipe-tabs-view';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { useFollowBusinessPage, useFollowedBusinessPages, useMyBusinessPages } from '@/features/business/hooks';
import type { BusinessPage } from '@/features/business/service';
import { useAddComment, useDeletePost, useFeed, useLikeToggle, usePostComments, useRepostToggle, useSaveToggle, useStories } from '@/features/feed/hooks';
import { feedService } from '@/features/feed/service';
import { usePostUploadStore } from '@/features/feed/upload-store';
import { messagesService } from '@/features/messages/service';
import { MOMENT_QUERY_KEY } from '@/features/moment/hooks';
import { useNotificationInbox } from '@/features/notifications/inbox-hooks';
import { useFollowing, useFollowToggle } from '@/features/profile/hooks';
import { router, useLocalSearchParams } from '@/lib/navigation/router';
import { postCacheStorage } from '@/lib/storage/post-cache';
import type { Comment, Post, PostMedia } from '@/lib/types/domain';
import { useResponsiveMetrics } from '@/lib/ui/responsive';
import { getDisplayPost, getPostTextContent, hasRenderableMedia, isRenderablePost } from '@/lib/utils/post';
import { LinearGradient } from 'expo-linear-gradient';
type StoryUser = NonNullable<Post['user']>;
type RenderableMedia = PostMedia & { uri: string; mediaKey: string };
type LiveCreator = {
  user: StoryUser;
  previewUri?: string;
  title: string;
  viewers: number;
  isFollowing: boolean;
};
type PagePostMeta = {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  cover?: string;
  category?: string;
  is_following?: boolean;
};
type MomentFeedPage = { moments: Post[]; source: 'moments' | 'feed' | 'cache' };
type MomentFeedData = InfiniteData<MomentFeedPage, number>;
const CAPTION_TRIM_LENGTH = 160;
const STORY_POST_LIMIT = 12;
const STORY_VIEW_DURATION_MS = 5000;
const STORY_EXPIRY_WINDOW_MS = 24 * 60 * 60 * 1000;
const SPONSORED_MIN_GAP = 3;
const SPONSORED_MAX_GAP = 6;
// Height of the story-viewer bottom bar (reactions + message row)
const SV_BOTTOM_BAR_HEIGHT = 136;
const COMMENT_EMOJIS = ['❤️', '😂', '🔥', '👏', '😍', '😮'];
const COMMENT_STICKERS = ['🌟', '💯', '🎉', '🙌', '✨', '👑'];

const pagePostMeta = (post: Post): PagePostMeta | undefined => (post as Post & { page_profile?: PagePostMeta }).page_profile;

const buildPageFeedPosts = (pages: BusinessPage[], followedPages: Record<string, boolean>): Post[] =>
  pages.flatMap((page) =>
    (page.posts ?? []).map((post) => ({
      ...post,
      type: post.type ?? 'page_post',
      user: {
        id: `page:${page.id}`,
        name: page.name,
        username: page.username ?? page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        avatar: page.avatar,
        cover: page.cover,
        bio: page.description,
        is_following: Boolean(followedPages[page.id]),
      },
      page_profile: {
        id: page.id,
        name: page.name,
        username: page.username,
        avatar: page.avatar,
        cover: page.cover,
        category: page.category,
        is_following: Boolean(followedPages[page.id]),
      },
    } as Post & { page_profile: PagePostMeta })),
  );

const formatCompact = (value: number | undefined) => {
  const count = value ?? 0;
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return `${count}`;
};

const currencySymbol = (code?: string) => {
  const normalized = (code ?? 'NGN').toUpperCase();
  if (normalized === 'NGN') return '₦';
  if (normalized === 'USD') return '$';
  return `${normalized} `;
};

const formatPostMoney = (value: number | undefined, currency?: string) => {
  const amount = value ?? 0;
  return `${currencySymbol(currency)}${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};
const videoDurationSeconds = (duration?: number) => {
  if (!duration || duration <= 0) return 0;
  return duration > 1000 ? duration / 1000 : duration;
};
const isVideoMedia = (media: PostMedia) => {
  const source = `${media.type ?? ''} ${media.mime_type ?? ''} ${media.url ?? ''} ${media.path ?? ''}`.toLowerCase();
  return source.includes('video') || /\.(mp4|mov|m4v|webm|avi)$/i.test(source);
};
const getFixedPostReward = (post: Post) => {
  const qualifyingVideo = (post.media ?? [])
    .filter(isVideoMedia)
    .find((media) => videoDurationSeconds(media.duration) > 30);
  const hasVerifiedBadge = Boolean(post.user?.is_verified);
  return {
    amount: qualifyingVideo ? (hasVerifiedBadge ? 30 : 10) : 0,
    qualifies: Boolean(qualifyingVideo),
  };
};
const getFollowRelation = (user: Post['user'] | undefined) => {
  if (!user) return { isFollowing: false, followsYou: false };
  const relation = user as Record<string, unknown>;
  const followsYou = Boolean(user.follows_you ?? user.is_followed_by ?? user.is_follower ?? relation.follows_you ?? relation.is_followed_by ?? relation.is_follower);
  const isFollowing = Boolean(user.is_following ?? relation.is_following ?? relation.following);
  return { isFollowing, followsYou };
};
const formatPostTime = (createdAt: string | undefined) => {
  if (!createdAt) return 'now';
  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) return 'now';
  const diffMs = Math.max(0, Date.now() - createdMs);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  if (diffMs < minute) return 'now';
  if (diffMs < hour) {
    const value = Math.floor(diffMs / minute);
    return `${value} min`;
  }
  if (diffMs < day) {
    const value = Math.floor(diffMs / hour);
    return `${value} ${value === 1 ? 'hour' : 'hours'}`;
  }
  if (diffMs < week) {
    const value = Math.floor(diffMs / day);
    return `${value} ${value === 1 ? 'day' : 'days'}`;
  }
  if (diffMs < month) {
    const value = Math.floor(diffMs / week);
    return `${value} ${value === 1 ? 'week' : 'weeks'}`;
  }
  if (diffMs < year) {
    const value = Math.floor(diffMs / month);
    return `${value} ${value === 1 ? 'month' : 'months'}`;
  }
  const value = Math.floor(diffMs / year);
  return `${value} ${value === 1 ? 'year' : 'years'}`;
};
const isStoryActive = (post: Post): boolean => {
  // Prefer server-provided expires_at; fall back to 24h window from created_at.
  const expiresAt = (post as unknown as Record<string, unknown>).expires_at;
  if (expiresAt && typeof expiresAt === 'string') {
    const expiresMs = new Date(expiresAt).getTime();
    if (!Number.isNaN(expiresMs)) return Date.now() < expiresMs;
  }
  if (!post.created_at) return false;
  const createdMs = new Date(post.created_at).getTime();
  if (Number.isNaN(createdMs)) return false;
  return Date.now() - createdMs <= STORY_EXPIRY_WINDOW_MS;
};
const hashSeed = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
};
const interleaveSponsoredPosts = (posts: Post[]): Post[] => {
  const sponsored = posts.filter((post) => (post.type ?? '').toLowerCase() === 'ad');
  const regular = posts.filter((post) => (post.type ?? '').toLowerCase() !== 'ad');
  if (!sponsored.length || !regular.length) return posts;
  const seedSource = posts.map((post) => post.id).join('|');
  let seed = hashSeed(seedSource);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const nextGap = () => SPONSORED_MIN_GAP + Math.floor(rand() * (SPONSORED_MAX_GAP - SPONSORED_MIN_GAP + 1));
  const result: Post[] = [];
  let adIndex = 0;
  let counter = 0;
  let insertionGap = nextGap();
  regular.forEach((post) => {
    result.push(post);
    counter += 1;
    if (adIndex < sponsored.length && counter >= insertionGap) {
      result.push(sponsored[adIndex]);
      adIndex += 1;
      counter = 0;
      insertionGap = nextGap();
    }
  });
  return result;
};
const shufflePostsBySeed = (posts: Post[], seedValue: number): Post[] => {
  let seed = hashSeed(`${seedValue}:${posts.map((post) => post.id).join('|')}`);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return [...posts]
    .map((post) => ({ post, rank: rand() }))
    .sort((a, b) => a.rank - b.rank)
    .map((item) => item.post);
};
export default function HomeScreen() {
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ pinPostId?: string }>();
  const pinPostId = Array.isArray(params.pinPostId) ? params.pinPostId[0] : params.pinPostId;
  const isScreenFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, horizontalPadding } = useResponsiveMetrics();
  const me = useAuthStore((state) => state.user);
  const feed = useFeed();
  const postUpload = usePostUploadStore();
  const businessPages = useMyBusinessPages();
  const followedBusinessPages = useFollowedBusinessPages();
  const storiesQuery = useStories();
  const notificationInbox = useNotificationInbox();
  const followingQuery = useFollowing(me?.id ?? '', Boolean(me?.id));
  const likeToggle = useLikeToggle();
  const saveToggle = useSaveToggle();
  const repostToggle = useRepostToggle();
  const deletePost = useDeletePost();
  const feedListRef = useRef<FlatList<Post> | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<Comment | null>(null);
  const [commentToolsOpen, setCommentToolsOpen] = useState<'emoji' | 'sticker' | null>(null);
  const [commentReactions, setCommentReactions] = useState<Record<string, { liked: boolean; emoji?: string; count: number }>>({});
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [storyQueueIds, setStoryQueueIds] = useState<string[]>([]);
  const [viewedStoryUserIds, setViewedStoryUserIds] = useState<Set<string>>(() => new Set());
  const [activeStoryUserId, setActiveStoryUserId] = useState<string | null>(null);
  const [activeStoryItemIndex, setActiveStoryItemIndex] = useState(0);
  const commentsQuery = usePostComments(activeCommentPostId ?? '', Boolean(activeCommentPostId));
  const addComment = useAddComment(activeCommentPostId ?? '');
  const [sessionPinnedPostId, setSessionPinnedPostId] = useState<string | null>(pinPostId ?? null);
  const [feedRefreshSeed, setFeedRefreshSeed] = useState(() => Date.now());
  const unreadNotificationCount = useMemo(
    () => (notificationInbox.data ?? []).filter((item) => !item.read_at).length,
    [notificationInbox.data],
  );
  const unreadNotificationLabel = unreadNotificationCount > 99 ? '99+' : String(unreadNotificationCount);
  const posts = useMemo(() => (feed.data?.pages.flatMap((page) => page.posts) ?? []).filter(isRenderablePost), [feed.data]);
  const pageFeedPosts = useMemo(
    () => buildPageFeedPosts(businessPages.data ?? [], followedBusinessPages.data ?? {}).filter(isRenderablePost),
    [businessPages.data, followedBusinessPages.data],
  );
  const showVerifiedBadgePromo = Boolean(me) && !me?.is_verified;
  const orderedPosts = useMemo(() => {
    const pinnedId = sessionPinnedPostId ?? pinPostId ?? null;
    const combinedPosts = [...pageFeedPosts, ...posts];
    const prioritized = (() => {
      if (!pinnedId) return combinedPosts;
      const pinned = combinedPosts.find((post) => post.id === pinnedId);
      if (!pinned) return combinedPosts;
      return [pinned, ...combinedPosts.filter((post) => post.id !== pinnedId)];
    })();
    const seen = new Set<string>();
    return prioritized.filter((post) => {
      if (!post?.id || seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }, [pageFeedPosts, pinPostId, posts, sessionPinnedPostId]);
  const shuffledPosts = useMemo(() => {
    const pinnedId = sessionPinnedPostId ?? pinPostId ?? null;
    if (pinnedId) return orderedPosts;
    return shufflePostsBySeed(orderedPosts, feedRefreshSeed);
  }, [feedRefreshSeed, orderedPosts, pinPostId, sessionPinnedPostId]);
  const feedPosts = useMemo(() => interleaveSponsoredPosts(shuffledPosts), [shuffledPosts]);
  const openHomePost = useCallback((post: Post) => {
    const opensInReels = (post.media ?? []).some(isVideoMedia);
    if (!opensInReels) {
      router.push('PostDetail', { postId: post.id });
      return;
    }

    queryClient.setQueryData<MomentFeedData>(MOMENT_QUERY_KEY, (current) => {
      if (!current) return { pages: [{ moments: [post], source: 'cache' }], pageParams: [1] };
      const withoutSelected = current.pages.map((page) => ({
        ...page,
        moments: page.moments.filter((item) => item.id !== post.id),
      }));
      const firstPage = withoutSelected[0] ?? { moments: [], source: 'cache' as const };
      return {
        ...current,
        pages: [{ ...firstPage, source: 'cache', moments: [post, ...firstPage.moments] }, ...withoutSelected.slice(1)],
      };
    });
    if (me?.id) postCacheStorage.rememberViewedMoment(me.id, post).catch(() => undefined);
    router.push('Moment', { pinPostId: post.id });
  }, [me?.id, queryClient]);
  const followingAuthorKeys = useMemo(() => {
    const keys = new Set<string>();
    (followingQuery.data ?? []).forEach((user) => {
      if (user.id) keys.add(`id:${user.id}`);
      if (user.username) keys.add(`username:${user.username.toLowerCase()}`);
    });
    return keys;
  }, [followingQuery.data]);
  const storyPosts = useMemo(() => {
    // Stories live in their own STORIES_QUERY_KEY — never mixed into the feed
    // cache so a feed refetch cannot wipe them.
    const rawStories = storiesQuery.data ?? [];
    const seen = new Set<string>();
    return rawStories.filter((item) => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);
      if (!isStoryActive(item)) return false;
      const hasText = (item.content ?? '').trim().length > 0;
      return hasRenderableMedia(item) || hasText;
    });
  }, [storiesQuery.data]);
  const storyUsers = useMemo(() => {
    // Build post-by-userId map for recency sorting
    const postByUserId = new Map<string, Post>();
    for (const post of storyPosts) {
      if (post.user?.id && !postByUserId.has(post.user.id)) {
        postByUserId.set(post.user.id, post);
      }
    }
    const seen = new Set<string>();
    // Trust all story users — /stories is server-curated (followed + self).
    // A client-side follow filter would silently drop stories from users whose
    // user objects were returned without is_following/follows_you fields.
    const users = storyPosts
      .map((item) => item.user)
      .filter((user): user is StoryUser => Boolean(user?.id))
      .filter((user) => {
        if (seen.has(user.id)) return false;
        seen.add(user.id);
        return true;
      });
    return users
      .sort((a, b) => {
        // My story always first
        if (a.id === me?.id) return -1;
        if (b.id === me?.id) return 1;
        // Then most recent story first
        const aTime = new Date(postByUserId.get(a.id)?.created_at ?? 0).getTime();
        const bTime = new Date(postByUserId.get(b.id)?.created_at ?? 0).getTime();
        return bTime - aTime;
      })
      .slice(0, STORY_POST_LIMIT);
  }, [me?.id, storyPosts]);
  const storyUsersById = useMemo(() => new Map(storyUsers.map((user) => [user.id, user])), [storyUsers]);
  const storyPostsByUserId = useMemo(() => {
    // Collect ALL story posts per user, sorted oldest→newest so they play in order.
    const map = new Map<string, Post[]>();
    storyPosts.forEach((post) => {
      const userId = post.user?.id;
      if (!userId) return;
      const existing = map.get(userId) ?? [];
      map.set(userId, [...existing, post]);
    });
    // sort each user's array oldest first
    map.forEach((posts, userId) => {
      map.set(userId, [...posts].sort((a, b) => {
        const aT = new Date(a.created_at ?? 0).getTime();
        const bT = new Date(b.created_at ?? 0).getTime();
        return aT - bT;
      }));
    });
    return map;
  }, [storyPosts]);
  const orderedStoryUsers = useMemo(() => {
    const seen = new Set<string>();
    return storyQueueIds
      .map((id) => storyUsersById.get(id))
      .filter((user): user is StoryUser => Boolean(user))
      .filter((user) => {
        if (seen.has(user.id)) return false;
        seen.add(user.id);
        return true;
      });
  }, [storyQueueIds, storyUsersById]);
  useEffect(() => {
    if (!feedPosts.length) return;
    const pinnedId = sessionPinnedPostId ?? pinPostId ?? null;
    if (pinnedId && feedPosts.some((item) => item.id === pinnedId)) {
      setActivePostId(pinnedId);
      requestAnimationFrame(() => {
        feedListRef.current?.scrollToOffset({ offset: 0, animated: false });
      });
      return;
    }
    if (!activePostId || !feedPosts.some((item) => item.id === activePostId)) {
      setActivePostId(feedPosts[0].id);
    }
  }, [activePostId, feedPosts, pinPostId, sessionPinnedPostId]);
  useEffect(() => {
    const imageUris = feedPosts
      .slice(0, 10)
      .flatMap((item) => getRenderableMedia(item))
      .filter((media) => {
        const type = `${media.type ?? media.mime_type ?? ''}`.toLowerCase();
        return !(type.includes('video') || /\.(mp4|mov|m4v|webm|avi)$/i.test(media.uri));
      })
      .flatMap((media) => [media.thumbnail_url, media.uri])
      .filter((uri): uri is string => Boolean(uri && uri.trim()));
    if (!imageUris.length) {
      return;
    }
    ExpoImage.prefetch(imageUris, 'memory-disk').catch(() => undefined);
  }, [feedPosts]);
  useEffect(() => {
    if (!me?.id || !activePostId) {
      return;
    }
    const activePost = feedPosts.find((item) => item.id === activePostId);
    if (!activePost || !isRenderablePost(activePost)) {
      return;
    }
    postCacheStorage.rememberViewedFeedPost(me.id, activePost).catch(() => undefined);
  }, [activePostId, feedPosts, me?.id]);
  useFocusEffect(
    useCallback(() => {
      setSessionPinnedPostId(pinPostId ?? null);
      if (pinPostId) {
        router.setParams({ pinPostId: undefined });
      }
      return () => {
        setSessionPinnedPostId(null);
      };
    }, [pinPostId]),
  );
  useEffect(() => {
    if (!pinPostId) return;
    setSessionPinnedPostId(pinPostId);
    router.setParams({ pinPostId: undefined });
  }, [pinPostId]);
  useEffect(() => {
    setStoryQueueIds((previousIds) => {
      const liveIds = storyUsers.map((user) => user.id);
      const current = previousIds.filter((id) => liveIds.includes(id));
      const seen = new Set(current);
      const additions = liveIds.filter((id) => !seen.has(id));
      return [...current, ...additions];
    });
  }, [storyUsers]);
  const onViewStory = useCallback((userId: string, itemIndex = 0) => {
    setViewedStoryUserIds((previous) => {
      const next = new Set(previous);
      next.add(userId);
      return next;
    });
    setStoryQueueIds((previous) => {
      const next = previous.filter((id) => id !== userId);
      next.push(userId);
      return next;
    });
    const userPosts = storyPostsByUserId.get(userId);
    if (userPosts?.length) {
      setActiveStoryUserId(userId);
      setActiveStoryItemIndex(itemIndex);
      const targetPost = userPosts[itemIndex] ?? userPosts[0];
      feedService.recordStoryView(targetPost.id).catch(() => {});
      return;
    }
    const storyUser = storyUsersById.get(userId);
    if (storyUser?.username) {
      router.push('ProfileByUsername', { username: storyUser.username });
    }
  }, [storyPostsByUserId, storyUsersById]);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems.find((item) => item.isViewable && item.item)?.item as Post | undefined;
      if (firstVisible?.id) setActivePostId(firstVisible.id);
    },
  ).current;
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 72,
    minimumViewTime: 150,
  }).current;
  const onLike = async (post: Post) => {
    await likeToggle.mutateAsync({ postId: post.id, liked: Boolean(post.user_liked) });
  };
  const onSave = async (post: Post) => {
    await saveToggle.mutateAsync(post.id);
  };
  const onRepost = async (post: Post) => {
    await repostToggle.mutateAsync({ postId: post.id, reposted: Boolean(post.user_reshared) });
  };
  const onSendComment = async () => {
    const content = commentDraft.trim();
    if (!content || !activeCommentPostId) return;
    const parentId = replyingToComment?.id;
    setCommentDraft('');
    setReplyingToComment(null);
    setCommentToolsOpen(null);
    await addComment.mutateAsync(parentId ? { content, parentId } : content);
  };

  const appendCommentToken = (token: string) => {
    setCommentDraft((current) => (current ? `${current} ${token}` : token));
  };

  const onReplyToComment = (comment: Comment) => {
    setReplyingToComment(comment);
    setCommentToolsOpen(null);
    const handle = comment.user?.username ? `@${comment.user.username} ` : '';
    setCommentDraft((current) => current || handle);
  };

  const onToggleCommentLike = (commentId: string) => {
    setCommentReactions((current) => {
      const previous = current[commentId] ?? { liked: false, count: 0 };
      const liked = !previous.liked;
      return {
        ...current,
        [commentId]: {
          ...previous,
          liked,
          count: Math.max(0, previous.count + (liked ? 1 : -1)),
        },
      };
    });
  };

  const onReactToComment = (commentId: string, emoji: string) => {
    setCommentReactions((current) => {
      const previous = current[commentId] ?? { liked: false, count: 0 };
      const isSameEmoji = previous.emoji === emoji;
      return {
        ...current,
        [commentId]: {
          ...previous,
          emoji: isSameEmoji ? undefined : emoji,
          count: Math.max(0, previous.count + (isSameEmoji ? -1 : previous.emoji ? 0 : 1)),
        },
      };
    });
  };
  const onDeletePost = async (post: Post) => {
    try {
      await deletePost.mutateAsync(post.id);
    } catch {
      Alert.alert('Delete failed', 'Unable to delete this post right now.');
    }
  };
  const onBoostPost = (post: Post) => {
    router.push('PostBoost', { postId: post.id });
  };
  const comments = commentsQuery.data ?? [];
  const rootComments = useMemo(() => comments.filter((comment) => !comment.parent_id), [comments]);
  const repliesByCommentId = useMemo(() => {
    const map = new Map<string, Comment[]>();
    comments.forEach((comment) => {
      if (!comment.parent_id) return;
      const replies = map.get(comment.parent_id) ?? [];
      replies.push(comment);
      map.set(comment.parent_id, replies);
    });
    return map;
  }, [comments]);
  const activeUserPosts = activeStoryUserId ? (storyPostsByUserId.get(activeStoryUserId) ?? []) : [];
  const activeStoryPost = activeUserPosts[activeStoryItemIndex] ?? activeUserPosts[0] ?? null;
  const activeStoryUser = activeStoryUserId ? storyUsersById.get(activeStoryUserId) ?? null : null;
  const activeStoryIndex = activeStoryUserId ? storyUsers.findIndex((item) => item.id === activeStoryUserId) : -1;
  const canGoNextItem = activeStoryItemIndex < activeUserPosts.length - 1;
  const canGoPrevItem = activeStoryItemIndex > 0;
  const onViewNextStory = useCallback(() => {
    if (activeStoryIndex < 0) return;
    // Advance within the current user's stories first
    if (canGoNextItem) {
      const nextIndex = activeStoryItemIndex + 1;
      setActiveStoryItemIndex(nextIndex);
      const nextPost = activeUserPosts[nextIndex];
      if (nextPost) feedService.recordStoryView(nextPost.id).catch(() => {});
      return;
    }
    // Move to next user
    const nextUser = storyUsers[activeStoryIndex + 1];
    if (!nextUser) {
      setActiveStoryUserId(null);
      return;
    }
    onViewStory(nextUser.id, 0);
  }, [activeStoryIndex, activeStoryItemIndex, activeUserPosts, canGoNextItem, onViewStory, storyUsers]);
  const onViewPreviousStory = useCallback(() => {
    if (activeStoryIndex < 0) return;
    // Go back within current user's stories first
    if (canGoPrevItem) {
      setActiveStoryItemIndex((prev) => prev - 1);
      return;
    }
    // Move to previous user (open at their last story)
    if (activeStoryIndex <= 0) return;
    const previousUser = storyUsers[activeStoryIndex - 1];
    if (!previousUser) return;
    const prevUserPosts = storyPostsByUserId.get(previousUser.id) ?? [];
    onViewStory(previousUser.id, Math.max(0, prevUserPosts.length - 1));
  }, [activeStoryIndex, canGoPrevItem, onViewStory, storyPostsByUserId, storyUsers]);
  return (
    <SwipeTabsView>
      <View style={styles.container}>
        <View style={[styles.pageShell, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
          <View style={[styles.topBar, { paddingTop: insets.top + 12, paddingHorizontal: horizontalPadding }]}>
            <Pressable style={styles.liveCircle} onPress={() => router.push('Moment')}>
              <Radio size={16} stroke={AppColors.white} />
              <Text style={styles.liveBadge}>LIVE</Text>
            </Pressable>
            <View style={styles.brandCenter}>
              <View style={styles.brandLogoWrap}>
                <ExpoImage source={require('@/assets/images/favicon.png')} style={styles.brandLogo} contentFit="contain" />
              </View>
              <Text style={styles.brandText}>KaraAds</Text>
            </View>
              <IconCircle onPress={() => router.push('Notifications')}>
                <Bell size={18} stroke={AppColors.white} />
                {unreadNotificationCount > 0 ? (
                  <View style={styles.notificationDot}>
                    <Text style={styles.notificationDotText}>{unreadNotificationLabel}</Text>
                  </View>
                ) : null}
              </IconCircle>
          </View>
          {postUpload.status !== 'idle' ? (
            <View style={styles.postUploadBanner}>
              <View style={styles.postUploadRow}>
                {postUpload.status === 'uploading' ? <ActivityIndicator size="small" color={AppColors.accent} /> : null}
                {postUpload.status === 'success' ? <Text style={styles.postUploadSuccess}>✓</Text> : null}
                {postUpload.status === 'error' ? <Text style={styles.postUploadError}>!</Text> : null}
                <Text style={styles.postUploadText} numberOfLines={2}>{postUpload.message}</Text>
                {postUpload.status !== 'uploading' ? <Pressable onPress={postUpload.dismiss} hitSlop={10}><X size={17} color={AppColors.textMuted} /></Pressable> : null}
              </View>
              <View style={styles.postUploadTrack}>
                <View style={[styles.postUploadFill, postUpload.status === 'error' && styles.postUploadFillError, { width: `${Math.round(postUpload.progress * 100)}%` }]} />
              </View>
            </View>
          ) : null}
          {feed.isLoading ? (
          <View style={styles.loaderBlock}>
            <Skeleton width="100%" height={420} radius={0} />
            <Skeleton width="100%" height={420} radius={0} />
          </View>
        ) : (
          <FlatList
            ref={feedListRef}
            data={feedPosts}
            keyExtractor={(item) => item.id}
            initialNumToRender={4}
            maxToRenderPerBatch={2}
            windowSize={3}
            updateCellsBatchingPeriod={80}
            removeClippedSubviews
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                <View style={[styles.feedTabs, { paddingHorizontal: horizontalPadding }]}>
                  {['Following', 'For You'].map((tab) => (
                    <Pressable key={tab} style={[styles.feedTab, tab === 'For You' ? styles.feedTabActive : null]}>
                      <Text style={[styles.feedTabText, tab === 'For You' ? styles.feedTabTextActive : null]}>{tab}</Text>
                      {tab === 'For You' ? <View style={styles.feedTabUnderline} /> : null}
                    </Pressable>
                  ))}
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.storyScroller}
                  contentContainerStyle={[styles.storiesRow, { paddingHorizontal: horizontalPadding }]}>
                  <CreateStoryCard
                    avatar={me?.avatar ?? undefined}
                    hasStory={orderedStoryUsers.some((u) => u.id === me?.id)}
                  />
                  {orderedStoryUsers.map((user, index) => {
                    const userPosts = storyPostsByUserId.get(user.id) ?? [];
                    const latestPost = userPosts[userPosts.length - 1] ?? null;
                    const previewMedia = latestPost ? getRenderableMedia(latestPost)[0] : null;
                    return (
                      <StoryCard
                        key={`${user.id}-${index}`}
                        label={user.name ?? user.username ?? 'User'}
                        avatar={user.avatar ?? undefined}
                        previewUri={previewMedia?.thumbnail_url ?? previewMedia?.uri}
                        previewText={latestPost ? getPostTextContent(latestPost) : undefined}
                        viewed={viewedStoryUserIds.has(user.id)}
                        onPress={() => onViewStory(user.id)}
                      />
                    );
                  })}
                </ScrollView>

                <View style={[styles.createPostRow, { marginHorizontal: horizontalPadding }]}>
                  <Avatar uri={me?.avatar} name={me?.name ?? 'You'} size={38} />
                  <Pressable
                    style={styles.createPostPrompt}
                    onPress={() => router.push('PostsCreate', { mode: 'post' })}>
                    <Text style={styles.createPostPromptText}>What&apos;s happening?</Text>
                  </Pressable>
                </View>
                {showVerifiedBadgePromo ? (
                  <KaraVerifiedPromoBanner horizontalPadding={horizontalPadding} />
                ) : null}
              </>
            }
            renderItem={({ item }) => (
              <HomeFeedCard
                post={item}
                isActive={isScreenFocused && activePostId === item.id && activeStoryUserId === null}
                viewerUserId={me?.id}
                followingAuthorKeys={followingAuthorKeys}
                deletingPostId={deletePost.isPending ? deletePost.variables : null}
                onLike={onLike}
                onSave={onSave}
                onRepost={onRepost}
                onDeletePost={onDeletePost}
                onBoostPost={onBoostPost}
                onComment={(post) => setActiveCommentPostId(post.id)}
                onOpenPost={openHomePost}
              />
            )}
            onEndReachedThreshold={0.4}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onEndReached={() => {
              if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
            }}
            ListEmptyComponent={<Text style={styles.empty}>No posts yet.</Text>}
            ListFooterComponent={feed.isFetchingNextPage ? <Skeleton width="100%" height={420} /> : null}
            refreshControl={
              <RefreshControl
                tintColor={AppColors.accent}
                refreshing={feed.isRefetching}
                onRefresh={() => {
                  setSessionPinnedPostId(null);
                  setFeedRefreshSeed(Date.now());
                  feed.refetch();
                }}
              />
            }
          />
        )}
        </View>
      </View>
      <Modal visible={Boolean(activeCommentPostId)} transparent animationType="slide" onRequestClose={() => setActiveCommentPostId(null)}>
        <View style={styles.sheetContainer}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setActiveCommentPostId(null)} />
        <KeyboardAvoidingView behavior="padding" style={styles.sheetAvoid}>
          <View style={[styles.sheetCard, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Comments</Text>
              <Text style={styles.sheetMeta}>{comments.length}</Text>
            </View>
            <FlatList
              data={rootComments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.commentsList}
              renderItem={({ item }) => (
                <CommentRow
                  comment={item}
                  replies={repliesByCommentId.get(item.id) ?? []}
                  reaction={commentReactions[item.id]}
                  replyReactions={commentReactions}
                  onReply={onReplyToComment}
                  onToggleLike={onToggleCommentLike}
                  onReactEmoji={onReactToComment}
                  onOpenProfile={(username) => {
                    setActiveCommentPostId(null);
                    router.push('ProfileByUsername', { username });
                  }}
                />
              )}
              ListEmptyComponent={<Text style={styles.noComments}>{commentsQuery.isFetching ? 'Loading...' : 'No comments yet.'}</Text>}
            />
            {replyingToComment ? (
              <View style={styles.replyingBar}>
                <Text style={styles.replyingText} numberOfLines={1}>
                  Replying to @{replyingToComment.user?.username ?? 'user'}
                </Text>
                <Pressable
                  onPress={() => {
                    setReplyingToComment(null);
                    setCommentDraft('');
                  }}>
                  <Text style={styles.replyingCancel}>Cancel</Text>
                </Pressable>
              </View>
            ) : null}
            {commentToolsOpen ? (
              <View style={styles.commentToolTray}>
                {(commentToolsOpen === 'emoji' ? COMMENT_EMOJIS : COMMENT_STICKERS).map((item) => (
                  <Pressable key={item} style={styles.commentToolItem} onPress={() => appendCommentToken(item)}>
                    <Text style={styles.commentToolText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <View style={styles.commentComposer}>
              <Pressable
                style={[styles.commentToolBtn, commentToolsOpen === 'emoji' ? styles.commentToolBtnActive : null]}
                onPress={() => setCommentToolsOpen((current) => (current === 'emoji' ? null : 'emoji'))}>
                <Text style={styles.commentToolBtnText}>☺</Text>
              </Pressable>
              <Pressable
                style={[styles.commentToolBtn, commentToolsOpen === 'sticker' ? styles.commentToolBtnActive : null]}
                onPress={() => setCommentToolsOpen((current) => (current === 'sticker' ? null : 'sticker'))}>
                <Text style={styles.commentToolBtnText}>★</Text>
              </Pressable>
              <TextInput
                value={commentDraft}
                onChangeText={setCommentDraft}
                style={styles.commentInput}
                placeholder={replyingToComment ? 'Write a reply...' : 'Add a comment...'}
                placeholderTextColor={AppColors.textMuted}
                multiline
              />
              <Pressable style={styles.commentSend} onPress={onSendComment} disabled={!commentDraft.trim()}>
                <Text style={styles.commentSendText}>Send</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
        </View>
      </Modal>
      <StoryViewerModal
        visible={Boolean(activeStoryPost && activeStoryUser)}
        post={activeStoryPost}
        allUserPosts={activeUserPosts}
        itemIndex={activeStoryItemIndex}
        user={activeStoryUser}
        canGoNext={canGoNextItem || (activeStoryIndex >= 0 && activeStoryIndex < storyUsers.length - 1)}
        canGoPrevious={canGoPrevItem || activeStoryIndex > 0}
        onNext={onViewNextStory}
        onPrevious={onViewPreviousStory}
        onClose={() => setActiveStoryUserId(null)}
        bottomInset={insets.bottom}
        topInset={insets.top}
        onDeleteStory={async (postId) => {
          await deletePost.mutateAsync(postId);
          // If there are more stories for this user, advance; otherwise close
          if (canGoNextItem) {
            setActiveStoryItemIndex((prev) => prev - 1 >= 0 ? prev - 1 : 0);
          } else {
            setActiveStoryUserId(null);
          }
        }}
      />
    </SwipeTabsView>
  );
}
const IconCircle = ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => (
  <Pressable style={styles.iconCircle} onPress={onPress}>
    {children}
  </Pressable>
);
const KaraVerifiedPromoBanner = ({ horizontalPadding }: { horizontalPadding: number }) => {
  const onPay = () => {
    router.push('BadgePayment');
  };

  return (
    <LinearGradient
      colors={['#102942', '#0D1728', '#07101F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.verifiedPromo, { marginHorizontal: horizontalPadding }]}>
      <View style={styles.verifiedPromoIcon}>
        <BadgeCheck size={21} color="#07111F" />
      </View>
      <View style={styles.verifiedPromoCopy}>
        <Text style={styles.verifiedPromoEyebrow}>KARA VERIFIED</Text>
        <Text style={styles.verifiedPromoTitle}>Stand out. Earn more.</Text>
        <Text style={styles.verifiedPromoText}>Get verified for ₦5,000 and earn up to 3x on qualifying videos.</Text>
      </View>
      <Pressable style={styles.verifiedPromoButton} onPress={onPay}>
        <Text style={styles.verifiedPromoButtonText}>Get badge</Text>
      </Pressable>
    </LinearGradient>
  );
};
const CreateStoryCard = ({ avatar, hasStory }: { avatar?: string; hasStory?: boolean }) => (
  <Pressable style={styles.storyCardBase} onPress={() => router.push('PostsCreate', { mode: 'story' })}>
    <View style={styles.storyBubble}>
      <Avatar uri={avatar} name="You" size={58} showRing={Boolean(hasStory)} />
      <View style={styles.storyAddBadge}>
        <Plus size={14} stroke={AppColors.white} strokeWidth={3} />
      </View>
    </View>
    <Text style={styles.storyCardLabel} numberOfLines={1}>Your story</Text>
  </Pressable>
);
const StoryCard = ({
  label,
  avatar,
  previewUri,
  previewText,
  viewed,
  onPress,
}: {
  label: string;
  avatar?: string;
  previewUri?: string;
  previewText?: string;
  viewed?: boolean;
  onPress: () => void;
}) => (
  <Pressable style={[styles.storyCardBase, viewed ? styles.storyCardSeen : null]} onPress={onPress}>
    <View style={styles.storyBubble}>
      <LinearGradient
        colors={viewed ? ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.22)'] : ['#5AB2FF', '#A855F7', '#FF6B6B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.storyBubbleRing}>
        <View style={styles.storyBubbleInner}>
          {previewUri ? (
            <View style={styles.storyBubbleMediaWrap}>
              <ExpoImage source={{ uri: previewUri }} style={styles.storyBubbleImage} contentFit="cover" />
              {previewText?.trim() ? (
                <View style={styles.storyBubbleTextOverlay}>
                  <Text style={styles.storyBubbleOverlayText} numberOfLines={2}>{previewText.trim()}</Text>
                </View>
              ) : null}
            </View>
          ) : previewText?.trim() ? (
            <LinearGradient
              colors={['#10243A', '#172141', '#2A1C4B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.storyTextThumb}>
              <Text style={styles.storyTextThumbContent} numberOfLines={3}>{previewText.trim()}</Text>
            </LinearGradient>
          ) : (
            <Avatar uri={avatar} name={label} size={58} />
          )}
        </View>
      </LinearGradient>
    </View>
    <Text style={styles.storyCardLabel} numberOfLines={1}>{label}</Text>
  </Pressable>
);

const LiveCreatorChip = ({ creator, onPress }: { creator: LiveCreator; onPress: () => void }) => (
  <Pressable style={styles.liveCreatorChip} onPress={onPress}>
    <View style={styles.liveCreatorPreview}>
      {creator.previewUri ? (
        <ExpoImage source={{ uri: creator.previewUri }} style={styles.liveCreatorImage} contentFit="cover" cachePolicy="memory-disk" />
      ) : (
        <Avatar uri={creator.user.avatar} name={creator.user.name ?? creator.user.username ?? 'Live'} size={48} />
      )}
      <View style={styles.liveCreatorBadge}>
        <Text style={styles.liveCreatorBadgeText}>ROOM</Text>
      </View>
    </View>
    <Text style={styles.liveCreatorName} numberOfLines={1}>
      {creator.user.name ?? creator.user.username ?? 'Live'}
    </Text>
  </Pressable>
);

const LiveViewerModal = ({
  visible,
  creator,
  topInset,
  bottomInset,
  onClose,
}: {
  visible: boolean;
  creator: LiveCreator | null;
  topInset: number;
  bottomInset: number;
  onClose: () => void;
}) => {
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!visible) setMessage('');
  }, [visible]);
  if (!creator) return null;
  const name = creator.user.name ?? creator.user.username ?? 'Creator';
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.liveViewerScreen}>
        {creator.previewUri ? (
          <ExpoImage source={{ uri: creator.previewUri }} style={styles.liveViewerBackground} contentFit="cover" cachePolicy="memory-disk" />
        ) : (
          <LinearGradient colors={['#082033', '#0B1020', '#21103C']} style={styles.liveViewerBackground} />
        )}
        <LinearGradient colors={['rgba(0,0,0,0.72)', 'transparent', 'rgba(0,0,0,0.86)']} style={StyleSheet.absoluteFill} />
        <View style={[styles.liveViewerTop, { paddingTop: topInset + 12 }]}>
          <Pressable style={styles.liveViewerClose} onPress={onClose}>
            <X size={20} stroke={AppColors.white} />
          </Pressable>
          <View style={styles.liveViewerHost}>
            <Avatar uri={creator.user.avatar} name={name} size={34} showRing />
            <View style={styles.liveViewerHostText}>
              <Text style={styles.liveViewerName} numberOfLines={1}>{name}</Text>
              <Text style={styles.liveViewerMeta}>{formatCompact(creator.viewers)} watching</Text>
            </View>
          </View>
          <View style={styles.liveViewerLivePill}>
            <Text style={styles.liveViewerLiveText}>ROOM</Text>
          </View>
        </View>
        <View style={styles.liveViewerCenter}>
          <Text style={styles.liveViewerTitle} numberOfLines={2}>{creator.title}</Text>
          <Text style={styles.liveViewerSubtitle}>KaraAds room</Text>
        </View>
        <View style={styles.liveViewerRail}>
          <Pressable style={styles.liveViewerRailBtn}>
            <Heart size={25} stroke={AppColors.white} fill="rgba(255,255,255,0.18)" />
          </Pressable>
          <Pressable style={styles.liveViewerRailBtn}>
            <Share2 size={24} stroke={AppColors.white} />
          </Pressable>
        </View>
        <View style={[styles.liveViewerBottom, { paddingBottom: Math.max(bottomInset, 18) }]}>
          <View style={styles.liveCommentStack}>
            <Text style={styles.liveComment}><Text style={styles.liveCommentName}>KaraAds</Text> Welcome to this room</Text>
            <Text style={styles.liveComment}><Text style={styles.liveCommentName}>{name}</Text> started a session</Text>
          </View>
          <View style={styles.liveComposer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              style={styles.liveInput}
              placeholder="Add a comment..."
              placeholderTextColor="rgba(255,255,255,0.58)"
            />
            <Pressable style={styles.liveSendBtn} onPress={() => setMessage('')}>
              <Send size={18} stroke={AppColors.white} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const StoryViewerModal = ({
  visible,
  post,
  allUserPosts,
  itemIndex,
  user,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  onClose,
  onDeleteStory,
  bottomInset,
  topInset,
}: {
  visible: boolean;
  post: Post | null;
  allUserPosts: Post[];
  itemIndex: number;
  user: StoryUser | null;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onDeleteStory?: (postId: string) => void;
  /** Pre-computed safe-area bottom from the parent screen (reliable on Android inside Modals) */
  bottomInset: number;
  /** Pre-computed safe-area top from the parent screen */
  topInset: number;
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const me = useAuthStore((state) => state.user);
  const isMine = Boolean(me?.id && user?.id && me.id === user.id);
  // Use bottomInset from parent (useSafeAreaInsets inside a transparent Modal
  // returns 0 on Android — the parent's value is always correct).
  const safeBottom = Math.max(bottomInset, Platform.OS === 'android' ? 48 : 20);
  const [progress, setProgress] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const [replyFocused, setReplyFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => {
        // Use screenY-based calculation to include the suggestion/autocomplete bar
        // on Android keyboards that report height excluding that row
        const fromScreenTop = e.endCoordinates.screenY;
        const totalFromBottom = screenHeight - fromScreenTop;
        setKeyboardHeight(totalFromBottom);
      });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);
  useEffect(() => {
    if (!visible) setKeyboardHeight(0);
  }, [visible]);
  const media = post ? getRenderableMedia(post)[0] : null;
  const uri = media?.uri ?? '';
  const thumbnailUri = media?.thumbnail_url ?? null;
  const type = `${media?.type ?? media?.mime_type ?? ''}`.toLowerCase();
  const isVideo = Boolean(uri) && (type.includes('video') || /\.(mp4|mov|m4v|webm|avi)$/i.test(uri));
  const totalSegments = Math.max(1, allUserPosts.length);
  // Stable player — never recreated, source is replaced to avoid 'shared object released' crash
  const player = useVideoPlayer(null, (instance) => {
    instance.loop = true;
    instance.muted = false;
    instance.pause();
  });
  useEffect(() => {
    if (!isVideo || !uri || !visible) {
      try {
        player.pause();
        player.replace(null);
      } catch {
        // player may already be releasing
      }
      return;
    }
    try {
      player.replace({ uri });
    } catch {
      // player may be in a releasing state, ignore
    }
  }, [uri, isVideo, player, visible]);
  useEffect(() => {
    if (!isVideo) return;
    try {
      if (visible) player.play();
      else player.pause();
    } catch {
      // player may be in a releasing state, ignore
    }
  }, [isVideo, player, visible]);
  useEffect(() => {
    if (!visible || !post) {
      setProgress(0);
      return;
    }
    setProgress(0);
    const startedAt = Date.now();
    // Pause auto-advance while the reply input is focused
    if (replyFocused) return;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const ratio = Math.min(1, elapsed / STORY_VIEW_DURATION_MS);
      setProgress(ratio);
      if (ratio >= 1) {
        clearInterval(timer);
        if (canGoNext) onNext();
        else onClose();
      }
    }, 50);
    return () => clearInterval(timer);
  }, [canGoNext, onClose, onNext, post, replyFocused, visible]);
  if (!post || !user) return null;
  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      {/* Explicit screen dims guarantee full coverage on Android transparent modals */}
      <View style={[styles.storyViewerScreen, { width: screenWidth, height: screenHeight }]}>
        {/* ── Full-bleed media background ── */}
        {uri ? (
          <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
            {/* Blurred background fill — eliminates black letterbox bars */}
            {isVideo ? (
              thumbnailUri ? (
                <ExpoImage source={{ uri: thumbnailUri }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={20} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />
              )
            ) : (
              <ExpoImage source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={20} />
            )}
            {/* Dark scrim over the blurred background */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.50)' }]} />
            {/* Sharp foreground at correct aspect ratio */}
            {isVideo ? (
              <VideoView style={StyleSheet.absoluteFill} player={player} nativeControls={false} contentFit="contain" />
            ) : (
              <ExpoImage source={{ uri }} style={StyleSheet.absoluteFill} contentFit="contain" />
            )}
          </View>
        ) : (
          // Text-only story: gradient background with content centered.
          // Caption overlay is suppressed — text is already fully shown here.
          <LinearGradient
            colors={['#0D1B3E', '#0A1528', '#060C1A']}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.storyViewerTextOnly]}
          >
            <Text style={styles.storyViewerTextOnlyContent}>{post.content?.trim() || 'Status update'}</Text>
          </LinearGradient>
        )}
        {/* ── Gradient shades top + bottom ── */}
        <LinearGradient
          colors={['rgba(0,0,0,0.60)', 'transparent']}
          style={[StyleSheet.absoluteFill, { bottom: '70%' }]}
          pointerEvents="none"
        />
        {/* Deeper bottom scrim so long caption text is always legible */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.88)']}
          style={[StyleSheet.absoluteFill, { top: '35%' }]}
          pointerEvents="none"
        />
        {/* ── Tap zones (only cover the middle section, not top/bottom chrome) ── */}
        <View style={[StyleSheet.absoluteFill, { flexDirection: 'row', top: topInset + 80, bottom: (isMine ? safeBottom : SV_BOTTOM_BAR_HEIGHT + safeBottom), zIndex: 1 }]}>
          <Pressable style={{ flex: 1 }} onPress={() => (canGoPrevious ? onPrevious() : undefined)} />
          <Pressable style={{ flex: 1 }} onPress={() => (canGoNext ? onNext() : onClose())} />
        </View>
        {/* ── Top chrome: segments + header ── */}
        <View style={[styles.storyViewerTop, { paddingTop: topInset + 8 }]}>
          <View style={styles.storyViewerSegments}>
            {Array.from({ length: totalSegments }).map((_, i) => {
              const fill = i < itemIndex ? 1 : i === itemIndex ? progress : 0;
              return (
                <View key={i} style={[styles.storyViewerSegmentTrack, { flex: 1 }]}>
                  <LinearGradient
                    colors={AppGradients.primary as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.storyViewerSegmentFill, { width: `${Math.max(0, Math.min(100, fill * 100))}%` }]}
                  />
                </View>
              );
            })}
          </View>
          <View style={styles.storyViewerHeader}>
            <View style={styles.storyViewerAuthor}>
              <Avatar uri={user.avatar ?? undefined} name={user.name} size={38} />
              <View>
                <Text style={styles.storyViewerAuthorText}>{user.name}</Text>
                <Text style={styles.storyViewerAuthorTime}>{formatPostTime(post.created_at)}</Text>
              </View>
            </View>
            <View style={styles.storyViewerHeaderActions}>
              <Pressable style={styles.storyViewerIconBtn} onPress={() => setOptionsOpen(true)}>
                <Ellipsis size={20} stroke={AppColors.white} />
              </Pressable>
              <Pressable style={styles.storyViewerIconBtn} onPress={onClose}>
                <X size={22} stroke={AppColors.white} />
              </Pressable>
            </View>
          </View>
        </View>
        {/* ── Caption overlay — only for stories with media; text-only stories
             already display content in the full-screen text background above ── */}
        {uri && post.content?.trim() ? (
          <View style={[
            styles.storyViewerContentWrap,
            {
              bottom: isMine ? safeBottom : SV_BOTTOM_BAR_HEIGHT + safeBottom + 8,
              maxHeight: '42%',
              zIndex: 4,
            },
          ]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              scrollEnabled
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.storyViewerContent}>{post.content.trim()}</Text>
            </ScrollView>
          </View>
        ) : null}
        {/* ── Bottom bar: reactions + message (other people's stories only) ── */}
        {!isMine ? (
          <SafeAreaView edges={keyboardHeight > 0 ? [] : ['bottom']} style={[styles.svBottom, { bottom: keyboardHeight > 0 ? keyboardHeight + 8 : 0 }]}>
            <View style={styles.svReactionsRow}>
              {(['❤️', '😂', '😮', '😢', '👏', '😍'] as const).map((emoji) => (
                <Pressable
                  key={emoji}
                  style={({ pressed }) => [styles.svEmojiBtn, pressed ? styles.svEmojiBtnPressed : null]}
                  onPress={() => {
                    feedService.reactToStory(post.id, emoji).catch(() => {});
                    // Also send the emoji as a story reply message
                    messagesService.createConversation([user.id])
                      .then((convo) => messagesService.sendMessage(convo.id, emoji))
                      .catch(() => {});
                  }}
                  hitSlop={6}
                >
                  <Text style={styles.svEmojiText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.svInputRow}>
              {replySent ? (
                <View style={[styles.svInput, styles.svInputSent]}>
                  <Text style={styles.svInputSentText}>Message sent ✔</Text>
                </View>
              ) : (
                <TextInput
                  style={[styles.svInput, styles.svInputActive]}
                  placeholder={`Reply to ${user.name?.split(' ')[0] ?? 'story'}...`}
                  placeholderTextColor="rgba(255,255,255,0.50)"
                  value={replyText}
                  onChangeText={setReplyText}
                  onFocus={() => setReplyFocused(true)}
                  onBlur={() => setReplyFocused(false)}
                  returnKeyType="send"
                  blurOnSubmit={false}
                  multiline={false}
                  onSubmitEditing={async () => {
                    const text = replyText.trim();
                    if (!text || replySending) return;
                    setReplySending(true);
                    try {
                      const convo = await messagesService.createConversation([user.id]);
                      await messagesService.sendMessage(convo.id, text);
                      setReplyText('');
                      setReplySent(true);
                      setReplyFocused(false);
                      setTimeout(() => setReplySent(false), 2500);
                    } catch {
                      // silent fail — stay on story
                    } finally {
                      setReplySending(false);
                    }
                  }}
                />
              )}
              <Pressable
                style={[styles.svSendBtn, (!replyText.trim() || replySending) && styles.svSendBtnDisabled]}
                disabled={!replyText.trim() || replySending}
                onPress={async () => {
                  const text = replyText.trim();
                  if (!text || replySending) return;
                  setReplySending(true);
                  try {
                    const convo = await messagesService.createConversation([user.id]);
                    await messagesService.sendMessage(convo.id, text);
                    setReplyText('');
                    setReplySent(true);
                    setReplyFocused(false);
                    setTimeout(() => setReplySent(false), 2500);
                  } catch {
                    // silent fail
                  } finally {
                    setReplySending(false);
                  }
                }}>
                <Send size={18} stroke={AppColors.white} />
              </Pressable>
            </View>
          </SafeAreaView>
        ) : null}
        {/* ── Story options bottom sheet ── */}
        <Modal visible={optionsOpen} transparent animationType="slide" onRequestClose={() => setOptionsOpen(false)}>
          <View style={styles.svOptionsBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setOptionsOpen(false)} />
            <View style={[styles.svOptionsSheet, { paddingBottom: Math.max(safeBottom, 20) }]}>
              {/* Handle */}
              <View style={styles.svOptionsHandle} />
              {isMine ? (
                <>
                  <Text style={styles.svOptionsTitle}>Your Story</Text>
                  <Pressable
                    style={[styles.svOptionsItem, styles.svOptionsItemDanger]}
                    onPress={() => {
                      setOptionsOpen(false);
                      onDeleteStory?.(post.id);
                    }}
                  >
                    <View style={styles.svOptionsIcon}>
                      <X size={18} stroke="#F87171" />
                    </View>
                    <View style={styles.svOptionsTextWrap}>
                      <Text style={styles.svOptionsItemDangerText}>Delete story</Text>
                      <Text style={styles.svOptionsMeta}>This status will be removed immediately.</Text>
                    </View>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.svOptionsTitle}>{user.name}</Text>
                  <Pressable
                    style={[styles.svOptionsItem, styles.svOptionsItemDanger]}
                    onPress={() => {
                      setOptionsOpen(false);
                      feedService.reportPost(post.id, 'other')
                        .then(() => Alert.alert('Reported', 'Thank you for your report.'))
                        .catch(() => Alert.alert('Error', 'Unable to submit report right now.'));
                    }}
                  >
                    <View style={styles.svOptionsIcon}>
                      <Ellipsis size={18} stroke="#F87171" />
                    </View>
                    <View style={styles.svOptionsTextWrap}>
                      <Text style={styles.svOptionsItemDangerText}>Report this story</Text>
                      <Text style={styles.svOptionsMeta}>Help us understand what is wrong.</Text>
                    </View>
                  </Pressable>
                </>
              )}
              <Pressable style={styles.svOptionsCancel} onPress={() => setOptionsOpen(false)}>
                <Text style={styles.svOptionsCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};
const getRenderableMedia = (post: Post): RenderableMedia[] => {
  const displayPost = getDisplayPost(post);
  return (displayPost.media ?? [])
    .map((media, index) => {
      const uri = media.url ?? media.path;
      if (!uri || !uri.trim()) return null;
      return {
        ...media,
        uri,
        mediaKey: media.id ?? `${displayPost.id}-${index}`,
      };
    })
    .filter((media): media is RenderableMedia => Boolean(media));
};
const HomeFeedCard = ({
  post,
  isActive,
  onLike,
  onSave,
  onComment,
  onRepost,
  onDeletePost,
  onBoostPost,
  onOpenPost,
  viewerUserId,
  followingAuthorKeys,
  deletingPostId,
}: {
  post: Post;
  isActive: boolean;
  viewerUserId?: string;
  followingAuthorKeys?: Set<string>;
  deletingPostId: string | null;
  onLike: (post: Post) => void;
  onSave: (post: Post) => void;
  onComment: (post: Post) => void;
  onRepost: (post: Post) => void;
  onDeletePost: (post: Post) => Promise<void>;
  onBoostPost: (post: Post) => void;
  onOpenPost: (post: Post) => void;
}) => {
  const followToggle = useFollowToggle();
  const followPage = useFollowBusinessPage();
  const displayPost = useMemo(() => getDisplayPost(post), [post]);
  const pageMeta = pagePostMeta(post);
  const mediaItems = useMemo(() => getRenderableMedia(post), [post]);
  const isSponsored = (post.type ?? '').toLowerCase() === 'ad';
  const isSharedPost = Boolean(post.original_post);
  const actualCaptionText = useMemo(() => getPostTextContent(post), [post]);
  const isOwner = !pageMeta && Boolean(post.user?.id && viewerUserId && post.user.id === viewerUserId);
  const relation = getFollowRelation(post.user);
  const isAuthorInFollowingList = Boolean(
    (post.user?.id && followingAuthorKeys?.has(`id:${post.user.id}`)) ||
      (post.user?.username && followingAuthorKeys?.has(`username:${post.user.username.toLowerCase()}`)),
  );
  const canBoost = isOwner && (post.type ?? 'post').toLowerCase() === 'post';
  const fixedPostReward = useMemo(() => getFixedPostReward(displayPost), [displayPost]);
  const showPostEarning = isOwner && fixedPostReward.qualifies;
  const isDeleting = deletingPostId === post.id;
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(relation.isFollowing || isAuthorInFollowingList);
  const [isFollowingPage, setIsFollowingPage] = useState(Boolean(pageMeta?.is_following));
  const [followsYouAuthor, setFollowsYouAuthor] = useState(relation.followsYou);
  const [followedAuthorLocally, setFollowedAuthorLocally] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const postTimestamp = useMemo(() => formatPostTime(post.created_at), [post.created_at]);
  const authorIsVerified = Boolean(post.user?.is_verified);
  const authorIsOnline = Boolean(post.user?.is_online);
  const captionText = useMemo(() => {
    const ownContent = post.content?.trim();
    if (ownContent) return ownContent;
    const originalContent = displayPost.content?.trim();
    if (originalContent) return originalContent;
    return isSharedPost ? 'Shared a post' : '';
  }, [displayPost.content, isSharedPost, post.content]);
  const sponsoredLink = useMemo(() => {
    const match = captionText.match(/https?:\/\/\S+/i);
    return match?.[0] ?? null;
  }, [captionText]);
  const shareUrl = sponsoredLink ?? `https://karaads.app/post/${post.id}`;
  const shareMessage = useMemo(() => {
    const author = post.user?.username ? `@${post.user.username}` : (post.user?.name ?? 'KaraAds');
    return [captionText || 'Check out this post on KaraAds', author, shareUrl].filter(Boolean).join('\n\n');
  }, [captionText, post.user?.name, post.user?.username, shareUrl]);
  const hasVisibleBody = mediaItems.length > 0 || actualCaptionText.length > 0;
  const showFollowingAuthor = isFollowingAuthor || followedAuthorLocally || isAuthorInFollowingList;
  const showFollowingPage = isFollowingPage || Boolean(pageMeta?.is_following);
  useEffect(() => {
    const next = getFollowRelation(post.user);
    if (next.isFollowing || isAuthorInFollowingList) {
      setFollowedAuthorLocally(true);
      setIsFollowingAuthor(true);
    } else if (!followedAuthorLocally) {
      setIsFollowingAuthor(false);
    }
    setFollowsYouAuthor(next.followsYou);
  }, [followedAuthorLocally, isAuthorInFollowingList, post.id, post.user]);
  useEffect(() => {
    setIsFollowingPage(Boolean(pageMeta?.is_following));
  }, [pageMeta?.id, pageMeta?.is_following]);
  if (!hasVisibleBody) {
    return null;
  }
  const onFollowAuthor = () => {
    if (!post.user?.id || followToggle.isPending) return;
    const previous = showFollowingAuthor;
    const next = !previous;
    setIsFollowingAuthor(next);
    setFollowedAuthorLocally(next);
    followToggle.mutate(
      { userId: post.user.id, isFollowing: previous },
      {
        onError: () => {
          setFollowedAuthorLocally(previous);
          setIsFollowingAuthor(previous);
        },
        onSuccess: () => {
          setFollowedAuthorLocally(next);
          setIsFollowingAuthor(next);
        },
      },
    );
  };

  const onFollowPage = () => {
    if (!pageMeta?.id || followPage.isPending) return;
    const previous = showFollowingPage;
    const next = !previous;
    setIsFollowingPage(next);
    followPage.mutate(
      { pageId: pageMeta.id, isFollowing: previous },
      {
        onError: () => setIsFollowingPage(previous),
        onSuccess: (isFollowing) => setIsFollowingPage(isFollowing),
      },
    );
  };

  const onShareOutsideApp = async () => {
    try {
      await Share.share({
        title: 'KaraAds',
        message: shareMessage,
        url: shareUrl,
      });
    } catch {
      Alert.alert('Share failed', 'Unable to open sharing options right now.');
    }
  };

  const openShareUrl = async (url: string, fallbackUrl?: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      await Linking.openURL(canOpen ? url : (fallbackUrl ?? url));
      setShareOpen(false);
    } catch {
      if (fallbackUrl) {
        Linking.openURL(fallbackUrl)
          .then(() => setShareOpen(false))
          .catch(() => Alert.alert('Share failed', 'Unable to open that app right now.'));
        return;
      }
      Alert.alert('Share failed', 'Unable to open that app right now.');
    }
  };

  const onCopyShareLink = async () => {
    await Clipboard.setStringAsync(shareUrl);
    setShareOpen(false);
    Alert.alert('Copied', 'Post link copied to clipboard.');
  };

  const onEditPost = () => {
    setMenuOpen(false);
    setTimeout(() => {
      router.push('PostsCreate', {
        mode: 'post',
        editPostId: post.id,
        content: post.content ?? displayPost.content ?? '',
        visibility: post.visibility ?? 'everyone',
      });
    }, 0);
  };

  return (
    <View style={styles.postStage}>
      <View style={styles.postCard}>
        <View style={styles.instagramPostHeader}>
          <Pressable
            style={styles.instagramAuthor}
            onPress={() => {
              if (pageMeta) {
                router.push('Business');
                return;
              }
              const username = post.user?.username;
              if (username) router.push('ProfileByUsername', { username });
            }}>
            <Avatar uri={pageMeta?.avatar ?? post.user?.avatar} name={pageMeta?.name ?? post.user?.name} size={40} showRing />
            <View style={styles.instagramAuthorCopy}>
              <View style={styles.instagramAuthorNameRow}>
                <Text style={styles.instagramAuthorName} numberOfLines={1}>
                  {pageMeta?.name ?? post.user?.username ?? post.user?.name ?? 'user'}
                </Text>
                {pageMeta ? <Text style={styles.pagePostBadge}>Page</Text> : authorIsVerified ? <VerifiedBadge size={14} /> : null}
              </View>
              <Text style={styles.instagramPostMeta} numberOfLines={1}>
                {isSponsored
                  ? `Sponsored · ${formatCompact(post.view_count)} views`
                  : `${postTimestamp} · ${formatCompact(post.view_count)} views${authorIsOnline ? ' · Online' : ''}`}
              </Text>
            </View>
          </Pressable>
          <View style={styles.instagramHeaderActions}>
            {pageMeta ? (
              <Pressable style={[styles.instagramFollowButton, showFollowingPage && styles.followingBtn]} onPress={onFollowPage} disabled={followPage.isPending}>
                <Text style={[styles.instagramFollowText, showFollowingPage && styles.followingBtnText]}>{showFollowingPage ? 'Following' : 'Follow'}</Text>
              </Pressable>
            ) : !isSponsored && !isOwner && post.user?.id ? (
              <Pressable style={[styles.instagramFollowButton, showFollowingAuthor && styles.followingBtn]} onPress={onFollowAuthor} disabled={followToggle.isPending}>
                <Text style={[styles.instagramFollowText, showFollowingAuthor && styles.followingBtnText]}>{showFollowingAuthor ? 'Following' : 'Follow'}</Text>
              </Pressable>
            ) : null}
            {isOwner ? (
              <Pressable style={styles.instagramMenuButton} onPress={() => setMenuOpen(true)} hitSlop={8}>
                <Ellipsis size={22} stroke={AppColors.white} />
              </Pressable>
            ) : null}
          </View>
        </View>
        {captionText && mediaItems[0] ? (
          <Text style={styles.facebookCaption} numberOfLines={5}>{captionText}</Text>
        ) : null}
        <Pressable style={styles.instagramMedia} onPress={() => onOpenPost(post)}>
        {mediaItems[0] ? (
          <AdaptivePostMedia media={mediaItems[0]} isActive={isActive} variant="instagram" />
        ) : (
          <LinearGradient colors={['#13213A', '#08101E']} style={styles.textOnlyPost}>
            <Text style={styles.textOnlyPostText}>{actualCaptionText}</Text>
          </LinearGradient>
        )}
        </Pressable>
        <View style={styles.facebookEngagementRow}>
          <View style={styles.facebookReactionCount}>
            <View style={styles.facebookReactionIcon}><ThumbsUp size={11} color={AppColors.white} fill={AppColors.white} /></View>
            <Text style={styles.facebookEngagementText}>{formatCompact(post.like_count)}</Text>
          </View>
          <Pressable onPress={() => onComment(post)}><Text style={styles.facebookEngagementText}>{formatCompact(post.comment_count)} comments · {formatCompact(post.repost_count)} shares</Text></Pressable>
        </View>
        <View style={styles.facebookActionBar}>
          <Pressable style={styles.facebookAction} onPress={() => onLike(post)}>
            <ThumbsUp size={20} stroke={post.user_liked ? '#4599FF' : AppColors.textSecondary} fill={post.user_liked ? '#4599FF' : 'transparent'} />
            <Text style={[styles.facebookActionText, post.user_liked && styles.facebookActionTextActive]}>Like</Text>
          </Pressable>
          <Pressable style={styles.facebookAction} onPress={() => onComment(post)}>
            <MessageCircle size={20} stroke={AppColors.textSecondary} />
            <Text style={styles.facebookActionText}>Comment</Text>
          </Pressable>
          <Pressable style={styles.facebookAction} onPress={() => setShareOpen(true)}>
            <Share2 size={20} stroke={AppColors.textSecondary} />
            <Text style={styles.facebookActionText}>Share</Text>
          </Pressable>
          <Pressable style={styles.facebookAction} onPress={() => onSave(post)}>
            <Bookmark size={19} stroke={post.user_saved ? '#4599FF' : AppColors.textSecondary} fill={post.user_saved ? '#4599FF' : 'transparent'} />
            <Text style={[styles.facebookActionText, post.user_saved && styles.facebookActionTextActive]}>Save</Text>
          </Pressable>
        </View>
        {(showPostEarning || canBoost) ? (
          <View style={styles.facebookOwnerTools}>
            {showPostEarning ? (
              <View style={styles.postEarnPill}><Coins size={12} color="#06101E" /><Text style={styles.postEarnText}>{formatPostMoney(fixedPostReward.amount, post.earning_currency)}</Text></View>
            ) : null}
            {canBoost ? (
              <Pressable style={styles.instagramBoostButton} onPress={() => onBoostPost(post)}><Rocket size={13} stroke={AppColors.accent} /><Text style={styles.instagramBoostText}>Boost</Text></Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
      <AllMediaModal
        visible={showAllMedia}
        mediaItems={mediaItems}
        onClose={() => setShowAllMedia(false)}
      />
      <Modal visible={shareOpen} transparent animationType="fade" onRequestClose={() => setShareOpen(false)}>
        <View style={styles.shareModalScreen}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShareOpen(false)} />
          <View style={styles.shareSheet}>
            <View style={styles.shareSheetHandle} />
            <Text style={styles.shareSheetTitle}>Share post</Text>
            <View style={styles.shareGrid}>
              <ShareOption
                label="Friend"
                icon={<MessageCircle size={21} stroke={AppColors.white} />}
                onPress={() => {
                  setShareOpen(false);
                  router.push('MessagesCompose');
                }}
              />
              <ShareOption
                label="Email"
                icon={<Mail size={21} stroke={AppColors.white} />}
                onPress={() => openShareUrl(`mailto:?subject=${encodeURIComponent('KaraAds post')}&body=${encodeURIComponent(shareMessage)}`)}
              />
              <ShareOption
                label="WhatsApp"
                icon={<FontAwesome6 name="whatsapp" size={22} color={AppColors.white} />}
                onPress={() => openShareUrl(`whatsapp://send?text=${encodeURIComponent(shareMessage)}`, `https://wa.me/?text=${encodeURIComponent(shareMessage)}`)}
              />
              <ShareOption
                label="Facebook"
                icon={<FontAwesome6 name="facebook-f" size={21} color={AppColors.white} />}
                onPress={() => openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
              />
              <ShareOption
                label="X"
                icon={<FontAwesome6 name="x-twitter" size={20} color={AppColors.white} />}
                onPress={() => openShareUrl(`twitter://post?message=${encodeURIComponent(shareMessage)}`, `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`)}
              />
              <ShareOption
                label="TikTok"
                icon={<FontAwesome6 name="tiktok" size={21} color={AppColors.white} />}
                onPress={() => openShareUrl('tiktok://', 'https://www.tiktok.com/')}
              />
              <ShareOption
                label="Instagram"
                icon={<FontAwesome6 name="instagram" size={22} color={AppColors.white} />}
                onPress={() => openShareUrl('instagram://app', 'https://www.instagram.com/')}
              />
              <ShareOption
                label="Copy"
                icon={<Copy size={21} stroke={AppColors.white} />}
                onPress={onCopyShareLink}
              />
              <ShareOption
                label="More"
                icon={<Share2 size={21} stroke={AppColors.white} />}
                onPress={() => {
                  setShareOpen(false);
                  onShareOutsideApp();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.menuBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />
          <View style={styles.postMenuCard}>
            <Pressable style={styles.postMenuItem} onPress={onEditPost}>
              <Pencil size={17} stroke={AppColors.white} />
              <Text style={styles.postMenuText}>Edit post</Text>
            </Pressable>
            <Pressable
              style={[styles.postMenuItem, styles.postMenuDanger]}
              disabled={isDeleting}
              onPress={() => {
                setMenuOpen(false);
                Alert.alert('Delete post', 'Are you sure you want to delete this post?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      onDeletePost(post).catch(() => undefined);
                    },
                  },
                ]);
              }}>
              <Text style={styles.postMenuDangerText}>{isDeleting ? 'Deleting...' : 'Delete post'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ShareOption = ({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress: () => void }) => (
  <Pressable style={styles.shareOption} onPress={onPress}>
    <View style={styles.shareOptionIcon}>{icon}</View>
    <Text style={styles.shareOptionText} numberOfLines={1}>{label}</Text>
  </Pressable>
);

const ExpandableCaption = ({ content, onOpenPost }: { content: string; onOpenPost: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > CAPTION_TRIM_LENGTH;
  const truncated = isLong ? `${content.slice(0, CAPTION_TRIM_LENGTH).trimEnd()}...` : content;
  return (
    <Pressable style={styles.captionWrap} onPress={onOpenPost}>
      <Text style={styles.caption}>
        {expanded || !isLong ? content : truncated}{' '}
        {!expanded && isLong ? (
          <Text style={styles.captionMore} onPress={() => setExpanded(true)}>
            see more
          </Text>
        ) : null}
      </Text>
    </Pressable>
  );
};
const PostMediaGrid = ({
  mediaItems,
  isActive,
  onOpenPost,
  onSeeAllMedia,
}: {
  mediaItems: RenderableMedia[];
  isActive: boolean;
  onOpenPost: () => void;
  onSeeAllMedia: () => void;
}) => {
  if (!mediaItems.length) return null;
  const total = mediaItems.length;
  const shown = total > 5 ? mediaItems.slice(0, 5) : mediaItems;
  if (shown.length === 1) {
    return (
      <Pressable onPress={onOpenPost} style={styles.mediaSingleWrap}>
        <AdaptivePostMedia media={shown[0]} isActive={isActive} variant="single" />
      </Pressable>
    );
  }
  const firstRow = shown.slice(0, 2);
  const secondRow = shown.slice(2, 4);
  const fifth = shown[4];
  const showSeeAllTile = Boolean(total > 5 && fifth);
  return (
    <View style={styles.mediaGridWrap}>
      <View style={styles.mediaGridRow}>
        {firstRow.map((media, index) => (
          <MediaTile key={`${media.mediaKey}-${index}`} media={media} isActive={isActive && index === 0} onPress={onOpenPost} />
        ))}
      </View>
      {secondRow.length ? (
        <View style={styles.mediaGridRow}>
          {secondRow.map((media, index) => (
            <MediaTile key={`${media.mediaKey}-${index}`} media={media} isActive={false} onPress={onOpenPost} />
          ))}
        </View>
      ) : null}
      {fifth ? (
        <Pressable onPress={showSeeAllTile ? onSeeAllMedia : onOpenPost} style={styles.mediaFifthTile}>
          <AdaptivePostMedia media={fifth} isActive={false} variant="grid" />
          {showSeeAllTile ? (
            <View style={styles.mediaOverlay}>
              <Text style={styles.mediaOverlayText}>See all +{total - 4}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
};
const MediaTile = ({ media, isActive, onPress }: { media: RenderableMedia; isActive: boolean; onPress: () => void }) => (
  <Pressable style={styles.mediaGridItem} onPress={onPress}>
    <AdaptivePostMedia media={media} isActive={isActive} variant="grid" />
  </Pressable>
);
const AllMediaModal = ({ visible, mediaItems, onClose }: { visible: boolean; mediaItems: RenderableMedia[]; onClose: () => void }) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={styles.mediaModalScreen}>
      <View style={styles.mediaModalHeader}>
        <Pressable style={styles.mediaModalClose} onPress={onClose}>
          <Text style={styles.mediaModalCloseText}>Back</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.mediaModalList}>
        {mediaItems.map((media, index) => (
          <View key={`${media.mediaKey}-${index}`} style={styles.mediaModalItem}>
            <AdaptivePostMedia media={media} isActive={true} variant="modal" />
          </View>
        ))}
      </ScrollView>
    </View>
  </Modal>
);
const AdaptivePostMedia = ({
  media,
  isActive,
  variant = 'single',
}: {
  media: RenderableMedia;
  isActive: boolean;
  variant?: 'single' | 'grid' | 'modal' | 'immersive' | 'instagram';
}) => {
  const { height: viewportHeight } = useWindowDimensions();
  const [aspectRatio, setAspectRatio] = useState(1);
  const [imageReady, setImageReady] = useState(false);
  const canToggleAudio = variant !== 'grid';
  const [isMuted, setIsMuted] = useState(variant === 'grid' || variant === 'immersive');
  const uri = media.uri;
  const thumbnailUri = media.thumbnail_url ?? undefined;
  const type = `${media?.type ?? media?.mime_type ?? ''}`.toLowerCase();
  const isVideo = type.includes('video') || /\.(mp4|mov|m4v|webm|avi)$/i.test(uri);
  const explicitAspectRatio = Number((media as Record<string, unknown>).aspect_ratio ?? 0);
  const rawWidth = Number((media as Record<string, unknown>).width ?? 0);
  const rawHeight = Number((media as Record<string, unknown>).height ?? 0);
  const clampAspectRatio = useCallback(
    (ratio: number) => {
      if (variant === 'grid') return 1;
      if (variant === 'instagram') return Math.min(1.91, Math.max(0.8, ratio));
      const minRatio = variant === 'single' ? 0.65 : 0.5;
      const maxRatio = variant === 'single' ? 1.6 : 2.1;
      return Math.min(maxRatio, Math.max(minRatio, ratio));
    },
    [variant],
  );
  useEffect(() => {
    if (explicitAspectRatio > 0) {
      setAspectRatio(clampAspectRatio(explicitAspectRatio));
      return;
    }
    if (rawWidth > 0 && rawHeight > 0) {
      const ratio = rawWidth / rawHeight;
      setAspectRatio(clampAspectRatio(ratio));
      return;
    }
    setAspectRatio(clampAspectRatio(1));
  }, [clampAspectRatio, explicitAspectRatio, rawHeight, rawWidth]);
  useEffect(() => {
    setImageReady(false);
  }, [uri, variant]);
  // Initialize with null then replace to avoid the 'shared object already released' crash
  // when the cell is recycled/unmounted by removeClippedSubviews before the player finishes binding.
  const player = useVideoPlayer(null, (instance) => {
    instance.loop = true;
    instance.muted = !canToggleAudio || isMuted;
    instance.pause();
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  useEffect(() => {
    // Buffered/off-screen posts show only their thumbnail. Removing their
    // source releases decoder and network resources instead of merely pausing.
    if (!isVideo || !uri || !isActive) {
      try {
        player.pause();
        player.replace(null);
      } catch {
        // player may already be releasing
      }
      return;
    }
    try {
      player.replace({ uri });
    } catch {
      // player may be in a mid-release state; safe to ignore
    }
  }, [isActive, isVideo, uri, player]);
  useEffect(() => {
    if (!isVideo) return;
    player.muted = !isActive || !canToggleAudio || isMuted;
    if (isActive) player.play();
    else player.pause();
  }, [canToggleAudio, isActive, isMuted, isVideo, player]);
  const fitMode = (variant === 'immersive' || variant === 'instagram') && isVideo ? 'contain' : 'cover';
  const maxMediaHeight = Math.max(
    220,
    Math.round(viewportHeight * (variant === 'single' ? 0.7 : 0.82)),
  );
  const mediaStyle =
    variant === 'immersive'
      ? [styles.immersiveMedia]
      : variant === 'grid'
      ? [styles.media, { aspectRatio: 1 }]
      : variant === 'instagram'
        ? [styles.media, styles.instagramMediaFrame, { aspectRatio }]
      : variant === 'modal'
        ? [styles.media, { aspectRatio, maxHeight: maxMediaHeight }]
        : [styles.media, { aspectRatio, maxHeight: maxMediaHeight }];
  const naturalVideoAspectRatio =
    explicitAspectRatio > 0
      ? explicitAspectRatio
      : rawWidth > 0 && rawHeight > 0
        ? rawWidth / rawHeight
        : aspectRatio;
  const immersiveVideoSurfaceStyle = [
    styles.immersiveVideoSurface,
    naturalVideoAspectRatio >= 1
      ? { width: '100%' as const, aspectRatio: naturalVideoAspectRatio }
      : { height: '100%' as const, aspectRatio: naturalVideoAspectRatio },
  ];
  if (!isVideo) {
    return (
      <View style={mediaStyle}>
        {thumbnailUri ? (
          <ExpoImage
            source={{ uri: thumbnailUri }}
            style={styles.imagePlaceholder}
            contentFit={fitMode}
            cachePolicy="memory-disk"
            recyclingKey={`${media.mediaKey}-${variant}-thumb`}
          />
        ) : (
          <View style={styles.imagePlaceholderFallback} />
        )}
        <ExpoImage
          source={{ uri }}
          style={[styles.imageForeground, !imageReady ? styles.imageForegroundHidden : null]}
          contentFit={fitMode}
          cachePolicy="memory-disk"
          transition={0}
          recyclingKey={`${media.mediaKey}-${variant}`}
          onLoad={(event) => {
            const width = event.source.width ?? 0;
            const height = event.source.height ?? 0;
            if (width > 0 && height > 0) {
              setAspectRatio(clampAspectRatio(width / height));
            }
            setImageReady(true);
          }}
        />
        {!imageReady ? (
          <View style={styles.imageLoadingOverlay}>
            <ActivityIndicator color={AppColors.white} />
          </View>
        ) : null}
      </View>
    );
  }
  // Only play/bind VideoView when this cell is the active one.
  // Non-active cells render a thumbnail only — this eliminates the
  // "shared object already released" crash that occurs when
  // removeClippedSubviews or windowSize evicts a cell while its
  // player is still bound to a SurfaceVideoView.
  if (isVideo && !isActive) {
    if (variant === 'immersive') {
      return (
        <View style={styles.immersiveMedia}>
          <View style={styles.immersiveVideoStage}>
            {thumbnailUri ? (
              <ExpoImage source={{ uri: thumbnailUri }} style={styles.videoPoster} contentFit="contain" cachePolicy="memory-disk" />
            ) : (
              <View style={styles.videoPosterFallback} />
            )}
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.videoWrap, { aspectRatio, maxHeight: maxMediaHeight }]}>
        {thumbnailUri ? (
          <ExpoImage source={{ uri: thumbnailUri }} style={styles.videoPoster} contentFit={fitMode} cachePolicy="memory-disk" />
        ) : (
          <View style={styles.videoPosterFallback} />
        )}
      </View>
    );
  }
  if (isVideo) {
    if (variant === 'immersive') {
      return (
        <View style={styles.immersiveMedia}>
          <View style={styles.immersiveVideoStage}>
            <VideoView style={immersiveVideoSurfaceStyle} player={player} nativeControls={false} contentFit="contain" />
            {status !== 'readyToPlay' ? (
              thumbnailUri ? (
                <ExpoImage source={{ uri: thumbnailUri }} style={styles.immersiveVideoLoadingPoster} contentFit="contain" cachePolicy="memory-disk" />
              ) : (
                <View style={styles.immersiveVideoLoadingPoster} />
              )
            ) : null}
          </View>
          {status !== 'readyToPlay' ? (
            <View style={styles.videoLoadingOverlay}>
              <ActivityIndicator color={AppColors.white} />
            </View>
          ) : null}
          {canToggleAudio ? (
            <Pressable
              style={styles.immersiveAudioToggle}
              onPress={() => setIsMuted((current) => !current)}
              hitSlop={10}>
              {isMuted ? (
                <VolumeX size={17} stroke={AppColors.white} strokeWidth={2.2} />
              ) : (
                <Volume2 size={17} stroke={AppColors.white} strokeWidth={2.2} />
              )}
            </Pressable>
          ) : null}
        </View>
      );
    }
    return (
      <View style={[styles.videoWrap, { aspectRatio, maxHeight: maxMediaHeight }]}>
        {status !== 'readyToPlay' ? (
          thumbnailUri ? (
            <ExpoImage source={{ uri: thumbnailUri }} style={styles.videoPoster} contentFit={fitMode} cachePolicy="memory-disk" />
          ) : (
            <View style={styles.videoPosterFallback} />
          )
        ) : null}
        <VideoView
          style={variant === 'instagram' ? styles.instagramVideoSurface : styles.videoFill}
          player={player}
          nativeControls={false}
          contentFit={fitMode}
          surfaceType={variant === 'instagram' ? 'textureView' : 'surfaceView'}
        />
        {status !== 'readyToPlay' ? (
          <View style={styles.videoLoadingOverlay}>
            <ActivityIndicator color={AppColors.white} />
          </View>
        ) : null}
        {canToggleAudio ? (
          <Pressable
            style={styles.videoAudioToggle}
            onPress={() => setIsMuted((current) => !current)}
            hitSlop={10}>
            {isMuted ? (
              <VolumeX size={13} stroke={AppColors.white} />
            ) : (
              <Volume2 size={13} stroke={AppColors.white} />
            )}
            <Text style={styles.videoAudioToggleText}>{isMuted ? 'Muted' : 'Sound on'}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
};
const CommentRow = ({
  comment,
  replies = [],
  reaction,
  replyReactions,
  onReply,
  onToggleLike,
  onReactEmoji,
  onOpenProfile,
}: {
  comment: Comment;
  replies?: Comment[];
  reaction?: { liked: boolean; emoji?: string; count: number };
  replyReactions?: Record<string, { liked: boolean; emoji?: string; count: number }>;
  onReply: (comment: Comment) => void;
  onToggleLike: (commentId: string) => void;
  onReactEmoji: (commentId: string, emoji: string) => void;
  onOpenProfile: (username: string) => void;
}) => {
  const openCommentProfile = (item: Comment) => {
    const username = item.user?.username?.trim();
    if (!username) return;
    onOpenProfile(username);
  };

  return (
    <View style={styles.commentThread}>
      <View style={styles.commentRow}>
        <Pressable onPress={() => openCommentProfile(comment)} disabled={!comment.user?.username}>
          <Avatar uri={comment.user?.avatar} name={comment.user?.name ?? comment.user?.username ?? 'User'} size={30} />
        </Pressable>
        <View style={styles.commentBody}>
          <View style={styles.commentBubble}>
            <Pressable onPress={() => openCommentProfile(comment)} disabled={!comment.user?.username}>
              <Text style={styles.commentUser}>{comment.user?.username ? `@${comment.user.username}` : (comment.user?.name ?? 'user')}</Text>
            </Pressable>
            <Text style={styles.commentText}>{comment.content}</Text>
          </View>
          <View style={styles.commentActions}>
            <Pressable onPress={() => onToggleLike(comment.id)}>
              <Text style={[styles.commentActionText, reaction?.liked ? styles.commentActionActive : null]}>
                Like{reaction?.count ? ` ${reaction.count}` : ''}
              </Text>
            </Pressable>
            <Pressable onPress={() => onReply(comment)}>
              <Text style={styles.commentActionText}>Reply</Text>
            </Pressable>
            <View style={styles.commentEmojiRow}>
              {COMMENT_EMOJIS.slice(0, 4).map((emoji) => (
                <Pressable key={emoji} onPress={() => onReactEmoji(comment.id, emoji)}>
                  <Text style={[styles.commentEmoji, reaction?.emoji === emoji ? styles.commentEmojiActive : null]}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
      {replies.length ? (
        <View style={styles.commentReplies}>
          {replies.map((reply) => {
            const replyReaction = replyReactions?.[reply.id];
            return (
              <View key={reply.id} style={styles.commentReplyRow}>
                <Pressable onPress={() => openCommentProfile(reply)} disabled={!reply.user?.username}>
                  <Avatar uri={reply.user?.avatar} name={reply.user?.name ?? reply.user?.username ?? 'User'} size={24} />
                </Pressable>
                <View style={styles.commentBody}>
                  <View style={[styles.commentBubble, styles.commentReplyBubble]}>
                    <Pressable onPress={() => openCommentProfile(reply)} disabled={!reply.user?.username}>
                      <Text style={styles.commentUser}>{reply.user?.username ? `@${reply.user.username}` : (reply.user?.name ?? 'user')}</Text>
                    </Pressable>
                    <Text style={styles.commentText}>{reply.content}</Text>
                  </View>
                  <View style={styles.commentActions}>
                    <Pressable onPress={() => onToggleLike(reply.id)}>
                      <Text style={[styles.commentActionText, replyReaction?.liked ? styles.commentActionActive : null]}>
                        Like{replyReaction?.count ? ` ${replyReaction.count}` : ''}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => onReply(reply)}>
                      <Text style={styles.commentActionText}>Reply</Text>
                    </Pressable>
                    <View style={styles.commentEmojiRow}>
                      {COMMENT_EMOJIS.slice(0, 3).map((emoji) => (
                        <Pressable key={emoji} onPress={() => onReactEmoji(reply.id, emoji)}>
                          <Text style={[styles.commentEmoji, replyReaction?.emoji === emoji ? styles.commentEmojiActive : null]}>{emoji}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A12' },
  pageShell: {
    width: '100%',
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#09111E',
    overflow: 'hidden',
  },
  topBar: {
    minHeight: 86,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09111E',
    zIndex: 10,
  },
  postUploadBanner: { marginHorizontal: 12, marginBottom: 8, overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(46,144,255,0.3)', backgroundColor: '#101C2E' },
  postUploadRow: { minHeight: 48, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  postUploadText: { flex: 1, color: AppColors.textPrimary, fontSize: 13, fontWeight: '700' },
  postUploadSuccess: { color: '#22C55E', fontSize: 20, fontWeight: '900' },
  postUploadError: { width: 20, height: 20, borderRadius: 10, color: '#fff', textAlign: 'center', fontWeight: '900', backgroundColor: AppColors.danger },
  postUploadTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)' },
  postUploadFill: { height: '100%', borderRadius: 2, backgroundColor: AppColors.accent },
  postUploadFillError: { backgroundColor: AppColors.danger },
  liveCircle: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    fontSize: 6,
    fontWeight: '900',
    color: AppColors.white,
    backgroundColor: '#F43F5E',
    borderRadius: 3,
    paddingHorizontal: 3,
    overflow: 'hidden',
  },
  brandCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  brandLogoWrap: {
    width: 31,
    height: 31,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.white,
  },
  brandLogo: {
    width: 25,
    height: 25,
  },
  brandText: {
    color: AppColors.white,
    fontSize: 17,
    fontWeight: '900',
    fontFamily: undefined,
  },
  topActions: { flexDirection: 'row', gap: 10 },
  iconCircle: {
    width: 39,
    height: 39,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  tiktokTopOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 30,
  },
  tiktokTopRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tiktokLiveButton: {
    minHeight: 36,
    borderRadius: 12,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,216,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.42)',
  },
  tiktokLiveText: {
    color: '#BDF5FF',
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  tiktokFeedTabs: {
    position: 'absolute',
    left: 72,
    right: 72,
    minHeight: 42,
    borderRadius: 22,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 9,
    backgroundColor: 'rgba(5,10,18,0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  tiktokFeedTabText: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.42)',
    textShadowRadius: 8,
  },
  tiktokFeedTabActive: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    flex: 1,
  },
  tiktokFeedTabTextActive: {
    color: AppColors.white,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.42)',
    textShadowRadius: 8,
  },
  tiktokFeedTabLine: {
    width: 34,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#00D8FF',
  },
  brandPulseMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.white,
  },
  brandPulseLogo: {
    width: 23,
    height: 23,
  },
  liveTray: {
    marginTop: 12,
    maxHeight: 78,
  },
  liveTrayContent: {
    alignItems: 'center',
    gap: 10,
    paddingRight: 14,
    paddingBottom: 6,
  },
  quickCreateChip: {
    height: 46,
    minWidth: 154,
    borderRadius: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6,12,22,0.64)',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.22)',
  },
  quickCreateText: {
    color: AppColors.white,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
  },
  liveCreatorChip: {
    width: 58,
    alignItems: 'center',
    gap: 4,
  },
  liveCreatorPreview: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0,216,255,0.78)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  liveCreatorImage: {
    width: '100%',
    height: '100%',
  },
  liveCreatorBadge: {
    position: 'absolute',
    left: 5,
    right: 5,
    bottom: 4,
    height: 15,
    borderRadius: 5,
    backgroundColor: 'rgba(0,216,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveCreatorBadgeText: {
    color: '#06111D',
    fontSize: 8,
    fontFamily: undefined, fontWeight: '800',
  },
  liveCreatorName: {
    color: AppColors.white,
    fontSize: 10,
    fontFamily: undefined, fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowRadius: 6,
    maxWidth: 58,
  },
  liveViewerScreen: {
    flex: 1,
    backgroundColor: '#050A12',
  },
  liveViewerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  liveViewerTop: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  liveViewerClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,10,18,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.22)',
  },
  liveViewerHost: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(5,10,18,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.18)',
  },
  liveViewerHostText: {
    flex: 1,
  },
  liveViewerName: {
    color: AppColors.white,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '800',
  },
  liveViewerMeta: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontFamily: undefined, fontWeight: '800',
  },
  liveViewerLivePill: {
    height: 32,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D8FF',
  },
  liveViewerLiveText: {
    color: '#05111E',
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  liveViewerCenter: {
    position: 'absolute',
    left: 22,
    right: 84,
    bottom: 184,
    gap: 5,
  },
  liveViewerTitle: {
    color: AppColors.white,
    fontSize: 20,
    lineHeight: 26,
    fontFamily: undefined, fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.52)',
    textShadowRadius: 10,
  },
  liveViewerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
  },
  liveViewerRail: {
    position: 'absolute',
    right: 18,
    bottom: 184,
    gap: 14,
  },
  liveViewerRailBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,10,18,0.54)',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.18)',
  },
  liveViewerBottom: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 0,
    gap: 12,
  },
  liveCommentStack: {
    gap: 7,
  },
  liveComment: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 11,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.35)',
    color: AppColors.white,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '600',
  },
  liveCommentName: {
    fontFamily: undefined, fontWeight: '800',
  },
  liveComposer: {
    minHeight: 48,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(8,13,24,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.22)',
  },
  liveInput: {
    flex: 1,
    color: AppColors.white,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '600',
    paddingVertical: 8,
  },
  liveSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    right: 3,
    top: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00D8FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notificationDotText: {
    color: AppColors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  feedTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: '#09111E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  feedTab: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
    gap: 5,
    minWidth: 112,
    borderRadius: 17,
  },
  feedTabActive: {
    backgroundColor: 'rgba(23,207,255,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(23,207,255,0.24)',
  },
  feedTabText: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 14,
    fontWeight: '900',
    fontFamily: undefined,
  },
  feedTabTextActive: {
    color: AppColors.white,
  },
  feedTabUnderline: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: AppColors.accent,
  },
  storyScroller: {
    minHeight: 100,
    backgroundColor: '#09111E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  storiesRow: { paddingHorizontal: 14, gap: 14, paddingBottom: 14 },
  createPostRow: {
    minHeight: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.075)',
    paddingHorizontal: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verifiedPromo: {
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(23,207,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifiedPromoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#17CFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#17CFFF',
    shadowOpacity: 0.42,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  verifiedPromoCopy: {
    flex: 1,
    minWidth: 0,
  },
  verifiedPromoEyebrow: {
    color: '#4DD7FF',
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: undefined, fontWeight: '800',
  },
  verifiedPromoTitle: {
    marginTop: 3,
    color: AppColors.white,
    fontSize: 15,
    lineHeight: 19,
    fontFamily: undefined, fontWeight: '800',
  },
  verifiedPromoAmount: {
    color: AppColors.white,
    fontSize: 19,
    lineHeight: 24,
    fontFamily: undefined, fontWeight: '800',
  },
  verifiedPromoText: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: undefined, fontWeight: '600',
  },
  verifiedPromoButton: {
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: '#17CFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  verifiedPromoButtonText: {
    color: '#07111F',
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
  },
  createPostPrompt: {
    flex: 1,
    minHeight: 42,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  createPostPromptText: {
    color: AppColors.textSecondary,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '600',
  },
  storyCardBase: {
    width: 60,
    alignItems: 'center',
    gap: 8,
  },
  storyCardSeen: {
    opacity: 0.72,
  },
  storyBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  storyBubbleRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
  },
  storyBubbleInner: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#152033',
  },
  storyBubbleImage: {
    width: '100%',
    height: '100%',
  },
  storyBubbleMediaWrap: {
    flex: 1,
    position: 'relative',
  },
  storyBubbleTextOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 24,
    paddingHorizontal: 5,
    paddingVertical: 4,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.46)',
  },
  storyBubbleOverlayText: {
    color: AppColors.white,
    fontSize: 8,
    lineHeight: 10,
    fontFamily: undefined, fontWeight: '800',
  },
  storyTextThumb: {
    flex: 1,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyTextThumbContent: {
    color: AppColors.white,
    fontSize: 9,
    lineHeight: 12,
    textAlign: 'center',
    fontFamily: undefined, fontWeight: '800',
  },
  storyAddBadge: {
    position: 'absolute',
    bottom: -1,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#09111E',
    backgroundColor: '#00C7F7',
  },
  storyCardLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 10,
    fontFamily: undefined, fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  // Legacy name kept for story viewer only
  storyName: { color: AppColors.textPrimary, fontSize: 13, fontFamily: undefined, fontWeight: '800' },
  storyViewerScreen: {
    flex: 1,
    backgroundColor: '#020509',
    // Prevent content from ever overflowing the screen height
    overflow: 'hidden',
  },
  storyViewerMedia: {
    ...StyleSheet.absoluteFillObject,
  },
  storyViewerTextOnly: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  storyViewerTextOnlyContent: {
    color: AppColors.white,
    fontSize: 26,
    lineHeight: 36,
    fontFamily: undefined, fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  storyViewerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  storyViewerTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    gap: 10,
    zIndex: 3,
  },
  // Segmented progress bar row (one segment per story item)
  storyViewerSegments: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
  },
  storyViewerSegmentTrack: {
    height: 3,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  storyViewerSegmentFill: {
    height: '100%',
  },
  storyViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyViewerAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyViewerAuthorText: {
    color: AppColors.white,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '800',
  },
  storyViewerAuthorTime: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontFamily: undefined, fontWeight: '400',
    marginTop: 1,
  },
  storyViewerHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storyViewerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  storyViewerContentWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    // bottom is set inline based on whether the bottom bar is showing
    zIndex: 3,
  },
  storyViewerContent: {
    color: AppColors.white,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: undefined, fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // Story viewer bottom (reactions + message) — shown only for other people's stories
  svBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    gap: 10,
    zIndex: 5,
  },
  svReactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'flex-start',
    width: '50%',
  },
  svEmojiBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svEmojiBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ scale: 1.2 }],
  },
  svEmojiText: {
    fontSize: 18,
  },
  svInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  svInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 18,
    color: AppColors.white,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '400',
  },
  svInputActive: {
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  svInputSent: {
    justifyContent: 'center',
    borderColor: 'rgba(100,220,100,0.5)',
    backgroundColor: 'rgba(40,180,60,0.15)',
  },
  svInputSentText: {
    color: '#6EE87A',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '600',
    textAlign: 'center',
  },
  svInputText: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 15,
    fontFamily: undefined, fontWeight: '400',
  },
  svSendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svSendBtnDisabled: {
    opacity: 0.4,
  },
  // Story options bottom sheet
  svOptionsBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  svOptionsSheet: {
    backgroundColor: '#141C2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  svOptionsHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 18,
  },
  svOptionsTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  svOptionsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  svOptionsItemDanger: {
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderColor: 'rgba(248,113,113,0.2)',
  },
  svOptionsIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(248,113,113,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svOptionsTextWrap: { flex: 1 },
  svOptionsItemDangerText: {
    color: '#F87171',
    fontSize: 15,
    fontFamily: undefined, fontWeight: '800',
  },
  svOptionsMeta: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '400',
    marginTop: 2,
  },
  svOptionsCancel: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  svOptionsCancelText: {
    color: AppColors.textSecondary,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '600',
  },
  listContent: { paddingBottom: 18, paddingTop: 0, backgroundColor: '#060D17' },
  tiktokListContent: { backgroundColor: '#050A12' },
  tiktokFooter: {
    width: '100%',
    backgroundColor: '#050A12',
    paddingHorizontal: 18,
    paddingTop: 140,
    paddingBottom: 90,
  },
  postStage: {
    marginHorizontal: 10,
    marginBottom: 12,
    position: 'relative',
  },
  postCard: {
    backgroundColor: '#0D1828',
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.075)',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  instagramPostHeader: {
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  instagramAuthor: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  instagramAuthorCopy: { flex: 1, minWidth: 0, gap: 2 },
  instagramAuthorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  instagramAuthorName: { color: AppColors.white, fontSize: 14, fontFamily: undefined, fontWeight: '800', maxWidth: 150 },
  instagramPostMeta: { color: 'rgba(255,255,255,0.58)', fontSize: 11, fontFamily: undefined, fontWeight: '600' },
  instagramHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  instagramFollowButton: {
    minHeight: 30,
    borderRadius: 7,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.accent,
  },
  instagramFollowText: { color: '#06101E', fontSize: 12, fontFamily: undefined, fontWeight: '800' },
  instagramMenuButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  instagramMedia: {
    marginHorizontal: 10,
    width: 'auto',
    borderRadius: 14,
    backgroundColor: '#05080D',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  instagramMediaFrame: { width: '100%', maxHeight: 560, overflow: 'hidden', backgroundColor: '#05080D' },
  facebookCaption: {
    color: AppColors.white,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: undefined, fontWeight: '600',
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  facebookEngagementRow: {
    minHeight: 44,
    marginHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  facebookReactionCount: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  facebookReactionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#287BE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookEngagementText: { color: AppColors.textSecondary, fontSize: 13, fontFamily: undefined, fontWeight: '600' },
  facebookActionBar: {
    minHeight: 50,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  facebookAction: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.025)',
    marginHorizontal: 2,
  },
  facebookActionText: { color: AppColors.textSecondary, fontSize: 12, fontFamily: undefined, fontWeight: '800' },
  facebookActionTextActive: { color: '#4599FF' },
  facebookOwnerTools: {
    minHeight: 34,
    paddingHorizontal: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instagramActionBar: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instagramPrimaryActions: { flexDirection: 'row', alignItems: 'center', gap: 17 },
  instagramAction: { minWidth: 26, minHeight: 38, alignItems: 'center', justifyContent: 'center' },
  instagramPostDetails: { paddingHorizontal: 14, paddingBottom: 14, gap: 5 },
  instagramLikes: { color: AppColors.white, fontSize: 13, fontFamily: undefined, fontWeight: '800' },
  instagramCaption: { color: AppColors.white, fontSize: 13, lineHeight: 18, fontFamily: undefined, fontWeight: '600' },
  instagramCaptionAuthor: { fontFamily: undefined, fontWeight: '800' },
  instagramComments: { color: 'rgba(255,255,255,0.52)', fontSize: 13, fontFamily: undefined, fontWeight: '600' },
  instagramStatsRow: { minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  instagramTimestamp: { color: 'rgba(255,255,255,0.42)', fontSize: 10, fontFamily: undefined, fontWeight: '800' },
  instagramBoostButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  instagramBoostText: { color: AppColors.accent, fontSize: 11, fontFamily: undefined, fontWeight: '800' },
  postTopShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 120,
  },
  postBottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 240,
  },
  postOverlayMeta: {
    position: 'absolute',
    left: 14,
    right: 78,
    bottom: 19,
    gap: 7,
  },
  overlayAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overlayHandle: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '800',
    maxWidth: 150,
  },
  overlayInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 6,
    rowGap: 3,
  },
  overlayPresenceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  overlayPresenceOnline: {
    backgroundColor: '#22C55E',
  },
  overlayPresenceOffline: {
    backgroundColor: 'rgba(255,255,255,0.48)',
  },
  overlayInfoText: {
    color: AppColors.white,
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  overlayInfoMuted: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  overlayInfoDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  postEarnPill: {
    minHeight: 22,
    borderRadius: 11,
    backgroundColor: '#17CFFF',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postEarnText: {
    color: '#06101E',
    fontSize: 10,
    fontFamily: undefined, fontWeight: '800',
  },
  overlayCaption: {
    color: AppColors.white,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '600',
  },
  hashRow: {
    flexDirection: 'row',
  },
  hashText: {
    color: AppColors.white,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '600',
  },
  actionRail: {
    position: 'absolute',
    right: 10,
    bottom: 37,
    alignItems: 'center',
    gap: 14,
  },
  railAction: {
    alignItems: 'center',
    gap: 3,
  },
  boostRailAction: {
    minWidth: 34,
    justifyContent: 'center',
  },
  railCount: {
    color: AppColors.white,
    fontSize: 9,
    fontFamily: undefined, fontWeight: '800',
  },
  postMenuWrap: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerMenuBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtn: {
    minHeight: 30,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(90,178,255,0.55)',
    backgroundColor: 'rgba(46,144,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  followBtnText: { color: AppColors.accent, fontSize: 12, fontFamily: undefined, fontWeight: '800' },
  pagePostBadge: {
    overflow: 'hidden',
    borderRadius: AppRadii.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    color: '#08111F',
    backgroundColor: AppColors.accent,
    fontSize: 10,
    fontFamily: undefined, fontWeight: '800',
  },
  followingBtn: {
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  followingBtnText: {
    color: AppColors.white,
  },
  textOnlyPost: {
    minHeight: 340,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  textOnlyPostText: {
    color: AppColors.white,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: undefined, fontWeight: '800',
    textAlign: 'center',
  },
  authorWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorMain: { gap: 2 },
  authorName: { color: AppColors.textPrimary, fontSize: 16, fontFamily: undefined, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  authorMeta: { color: AppColors.textSecondary, fontSize: 12, fontFamily: undefined, fontWeight: '600' },
  authorMetaDot: { color: AppColors.textSecondary, fontSize: 13 },
  followingPill: { minHeight: 30 },
  followingPillText: { color: '#0A1222', fontSize: 12, fontFamily: undefined, fontWeight: '800' },
  followsYouPill: { minHeight: 30 },
  followsYouPillText: { color: 'rgba(255,255,255,0.88)', fontSize: 12, fontFamily: undefined, fontWeight: '800' },
  captionWrap: { paddingHorizontal: 14, paddingBottom: 8 },
  caption: {
    color: AppColors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: undefined, fontWeight: '400',
  },
  captionMore: { color: AppColors.accent, fontSize: 14, fontFamily: undefined, fontWeight: '800' },
  boostCard: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(90,178,255,0.3)',
    backgroundColor: 'rgba(14,30,62,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  boostTitle: { color: AppColors.textPrimary, fontSize: 14, fontFamily: undefined, fontWeight: '800' },
  boostMeta: { color: AppColors.textSecondary, fontSize: 12, lineHeight: 16, fontFamily: undefined, fontWeight: '400' },
  sponsoredCta: {
    marginHorizontal: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
    minHeight: 42,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsoredCtaText: {
    color: '#080F20',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
  mediaSingleWrap: {
    overflow: 'hidden',
  },
  mediaGridWrap: {
    gap: 3,
    overflow: 'hidden',
  },
  mediaGridRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 3,
  },
  mediaGridItem: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#151A22',
  },
  mediaFifthTile: {
    width: '100%',
    overflow: 'hidden',
    marginTop: 3,
    backgroundColor: '#151A22',
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  mediaOverlayText: {
    color: AppColors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  media: { width: '100%', backgroundColor: '#0E1422' },
  immersiveMedia: {
    width: '100%',
    height: '100%',
    minHeight: 406,
    backgroundColor: '#0E1422',
    overflow: 'hidden',
  },
  immersiveVideoStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050A12',
  },
  immersiveVideoSurface: {
    alignSelf: 'center',
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    backgroundColor: '#050A12',
  },
  immersiveVideoSurfaceFull: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    maxWidth: undefined,
    maxHeight: undefined,
  },
  immersiveVideoSurfaceContain: {
    width: '100%',
    height: '100%',
  },
  immersiveVideoLoadingPoster: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050A12',
  },
  immersiveProgressTrack: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 8,
    height: 2,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  immersiveProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#00D8FF',
  },
  immersiveAudioToggle: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePlaceholderFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#151B27',
  },
  imageForeground: {
    ...StyleSheet.absoluteFillObject,
  },
  imageForegroundHidden: {
    opacity: 0,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  videoWrap: {
    width: '100%',
    backgroundColor: '#0B101A',
    overflow: 'hidden',
  },
  videoFill: {
    ...StyleSheet.absoluteFillObject,
  },
  instagramVideoSurface: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: '#05080D',
  },
  videoPoster: {
    ...StyleSheet.absoluteFillObject,
  },
  videoPosterFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B101A',
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  videoAudioToggle: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    minHeight: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(0,0,0,0.52)',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  videoAudioToggleText: {
    color: AppColors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  mediaModalScreen: {
    flex: 1,
    backgroundColor: '#040A17',
  },
  mediaModalHeader: {
    paddingTop: 50,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  mediaModalClose: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2D3E60',
    backgroundColor: '#0F182B',
  },
  mediaModalCloseText: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  mediaModalList: {
    paddingHorizontal: 8,
    paddingBottom: 40,
    gap: 10,
  },
  mediaModalItem: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#121928',
  },
  actionsRow: { minHeight: 46 },
  actionsLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { color: AppColors.textSecondary, fontSize: 15, fontFamily: undefined, fontWeight: '600' },
  writeBtn: {
    minHeight: 28,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(90,178,255,0.25)',
    backgroundColor: 'rgba(46,144,255,0.1)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  writeBtnText: {
    color: AppColors.accent,
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  loaderBlock: { paddingHorizontal: 10, gap: 12, paddingTop: 10 },
  empty: { color: AppColors.textMuted, textAlign: 'center', marginTop: 26, fontSize: 13, fontFamily: undefined, fontWeight: '400' },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheetAvoid: {
    maxHeight: '75%',
  },
  sheetCard: {
    minHeight: 280,
    backgroundColor: '#0A1120',
    borderTopLeftRadius: AppRadii.xl,
    borderTopRightRadius: AppRadii.xl,
    borderTopWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeader: {
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,144,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: { color: AppColors.textPrimary, fontSize: 16, fontFamily: undefined, fontWeight: '800' },
  sheetMeta: { color: AppColors.textMuted, fontSize: 13, fontFamily: undefined, fontWeight: '600' },
  commentsList: { gap: 10, paddingVertical: 10 },
  noComments: { color: AppColors.textMuted, textAlign: 'center', paddingVertical: 16, fontFamily: undefined, fontWeight: '400' },
  commentThread: {
    gap: 8,
  },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  commentReplyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  commentReplies: {
    marginLeft: 40,
    gap: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.08)',
    paddingLeft: 10,
  },
  commentBody: { flex: 1, gap: 2 },
  commentUser: { color: AppColors.textSecondary, fontSize: 12, fontFamily: undefined, fontWeight: '800' },
  commentText: { color: AppColors.textPrimary, fontSize: 14, lineHeight: 20, fontFamily: undefined, fontWeight: '400' },
  commentBubble: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  commentReplyBubble: {
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 4,
    paddingTop: 3,
  },
  commentActionText: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  commentActionActive: {
    color: AppColors.accent,
  },
  commentEmojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  commentEmoji: {
    fontSize: 14,
    opacity: 0.72,
  },
  commentEmojiActive: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  replyingBar: {
    minHeight: 36,
    borderRadius: 14,
    backgroundColor: 'rgba(90,178,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(90,178,255,0.22)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  replyingText: {
    flex: 1,
    color: AppColors.textSecondary,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
  },
  replyingCancel: {
    color: AppColors.accent,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
  },
  commentToolTray: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  commentToolItem: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  commentToolText: {
    fontSize: 20,
  },
  commentComposer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,144,255,0.15)',
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  commentToolBtn: {
    width: 38,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  commentToolBtnActive: {
    borderColor: 'rgba(90,178,255,0.42)',
    backgroundColor: 'rgba(90,178,255,0.14)',
  },
  commentToolBtnText: {
    color: AppColors.white,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  commentInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.25)',
    backgroundColor: 'rgba(8,14,26,0.9)',
    color: AppColors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: undefined, fontWeight: '400',
  },
  commentSend: {
    minWidth: 70,
    height: 44,
    borderRadius: AppRadii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.accentStrong,
  },
  commentSendText: { color: AppColors.white, fontSize: 13, fontFamily: undefined, fontWeight: '800' },
  shareModalScreen: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  shareSheet: {
    marginHorizontal: 14,
    marginBottom: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0B1322',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  shareSheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  shareSheetTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  shareOption: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  shareOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  shareOptionText: {
    color: AppColors.white,
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  postMenuCard: {
    width: 260,
    borderRadius: AppRadii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    backgroundColor: '#0C1525',
  },
  postMenuItem: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  postMenuText: { color: AppColors.textPrimary, fontSize: 14, fontFamily: undefined, fontWeight: '600' },
  postMenuDanger: { borderBottomWidth: 0 },
  postMenuDangerText: { color: AppColors.danger, fontSize: 14, fontFamily: undefined, fontWeight: '800' },
});
