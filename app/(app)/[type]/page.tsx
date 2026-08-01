import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { EntryGrid } from "@/components/EntryGrid";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { listByType } from "@/app/actions/entries";
import { getEntryType } from "@/lib/types";

const KNOWN_ROUTES = new Set(["day", "auth", "login", "actions", "import"]);

type PageProps = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function TypePage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { page: pageParam } = await searchParams;

  if (KNOWN_ROUTES.has(type)) notFound();

  const requestedPage = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const typeInfo = getEntryType(type);
  const { entries, total, page, pageSize, totalPages } = await listByType(
    type,
    { page: requestedPage },
  );

  const Icon = typeInfo.icon;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function hrefForPage(p: number) {
    return p <= 1 ? `/${type}` : `/${type}?page=${p}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-neutral-500" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {typeInfo.label}
          </h1>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {total === 0
              ? "0 entries"
              : `${from}–${to} of ${total} ${total === 1 ? "entry" : "entries"}`}
          </span>
        </div>
        <Button asChild>
          <Link href={`/${type}/new`}>
            <Plus className="h-4 w-4" /> New
          </Link>
        </Button>
      </div>

      <EntryGrid entries={entries} />
      <Pagination page={page} totalPages={totalPages} hrefForPage={hrefForPage} />
    </div>
  );
}
