"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

export type ListInput = {
  title: string;
  body?: string | null;
};

export async function listLists() {
  await requireSession();

  return prisma.list.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function getList(id: string) {
  await requireSession();
  return prisma.list.findUnique({ where: { id } });
}

export async function createList(input: ListInput) {
  await requireSession();

  const title = input.title.trim();
  if (!title) throw new Error("Title is required.");

  const list = await prisma.list.create({
    data: {
      title,
      body: input.body?.trim() ? input.body : null,
    },
  });

  revalidatePath("/lists");
  return list;
}

export async function createListFromForm(formData: FormData) {
  await requireSession();

  const title = String(formData.get("title") ?? "");
  const body = formData.get("body") ? String(formData.get("body")) : null;

  const list = await createList({ title, body });
  redirect(`/lists/${list.id}`);
}

export async function updateList(id: string, input: ListInput) {
  await requireSession();

  const existing = await prisma.list.findUnique({ where: { id } });
  if (!existing) throw new Error("List not found.");

  const title = input.title.trim();
  if (!title) throw new Error("Title is required.");

  const list = await prisma.list.update({
    where: { id },
    data: {
      title,
      body: input.body?.trim() ? input.body : null,
    },
  });

  revalidatePath("/lists");
  revalidatePath(`/lists/${id}`);
  return list;
}

export async function deleteList(id: string) {
  await requireSession();

  const existing = await prisma.list.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.list.delete({ where: { id } });

  revalidatePath("/lists");
}
