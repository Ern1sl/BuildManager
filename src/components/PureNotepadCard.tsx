"use client";

import { useEffect, useState } from "react";
import { NotebookPen, Trash2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

export default function PureNotepadCard() {
  const [notes, setNotes] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Load notes on mount
  useEffect(() => {
    const saved = localStorage.getItem("buildmanager_global_notes");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setNotes(saved);
  }, []);

  // Autosave notes
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setNotes(nextVal);
    localStorage.setItem("buildmanager_global_notes", nextVal);
  };

  const handleClearConfirm = () => {
    setNotes("");
    localStorage.removeItem("buildmanager_global_notes");
  };

  return (
    <div className="window-panel border border-[var(--card-border)] shadow-xl relative overflow-hidden group h-[280px] flex flex-col p-6">
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleClearConfirm}
        title="Clear Field Logs"
        message="Are you sure you want to permanently delete all site observations? This action cannot be undone."
        confirmText="Wipe Logs"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1 shrink-0">
        <div className="flex items-center gap-2">
           <h3 className="text-[var(--foreground)] font-condensed text-[12px] font-black uppercase tracking-[0.2em] opacity-70 flex items-center gap-2">
              <NotebookPen size={12} className="text-[var(--accent-primary)]" /> Field Logs
           </h3>
        </div>
        <button 
          onClick={() => setIsConfirmOpen(true)}
          className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="mt-2 h-px w-full bg-[var(--foreground)]/[0.1] relative shrink-0 mb-4 px-1">
          <div className="absolute top-0 left-0 w-8 h-full bg-[var(--accent-primary)]" />
      </div>

      {/* Input Area */}
      <textarea
        value={notes}
        onChange={handleNoteChange}
        placeholder="Standard site observations and field notes..."
        spellCheck={false}
        className="flex-1 bg-transparent border-none p-0 text-[14px] font-medium text-[var(--foreground)] opacity-90 focus:opacity-100 focus:ring-0 focus:outline-none placeholder:text-[var(--text-secondary)]/50 resize-none font-mono leading-relaxed selection:bg-[var(--accent-primary)]/30 custom-scrollbar overflow-y-auto"
        style={{ fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace" }}
      />

      {/* Sync Status Footer */}
      <div className="mt-3 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-1.5 opacity-40">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] font-jakarta font-black uppercase tracking-[0.15em] text-[var(--foreground)]">Cloud Sync Active</span>
         </div>
         <span className="text-[8px] font-jakarta font-bold text-[var(--text-secondary)] uppercase tracking-widest">
            {notes.length} Characters
         </span>
      </div>

      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-[var(--accent-primary)] opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-700" />
    </div>
  );
}
