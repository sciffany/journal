"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createEntryFromForm } from "@/app/actions/entries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  type: string;
  defaultDate: string;
  placeholder?: string;
};

export function NewEntryForm({ type, defaultDate, placeholder }: Props) {
  const [showMetadata, setShowMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createEntryFromForm(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create entry.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="type" value={type} />

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-xs font-medium">
            Title
          </label>
          <Input
            id="title"
            name="title"
            placeholder={placeholder ?? "Title..."}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="date" className="text-xs font-medium">
            Date
          </label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultDate}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="body" className="text-xs font-medium">
          Body
        </label>
        <Textarea
          id="body"
          name="body"
          rows={16}
          className="min-h-[300px] leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => setShowMetadata((s) => !s)}
          className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          {showMetadata ? "Hide" : "Show"} metadata (JSON)
        </button>
        {showMetadata && (
          <Textarea
            name="metadata"
            rows={5}
            className="font-mono text-xs"
            placeholder='{"stars": 4}'
          />
        )}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild disabled={pending}>
          <Link href={`/${type}`}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
