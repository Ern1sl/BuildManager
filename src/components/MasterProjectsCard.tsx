"use client";

import { useState } from "react";
import { LayoutGrid, Users, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useSafety } from "@/components/SafetyContext";

interface MasterProjectsCardProps {
  projects: any[];
  totalWorkers: number;
}

export default function MasterProjectsCard({
  projects,
  totalWorkers,
}: MasterProjectsCardProps) {
  const { isGhostMode } = useSafety();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = (next: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrentIndex(next);
      setFading(false);
    }, 200);
  };

  const handleNext = () => goTo((currentIndex + 1) % projects.length);
  const handlePrev = () => goTo((currentIndex - 1 + projects.length) % projects.length);

  const currentProject = projects[currentIndex];
  
  const getRoleSummary = (workers: any[]) => {
    if (!workers || workers.length === 0) return "No personnel assigned";

    const roleCounts = workers.reduce((acc: Record<string, number>, w: any) => {
      acc[w.role] = (acc[w.role] || 0) + 1;
      return acc;
    }, {});

    const roles = Object.entries(roleCounts).map(([role, count]) => {
      return `${count} ${role}${count > 1 ? "s" : ""}`;
    });

    if (roles.length > 2) {
      return roles.slice(0, 2).join(", ") + " and more...";
    }
    return roles.join(", ");
  };

  return (
    <div className="window-panel border border-[var(--card-border)] shadow-xl relative overflow-hidden group h-[280px] flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0 px-2">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                 <LayoutGrid size={16} />
              </div>
              <div>
                 <h3 className="text-[var(--foreground)] font-condensed text-[12px] font-black uppercase tracking-[0.2em]">Project Fleet</h3>
                 <p className="text-[9px] font-medium font-jakarta text-[var(--text-secondary)] uppercase tracking-[0.1em] mt-0.5">Global Operations Monitor</p>
              </div>
           </div>
           
           {/* Fleet Stat Badge - Integrated and Smaller */}
           <div className="flex items-center gap-3 border-l border-[var(--card-border)] pl-6">
               <span className="text-xl font-display text-[var(--foreground)] tracking-tighter tabular-nums leading-none">
                  {projects.length}
               </span>
               <span className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-widest">Sites</span>
           </div>
        </div>

        {/* Top-Right Navigation Group */}
        <div className="flex items-center gap-2">
           <button
             onClick={handleNext}
             className="p-1.5 rounded-lg bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--foreground)] transition-all hover:bg-[var(--foreground)]/[0.1] hover:scale-110 active:scale-95 shadow-sm"
           >
             <ChevronRight size={14} />
           </button>
        </div>
      </div>

      <div className="h-px w-full bg-[var(--foreground)]/[0.05] relative shrink-0 mb-4 mx-2">
          <div className="absolute top-0 left-0 w-12 h-full bg-[var(--accent-primary)]" />
      </div>

      {/* Project Command Strip (Single Focus) */}
      <div className="flex-1 flex flex-row items-center gap-6 min-h-0 relative">
        <div 
          className="flex-1 transition-all duration-300 px-2"
          style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateX(20px)' : 'translateX(0)' }}
        >
          {projects.length === 0 || !currentProject ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[var(--card-border)] rounded-3xl">
               <p className="text-[var(--text-secondary)] text-xs italic">No active projects to monitor.</p>
            </div>
          ) : (
            <div className="group/strip flex items-center justify-between p-6 rounded-[2rem] bg-[var(--foreground)]/[0.03] border border-[var(--card-border)] relative overflow-hidden">
              {/* Animated background pulse */}
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-primary)] opacity-40" />
              
              {/* Ident / Name */}
              <div className="w-[25%] flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]" />
                 <div>
                    <h4 className={`text-xl font-heading font-black text-[var(--foreground)] tracking-wide truncate w-40 transition-all duration-500 ${isGhostMode ? 'ghost-blur' : ''}`}>
                      {currentProject.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-special text-[var(--text-secondary)] uppercase tracking-widest transition-all duration-500 ${isGhostMode ? 'ghost-blur-sm' : ''}`}>
                        Site ID: PRJ-{String(currentIndex + 1).padStart(3, '0')}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-[var(--foreground)]/[0.2]" />
                      <span className="text-[10px] font-special text-[var(--accent-primary)] uppercase tracking-widest">
                        In Progress
                      </span>
                    </div>
                 </div>
              </div>

              {/* Progress Bar Center */}
              <div className="flex-1 px-12">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">System Completion</span>
                    <span className="text-2xl font-display text-[var(--accent-primary)] tabular-nums">{currentProject.percentage}%</span>
                 </div>
                 <div className="w-full bg-[var(--foreground)]/[0.05] h-3 rounded-full overflow-hidden border border-[var(--card-border)] relative shadow-inner">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-soft)] transition-all duration-1000 shadow-lg"
                      style={{ width: `${currentProject.percentage}%` }}
                    />
                 </div>
              </div>

              {/* Personnel Data */}
              <div className="w-[25%] flex items-center justify-end gap-6">
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-[var(--foreground)]/50 leading-tight">
                       {getRoleSummary(currentProject.workers)}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                       <Users size={12} className="text-[var(--text-secondary)]" />
                       <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                          {currentProject.workers?.length || 0} Deployed
                       </span>
                    </div>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] flex items-center justify-center shadow-lg">
                    <Briefcase size={20} className="text-[var(--text-secondary)]" />
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress tracking line (Overall) */}
      <div className="absolute bottom-4 left-6 right-6 h-px bg-[var(--foreground)]/[0.05]">
          <div 
            className="h-full bg-[var(--accent-primary)] transition-all duration-500 opacity-50"
            style={{ width: `${((currentIndex + 1) / projects.length) * 100}%` }}
          />
      </div>
    </div>
  );
}
