import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProjectsClient from "@/components/ProjectsClient";

export default async function ProjectsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [projects, workers] = await Promise.all([
    db.project.findMany({
      where: { userId: session.user.id },
      include: {
        workers: true,
        phases: { orderBy: { createdAt: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    db.worker.findMany({ 
      where: { userId: session.user.id },
      select: { id: true, name: true, role: true } 
    })
  ]);

  return (
    <div className="pb-10 h-full flex flex-col">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-1">Projects</h1>
          <p className="text-[var(--text-secondary)] font-semibold tracking-tight">{projects.length} active projects</p>
        </div>
      </header>

      <ProjectsClient 
        initialProjects={JSON.parse(JSON.stringify(projects))} 
        availableWorkers={workers} 
      />
    </div>
  );
}
