import TaskCard from "@/components/TaskCard";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tasks = await db.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  const todayTasks = tasks.filter(t => t.status === "Today" || t.status === "Urgent");
  const otherTasks = tasks.filter(t => t.status !== "Today" && t.status !== "Urgent");

  return (
    <div className="pb-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-1">Tasks</h1>
        <p className="text-[var(--text-secondary)] font-semibold tracking-tight">Per project, per day — everything that needs doing</p>
      </header>

      <div className="max-w-3xl flex flex-col gap-8">
        <TaskCard 
          title="Priority & Today"
          tasks={todayTasks as any}
        />

        <TaskCard 
          title="Backlog & Site Specific"
          tasks={otherTasks as any}
        />
        
        {tasks.length === 0 && (
          <div className="p-12 border border-dashed border-[var(--card-border)] rounded-[2rem] text-center">
            <p className="text-[var(--text-secondary)]">No tasks found. Use the dashboard to add some site observations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
