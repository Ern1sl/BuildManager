"use client";

import { useState } from "react";

import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";

interface RemindersWidgetProps {
  events?: any[];
}

export default function RemindersWidget({ events = [] }: RemindersWidgetProps) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(events.length / itemsPerPage);
  
  const displayedEvents = events.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const handleNext = () => {
    if (page < totalPages - 1) setPage(p => p + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(p => p - 1);
  };

  return (
    <div className="window-panel border border-[var(--card-border)] p-10 h-full flex flex-col shadow-xl group">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h3 className="text-[var(--foreground)] font-condensed text-[12px] font-black uppercase tracking-[0.2em] opacity-60">
             Upcoming
           </h3>
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2 items-center">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] mr-2">
                 {page + 1} / {totalPages}
              </span>
              <button 
                onClick={handlePrev}
                disabled={page === 0}
                className="p-2 rounded-xl hover:bg-[var(--foreground)]/[0.05] text-[var(--text-secondary)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                  <ChevronLeft size={18} />
              </button>
              <button 
                onClick={handleNext}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-xl hover:bg-[var(--foreground)]/[0.05] text-[var(--text-secondary)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                  <ChevronRight size={18} />
              </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[160px]">
        {displayedEvents.map((event, idx) => {
          const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
          return (
            <div key={idx} className="bg-[var(--foreground)]/[0.03] rounded-3xl p-6 flex justify-between items-center border border-[var(--card-border)] hover:border-[var(--accent-primary)]/30 transition-all group/item">
              <div className="space-y-3">
                 <h4 className="text-[var(--foreground)] text-lg font-bold tracking-tight line-clamp-1">{event.title}</h4>
                 <div className="flex items-center gap-3">
                    <span className={`${event.color || 'bg-[var(--accent-primary)]'} text-[9px] font-black px-2 py-0.5 rounded-md uppercase text-white tracking-widest shadow-sm shadow-purple-500/10`}>
                       {event.category || 'General'}
                    </span>
                    <span className="text-[var(--text-secondary)] text-xs font-jakarta font-semibold tabular-nums flex items-center gap-1 group-hover/item:text-[var(--foreground)] transition-colors">
                      <Clock size={12} className="text-[var(--accent-primary)]" /> {format(eventDate, 'HH:mm')} • {format(eventDate, 'MMM d')}
                    </span>
                 </div>
                 {event.project?.name && (
                   <p className="text-[10px] font-jakarta font-medium text-[var(--text-secondary)] flex items-center gap-1">
                     <MapPin size={10} /> {event.project.name}
                   </p>
                 )}
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-3 bg-[var(--foreground)]/[0.02] rounded-3xl border border-dashed border-[var(--card-border)]">
             <div className="w-12 h-12 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--text-secondary)]">
                <Clock size={20} />
             </div>
             <div>
                <p className="text-[var(--foreground)] text-sm font-jakarta font-bold opacity-80">No upcoming events</p>
                <p className="text-[10px] font-jakarta font-black text-[var(--accent-primary)] uppercase tracking-widest mt-1 opacity-70">Check the calendar to add site tasks</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
