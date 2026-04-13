"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Command, 
  Ghost, 
  Shield, 
  LayoutGrid, 
  Users, 
  Calendar, 
  Settings, 
  ArrowRight,
  Zap
} from "lucide-react";
import { useSafety } from "./SafetyContext";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { toggleGhostMode, lock, isGhostMode } = useSafety();
  const router = useRouter();

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [handleClose]);

  const actions = [
    {
      id: "ghost",
      title: isGhostMode ? "Deactivate Ghost Mode" : "Activate Ghost Mode",
      subtitle: "Privacy blur for sensitive data",
      icon: <Ghost size={18} />,
      onSelect: () => {
        toggleGhostMode();
        handleClose();
      },
      shortcut: "G",
      category: "Security"
    },
    {
      id: "lock",
      title: "Lock Dashboard",
      subtitle: "Secure session and activate Vault",
      icon: <Shield size={18} />,
      onSelect: () => {
        lock();
        handleClose();
      },
      shortcut: "L",
      category: "Security"
    },
    {
      id: "nav-fleet",
      title: "Navigate to Dashboard",
      subtitle: "Return to operations overview",
      icon: <LayoutGrid size={18} />,
      onSelect: () => {
        router.push("/dashboard");
        handleClose();
      },
      category: "Navigation"
    },
    {
      id: "nav-team",
      title: "View Personnel",
      subtitle: "Workforce and role management",
      icon: <Users size={18} />,
      onSelect: () => {
        router.push("/team");
        handleClose();
      },
       category: "Navigation"
    },
    {
      id: "nav-calendar",
      title: "Site Calendar",
      subtitle: "Schedule and reminder protocol",
      icon: <Calendar size={18} />,
      onSelect: () => {
        router.push("/calendar");
        handleClose();
      },
       category: "Navigation"
    },
    {
      id: "nav-settings",
      title: "Command Settings",
      subtitle: "Global configuration and identity",
      icon: <Settings size={18} />,
      onSelect: () => {
        router.push("/settings");
        handleClose();
      },
       category: "Navigation"
    }
  ];

  const filteredActions = actions.filter(action => 
    action.title.toLowerCase().includes(query.toLowerCase()) ||
    action.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />

          {/* Dialog */}
          <div className="fixed inset-x-0 top-[15%] mx-auto max-w-2xl z-[10000] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="window-panel border border-[var(--card-border)] bg-[var(--background)] shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
            >
              {/* Search Header */}
              <div className="flex items-center gap-4 p-6 border-b border-[var(--card-border)] bg-[var(--foreground)]/[0.02]">
                <Command size={20} className="text-[var(--accent-primary)] animate-pulse" />
                <input
                  autoFocus
                  placeholder="Execute tactical command..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-[var(--foreground)] placeholder:text-[var(--text-secondary)] focus:ring-0 text-lg font-medium tracking-tight outline-none"
                />
                <div className="px-2 py-1 rounded-md bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest">
                  ESC to exit
                </div>
              </div>

              {/* Action List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                {filteredActions.length > 0 ? (
                  <div className="space-y-4">
                    {/* Group by Category if needed, for now just a list */}
                    <div className="grid grid-cols-1 gap-1">
                      {filteredActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={action.onSelect}
                          className="flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--accent-primary)]/10 border border-transparent hover:border-[var(--accent-primary)]/20 transition-all group/item text-left w-full"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] text-[var(--text-secondary)] group-hover/item:text-[var(--accent-primary)] group-hover/item:bg-[var(--accent-primary)]/10 transition-colors">
                              {action.icon}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[var(--foreground)] group-hover/item:text-[var(--accent-primary)] transition-colors tracking-tight">
                                 {action.title}
                               </p>
                               <p className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">
                                 {action.subtitle}
                               </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                             {action.shortcut && (
                               <div className="w-6 h-6 rounded bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] flex items-center justify-center text-[10px] font-black text-[var(--text-secondary)]">
                                 {action.shortcut}
                               </div>
                             )}
                             <ArrowRight size={14} className="text-[var(--text-secondary)] opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                     <Zap size={40} className="text-[var(--text-secondary)]" />
                     <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--foreground)]">No Matching Protocol</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-1 uppercase tracking-widest">Check tactical identification</p>
                     </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-[var(--foreground)]/[0.02] border-t border-[var(--card-border)] flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">System Interface Active</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <kbd className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[9px] font-black text-[var(--text-secondary)]">↑↓</kbd>
                       <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">Navigate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <kbd className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[9px] font-black text-[var(--text-secondary)]">↵</kbd>
                       <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">Execute</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
