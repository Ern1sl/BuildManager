"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function superFactoryReset() {
  try {
    const session = await getSession();
    if (!session?.user?.id) return { success: false, error: "Not authorized" };

    // User-specific Wipe: Wipe all entities belonging to this user
    await db.$transaction([
      db.stock.deleteMany({ where: { userId: session.user.id } }),
      db.event.deleteMany({ where: { userId: session.user.id } }),
      db.worker.deleteMany({ where: { userId: session.user.id } }),
      db.task.deleteMany({ where: { userId: session.user.id } }),
      db.siteLog.deleteMany({ where: { userId: session.user.id } }),
      db.alert.deleteMany({ where: { userId: session.user.id } }),
      db.project.deleteMany({ where: { userId: session.user.id } }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/team");
    
    return { success: true };
  } catch (error) {
    console.error("Factory Reset Error:", error);
    return { success: false, error: "System failure during wipe" };
  }
}
