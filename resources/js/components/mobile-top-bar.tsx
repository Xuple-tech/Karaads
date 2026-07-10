import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface MobileTopBarAction {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  badgeCount?: number;
  variant?: "ghost" | "solid";
}

interface MobileTopBarProps {
  title?: string;
  subtitle?: string;
  leftAction?: MobileTopBarAction;
  rightActions?: MobileTopBarAction[];
  centerSlot?: React.ReactNode;
  className?: string;
}

function ActionButton({ action }: { action: MobileTopBarAction }) {
  const Icon = action.icon;

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={action.label}
      disabled={action.disabled}
      onClick={action.onClick}
      className={cn(
        "relative h-11 w-11 rounded-full border border-slate-200 text-slate-900 active:scale-[0.98] dark:border-white/10 dark:text-white",
        action.variant === "solid"
          ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-white/90"
          : "bg-white/80 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10",
      )}
    >
      <Icon className="h-4.5 w-4.5" />
      {action.badgeCount && action.badgeCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-slate-900 px-1 text-[10px] font-bold leading-5 text-white dark:bg-white dark:text-black">
          {action.badgeCount > 99 ? "99+" : action.badgeCount}
        </span>
      ) : null}
    </Button>
  );
}

export function MobileTopBar({
  title,
  subtitle,
  leftAction,
  rightActions = [],
  centerSlot,
  className,
}: MobileTopBarProps) {
  return (
    <div className={cn("mobile-header-glass mobile-safe-top sticky top-0 z-40", className)}>
      <div className="mobile-safe-x mx-auto w-full max-w-[640px] px-3 pb-3 pt-2">
        <div className="grid min-h-12 grid-cols-[auto_1fr_auto] items-center gap-2">
          <div className="flex min-w-11 justify-start">
            {leftAction ? <ActionButton action={leftAction} /> : <div className="h-11 w-11" />}
          </div>

          <div className="min-w-0 text-center">
            {centerSlot ? (
              centerSlot
            ) : title ? (
              <div className="min-w-0">
                <p className="karads-heading truncate text-[17px] font-semibold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </p>
                {subtitle ? (
                  <p className="truncate text-[11px] text-slate-500 dark:text-white/55">{subtitle}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex min-w-11 justify-end gap-2">
            {rightActions.length > 0 ? (
              rightActions.map((action) => <ActionButton key={action.label} action={action} />)
            ) : (
              <div className="h-11 w-11" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

