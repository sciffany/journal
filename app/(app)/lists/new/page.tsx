import Link from "next/link";
import { listGroups } from "@/app/actions/groups";
import { NewListForm } from "./new-list-form";

type PageProps = {
  searchParams: Promise<{ groupId?: string }>;
};

export default async function NewListPage({ searchParams }: PageProps) {
  const { groupId } = await searchParams;
  const groups = await listGroups();
  const selectedGroupId =
    groupId && groups.some((g) => g.id === groupId) ? groupId : undefined;
  const backHref = selectedGroupId
    ? `/groups/${selectedGroupId}`
    : "/lists";
  const backLabel = selectedGroupId ? "Back to Group" : "Back to Lists";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={backHref}
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          &larr; {backLabel}
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          New list
        </h1>
      </div>

      <NewListForm
        groups={groups.map((g) => ({ id: g.id, name: g.name }))}
        defaultGroupId={selectedGroupId}
        cancelHref={backHref}
      />
    </div>
  );
}
