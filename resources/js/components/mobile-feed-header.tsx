import { cn } from "@/lib/utils";
import { Bell, MoreHorizontal } from "lucide-react";

export type FeedTab = "for-you" | "following";

export function MobileFeedHeader({
  activeTab,
  onTabChange,
  onNotificationsClick,
  notificationCount,
  onMoreClick,
  className,
  variant = "feed-tabs",
  title = "Community",
}: {
  activeTab?: FeedTab;
  onTabChange?: (tab: FeedTab) => void;
  onNotificationsClick?: () => void;
  notificationCount?: number;
  onMoreClick?: () => void;
  className?: string;
  variant?: "community" | "feed-tabs";
  title?: string;
}) {
  const mobileNotificationBadge = notificationCount && notificationCount > 0 ? 1 : undefined;

  const tabs: Array<{ id: FeedTab; label: string }> = [
    { id: "for-you", label: "For You" },
    { id: "following", label: "Followed" },
  ];

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 left-0 right-0 z-50",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/90 to-transparent" />
      <div className="pointer-events-auto relative px-4 pt-3">
        <div className="mx-auto w-full lg:max-w-[520px]">
          {variant === "community" ? (
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold text-foreground">{title}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onNotificationsClick}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-xl"
                >
                  <Bell className="h-4 w-4 text-foreground" />
                  {mobileNotificationBadge ? (
                    <span className="absolute right-0.5 top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {mobileNotificationBadge}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={onMoreClick}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-xl"
                >
                  <MoreHorizontal className="h-4 w-4 text-foreground" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onNotificationsClick}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-xl"
              >
                <Bell className="h-4 w-4 text-foreground" />
                {mobileNotificationBadge ? (
                  <span className="absolute right-0.5 top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {mobileNotificationBadge}
                  </span>
                ) : null}
              </button>

              <div className="flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 text-sm backdrop-blur-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange?.(tab.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      activeTab === tab.id
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onMoreClick}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur-xl"
              >
                <MoreHorizontal className="h-4 w-4 text-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
