"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toggleActivityEntry } from "@/app/actions/activities";
import { cn } from "@/lib/utils";

type Activity = {
  id: string;
  name: string;
  slug: string;
};

type Category = {
  id: string;
  name: string;
  activities: Activity[];
};

type Props = {
  date: string;
  categories: Category[];
  loggedActivityIds: string[];
};

export function ActivityLogger({
  date,
  categories,
  loggedActivityIds,
}: Props) {
  const [optimisticLogged, addOptimistic] = useOptimistic(
    new Set(loggedActivityIds),
    (current: Set<string>, activityId: string) => {
      const next = new Set(current);
      if (next.has(activityId)) next.delete(activityId);
      else next.add(activityId);
      return next;
    },
  );
  const [, startTransition] = useTransition();

  const hasActivities = categories.some((c) => c.activities.length > 0);

  if (!hasActivities) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        No activities yet.{" "}
        <Link
          href="/activities"
          className="font-medium text-neutral-800 underline-offset-2 hover:underline dark:text-neutral-200"
        >
          Create some
        </Link>{" "}
        to start tracking.
      </div>
    );
  }

  function handleToggle(activityId: string) {
    startTransition(async () => {
      addOptimistic(activityId);
      await toggleActivityEntry(date, activityId);
    });
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        if (category.activities.length === 0) return null;
        return (
          <div key={category.id} className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {category.name}
            </div>
            <div className="flex flex-wrap gap-2">
              {category.activities.map((activity) => {
                const on = optimisticLogged.has(activity.id);
                return (
                  <div key={activity.id} className="inline-flex items-stretch">
                    <button
                      type="button"
                      onClick={() => handleToggle(activity.id)}
                      aria-pressed={on}
                      className={cn(
                        "rounded-l-md border px-2.5 py-1 text-sm transition-colors",
                        on
                          ? "border-neutral-800 bg-neutral-900 text-neutral-50 dark:border-neutral-200 dark:bg-neutral-100 dark:text-neutral-900"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900",
                      )}
                    >
                      {activity.name}
                    </button>
                    <Link
                      href={`/activities/${activity.slug}`}
                      className={cn(
                        "rounded-r-md border border-l-0 px-2 py-1 text-xs transition-colors",
                        on
                          ? "border-neutral-800 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 dark:border-neutral-200 dark:bg-neutral-200 dark:text-neutral-700 dark:hover:bg-neutral-300"
                          : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800",
                      )}
                      title={`View ${activity.name}`}
                      aria-label={`View ${activity.name}`}
                    >
                      →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
