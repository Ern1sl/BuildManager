"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createProject(data: {
  name: string;
  client?: string;
  deadline?: Date;
  budget?: number;
  currency: string;
  color: string;
  workerIds: string[];
  phases: { name: string; importance: string; deadline?: Date }[];
  location?: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const allowedWorkers = data.workerIds.length
      ? await db.worker.findMany({
          where: {
            id: { in: data.workerIds },
            userId: session.user.id,
          },
          select: { id: true },
        })
      : [];

    if (allowedWorkers.length !== data.workerIds.length) {
      return { success: false, error: "Invalid worker selection" };
    }

    const project = await db.project.create({
      data: {
        name: data.name,
        client: data.client,
        deadline: data.deadline,
        budget: data.budget,
        currency: data.currency,
        color: data.color,
        percentage: 0,
        status: "on track",
        location: data.location,
        userId: session.user.id,
        workers: {
          connect: allowedWorkers.map(({ id }) => ({ id })),
        },
        phases: {
          create: data.phases.map((phase) => ({
            name: phase.name,
            importance: phase.importance,
            deadline: phase.deadline,
            checked: false,
          })),
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    return { success: true, project };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function togglePhase(phaseId: string) {
  try {
    const phase = await db.phase.findUnique({
      where: { id: phaseId },
      include: { project: { include: { phases: true } } },
    });

    const session = await getSession();
    if (!session?.user?.id || !phase || !phase.project || phase.project.userId !== session.user.id) {
      throw new Error("Phase or Project not found or unauthorized");
    }

    const newChecked = !phase.checked;
    
    // 1. Update the phase
    await db.phase.update({
      where: { id: phaseId },
      data: { checked: newChecked },
    });

    // 2. Recalculate project percentage
    const allPhases = phase.project.phases;
    const updatedPhases = allPhases.map(p => 
      p.id === phaseId ? { ...p, checked: newChecked } : p
    );
    
    const checkedCount = updatedPhases.filter(p => p.checked).length;
    const totalCount = updatedPhases.length;
    const newPercentage = Math.round((checkedCount / totalCount) * 100);

    await db.project.update({
      where: { id: phase.project.id },
      data: { percentage: newPercentage },
    });

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle phase:", error);
    return { success: false, error: "Failed to toggle phase" };
  }
}

export async function deleteProject(id: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.project.delete({
      where: { 
        id,
        userId: session.user.id 
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

export async function updateProject(id: string, data: {
  name: string;
  client?: string;
  deadline?: Date;
  budget?: number;
  currency: string;
  color: string;
  workerIds: string[];
  phases: { name: string; importance: string; deadline?: Date; checked?: boolean }[];
  location?: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 0. Verify ownership
    const project = await db.project.findUnique({
      where: { id, userId: session.user.id }
    });
    if (!project) throw new Error("Project not found or unauthorized");

    const allowedWorkers = data.workerIds.length
      ? await db.worker.findMany({
          where: {
            id: { in: data.workerIds },
            userId: session.user.id,
          },
          select: { id: true },
        })
      : [];

    if (allowedWorkers.length !== data.workerIds.length) {
      return { success: false, error: "Invalid worker selection" };
    }

    // 1. Calculate new percentage
    const checkedCount = data.phases.filter(p => p.checked).length;
    const totalCount = data.phases.length;
    const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    await db.$transaction([
      // Update basic fields & workers
      db.project.update({
        where: { id, userId: session.user.id },
        data: {
          name: data.name,
          client: data.client,
          deadline: data.deadline,
          budget: data.budget,
          currency: data.currency,
          color: data.color,
          percentage,
          location: data.location,
          workers: {
            set: allowedWorkers.map(({ id: workerId }) => ({ id: workerId })),
          },
        },
      }),
      // Re-create phases (Simplest way to sync dynamic list)
      db.phase.deleteMany({ where: { projectId: id } }),
      db.phase.createMany({
        data: data.phases.map(phase => ({
          name: phase.name,
          importance: phase.importance,
          deadline: phase.deadline,
          checked: phase.checked ?? false,
          projectId: id,
        })),
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Failed to update project:", error);
    return { success: false, error: "Failed to update project" };
  }
}
