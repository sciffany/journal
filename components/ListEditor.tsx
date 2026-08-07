"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { List } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { deleteList, updateList } from "@/app/actions/lists";

type Props = {
  list: List;
};

export function ListEditor({ list }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(list.title);
  const [body, setBody] = useState(list.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateList(list.id, { title, body });
        router.push("/lists");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  }

  function handleDelete() {
    const ok = window.confirm("Delete this list? This can't be undone.");
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteList(list.id);
        router.push("/lists");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-xs font-medium">
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="List title..."
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="body" className="text-xs font-medium">
          Contents
        </label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          className="min-h-[240px] font-sans leading-relaxed sm:min-h-[400px]"
          placeholder="Add items, notes, anything..."
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={pending}
          className="w-full sm:w-auto"
        >
          Delete
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
            disabled={pending}
            className="flex-1 sm:flex-none"
          >
            <Link href="/lists">Cancel</Link>
          </Button>
          <Button
            onClick={handleSave}
            disabled={pending}
            className="flex-1 sm:flex-none"
          >
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
