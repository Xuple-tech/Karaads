import AppLogoIcon from "@/components/app-logo-icon";
import { cn } from "@/lib/utils";
import {
  ImgHTMLAttributes,
  VideoHTMLAttributes,
  forwardRef,
  useState,
} from "react";

export function KaraAdsMediaLoader({
  className,
  label = "Loading post...",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(8,210,255,0.16),transparent_34%),linear-gradient(180deg,#101827_0%,#070d18_100%)] text-white",
        className,
      )}
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/8 shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
        <span className="absolute inset-0 rounded-3xl border border-primary/40 animate-ping" />
        <AppLogoIcon className="relative h-9 w-9 rounded-2xl object-contain" />
      </div>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-white/58">
        {label}
      </p>
    </div>
  );
}

export function LoadingImage({
  className,
  onLoad,
  onError,
  alt,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!loaded ? <KaraAdsMediaLoader /> : null}
      <img
        {...props}
        alt={alt}
        className={cn(
          className,
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          onError?.(event);
        }}
      />
    </div>
  );
}

export const LoadingVideo = forwardRef<HTMLVideoElement, VideoHTMLAttributes<HTMLVideoElement>>(
function LoadingVideo({
  className,
  onLoadedData,
  onCanPlay,
  onError,
  children,
  ...props
}, ref) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {!loaded ? <KaraAdsMediaLoader /> : null}
      <video
        {...props}
        ref={ref}
        className={cn(
          className,
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
        onLoadedData={(event) => {
          setLoaded(true);
          onLoadedData?.(event);
        }}
        onCanPlay={(event) => {
          setLoaded(true);
          onCanPlay?.(event);
        }}
        onError={(event) => {
          onError?.(event);
        }}
      >
        {children}
      </video>
    </div>
  );
});
