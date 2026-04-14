import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CalendarClient from "@/components/CalendarClient";

export default async function CalendarPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [projects, manualEvents] = await Promise.all([
    db.project.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        deadline: true,
        color: true,
        phases: {
          select: {
            id: true,
            name: true,
            deadline: true,
          }
        }
      }
    }),
    db.event.findMany({
      where: { userId },
      include: {
        project: { select: { name: true } }
      },
      orderBy: { date: 'asc' }
    })
  ]);

  return (
    <div className="h-full flex flex-col">
       <CalendarClient 
         projects={JSON.parse(JSON.stringify(projects))} 
         manualEvents={JSON.parse(JSON.stringify(manualEvents))}
       />
    </div>
  );
}
