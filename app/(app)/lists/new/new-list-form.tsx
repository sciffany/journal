"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createListFromForm } from "@/app/actions/lists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type GroupOption = {
  id: string;
  name: string;
};

type Props = {
  groups: GroupOption[];
  defaultGroupId?: string;
  cancelHref?: string;
};

export function NewListForm({
  groups,
  defaultGroupId,
  cancelHref = "/lists",
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createListFromForm(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create list.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-xs font-medium">
          Title
        </label>
        <Input
          id="title"
          name="title"
          placeholder="Movies to watch, books to read..."
          autoFocus
          required
        />
      </div>

      {groups.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="groupId" className="text-xs font-medium">
            Group
            <span className="ml-1.5 font-normal text-neutral-500 dark:text-neutral-400">
              (optional)
            </span>
          </label>
          <select
            id="groupId"
            name="groupId"
            defaultValue={defaultGroupId ?? ""}
            className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 dark:border-neutral-800 dark:focus-visible:ring-neutral-600"
          >
            <option value="">No group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="body" className="text-xs font-medium">
          Contents
          <span className="ml-1.5 font-normal text-neutral-500 dark:text-neutral-400">
            (markdown)
          </span>
        </label>
        <Textarea
          id="body"
          name="body"
          rows={16}
          className="min-h-[240px] font-mono text-sm leading-relaxed sm:min-h-[400px]"
          placeholder={
            "Markdown supported — try:\n\n- [ ] Todo item\n- Regular item\n\n## Section\nNotes go here..."
          }
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2 sm:justify-end">
        <Button
          variant="outline"
          asChild
          disabled={pending}
          className="flex-1 sm:flex-none"
        >
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 sm:flex-none">
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
