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
      <div>
        <Link
          href="/lists"
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          &larr; Back to Lists
        </Link>
        <h1 className="mt-2 break-words text-xl font-semibold tracking-tight sm:text-2xl">
          {list.title}
        </h1>
      </div>

      <ListEditor list={list} />
    </div>
  );
}
