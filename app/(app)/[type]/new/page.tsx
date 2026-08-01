import Link from "next/link";
import { notFound } from "next/navigation";
import { NewEntryForm } from "./new-entry-form";
import { getEntryType } from "@/lib/types";
import { todayISO } from "@/lib/utils";

const KNOWN_ROUTES = new Set(["day", "auth", "login", "actions", "import"]);

type PageProps = {
  params: Promise<{ type: string }>;
};

export default async function NewEntryPage({ params }: PageProps) {
  const { type } = await params;
  if (KNOWN_ROUTES.has(type)) notFound();

  const typeInfo = getEntryType(type);
  const defaultDate = todayISO();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/${type}`}
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          &larr; Back to {typeInfo.label}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          New {typeInfo.label} entry
        </h1>
      </div>

      <NewEntryForm
        type={type}
        defaultDate={defaultDate}
        placeholder={typeInfo.placeholder}
      />
    </div>
  );
}
