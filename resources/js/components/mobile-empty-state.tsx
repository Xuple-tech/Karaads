import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MobileEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export function MobileEmptyState({
  icon: Icon,
  title,
  description,
  className,
  action,
}: MobileEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <Icon className="h-7 w-7 text-white/60" />
      </div>
      <p className="karads-heading text-base font-semibold text-white">{title}</p>
      {description ? <p className="mt-1 max-w-xs text-sm text-white/55">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

