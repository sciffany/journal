"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Entry } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  entry: Entry | null;
};

export function EntryEditor({ entry }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [body, setBody] = useState("");
  const [metadataRaw, setMetadataRaw] = useState("");
  const [stars, setStars] = useState<number | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isRatings = entry?.type === "ratings";

  useEffect(() => {
    if (!entry) return;
    setTitle(entry.title ?? "");
    setDate(formatDateISO(entry.date));
    setBody(entry.body ?? "");
    setMetadataRaw(
      entry.metadata != null
        ? JSON.stringify(entry.metadata, null, 2)
        : "",
    );
    setStars(getStarsFromMetadata(entry.metadata));
    setShowMetadata(Boolean(entry.metadata));
    setError(null);
  }, [entry]);

  function handleStarsChange(next: number | null) {
    setStars(next);
    setMetadataRaw((raw) => mergeStarsIntoMetadata(raw, next));
  }

  function handleMetadataChange(raw: string) {
    setMetadataRaw(raw);
    if (isRatings) setStars(parseStarsFromMetadataRaw(raw));
  }

  function closeDialog() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("e");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleOpenChange(open: boolean) {
    if (!open) closeDialog();
  }

  function handleSave() {
    if (!entry) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateEntry(entry.id, {
          date,
          title,
          body,
          metadata: metadataRaw,
        });
        closeDialog();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  function handleDelete() {
    if (!entry) return;
    const ok = window.confirm("Delete this entry? This can't be undone.");
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteEntry(entry.id);
        closeDialog();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  return (
    <Dialog open={!!entry} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        {entry && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xs font-normal uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {entry.type}
              </DialogTitle>
            </DialogHeader>

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
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="mt-2 flex items-center justify-between gap-2 sm:justify-between">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={pending}
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={pending}>
                  {pending ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
