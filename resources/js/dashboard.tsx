import { StoryViewer } from "@/components/story-viewer";
import {
  CommunityPost,
  CommunityPostCard,
} from "@/components/community-post-card";
import { AdRender } from "@/components/ads/ad-render";
import { MobileActionSheet } from "@/components/mobile-action-sheet";
import { MobileEmptyState } from "@/components/mobile-empty-state";
import { MobilePageShell } from "@/components/mobile-page-shell";
import { Head } from "@/components/page-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppearance } from "@/hooks/use-appearance";
import { useAuth } from "@/hooks/use-auth";
import {
  useStories,
  type Story,
  type StoryGroup,
  type StoryMedia,
} from "@/hooks/use-stories";
import { useRealtimePosts } from "@/hooks/use-realtime-posts";
import { useLiveNotificationCount } from "@/hooks/use-live-notification-count";
import { useLiveStream } from "@/hooks/use-live-stream";
import { LiveChat } from "@/components/live-chat";
import {
  DeliveryResponse,
  requestAdDeliveries,
  trackAdEvent,
} from "@/lib/ads-delivery";
import axiosInstance from "@/lib/axios";
import { getSafeExternalUrl } from "@/lib/url-guard";
import { isPostMediaReadyForDisplay } from "@/lib/post-media-readiness";
import { initializeEcho } from "@/utils/echo";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Bell,
  Copy,
  Facebook,
  MessageCircleMore,
  Moon,
  Plus,
  Sparkles,
  Radio,
  Send,
  ShieldCheck,
  Sun,
  Eye,
  Heart,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type Post = CommunityPost;
type FeedMode = "for-you" | "following";

interface LiveFeedStream {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status: "draft" | "live" | "ended";
  viewer_count: number;
  peak_viewer_count?: number;
  reaction_count?: number;
  share_count?: number;
  comments_count?: number;
  likes_count?: number;
  user_liked?: boolean;
  started_at?: string | null;
  user?: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    avatar_variants?: {
      sm?: string | null;
      md?: string | null;
    } | null;
    is_following?: boolean;
  };
}

type FeedApiItem =
  | { type: "post"; id: string; score?: number; post: Post }
  | { type: "live_stream"; id: string; score?: number; live_stream: LiveFeedStream };

interface PostsResponse {
  data: FeedApiItem[];
  links: { next: string | null };
  meta: { current_page: number; last_page: number };
}

interface FollowingUsersResponse {
  data: Array<{ id: string }>;
}

const FOLLOWING_QUERY_KEY = ["dashboard", "following-map"] as const;
const SHARE_TEXT = "Check out this post on Kara Ads";

function dedupeHomePosts(posts: Post[]): Post[] {
  const seen = new Set<string>();
  const unique: Post[] = [];

  for (const post of posts) {
    const source = post.original_post ?? post;
    const mediaSignature = (source.media ?? [])
      .map((media) => media.path || media.url || media.thumbnail || media.id)
      .filter(Boolean)
      .join("|");
    const contentSignature = (source.content ?? "").trim().toLowerCase().replace(/\s+/g, " ");
    const key =
      mediaSignature || contentSignature.length >= 8
        ? `content:${contentSignature}|media:${mediaSignature}`
        : `source:${source.id}`;

    if (!key || seen.has(key)) continue;

    seen.add(key);
    unique.push(post);
  }

  return unique;
}

function getFirstName(name?: string | null): string {
  const trimmed = name?.trim();
  if (!trimmed) return "User";
  return trimmed.split(/\s+/)[0] || "User";
}

function getStoryPreviewStory(group?: StoryGroup | null): Story | null {
  if (!group?.stories?.length) return null;
  return group.stories.find((story) => !story.is_viewed) ?? group.stories[0];
}

function getStoryPreviewMedia(story?: Story | null): StoryMedia | null {
  return story?.media?.find((media) => media.thumbnail || media.path) ?? null;
}

function getStoryPreviewSrc(media?: StoryMedia | null): string | null {
  if (!media) return null;

  return (
    media.thumbnail ||
    media.variants?.thumb ||
    media.variants?.sm ||
    media.variants?.md ||
    media.path ||
    null
  );
}

function getStoryUserAvatarSrc(user?: StoryGroup["user"] | null): string | null {
  if (!user) return null;

  return (
    user.avatar_variants?.md ||
    user.avatar_variants?.sm ||
    user.avatar_variants?.original ||
    user.avatar ||
    null
  );
}

