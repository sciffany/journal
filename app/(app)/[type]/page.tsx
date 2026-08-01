import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { EntryGrid } from "@/components/EntryGrid";
import { EntryEditor } from "@/components/EntryEditor";
import { Button } from "@/components/ui/button";
import { getEntry, listByType } from "@/app/actions/entries";
import { getEntryType } from "@/lib/types";

const KNOWN_ROUTES = new Set(["day", "auth", "login", "actions"]);

type PageProps = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ e?: string }>;
};

export default async function TypePage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { e: activeId } = await searchParams;

  if (KNOWN_ROUTES.has(type)) notFound();

  const typeInfo = getEntryType(type);
  const [entries, activeEntry] = await Promise.all([
    listByType(type),
    activeId ? getEntry(activeId) : Promise.resolve(null),
  ]);

  const Icon = typeInfo.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-neutral-500" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {typeInfo.label}
          </h1>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <Button asChild>
          <Link href={`/${type}/new`}>
            <Plus className="h-4 w-4" /> New
          </Link>
        </Button>
      </div>

      <EntryGrid entries={entries} />
      <EntryEditor entry={activeEntry} />
    </div>
  );
}
