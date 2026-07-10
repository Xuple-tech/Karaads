import { AdRender } from '@/components/ads/ad-render';
import { DeliveryResponse, trackAdEvent } from '@/lib/ads-delivery';
import { getSafeExternalUrl } from '@/lib/url-guard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Eye, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Story, StoryGroup } from '@/types';

interface StoryViewerProps {
  open: boolean;
  groups: StoryGroup[];
  ads?: DeliveryResponse[];
  initialGroupIndex: number;
  initialStoryIndex: number;
  onClose: () => void;
  onViewed: (storyId: string) => Promise<void> | void;
  onReact: (storyId: string, emoji: string) => Promise<void> | void;
}

const STORY_IMAGE_DURATION_MS = 5000;
const REACTION_EMOJIS = ['\u{1F44D}', '\u{1F525}', '\u{1F60D}', '\u{1F602}'] as const;

export function StoryViewer({
  open,
  groups,
  ads = [],
  initialGroupIndex,
  initialStoryIndex,
  onClose,
  onViewed,
  onReact,
}: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const adImpressionsRef = useRef<Set<string>>(new Set());
  const adQualifiedViewsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setGroupIndex(initialGroupIndex);
    setStoryIndex(initialStoryIndex);
    setProgress(0);
    setSelectedReaction(null);
    setMusicEnabled(true);
  }, [open, initialGroupIndex, initialStoryIndex]);

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex] as Story | undefined;
  const currentMedia = currentStory?.media?.[0];
  const globalStoryIndex = useMemo(() => {
    let index = storyIndex;
    for (let i = 0; i < groupIndex; i += 1) {
      index += groups[i]?.stories.length ?? 0;
    }
    return index;
  }, [groupIndex, groups, storyIndex]);
  const currentStoryAd = useMemo(() => {
    if (ads.length === 0) {
      return null;
    }

    // Show a sponsored card every 3 stories.
    if ((globalStoryIndex + 1) % 3 !== 0) {
      return null;
    }

    const adIndex = Math.floor(globalStoryIndex / 3) % ads.length;
    return ads[adIndex] ?? null;
  }, [ads, globalStoryIndex]);

  useEffect(() => {
    if (!open || !currentStory) return;
    onViewed(currentStory.id);
    setSelectedReaction(currentStory.viewer_reaction ?? null);
  }, [open, currentStory?.id]);

  useEffect(() => {
    if (!open) return;
    const deliveryId = currentStoryAd?.delivery_id;
    const signature = currentStoryAd?.tracking?.signature;
    const sessionId = currentStoryAd?.tracking?.session_id;
    if (!deliveryId || !signature || !sessionId) return;
    if (adImpressionsRef.current.has(deliveryId)) return;
    adImpressionsRef.current.add(deliveryId);

    trackAdEvent({
      deliveryId,
      eventType: 'impression',
      sessionId,
      signature,
      idempotencyKey: `stories-impression-${deliveryId}`,
      meta: {
        surface: currentStoryAd?.placement?.surface || 'moments',
        slot: currentStoryAd?.placement?.slot || 'story',
      },
    });
  }, [currentStoryAd?.delivery_id, currentStoryAd?.placement?.slot, currentStoryAd?.placement?.surface, currentStoryAd?.tracking?.session_id, currentStoryAd?.tracking?.signature, open]);

  useEffect(() => {
    const audio = audioRef.current;
    const shouldPlayMusic = Boolean(
      open &&
      currentStory?.music_url &&
      currentMedia?.type === 'image' &&
      musicEnabled &&
      !isPaused,
    );

    if (!audio) {
      return;
    }

    if (!shouldPlayMusic) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    audio.currentTime = 0;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [currentMedia?.type, currentStory?.id, currentStory?.music_url, isPaused, musicEnabled, open]);

  const moveNext = () => {
    if (!currentGroup) {
      onClose();
      return;
    }

    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((prev) => prev + 1);
      setProgress(0);
      return;
    }

    if (groupIndex < groups.length - 1) {
      setGroupIndex((prev) => prev + 1);
      setStoryIndex(0);
      setProgress(0);
      return;
    }

    onClose();
  };

  const movePrev = () => {
    if (!currentGroup) return;

    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
      setProgress(0);
      return;
    }

    if (groupIndex > 0) {
      const prevGroupStories = groups[groupIndex - 1]?.stories || [];
      setGroupIndex((prev) => prev - 1);
      setStoryIndex(Math.max(0, prevGroupStories.length - 1));
      setProgress(0);
    }
  };

  useEffect(() => {
    if (!open || !currentStory || isPaused) return;

    if (currentMedia?.type === 'video') {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        if (!video.duration || Number.isNaN(video.duration)) return;
        setProgress(Math.min(100, (video.currentTime / video.duration) * 100));
      };

      const handleEnded = () => moveNext();

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.play().catch(() => {});

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }

    const started = Date.now();
    const duration = STORY_IMAGE_DURATION_MS;
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const nextProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        window.clearInterval(interval);
        moveNext();
      }
    }, 60);

    return () => window.clearInterval(interval);
  }, [open, currentStory?.id, currentMedia?.type, isPaused]);

  const progressBars = useMemo(() => {
    if (!currentGroup) return [];

    return currentGroup.stories.map((story, idx) => {
      if (idx < storyIndex) return 100;
      if (idx > storyIndex) return 0;
      return progress;
    });
  }, [currentGroup, storyIndex, progress]);

  if (!open || !currentStory || !currentGroup) return null;

  const username = currentGroup.user.username || currentGroup.user.name;
  const adCreative = currentStoryAd?.creative;
  const safeAdTargetUrl = useMemo(
    () => getSafeExternalUrl(adCreative?.target_url || null),
    [adCreative?.target_url],
  );

  const handleStoryAdClick = () => {
    if (!currentStoryAd) return;
    trackAdEvent({
      deliveryId: currentStoryAd.delivery_id,
      eventType: 'click',
      sessionId: currentStoryAd.tracking?.session_id,
      signature: currentStoryAd.tracking?.signature,
      idempotencyKey: `stories-click-${currentStoryAd.delivery_id}-${Date.now()}`,
      meta: {
        surface: currentStoryAd.placement?.surface || 'moments',
        slot: currentStoryAd.placement?.slot || 'story',
      },
    });
  };

  const handleStoryAdQualifiedView = (payload: {
    watchSeconds: number;
    durationSeconds: number;
    watchRatio: number;
  }) => {
    if (!currentStoryAd) return;
    if (!currentStoryAd.delivery_id || !currentStoryAd.tracking?.session_id || !currentStoryAd.tracking?.signature) return;
    if (adQualifiedViewsRef.current.has(currentStoryAd.delivery_id)) return;
    adQualifiedViewsRef.current.add(currentStoryAd.delivery_id);

    trackAdEvent({
      deliveryId: currentStoryAd.delivery_id,
      eventType: 'view_complete',
      sessionId: currentStoryAd.tracking.session_id,
      signature: currentStoryAd.tracking.signature,
      idempotencyKey: `stories-view-complete-${currentStoryAd.delivery_id}`,
      meta: {
        surface: currentStoryAd.placement?.surface || 'moments',
        slot: currentStoryAd.placement?.slot || 'story',
        watch_seconds: payload.watchSeconds,
        video_duration_seconds: payload.durationSeconds,
        watch_ratio: payload.watchRatio,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black">
      <div className="mx-auto flex h-full w-full max-w-[520px] flex-col bg-[#0b0e13] text-white">
        <div className="px-3 pt-3">
          <div className="mb-3 flex gap-1.5">
            {progressBars.map((bar, idx) => (
              <div key={`${currentGroup.user.id}-bar-${idx}`} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-[width] duration-100" style={{ width: `${bar}%` }} />
              </div>
            ))}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('h-9 w-9 overflow-hidden rounded-full border-2', currentGroup.has_unseen ? 'border-[#ff5a73]' : 'border-white/30')}>
                {currentGroup.user.avatar ? (
                  <img src={currentGroup.user.avatar} alt={currentGroup.user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/10 text-sm font-semibold">
                    {currentGroup.user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">@{username}</p>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span>Story</span>
                  {typeof currentStory.view_count === 'number' ? (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{currentStory.view_count}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentStory.music_url && currentMedia?.type === 'image' ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/15"
                  onClick={() => setMusicEnabled((prev) => !prev)}
                  aria-label={musicEnabled ? 'Mute story music' : 'Play story music'}
                >
                  {musicEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/15" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden" onPointerDown={() => setIsPaused(true)} onPointerUp={() => setIsPaused(false)}>
          <button
            type="button"
            aria-label="Previous story"
            className="absolute left-0 top-0 z-10 h-[calc(100%-7rem)] w-1/2"
            onClick={movePrev}
          />
          <button
            type="button"
            aria-label="Next story"
            className="absolute right-0 top-0 z-10 h-[calc(100%-7rem)] w-1/2"
            onClick={moveNext}
          />

          {currentMedia?.type === 'video' ? (
            <video
              key={currentMedia.id}
              ref={videoRef}
              src={currentMedia.path}
              className="h-full w-full object-contain"
              playsInline
              autoPlay
              muted
            />
          ) : (
            <>
              <img
                src={currentMedia?.path}
                alt="Story"
                className="h-full w-full object-contain"
              />
              {currentStory.music_url ? (
                <audio
                  key={`${currentStory.id}-music`}
                  ref={audioRef}
                  src={currentStory.music_url}
                  preload="metadata"
                />
              ) : null}
            </>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
            {currentStory.music_url && currentMedia?.type === 'image' ? (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur">
                {musicEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span>{currentStory.music_title || 'Story music'}</span>
              </div>
            ) : null}
            {adCreative ? (
              <div className="pointer-events-auto mb-3 overflow-hidden rounded-2xl border border-white/20 bg-black/40 backdrop-blur">
                <div className="px-3 pt-2">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80">
                    Sponsored
                  </span>
                </div>
                <AdRender
                  renderMode={currentStoryAd?.render_mode || 'internal_asset'}
                  mediaUrl={adCreative.media_url}
                  mediaType={adCreative.media_type}
                  title={adCreative.title || 'Sponsored'}
                  externalPayload={adCreative.external_payload}
                  onVideoQualifiedView={handleStoryAdQualifiedView}
                  className="mt-2 h-28 w-full object-cover"
                />
                <div className="flex items-center justify-between gap-3 p-3">
                  <p className="line-clamp-1 text-sm font-medium text-white">{adCreative.title || 'Sponsored content'}</p>
                  {safeAdTargetUrl ? (
                    <a
                      href={safeAdTargetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleStoryAdClick}
                      className="inline-flex h-9 shrink-0 items-center rounded-lg bg-white px-3 text-xs font-semibold text-black"
                    >
                      Open
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
            {currentStory.caption && <p className="mb-3 text-sm text-white/90">{currentStory.caption}</p>}

            <div className="pointer-events-auto flex items-center justify-between">
              <div className="flex gap-2">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-sm transition',
                      selectedReaction === emoji
                        ? 'border-white bg-white text-black'
                        : 'border-white/30 bg-black/30 text-white hover:bg-white/20',
                    )}
                    onClick={() => {
                      setSelectedReaction(emoji);
                      onReact(currentStory.id, emoji);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 text-white/70">
                <ChevronLeft className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
