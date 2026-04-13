"use client";

import { Bell, X, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface AlarmNotificationProps {
  isOpen: boolean;
  onDismiss: () => void;
  alarmTime: string;
  message?: string;
}

export default function AlarmNotification({ isOpen, onDismiss, alarmTime, message }: AlarmNotificationProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-[999] w-full max-w-md p-6 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-auto ${
        isOpen ? "translate-y-4 opacity-100" : "-translate-y-full opacity-0"
      }`}
      onTransitionEnd={handleAnimationEnd}
    >
      <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 flex flex-col gap-6 backdrop-blur-xl ring-1 ring-white/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] animate-pulse">
            <Bell size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white tracking-tighter">Site Check-In!</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest opacity-60">Scheduled for {alarmTime}</p>
          </div>
          <button 
            onClick={onDismiss}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-gray-300 text-sm leading-relaxed">
            {message || "Your daily site inspection is due. Please review the workforce deployment and project progress."}
          </p>
        </div>

        <button 
          onClick={onDismiss}
          className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-[var(--accent-primary)]/20 flex items-center justify-center gap-2 group"
        >
          <CheckCircle2 size={18} className="group-hover:translate-x-0.5 transition-transform" />
          Dismiss Alarm
        </button>
      </div>
    </div>
  );
}
