"use client";

import Modal from "./Modal";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'}`}>
           <AlertCircle size={32} />
        </div>
        
        <div className="space-y-2 max-w-sm">
           <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
             {message}
           </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-4 font-jakarta">
           <button
             onClick={onClose}
             className="py-3.5 rounded-2xl bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--foreground)] font-bold text-xs uppercase tracking-widest hover:bg-[var(--foreground)]/[0.1] transition-all shadow-lg"
           >
             {cancelText}
           </button>
           <button 
             onClick={() => {
               onConfirm();
               onClose();
             }}
             className={`py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
               isDanger 
                 ? 'bg-red-500 text-white shadow-red-500/20' 
                 : 'bg-[var(--accent-primary)] text-white shadow-[var(--accent-primary)]/20'
             }`}
           >
             {confirmText}
           </button>
        </div>
      </div>
    </Modal>
  );
}
