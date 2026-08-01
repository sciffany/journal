"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createEntryFromForm } from "@/app/actions/entries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import {
  mergeStarsIntoMetadata,
  parseStarsFromMetadataRaw,
} from "@/lib/ratings";

type Props = {
  type: string;
  defaultDate: string;
  placeholder?: string;
};

export function NewEntryForm({ type, defaultDate, placeholder }: Props) {
  const isRatings = type === "ratings";
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadataRaw, setMetadataRaw] = useState("");
  const [stars, setStars] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleStarsChange(next: number | null) {
    setStars(next);
    setMetadataRaw((raw) => mergeStarsIntoMetadata(raw, next));
  }

  function handleMetadataChange(raw: string) {
    setMetadataRaw(raw);
    if (isRatings) setStars(parseStarsFromMetadataRaw(raw));
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    if (isRatings) {
      formData.set("metadata", metadataRaw);
    }
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
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
        <div className="space-y-1.5 sm:w-44">
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
          name="body"
          rows={12}
          className="min-h-[200px] leading-relaxed sm:min-h-[300px]"
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
            name={isRatings ? undefined : "metadata"}
            value={isRatings ? metadataRaw : undefined}
            onChange={
              isRatings
                ? (e) => handleMetadataChange(e.target.value)
                : undefined
            }
            rows={5}
            className="font-mono text-xs"
            placeholder='{"stars": 8}'
          />
        )}
        {isRatings && !showMetadata && (
          <input type="hidden" name="metadata" value={metadataRaw} />
        )}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2 sm:justify-end">
        <Button
          variant="outline"
          asChild
          disabled={pending}
          className="flex-1 sm:flex-none"
        >
          <Link href={`/${type}`}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 sm:flex-none">
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
