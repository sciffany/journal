import Link from "next/link";
import { format } from "date-fns";
import { List as ListIcon, Plus } from "lucide-react";
import { listLists } from "@/app/actions/lists";
import { Button } from "@/components/ui/button";

export default async function ListsPage() {
  const lists = await listLists();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 sm:items-center">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ListIcon className="h-5 w-5 shrink-0 text-neutral-500 sm:h-6 sm:w-6" />
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              Lists
            </h1>
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {lists.length === 0
              ? "0 lists"
              : `${lists.length} ${lists.length === 1 ? "list" : "lists"}`}
          </span>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/lists/new">
            <Plus className="h-4 w-4" /> New
          </Link>
        </Button>
      </div>

      {lists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No lists yet. Click{" "}
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            New
          </span>{" "}
          to create one — movies to watch, books to read, ideas, and more.
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {lists.map((list) => {
            const preview = (list.body ?? "").replace(/\s+/g, " ").trim();
            return (
              <li key={list.id}>
                <Link
                  href={`/lists/${list.id}`}
                  className="block px-4 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate font-medium">
                      {list.title}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                      {format(list.updatedAt, "MMM d")}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {preview || (
                      <span className="text-neutral-300 dark:text-neutral-600">
                        (empty)
                      </span>
                    )}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
