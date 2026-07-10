import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface MediaCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => ReactNode;
  getItemKey?: (item: T, index: number) => string;
  className?: string;
  trackClassName?: string;
  slideClassName?: string;
  showControls?: boolean;
  showIndicators?: boolean;
  onActiveIndexChange?: (index: number) => void;
  resetKey?: string | number;
  ariaLabel?: string;
}

export function MediaCarousel<T>({
  items,
  renderItem,
  getItemKey,
  className,
  trackClassName,
  slideClassName,
  showControls,
  showIndicators,
  onActiveIndexChange,
  resetKey,
  ariaLabel = "Post media carousel",
}: MediaCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef(0);
  const suppressClickRef = useRef(false);

  const canScroll = items.length > 1;
  const shouldShowControls = showControls ?? canScroll;
  const shouldShowIndicators = showIndicators ?? canScroll;

  const clampIndex = useCallback(
    (index: number) => Math.min(Math.max(index, 0), Math.max(items.length - 1, 0)),
    [items.length],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const node = trackRef.current;
      if (!node || items.length === 0) return;
      const clamped = clampIndex(index);
      const slideWidth = node.clientWidth || 1;
      node.scrollTo({ left: clamped * slideWidth, behavior: "smooth" });
      setActiveIndex(clamped);
    },
    [clampIndex, items.length],
  );

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const node = trackRef.current;
      if (!node) return;
      const slideWidth = node.clientWidth || 1;
      const nextIndex = clampIndex(Math.round(node.scrollLeft / slideWidth));
      setActiveIndex(nextIndex);
    });
  }, [clampIndex]);

  useEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  useEffect(() => {
    if (typeof resetKey === "undefined") return;
    setActiveIndex(0);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0 });
    }
  }, [resetKey]);

  useEffect(() => {
    if (items.length === 0) return;
    if (activeIndex <= items.length - 1) return;
    setActiveIndex(items.length - 1);
  }, [activeIndex, items.length]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className={cn("relative group", className)}
      aria-label={ariaLabel}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
      }}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={(event) => {
          touchStartXRef.current = event.touches[0]?.clientX ?? null;
          touchDeltaXRef.current = 0;
          suppressClickRef.current = false;
        }}
        onTouchMove={(event) => {
          const startX = touchStartXRef.current;
          const currentX = event.touches[0]?.clientX;
          if (startX === null || typeof currentX !== "number") return;
          touchDeltaXRef.current = currentX - startX;
          if (Math.abs(touchDeltaXRef.current) > 12) {
            suppressClickRef.current = true;
          }
        }}
        onTouchEnd={() => {
          const deltaX = touchDeltaXRef.current;
          if (Math.abs(deltaX) > 40) {
            scrollToIndex(activeIndex + (deltaX < 0 ? 1 : -1));
          }
          touchStartXRef.current = null;
          touchDeltaXRef.current = 0;
          window.setTimeout(() => {
            suppressClickRef.current = false;
          }, 120);
        }}
        className={cn(
          "flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar touch-pan-x",
          trackClassName,
        )}
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        {items.map((item, index) => (
          <div
            key={getItemKey ? getItemKey(item, index) : String(index)}
            className={cn("w-full shrink-0 snap-center", slideClassName)}
          >
            {renderItem(item, index, index === activeIndex)}
          </div>
        ))}
      </div>

      {shouldShowControls && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              scrollToIndex(activeIndex - 1);
            }}
            aria-label="Previous media"
            disabled={activeIndex === 0}
            className={cn(
              "absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-1.5 text-white shadow-sm backdrop-blur transition-opacity",
              "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
              activeIndex === 0 && "pointer-events-none opacity-40",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              scrollToIndex(activeIndex + 1);
            }}
            aria-label="Next media"
            disabled={activeIndex === items.length - 1}
            className={cn(
              "absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-1.5 text-white shadow-sm backdrop-blur transition-opacity",
              "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
              activeIndex === items.length - 1 && "pointer-events-none opacity-40",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {shouldShowIndicators && (
        <div className="pointer-events-auto absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
          {items.map((_, index) => (
            <button
              key={`indicator-${index}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                scrollToIndex(index);
              }}
              aria-label={`Go to media ${index + 1}`}
              aria-current={index === activeIndex ? "true" : "false"}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                index === activeIndex ? "w-4 bg-white" : "bg-white/45 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
