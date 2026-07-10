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
import { useLiveStream } from "@/hooks/use-live-stream";
import { useLiveKitStream } from "@/hooks/use-livekit-stream";
import { useLiveNotificationCount } from "@/hooks/use-live-notification-count";
import {
  DeliveryResponse,
  requestAdDeliveries,
  trackAdEvent,
} from "@/lib/ads-delivery";
import axiosInstance from "@/lib/axios";
import { isPostMediaReadyForDisplay } from "@/lib/post-media-readiness";
import { getSafeExternalUrl } from "@/lib/url-guard";
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
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type Post = CommunityPost;
type FeedMode = "for-you" | "following";
const HOME_FEED_PAGE_SIZE = 15;
const DASHBOARD_FEED_SEEDS_STORAGE_KEY = "karaads:dashboard:feed-seeds:v1";
const dashboardFeedSeeds: Partial<Record<FeedMode, string>> = {};

const FEED_CACHE_KEY = "karaads:feed-cache:v5";

function loadFeedCache(mode: FeedMode, userId: string | undefined) {
  try {
    const raw = localStorage.getItem(`${FEED_CACHE_KEY}:${mode}:${userId ?? "guest"}`);
    if (!raw) return undefined;
    const { ts, pages, pageParams }: { ts: number; pages: PostsResponse[]; pageParams: unknown[] } = JSON.parse(raw);
    if (Date.now() - ts > 30 * 60 * 1000) return undefined;
    return { data: { pages, pageParams } as InfiniteData<PostsResponse>, updatedAt: ts };
  } catch {
    return undefined;
  }
}

function saveFeedCache(mode: FeedMode, userId: string | undefined, data: InfiniteData<PostsResponse>) {
  try {
    localStorage.setItem(
      `${FEED_CACHE_KEY}:${mode}:${userId ?? "guest"}`,
      JSON.stringify({ ts: Date.now(), pages: data.pages.slice(0, 3), pageParams: data.pageParams.slice(0, 3) }),
    );
  } catch {}
}

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

interface LiveStreamEventPayload {
  stream?: LiveFeedStream | null;
}

interface PostsResponse {
  data: FeedApiItem[];
  links: { next: string | null };
  meta: {
    current_page: number;
    last_page: number;
    links?: {
      next?: string | null;
      prev?: string | null;
    };
  };
}

interface LiveStreamsResponse {
  data: LiveFeedStream[];
}

interface FollowingUsersResponse {
  data: Array<{ id: string }>;
}

const FOLLOWING_QUERY_KEY = ["dashboard", "following-map"] as const;
const SHARE_TEXT = "Check out this post on Kara Ads";

