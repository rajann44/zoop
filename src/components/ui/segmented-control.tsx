"use client";

import { cn } from "@/lib/utils";

type SegmentedControlProps<T extends string> = {
  id?: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  getLabel: (value: T) => string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  id,
  value,
  options,
  onChange,
  getLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div id={id} role="radiogroup" className={cn("control-surface inline-flex w-full items-center gap-1 rounded-xl p-1", className)}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={cn(
              "h-9 min-w-0 flex-1 rounded-lg px-1.5 text-center text-xs font-medium leading-none whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-accent text-accent-foreground shadow-[0_1px_1px_rgb(0_0_0_/_0.08)]"
                : "text-foreground/75 hover:bg-[color:var(--accent-primary-muted)]",
            )}
          >
            {getLabel(option)}
          </button>
        );
      })}
    </div>
  );
}
