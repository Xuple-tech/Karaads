import CommentSection from "@/components/comment";
import { InVideoAdBreak } from "@/components/ads/in-video-ad-break";
import { MediaCarousel } from "@/components/media-carousel";
import { LoadingImage, LoadingVideo } from "@/components/post-media-loader";
import { PostOwnerActions } from "@/components/post-owner-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { hashtagPath, normalizeHashtag } from "@/lib/hashtag";
import axiosInstance from "@/lib/axios";
import { formatRelativeTimeShort } from "@/lib/time";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
  Ellipsis,
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

export interface MomentUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  followers_count?: number;
}

export interface MomentMedia {
  id: string;
  path: string;
  url?: string;
  thumbnail?: string | null;
  type: string;
  file_type?: string;
  mime_type?: string;
  processing_status?: "queued" | "processing" | "ready" | "failed" | "skipped" | string | null;
}

export interface MomentPost {
  id: string;
  type?: "post" | "repost";
  content: string;
  hashtags?: string[];
  music_url?: string | null;
  music_title?: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  view_count?: number;
  media?: MomentMedia[];
  user: MomentUser;
  user_liked: boolean;
  user_reshared?: boolean;
  live_replay?: {
    id: string;
    title?: string | null;
    started_at?: string | null;
    ended_at?: string | null;
    status?: string | null;
  } | null;
  original_post?: MomentPost;
}

interface MomentsReelPostProps {
  post: MomentPost;
  currentUserId?: string;
  isActive: boolean;
  isNearActive?: boolean;
  isMuted: boolean;
  isFollowing: boolean;
  isFollowBusy: boolean;
  canFollow: boolean;
  onToggleMute: () => void;
  onLike: (post: MomentPost) => Promise<void> | void;
  onReshare: (post: MomentPost) => Promise<void> | void;
  onFollow: (userId: string) => Promise<void> | void;
  onPostUpdated: (
    postId: string,
    updates: { content: string; media: MomentMedia[] },
  ) => void;
  onPostDeleted: (postId: string) => void;
  onVideoEnded?: () => void;
  autoOpenComments?: boolean;
}

