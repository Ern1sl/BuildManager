import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DashboardClient from "@/components/DashboardClient";
import { 
  DeferredProjectsSection, 
  DeferredCalendarSection, 
  SectionSkeleton 
} from "@/components/dashboard/DeferredSections";
import { db } from "@/lib/db";
import MasterProjectsCard from "@/components/MasterProjectsCard";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // 1. Critical Base Calculations (Minimal Blocking)
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

  const dashboardData = {
    userName: session.user?.name || session.user?.email?.split("@")[0] || "User",
    userEmail: session.user?.email || "admin@buildmanager.com"
  };

  return (
    <DashboardClient 
      initialData={dashboardData as any} 
      projects={projects}
      projectsSection={
        <Suspense fallback={<SectionSkeleton height="280px" />}>
          <MasterProjectsCard projects={projects} totalWorkers={totalWorkers} />
        </Suspense>
      }
      calendarSection={
        <Suspense fallback={<SectionSkeleton height="280px" />}>
          <DeferredCalendarSection />
        </Suspense>
      }
    />
  );
}
