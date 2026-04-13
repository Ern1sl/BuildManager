"use client";

import { useTransition } from "react";
import { toggleTask } from "@/app/(dashboard)/dashboard/actions";

interface Task {
  id: string;
  text: string;
  status?: "Urgent" | "Today" | "Northgate" | "Done" | string;
  checked?: boolean;
}

interface TaskCardProps {
  title: string;
  tasks: Task[];
}

export default function TaskCard({ title, tasks }: TaskCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, currentChecked: boolean) => {
    startTransition(async () => {
      await toggleTask(id, currentChecked);
    });
  };

  return (
    <div className={`window-panel border border-[var(--card-border)] p-8 shadow-xl relative overflow-hidden group ${isPending ? "opacity-70" : "opacity-100"}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)] opacity-[0.02] blur-[60px]" />
      
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[var(--foreground)] text-sm font-bold uppercase tracking-widest opacity-60">{title}</h3>
        <span className="text-[10px] font-bold px-3 py-1 bg-[var(--foreground)]/[0.05] rounded-full text-[var(--text-secondary)] border border-[var(--card-border)]">
          {tasks.length} total
        </span>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="flex items-center gap-4 group/item cursor-pointer" 
            onClick={() => handleToggle(task.id, !!task.checked)}
          >
            <div
              className={`w-5 h-5 rounded-lg border flex-shrink-0 flex items-center justify-center transition-all ${
                task.checked
                  ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white"
                  : "bg-[var(--foreground)]/[0.05] border-[var(--card-border)] group-hover/item:border-[var(--foreground)]/[0.2]"
              }`}
            >
              {task.checked && (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={4}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            
            <span className={`text-sm font-bold tracking-tight flex-1 transition-all ${task.checked ? "text-[var(--text-secondary)] line-through" : "text-[var(--foreground)] opacity-90 group-hover/item:opacity-100"}`}>
              {task.text}
            </span>

            {task.status && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  task.status === "Done" ? "bg-green-500/10 text-green-500" :
                  task.status === "Urgent" ? "bg-orange-500/10 text-orange-500" :
                  "bg-blue-500/10 text-blue-500"
              }`}>
                  {task.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
