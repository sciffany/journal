import Link from "next/link";
import { notFound } from "next/navigation";
import { NewEntryForm } from "./new-entry-form";
import { getEntryType } from "@/lib/types";
import { isValidISODate, todayISO } from "@/lib/utils";

const KNOWN_ROUTES = new Set([
  "day",
  "auth",
  "login",
  "actions",
  "import",
  "activities",
  "lists",
  "groups",
]);

type PageProps = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ date?: string; returnTo?: string }>;
};

export default async function NewEntryPage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { date: dateParam, returnTo: returnToParam } = await searchParams;
  if (KNOWN_ROUTES.has(type)) notFound();

  const typeInfo = getEntryType(type);
  const defaultDate =
    dateParam && isValidISODate(dateParam) ? dateParam : todayISO();
  const returnTo =
    returnToParam?.startsWith("/") &&
    !returnToParam.startsWith("//") &&
    !returnToParam.includes("://")
      ? returnToParam
      : undefined;
  const backHref = returnTo ?? `/${type}`;
  const backLabel = returnTo ? "Back" : `Back to ${typeInfo.label}`;

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
          New {typeInfo.label} entry
        </h1>
      </div>

      <NewEntryForm
        type={type}
        defaultDate={defaultDate}
        placeholder={typeInfo.placeholder}
        returnTo={returnTo}
      />
    </div>
  );
}
