import Link from "next/link";
import { notFound } from "next/navigation";
import { ListEditor } from "@/components/ListEditor";
import { getList } from "@/app/actions/lists";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListPage({ params }: PageProps) {
  const { id } = await params;
  const list = await getList(id);
  if (!list) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/lists"
        className="inline-block text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        &larr; Back to Lists
      </Link>

      <ListEditor list={list} />
    </div>
  );
}
