"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { List } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/Markdown";
import { deleteList, updateList } from "@/app/actions/lists";

const BODY_PLACEHOLDER =
  "Markdown supported — try:\n\n- [ ] Todo item\n- Regular item\n\n## Section\nNotes go here...";

type Props = {
  list: List;
};

export function ListEditor({ list }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [body, setBody] = useState(list.body ?? "");
  const [savedTitle, setSavedTitle] = useState(list.title);
  const [savedBody, setSavedBody] = useState(list.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startEditing() {
    setTitle(savedTitle);
    setBody(savedBody);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setTitle(savedTitle);
    setBody(savedBody);
    setError(null);
    setEditing(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const updated = await updateList(list.id, { title, body });
        setSavedTitle(updated.title);
        setSavedBody(updated.body ?? "");
        setTitle(updated.title);
        setBody(updated.body ?? "");
        setEditing(false);
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

  if (!editing) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">
            {savedTitle}
          </h1>
        </div>

        <Markdown content={savedBody} />

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
          <Button
            onClick={startEditing}
            disabled={pending}
            className="w-full sm:w-auto"
          >
            Edit
          </Button>
        </div>
      </div>
    );
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
          <span className="ml-1.5 font-normal text-neutral-500 dark:text-neutral-400">
            (markdown)
          </span>
        </label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          className="min-h-[240px] font-mono text-sm leading-relaxed sm:min-h-[400px]"
          placeholder={BODY_PLACEHOLDER}
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
            onClick={cancelEditing}
            disabled={pending}
            className="flex-1 sm:flex-none"
          >
            Cancel
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
