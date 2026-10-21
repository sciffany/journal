"use client";

import { ACTIVITY_COLORS } from "@/lib/activity-colors";
import { cn } from "@/lib/utils";

type Props = {
  name?: string;
  value: string;
  onChange?: (color: string) => void;
  disabled?: boolean;
};

export function ActivityColorSwatches({
  name = "color",
  value,
  onChange,
  disabled,
}: Props) {
  const controlled = Boolean(onChange);

  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label="Activity color"
    >
      {ACTIVITY_COLORS.map((color) => {
        const selected = value === color.id;
        return (
          <label
            key={color.id}
            title={color.label}
            className={cn(disabled ? "cursor-default" : "cursor-pointer")}
          >
            <input
              type="radio"
              name={name}
              value={color.id}
              checked={controlled ? selected : undefined}
              defaultChecked={controlled ? undefined : selected}
              onChange={() => onChange?.(color.id)}
              disabled={disabled}
              className="peer sr-only"
            />
            <span
              className={cn(
                "block h-6 w-6 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-white peer-focus-visible:ring-neutral-400 dark:ring-offset-neutral-950",
                color.dot,
                selected && "ring-neutral-900 dark:ring-neutral-100",
              )}
            >
              <span className="sr-only">{color.label}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
