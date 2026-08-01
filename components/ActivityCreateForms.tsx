"use client";

import { useState, useTransition } from "react";
import {
  createActivityFromForm,
  createCategoryFromForm,
} from "@/app/actions/activities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CategoryOption = {
  id: string;
  name: string;
};

export function CreateCategoryButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createCategoryFromForm(formData);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create category.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          New category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>
            Group activities (e.g. Creative, Social, Unproductive).
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="category-name" className="text-xs font-medium">
              Name
            </label>
            <Input
              id="category-name"
              name="name"
              placeholder="Creative"
              required
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateActivityButton({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const disabled = categories.length === 0;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createActivityFromForm(formData);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create activity.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" disabled={disabled}>
          New activity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New activity</DialogTitle>
          <DialogDescription>
            Add something you want to track day by day.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="activity-name" className="text-xs font-medium">
              Name
            </label>
            <Input
              id="activity-name"
              name="name"
              placeholder="Vibe code"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="activity-category" className="text-xs font-medium">
              Category
            </label>
            <select
              id="activity-category"
              name="categoryId"
              required
              defaultValue={categories[0]?.id}
              className="flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 dark:border-neutral-800"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
