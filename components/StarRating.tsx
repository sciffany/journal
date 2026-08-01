"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { RATING_MAX } from "@/lib/ratings";
import { cn } from "@/lib/utils";

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

export function StarRating({ value, onChange, disabled }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium">Rating</span>
        <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
          {value != null ? `${value} / ${RATING_MAX}` : "Not rated"}
        </span>
      </div>
      <div
        className="flex flex-wrap items-center gap-0.5"
        onMouseLeave={() => setHover(null)}
        role="radiogroup"
        aria-label={`Rating from 1 to ${RATING_MAX}`}
      >
        {Array.from({ length: RATING_MAX }, (_, i) => {
          const n = i + 1;
          const filled = display != null && n <= display;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} out of ${RATING_MAX}`}
              disabled={disabled}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              onClick={() => onChange(value === n ? null : n)}
              className={cn(
                "rounded p-0.5 text-neutral-300 transition-colors",
                "hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
                "disabled:pointer-events-none disabled:opacity-50",
                "dark:text-neutral-600",
              )}
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  filled && "fill-amber-400 text-amber-400",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
