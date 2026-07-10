import { getSafeExternalUrl, getSafeMediaUrl } from "@/lib/url-guard";
import { useEffect, useMemo, useRef, useState } from "react";

interface AdRenderProps {
  renderMode?:
    | "internal_asset"
    | "script_tag"
    | "iframe_embed"
    | "server_response"
    | string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  title?: string;
  externalPayload?: Record<string, unknown> | null;
  className?: string;
  muted?: boolean;
  videoViewThresholdRatio?: number;
  onVideoQualifiedView?: (payload: {
    watchSeconds: number;
    durationSeconds: number;
    watchRatio: number;
  }) => void;
}

export function AdRender({
  renderMode = "internal_asset",
  mediaUrl,
  mediaType,
  title = "Sponsored content",
  externalPayload,
  className,
  muted = true,
  videoViewThresholdRatio = 0.5,
  onVideoQualifiedView,
}: AdRenderProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qualifiedViewSentRef = useRef(false);
  const [mediaError, setMediaError] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const safeMediaUrl = useMemo(
    () => getSafeMediaUrl(mediaUrl) || "",
    [mediaUrl],
  );
  const safeTargetUrl = useMemo(
    () =>
      getSafeExternalUrl(
        (externalPayload?.target_url as string | undefined) || null,
      ),
    [externalPayload],
  );

  const isVideo = useMemo(
    () =>
      mediaType === "video" ||
      safeMediaUrl.toLowerCase().endsWith(".mp4") ||
      safeMediaUrl.toLowerCase().endsWith(".webm"),
    [mediaType, safeMediaUrl],
  );

  useEffect(() => {
    qualifiedViewSentRef.current = false;
  }, [safeMediaUrl]);

  useEffect(() => {
    setMediaError(false);
    setIsVideoVisible(false);
  }, [safeMediaUrl, isVideo]);

  useEffect(() => {
    if (!safeMediaUrl || !isVideo) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35,
        );
        setIsVideoVisible(visible);
      },
      { threshold: [0, 0.35, 0.65] },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isVideo, safeMediaUrl]);

  useEffect(() => {
    if (!safeMediaUrl || !isVideo) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isVideoVisible) {
      video.play().catch(() => {});
    }
  }, [isVideo, isVideoVisible, safeMediaUrl]);

  useEffect(() => {
    if (!safeMediaUrl || !isVideo || !onVideoQualifiedView) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const threshold = Math.max(
      0.01,
      Math.min(1, videoViewThresholdRatio || 0.5),
    );

    const emitQualifiedView = () => {
      if (
        qualifiedViewSentRef.current ||
        !video.duration ||
        Number.isNaN(video.duration)
      ) {
        return;
      }

      const watchSeconds = Math.max(0, video.currentTime);
      const durationSeconds = Math.max(0, video.duration);
      if (durationSeconds <= 0) {
        return;
      }

      const watchRatio = Math.max(
        0,
        Math.min(1, watchSeconds / durationSeconds),
      );
      if (watchRatio < threshold) {
        return;
      }

      qualifiedViewSentRef.current = true;
      onVideoQualifiedView({
        watchSeconds,
        durationSeconds,
        watchRatio,
      });
    };

    video.addEventListener("timeupdate", emitQualifiedView);
    video.addEventListener("ended", emitQualifiedView);

    return () => {
      video.removeEventListener("timeupdate", emitQualifiedView);
      video.removeEventListener("ended", emitQualifiedView);
    };
  }, [isVideo, onVideoQualifiedView, safeMediaUrl, videoViewThresholdRatio]);

  if (renderMode === "iframe_embed") {
    const src = getSafeExternalUrl(
      (externalPayload?.iframe_src as string | undefined) || mediaUrl || null,
    );
    if (!src) return null;
    return (
      <iframe
        src={src}
        title={title}
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      />
    );
  }

  if (renderMode === "script_tag") {
    const scriptSrc = externalPayload?.script_src as string | undefined;
    if (scriptSrc) {
      return (
        <div className={className}>
          {safeTargetUrl ? (
            <a
              href={safeTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full w-full"
            >
              <span className="sr-only">Open sponsored content</span>
            </a>
          ) : (
            <div className="h-full w-full rounded-md border border-dashed border-white/20 bg-black/20" />
          )}
        </div>
      );
    }
  }

  if (!safeMediaUrl || mediaError) {
    return (
      <div
        className={`${className || ""} flex items-center justify-center bg-black/40 text-xs text-white/70`}
      >
        Sponsored media unavailable
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        src={safeMediaUrl}
        className={className}
        muted={muted}
        controls={!muted}
        playsInline
        autoPlay
        loop
        preload="metadata"
        onError={() => setMediaError(true)}
      />
    );
  }

  return (
    <img
      src={safeMediaUrl}
      alt={title}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setMediaError(true)}
    />
  );
}
