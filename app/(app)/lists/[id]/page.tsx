import Link from "next/link";
import { notFound } from "next/navigation";
import { ListEditor } from "@/components/ListEditor";
import { listGroups } from "@/app/actions/groups";
import { getList } from "@/app/actions/lists";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListPage({ params }: PageProps) {
  const { id } = await params;
  const [list, groups] = await Promise.all([getList(id), listGroups()]);
  if (!list) notFound();

  const backHref = list.group
    ? `/groups/${list.group.id}`
    : "/lists";
  const backLabel = list.group
    ? `Back to ${list.group.name}`
    : "Back to Lists";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={backHref}
        className="inline-block text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        &larr; {backLabel}
      </Link>

      <ListEditor
        list={list}
        groups={groups.map((g) => ({ id: g.id, name: g.name }))}
      />
    </div>
  );
}
