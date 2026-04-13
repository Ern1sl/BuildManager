"use client";

import TimeTrackerWidget from "@/components/TimeTrackerWidget";
import PureNotepadCard from "@/components/PureNotepadCard";
import MasterProjectsCard from "@/components/MasterProjectsCard";
import { Shield, Ghost } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "@/components/SettingsContext";
import { useSafety } from "@/components/SafetyContext";
import WeatherWidget from "@/components/WeatherWidget";
import Link from "next/link";

interface DashboardClientProps {
  initialData: {
    userName: string;
    greeting: string;
    userEmail: string;
  };
  projects: any[];
  projectsSection?: React.ReactNode;
  calendarSection?: React.ReactNode;
}

export default function DashboardClient({ initialData, projects, projectsSection, calendarSection }: DashboardClientProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { avatar, userName } = useSettings();

  const capitalizedName =
    userName.charAt(0).toUpperCase() +
    userName.slice(1);

  const hour = time.getHours();
  let timeOfDayGreeting = "Good evening";
  if (hour < 12) timeOfDayGreeting = "Good morning";
  else if (hour < 18) timeOfDayGreeting = "Good afternoon";

  const { lock, isGhostMode, toggleGhostMode } = useSafety();

  return (
    <div className="relative w-full pb-0">
      {/* Header */}
      <header className="mt-6 mb-12 flex justify-between items-start">
        <div>
          <h1 suppressHydrationWarning className="text-4xl font-jakarta font-medium text-[var(--foreground)] tracking-tighter">
            {timeOfDayGreeting}, {capitalizedName}!
          </h1>
          <p suppressHydrationWarning className="text-[var(--text-secondary)] font-jakarta text-sm font-medium tracking-tight mt-1 flex items-center gap-4">
            <span>System synchronized. All site operations are online.</span>
          </p>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <button 
            onClick={toggleGhostMode}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-lg ${isGhostMode ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-[var(--accent-primary)]/20' : 'bg-[var(--foreground)]/[0.05] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}
            title="Ghost Mode (Privacy Blur)"
          >
             <Ghost size={18} className={isGhostMode ? "animate-pulse" : ""} />
          </button>
          <button 
            onClick={lock}
            className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-orange-500/10"
            title="Privacy Lock"
          >
             <Shield size={20} />
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-[var(--card-border)] py-1 px-3">
             <div className="text-right">
                <p className="text-[10px] font-sans font-medium text-[var(--foreground)] truncate w-40 opacity-70">
                   {initialData.userEmail}
                </p>
                <p className="text-[8px] font-jakarta font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                   Site Lead
                </p>
             </div>
              <div className="w-10 h-10 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-black text-sm shadow-xl overflow-hidden">
                {typeof avatar === 'string' && avatar.startsWith('data:') ? (
                  <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  avatar
                )}
              </div>
          </div>
        </div>
      </header>

      {/* Row 2: Tactical Utilities (Notepad | Clock | Weather) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
        <div className="lg:col-span-4 h-[280px]">
            <PureNotepadCard />
        </div>
 
        <div className="lg:col-span-4 h-[280px]">
            <TimeTrackerWidget />
        </div>

        <div className="lg:col-span-4 h-[280px]">
             <WeatherWidget />
        </div>
      </div>
 
      {/* Row 3: Fleet Master View (Merged Projects & Personnel) */}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-12 h-[280px]">
             {projectsSection}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {calendarSection}
        </div>
      </div>
    </div>
  );
}
