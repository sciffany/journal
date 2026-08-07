"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

export type GroupInput = {
  name: string;
};

export async function listGroups() {
  await requireSession();

  return prisma.group.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { lists: true } },
    },
  });
}

export async function getGroup(id: string) {
  await requireSession();

  return prisma.group.findUnique({
    where: { id },
    include: {
      lists: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}

export async function createGroup(input: GroupInput) {
  await requireSession();

  const name = input.name.trim();
  if (!name) throw new Error("Name is required.");

  const group = await prisma.group.create({
    data: { name },
  });

  revalidatePath("/groups");
  return group;
}

export async function createGroupFromForm(formData: FormData) {
  await requireSession();

  const name = String(formData.get("name") ?? "");
  const group = await createGroup({ name });
  redirect(`/groups/${group.id}`);
}

export async function updateGroup(id: string, input: GroupInput) {
  await requireSession();

  const existing = await prisma.group.findUnique({ where: { id } });
  if (!existing) throw new Error("Group not found.");

  const name = input.name.trim();
  if (!name) throw new Error("Name is required.");

  const group = await prisma.group.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/groups");
  revalidatePath(`/groups/${id}`);
  revalidatePath("/lists");
  return group;
}

export async function deleteGroup(id: string) {
  await requireSession();

  const existing = await prisma.group.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.group.delete({ where: { id } });

  revalidatePath("/groups");
  revalidatePath(`/groups/${id}`);
  revalidatePath("/lists");
}
