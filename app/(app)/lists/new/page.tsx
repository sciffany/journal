import Link from "next/link";
import { NewListForm } from "./new-list-form";

export default function NewListPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/lists"
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          &larr; Back to Lists
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          New list
        </h1>
      </div>

      <NewListForm />
    </div>
  );
}
