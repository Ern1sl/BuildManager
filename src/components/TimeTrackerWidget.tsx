"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Square,
  ChevronUp,
  ChevronDown,
  Clock,
  Bell,
  Timer,
  CheckCircle2,
  MessageSquare,
  LogOut
} from "lucide-react";

interface TimeTrackerWidgetProps {
  onAlarmTrigger?: (time: string, note?: string) => void;
}

export default function TimeTrackerWidget({ onAlarmTrigger }: TimeTrackerWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(1); // Default to Alarm (View 1) per user focus
  const [time, setTime] = useState(new Date());

  // Alarm State (Balanced)
  const [alarmHour, setAlarmHour] = useState("06");
  const [alarmMin, setAlarmMin] = useState("30");
  const [alarmPeriod, setAlarmPeriod] = useState("AM");
  const [alarmNote, setAlarmNote] = useState("");
  const [isAlarmFiring, setIsAlarmFiring] = useState(false);
  const [hasAlarmChanges, setHasAlarmChanges] = useState(false);
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Stopwatch State
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load Saved Stopwatch State
  useEffect(() => {
    const saved = localStorage.getItem("buildmanager_stopwatch");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isRunning && parsed.originTime) {
          const newElapsed = Math.floor((Date.now() - parsed.originTime) / 1000);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setElapsedTime(newElapsed > 0 ? newElapsed : 0);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsRunning(true);
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setElapsedTime(parsed.elapsedTime || 0);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsRunning(false);
        }
      } catch (e) {
        console.error("Failed to parse saved stopwatch config");
      }
    }
  }, []);

  const toggleStopwatch = () => {
    setIsRunning((prevRunning) => {
      const nextRunning = !prevRunning;
      setElapsedTime((prevElapsed) => {
        if (nextRunning) {
           const originTime = Date.now() - prevElapsed * 1000;
           localStorage.setItem("buildmanager_stopwatch", JSON.stringify({ isRunning: true, originTime }));
        } else {
           localStorage.setItem("buildmanager_stopwatch", JSON.stringify({ isRunning: false, elapsedTime: prevElapsed }));
        }
        return prevElapsed;
      });
      return nextRunning;
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, [alarmHour, alarmMin, alarmPeriod]);

  // Load Saved Alarm Configuration on Mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("buildmanager_alarmConfig");
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.hour) setAlarmHour(parsed.hour);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.min) setAlarmMin(parsed.min);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.period) setAlarmPeriod(parsed.period);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.note) setAlarmNote(parsed.note);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.enabled !== undefined) setIsAlarmEnabled(parsed.enabled);
      } catch (e) {
        console.error("Failed to parse saved alarm config");
      }
    }
  }, []);

  const handleConfirmAlarm = () => {
    setHasAlarmChanges(false);
    setIsAlarmEnabled(true);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 2000);
 
    // Persist to local storage
    localStorage.setItem("buildmanager_alarmConfig", JSON.stringify({
      hour: alarmHour,
      min: alarmMin,
      period: alarmPeriod,
      note: alarmNote,
      enabled: true
    }));
  };

  const handleToggleAlarm = () => {
    const nextEnabled = !isAlarmEnabled;
    setIsAlarmEnabled(nextEnabled);
    
    // Update storage
    const config = {
      hour: alarmHour,
      min: alarmMin,
      period: alarmPeriod,
      note: alarmNote,
      enabled: nextEnabled
    };
    localStorage.setItem("buildmanager_alarmConfig", JSON.stringify(config));
  };

  const handleClearAlarm = () => {
    setIsAlarmEnabled(false);
    setHasAlarmChanges(false);
    setShowConfirm(false);
    localStorage.removeItem("buildmanager_alarmConfig");
    // Optional: Reset inputs to default
    setAlarmHour("06");
    setAlarmMin("30");
    setAlarmPeriod("AM");
    setAlarmNote("");
  };


  const views = ["Clock", "Alarm", "Stopwatch"]; // User requested order: Time -> Alarm -> Stopwatch
  const itemHeight = 280;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % views.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + views.length) % views.length);
  };

  const hasPrev = true;
  const hasNext = true;

  const resetStopwatch = () => {
    setIsRunning(false);
    setElapsedTime(0);
    localStorage.setItem("buildmanager_stopwatch", JSON.stringify({ isRunning: false, elapsedTime: 0 }));
  };

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
      main: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      ms: String(centiseconds).padStart(2, "0"),
    };
  };

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="window-panel border border-[var(--card-border)] h-full relative overflow-hidden group/time text-[var(--foreground)] flex items-stretch shadow-xl">
      {/* 1. Main View Zone */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] h-full"
          style={{ transform: `translateY(-${currentIndex * itemHeight}px)` }}
        >
          {/* VIEW 0: CLOCK (Primary) */}
          <div className="h-[280px] flex flex-col justify-between p-5 text-[var(--foreground)]">
            <div className="pt-1 px-1">
              <h3 className="text-[var(--foreground)] font-condensed text-[12px] font-black uppercase tracking-[0.2em] opacity-70 flex items-center gap-2">
                <Clock size={11} className="text-[var(--accent-primary)]" /> Clock
              </h3>
              <div className="mt-2 h-px w-full bg-[var(--foreground)]/[0.1] relative">
                  <div className="absolute top-0 left-0 w-3 h-full bg-[var(--accent-primary)]" />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center flex-1">
              <div suppressHydrationWarning className="text-6xl font-black tracking-tighter tabular-nums leading-none">
                {time.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </div>
              <div suppressHydrationWarning className="text-xs font-jakarta font-medium uppercase text-[var(--text-secondary)] mt-2 tracking-widest text-center">
                {time.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* VIEW 1: ALARM (Control Grid Redesign) */}
          <div className="h-[280px] flex flex-col p-5 text-[var(--foreground)] group/alarm">
            {/* 1. Header Row */}
            <div className="pt-1 px-1 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <h3 className="text-[var(--foreground)] font-condensed text-[12px] font-black uppercase tracking-[0.2em] opacity-70 flex items-center gap-2">
                      <Bell size={12} className={isAlarmEnabled ? "text-[var(--accent-primary)] animate-pulse" : "text-[var(--text-secondary)]"} /> Alarm
                   </h3>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={handleToggleAlarm}
                     className={`w-9 h-5 rounded-full relative transition-all duration-300 ${isAlarmEnabled ? 'bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]/30' : 'bg-[var(--foreground)]/20 border border-[var(--card-border)]'}`}
                   >
                      <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-md transition-all ${isAlarmEnabled ? 'right-0.5' : 'left-0.5'}`} />
                   </button>
                </div>
              </div>
              <div className="mt-2 h-px w-full bg-[var(--foreground)]/[0.1] relative">
                  <div className={`absolute top-0 left-0 h-full bg-[var(--accent-primary)] transition-all duration-500 ${isAlarmEnabled ? 'w-full opacity-100' : 'w-3 opacity-30'}`} />
              </div>
            </div>

            {/* 2. Main Body Grid */}
            <div className={`flex-1 grid grid-cols-2 overflow-hidden py-4 transition-all duration-500 ${!isAlarmEnabled && !hasAlarmChanges ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
              {/* Col 1: Horizontal Time Row */}
              <div className="flex flex-col items-center justify-center gap-2 px-4">
                <div className="flex items-center justify-center gap-1">
                  <input 
                    type="text"
                    value={alarmHour}
                    onChange={(e) => {
                      setAlarmHour(e.target.value.slice(0, 2));
                      setHasAlarmChanges(true);
                    }}
                    onBlur={() => {
                      if (alarmHour.length === 1 && alarmHour !== "0") setAlarmHour(`0${alarmHour}`);
                    }}
                    className="w-16 h-12 text-4xl font-black tracking-tighter tabular-nums bg-transparent text-center focus:outline-none focus:text-[var(--accent-primary)] hover:bg-[var(--foreground)]/[0.05] rounded-2xl transition-all"
                  />
                  <span className="text-3xl font-black opacity-30 animate-pulse">:</span>
                  <input 
                    type="text"
                    value={alarmMin}
                    onChange={(e) => {
                      setAlarmMin(e.target.value.slice(0, 2));
                      setHasAlarmChanges(true);
                    }}
                    onBlur={() => {
                      if (alarmMin.length === 1) setAlarmMin(`0${alarmMin}`);
                    }}
                    className="w-16 h-12 text-4xl font-black tracking-tighter tabular-nums bg-transparent text-center focus:outline-none focus:text-[var(--accent-primary)] hover:bg-[var(--foreground)]/[0.05] rounded-2xl transition-all"
                  />
                </div>
                
                <div 
                  onClick={() => {
                    setAlarmPeriod(prev => prev === "AM" ? "PM" : "AM");
                    setHasAlarmChanges(true);
                  }}
                  className="flex items-center gap-1 p-1 rounded-xl cursor-pointer hover:bg-[var(--foreground)]/[0.03] transition-colors w-full max-w-[120px] justify-between"
                >
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-colors flex-1 text-center ${alarmPeriod === "PM" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "opacity-40"}`}>
                    PM
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-colors flex-1 text-center ${alarmPeriod === "AM" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "opacity-40"}`}>
                    AM
                  </span>
                </div>
              </div>

              {/* Col 2: Memo Area (Symmetrical) */}
              <div className="flex flex-col p-4 relative justify-center bg-transparent">
                 <textarea 
                    placeholder="Alarm Name"
                    spellCheck={false}
                    value={alarmNote}
                    onChange={(e) => {
                      setAlarmNote(e.target.value);
                      setHasAlarmChanges(true);
                    }}
                    className="w-full bg-transparent border-none p-0 text-[13px] font-medium text-[var(--foreground)] focus:ring-0 focus:outline-none placeholder:opacity-60 resize-none h-16 leading-relaxed"
                 />
              </div>
            </div>

            {/* 3. Bottom Action Row */}
            <div className="h-12 border-t border-[var(--card-border)] flex items-center justify-center flex-shrink-0 px-2">
               {hasAlarmChanges ? (
                  <button 
                    onClick={handleConfirmAlarm}
                    className="w-full py-3 rounded-xl bg-[var(--accent-primary)] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[var(--accent-primary)]/25 hover:scale-[1.02] active:scale-[0.98] transition-all animate-in fade-in slide-in-from-bottom-2 border border-white/10"
                  >
                    Confirm Schedule
                  </button>
                ) : showConfirm ? (
                  <div className="flex items-center gap-2 text-[var(--accent-primary)] animate-in fade-in zoom-in-95">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Alarm Scheduled</span>
                  </div>
                ) : isAlarmEnabled ? (
                  <div className="flex items-center gap-2 text-[var(--accent-primary)] animate-pulse">
                     <Bell size={12} />
                     <span className="text-[10px] font-black uppercase tracking-widest">System Armed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <LogOut size={12} className="rotate-90" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Alarm Inactive</span>
                  </div>
                )}
            </div>
          </div>

          {/* VIEW 2: TIME TRACKER (ARC MODE) */}
          <div className="h-[280px] flex flex-col justify-between p-5 text-[var(--foreground)]">
            <div className="pt-1 px-1 flex-shrink-0">
              <div className="flex justify-between items-center relative">
                <h3 className="text-[var(--foreground)] font-condensed text-[12px] font-black uppercase tracking-[0.2em] opacity-70 flex items-center gap-2">
                   Stopwatch
                </h3>
                <div className="flex gap-2">
                    <button 
                      onClick={toggleStopwatch}
                      className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.1] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground)] hover:scale-105 transition-all shadow-lg"
                    >
                      {isRunning ? (
                        <div className="flex gap-0.5">
                            <div className="w-1 h-3 bg-[var(--foreground)] rounded-full" />
                            <div className="w-1 h-3 bg-[var(--foreground)] rounded-full" />
                        </div>
                      ) : (
                        <Play size={14} fill="currentColor" className="ml-1" />
                      )}
                    </button>
                    <button 
                      onClick={resetStopwatch}
                      className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg"
                    >
                      <Square size={12} fill="white" />
                    </button>
                </div>
              </div>
              <div className="mt-2 h-px w-full bg-[var(--foreground)]/[0.1] relative">
                  <div className="absolute top-0 left-0 w-3 h-full bg-[var(--accent-primary)]" />
              </div>
            </div>

            {/* Arc Timer Container (Calibrated) */}
            <div className="flex-1 flex items-center justify-center py-1 overflow-hidden">
              <div className="relative w-[260px] h-[260px] mx-auto flex items-center justify-center group/timer -mt-6">
                <svg className="w-full h-full transform transition-transform" viewBox="0 0 100 50">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.05"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="transition-all"
                  />
                  {/* Progress Path (Orange) */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="125.66"
                    strokeDashoffset={125.66 - (125.66 * ((elapsedTime % 3600) / 3600))}
                    className="transition-all duration-1000 ease-linear shadow-lg"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-16">
                    <span className="text-4xl font-black tracking-tighter tabular-nums text-[var(--foreground)]">
                      {elapsedTime >= 3600 
                        ? `${Math.floor(elapsedTime / 3600)}:${Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0')}:${(elapsedTime % 60).toString().padStart(2, '0')}`
                        : `${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`
                      }
                    </span>
                    <span className="text-[10px] font-jakarta font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-80 mt-1">Elapsed</span>
                </div>
              </div>
            </div>

            <div className="h-4 flex justify-center items-center pb-2 opacity-60 flex-shrink-0">
               <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[var(--foreground)]/30" />
                  <p className="text-[8px] font-jakarta font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                     60 Min Cycle
                  </p>
                  <div className="w-1 h-1 rounded-full bg-[var(--foreground)]/30" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Global Pagination Dots (Top-Nav & Responsive) */}
      <div className="absolute top-[20px] left-0 right-0 flex justify-center items-center gap-2 z-20">
        {views.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)}
            className={`rounded-full transition-all duration-500 pointer-events-auto cursor-pointer ${
              i === currentIndex 
                ? 'bg-[var(--accent-primary)] lg:w-2 lg:h-2 w-1.5 h-1.5 scale-110 shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
                : 'bg-[var(--foreground)] opacity-20 hover:opacity-40 lg:w-1.5 lg:h-1.5 w-1 h-1'
            }`} 
            aria-label={`Switch to ${views[i]}`}
          />
        ))}
      </div>

      {/* 3. Control Rail */}
      <div className="w-8 flex-shrink-0 flex flex-col justify-center items-center gap-2 z-30 opacity-0 group-hover/time:opacity-100 transition-opacity duration-300 -translate-x-3">
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className={`p-1.5 rounded-lg bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--foreground)] transition-all hover:bg-[var(--foreground)]/[0.1] hover:scale-110 active:scale-95`}
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={handleNext}
          className={`p-1.5 rounded-lg bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--foreground)] transition-all hover:bg-[var(--foreground)]/[0.1] hover:scale-110 active:scale-95`}
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
