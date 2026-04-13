interface ProjectCardProps {
  name: string;
  client: string;
  deadline: string;
  progress: number;
  workers: number;
  budget: string;
  spent: string;
  status: "Active" | "Behind";
  color: string;
}

export default function ProjectCardDetail({ 
  name, client, deadline, progress, workers, budget, spent, status, color 
}: ProjectCardProps) {
  return (
    <div className="window-panel rounded-3xl p-6 border border-[var(--card-border)] flex flex-col gap-6 shadow-xl h-full transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[var(--foreground)] text-lg font-bold tracking-tight">{name}</h3>
          <p className="text-[var(--text-secondary)] text-xs font-semibold mt-1">
            {client && client !== "No Client" ? `Client: ${client}` : "Self Managed"} ·<br />
            Deadline: {(() => {
              if (!deadline || deadline === "No Deadline") return "Flexible";
              const date = new Date(deadline);
              if (isNaN(date.getTime())) return deadline;
              return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            })()}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
          status === "Active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        }`}>
          {status}
        </span>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">Overall progress</span>
          <span className="text-[var(--foreground)] text-xs font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-[var(--foreground)]/[0.05] h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${color}`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--card-border)]">
        <div>
          <p className="text-[var(--foreground)] text-xs font-bold">{workers} workers</p>
          <p className="text-[var(--text-secondary)] text-[10px] font-semibold mt-0.5">Assigned</p>
        </div>
        <div>
          <p className="text-[var(--foreground)] text-xs font-bold">{spent}</p>
          <p className="text-[var(--text-secondary)] text-[10px] font-semibold mt-0.5">of {budget} budget</p>
        </div>
      </div>
    </div>
  );
}
