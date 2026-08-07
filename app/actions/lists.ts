"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

export type ListInput = {
  title: string;
  body?: string | null;
  groupId?: string | null;
};

type ListListsOptions = {
  /** Omit for all lists. Pass a group id to filter. Pass null for ungrouped only. */
  groupId?: string | null;
};

function revalidateListPaths(groupId?: string | null) {
  revalidatePath("/lists");
  revalidatePath("/groups");
  if (groupId) {
    revalidatePath(`/groups/${groupId}`);
  }
}

async function resolveGroupId(
  groupId: string | null | undefined,
): Promise<string | null> {
  if (groupId === undefined || groupId === null || groupId === "") {
    return null;
  }
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw new Error("Group not found.");
  return group.id;
}

export async function listLists(options: ListListsOptions = {}) {
  await requireSession();

  const where =
    options.groupId === undefined
      ? undefined
      : { groupId: options.groupId };

  return prisma.list.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      group: { select: { id: true, name: true } },
    },
  });
}

export async function getList(id: string) {
  await requireSession();
  return prisma.list.findUnique({
    where: { id },
    include: {
      group: { select: { id: true, name: true } },
    },
  });
}

export async function createList(input: ListInput) {
  await requireSession();

  const title = input.title.trim();
  if (!title) throw new Error("Title is required.");

  const groupId = await resolveGroupId(input.groupId);

  const list = await prisma.list.create({
    data: {
      title,
      body: input.body?.trim() ? input.body : null,
      groupId,
    },
  });

  revalidateListPaths(groupId);
  return list;
}

export async function createListFromForm(formData: FormData) {
  await requireSession();

  const title = String(formData.get("title") ?? "");
  const body = formData.get("body") ? String(formData.get("body")) : null;
  const groupRaw = formData.get("groupId");
  const groupId =
    groupRaw === null || groupRaw === "" ? null : String(groupRaw);

  const list = await createList({ title, body, groupId });
  redirect(`/lists/${list.id}`);
}

export async function updateList(id: string, input: ListInput) {
  await requireSession();

  const existing = await prisma.list.findUnique({ where: { id } });
  if (!existing) throw new Error("List not found.");

  const title = input.title.trim();
  if (!title) throw new Error("Title is required.");

  const groupId =
    input.groupId === undefined
      ? existing.groupId
      : await resolveGroupId(input.groupId);

  const list = await prisma.list.update({
    where: { id },
    data: {
      title,
      body: input.body?.trim() ? input.body : null,
      groupId,
    },
  });

  revalidatePath(`/lists/${id}`);
  revalidateListPaths(existing.groupId);
  revalidateListPaths(groupId);
  return list;
}

export async function deleteList(id: string) {
  await requireSession();

  const existing = await prisma.list.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.list.delete({ where: { id } });

  revalidateListPaths(existing.groupId);
}
