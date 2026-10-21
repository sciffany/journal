import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Entry } from "@prisma/client";
import {
  listCategoriesWithActivities,
  listEntriesForDate,
  listFrequentActivityIds,
  summarizeActivityRange,
} from "@/app/actions/activities";
import {
  countByTypeInRange,
  listByDate,
  listEntryDatesInRange,
} from "@/app/actions/entries";
import { ActivityLogger } from "@/components/ActivityLogger";
import { WeekStrip } from "@/components/WeekStrip";
import { Button } from "@/components/ui/button";
import { getEntryType } from "@/lib/types";
import {
  isValidISODate,
  shiftISODate,
  startOfWeekMonday,
  todayISO,
  weekDates,
} from "@/lib/utils";

type PageProps = {
  params: Promise<{ date: string }>;
};

export default async function DayPage({ params }: PageProps) {
  const { date } = await params;

  if (!isValidISODate(date)) notFound();

  const today = todayISO();
  const prevDate = shiftISODate(date, -1);
  const nextDate = shiftISODate(date, 1);
  const isToday = date === today;
  const week = weekDates(date);
  const weekStart = startOfWeekMonday(date);
  const weekEnd = shiftISODate(weekStart, 6);
  const returnTo = `/day/${date}`;

  const [
    entries,
    categories,
    activityEntries,
    yesterdayEntries,
    yesterdayActivities,
    entriesByType,
    entryDates,
    activitySummary,
    frequentActivityIds,
  ] = await Promise.all([
    listByDate(date),
    listCategoriesWithActivities(),
    listEntriesForDate(date),
    listByDate(prevDate),
    listEntriesForDate(prevDate),
    countByTypeInRange(weekStart, weekEnd),
    listEntryDatesInRange(weekStart, weekEnd),
    summarizeActivityRange(weekStart, weekEnd),
    listFrequentActivityIds(date),
  ]);

  const parsed = parseISO(date);
  const loggedActivityIds = activityEntries.map((e) => e.activityId);
  const yesterdayActivityIds = yesterdayActivities.map((e) => e.activityId);
  const yesterdayEmpty =
    yesterdayEntries.length === 0 && yesterdayActivities.length === 0;
  const markedDates = [...new Set([...entryDates, ...activitySummary.dates])];
  const daysLogged = markedDates.length;

  const groups = new Map<string, Entry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.type) ?? [];
    list.push(entry);
    groups.set(entry.type, list);
  }

  const journalType = getEntryType("journal");
  const todoType = getEntryType("todos");
  const JournalIcon = journalType.icon;
  const TodoIcon = todoType.icon;
  const journalHref = newEntryHref("journal", date, returnTo);
  const todoHref = newEntryHref("todos", date, returnTo);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {isToday ? "Today" : format(parsed, "EEEE")}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {format(parsed, "MMMM d, yyyy")}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
              {loggedActivityIds.length > 0 && (
                <>
                  {" · "}
                  {loggedActivityIds.length}{" "}
                  {loggedActivityIds.length === 1 ? "activity" : "activities"}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/day/${prevDate}`}
              className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href={`/day/${nextDate}`}
              className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <WeekStrip
          dates={week}
          viewedDate={date}
          today={today}
          markedDates={markedDates}
          stampsByDate={activitySummary.stampsByDate}
          daysLogged={daysLogged}
          entriesByType={Object.fromEntries(entriesByType)}
          activityCount={activitySummary.count}
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={journalHref}>
              <JournalIcon className="h-4 w-4" />
              New journal
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={todoHref}>
              <TodoIcon className="h-4 w-4" />
              New todo
            </Link>
          </Button>
        </div>
        {isToday && yesterdayEmpty && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            <Link
              href={`/day/${prevDate}`}
              className="underline-offset-4 hover:text-neutral-900 hover:underline dark:hover:text-neutral-100"
            >
              Yesterday is still open
            </Link>
          </p>
        )}
      </div>

      <ActivityLogger
        date={date}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          activities: c.activities.map((a) => ({
            id: a.id,
            name: a.name,
            slug: a.slug,
            color: a.color,
          })),
        }))}
        loggedActivityIds={loggedActivityIds}
        yesterdayActivityIds={yesterdayActivityIds}
        oftenActivityIds={frequentActivityIds}
      />

      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-12 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {isToday
              ? journalType.placeholder
              : "Nothing written on this day yet."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={journalHref}>
                <JournalIcon className="h-4 w-4" />
                New journal
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={todoHref}>
                <TodoIcon className="h-4 w-4" />
                New todo
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([type, items]) => {
            const info = getEntryType(type);
            const Icon = info.icon;
            return (
              <section key={type} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/${type}`}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    <Icon className="h-4 w-4" />
                    {info.label}
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      ({items.length})
                    </span>
                  </Link>
                  <Link
                    href={newEntryHref(type, date, returnTo)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Link>
                </div>
                <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                  {items.map((entry) => {
                    const preview = (entry.body ?? "")
                      .replace(/\s+/g, " ")
                      .trim();
                    const heading = entry.title?.trim() || preview;
                    const showPreview = Boolean(entry.title?.trim() && preview);
                    return (
                      <li key={entry.id}>
                        <Link
                          href={`/${entry.type}/${entry.id}`}
                          className="block px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                        >
                          <div className="font-medium">
                            {heading || (
                              <span className="text-neutral-400 dark:text-neutral-500">
                                (untitled)
                              </span>
                            )}
                          </div>
                          {showPreview && (
                            <div className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                              {preview}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function newEntryHref(type: string, date: string, returnTo: string) {
  return `/${type}/new?date=${date}&returnTo=${encodeURIComponent(returnTo)}`;
}
