import Link from "next/link";
import { cn, shiftISODate } from "@/lib/utils";

type Props = {
  /** ISO dates (YYYY-MM-DD) that have activity logged */
  activeDates: string[];
  /** End of the heatmap window (inclusive), typically today */
  endDate: string;
  /** Number of days to show ending at endDate (default ~1 year) */
  days?: number;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function utcDayOfWeek(iso: string): number {
  return new Date(`${iso}T00:00:00.000Z`).getUTCDay();
}

function utcMonth(iso: string): number {
  return new Date(`${iso}T00:00:00.000Z`).getUTCMonth();
}

export function ActivityHeatmap({
  activeDates,
  endDate,
  days = 371,
}: Props) {
  const active = new Set(activeDates);
  const start = shiftISODate(endDate, -(days - 1));

  // Align columns to weeks starting Sunday (GitHub-style)
  let gridStart = start;
  const startDow = utcDayOfWeek(start);
  if (startDow > 0) {
    gridStart = shiftISODate(start, -startDow);
  }

  const cells: { iso: string; inRange: boolean }[] = [];
  let cursor = gridStart;
  // Include full weeks through endDate
  while (true) {
    const inRange = cursor >= start && cursor <= endDate;
    cells.push({ iso: cursor, inRange });
    if (cursor >= endDate && cells.length % 7 === 0) break;
    cursor = shiftISODate(cursor, 1);
    if (cells.length > 400) break;
  }

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstInRange = week.find((c) => c.inRange);
    if (!firstInRange) return;
    const month = utcMonth(firstInRange.iso);
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTH_LABELS[month], weekIndex });
      lastMonth = month;
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-0">
        <div
          className="mb-1 grid gap-[3px] text-[10px] text-neutral-500 dark:text-neutral-400"
          style={{
            gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 11px))`,
            marginLeft: "18px",
          }}
        >
          {weeks.map((_, weekIndex) => {
            const label = monthLabels.find((m) => m.weekIndex === weekIndex);
            return (
              <div key={weekIndex} className="h-3 truncate">
                {label?.label ?? ""}
              </div>
            );
          })}
        </div>
        <div className="flex gap-[3px]">
          <div className="flex flex-col justify-between py-[1px] pr-1 text-[10px] leading-none text-neutral-500 dark:text-neutral-400">
            <span className="h-[11px]" />
            <span className="h-[11px]">Mon</span>
            <span className="h-[11px]" />
            <span className="h-[11px]">Wed</span>
            <span className="h-[11px]" />
            <span className="h-[11px]">Fri</span>
            <span className="h-[11px]" />
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell) => {
                  if (!cell.inRange) {
                    return (
                      <div
                        key={cell.iso}
                        className="h-[11px] w-[11px] rounded-[2px] bg-transparent"
                      />
                    );
                  }
                  const on = active.has(cell.iso);
                  return (
                    <Link
                      key={cell.iso}
                      href={`/day/${cell.iso}`}
                      title={cell.iso}
                      className={cn(
                        "h-[11px] w-[11px] rounded-[2px] transition-colors",
                        on
                          ? "bg-neutral-800 hover:bg-neutral-950 dark:bg-neutral-200 dark:hover:bg-white"
                          : "bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700",
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
          <span>Less</span>
          <span className="h-[11px] w-[11px] rounded-[2px] bg-neutral-200/80 dark:bg-neutral-800" />
          <span className="h-[11px] w-[11px] rounded-[2px] bg-neutral-800 dark:bg-neutral-200" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
