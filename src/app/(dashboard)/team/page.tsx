import { db } from "@/lib/db";
import TeamClient from "@/components/TeamClient";

export default async function TeamPage() {
  const [workers, roles, projects] = await Promise.all([
    db.worker.findMany({
      include: {
        project: true // Fetch the assigned site information securely
      },
      orderBy: { createdAt: 'desc' }
    }),
    db.role.findMany({
      orderBy: { name: 'asc' }
    }),
    db.project.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="pb-10">
      <TeamClient 
        initialWorkers={workers} 
        roles={roles} 
        projects={projects} 
      />
    </div>
  );
}
