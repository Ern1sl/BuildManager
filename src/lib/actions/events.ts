"use server";

import { db } from "../db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createEvent(data: {
  title: string;
  description?: string;
  date: Date;
  category: string;
  color?: string;
  projectId?: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify project ownership if provided
  if (data.projectId) {
    const project = await db.project.findUnique({
      where: { id: data.projectId, userId: session.user.id }
    });
    if (!project) throw new Error("Invalid project selection");
  }

  const event = await db.event.create({
    data: {
      ...data,
      color: data.color || "bg-[var(--accent-primary)]",
      userId: session.user.id,
    }
  });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return event;
}

export async function deleteEvent(id: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.event.delete({ where: { id, userId: session.user.id } });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function updateEvent(id: string, data: any) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify project ownership if updating projectId
  if (data.projectId) {
    const project = await db.project.findUnique({
      where: { id: data.projectId, userId: session.user.id }
    });
    if (!project) throw new Error("Invalid project selection");
  }

  const event = await db.event.update({
    where: { id, userId: session.user.id },
    data
  });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return event;
}