function resolveRepostSource(post: MomentPost): MomentPost {
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

function extractHashtags(content: string): string[] {
  const tags = content.match(/#[\p{L}\p{N}_-]+/gu) || [];
  return tags
    .map((tag) => normalizeHashtag(tag))
    .filter((tag): tag is string => Boolean(tag))
    .slice(0, 3);
}

function isVideoMedia(media?: MomentMedia | null): boolean {
  const type = String(media?.type ?? media?.file_type ?? "").toLowerCase();
  const mime = String(media?.mime_type ?? "").toLowerCase();
  const path = String(media?.path ?? "").toLowerCase();

  return (
    type === "video" ||
    mime.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/.test(path)
  );
}

const videoPlaybackPositions = new Map<string, number>();

function videoPlaybackKey(postId: string, media?: MomentMedia | null, index = 0): string {
  return `${postId}:${media?.id ?? index}`;
}

function saveVideoPlaybackPosition(key: string, video: HTMLVideoElement): void {
  if (!Number.isFinite(video.currentTime) || video.currentTime <= 0) {
    return;
  }

  if (Number.isFinite(video.duration) && video.duration > 0 && video.currentTime >= video.duration - 0.75) {
    videoPlaybackPositions.delete(key);
    return;
  }

  videoPlaybackPositions.set(key, video.currentTime);
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

function MomentsReelPostComponent({
  post,
  currentUserId,
  isActive,
  isNearActive = false,
  isMuted,
  isFollowing,
  isFollowBusy,
  canFollow,
  onToggleMute,
  onLike,
  onReshare,
  onFollow,
  onPostUpdated,
  onPostDeleted,
  onVideoEnded,
  autoOpenComments = false,
}: MomentsReelPostProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLikeBurst, setShowLikeBurst] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [midrollAdSelected, setMidrollAdSelected] = useState(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dwellRecordedRef = useRef<Set<string>>(new Set());

  const sourcePost = resolveRepostSource(post);
  const liveReplay = sourcePost.live_replay ?? null;
  const liveReplayTime = liveReplay?.ended_at || liveReplay?.started_at || sourcePost.created_at;
  const mediaItems = sourcePost.media ?? [];
  const activeMedia = mediaItems[activeMediaIndex];
  const activeIsVideo = isVideoMedia(activeMedia);
  const activeIsImage = Boolean(activeMedia && !activeIsVideo);
  const midrollResetKey = `${sourcePost.id}:${activeMedia?.id ?? activeMediaIndex}`;
  const getActiveVideoElement = useCallback(
    () => videoRefs.current[activeMediaIndex] ?? null,
    [activeMediaIndex],
  );
  const displayContent = sourcePost.content || post.content;
  const hashtags = useMemo(() => {
    const taggedFromPost = (sourcePost.hashtags ?? post.hashtags ?? [])
      .map((tag) => normalizeHashtag(tag))
      .filter((tag): tag is string => Boolean(tag));

    if (taggedFromPost.length > 0) {
      return Array.from(new Set(taggedFromPost)).slice(0, 3);
    }

    return Array.from(new Set(extractHashtags(displayContent || ""))).slice(
      0,
      3,
    );
  }, [displayContent, post.hashtags, sourcePost.hashtags]);
  const followersLabel =
    typeof post.user.followers_count === "number"
      ? `${formatCount(post.user.followers_count)} Followers`
      : "Creator";
  const isOwner = Boolean(
    currentUserId && String(currentUserId) === String(sourcePost.user.id),
  );
  const relativeTime = formatRelativeTimeShort(post.created_at);

  useEffect(() => {
    if (mediaItems.length === 0) return;
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      const key = videoPlaybackKey(sourcePost.id, mediaItems[index], index);
      if (index === activeMediaIndex && isActive) {
        video.preload = "auto";
        if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) {
          video.load();
        }
        const savedTime = videoPlaybackPositions.get(key);
        if (
          savedTime &&
          Number.isFinite(savedTime) &&
          Math.abs(video.currentTime - savedTime) > 0.5 &&
          (!Number.isFinite(video.duration) || video.duration <= 0 || savedTime < video.duration - 0.75)
        ) {
          video.currentTime = savedTime;
        }
        video.play().catch(() => {});
      } else {
        video.preload = isNearActive && index === activeMediaIndex ? "metadata" : "none";
        saveVideoPlaybackPosition(key, video);
        video.pause();
      }
    });
  }, [activeMediaIndex, isActive, isNearActive, mediaItems.length, sourcePost.id]);

  useEffect(() => {
    if (!isActive || !currentUserId || dwellRecordedRef.current.has(sourcePost.id)) {
      return;
    }

    const timer = window.setTimeout(() => {
      dwellRecordedRef.current.add(sourcePost.id);
      axiosInstance
        .post(`/api/posts/${sourcePost.id}/engagement`, {
          event_type: "dwell",
          dwell_seconds: 10,
          surface: "moments",
        })
        .catch(() => {
          dwellRecordedRef.current.delete(sourcePost.id);
        });
    }, 10_000);

    return () => window.clearTimeout(timer);
  }, [currentUserId, isActive, sourcePost.id]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (!video) return;
      video.muted = isMuted;
    });
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted, activeMediaIndex, post.id]);

  useEffect(() => {
    const audio = audioRef.current;
    const shouldPlay = Boolean(
      audio &&
        isActive &&
        activeIsImage &&
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

    audio.play().catch(() => {});

    return () => {
      videoRefs.current.forEach((video, index) => {
        if (!video) return;
        saveVideoPlaybackPosition(videoPlaybackKey(sourcePost.id, mediaItems[index], index), video);
      });
      audio.pause();
      audio.currentTime = 0;
    };
  }, [activeIsImage, isActive, sourcePost.id, sourcePost.music_url, post.id]);

  useEffect(() => {
    setActiveMediaIndex(0);
    videoRefs.current = [];

    return () => {
      videoRefs.current.forEach((video, index) => {
        if (!video) return;
        saveVideoPlaybackPosition(videoPlaybackKey(sourcePost.id, mediaItems[index], index), video);
      });
    };
  }, [post.id]);

  const handleMediaClick = () => {
    if (!activeIsVideo) return;
    const video = videoRefs.current[activeMediaIndex];
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      return;
    }
    video.pause();
  };

  const handleVideoEnded = useCallback(() => {
    if (midrollAdSelected) return;
    onVideoEnded?.();
  }, [midrollAdSelected, onVideoEnded]);

  const handleMediaDoubleClick = () => {
    if (!sourcePost.user_liked) {
      setShowLikeBurst(true);
      window.setTimeout(() => setShowLikeBurst(false), 450);
    }
    void onLike(sourcePost);
  };

  return (
    <article className="relative mx-auto h-screen w-full max-w-[430px] overflow-hidden bg-[#0b0e13] text-white sm:max-w-[460px] md:max-w-[560px] lg:max-w-[680px] xl:max-w-[760px]">
      <div
        className="absolute inset-0"
        onClick={handleMediaClick}
        onDoubleClick={handleMediaDoubleClick}
      >
        {sourcePost.music_url ? (
          <audio
            ref={audioRef}
            src={sourcePost.music_url}
            preload="metadata"
            muted={isMuted}
          />
        ) : null}
        {mediaItems.length > 0 ? (
          <MediaCarousel
            items={mediaItems}
            resetKey={post.id}
            className="h-full w-full"
            trackClassName="h-full"
            slideClassName="h-full"
            showControls={false}
            onActiveIndexChange={setActiveMediaIndex}
            renderItem={(media, index, isSlideActive) => {
              const isVideo = isVideoMedia(media);

              if (isVideo) {
                return (
                  <LoadingVideo
                    ref={(node) => {
                      videoRefs.current[index] = node;
                    }}
                    src={media.path}
                    className="h-full w-full object-contain"
                    playsInline
                    muted={isMuted}
                    onEnded={isActive && isSlideActive ? handleVideoEnded : undefined}
                    poster={media.thumbnail || undefined}
                    preload={isActive && isSlideActive ? "auto" : isNearActive && isSlideActive ? "metadata" : "none"}
                  />
                );
              }

              return (
                <LoadingImage
                  src={media.path}
                  alt={displayContent || `${post.user.name} post`}
                  className="h-full w-full object-contain"
                  loading={isActive || isNearActive ? "eager" : "lazy"}
                  fetchPriority={isActive ? "high" : "auto"}
                />
              );
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#171b24] via-[#141822] to-[#0f1118] p-8 text-center text-base text-white/80">
            {displayContent || "Reshared post"}
          </div>
        )}
        <InVideoAdBreak
          enabled={Boolean(isActive && activeMedia)}
          resetKey={midrollResetKey}
          getVideoElement={getActiveVideoElement}
          surface="moments"
          sessionSeed={`moments-midroll-${sourcePost.id}`}
          context={{
            page: "moments",
            post_id: sourcePost.id,
            media_id: activeMedia?.id,
          }}
          muted={isMuted}
          onSelectionChange={setMidrollAdSelected}
          onAfterEndBreak={onVideoEnded}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75" />

      {liveReplay ? (
        <div className="absolute left-4 top-[max(env(safe-area-inset-top),16px)] z-30 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-white/85" />
          Was live · {formatLiveReplayDate(liveReplayTime)}
        </div>
      ) : null}

      {(activeIsVideo || (activeIsImage && sourcePost.music_url)) && (
        <div className="absolute right-4 top-[max(env(safe-area-inset-top),16px)] z-30">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="pointer-events-auto h-9 w-9 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:bg-black/55"
            onClick={onToggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {showLikeBurst && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <Heart className="h-24 w-24 fill-[#ff4d6d] text-[#ff4d6d] drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]" />
        </div>
      )}

      <div className="absolute bottom-[calc(156px+env(safe-area-inset-bottom))] right-3 z-20 flex flex-col items-center gap-4 sm:bottom-[calc(120px+env(safe-area-inset-bottom))] sm:right-4 xl:bottom-8">
        <button
          type="button"
          onClick={() => onLike(sourcePost)}
          className="flex flex-col items-center gap-1 text-white"
        >
          <Heart
            className={cn(
              "h-7 w-7 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]",
              sourcePost.user_liked ? "fill-[#ff4d6d] text-[#ff4d6d]" : "text-white",
            )}
          />
          <span className="text-[11px] font-semibold">
            {formatCount(sourcePost.like_count)}
          </span>
        </button>

        <div className="flex flex-col items-center gap-1 text-white">
          <CommentSection
            post={sourcePost}
            initialOpen={autoOpenComments}
            trigger={
              <button type="button" className="text-white">
                <MessageCircle className="h-7 w-7 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]" />
              </button>
            }
          />
          <span className="text-[11px] font-semibold">
            {formatCount(sourcePost.comment_count)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onReshare(sourcePost)}
          className="flex flex-col items-center gap-1 text-white"
        >
          <Repeat2
            className={cn(
              "h-7 w-7 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]",
              sourcePost.user_reshared ? "text-[#4ade80]" : "text-white",
            )}
          />
          <span className="text-[11px] font-semibold">
            {formatCount(sourcePost.repost_count)}
          </span>
        </button>

        <button
          type="button"
          onClick={async () => {
            const url = `${window.location.origin}/posts/${sourcePost.id}`;
            if (navigator.share) {
              try {
                await navigator.share({ url });
                return;
              } catch {
                // Fallback to clipboard when share sheet is dismissed.
              }
            }
            await navigator.clipboard.writeText(url);
          }}
          className="flex flex-col items-center gap-1 text-white"
        >
          <Share2 className="h-7 w-7 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]" />
          <span className="text-[11px] font-semibold">Share</span>
        </button>

        <div className="relative">
          {isOwner ? (
            <PostOwnerActions
              postId={sourcePost.id}
              content={sourcePost.content}
              media={sourcePost.media || []}
              onPostUpdated={(updates) => onPostUpdated(post.id, updates)}
              onPostDeleted={() => onPostDeleted(post.id)}
              trigger={
                <button
                  type="button"
                  className="flex flex-col items-center gap-1 text-white"
                >
                  <Ellipsis className="h-7 w-7 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]" />
                  <span className="text-[11px] font-semibold">More</span>
                </button>
              }
            />
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex flex-col items-center gap-1 text-white"
              >
                <Ellipsis className="h-7 w-7 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]" />
                <span className="text-[11px] font-semibold">More</span>
              </button>

              {menuOpen && (
                <div className="absolute bottom-12 right-0 z-40 w-32 overflow-hidden rounded-xl border border-white/15 bg-black/80 backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={async () => {
                      await axios.post(`/api/posts/${sourcePost.id}/save`);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-white/90 hover:bg-white/10"
                  >
                    Save post
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const url = `${window.location.origin}/posts/${sourcePost.id}`;
                      await navigator.clipboard.writeText(url);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-white/90 hover:bg-white/10"
                  >
                    Copy link
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-[calc(108px+env(safe-area-inset-bottom))] left-3 right-16 z-20 sm:bottom-[calc(92px+env(safe-area-inset-bottom))] sm:left-4 sm:right-20 xl:bottom-8">
        {displayContent && (
          <>
            {liveReplay ? (
              <div className="mb-2 inline-flex rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white/85">
                {liveReplay.title ? `Was live: ${liveReplay.title}` : "Was live"}
              </div>
            ) : null}
            <p className="line-clamp-3 text-[17px] font-medium leading-snug text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
              {displayContent}
            </p>
          </>
        )}

        <p className="mt-2 text-xs font-semibold text-white/80">
          {formatCount(sourcePost.view_count ?? 0)} views
        </p>

        {hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {hashtags.map((tag) => {
              const path = hashtagPath(tag);
              if (!path) return null;

              return (
                <Link
                  key={`${post.id}-${tag}`}
                  to={path}
                  className="text-sm font-semibold text-white/95 hover:text-white/80"
                >
                  #{tag}
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <Link to={`/@${post.user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0 border border-white/25">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback>
                {post.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-semibold leading-none tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
                {post.user.name}
              </p>
              <p className="truncate text-xs text-white/80">
                {followersLabel}
                {relativeTime ? ` · ${relativeTime}` : ""}
              </p>
            </div>
          </Link>

          {canFollow && (
            <button
              type="button"
              onClick={() => onFollow(post.user.id)}
              disabled={isFollowBusy}
              className="shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#0b0e13] disabled:opacity-60"
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export const MomentsReelPost = memo(MomentsReelPostComponent);
