"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Entry } from "@prisma/client";
import { format } from "date-fns";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStarsFromMetadata, RATING_MAX } from "@/lib/ratings";
import { cn, formatDateISO } from "@/lib/utils";

type SortKey = "date" | "title" | "updatedAt";
type SortDir = "asc" | "desc";

export function EntryGrid({ entries }: { entries: Entry[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const list = [...entries];
    list.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (sortKey === "title") {
        av = (a.title ?? "").toLowerCase();
        bv = (b.title ?? "").toLowerCase();
      } else if (sortKey === "updatedAt") {
        av = a.updatedAt.getTime();
        bv = b.updatedAt.getTime();
      } else {
        av = a.date.getTime();
        bv = b.date.getTime();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [entries, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "title" ? "asc" : "desc");
    }
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        No entries yet. Click{" "}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          New
        </span>{" "}
        to add one.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead
              label="Date"
              active={sortKey === "date"}
              dir={sortDir}
              onClick={() => toggleSort("date")}
              className="w-32"
            />
            <SortableHead
              label="Title"
              active={sortKey === "title"}
              dir={sortDir}
              onClick={() => toggleSort("title")}
              className="w-64"
            />
            <TableHead>Preview</TableHead>
            <SortableHead
              label="Updated"
              active={sortKey === "updatedAt"}
              dir={sortDir}
              onClick={() => toggleSort("updatedAt")}
              className="w-32"
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((entry) => (
            <RowLink key={entry.id} entry={entry} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SortableHead({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100",
          active && "text-neutral-900 dark:text-neutral-100",
        )}
      >
        {label}
        {active &&
          (dir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          ))}
      </button>
    </TableHead>
  );
}

function RowLink({ entry }: { entry: Entry }) {
  const href = `/${entry.type}/${entry.id}`;
  const preview = (entry.body ?? "").replace(/\s+/g, " ").trim();
  const stars =
    entry.type === "ratings" ? getStarsFromMetadata(entry.metadata) : null;

  return (
    <TableRow className="cursor-pointer">
      <TableCell className="p-0">
        <Link
          href={`/day/${formatDateISO(entry.date)}`}
          className="block px-4 py-4 text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-300"
        >
          {format(entry.date, "MMM d, yyyy")}
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link href={href} className="block px-4 py-4 font-medium">
          <span className="inline-flex items-center gap-2">
            {entry.title || (
              <span className="text-neutral-400 dark:text-neutral-500">
                (untitled)
              </span>
            )}
            {stars != null && (
              <span className="text-xs font-normal tabular-nums text-amber-600 dark:text-amber-400">
                {stars}/{RATING_MAX}
              </span>
            )}
          </span>
        </Link>
      </TableCell>
      <TableCell className="p-0">
        <Link
          href={href}
          className="block truncate px-4 py-4 text-neutral-500 dark:text-neutral-400"
        >
          {preview || (
            <span className="text-neutral-300 dark:text-neutral-600">
              (empty)
            </span>
          )}
        </Link>
      </TableCell>
      <TableCell className="p-0 text-neutral-500 dark:text-neutral-400">
        <Link href={href} className="block px-4 py-4">
          {format(entry.updatedAt, "MMM d")}
        </Link>
      </TableCell>
    </TableRow>
  );
}
