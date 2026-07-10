import { cn } from "@/lib/utils";

interface MobilePageShellProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  withBottomNavSpacing?: boolean;
}

export function MobilePageShell({
  header,
  children,
  className,
  contentClassName,
  withBottomNavSpacing = true,
}: MobilePageShellProps) {
  return (
    <div className={cn("mobile-page-bg min-h-screen text-foreground", className)}>
      {header}
      <div
        className={cn(
          "mx-auto w-full max-w-[680px] px-3 sm:px-4 lg:max-w-5xl lg:px-6 xl:max-w-6xl 2xl:max-w-7xl",
          withBottomNavSpacing && "mobile-bottom-nav-offset",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

