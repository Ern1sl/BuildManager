"use server";

import { db } from "../db";
import { revalidatePath } from "next/cache";

export async function createEvent(data: {
  title: string;
  description?: string;
  date: Date;
  category: string;
  color?: string;
  projectId?: string;
}) {
  const event = await db.event.create({
    data: {
      ...data,
      color: data.color || "bg-[var(--accent-primary)]"
    }
  });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return event;
}

export async function deleteEvent(id: string) {
  await db.event.delete({ where: { id } });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function updateEvent(id: string, data: any) {
  const event = await db.event.update({
    where: { id },
    data
  });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return event;
}
