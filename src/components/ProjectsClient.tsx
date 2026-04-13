"use client";

import { useState } from "react";
import ProjectCardDetail from "@/components/ProjectCardDetail";
import { Plus } from "lucide-react";
import ProjectFormModal from "@/components/ProjectFormModal";
import ProjectDetailModal from "@/components/ProjectDetailModal";

interface ProjectsClientProps {
  initialProjects: any[];
  availableWorkers: any[];
}

export default function ProjectsClient({ initialProjects, availableWorkers }: ProjectsClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialProjects.map((project) => (
          <div key={project.id} onClick={() => setSelectedProject(project)} className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] h-full flex flex-col">
            <ProjectCardDetail 
              name={project.name}
              client={project.client || "No Client"}
              deadline={project.deadline || "No Deadline"}
              progress={project.percentage}
              workers={project.workers?.length || 0}
              budget={`${project.currency === 'USD' ? '$' : '€'}${project.budget?.toLocaleString() || '0'}`}
              spent="€0" // Placeholder for now
              status={project.status === 'Active' ? 'Active' : 'Active'} 
              color={project.color}
            />
          </div>
        ))}

        {/* New Project Button */}
        <div 
          onClick={() => setIsCreateOpen(true)}
          className="bg-[var(--foreground)]/[0.03] rounded-3xl p-6 border border-dashed border-[var(--card-border)] flex flex-col items-center justify-center gap-4 h-full hover:border-[var(--accent-primary)]/30 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--foreground)] transition-colors">
            <Plus size={24} />
          </div>
          <span className="text-[var(--text-secondary)] font-bold tracking-tight group-hover:text-[var(--foreground)]">New project</span>
        </div>
      </div>

      <ProjectFormModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        availableWorkers={availableWorkers}
      />

      {selectedProject && (
        <ProjectDetailModal 
          isOpen={!!selectedProject} 
          onClose={() => setSelectedProject(null)} 
          project={selectedProject}
          availableWorkers={availableWorkers}
        />
      )}
    </>
  );
}
