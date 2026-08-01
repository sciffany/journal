import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Entry } from "@prisma/client";
import { getEntry, listByDate } from "@/app/actions/entries";
import { EntryEditor } from "@/components/EntryEditor";
import { getEntryType } from "@/lib/types";
import { isValidISODate, shiftISODate, todayISO } from "@/lib/utils";

type PageProps = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ e?: string }>;
};

export default async function DayPage({ params, searchParams }: PageProps) {
  const { date } = await params;
  const { e: activeId } = await searchParams;

  if (!isValidISODate(date)) notFound();

  const [entries, activeEntry] = await Promise.all([
    listByDate(date),
    activeId ? getEntry(activeId) : Promise.resolve(null),
  ]);

  const parsed = parseISO(date);
  const prevDate = shiftISODate(date, -1);
  const nextDate = shiftISODate(date, 1);
  const isToday = date === todayISO();

  const groups = new Map<string, Entry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.type) ?? [];
    list.push(entry);
    groups.set(entry.type, list);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {isToday ? "Today" : format(parsed, "EEEE")}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {format(parsed, "MMMM d, yyyy")}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
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

      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          Nothing recorded on this day.
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([type, items]) => {
            const info = getEntryType(type);
            const Icon = info.icon;
            return (
              <section key={type} className="space-y-2">
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
                <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                  {items.map((entry) => {
                    const preview = (entry.body ?? "")
                      .replace(/\s+/g, " ")
                      .trim();
                    return (
                      <li key={entry.id}>
                        <Link
                          href={`?e=${entry.id}`}
                          scroll={false}
                          className="block px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                        >
                          <div className="font-medium">
                            {entry.title || (
                              <span className="text-neutral-400 dark:text-neutral-500">
                                (untitled)
                              </span>
                            )}
                          </div>
                          {preview && (
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

      <EntryEditor entry={activeEntry} />
    </div>
  );
}
