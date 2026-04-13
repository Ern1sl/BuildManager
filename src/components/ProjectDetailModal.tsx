"use client";

import { useState } from "react";
import Modal from "./Modal";
import { CheckCircle2, Circle, Clock, Receipt, User, Calendar, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { togglePhase, deleteProject } from "@/lib/actions/projects";
import ProjectFormModal from "./ProjectFormModal";
import { useSettings } from "./SettingsContext";

interface Phase {
  id: string;
  name: string;
  importance: string;
  checked: boolean;
  deadline?: Date;
}

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableWorkers: any[];
  project: {
    id: string;
    name: string;
    client: string;
    budget: number;
    currency: string;
    deadline: string;
    percentage: number;
    phases: Phase[];
    workers: any[];
    color: string;
  };
}

export default function ProjectDetailModal({
  isOpen,
  onClose,
  availableWorkers,
  project,
}: ProjectDetailModalProps) {
  const { formatCurrency } = useSettings();
  const [phases, setPhases] = useState(project.phases);
  const [localProgress, setLocalProgress] = useState(project.percentage);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async (phaseId: string) => {
    const updatedPhases = phases.map((p) =>
      p.id === phaseId ? { ...p, checked: !p.checked } : p
    );
    setPhases(updatedPhases);

    const checkedCount = updatedPhases.filter((p) => p.checked).length;
    const newProgress = Math.round((checkedCount / updatedPhases.length) * 100);
    setLocalProgress(newProgress);

    const result = await togglePhase(phaseId);
    if (!result.success) {
      setPhases(phases);
      setLocalProgress(project.percentage);
      alert("Failed to update phase status");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteProject(project.id);
    if (result.success) {
      onClose();
    } else {
      setIsDeleting(false);
      alert("Failed to delete project");
    }
  };

  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    // User requested dd/mm/yyyy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getImportanceColor = (color: string) => {
    switch (color) {
      case "Red": return "text-red-500 bg-red-500/10";
      case "Orange": return "text-orange-500 bg-orange-500/10";
      default: return "text-gray-400 bg-gray-500/10";
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={project.name}>
        <div className="space-y-10">
          {/* Header Action Bar */}
          <div className="flex justify-end gap-3 -mt-4 mb-2">
             <button 
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-all text-[10px] font-bold uppercase tracking-widest"
             >
                <Edit3 size={14} /> Edit
             </button>
             <button 
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-all text-[10px] font-bold uppercase tracking-widest"
             >
                <Trash2 size={14} /> Delete
             </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--foreground)]/[0.03] p-5 rounded-3xl border border-[var(--card-border)] space-y-3">
               <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <User size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Client</span>
               </div>
               <p className="text-[var(--foreground)] text-sm font-bold">{project.client || "Not Specified"}</p>
            </div>
            <div className="bg-[var(--foreground)]/[0.03] p-5 rounded-3xl border border-[var(--card-border)] space-y-3">
               <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Receipt size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Budget</span>
               </div>
               <p className="text-[var(--foreground)] text-sm font-bold">
                  {formatCurrency(project.budget || 0)}
               </p>
            </div>
            <div className="bg-[var(--foreground)]/[0.03] p-5 rounded-3xl border border-[var(--card-border)] space-y-3">
               <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Deadline</span>
               </div>
               <p className="text-[var(--foreground)] text-sm font-bold">{formatDate(project.deadline)}</p>
            </div>
            <div className="bg-[var(--foreground)]/[0.03] p-5 rounded-3xl border border-[var(--card-border)] space-y-3">
               <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Progress</span>
               </div>
               <div className="flex items-end gap-2">
                  <p className="text-[var(--foreground)] text-2xl font-black tracking-tighter">{localProgress}%</p>
                  <div className="flex-1 h-1.5 bg-[var(--foreground)]/[0.1] rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-[var(--accent-primary)] transition-all duration-500" style={{ width: `${localProgress}%` }} />
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex justify-between items-center px-1">
                <h3 className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">Project Phases</h3>
                <span className="text-[var(--text-secondary)]/60 text-[10px] font-bold">{phases.filter(p => p.checked).length} / {phases.length} Done</span>
             </div>
             <div className="space-y-3">
                {phases.map((phase) => (
                  <button
                    key={phase.id}
                    onClick={() => handleToggle(phase.id)}
                    className={`w-full group flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all text-left ${phase.checked ? "bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20" : "bg-[var(--foreground)]/[0.03] border border-[var(--card-border)] hover:bg-[var(--foreground)]/[0.07]"}`}
                  >
                    <div className={`transition-colors ${phase.checked ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]/40 group-hover:text-[var(--text-secondary)]"}`}>
                      {phase.checked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                         <p className={`text-sm font-bold truncate ${phase.checked ? "text-[var(--foreground)]/50 line-through" : "text-[var(--foreground)]"}`}>{phase.name}</p>
                         <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${getImportanceColor(phase.importance)}`}>{phase.importance}</span>
                      </div>
                      {phase.deadline && (
                         <p className="text-[10px] text-[var(--text-secondary)] font-semibold flex items-center gap-1">
                            <Clock size={10} /> {formatDate(phase.deadline)}
                         </p>
                      )}
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      </Modal>

      {/* Edit Component Layer */}
      <ProjectFormModal 
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); onClose(); }} 
        availableWorkers={availableWorkers}
        initialData={project}
      />

      {/* Delete Confirmation Portal */}
      <Modal 
        isOpen={isDeleteConfirmOpen} 
        onClose={() => setIsDeleteConfirmOpen(false)} 
        title="Confirm Deletion"
      >
        <div className="text-center space-y-6">
           <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
              <AlertTriangle size={40} />
           </div>
           <div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Are you absolutely sure?</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                 You are about to delete <span className="text-[var(--foreground)] font-bold">{project.name}</span>.<br />
                 This will permanently remove all phases and historical data. This action cannot be undone.
              </p>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-4 rounded-3xl bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--foreground)] font-bold text-xs uppercase tracking-widest hover:bg-[var(--foreground)]/[0.1] transition-all"
              >
                 Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-4 rounded-3xl bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
              >
                 {isDeleting ? "Deleting..." : "Yes, Delete Project"}
              </button>
           </div>
        </div>
      </Modal>
    </>
  );
}
