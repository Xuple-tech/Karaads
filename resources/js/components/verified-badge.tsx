import { cn } from "@/lib/utils";

type VerifiedBadgeProps = {
  compact?: boolean;
  className?: string;
};

export function VerifiedBadge({
  compact = false,
  className,
}: VerifiedBadgeProps) {
  return (
    <img
      src="/images/verified-badge.webp"
      alt="Kara Verified badge"
      className={cn(
        "select-none object-contain drop-shadow-[0_3px_10px_rgba(39,120,255,0.32)]",
        compact ? "h-9 w-9 -ml-4" : "h-14 w-14 -ml-5",
        className,
      )}
      aria-label="Kara Verified profile"
      title="Kara Verified profile"
      draggable={false}
    />
  );
}
