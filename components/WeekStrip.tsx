import Link from "next/link";
import { format, parseISO } from "date-fns";
import { activityColor } from "@/lib/activity-colors";
import { ENTRY_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";

export type DayStamp = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  dates: string[];
  viewedDate: string;
  today: string;
  markedDates: string[];
  stampsByDate: Record<string, DayStamp[]>;
  daysLogged: number;
  entriesByType: Record<string, number>;
  activityCount: number;
};

const MAX_STAMPS = 8;

const TYPE_WORDS: Record<string, [string, string]> = {
  journal: ["journal", "journals"],
  todos: ["todo", "todos"],
  ratings: ["rating", "ratings"],
  gratitude: ["gratitude", "gratitudes"],
};

function countPhrase(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function WeekStrip({
  dates,
  viewedDate,
  today,
  markedDates,
  stampsByDate,
  daysLogged,
  entriesByType,
  activityCount,
}: Props) {
  const marked = new Set(markedDates);
  const includesToday = dates.includes(today);
  const weekLabel = includesToday
    ? "This week"
    : `Week of ${format(parseISO(dates[0] ?? viewedDate), "MMM d")}`;

  const parts: string[] = [];
  if (daysLogged > 0) parts.push(countPhrase(daysLogged, "day", "days"));
  for (const type of ENTRY_TYPES) {
    const count = entriesByType[type.slug] ?? 0;
    if (count === 0) continue;
    const words = TYPE_WORDS[type.slug] ?? [
      type.slug,
      `${type.slug}s`,
    ];
    parts.push(countPhrase(count, words[0], words[1]));
  }
  if (activityCount > 0) {
    parts.push(countPhrase(activityCount, "activity", "activities"));
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {dates.map((iso) => {
          const parsed = parseISO(iso);
          const selected = iso === viewedDate;
          const isToday = iso === today;
          const stamps = stampsByDate[iso] ?? [];
          const hasContent = marked.has(iso);
          const visible = stamps.slice(0, MAX_STAMPS);
          const extra = stamps.length - visible.length;
          const label = format(parsed, "EEEE MMMM d");
          const stampLabel =
            stamps.length > 0
              ? `${label}, ${stamps.map((stamp) => stamp.name).join(", ")}`
              : label;
          return (
            <Link
              key={iso}
              href={`/day/${iso}`}
              className={cn(
                "flex flex-col items-center rounded-md px-0.5 py-2 text-center transition-colors",
                selected
                  ? "bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900",
              )}
              aria-current={selected ? "date" : undefined}
              aria-label={stampLabel}
            >
              <span className="text-[10px] uppercase tracking-wider">
                {format(parsed, "EEE")}
              </span>
              <span
                className={cn(
                  "text-sm tabular-nums",
                  isToday && !selected && "font-semibold text-neutral-900 dark:text-neutral-100",
                )}
              >
                {format(parsed, "d")}
              </span>
              <span className="mt-1 flex min-h-3.5 max-w-full flex-wrap items-center justify-center gap-[3px]">
                {visible.map((stamp) => (
                  <span
                    key={stamp.id}
                    title={stamp.name}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      activityColor(stamp.color).dot,
                    )}
                  />
                ))}
                {extra > 0 && (
                  <span
                    className={cn(
                      "text-[9px] font-medium leading-none tabular-nums",
                      selected
                        ? "text-neutral-300 dark:text-neutral-600"
                        : "text-neutral-500 dark:text-neutral-400",
                    )}
                  >
                    +{extra}
                  </span>
                )}
                {stamps.length === 0 && hasContent && (
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full",
                      selected
                        ? "bg-neutral-50 dark:bg-neutral-900"
                        : "bg-neutral-900 dark:bg-neutral-100",
                    )}
                  />
                )}
              </span>
            </Link>
          );
        })}
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {weekLabel}
        {parts.length > 0 ? ` · ${parts.join(" · ")}` : " · nothing yet"}
      </p>
    </div>
  );
}
