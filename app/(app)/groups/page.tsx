import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { listGroups } from "@/app/actions/groups";
import { CreateGroupButton } from "@/components/GroupForms";

export default async function GroupsPage() {
  const groups = await listGroups();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 sm:items-center">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <FolderOpen className="h-5 w-5 shrink-0 text-neutral-500 sm:h-6 sm:w-6" />
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              Groups
            </h1>
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {groups.length === 0
              ? "0 groups"
              : `${groups.length} ${groups.length === 1 ? "group" : "groups"}`}
          </span>
        </div>
        <CreateGroupButton />
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No groups yet. Create one for Book summaries, Programming logs, or
          anything else you want to organize.
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="flex items-baseline justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <span className="min-w-0 truncate font-medium">
                  {group.name}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                  {group._count.lists}{" "}
                  {group._count.lists === 1 ? "list" : "lists"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
