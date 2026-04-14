import { db } from "@/lib/db";
import TeamClient from "@/components/TeamClient";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const userId = session.user.id;

  const [workers, roles, projects] = await Promise.all([
    db.worker.findMany({
      where: { userId },
      include: {
        project: true // Fetch the assigned site information securely
      },
      orderBy: { createdAt: 'desc' }
    }),
    db.role.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    }),
    db.project.findMany({
      where: { userId },
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
