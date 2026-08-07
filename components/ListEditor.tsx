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

type GroupOption = {
  id: string;
  name: string;
};

type ListWithGroup = List & {
  group: { id: string; name: string } | null;
};

type Props = {
  list: ListWithGroup;
  groups: GroupOption[];
};

export function ListEditor({ list, groups }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [body, setBody] = useState(list.body ?? "");
  const [groupId, setGroupId] = useState(list.groupId ?? "");
  const [savedTitle, setSavedTitle] = useState(list.title);
  const [savedBody, setSavedBody] = useState(list.body ?? "");
  const [savedGroupId, setSavedGroupId] = useState(list.groupId ?? "");
  const [savedGroupName, setSavedGroupName] = useState(list.group?.name ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startEditing() {
    setTitle(savedTitle);
    setBody(savedBody);
    setGroupId(savedGroupId);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setTitle(savedTitle);
    setBody(savedBody);
    setGroupId(savedGroupId);
    setError(null);
    setEditing(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const nextGroupId = groupId || null;
        const updated = await updateList(list.id, {
          title,
          body,
          groupId: nextGroupId,
        });
        setSavedTitle(updated.title);
        setSavedBody(updated.body ?? "");
        setSavedGroupId(updated.groupId ?? "");
        setSavedGroupName(
          nextGroupId
            ? (groups.find((g) => g.id === nextGroupId)?.name ?? null)
            : null,
        );
        setTitle(updated.title);
        setBody(updated.body ?? "");
        setGroupId(updated.groupId ?? "");
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
        router.push(
          savedGroupId ? `/groups/${savedGroupId}` : "/lists",
        );
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
          {savedGroupName && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {savedGroupName}
            </p>
          )}
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
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
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
