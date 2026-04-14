import { db } from "@/lib/db";
import MasterProjectsCard from "@/components/MasterProjectsCard";
import RemindersWidget from "@/components/RemindersWidget";
import { getSession } from "@/lib/auth";

export async function DeferredProjectsSection() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const [projects, totalWorkers] = await Promise.all([
    db.project.findMany({ 
      where: { userId: session.user.id },
      orderBy: { percentage: 'desc' },
      include: { workers: true }
    }),
    db.worker.count({
      where: { userId: session.user.id }
    })
  ]);

  return (
    <MasterProjectsCard 
      projects={projects} 
      totalWorkers={totalWorkers}
    />
  );
}

export async function DeferredCalendarSection() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const calendarEvents = await db.event.findMany({ 
    where: { 
        userId: session.user.id,
        date: { gte: new Date(new Date().setHours(0,0,0,0)) } 
    },
    include: { project: { select: { name: true } } },
    orderBy: { date: 'asc' },
    take: 8
  });

  return <RemindersWidget events={calendarEvents} />;
}

export function SectionSkeleton({ height = "280px" }: { height?: string }) {
  return (
    <div 
      className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--card-border)] rounded-[2.5rem] animate-pulse flex flex-col p-8 justify-between"
      style={{ height }}
    >
       <div className="flex justify-between items-start">
          <div className="space-y-3">
             <div className="h-4 w-32 bg-[var(--foreground)]/10 rounded-full" />
             <div className="h-2 w-48 bg-[var(--foreground)]/5 rounded-full" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/10" />
       </div>
       <div className="space-y-4">
          <div className="h-2 w-full bg-[var(--foreground)]/5 rounded-full" />
          <div className="h-12 w-full bg-[var(--foreground)]/5 rounded-3xl" />
       </div>
    </div>
  );
}