function StoryStatusPreview({
  group,
  fallbackName,
}: {
  group?: StoryGroup | null;
  fallbackName?: string | null;
}) {
  const story = getStoryPreviewStory(group);
  const media = getStoryPreviewMedia(story);
  const src = getStoryPreviewSrc(media);
  const avatarSrc = getStoryUserAvatarSrc(group?.user);

  if (src && media?.type === "video" && !media.thumbnail) {
    return (
      <video
        src={src}
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  if (src) {
    return (
      <img
        src={src}
        alt={story?.caption || fallbackName || "Status"}
        className="h-full w-full object-cover"
      />
    );
  }

  if (avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt={fallbackName || group?.user.name || "Profile"}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#ffcf70_0%,#ff7e6e_42%,#222b44_100%)] px-2 text-center text-[10px] font-semibold leading-tight text-white">
      {story?.caption?.trim() || "Status"}
    </div>
  );
}

function updatePostInTree(
  post: Post,
  postId: string,
  updater: (post: Post) => Post,
): Post {
  if (post.id === postId) {
    return updater(post);
  }

  if (post.original_post) {
    return {
      ...post,
      original_post: updatePostInTree(post.original_post, postId, updater),
    };
  }

  return post;
}

function getLiveAvatarSrc(user?: LiveFeedStream["user"] | null): string | null {
  if (!user) return null;
  return user.avatar_variants?.md || user.avatar_variants?.sm || user.avatar || null;
}

function HomeLiveStreamCard({
  stream,
  isFollowing,
  followBusy,
  showFollowButton,
  onFollow,
  onShare,
  currentUserId,
  activeStreamId,
  onActiveCandidate,
}: {
  stream: LiveFeedStream;
  isFollowing: boolean;
  followBusy: boolean;
  showFollowButton: boolean;
  onFollow: (userId: string) => void;
  onShare: (stream: LiveFeedStream) => void;
  currentUserId?: string | number;
  activeStreamId: string | null;
  onActiveCandidate: (streamId: string, visible: boolean) => void;
}) {
  const navigate = useNavigate();
  const hostName = stream.user?.name ?? "Creator";
  const avatar = getLiveAvatarSrc(stream.user);
  const cardRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [isHalfVisible, setIsHalfVisible] = useState(false);
  const [liked, setLiked] = useState(Boolean(stream.user_liked));
  const [likesCount, setLikesCount] = useState(stream.likes_count ?? 0);
  const [liking, setLiking] = useState(false);
  const isOwnLive = Boolean(currentUserId && stream.user?.id && String(currentUserId) === String(stream.user.id));
  const shouldConnect = !isOwnLive && isHalfVisible && activeStreamId === stream.id && stream.status === "live";
  const { remoteStream, connectionState, reactions } = useLiveStream({
    streamId: stream.id,
    role: "viewer",
    currentUserId: currentUserId || "",
    hostUserId: stream.user?.id,
    enabled: Boolean(currentUserId && shouldConnect),
  });

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.5);
        setIsHalfVisible(visible);
        onActiveCandidate(stream.id, visible);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onActiveCandidate, stream.id]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    if (remoteStream && shouldConnect) {
      if (node.srcObject !== remoteStream) {
        node.srcObject = remoteStream;
      }
      node.muted = muted;
      node.play().catch(() => {
        node.muted = true;
        setMuted(true);
        node.play().catch(() => {});
      });
      return;
    }

    node.pause();
    node.srcObject = null;
  }, [muted, remoteStream, shouldConnect]);

  const toggleMute = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setMuted((current) => !current);
  }, []);

  const openFullscreen = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    const node = videoRef.current;
    if (!node) return;
    node.requestFullscreen?.().catch(() => {});
  }, []);

  const toggleLike = useCallback(async (event: MouseEvent) => {
    event.stopPropagation();
    if (liking || !currentUserId) return;

    const previousLiked = liked;
    const previousCount = likesCount;
    setLiking(true);
    setLiked(!previousLiked);
    setLikesCount(Math.max(0, previousCount + (previousLiked ? -1 : 1)));

    try {
      const { data } = await axiosInstance.post(`/api/live/streams/${stream.id}/like`);
      setLiked(Boolean(data?.liked));
      setLikesCount(Number(data?.likes_count ?? previousCount));
    } catch {
      setLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setLiking(false);
    }
  }, [currentUserId, liked, likesCount, liking, stream.id]);

  const openComments = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    navigate(`/live/${stream.id}`);
  }, [navigate, stream.id]);

  return (
    <article ref={cardRef} className="overflow-hidden rounded-[26px] border border-white/10 bg-[#111827] text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/live/${stream.id}`)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            navigate(`/live/${stream.id}`);
          }
        }}
        className="group relative block h-[360px] w-full overflow-hidden bg-[radial-gradient(circle_at_20%_14%,rgba(255,255,255,0.28),transparent_24%),linear-gradient(135deg,#f02849_0%,#111827_46%,#020617_100%)] text-left sm:h-[420px]"
      >
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${remoteStream && shouldConnect ? "opacity-100" : "opacity-0"}`}
          muted={muted}
          playsInline
          autoPlay
        />
        <div className={`absolute inset-0 transition duration-700 group-hover:scale-105 ${remoteStream && shouldConnect ? "opacity-0" : "opacity-40 group-hover:opacity-55"}`}>
          {avatar ? <img src={avatar} alt={hostName} className="h-full w-full object-cover blur-2xl" /> : null}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f02849] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-[0_12px_28px_rgba(240,40,73,0.42)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            LIVE
          </span>
          <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-bold backdrop-blur">
            {stream.category || "Live"}
          </span>
        </div>
        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-black backdrop-blur">
          <Eye className="h-3.5 w-3.5" />
          {stream.viewer_count.toLocaleString()}
        </div>
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${remoteStream ? "opacity-0" : "opacity-100"}`}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.42)] backdrop-blur-xl transition group-hover:scale-105">
            <Radio className="h-9 w-9 text-white" />
          </div>
        </div>
        {isOwnLive ? (
          <div className="absolute left-1/2 top-1/2 mt-16 -translate-x-1/2 rounded-full border border-white/15 bg-black/42 px-3 py-1 text-[11px] font-black text-white/80 backdrop-blur">
            You are live
          </div>
        ) : !remoteStream && shouldConnect ? (
          <div className="absolute left-1/2 top-1/2 mt-16 -translate-x-1/2 rounded-full border border-white/15 bg-black/42 px-3 py-1 text-[11px] font-black text-white/80 backdrop-blur">
            {connectionState === "failed" || connectionState === "disconnected" ? "Reconnecting..." : "Connecting live..."}
          </div>
        ) : null}
        <div className="pointer-events-none absolute bottom-24 left-4 right-20 z-20 max-h-28 overflow-hidden">
          {shouldConnect ? (
            <LiveChat
              streamId={stream.id}
              currentUserId={undefined}
              variant="floating"
              showHeader={false}
              compact
              className="h-full"
            />
          ) : null}
        </div>
        <div className="pointer-events-none absolute bottom-[38%] right-5 z-30 flex flex-col-reverse gap-2">
          {reactions.slice(-5).map((reaction) => (
            <span
              key={reaction.id}
              className="animate-[live-float_1.8s_ease-out_forwards] text-3xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
            >
              {reaction.value}
            </span>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-xl"
            aria-label={muted ? "Unmute live preview" : "Mute live preview"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={openFullscreen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-xl"
            aria-label="Fullscreen live preview"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-white/10">
              {avatar ? (
                <img src={avatar} alt={hostName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-black">
                  {hostName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{hostName}</p>
              <p className="truncate text-xs font-semibold text-white/70">
                {stream.user?.username ? `@${stream.user.username}` : "Live creator"}
              </p>
            </div>
          </div>
          <h3 className="line-clamp-2 text-xl font-black">{stream.title}</h3>
          {stream.description ? <p className="mt-1 line-clamp-1 text-xs font-semibold text-white/70">{stream.description}</p> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4 text-xs font-bold text-white/65">
          <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {likesCount.toLocaleString()}</span>
          <span className="inline-flex items-center gap-1"><MessageCircleMore className="h-3.5 w-3.5" /> {(stream.comments_count ?? 0).toLocaleString()}</span>
          <span>{(stream.share_count ?? 0).toLocaleString()} shares</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLike}
            disabled={liking || !currentUserId}
            className={`rounded-full border px-3 py-1.5 text-xs font-black transition disabled:opacity-50 ${
              liked
                ? "border-[#f02849]/50 bg-[#f02849]/18 text-[#ff7b91]"
                : "border-white/12 bg-white/10 text-white hover:bg-white/18"
            }`}
          >
            Like
          </button>
          <button
            type="button"
            onClick={openComments}
            className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-black text-white transition hover:bg-white/18"
          >
            Comment
          </button>
          {showFollowButton && stream.user?.id ? (
            <button
              type="button"
              onClick={() => onFollow(stream.user!.id)}
              disabled={followBusy}
              className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-black text-white transition hover:bg-white/18 disabled:opacity-50"
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onShare(stream)}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#111827]"
          >
            Share
          </button>
        </div>
      </div>
    </article>
  );
}

function PostCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-white/10 bg-[#171b24] p-3">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28 bg-white/10" />
          <Skeleton className="h-3 w-20 bg-white/10" />
        </div>
      </div>
      <Skeleton className="h-[320px] w-full rounded-xl bg-white/10" />
      <div className="mt-3 flex gap-4">
        <Skeleton className="h-4 w-16 bg-white/10" />
        <Skeleton className="h-4 w-16 bg-white/10" />
        <Skeleton className="h-4 w-16 bg-white/10" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { resolvedAppearance, updateAppearance } = useAppearance();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const feedMode: FeedMode =
    searchParams.get("feed") === "following" ? "following" : "for-you";
  const storyIdFromQuery = searchParams.get("story");
  const targetPostId = searchParams.get("post");

  const [followBusyByUser, setFollowBusyByUser] = useState<
    Record<string, boolean>
  >({});
  const [showActions, setShowActions] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [creatingLive, setCreatingLive] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState(0);
  const [viewerStoryIndex, setViewerStoryIndex] = useState(0);
  const [activeLiveStreamId, setActiveLiveStreamId] = useState<string | null>(null);
  const adSessionIdRef = useRef<string>(
    typeof window !== "undefined" &&
      "crypto" in window &&
      "randomUUID" in window.crypto
      ? window.crypto.randomUUID()
      : `home-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const postShuffleSeedRef = useRef<string>(
    typeof window !== "undefined" &&
      "crypto" in window &&
      "randomUUID" in window.crypto
      ? window.crypto.randomUUID()
      : `home-posts-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const {
    groups: storyGroups,
    loading: storiesLoading,
    fetchGroups,
    markViewed,
    react,
  } = useStories();
  const { notificationCount, clearNotificationCount } = useLiveNotificationCount({
    userId: auth?.user?.id,
    enabled: Boolean(auth?.user?.id),
  });

  const postsQueryKey = useMemo(
    () => ["dashboard", "posts", feedMode, postShuffleSeedRef.current] as const,
    [feedMode],
  );

  const {
    data: postsData,
    isLoading: postsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: postsQueryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const endpoint =
        "/api/feed/unified";
      const response = await axiosInstance.get<PostsResponse>(endpoint, {
        params: {
          feed: feedMode,
          page: pageParam,
          per_page: 10,
          shuffle_seed: postShuffleSeedRef.current,
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const hasMore =
        Boolean(lastPage.links?.next) &&
        lastPage.meta.current_page < lastPage.meta.last_page;
      return hasMore ? lastPage.meta.current_page + 1 : undefined;
    },
    staleTime: 20_000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });

  const { data: followingByUser = {}, isSuccess: followingMapReady } = useQuery(
    {
      queryKey: FOLLOWING_QUERY_KEY,
      queryFn: async () => {
        const response = await axiosInstance.get<FollowingUsersResponse>(
          "/api/users/following",
        );
        const followingMap: Record<string, boolean> = {};
        for (const user of response.data?.data ?? []) {
          followingMap[user.id] = true;
        }
        return followingMap;
      },
      staleTime: 5 * 60 * 1000,
    },
  );

  const estimatedPostCount = useMemo(
    () =>
      postsData?.pages.reduce(
        (total, page) => total + (page.data?.length ?? 0),
        0,
      ) ?? 0,
    [postsData],
  );
  const requiredHomeAds = useMemo(
    () => Math.max(8, Math.min(20, Math.ceil(estimatedPostCount / 6) + 6)),
    [estimatedPostCount],
  );
  const requiredStoryAds = useMemo(
    () => Math.max(3, Math.min(8, Math.ceil(storyGroups.length / 3) + 2)),
    [storyGroups.length],
  );

  const { data: homeAds = [] } = useQuery({
    queryKey: ["dashboard", "ads", feedMode, requiredHomeAds],
    queryFn: () =>
      requestAdDeliveries({
        count: requiredHomeAds,
        surface: "feed",
        slot: feedMode === "following" ? "following" : "main",
        sessionSeed: `${adSessionIdRef.current}-${feedMode}`,
        context: { feed: feedMode, page: "home" },
        cacheKey: `dashboard:home:${feedMode}:goal-v2`,
        cacheTtlMs: 30_000,
        persistCache: false,
        allowCreativeRepeats: true,
      }),
    enabled: estimatedPostCount > 0,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: "always",
    placeholderData: (previous) => previous,
    retry: 1,
  });

  const { data: storyAds = [] } = useQuery({
    queryKey: ["dashboard", "story-ads", feedMode, requiredStoryAds],
    queryFn: () =>
      requestAdDeliveries({
        count: requiredStoryAds,
        surface: "moments",
        slot: "story",
        sessionSeed: `${adSessionIdRef.current}-story-${feedMode}`,
        context: { feed: feedMode, page: "stories" },
        cacheKey: `dashboard:stories:${feedMode}:goal-v2`,
        cacheTtlMs: 30_000,
        persistCache: false,
        allowCreativeRepeats: true,
      }),
    enabled: viewerOpen && storyGroups.length > 0,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: "always",
    placeholderData: (previous) => previous,
    retry: 1,
  });

  const posts = useMemo(
    () =>
      dedupeHomePosts(
        postsData?.pages
          .flatMap((page) => page.data)
          .filter((item): item is Extract<FeedApiItem, { type: "post" }> => item.type === "post")
          .map((item) => item.post) ?? [],
      ),
    [postsData],
  );

  const { data: targetPost } = useQuery({
    queryKey: ["dashboard", "target-post", targetPostId],
    queryFn: async () => {
      const response = await axiosInstance.get<Post>(`/api/posts/${targetPostId}`);
      return (response.data as any)?.data ?? response.data;
    },
    enabled: Boolean(targetPostId),
    staleTime: 60_000,
  });
  const cardPosts = useMemo(
    () => {
      const visiblePosts = dedupeHomePosts(posts).filter((post) =>
        Boolean(post?.id && post?.user?.id && post?.user?.username) &&
        isPostMediaReadyForDisplay(post),
      );

      if (
        targetPost?.id &&
        targetPost?.user?.id &&
        targetPost?.user?.username &&
        isPostMediaReadyForDisplay(targetPost) &&
        !visiblePosts.some((post) => String(post.id) === String(targetPost.id))
      ) {
        return [targetPost, ...visiblePosts];
      }

      return visiblePosts;
    },
    [posts, targetPost],
  );
  const feedItems = useMemo(() => {
    const items: Array<
      | { kind: "post"; post: Post }
      | { kind: "live_stream"; stream: LiveFeedStream; key: string }
      | { kind: "ad"; ad: DeliveryResponse; key: string }
    > = [];
    let adIndex = 0;
    const mixedItems = postsData?.pages.flatMap((page) => page.data) ?? [];

    mixedItems.forEach((feedItem, index) => {
      if (feedItem.type === "live_stream") {
        items.push({
          kind: "live_stream",
          stream: feedItem.live_stream,
          key: `live-${feedItem.live_stream.id}`,
        });
      } else {
        const post = cardPosts.find((candidate) => String(candidate.id) === String(feedItem.post.id));
        if (!post) return;
        items.push({ kind: "post", post });
      }

      const shouldInsertAd = index % 3 === 1 && adIndex < homeAds.length;
      if (shouldInsertAd) {
        const ad = homeAds[adIndex++];
        items.push({
          kind: "ad",
          ad,
          key: `home-ad-${ad.delivery_id}-${index}`,
        });
      }
    });

    return items;
  }, [cardPosts, homeAds, postsData]);

  const handleLiveVisibilityCandidate = useCallback((streamId: string, visible: boolean) => {
    setActiveLiveStreamId((current) => {
      if (visible) return streamId;
      return current === streamId ? null : current;
    });
  }, []);

  useEffect(() => {
    fetchGroups(feedMode);
  }, [fetchGroups, feedMode]);

  useEffect(() => {
    if (!storyIdFromQuery || storyGroups.length === 0) return;

    const groupIndex = storyGroups.findIndex((group) =>
      group.stories.some((story) => story.id === storyIdFromQuery),
    );

    if (groupIndex < 0) return;

    const storyIndex = storyGroups[groupIndex].stories.findIndex(
      (story) => story.id === storyIdFromQuery,
    );

    if (storyIndex < 0) return;

    setViewerGroupIndex(groupIndex);
    setViewerStoryIndex(storyIndex);
    setViewerOpen(true);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("story");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, storyGroups, storyIdFromQuery]);

  useEffect(() => {
    const target = loaderRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage().catch(() => {});
        }
      },
      { rootMargin: "180px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useRealtimePosts({
    userId: auth?.user?.id || "",
    onPostCreated: () => {
      queryClient
        .invalidateQueries({ queryKey: postsQueryKey })
        .catch(() => {});
    },
    onPostLiked: () => {},
    onError: (error) => console.error("WebSocket error:", error),
  });

  useEffect(() => {
    initializeEcho();
    if (!window.Echo) return;

    const upsertLiveStream = (stream: LiveFeedStream) => {
      queryClient.setQueryData<InfiniteData<PostsResponse>>(
        postsQueryKey,
        (old) => {
          if (!old?.pages?.length) return old;
          let found = false;
          const liveItem: FeedApiItem = {
            type: "live_stream",
            id: stream.id,
            live_stream: stream,
          };

          const pages = old.pages.map((page) => ({
            ...page,
            data: page.data
              .filter((item) => item.type !== "live_stream" || item.live_stream.id !== stream.id)
              .map((item) => {
                if (item.type === "live_stream" && item.live_stream.id === stream.id) {
                  found = true;
                  return liveItem;
                }
                return item;
              }),
          }));

          if (!found) {
            pages[0] = {
              ...pages[0],
              data: [liveItem, ...pages[0].data].slice(0, 12),
            };
          }

          return { ...old, pages };
        },
      );
    };

    const removeLiveStream = (streamId: string) => {
      queryClient.setQueryData<InfiniteData<PostsResponse>>(
        postsQueryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter(
                (item) => item.type !== "live_stream" || item.live_stream.id !== streamId,
              ),
            })),
          };
        },
      );
    };

    const channel = window.Echo.channel("live.global");
    channel.listen(".live.stream.started", (payload: any) => {
      if (payload?.stream?.id) upsertLiveStream(payload.stream);
    });
    channel.listen(".live.stream.updated", (payload: any) => {
      if (payload?.stream?.id) upsertLiveStream(payload.stream);
    });
    channel.listen(".live.stream.ended", (payload: any) => {
      if (payload?.stream?.id) removeLiveStream(payload.stream.id);
    });

    return () => {
      try {
        channel.stopListening(".live.stream.started");
        channel.stopListening(".live.stream.updated");
        channel.stopListening(".live.stream.ended");
      } catch {
        // ignore
      }
    };
  }, [postsQueryKey, queryClient]);

  const updatePost = useCallback(
    (postId: string, updater: (post: Post) => Post) => {
      queryClient.setQueryData<InfiniteData<PostsResponse>>(
        postsQueryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item) =>
                item.type === "post"
                  ? { ...item, post: updatePostInTree(item.post, postId, updater) }
                  : item,
              ),
            })),
          };
        },
      );
    },
    [postsQueryKey, queryClient],
  );

  const removePost = useCallback(
    (postId: string) => {
      queryClient.setQueryData<InfiniteData<PostsResponse>>(
        postsQueryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((item) => item.type !== "post" || item.post.id !== postId),
            })),
          };
        },
      );
    },
    [postsQueryKey, queryClient],
  );

  const likeMutation = useMutation({
    mutationFn: ({
      postId,
      isCurrentlyLiked,
    }: {
      postId: string;
      isCurrentlyLiked: boolean;
    }) =>
      axiosInstance.post(
        isCurrentlyLiked
          ? `/api/posts/${postId}/unlike`
          : `/api/posts/${postId}/like`,
      ),
    onMutate: ({ postId, isCurrentlyLiked }) => {
      updatePost(postId, (item) => ({
        ...item,
        user_liked: !isCurrentlyLiked,
        like_count: isCurrentlyLiked
          ? Math.max(0, item.like_count - 1)
          : item.like_count + 1,
      }));
      return { postId, isCurrentlyLiked };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      updatePost(context.postId, (item) => ({
        ...item,
        user_liked: context.isCurrentlyLiked,
        like_count: context.isCurrentlyLiked
          ? item.like_count + 1
          : Math.max(0, item.like_count - 1),
      }));
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({
      postId,
      isCurrentlySaved,
    }: {
      postId: string;
      isCurrentlySaved: boolean;
    }) =>
      axiosInstance.post(
        isCurrentlySaved
          ? `/api/posts/${postId}/unsave`
          : `/api/posts/${postId}/save`,
      ),
    onMutate: ({ postId, isCurrentlySaved }) => {
      updatePost(postId, (item) => ({
        ...item,
        user_saved: !isCurrentlySaved,
        save_count: isCurrentlySaved
          ? Math.max(0, (item.save_count || 0) - 1)
          : (item.save_count || 0) + 1,
      }));
      return { postId, isCurrentlySaved };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      updatePost(context.postId, (item) => ({
        ...item,
        user_saved: context.isCurrentlySaved,
        save_count: context.isCurrentlySaved
          ? (item.save_count || 0) + 1
          : Math.max(0, (item.save_count || 0) - 1),
      }));
    },
  });

  const reshareMutation = useMutation({
    mutationFn: ({
      postId,
      isCurrentlyReshared,
    }: {
      postId: string;
      isCurrentlyReshared: boolean;
    }) =>
      axiosInstance.post(
        isCurrentlyReshared
          ? `/api/posts/${postId}/unreshare`
          : `/api/posts/${postId}/reshare`,
      ),
    onMutate: ({ postId, isCurrentlyReshared }) => {
      updatePost(postId, (item) => ({
        ...item,
        user_reshared: !isCurrentlyReshared,
        repost_count: isCurrentlyReshared
          ? Math.max(0, item.repost_count - 1)
          : item.repost_count + 1,
      }));
      return { postId, isCurrentlyReshared };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      updatePost(context.postId, (item) => ({
        ...item,
        user_reshared: context.isCurrentlyReshared,
        repost_count: context.isCurrentlyReshared
          ? item.repost_count + 1
          : Math.max(0, item.repost_count - 1),
      }));
    },
  });

  const followMutation = useMutation({
    mutationFn: ({
      userId,
      wasFollowing,
    }: {
      userId: string;
      wasFollowing: boolean;
    }) =>
      axiosInstance.post(
        `/api/users/${userId}/${wasFollowing ? "unfollow" : "follow"}`,
      ),
    onMutate: async ({ userId, wasFollowing }) => {
      await queryClient.cancelQueries({ queryKey: FOLLOWING_QUERY_KEY });
      const previousFollowing =
        queryClient.getQueryData<Record<string, boolean>>(
          FOLLOWING_QUERY_KEY,
        ) || {};
      queryClient.setQueryData<Record<string, boolean>>(
        FOLLOWING_QUERY_KEY,
        (old = {}) => ({
          ...old,
          [userId]: !wasFollowing,
        }),
      );
      setFollowBusyByUser((prev) => ({ ...prev, [userId]: true }));
      return { previousFollowing, userId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousFollowing) {
        queryClient.setQueryData(
          FOLLOWING_QUERY_KEY,
          context.previousFollowing,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      setFollowBusyByUser((prev) => ({ ...prev, [variables.userId]: false }));
    },
  });

  const handleLike = useCallback(
    (post: Post) => {
      likeMutation.mutate({
        postId: post.id,
        isCurrentlyLiked: Boolean(post.user_liked),
      });
    },
    [likeMutation],
  );

  const handleSave = useCallback(
    (post: Post) => {
      saveMutation.mutate({
        postId: post.id,
        isCurrentlySaved: Boolean(post.user_saved),
      });
    },
    [saveMutation],
  );

  const handleReshare = useCallback(
    (post: Post) => {
      reshareMutation.mutate({
        postId: post.id,
        isCurrentlyReshared: Boolean(post.user_reshared),
      });
    },
    [reshareMutation],
  );

  const handleFollow = useCallback(
    (userId: string) => {
      if (!followingMapReady) return;
      if (followBusyByUser[userId]) return;
      followMutation.mutate({
        userId,
        wasFollowing: Boolean(followingByUser[userId]),
      });
    },
    [followBusyByUser, followMutation, followingByUser, followingMapReady],
  );

  const handleShare = useCallback(async (postId: string) => {
    const url = `${window.location.origin}/posts/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kara Ads post",
          text: SHARE_TEXT,
          url,
        });
        return;
      } catch {
        return;
      }
    }
    setShareUrl(url);
  }, []);

  const handleLiveShare = useCallback(async (stream: LiveFeedStream) => {
    const url = `${window.location.origin}/live/${stream.id}`;
    try {
      await axiosInstance.post(`/api/live/streams/${stream.id}/share`);
    } catch {
      // Sharing should still work even if analytics tracking fails.
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: stream.title,
          text: `${stream.user?.name ?? "A creator"} is live on Karaads`,
          url,
        });
        return;
      } catch {
        return;
      }
    }
    setShareUrl(url);
  }, []);

  const handlePostUpdated = useCallback(
    (postId: string, updates: { content: string; media: Post["media"] }) => {
      updatePost(postId, (item) => ({
        ...item,
        content: updates.content,
        media: updates.media,
      }));
    },
    [updatePost],
  );

  const handlePostDeleted = useCallback(
    (postId: string) => {
      removePost(postId);
    },
    [removePost],
  );

  const currentUser = auth?.user;
  const currentUserStoryGroup = useMemo(
    () => storyGroups.find((group) => group.user.id === currentUser?.id) ?? null,
    [currentUser?.id, storyGroups],
  );
  const userHasVerificationBadge = Boolean(
    currentUser?.is_verified ||
      (currentUser as { has_verification_badge?: boolean; kara_verified_at?: string | null } | undefined)?.has_verification_badge ||
      (currentUser as { has_verification_badge?: boolean; kara_verified_at?: string | null } | undefined)?.kara_verified_at,
  );
  const showVerificationPaymentCard = Boolean(currentUser && !userHasVerificationBadge);

  const handleStartLiveFromHome = useCallback(async () => {
    if (creatingLive) return;
    if (!currentUser?.id) {
      toast.error("Log in before starting a live stream.");
      return;
    }

    setCreatingLive(true);
    try {
      const title = `${getFirstName(currentUser.name)} is live`;
      const { data } = await axiosInstance.post("/api/live/streams", {
        title,
        visibility: "everyone",
      });
      const stream = data?.data ?? data;
      if (stream?.id) {
        navigate(`/live/${stream.id}/host?autostart=1`);
      }
    } catch {
      toast.error("Unable to start live right now. Please try again.");
    } finally {
      setCreatingLive(false);
    }
  }, [creatingLive, currentUser?.id, currentUser?.name, navigate]);

  const openStoryGroup = (groupIndex: number) => {
    const group = storyGroups[groupIndex];
    if (!group || group.stories.length === 0) return;
    const unseenIndex = group.stories.findIndex((story) => !story.is_viewed);
    setViewerGroupIndex(groupIndex);
    setViewerStoryIndex(unseenIndex >= 0 ? unseenIndex : 0);
    setViewerOpen(true);
  };

  return (
    <>
      <Head title="Karaads" />
      <MobilePageShell
        withBottomNavSpacing={false}
        contentClassName="pt-2"
        header={
          <div className="mobile-safe-top sticky top-0 z-30 px-2 pt-2">
            <div className="mx-auto max-w-[430px] overflow-hidden rounded-[28px] border border-[#243454]/80 bg-[linear-gradient(180deg,rgba(11,18,32,0.96)_0%,rgba(9,16,30,0.92)_100%)] shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:max-w-5xl xl:max-w-6xl">
              <div className="px-4 pb-2.5 pt-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleStartLiveFromHome}
                    disabled={creatingLive}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur"
                    aria-label="Start live stream"
                  >
                    <div className="relative">
                      <Radio className="h-4.5 w-4.5" />
                      <span className="absolute -right-2 -top-1.5 rounded-md bg-red-500 px-1 py-0.5 text-[7px] font-bold leading-none text-white">
                        LIVE
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/app")}
                    className="flex items-center gap-2"
                  >
                    <img
                      src="/logo.png"
                      alt="Karaads"
                      className="h-10 w-10 rounded-xl bg-white object-contain p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                    />
                    <span className="text-[17px] font-extrabold tracking-tight text-white">
                      Karaads
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateAppearance(resolvedAppearance === "dark" ? "light" : "dark")
                      }
                      aria-label={`Switch to ${resolvedAppearance === "dark" ? "light" : "dark"} mode`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur"
                    >
                      {resolvedAppearance === "dark" ? (
                        <Sun className="h-4.5 w-4.5" />
                      ) : (
                        <Moon className="h-4.5 w-4.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        clearNotificationCount();
                        navigate("/notifications");
                      }}
                      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur"
                    >
                      <Bell className="h-4.5 w-4.5" />
                      {notificationCount > 0 ? (
                        <span className="absolute right-1 top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                          1
                        </span>
                      ) : null}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 overflow-x-auto text-[15px] font-extrabold no-scrollbar">
                  {[
                    { id: "discover", label: "Discover" },
                    { id: "following", label: "Following" },
                    { id: "followers", label: "Followers" },
                    { id: "for-you", label: "For You" },
                  ].map((tab) => {
                    const isActive =
                      (tab.id === "for-you" && feedMode === "for-you") ||
                      (tab.id === "following" && feedMode === "following");

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          if (tab.id === "following") {
                            navigate("/app?feed=following");
                            return;
                          }
                          navigate("/app");
                        }}
                        className={`relative shrink-0 pb-2 ${
                          isActive ? "text-white" : "text-white/45"
                        }`}
                      >
                        {tab.label}
                        {isActive ? (
                          <span className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-white" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 overflow-x-auto no-scrollbar pb-1">
                  <div className="flex min-w-max items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => navigate("/app/stories/create")}
                      className="flex w-[66px] shrink-0 flex-col items-center"
                    >
                      <div className="relative mb-2 h-[76px] w-[58px] rounded-[18px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,197,91,0.6),rgba(255,115,86,0.45),rgba(124,81,255,0.58))] p-[2px]">
                        <div className="h-full w-full overflow-hidden rounded-[16px] bg-[#0b1322]">
                          {currentUserStoryGroup ? (
                            <StoryStatusPreview
                              group={currentUserStoryGroup}
                              fallbackName={currentUser?.name}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white">
                              {getFirstName(currentUser?.name).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="line-clamp-1 text-xs font-medium text-white">
                        Your story
                      </p>
                    </button>

                    {storiesLoading
                      ? Array.from({ length: 5 }).map((_, idx) => (
                          <div
                            key={`story-skeleton-${idx}`}
                            className="w-[66px] shrink-0"
                          >
                            <Skeleton className="mb-2 h-[76px] w-[58px] rounded-[18px] bg-white/10" />
                            <Skeleton className="mx-auto h-3 w-12 bg-white/10" />
                          </div>
                        ))
                      : storyGroups.map((group, index) => (
                          <button
                            key={`home-story-${group.user.id}`}
                            type="button"
                            onClick={() => openStoryGroup(index)}
                            className="flex w-[66px] shrink-0 flex-col items-center"
                          >
                            <div
                              className={`mb-2 h-[76px] w-[58px] rounded-[18px] p-[2px] ${
                                group.has_unseen
                                  ? "bg-[linear-gradient(135deg,#ffcf70,#ff7e6e,#8e58ff)]"
                                  : "bg-white/20"
                              }`}
                            >
                              <div className="h-full w-full overflow-hidden rounded-[16px] bg-[#0b1322]">
                                <StoryStatusPreview
                                  group={group}
                                  fallbackName={group.user.name}
                                />
                              </div>
                            </div>
                            <p className="line-clamp-1 text-xs font-medium text-white/88">
                              {getFirstName(group.user.name)}
                            </p>
                          </button>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="px-1 pb-3 pt-2.5 lg:px-0">
          <div className="mx-auto grid w-full max-w-[430px] gap-3.5 lg:max-w-[920px] xl:max-w-[980px]">
            {showVerificationPaymentCard ? (
              <div className="overflow-hidden rounded-[24px] border border-primary/25 bg-card p-4 text-foreground shadow-sm dark:bg-[linear-gradient(135deg,rgba(8,210,255,0.16),rgba(11,18,32,0.94)_42%,rgba(255,197,91,0.12))] dark:text-white dark:shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.16em] text-primary dark:text-[#8eeaff]">
                        Kara Verified
                      </p>
                      <h2 className="mt-1 text-lg font-extrabold">Get your badge for N5,000</h2>
                      <p className="mt-1 text-sm font-medium text-muted-foreground dark:text-white/62">
                        Pay from your wallet or Paystack, request the badge, and earn N30 for approved 30s+ videos posted from June 1, 2026.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/settings/verification")}
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground transition hover:bg-primary/90 dark:bg-white dark:text-[#07111f] dark:hover:bg-[#dff9ff]"
                  >
                    Pay N5,000
                  </button>
                </div>
              </div>
            ) : null}

            {cardPosts.length === 0 && postsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <PostCardSkeleton key={`post-skeleton-${i}`} />
                ))
              : feedItems.map((item) => {
                  if (item.kind === "ad") {
                    return (
                      <HomeFeedAdCard
                        key={item.key}
                        ad={item.ad}
                        feedMode={feedMode}
                      />
                    );
                  }

                  if (item.kind === "live_stream") {
                    const stream = item.stream;
                    const creatorId = stream.user?.id;
                    return (
                      <HomeLiveStreamCard
                        key={item.key}
                        stream={stream}
                        isFollowing={Boolean(creatorId && followingByUser[creatorId])}
                        followBusy={Boolean(creatorId && followBusyByUser[creatorId])}
                        showFollowButton={Boolean(creatorId && followingMapReady)}
                        onFollow={handleFollow}
                        onShare={handleLiveShare}
                        currentUserId={auth?.user?.id}
                        activeStreamId={activeLiveStreamId}
                        onActiveCandidate={handleLiveVisibilityCandidate}
                      />
                    );
                  }

                  const post = item.post;
                  return (
                    <CommunityPostCard
                      key={post.id}
                      post={post}
                      currentUserId={auth?.user?.id}
                      isFollowing={Boolean(followingByUser[post.user.id])}
                      followBusy={Boolean(followBusyByUser[post.user.id])}
                      showFollowButton={followingMapReady}
                      onFollow={handleFollow}
                      onLike={handleLike}
                      onReshare={handleReshare}
                      onShare={handleShare}
                      onSave={handleSave}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                      autoPlayVideo
                      momentsFeedMode={feedMode}
                    />
                  );
                })}

            {!postsLoading && cardPosts.length === 0 ? (
              <MobileEmptyState
                icon={Sparkles}
                title="No posts yet"
                description={
                  feedMode === "following"
                    ? "Follow creators to build your feed."
                    : "New posts will appear here."
                }
              />
            ) : null}
          </div>

          {hasNextPage ? <div ref={loaderRef} className="h-8" /> : null}
          {isFetchingNextPage && cardPosts.length > 0 ? (
            <div className="mx-auto mt-3 w-full max-w-[920px] space-y-3 xl:max-w-[980px]">
              <PostCardSkeleton />
            </div>
          ) : null}
        </div>
      </MobilePageShell>

      <MobileActionSheet
        open={showActions}
        onOpenChange={setShowActions}
        title="Home"
      >
        <div className="space-y-2">
          <button
            type="button"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-left text-sm text-white"
            onClick={() => {
              setShowActions(false);
              navigate("/messages");
            }}
          >
            <span className="inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" />
              Open messages
            </span>
          </button>
        </div>
      </MobileActionSheet>

      <MobileActionSheet
        open={Boolean(shareUrl)}
        onOpenChange={(open) => {
          if (!open) setShareUrl(null);
        }}
        title="Share post"
      >
        <div className="grid grid-cols-2 gap-2">
          {shareUrl ? (
            <>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white"
              >
                <Send className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(SHARE_TEXT)}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white"
              >
                X
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(SHARE_TEXT)}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white"
              >
                <Send className="h-4 w-4" />
                Telegram
              </a>
              <button
                type="button"
                className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-sm font-bold text-cyan-100"
                onClick={() => {
                  navigate(
                    `/messages?share=${encodeURIComponent(`${SHARE_TEXT} ${shareUrl}`)}`,
                  );
                  setShareUrl(null);
                }}
              >
                <Sparkles className="h-4 w-4" />
                Share on Kara Ads
              </button>
              <button
                type="button"
                className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white text-sm font-bold text-black"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Post link copied");
                    setShareUrl(null);
                  } catch {
                    toast.error("Unable to copy link");
                  }
                }}
              >
                <Copy className="h-4 w-4" />
                Copy link
              </button>
            </>
          ) : null}
        </div>
      </MobileActionSheet>
      <StoryViewer
        open={viewerOpen}
        groups={storyGroups}
        ads={storyAds}
        initialGroupIndex={viewerGroupIndex}
        initialStoryIndex={viewerStoryIndex}
        onClose={() => setViewerOpen(false)}
        onViewed={async (storyId) => {
          await markViewed(storyId);
        }}
        onReact={async (storyId, emoji) => {
          await react(storyId, emoji);
        }}
      />
    </>
  );
}

function HomeFeedAdCard({
  ad,
  feedMode,
}: {
  ad: DeliveryResponse;
  feedMode: FeedMode;
}) {
  const creative = ad.creative;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  const impressionSentRef = useRef(false);
  const viewCompleteSentRef = useRef(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [captionOverflowing, setCaptionOverflowing] = useState(false);
  const safeTargetUrl = getSafeExternalUrl(creative?.target_url || null);

  useEffect(() => {
    const node = captionRef.current;
    if (!node || !creative?.description) return;

    const measureOverflow = () => {
      setCaptionOverflowing(node.scrollHeight - node.clientHeight > 1);
    };

    measureOverflow();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measureOverflow);
    observer.observe(node);

    return () => observer.disconnect();
  }, [captionExpanded, creative?.description]);

  useEffect(() => {
    const node = rootRef.current;
    const signature = ad.tracking?.signature;
    const sessionId = ad.tracking?.session_id;
    if (!node || !ad.delivery_id || !signature || !sessionId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.45,
        );
        if (!visible || impressionSentRef.current) return;
        impressionSentRef.current = true;

        trackAdEvent({
          deliveryId: ad.delivery_id,
          eventType: "impression",
          sessionId,
          signature,
          idempotencyKey: `home-impression-${ad.delivery_id}`,
          meta: {
            surface: ad.placement?.surface || "feed",
            slot:
              ad.placement?.slot ||
              (feedMode === "following" ? "following" : "main"),
            feed: feedMode,
          },
        });
      },
      { threshold: [0.45] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [
    ad.delivery_id,
    ad.placement?.slot,
    ad.placement?.surface,
    ad.tracking?.session_id,
    ad.tracking?.signature,
    feedMode,
  ]);

  if (!creative) return null;

  const handleClick = () => {
    const signature = ad.tracking?.signature;
    const sessionId = ad.tracking?.session_id;
    if (!ad.delivery_id || !signature || !sessionId) return;

    trackAdEvent({
      deliveryId: ad.delivery_id,
      eventType: "click",
      sessionId,
      signature,
      idempotencyKey: `home-click-${ad.delivery_id}-${Date.now()}`,
      meta: {
        surface: ad.placement?.surface || "feed",
        slot:
          ad.placement?.slot ||
          (feedMode === "following" ? "following" : "main"),
        feed: feedMode,
      },
    });
  };

  const handleVideoQualifiedView = (payload: {
    watchSeconds: number;
    durationSeconds: number;
    watchRatio: number;
  }) => {
    const signature = ad.tracking?.signature;
    const sessionId = ad.tracking?.session_id;
    if (
      !ad.delivery_id ||
      !signature ||
      !sessionId ||
      viewCompleteSentRef.current
    )
      return;

    viewCompleteSentRef.current = true;
    trackAdEvent({
      deliveryId: ad.delivery_id,
      eventType: "view_complete",
      sessionId,
      signature,
      idempotencyKey: `home-view-complete-${ad.delivery_id}`,
      meta: {
        surface: ad.placement?.surface || "feed",
        slot:
          ad.placement?.slot ||
          (feedMode === "following" ? "following" : "main"),
        feed: feedMode,
        watch_seconds: payload.watchSeconds,
        video_duration_seconds: payload.durationSeconds,
        watch_ratio: payload.watchRatio,
      },
    });
  };

  return (
    <article
      ref={rootRef}
      className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0f141e]/95 p-3 backdrop-blur-md"
    >
      <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
        Sponsored
      </div>
      <AdRender
        renderMode={ad.render_mode || "internal_asset"}
        mediaUrl={creative.media_url}
        mediaType={creative.media_type}
        title={creative.title || "Sponsored"}
        muted={false}
        externalPayload={creative.external_payload}
        onVideoQualifiedView={handleVideoQualifiedView}
        className="max-h-[70vh] w-full rounded-2xl bg-black/40 object-contain"
      />
      <div className="mt-3">
        <h3 className="text-base font-semibold text-white">
          {creative.title || "Sponsored content"}
        </h3>
        {creative.description ? (
          <div className="mt-1">
            <p
              ref={captionRef}
              className="whitespace-pre-wrap break-words text-sm leading-6 text-white/75"
              onClick={() => {
                if (captionOverflowing) {
                  setCaptionExpanded((current) => !current);
                }
              }}
              style={
                captionExpanded
                  ? undefined
                  : {
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 3,
                      overflow: "hidden",
                      cursor: captionOverflowing ? "pointer" : "text",
                    }
              }
            >
              {creative.description}
            </p>
            {captionOverflowing ? (
              <button
                type="button"
                onClick={() => setCaptionExpanded((current) => !current)}
                className="mt-1 text-sm font-medium text-white/65 transition-colors hover:text-white"
              >
                {captionExpanded ? "See less" : "See more"}
              </button>
            ) : null}
          </div>
        ) : null}
        {safeTargetUrl ? (
          <a
            href={safeTargetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="mt-3 inline-flex h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#0b0e13]"
          >
            Learn more
          </a>
        ) : null}
      </div>
    </article>
  );
}
