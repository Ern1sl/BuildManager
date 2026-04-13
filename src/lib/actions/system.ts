"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function superFactoryReset() {
  try {
    const session = await getSession();
    if (!session?.user?.id) return { success: false, error: "Not authorized" };

    // Nuclear Wipe: Wipe all entities except User and Roles
    await db.$transaction([
      db.phase.deleteMany({}),
      db.stock.deleteMany({}),
      db.event.deleteMany({}),
      db.worker.deleteMany({}),
      db.project.deleteMany({}),
      db.task.deleteMany({}),
      db.siteLog.deleteMany({}),
      db.alert.deleteMany({}),
      db.passwordResetToken.deleteMany({}),
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
