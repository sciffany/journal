"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Entry } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { deleteEntry, updateEntry } from "@/app/actions/entries";
import {
  getStarsFromMetadata,
  mergeStarsIntoMetadata,
  parseStarsFromMetadataRaw,
} from "@/lib/ratings";
import { formatDateISO } from "@/lib/utils";

type Props = {
  entry: Entry;
};

export function EntryEditor({ entry }: Props) {
  const router = useRouter();
  const isRatings = entry.type === "ratings";

  const [title, setTitle] = useState(entry.title ?? "");
  const [date, setDate] = useState(formatDateISO(entry.date));
  const [body, setBody] = useState(entry.body ?? "");
  const [metadataRaw, setMetadataRaw] = useState(
    entry.metadata != null ? JSON.stringify(entry.metadata, null, 2) : "",
  );
  const [stars, setStars] = useState<number | null>(
    getStarsFromMetadata(entry.metadata),
  );
  const [showMetadata, setShowMetadata] = useState(Boolean(entry.metadata));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const listHref = `/${entry.type}`;

  function handleStarsChange(next: number | null) {
    setStars(next);
    setMetadataRaw((raw) => mergeStarsIntoMetadata(raw, next));
  }

  function handleMetadataChange(raw: string) {
    setMetadataRaw(raw);
    if (isRatings) setStars(parseStarsFromMetadataRaw(raw));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateEntry(entry.id, {
          date,
          title,
          body,
          metadata: metadataRaw,
        });
        router.push(listHref);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  function handleDelete() {
    const ok = window.confirm("Delete this entry? This can't be undone.");
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteEntry(entry.id);
        router.push(listHref);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-xs font-medium">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="(no title)"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="date" className="text-xs font-medium">
            Date
          </label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {isRatings && (
        <StarRating
          value={stars}
          onChange={handleStarsChange}
          disabled={pending}
        />
      )}

      <div className="space-y-1.5">
        <label htmlFor="body" className="text-xs font-medium">
          Body
        </label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          className="min-h-[300px] font-sans leading-relaxed"
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
            value={metadataRaw}
            onChange={(e) => handleMetadataChange(e.target.value)}
            rows={5}
            className="font-mono text-xs"
            placeholder='{"stars": 8}'
          />
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={pending}
        >
          Delete
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild disabled={pending}>
            <Link href={listHref}>Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
