"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteActivity, deleteCategory } from "@/app/actions/activities";
import { Button } from "@/components/ui/button";

export function DeleteActivityButton({
  activityId,
  activityName,
}: {
  activityId: string;
  activityName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const ok = window.confirm(
      `Delete “${activityName}”? All logged days for it will be removed. This can't be undone.`,
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteActivity(activityId);
        router.push("/activities");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={pending}
      >
        {pending ? "Deleting…" : "Delete activity"}
      </Button>
    </div>
  );
}

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  activityCount,
}: {
  categoryId: string;
  categoryName: string;
  activityCount: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const extra =
      activityCount > 0
        ? ` This will also delete ${activityCount} ${activityCount === 1 ? "activity" : "activities"} and their logged days.`
        : "";
    const ok = window.confirm(
      `Delete category “${categoryName}”?${extra} This can't be undone.`,
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteCategory(categoryId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  return (
    <div className="inline-flex items-center gap-2">
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-50 dark:text-neutral-500 dark:hover:text-red-400"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
