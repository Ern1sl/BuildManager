"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

/**
 * Toggles a task's checked status.
 * If checked, it saves the old status to 'previousStatus' and sets status to 'Done'.
 * If unchecked, it restores the status from 'previousStatus'.
 */
export async function toggleTask(taskId: string, currentChecked: boolean) {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const task = await db.task.findUnique({ where: { id: taskId, userId } });
    if (!task) return { success: false, error: "Task not found" };

    if (!currentChecked) {
      // Transitioning to CHECKED (Done)
      await db.task.update({
        where: { id: taskId, userId },
        data: { 
          checked: true,
          previousStatus: task.status, // Save current for later
          status: "Done"
        },
      });
    } else {
      // Transitioning to UNCHECKED (Restoring)
      await db.task.update({
        where: { id: taskId, userId },
        data: { 
          checked: false,
          status: task.previousStatus || "Today", // Restore or fallback
        },
      });
    }
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[TOGGLE_TASK_ERROR]", error);
    return { success: false, error: "Failed to update task" };
  }
}

export async function addTask(text: string, status: string = "Today") {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db.task.create({
      data: { 
        text, 
        status, 
        checked: false,
        userId
      }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[ADD_TASK_ERROR]", error);
    return { success: false };
  }
}

export async function deleteTask(taskId: string) {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db.task.delete({ where: { id: taskId, userId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_TASK_ERROR]", error);
    return { success: false };
  }
}