function createStableFeedSeed(mode: FeedMode): string {
  if (dashboardFeedSeeds[mode]) {
    return dashboardFeedSeeds[mode] as string;
  }

  let seed = "";

  if (typeof window !== "undefined") {
    try {
      const stored = window.sessionStorage.getItem(DASHBOARD_FEED_SEEDS_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) as Partial<Record<FeedMode, string>> : {};
      const existing = typeof parsed?.[mode] === "string" ? parsed[mode] : "";

      if (existing) {
        dashboardFeedSeeds[mode] = existing;
        return existing;
      }

      seed =
        "crypto" in window && "randomUUID" in window.crypto
          ? window.crypto.randomUUID()
          : `home-posts-${mode}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const next = { ...parsed, [mode]: seed };
      window.sessionStorage.setItem(DASHBOARD_FEED_SEEDS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      seed = `home-posts-${mode}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }

  if (!seed) {
    seed = `home-posts-${mode}`;
  }

  dashboardFeedSeeds[mode] = seed;
  return seed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeDashboardFeedItem(item: unknown): FeedApiItem | null {
  if (!isRecord(item)) return null;

  if (item.type === "live_stream" && isRecord(item.live_stream)) {
    const liveStream = item.live_stream as LiveFeedStream;
    return {
      type: "live_stream",
      id: String(item.id ?? liveStream.id ?? ""),
      score: typeof item.score === "number" ? item.score : undefined,
      live_stream: liveStream,
    };
  }

  if (item.type === "post" && isRecord(item.post)) {
    const post = item.post as Post;
    return {
      type: "post",
      id: String(item.id ?? post.id ?? ""),
      score: typeof item.score === "number" ? item.score : undefined,
      post,
    };
  }

  if (item.id && isRecord(item.user) && Array.isArray(item.media)) {
    return {
      type: "post",
      id: String(item.id),
      post: item as Post,
    };
  }

  return null;
}

function normalizeDashboardFeedPage(payload: unknown): PostsResponse {
  const record = isRecord(payload) ? payload : {};
  const rawData = Array.isArray(record.data)
    ? record.data
    : isRecord(record.data) && Array.isArray(record.data.data)
      ? record.data.data
      : [];
  const data = rawData
    .map(normalizeDashboardFeedItem)
    .filter((item): item is FeedApiItem => Boolean(item));

  const meta = isRecord(record.meta) ? record.meta : {};
  const links = isRecord(record.links)
    ? record.links
    : isRecord(meta.links)
      ? meta.links
      : {};

  return {
    data,
    links: {
      next: typeof links.next === "string" ? links.next : null,
    },
    meta: {
      current_page: Number(meta.current_page ?? 1),
      last_page: Number(meta.last_page ?? 1),
    },
  };
}

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

function HomeLivePreviewPlayer({
  streamId,
  hostUserId,
  currentUserId,
  active,
}: {
  streamId: string;
  hostUserId?: string | number | null;
  currentUserId?: string | number | null;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [forceP2PFallback, setForceP2PFallback] = useState(false);
  const enabled = Boolean(active && visible && streamId);
  const livekit = useLiveKitStream({
    streamId,
    role: "viewer",
    enabled,
  });
  const {
    connected: livekitConnected,
    remoteStream: livekitRemoteStream,
    restart: restartLiveKit,
    status: livekitStatus,
  } = livekit;
  const p2pEnabled = Boolean(
    enabled &&
    currentUserId &&
    hostUserId &&
    (livekitStatus === "disabled" || livekitStatus === "failed" || forceP2PFallback),
  );
  const { remoteStream: p2pRemoteStream, connectionState, requestReconnect } = useLiveStream({
    streamId,
    role: "viewer",
    currentUserId: currentUserId || "",
    hostUserId: hostUserId || "",
    enabled: p2pEnabled,
  });
  const remoteStream = livekitRemoteStream ?? p2pRemoteStream;
  const previewStatus = livekitConnected ? "connected" : livekitStatus === "connecting" ? "connecting" : connectionState;

  useEffect(() => {
    if (!enabled || livekitRemoteStream || livekitStatus === "disabled" || livekitStatus === "failed") {
      const resetTimer = window.setTimeout(() => {
        setForceP2PFallback(false);
      }, 0);

      return () => window.clearTimeout(resetTimer);
    }

    if (livekitStatus !== "connecting" && livekitStatus !== "connected") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setForceP2PFallback(true);
    }, livekitStatus === "connected" ? 900 : 1100);

    return () => window.clearTimeout(timeout);
  }, [enabled, livekitRemoteStream, livekitStatus]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting || (entry?.intersectionRatio ?? 0) >= 0.01)),
      { rootMargin: "320px 0px", threshold: [0, 0.01, 0.15] },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !remoteStream || !enabled) {
      const resetTimer = window.setTimeout(() => {
        setReady(false);
      }, 0);

      return () => window.clearTimeout(resetTimer);
    }

    if (video.srcObject !== remoteStream) {
      video.srcObject = remoteStream;
    }
    video.muted = true;
    video.playsInline = true;
    video.play()
      .then(() => setReady(true))
      .catch(() => setReady(false));

    return () => {
      setReady(false);
      video.srcObject = null;
      video.load();
    };
  }, [enabled, remoteStream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !remoteStream || !enabled) {
      return;
    }

    if (!visible) return;

    let lastTime = -1;
    let stalledTicks = 0;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;

      const video = videoRef.current;
      if (!video) return;

      const hasLiveVideoTrack = remoteStream
        .getVideoTracks()
        .some((track) => track.readyState === "live" && !track.muted);

      if (!hasLiveVideoTrack) {
        stalledTicks += 1;
      } else if (video.paused) {
        video.play().catch(() => {});
        stalledTicks += 1;
      } else if (video.readyState < 2) {
        stalledTicks += 1;
      } else if (lastTime >= 0 && Math.abs(video.currentTime - lastTime) < 0.05) {
        stalledTicks += 1;
      } else {
        stalledTicks = 0;
      }

      lastTime = video.currentTime;

      if (stalledTicks >= 3) {
        stalledTicks = 0;
        setReady(false);
        restartLiveKit();
        requestReconnect();
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [enabled, remoteStream, requestReconnect, restartLiveKit, visible]);

  return (
    <>
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
        autoPlay
        muted
        playsInline
        preload="auto"
      />
      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-[28px] border border-white/15 bg-black/24 px-6 py-5 text-center shadow-[0_25px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <Radio className="h-9 w-9 animate-pulse text-white" />
            <div>
              <p className="text-sm font-black text-white">
                {previewStatus === "connecting" ? "Loading live..." : "Starting live..."}
              </p>
              {["failed", "disconnected", "closed"].includes(String(previewStatus)) ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    requestReconnect();
                  }}
                  className="mt-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#111827]"
                >
                  Retry
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function HomeLiveStreamCard({
  stream,
  isFollowing,
  followBusy,
  showFollowButton,
  onFollow,
  onShare,
  currentUserId,
}: {
  stream: LiveFeedStream;
  isFollowing: boolean;
  followBusy: boolean;
  showFollowButton: boolean;
  onFollow: (userId: string) => void;
  onShare: (stream: LiveFeedStream) => void;
  currentUserId?: string | number;
}) {
  const navigate = useNavigate();
  const hostName = stream.user?.name ?? "Creator";
  const avatar = getLiveAvatarSrc(stream.user);
  const [isStillLive, setIsStillLive] = useState(stream.status === "live");
  const [liked, setLiked] = useState(Boolean(stream.user_liked));
  const [likesCount, setLikesCount] = useState(stream.likes_count ?? 0);
  const [liking, setLiking] = useState(false);
  useEffect(() => {
    if (stream.status !== "live") {
      setIsStillLive(false);
      return;
    }

    let stopped = false;
    const verifyLiveStatus = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/live/streams/${stream.id}`);
        const payload = data?.data ?? data;
        if (!stopped && payload?.status !== "live") {
          setIsStillLive(false);
        }
      } catch {
        // Keep showing the live on a temporary verification failure. The polling
        // list and live-ended event will remove it when the stream truly ends.
      }
    };

    verifyLiveStatus().catch(() => {});

    return () => {
      stopped = true;
    };
  }, [stream.id, stream.status]);

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

  if (!isStillLive) {
    return null;
  }

  return (
    <article className="overflow-hidden rounded-[30px] border border-white/10 bg-[#090d16] text-white shadow-[0_22px_60px_rgba(0,0,0,0.34)]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/live/${stream.id}`)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            navigate(`/live/${stream.id}`);
          }
        }}
        className="group relative block h-[520px] w-full overflow-hidden bg-[radial-gradient(circle_at_20%_14%,rgba(255,255,255,0.28),transparent_24%),linear-gradient(135deg,#f02849_0%,#111827_46%,#020617_100%)] text-left sm:h-[620px] lg:h-[680px]"
      >
        <div className="absolute inset-0 opacity-45 transition duration-700 group-hover:scale-105 group-hover:opacity-60">
          {avatar ? <img src={avatar} alt={hostName} className="h-full w-full object-cover blur-2xl" /> : null}
        </div>
        <HomeLivePreviewPlayer
          streamId={stream.id}
          hostUserId={stream.user?.id}
          currentUserId={currentUserId}
          active={isStillLive}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.08)_32%,rgba(0,0,0,0.24)_58%,rgba(0,0,0,0.9)_100%)]" />
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
        <div className="absolute bottom-4 left-4 right-20">
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
        <div className="absolute bottom-5 right-4 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={toggleLike}
            disabled={liking || !currentUserId}
            className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/15 shadow-[0_16px_34px_rgba(0,0,0,0.35)] backdrop-blur-xl transition active:scale-95 disabled:opacity-50 ${
              liked ? "bg-[#f02849] text-white" : "bg-black/30 text-white"
            }`}
            aria-label="Like live stream"
          >
            <Heart className={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
          </button>
          <button
            type="button"
            onClick={openComments}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white shadow-[0_16px_34px_rgba(0,0,0,0.35)] backdrop-blur-xl transition active:scale-95"
            aria-label="Open live comments"
          >
            <MessageCircleMore className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onShare(stream);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white text-[#111827] shadow-[0_16px_34px_rgba(0,0,0,0.35)] transition active:scale-95"
            aria-label="Share live stream"
          >
            <Send className="h-5 w-5" />
          </button>
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
    <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_16px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 rounded-full bg-muted" />
            <Skeleton className="h-3 w-24 rounded-full bg-muted" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full bg-muted" />
        </div>
        <div className="mb-4 space-y-2">
          <Skeleton className="h-3.5 w-[88%] rounded-full bg-muted" />
          <Skeleton className="h-3.5 w-[72%] rounded-full bg-muted" />
        </div>
      </div>

      <Skeleton className="h-[320px] w-full rounded-none bg-muted" />

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between text-xs">
          <Skeleton className="h-4 w-20 rounded-full bg-muted" />
          <Skeleton className="h-4 w-24 rounded-full bg-muted" />
        </div>

        <div className="grid grid-cols-3 gap-2 border-y border-border py-3">
          <Skeleton className="h-9 rounded-full bg-muted" />
          <Skeleton className="h-9 rounded-full bg-muted" />
          <Skeleton className="h-9 rounded-full bg-muted" />
        </div>

        <div className="mt-3 flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-[82%] rounded-full bg-muted" />
            <Skeleton className="h-3.5 w-[58%] rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeComposerSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_16px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full bg-muted" />
          <Skeleton className="h-11 flex-1 rounded-full bg-muted" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <Skeleton className="h-10 rounded-2xl bg-muted" />
          <Skeleton className="h-10 rounded-2xl bg-muted" />
          <Skeleton className="h-10 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

function HomeStoriesSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,28,0.96),rgba(8,11,19,0.92))] shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
      <div className="px-4 pb-4 pt-3">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-5 w-28 rounded-full bg-white/10" />
          <Skeleton className="h-4 w-16 rounded-full bg-white/10" />
        </div>
        <div className="flex min-w-max items-start gap-2.5 overflow-x-auto no-scrollbar">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={`home-loading-story-${idx}`} className="w-[66px] shrink-0">
              <Skeleton className="mb-2 h-[76px] w-[58px] rounded-[18px] bg-muted" />
              <Skeleton className="mx-auto h-3 w-12 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeFeedLoadingState() {
  return (
    <>
      <HomeComposerSkeleton />
      <HomeStoriesSkeleton />
      {Array.from({ length: 3 }).map((_, i) => (
        <PostCardSkeleton key={`post-skeleton-${i}`} />
      ))}
    </>
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
  const cachedFeed = useMemo(
    () => loadFeedCache(feedMode, auth?.user?.id ? String(auth.user.id) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feedMode, auth?.user?.id],
  );
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
  const [eventLiveStreams, setEventLiveStreams] = useState<Record<string, LiveFeedStream>>({});
  const adSessionIdRef = useRef<string>(
    typeof window !== "undefined" &&
      "crypto" in window &&
      "randomUUID" in window.crypto
      ? window.crypto.randomUUID()
      : `home-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const [postShuffleSeed] = useState(() => (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : `feed-${feedMode}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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
    () => ["dashboard", "posts", feedMode, postShuffleSeed] as const,
    [feedMode, postShuffleSeed],
  );

  const {
    data: postsData,
    isLoading: postsLoading,
    isError: postsIsError,
    error: postsError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    queryKey: postsQueryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const endpoint = "/api/posts/feed";
      const response = await axiosInstance.get<PostsResponse>(endpoint, {
        params: {
          feed: feedMode,
          lite: 1,
          page: pageParam,
          per_page: HOME_FEED_PAGE_SIZE,
          shuffle_seed: postShuffleSeed,
        },
      });

      const normalizedFeed = normalizeDashboardFeedPage(response.data);
      if (pageParam !== 1 || normalizedFeed.data.length > 0) {
        return normalizedFeed;
      }

      const fallbackResponse = await axiosInstance.get<PostsResponse>("/api/posts", {
        params: {
          lite: 1,
          page: pageParam,
          per_page: HOME_FEED_PAGE_SIZE,
          shuffle_seed: postShuffleSeed,
        },
      });

      return normalizeDashboardFeedPage(fallbackResponse.data);
    },
    getNextPageParam: (lastPage) => {
      const hasMore =
        Boolean(lastPage.links?.next ?? lastPage.meta.links?.next) &&
        lastPage.meta.current_page < lastPage.meta.last_page;
      return hasMore ? lastPage.meta.current_page + 1 : undefined;
    },
    initialData: cachedFeed?.data,
    initialDataUpdatedAt: 0,
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    if (postsData?.pages?.length) {
      saveFeedCache(feedMode, auth?.user?.id ? String(auth.user.id) : undefined, postsData);
    }
  }, [postsData, feedMode, auth?.user?.id]);

  const { data: activeLiveStreams = [] } = useQuery({
    queryKey: ["dashboard", "active-live-streams", feedMode],
    queryFn: async () => {
      const response = await axiosInstance.get<LiveStreamsResponse>("/api/live/streams", {
        params: { page: 1 },
      });
      const streams = Array.isArray(response.data?.data) ? response.data.data : [];
      return streams
        .filter((stream) => stream.status === "live")
        .filter((stream, index, list) => {
          const userId = stream.user?.id ? String(stream.user.id) : "";
          if (!userId) return true;

          return list.findIndex((candidate) => String(candidate.user?.id ?? "") === userId) === index;
        });
    },
    enabled: Boolean(auth?.user?.id) && Boolean(postsData?.pages?.length),
    refetchInterval: 120_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 60_000,
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
      enabled: Boolean(auth?.user?.id) && Boolean(postsData?.pages?.length),
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
    refetchOnReconnect: false,
    refetchOnMount: false,
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
    refetchOnReconnect: false,
    refetchOnMount: false,
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
      const response = await axiosInstance.get<Post | { data?: Post }>(`/api/posts/${targetPostId}`);
      const payload = response.data;

      if (payload && typeof payload === "object" && "data" in payload && payload.data) {
        return payload.data;
      }

      return payload as Post;
    },
    enabled: Boolean(targetPostId),
    staleTime: 60_000,
  });
  const cardPosts = useMemo(
    () => {
      const visiblePosts = dedupeHomePosts(posts).filter((post) =>
        Boolean(post?.id && post?.user?.id),
      );

      if (
        targetPost?.id &&
        targetPost?.user?.id &&
        targetPost?.user?.username &&
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
    const visibleActiveLives = [
      ...Object.values(eventLiveStreams),
      ...activeLiveStreams,
    ].filter((stream) => stream.status === "live");
    const activeLiveItems = visibleActiveLives.map((stream) => ({
      kind: "live_stream" as const,
      stream,
      key: `active-live-${stream.id}`,
    }));

    const seenPostIds = new Set<string>();
    mixedItems.forEach((feedItem, index) => {
      if (feedItem.type === "live_stream") {
        items.push({
          kind: "live_stream",
          stream: feedItem.live_stream,
          key: `live-${feedItem.live_stream.id}`,
        });
      } else {
        const postId = String(feedItem.post.id);
        if (seenPostIds.has(postId)) return;
        seenPostIds.add(postId);
        const post =
          cardPosts.find((candidate) => String(candidate.id) === postId) ??
          feedItem.post;
        if (!post) return;
        if (!isPostMediaReadyForDisplay(post)) return;
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

    const seenLiveUsers = new Set<string>();
    const seenLiveIds = new Set<string>();
    const merged = [...activeLiveItems, ...items].filter((item) => {
      if (item.kind !== "live_stream") return true;

      const liveId = String(item.stream.id);
      const userId = item.stream.user?.id ? String(item.stream.user.id) : "";
      const userKey = userId ? `user:${userId}` : `live:${liveId}`;

      if (seenLiveIds.has(liveId) || seenLiveUsers.has(userKey)) {
        return false;
      }

      seenLiveIds.add(liveId);
      seenLiveUsers.add(userKey);
      return true;
    });

    return merged;
  }, [activeLiveStreams, cardPosts, eventLiveStreams, homeAds, postsData]);
  const isInitialFeedLoading = postsLoading && feedItems.length === 0;
  const isFeedError = postsIsError && feedItems.length === 0;
  const isFeedEmpty = !postsLoading && !postsIsError && feedItems.length === 0;

  useEffect(() => {
    if (!postsData?.pages?.length) return;
    fetchGroups(feedMode);
  }, [fetchGroups, feedMode, postsData]);

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
    enabled: Boolean(auth?.user?.id),
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
      if (stream.status === "live") {
        setEventLiveStreams((current) => ({
          ...current,
          [stream.id]: stream,
        }));
      }

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
              data: [liveItem, ...pages[0].data].slice(0, HOME_FEED_PAGE_SIZE),
            };
          }

          return { ...old, pages };
        },
      );
    };

    const removeLiveStream = (streamId: string) => {
      setEventLiveStreams((current) => {
        if (!(streamId in current)) return current;
        const next = { ...current };
        delete next[streamId];
        return next;
      });

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
    channel.listen(".live.stream.started", (payload: LiveStreamEventPayload) => {
      if (payload?.stream?.id) {
        upsertLiveStream(payload.stream);
        queryClient.invalidateQueries({ queryKey: postsQueryKey }).catch(() => {});
      }
    });
    channel.listen(".live.stream.updated", (payload: LiveStreamEventPayload) => {
      if (!payload?.stream?.id) return;
      if (payload.stream.status === "live") {
        upsertLiveStream(payload.stream);
        queryClient.invalidateQueries({ queryKey: postsQueryKey }).catch(() => {});
        return;
      }
      removeLiveStream(payload.stream.id);
    });
    channel.listen(".live.stream.ended", (payload: LiveStreamEventPayload) => {
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
    onSuccess: (_data, { isCurrentlyReshared }) => {
      toast.success(isCurrentlyReshared ? "Repost removed" : "Reposted");
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
      toast.error("Could not repost. Please try again.");
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
  const badgeProfile = currentUser as
    | {
        has_verification_badge?: boolean;
        kara_verified_at?: string | null;
        kara_verified_expires_at?: string | null;
      }
    | undefined;
  const badgeGrantedAt = badgeProfile?.kara_verified_at ?? null;
  const badgeGrantedDate = badgeGrantedAt ? new Date(badgeGrantedAt) : null;
  const badgeGrantedIsValid =
    badgeGrantedDate instanceof Date && !Number.isNaN(badgeGrantedDate.getTime());
  const badgeGrantedLabel = badgeGrantedIsValid && badgeGrantedDate
    ? badgeGrantedDate.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not set";
  const badgeExpiresAt = badgeProfile?.kara_verified_expires_at ?? null;
  const badgeExpiresDate = badgeExpiresAt ? new Date(badgeExpiresAt) : null;
  const badgeExpiryIsValid =
    badgeExpiresDate instanceof Date && !Number.isNaN(badgeExpiresDate.getTime());
  const badgeExpiryLabel = badgeExpiryIsValid && badgeExpiresDate
    ? badgeExpiresDate.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not set";
  const userHasVerificationBadge = Boolean(
    currentUser?.is_verified || badgeProfile?.has_verification_badge,
  );
  const badgeHasExpired = Boolean(
    currentUser &&
      badgeProfile?.kara_verified_at &&
      badgeExpiryIsValid &&
      badgeExpiresDate !== null &&
      badgeExpiresDate.getTime() <= Date.now() &&
      !userHasVerificationBadge,
  );
  const showVerificationBadgeCard = Boolean(currentUser);
  const verificationCardTitle = userHasVerificationBadge
    ? "Your badge is active"
    : badgeHasExpired
      ? "Renew your badge for N5,000"
      : "Get your badge for N5,000";
  const verificationCardDescription = userHasVerificationBadge
    ? `Your Kara Verified badge expires on ${badgeExpiryLabel}. Renew when it expires to keep the badge and creator reward benefits.`
    : badgeHasExpired
      ? `Your Kara Verified badge expired on ${badgeExpiryLabel}. Renew for another 30 days.`
      : "Pay with Paystack, request the badge, and earn N30 for approved 30s+ videos posted from June 1, 2026.";
  const verificationButtonLabel = userHasVerificationBadge
    ? "View badge details"
    : badgeHasExpired
      ? "Renew N5,000"
      : "Pay N5,000";

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
            <div className="mx-auto max-w-[430px] overflow-hidden rounded-[28px] border border-border bg-background/95 shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:max-w-5xl xl:max-w-6xl">
              <div className="px-4 pb-2.5 pt-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleStartLiveFromHome}
                    disabled={creatingLive}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted text-foreground"
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
                    <span className="text-[17px] font-extrabold tracking-tight text-foreground">
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
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted text-foreground backdrop-blur transition hover:bg-muted/80"
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
                      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted text-foreground backdrop-blur transition hover:bg-muted/80"
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
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {tab.label}
                        {isActive ? (
                          <span className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-foreground" />
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
                        <div className="h-full w-full overflow-hidden rounded-[16px] bg-muted">
                          {currentUserStoryGroup ? (
                            <StoryStatusPreview
                              group={currentUserStoryGroup}
                              fallbackName={currentUser?.name}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-foreground">
                              {getFirstName(currentUser?.name).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="line-clamp-1 text-xs font-medium text-foreground">
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
                            <Skeleton className="mx-auto h-3 w-12 bg-muted" />
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
                            <p className="line-clamp-1 text-xs font-medium text-foreground">
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
        <div className="pb-3 pt-1 lg:px-0">
          <div className="mx-auto w-full max-w-[430px] lg:max-w-[920px] xl:max-w-[980px]">
            {showVerificationBadgeCard ? (
              <div className="overflow-hidden rounded-[24px] border border-border bg-card p-4 text-foreground shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">
                        Kara Verified
                      </p>
                      <h2 className="mt-1 text-lg font-extrabold">{verificationCardTitle}</h2>
                      {badgeProfile?.kara_verified_at ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            Verified: {badgeGrantedLabel}
                          </span>
                          <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            {userHasVerificationBadge ? "Expires" : "Expired"}: {badgeExpiryLabel}
                          </span>
                        </div>
                      ) : null}
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        {verificationCardDescription}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/settings/verification")}
                    className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:border-primary/80"
                  >
                    {verificationButtonLabel}
                  </button>
                </div>
              </div>
            ) : null}

            {isInitialFeedLoading
              ? <HomeFeedLoadingState />
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

            {isFeedError ? (
              <div className="rounded-[24px] border border-white/10 bg-white/6 px-5 py-6 text-center text-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                <p className="text-base font-black text-white">
                  We could not load the home feed right now.
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {postsError instanceof Error
                    ? postsError.message
                    : "Please try again in a moment."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void refetchPosts();
                  }}
                  className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-black text-[#07111f]"
                >
                  Try again
                </button>
              </div>
            ) : null}

            {isFeedEmpty ? (
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
          {isFetchingNextPage && feedItems.length > 0 ? (
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
