import CommentSection from "@/components/comment";
import { InVideoAdBreak } from "@/components/ads/in-video-ad-break";
import { MediaCarousel } from "@/components/media-carousel";
import { LoadingImage, LoadingVideo } from "@/components/post-media-loader";
import { Link, router } from "@/components/page-head";
import { PostOwnerActions } from "@/components/post-owner-actions";
import { VerifiedBadge } from "@/components/verified-badge";
import axiosInstance from "@/lib/axios";
import { getPresenceState } from "@/lib/presence";
import { formatRelativeTimeShort } from "@/lib/time";
import {
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Rocket,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface CommunityUser {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  avatar?: string;
  is_verified?: boolean;
  is_online?: boolean;
  last_seen_at?: string | null;
}

export interface CommunityMedia {
  id: string;
  path: string;
  url?: string;
  thumbnail?: string;
  type: string;
  file_type?: string;
  mime_type?: string;
  processing_status?: "queued" | "processing" | "ready" | "failed" | "skipped" | string | null;
}

export interface CommunityBusinessPage {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  category?: string | null;
  avatar?: string | null;
  follower_count?: number;
  is_owner?: boolean;
  is_following?: boolean;
}

export interface CommunityPost {
  id: string;
  content: string;
  type: "post" | "repost";
  created_at: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  view_count?: number;
  save_count?: number;
  music_url?: string | null;
  music_title?: string | null;
  media: CommunityMedia[];
  user: CommunityUser;
  business_page?: CommunityBusinessPage | null;
  user_liked: boolean;
  user_reshared: boolean;
  user_saved?: boolean;
  live_replay?: {
    id: string;
    title?: string | null;
    started_at?: string | null;
    ended_at?: string | null;
    status?: string | null;
  } | null;
  original_post?: CommunityPost;
}

interface CommunityPostCardProps {
  post: CommunityPost;
  currentUserId?: string;
  isFollowing: boolean;
  followBusy: boolean;
  showFollowButton?: boolean;
  momentsFeedMode?: "for-you" | "following";
  onFollow: (userId: string) => void;
  onLike: (post: CommunityPost) => void;
  onReshare: (post: CommunityPost) => void;
  onShare: (postId: string) => void;
  onSave: (post: CommunityPost) => void;
  onPostUpdated: (
    postId: string,
    updates: { content: string; media: CommunityMedia[] },
  ) => void;
  onPostDeleted: (postId: string) => void;
  autoPlayVideo?: boolean;
}

function resolveRepostSource(post: CommunityPost): CommunityPost {
  let current = post;
  let depth = 0;

  while (current.type === "repost" && current.original_post && depth < 8) {
    current = current.original_post;
    depth += 1;
  }

  return current;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

function getFirstName(name?: string | null): string {
  const trimmed = name?.trim();
  if (!trimmed) return "User";
  return trimmed.split(/\s+/)[0] || "User";
}

function isVideoMedia(media?: CommunityMedia | null): boolean {
  const type = String(media?.type ?? media?.file_type ?? "").toLowerCase();
  const mime = String(media?.mime_type ?? "").toLowerCase();
  const path = String(media?.path ?? "").toLowerCase();

  return (
    type === "video" ||
    mime.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/.test(path)
  );
}

function formatLiveReplayDate(value?: string | null): string {
  if (!value) return "recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CommunityPostCard({
  post,
  currentUserId,
  isFollowing,
  followBusy,
  showFollowButton = true,
  onFollow,
  onLike,
  onReshare,
  onShare,
  onPostUpdated,
  onPostDeleted,
  autoPlayVideo = false,
  momentsFeedMode = "for-you",
}: CommunityPostCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [captionOverflowing, setCaptionOverflowing] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isVideoSoundOn, setIsVideoSoundOn] = useState(false);
  const [commentsMounted, setCommentsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dwellRecordedRef = useRef<Set<string>>(new Set());
  const sourcePost = resolveRepostSource(post);
  const liveReplay = sourcePost.live_replay ?? null;
  const liveReplayTime = liveReplay?.ended_at || liveReplay?.started_at || sourcePost.created_at;
  const sourcePage = sourcePost.business_page ?? null;
  const mediaItems = sourcePost.media ?? [];
  const displayContent = sourcePost.content || post.content;
  const hasCaption = Boolean(displayContent?.trim().length);
  const hasMedia = mediaItems.length > 0;
  const hasMultipleMedia = mediaItems.length > 1;
  const activeMedia = mediaItems[activeMediaIndex];
  const activeMediaIsImage = Boolean(
    activeMedia &&
      !isVideoMedia(activeMedia),
  );
  const activeMediaIsVideo = Boolean(activeMedia && isVideoMedia(activeMedia));
  const midrollResetKey = `${sourcePost.id}:${activeMedia?.id ?? activeMediaIndex}`;
  const getActiveVideoElement = useCallback(
    () => videoRefs.current[activeMediaIndex] ?? null,
    [activeMediaIndex],
  );
  const collapsedCaptionLines = hasMedia ? 3 : 8;
  const canFollow = Boolean(
    !sourcePage && showFollowButton && currentUserId && currentUserId !== post.user.id,
  );
  const [pageFollowing, setPageFollowing] = useState(Boolean(sourcePage?.is_following));
  const [pageFollowBusy, setPageFollowBusy] = useState(false);
  const canFollowPage = Boolean(
    showFollowButton &&
      sourcePage &&
      currentUserId &&
      currentUserId !== sourcePage.owner_user_id &&
      !sourcePage.is_owner,
  );
  const isOwner = Boolean(currentUserId && currentUserId === sourcePost.user.id);
  const relativeTime = formatRelativeTimeShort(post.created_at);
  const plainCaption = hasCaption ? displayContent.trim() : "";
  const presence = getPresenceState(post.user);
  const displayName = sourcePage ? sourcePage.name : getFirstName(post.user.name);
  const authorHandle = typeof post.user.username === "string" ? post.user.username.trim() : "";
  const authorHref = sourcePage ? `/pages/${sourcePage.slug}` : authorHandle ? `/@${authorHandle}` : "#";
  const authorAvatar = sourcePage?.avatar ?? post.user.avatar;
  const authorSubtitle = sourcePage
    ? `${sourcePage.category || "Business page"}${authorHandle ? ` · by @${authorHandle}` : ""}`
    : `${authorHandle ? `@${authorHandle}` : "Kara Ads member"}${
        presence.isOnline
          ? ` · ${presence.statusLabel}`
          : presence.detailLabel
            ? ` · ${presence.detailLabel}`
            : ""
      }`;
  const momentsHref = `/app/moments?${new URLSearchParams({
    ...(momentsFeedMode === "following" ? { feed: "following" } : {}),
    post: sourcePost.id,
  }).toString()}`;
  const openReelPage = () => {
    router.visit(momentsHref);
  };

  const togglePageFollow = async () => {
    if (!sourcePage || pageFollowBusy) return;
    const nextFollowing = !pageFollowing;
    setPageFollowing(nextFollowing);
    setPageFollowBusy(true);

    try {
      await axiosInstance.post(
        `/api/business-pages/${sourcePage.slug}/${nextFollowing ? "follow" : "unfollow"}`,
      );
    } catch {
      setPageFollowing(!nextFollowing);
    } finally {
      setPageFollowBusy(false);
    }
  };

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35,
        );
        setIsCardVisible(visible);
      },
      { threshold: [0, 0.35, 0.7] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [post.id]);

  useEffect(() => {
    videoRefs.current = [];
  }, [post.id]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      const shouldPlay = Boolean(
        autoPlayVideo &&
          isCardVisible &&
          index === activeMediaIndex &&
          isVideoMedia(mediaItems[index]),
      );

      video.muted = !isVideoSoundOn;
      video.playsInline = true;
      video.preload = shouldPlay ? "auto" : "metadata";

      if (shouldPlay) {
        if (video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
          video.load();
        }
        video.play().catch(() => {
          // Mobile browsers may still require one user gesture before playback.
        });
      } else {
        video.pause();
      }
    });
  }, [activeMediaIndex, autoPlayVideo, isCardVisible, isVideoSoundOn, mediaItems]);

  useEffect(() => {
    if (!isCardVisible || !currentUserId || dwellRecordedRef.current.has(sourcePost.id)) {
      return;
    }

    const timer = window.setTimeout(() => {
      dwellRecordedRef.current.add(sourcePost.id);
      axiosInstance
        .post(`/api/posts/${sourcePost.id}/engagement`, {
          event_type: "dwell",
          dwell_seconds: 10,
          surface: "feed",
        })
        .catch(() => {
          dwellRecordedRef.current.delete(sourcePost.id);
        });
    }, 10_000);

    return () => window.clearTimeout(timer);
  }, [currentUserId, isCardVisible, sourcePost.id]);

  useEffect(() => {
    const node = captionRef.current;
    if (!node || !hasCaption) return;

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
  }, [displayContent, hasCaption, collapsedCaptionLines, captionExpanded]);

  useEffect(() => {
    setActiveMediaIndex(0);
    setIsMusicPlaying(false);
    setIsVideoSoundOn(false);
    setPageFollowing(Boolean(sourcePage?.is_following));
  }, [post.id]);

  useEffect(() => {
    const audio = audioRef.current;
    const shouldPlay = Boolean(
      audio &&
        isMusicPlaying &&
        isCardVisible &&
        activeMediaIsImage &&
        sourcePost.music_url,
    );

    if (!audio) {
      return;
    }

    if (!shouldPlay) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    audio.play().catch(() => {
      setIsMusicPlaying(false);
    });
  }, [activeMediaIsImage, isCardVisible, isMusicPlaying, sourcePost.music_url]);

  return (
    <article
      ref={cardRef}
      className="overflow-hidden border-b border-border bg-card"
    >
      {/* Repost indicator */}
      {post.type === "repost" ? (
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-0 text-[12px] text-muted-foreground">
          <Repeat2 className="h-3.5 w-3.5" />
          <span>{getFirstName(post.user.name)} reposted</span>
        </div>
      ) : null}

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Link href={authorHref} className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border">
          {authorAvatar ? (
            <img src={authorAvatar} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-semibold text-muted-foreground">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {!sourcePage ? (
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${
                presence.isOnline ? "bg-emerald-400" : "bg-transparent"
              }`}
            />
          ) : null}
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={authorHref} className="flex items-center gap-1">
            <p className="truncate text-[13px] font-bold text-foreground">{displayName}</p>
            {!sourcePage && post.user.is_verified ? (
              <VerifiedBadge compact className="ml-0" />
            ) : null}
          </Link>
          <p className="truncate text-[11px] text-muted-foreground">
            {relativeTime ? relativeTime : ""}{authorHandle ? ` · @${authorHandle}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {canFollowPage ? (
            <button
              type="button"
              disabled={pageFollowBusy}
              onClick={(event) => { event.stopPropagation(); togglePageFollow(); }}
              className="rounded-full border border-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary disabled:opacity-60"
            >
              {pageFollowing ? "Following" : "Follow"}
            </button>
          ) : canFollow ? (
            <button
              type="button"
              disabled={followBusy}
              onClick={(event) => { event.stopPropagation(); onFollow(post.user.id); }}
              className="rounded-full border border-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary disabled:opacity-60"
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          ) : null}
          {isOwner ? (
            <PostOwnerActions
              postId={sourcePost.id}
              content={sourcePost.content}
              media={sourcePost.media}
              onPostUpdated={(updates) => onPostUpdated(post.id, updates)}
              onPostDeleted={() => onPostDeleted(post.id)}
              trigger={
                <button type="button" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              }
            />
          ) : null}
        </div>
      </div>

      {/* Live replay badge */}
      {liveReplay ? (
        <div className="px-4 pb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
            {liveReplay.title ? `Was live: ${liveReplay.title}` : "Was live"} · {formatLiveReplayDate(liveReplayTime)}
          </span>
        </div>
      ) : null}

      {/* Caption */}
      {hasCaption ? (
        <div className="px-3 pb-2">
          <p
            ref={captionRef}
            className="whitespace-pre-wrap break-words text-[13px] leading-[1.4] text-foreground"
            onClick={() => setCaptionExpanded((c) => !c)}
            style={
              captionExpanded
                ? undefined
                : {
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: collapsedCaptionLines,
                    overflow: "hidden",
                    cursor: captionOverflowing ? "pointer" : "text",
                  }
            }
          >
            {plainCaption}
          </p>
          {captionOverflowing ? (
            <button
              type="button"
              onClick={() => setCaptionExpanded((c) => !c)}
              className="mt-1 text-xs font-semibold text-muted-foreground"
            >
              {captionExpanded ? "Show less" : "more"}
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Media */}
      {hasMedia ? (
        <div className="relative overflow-hidden">
          {sourcePost.music_url ? (
            <audio ref={audioRef} src={sourcePost.music_url} preload="metadata" />
          ) : null}
          <MediaCarousel
            items={mediaItems}
            resetKey={post.id}
            trackClassName="h-[300px] sm:h-[380px]"
            slideClassName="h-[300px] sm:h-[380px]"
            onActiveIndexChange={setActiveMediaIndex}
            renderItem={(media, index, isActive) => {
              const isVideo = isVideoMedia(media);
              const mediaSrc = isVideo ? media.thumbnail : media.thumbnail || media.path;
              const canAutoPlay = Boolean(
                isVideo && autoPlayVideo && isActive && isCardVisible && media.path,
              );
              const mediaContent =
                isVideo && media.path ? (
                  <LoadingVideo
                    ref={(node) => { videoRefs.current[index] = node; }}
                    src={media.path}
                    className="h-full w-full bg-black object-cover"
                    muted={!isVideoSoundOn}
                    loop
                    playsInline
                    autoPlay={canAutoPlay}
                    preload={isActive || canAutoPlay ? "auto" : "metadata"}
                    poster={media.thumbnail || undefined}
                  />
                ) : mediaSrc ? (
                  <LoadingImage
                    src={mediaSrc}
                    alt="Post content"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                    {displayContent || "Reshared post"}
                  </div>
                );

              if (isVideo) {
                return (
                  <button
                    type="button"
                    onClick={openReelPage}
                    className="relative block h-full w-full text-left"
                  >
                    {mediaContent}
                  </button>
                );
              }

              return (
                <Link href={momentsHref} className="relative block h-full w-full">
                  {mediaContent}
                </Link>
              );
            }}
          />
          <InVideoAdBreak
            enabled={Boolean(autoPlayVideo && isCardVisible && activeMediaIsVideo)}
            resetKey={midrollResetKey}
            getVideoElement={getActiveVideoElement}
            surface="feed"
            sessionSeed={`home-midroll-${sourcePost.id}`}
            context={{ page: "home", post_id: sourcePost.id, media_id: activeMedia?.id }}
            muted={!isVideoSoundOn}
          />
          {activeMediaIsVideo ? (
            <button
              type="button"
              data-no-reel-nav="true"
              onClick={(event) => { event.stopPropagation(); setIsVideoSoundOn((prev) => !prev); }}
              className="absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur"
              title={isVideoSoundOn ? "Mute" : "Sound"}
            >
              {isVideoSoundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>{isVideoSoundOn ? "Sound on" : "Sound"}</span>
            </button>
          ) : null}
          {sourcePost.music_url && activeMediaIsImage ? (
            <button
              type="button"
              onClick={() => setIsMusicPlaying((prev) => !prev)}
              className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1.5 text-xs text-white backdrop-blur"
            >
              {isMusicPlaying ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>{sourcePost.music_title || "Music"}</span>
            </button>
          ) : null}
          {hasMultipleMedia ? (
            <div
              className={`pointer-events-none absolute right-3 z-20 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur ${
                activeMediaIsVideo ? "top-[46px]" : "top-3"
              }`}
            >
              {activeMediaIndex + 1}/{mediaItems.length}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Action bar */}
      <div className="flex items-center justify-between border-t border-border/50 px-1 py-0.5 text-muted-foreground">
        {/* Like */}
        <button
          type="button"
          onClick={() => onLike(sourcePost)}
          className="flex flex-1 items-center justify-center gap-1 rounded-md py-2 hover:bg-muted"
        >
          <Heart className={`h-[18px] w-[18px] ${sourcePost.user_liked ? "fill-red-500 text-red-500" : ""}`} />
          <span className="text-[11px] font-semibold">{formatCount(sourcePost.like_count)}</span>
        </button>
        {/* Comment */}
        {commentsMounted ? (
          <CommentSection
            post={sourcePost}
            initialOpen
            trigger={
              <button type="button" className="flex flex-1 items-center justify-center gap-1 rounded-md py-2 hover:bg-muted">
                <MessageCircle className="h-[18px] w-[18px]" />
                <span className="text-[11px] font-semibold">{formatCount(sourcePost.comment_count || 0)}</span>
              </button>
            }
          />
        ) : (
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); setCommentsMounted(true); }}
            className="flex flex-1 items-center justify-center gap-1 rounded-md py-2 hover:bg-muted"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="text-[11px] font-semibold">{formatCount(sourcePost.comment_count || 0)}</span>
          </button>
        )}
        {/* Share */}
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onShare(sourcePost.id); }}
          className="flex flex-1 items-center justify-center gap-1 rounded-md py-2 hover:bg-muted"
        >
          <Share2 className="h-[18px] w-[18px]" />
          <span className="text-[11px] font-semibold">Share</span>
        </button>
        {/* Repost */}
        <button
          type="button"
          onClick={() => onReshare(sourcePost)}
          className="flex flex-1 items-center justify-center gap-1 rounded-md py-2 hover:bg-muted"
        >
          <Repeat2 className={`h-[18px] w-[18px] ${sourcePost.user_reshared ? "text-green-500" : ""}`} />
          <span className="text-[11px] font-semibold">{formatCount(sourcePost.repost_count || 0)}</span>
        </button>
        {/* Views + optional boost */}
        <div className="flex flex-1 items-center justify-center gap-1 text-[11px]">
          {isOwner ? (
            <button
              type="button"
              onClick={() => router.visit(`/ads/create?mode=boost&post=${encodeURIComponent(sourcePost.id)}`)}
              className="flex items-center gap-1 rounded-md py-2 hover:bg-muted"
              title="Boost"
            >
              <Rocket className="h-[18px] w-[18px]" />
              <span className="font-semibold">Boost</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 py-2">
              <Eye className="h-[18px] w-[18px]" />
              {formatCount(sourcePost.view_count ?? 0)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
