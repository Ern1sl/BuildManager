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
      <header className="mt-4 lg:mt-6 mb-8 lg:mb-12 flex flex-wrap justify-between items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 suppressHydrationWarning className="text-2xl lg:text-4xl font-jakarta font-medium text-[var(--foreground)] tracking-tighter">
            {timeOfDayGreeting}, {capitalizedName}!
          </h1>
          <p suppressHydrationWarning className="text-[var(--text-secondary)] font-jakarta text-xs lg:text-sm font-medium tracking-tight mt-1 flex items-center gap-4">
            <span>System synchronized. All site operations are online.</span>
          </p>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 pt-1 flex-shrink-0">
          <button 
            onClick={toggleGhostMode}
            className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl border flex items-center justify-center transition-all shadow-lg ${isGhostMode ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-[var(--accent-primary)]/20' : 'bg-[var(--foreground)]/[0.05] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}
            title="Ghost Mode (Privacy Blur)"
          >
             <Ghost size={18} className={isGhostMode ? "animate-pulse" : ""} />
          </button>
          <button 
            onClick={lock}
            className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-orange-500/10"
            title="Privacy Lock"
          >
             <Shield size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-3 pl-3 lg:pl-4 border-l border-[var(--card-border)] py-1 px-2 lg:px-3">
             <div className="text-right">
                <p className="text-[10px] font-sans font-medium text-[var(--foreground)] truncate max-w-[120px] lg:max-w-[160px] opacity-70">
                   {initialData.userEmail}
                </p>
                <p className="text-[8px] font-jakarta font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                   Site Lead
                </p>
             </div>
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-black text-sm shadow-xl overflow-hidden">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 items-stretch">
        <div className="h-[280px]">
            <PureNotepadCard />
        </div>
 
        <div className="h-[280px]">
            <TimeTrackerWidget />
        </div>

        <div className="h-[280px] md:col-span-2 xl:col-span-1">
             <WeatherWidget />
        </div>
      </div>
 
      {/* Row 3: Fleet Master View (Merged Projects & Personnel) */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <div className="min-h-[240px] lg:min-h-[280px]">
           {projectsSection}
        </div>

        <div>
          {calendarSection}
        </div>
      </div>
    </div>
  );
}
