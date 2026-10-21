"use client";

import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { ChevronRight } from "lucide-react";
import {
  copyActivityEntriesFromDate,
  toggleActivityEntry,
} from "@/app/actions/activities";
import { Input } from "@/components/ui/input";
import { activityColor } from "@/lib/activity-colors";
import { cn, shiftISODate } from "@/lib/utils";

type Activity = {
  id: string;
  name: string;
  slug: string;
  color: string;
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
  yesterdayActivityIds?: string[];
  oftenActivityIds?: string[];
};

export function ActivityLogger({
  date,
  categories,
  loggedActivityIds,
  yesterdayActivityIds = [],
  oftenActivityIds = [],
}: Props) {
  const [query, setQuery] = useState("");
  const [optimisticLogged, addOptimistic] = useOptimistic(
    new Set(loggedActivityIds),
    (current: Set<string>, activityIds: string | string[]) => {
      const next = new Set(current);
      const ids = Array.isArray(activityIds) ? activityIds : [activityIds];
      for (const activityId of ids) {
        if (next.has(activityId)) next.delete(activityId);
        else next.add(activityId);
      }
      return next;
    },
  );
  const [pending, startTransition] = useTransition();
  const yesterday = shiftISODate(date, -1);
  const missingFromYesterday = yesterdayActivityIds.filter(
    (id) => !optimisticLogged.has(id),
  );
  const canCopyYesterday = missingFromYesterday.length > 0;

  const allActivities = categories.flatMap((c) => c.activities);
  const byId = useMemo(
    () => new Map(allActivities.map((activity) => [activity.id, activity])),
    [allActivities],
  );
  const loggedActivities = allActivities.filter((a) =>
    optimisticLogged.has(a.id),
  );
  const hasActivities = allActivities.length > 0;
  const needle = query.trim().toLowerCase();

  const oftenActivities = useMemo(() => {
    const seen = new Set<string>();
    const list: Activity[] = [];
    for (const id of [...yesterdayActivityIds, ...oftenActivityIds]) {
      if (seen.has(id)) continue;
      const activity = byId.get(id);
      if (!activity) continue;
      seen.add(id);
      list.push(activity);
    }
    return list;
  }, [yesterdayActivityIds, oftenActivityIds, byId]);

  const visibleOften = needle
    ? oftenActivities.filter((a) => a.name.toLowerCase().includes(needle))
    : oftenActivities;

  const visibleCategories = categories
    .map((category) => ({
      ...category,
      activities: needle
        ? category.activities.filter((a) =>
            a.name.toLowerCase().includes(needle),
          )
        : category.activities,
    }))
    .filter((category) => category.activities.length > 0);

  function handleToggle(activityId: string) {
    startTransition(async () => {
      addOptimistic(activityId);
      await toggleActivityEntry(date, activityId);
    });
  }

  function handleCopyYesterday() {
    if (!canCopyYesterday || pending) return;
    startTransition(async () => {
      addOptimistic(missingFromYesterday);
      await copyActivityEntriesFromDate(yesterday, date);
    });
  }

  if (!hasActivities) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Activities
          </h2>
          <Link
            href="/activities"
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Manage
          </Link>
        </div>
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
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Activities
        </h2>
        <div className="flex items-center gap-3">
          {canCopyYesterday && (
            <button
              type="button"
              onClick={handleCopyYesterday}
              disabled={pending}
              className="text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Same as yesterday
            </button>
          )}
          <Link
            href="/activities"
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Manage
          </Link>
        </div>
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find an activity…"
        aria-label="Find an activity"
      />

      {loggedActivities.length > 0 && (
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {loggedActivities.map((activity, index) => (
            <span key={activity.id}>
              {index > 0 && " · "}
              <span
                className={cn(
                  "mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle",
                  activityColor(activity.color).dot,
                )}
              />
              {activity.name}
            </span>
          ))}
        </p>
      )}

      {visibleOften.length > 0 && !needle && (
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Often
          </div>
          <ActivityGrid
            activities={visibleOften}
            logged={optimisticLogged}
            onToggle={handleToggle}
          />
        </div>
      )}

      {visibleCategories.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No activities match “{query.trim()}”.
        </p>
      ) : (
        <div className="space-y-4">
          {visibleCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {category.name}
              </div>
              <ActivityGrid
                activities={category.activities}
                logged={optimisticLogged}
                onToggle={handleToggle}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ActivityGrid({
  activities,
  logged,
  onToggle,
}: {
  activities: Activity[];
  logged: Set<string>;
  onToggle: (activityId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {activities.map((activity) => (
        <ActivityChip
          key={activity.id}
          activity={activity}
          on={logged.has(activity.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

function ActivityChip({
  activity,
  on,
  onToggle,
}: {
  activity: Activity;
  on: boolean;
  onToggle: (activityId: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-stretch overflow-hidden rounded-md border",
        on
          ? "border-neutral-800 bg-neutral-900 text-neutral-50 dark:border-neutral-200 dark:bg-neutral-100 dark:text-neutral-900"
          : "border-neutral-200 bg-white text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300",
      )}
    >
      <span
        className={cn("w-1 shrink-0", activityColor(activity.color).dot)}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => onToggle(activity.id)}
        aria-pressed={on}
        title={activity.name}
        className={cn(
          "min-w-0 flex-1 truncate px-2.5 py-2 text-left text-sm transition-colors",
          on
            ? "hover:bg-neutral-800 dark:hover:bg-neutral-200"
            : "hover:bg-neutral-50 dark:hover:bg-neutral-900",
        )}
      >
        {activity.name}
      </button>
      <Link
        href={`/activities/${activity.slug}`}
        className={cn(
          "flex w-8 shrink-0 items-center justify-center border-l text-xs transition-colors",
          on
            ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800 dark:border-neutral-300 dark:text-neutral-700 dark:hover:bg-neutral-200"
            : "border-neutral-200 text-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900",
        )}
        title={`View ${activity.name}`}
        aria-label={`View ${activity.name}`}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
