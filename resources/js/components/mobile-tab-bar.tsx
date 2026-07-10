import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface MobileTabItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  renderIcon?: (active: boolean) => React.ReactNode;
  badgeCount?: number;
  isCenterAction?: boolean;
  isFloatingAction?: boolean;
}

interface MobileTabBarProps {
  items: MobileTabItem[];
  activeHref: string;
  className?: string;
  isActive?: (item: MobileTabItem) => boolean;
}

export function MobileTabBar({
  items,
  activeHref,
  className,
  isActive,
}: MobileTabBarProps) {
  const navigate = useNavigate();
  const floatingAction = items.find((item) => item.isFloatingAction);
  const mainItems = items.filter((item) => !item.isFloatingAction);
  const openPath = (href: string) => {
    navigate(href);
  };

  return (
    <div
      className={cn(
        "mobile-safe-bottom pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-3 xl:hidden",
        className,
      )}
    >
      <div className="relative mx-auto flex max-w-[430px] justify-center">
        {floatingAction ? (
          <button
            type="button"
            aria-label={floatingAction.label}
            onClick={() => openPath(floatingAction.href)}
            className="pointer-events-auto absolute -top-14 right-2 z-10 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(226,232,240,0.96))] shadow-[0_18px_35px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/90 backdrop-blur transition active:scale-[0.98] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(188,214,233,0.9))] dark:ring-white/35 dark:shadow-[0_18px_35px_rgba(0,0,0,0.38)]"
          >
            {floatingAction.renderIcon ? (
              floatingAction.renderIcon(false)
            ) : floatingAction.icon ? (
              <floatingAction.icon className="h-7 w-7 text-[#111827]" />
            ) : null}
          </button>
        ) : null}

        <div className="mobile-tabbar-glass pointer-events-auto w-full rounded-[32px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.96))] px-3 py-2 shadow-[0_18px_55px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(76,87,103,0.82),rgba(44,52,66,0.76))] dark:shadow-[0_18px_55px_rgba(0,0,0,0.42)]">
          <div
            className="grid min-h-[66px] items-center gap-1"
            style={{
              gridTemplateColumns: `repeat(${Math.max(mainItems.length, 1)}, minmax(0, 1fr))`,
            }}
          >
            {mainItems.map((item) => {
          const active = isActive ? isActive(item) : activeHref === item.href;

            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                onClick={() => openPath(item.href)}
                className="group m-1 flex min-h-11 min-w-11 items-center justify-center"
              >
                {item.isCenterAction ? (
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition group-active:scale-[0.97]">
                    {item.renderIcon ? item.renderIcon(active) : null}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-2xl transition",
                      active
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 group-hover:text-slate-700 dark:text-white/55 dark:group-hover:text-white/75",
                    )}
                  >
                    {item.renderIcon
                      ? item.renderIcon(active)
                      : item.icon
                        ? <item.icon className="h-6 w-6" />
                        : null}
                    {item.badgeCount ? (
                      <Badge className="absolute right-0 top-0 h-4.5 min-w-4.5 justify-center rounded-full bg-red-500 px-0.5 text-[9px] text-white">
                        {item.badgeCount > 99 ? "99+" : item.badgeCount}
                      </Badge>
                    ) : null}
                    {active ? (
                      <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-foreground shadow-[0_0_10px_rgba(15,23,42,0.28)]" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
