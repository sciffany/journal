"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { formatDateISO, isValidISODate } from "@/lib/utils";

function parseDate(input: string): Date {
  if (!isValidISODate(input)) {
    throw new Error(`Invalid date: ${input}. Expected YYYY-MM-DD.`);
  }
  return new Date(`${input}T00:00:00.000Z`);
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "item";
}

async function uniqueCategorySlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 2;
  while (await prisma.activityCategory.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

async function uniqueActivitySlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 2;
  while (await prisma.activity.findUnique({ where: { slug } })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function listCategoriesWithActivities() {
  await requireSession();

  return prisma.activityCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      activities: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          _count: { select: { entries: true } },
        },
      },
    },
  });
}

export async function createCategory(input: { name: string }) {
  await requireSession();

  const name = input.name.trim();
  if (!name) throw new Error("Category name is required.");

  const slug = await uniqueCategorySlug(name);
  const maxOrder = await prisma.activityCategory.aggregate({
    _max: { sortOrder: true },
  });

  const category = await prisma.activityCategory.create({
    data: {
      name,
      slug,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/activities");
  revalidatePath("/day", "layout");

  return category;
}

export async function createCategoryFromForm(formData: FormData) {
  await requireSession();

  const name = String(formData.get("name") ?? "");
  await createCategory({ name });
}

export async function createActivity(input: {
  name: string;
  categoryId: string;
}) {
  await requireSession();

  const name = input.name.trim();
  if (!name) throw new Error("Activity name is required.");
  if (!input.categoryId) throw new Error("Category is required.");

  const category = await prisma.activityCategory.findUnique({
    where: { id: input.categoryId },
  });
  if (!category) throw new Error("Category not found.");

  const slug = await uniqueActivitySlug(name);
  const maxOrder = await prisma.activity.aggregate({
    where: { categoryId: input.categoryId },
    _max: { sortOrder: true },
  });

  const activity = await prisma.activity.create({
    data: {
      name,
      slug,
      categoryId: input.categoryId,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/activities");
  revalidatePath(`/activities/${activity.slug}`);
  revalidatePath("/day", "layout");

  return activity;
}

export async function createActivityFromForm(formData: FormData) {
  await requireSession();

  const name = String(formData.get("name") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  await createActivity({ name, categoryId });
}

export async function deleteActivity(id: string) {
  await requireSession();

  const existing = await prisma.activity.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.activity.delete({ where: { id } });

  revalidatePath("/activities");
  revalidatePath(`/activities/${existing.slug}`);
  revalidatePath("/day", "layout");
}

export async function deleteCategory(id: string) {
  await requireSession();

  const existing = await prisma.activityCategory.findUnique({
    where: { id },
    include: { activities: { select: { slug: true } } },
  });
  if (!existing) return;

  await prisma.activityCategory.delete({ where: { id } });

  revalidatePath("/activities");
  for (const activity of existing.activities) {
    revalidatePath(`/activities/${activity.slug}`);
  }
  revalidatePath("/day", "layout");
}

export async function listEntriesForDate(dateISO: string) {
  await requireSession();

  const start = parseDate(dateISO);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return prisma.activityEntry.findMany({
    where: {
      date: { gte: start, lt: end },
    },
    include: {
      activity: {
        include: { category: true },
      },
    },
    orderBy: [{ activity: { category: { sortOrder: "asc" } } }, { createdAt: "asc" }],
  });
}

export async function toggleActivityEntry(
  dateISO: string,
  activityId: string,
) {
  await requireSession();

  const date = parseDate(dateISO);
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });
  if (!activity) throw new Error("Activity not found.");

  const existing = await prisma.activityEntry.findUnique({
    where: {
      date_activityId: { date, activityId },
    },
  });

  if (existing) {
    await prisma.activityEntry.delete({ where: { id: existing.id } });
  } else {
    await prisma.activityEntry.create({
      data: { date, activityId },
    });
  }

  revalidatePath(`/day/${dateISO}`);
  revalidatePath("/activities");
  revalidatePath(`/activities/${activity.slug}`);
}

export async function getActivityBySlug(slug: string) {
  await requireSession();

  return prisma.activity.findUnique({
    where: { slug },
    include: {
      category: true,
      _count: { select: { entries: true } },
    },
  });
}

export async function listEntryDatesForActivity(
  activityId: string,
  fromISO: string,
  toISO: string,
) {
  await requireSession();

  const from = parseDate(fromISO);
  const to = parseDate(toISO);
  const end = new Date(to);
  end.setUTCDate(end.getUTCDate() + 1);

  const entries = await prisma.activityEntry.findMany({
    where: {
      activityId,
      date: { gte: from, lt: end },
    },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  return entries.map((e) => formatDateISO(e.date));
}
