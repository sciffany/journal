"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateActivityColor } from "@/app/actions/activities";
import { ActivityColorSwatches } from "@/components/ActivityColorSwatches";

export function ActivityColorPicker({
  activityId,
  color,
}: {
  activityId: string;
  color: string;
}) {
  const [current, setCurrent] = useOptimistic(
    color,
    (_current: string, next: string) => next,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleChange(next: string) {
    if (next === current || pending) return;
    setError(null);
    startTransition(async () => {
      setCurrent(next);
      try {
        await updateActivityColor(activityId, next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save the color.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        Color
      </div>
      <ActivityColorSwatches
        name={`color-${activityId}`}
        value={current}
        onChange={handleChange}
        disabled={pending}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
