"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createWorker(data: { name: string; role: string; monthlyPay: number; projectId?: string }) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const worker = await db.worker.create({
      data: {
        name: data.name,
        role: data.role,
        monthlyPay: data.monthlyPay,
        projectId: data.projectId || null,
        status: "active",
        userId: session.user.id,
      },
      include: { project: true }
    });
    revalidatePath("/team");
    revalidatePath("/dashboard");
    return { success: true, data: worker };
  } catch (error) {
    console.error("Failed to create worker:", error);
    return { success: false, error: "Failed to create worker" };
  }
}

export async function updateWorker(id: string, data: { name?: string; role?: string; monthlyPay?: number; projectId?: string }) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const worker = await db.worker.update({
      where: { id, userId: session.user.id },
      data,
      include: { project: true }
    });
    revalidatePath("/team");
    revalidatePath("/dashboard");
    return { success: true, data: worker };
  } catch (error) {
    console.error("Failed to update worker:", error);
    return { success: false, error: "Failed to update worker" };
  }
}

export async function deleteWorker(id: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.worker.delete({ where: { id, userId: session.user.id } });
    revalidatePath("/team");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete worker:", error);
    return { success: false, error: "Failed to delete worker" };
  }
}

export async function createRole(name: string) {
  try {
    const role = await db.role.create({
      data: { name }
    });
    revalidatePath("/team");
    return { success: true, data: role };
  } catch (error) {
    console.error("Failed to create role:", error);
    return { success: false, error: "Failed to create role" };
  }
}
