import { cn } from "@/lib/utils";

export interface MobileSegmentedOption<T extends string> {
  id: T;
  label: string;
}

interface MobileSegmentedControlProps<T extends string> {
  value: T;
  options: Array<MobileSegmentedOption<T>>;
  onChange: (value: T) => void;
  className?: string;
}

export function MobileSegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
}: MobileSegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex min-h-11 items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl",
        className,
      )}
      role="tablist"
      aria-label="Segmented control"
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              "min-h-9 rounded-xl px-3 py-2 text-xs font-semibold transition",
              selected
                ? "bg-white text-[#0b0e13] shadow-sm"
                : "text-white/70 hover:bg-white/5 hover:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

