import { AdRender } from "@/components/ads/ad-render";
import {
  type DeliveryResponse,
  requestAdDeliveries,
  trackAdEvent,
} from "@/lib/ads-delivery";
import { getSafeExternalUrl } from "@/lib/url-guard";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type InVideoAdBreakProps = {
  enabled: boolean;
  resetKey: string;
  getVideoElement: () => HTMLVideoElement | null;
  surface: "feed" | "moments" | "profile";
  slot?: string;
  sessionSeed: string;
  context?: Record<string, unknown>;
  muted?: boolean;
  breakAfterSeconds?: number;
  adDurationSeconds?: number;
  adChance?: number;
  onSelectionChange?: (selected: boolean) => void;
  onAfterEndBreak?: () => void;
};

export function InVideoAdBreak({
  enabled,
  resetKey,
  getVideoElement,
  surface,
  slot = "midroll",
  sessionSeed,
  context,
  muted = true,
  breakAfterSeconds = 20,
  adDurationSeconds = 5,
  adChance = 0.35,
  onSelectionChange,
  onAfterEndBreak,
}: InVideoAdBreakProps) {
  const [ad, setAd] = useState<DeliveryResponse | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(adDurationSeconds);
  const requestedRef = useRef(false);
  const impressionSentRef = useRef(false);
  const viewCompleteSentRef = useRef(false);
  const watchedMsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const selectedForBreakRef = useRef(false);
  const breakModeRef = useRef<"midroll" | "postroll">("midroll");

  useEffect(() => {
    const normalizedChance = Math.max(0, Math.min(1, adChance));
    const selected = Math.random() < normalizedChance;
    requestedRef.current = false;
    impressionSentRef.current = false;
    viewCompleteSentRef.current = false;
    watchedMsRef.current = 0;
    lastTickRef.current = null;
    breakModeRef.current = "midroll";
    selectedForBreakRef.current = selected;
    onSelectionChange?.(selected);
    setAd(null);
    setIsShowing(false);
    setSecondsLeft(adDurationSeconds);
  }, [adChance, adDurationSeconds, onSelectionChange, resetKey]);

  useEffect(() => {
    if (!enabled || !selectedForBreakRef.current) {
      setIsShowing(false);
      return;
    }

    let watchTimer = 0;
    let fallbackTimer = 0;
    let cancelled = false;

    const startBreak = async (mode: "midroll" | "postroll" = "midroll") => {
      if (cancelled) return;
      const video = getVideoElement();
      if (!video) {
        requestedRef.current = false;
        fallbackTimer = window.setTimeout(() => {
          void startBreak();
        }, 1_500);
        return;
      }

      if (requestedRef.current) {
        return;
      }

      requestedRef.current = true;
      breakModeRef.current = mode;

      const items = await requestAdDeliveries({
        count: 1,
        surface,
        slot,
        sessionSeed: `${sessionSeed}-${resetKey}`,
        context: {
          ...context,
          placement: "in_video_break",
          break_after_seconds: breakAfterSeconds,
          break_mode: mode,
          random_selection: true,
          ad_chance: adChance,
        },
        cacheKey: `midroll:${surface}:${resetKey}`,
        cacheTtlMs: 30_000,
        persistCache: false,
        allowCreativeRepeats: true,
      });

      if (cancelled) return;

      const nextAd = items[0] ?? null;
      if (!nextAd?.delivery_id || !nextAd.creative) {
        requestedRef.current = false;
        if (mode === "postroll") {
          onAfterEndBreak?.();
          return;
        }
        fallbackTimer = window.setTimeout(() => {
          void startBreak(mode);
        }, 4_000);
        return;
      }

      video.pause();
      lastTickRef.current = null;
      setAd(nextAd);
      setSecondsLeft(adDurationSeconds);
      setIsShowing(true);
    };

    const trackWatchTime = () => {
      if (cancelled || requestedRef.current || isShowing) {
        lastTickRef.current = null;
        return;
      }

      const video = getVideoElement();
      const now = Date.now();
      if (video?.ended) {
        void startBreak("postroll");
        return;
      }

      const isPlaying = Boolean(
        video &&
          !video.paused &&
          !video.ended &&
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA,
      );

      if (!isPlaying) {
        lastTickRef.current = null;
        return;
      }

      if (lastTickRef.current !== null) {
        watchedMsRef.current += Math.max(0, now - lastTickRef.current);
      }
      lastTickRef.current = now;

      if (watchedMsRef.current >= breakAfterSeconds * 1_000) {
        void startBreak("midroll");
      }
    };

    watchTimer = window.setInterval(trackWatchTime, 500);

    return () => {
      cancelled = true;
      window.clearInterval(watchTimer);
      window.clearTimeout(fallbackTimer);
      lastTickRef.current = null;
    };
  }, [
    adDurationSeconds,
    adChance,
    breakAfterSeconds,
    context,
    enabled,
    getVideoElement,
    onAfterEndBreak,
    resetKey,
    sessionSeed,
    slot,
    surface,
    isShowing,
  ]);

  useEffect(() => {
    if (!isShowing || !ad?.delivery_id) return;

    const signature = ad.tracking?.signature;
    const sessionId = ad.tracking?.session_id;
    if (!impressionSentRef.current) {
      impressionSentRef.current = true;
      trackAdEvent({
        deliveryId: ad.delivery_id,
        eventType: "impression",
        sessionId,
        signature,
        idempotencyKey: `${ad.delivery_id}:midroll-impression`,
        meta: { placement: "in_video_break" },
      });
      trackAdEvent({
        deliveryId: ad.delivery_id,
        eventType: "view_start",
        sessionId,
        signature,
        idempotencyKey: `${ad.delivery_id}:midroll-view-start`,
        meta: { placement: "in_video_break" },
      });
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1_000);

    const timeout = window.setTimeout(() => {
      if (!viewCompleteSentRef.current) {
        viewCompleteSentRef.current = true;
        trackAdEvent({
          deliveryId: ad.delivery_id,
          eventType: "view_complete",
          sessionId,
          signature,
          idempotencyKey: `${ad.delivery_id}:midroll-view-complete`,
          meta: {
            placement: "in_video_break",
            required_seconds: adDurationSeconds,
          },
        });
      }

      setIsShowing(false);
      if (breakModeRef.current === "postroll") {
        onAfterEndBreak?.();
        return;
      }

      const video = getVideoElement();
      video?.play().catch(() => {});
    }, adDurationSeconds * 1_000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [ad, adDurationSeconds, getVideoElement, isShowing, onAfterEndBreak]);

  if (!isShowing || !ad?.creative) {
    return null;
  }

  const targetUrl = getSafeExternalUrl(ad.creative.target_url || null);

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/92 text-white"
      data-no-reel-nav="true"
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <div className="relative h-full w-full">
        <AdRender
          renderMode={ad.render_mode || "internal_asset"}
          mediaUrl={ad.creative.media_url}
          mediaType={ad.creative.media_type}
          title={ad.creative.title || "Sponsored content"}
          externalPayload={ad.creative.external_payload}
          muted={muted}
          className="h-full w-full object-contain"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
                Sponsored
              </p>
              <p className="mt-1 line-clamp-1 text-sm font-bold">
                {ad.creative.title || "Karaads promotion"}
              </p>
            </div>
            <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-black text-white">
              {secondsLeft}s
            </span>
          </div>
        </div>
        {targetUrl ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-black shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
            onClick={() => {
              trackAdEvent({
                deliveryId: ad.delivery_id,
                eventType: "click",
                sessionId: ad.tracking?.session_id,
                signature: ad.tracking?.signature,
                idempotencyKey: `${ad.delivery_id}:midroll-click`,
                meta: { placement: "in_video_break" },
              });
            }}
          >
            Learn more
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
