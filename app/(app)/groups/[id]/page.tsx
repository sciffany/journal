import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { getGroup } from "@/app/actions/groups";
import {
  DeleteGroupButton,
  RenameGroupButton,
} from "@/components/GroupForms";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupPage({ params }: PageProps) {
  const { id } = await params;
  const group = await getGroup(id);
  if (!group) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/groups"
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          &larr; Back to Groups
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {group.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {group.lists.length === 0
              ? "0 lists"
              : `${group.lists.length} ${group.lists.length === 1 ? "list" : "lists"}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RenameGroupButton groupId={group.id} groupName={group.name} />
          <DeleteGroupButton
            groupId={group.id}
            groupName={group.name}
            listCount={group.lists.length}
          />
          <Button asChild>
            <Link href={`/lists/new?groupId=${group.id}`}>
              <Plus className="h-4 w-4" /> New list
            </Link>
          </Button>
        </div>
      </div>

      {group.lists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No lists in this group yet. Click{" "}
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            New list
          </span>{" "}
          to add one.
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {group.lists.map((list) => {
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
