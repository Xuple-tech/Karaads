import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function MobileActionSheet({
  open,
  onOpenChange,
  title = "Actions",
  description,
  children,
}: MobileActionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "rounded-t-[24px] border-white/10 bg-[#11151c] p-0 text-white",
          "max-h-[85vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-white/15" />
        <SheetHeader className="px-4 pb-3 pt-2">
          <SheetTitle className="text-white">{title}</SheetTitle>
          {description ? <SheetDescription className="text-white/60">{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="px-3 pb-3">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

