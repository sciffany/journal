import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryEditor } from "@/components/EntryEditor";
import { getEntry } from "@/app/actions/entries";
import { getEntryType } from "@/lib/types";

const KNOWN_ROUTES = new Set(["day", "auth", "login", "actions", "import"]);

type PageProps = {
  params: Promise<{ type: string; id: string }>;
};

export default async function EntryPage({ params }: PageProps) {
  const { type, id } = await params;
  if (KNOWN_ROUTES.has(type)) notFound();

  const entry = await getEntry(id);
  if (!entry || entry.type !== type) notFound();

  const typeInfo = getEntryType(type);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/${type}`}
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          &larr; Back to {typeInfo.label}
        </Link>
        <h1 className="mt-2 break-words text-xl font-semibold tracking-tight sm:text-2xl">
          {entry.title || "Untitled entry"}
        </h1>
      </div>

      <EntryEditor entry={entry} />
    </div>
  );
}
