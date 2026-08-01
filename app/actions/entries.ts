"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { isValidISODate } from "@/lib/utils";

function parseDate(input: string): Date {
  if (!isValidISODate(input)) {
    throw new Error(`Invalid date: ${input}. Expected YYYY-MM-DD.`);
  }
  return new Date(`${input}T00:00:00.000Z`);
}

function parseMetadata(raw: string | null | undefined): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (raw == null) return undefined;
  const trimmed = raw.trim();
  if (trimmed === "") return null as unknown as typeof Prisma.JsonNull;
  try {
    return JSON.parse(trimmed) as Prisma.InputJsonValue;
  } catch {
    throw new Error("Metadata must be valid JSON.");
  }
}

export type EntryInput = {
  type: string;
  date: string;
  title?: string | null;
  body?: string | null;
  metadata?: string | null;
};

export async function createEntry(input: EntryInput) {
  await requireSession();

  const entry = await prisma.entry.create({
    data: {
      type: input.type,
      date: parseDate(input.date),
      title: input.title?.trim() || null,
      body: input.body ?? null,
      metadata: parseMetadata(input.metadata) as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/");
  revalidatePath(`/${input.type}`);
  revalidatePath(`/day/${input.date}`);

  return entry;
}

export async function createEntryFromForm(formData: FormData) {
  await requireSession();

  const type = String(formData.get("type") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const title = formData.get("title") ? String(formData.get("title")) : null;
  const body = formData.get("body") ? String(formData.get("body")) : null;
  const metadata = formData.get("metadata")
    ? String(formData.get("metadata"))
    : null;

  if (!type) throw new Error("Type is required.");
  if (!date) throw new Error("Date is required.");

  await createEntry({ type, date, title, body, metadata });

  redirect(`/${type}`);
}

export async function updateEntry(
  id: string,
  input: Omit<EntryInput, "type"> & { type?: string },
) {
  await requireSession();

  const existing = await prisma.entry.findUnique({ where: { id } });
  if (!existing) throw new Error("Entry not found.");

  const entry = await prisma.entry.update({
    where: { id },
    data: {
      type: input.type ?? existing.type,
      date: parseDate(input.date),
      title: input.title?.trim() || null,
      body: input.body ?? null,
      metadata: parseMetadata(input.metadata) as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/");
  revalidatePath(`/${entry.type}`);
  revalidatePath(`/day/${input.date}`);
  if (existing.type !== entry.type) revalidatePath(`/${existing.type}`);

  return entry;
}

export async function deleteEntry(id: string) {
  await requireSession();

  const existing = await prisma.entry.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.entry.delete({ where: { id } });

  const dateISO = existing.date.toISOString().slice(0, 10);
  revalidatePath("/");
  revalidatePath(`/${existing.type}`);
  revalidatePath(`/day/${dateISO}`);
}

export async function listByType(
  type: string,
  options: { limit?: number; cursor?: string } = {},
) {
  await requireSession();

  const limit = options.limit ?? 100;
  return prisma.entry.findMany({
    where: { type },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
    ...(options.cursor
      ? { skip: 1, cursor: { id: options.cursor } }
      : {}),
  });
}

export async function listByDate(dateISO: string) {
  await requireSession();

  const start = parseDate(dateISO);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return prisma.entry.findMany({
    where: {
      date: { gte: start, lt: end },
    },
    orderBy: [{ type: "asc" }, { createdAt: "asc" }],
  });
}

export async function getEntry(id: string) {
  await requireSession();
  return prisma.entry.findUnique({ where: { id } });
}

export async function countByType() {
  await requireSession();
  const rows = await prisma.entry.groupBy({
    by: ["type"],
    _count: { _all: true },
  });
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.type, row._count._all);
  }
  return map;
}
