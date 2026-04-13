import TaskCard from "@/components/TaskCard";

export default function TasksPage() {
  return (
    <div className="pb-10">
      <header className="mb-10 text-white">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Tasks</h1>
        <p className="text-gray-400 font-semibold tracking-tight">Per project, per day — everything that needs doing</p>
      </header>

      <div className="max-w-3xl flex flex-col gap-8">
        <TaskCard 
          title="Today — Apr 7"
          tasks={[
            { id: "1", text: "Morning briefing with foremen", status: "Done", checked: true },
            { id: "2", text: "Review weekend site report", status: "Done", checked: true },
            { id: "3", text: "Confirm concrete order for Thursday delivery", status: "Urgent" },
            { id: "4", text: "Review Veliu electrical subcontractor invoice", status: "Today" },
            { id: "5", text: "Update plumbing phase on Northgate", status: "Northgate" },
          ]}
        />

        <TaskCard 
          title="This week"
          tasks={[
            { id: "w1", text: "Order rebar restock (40 units shortage flagged)", status: "Urgent" },
            { id: "w2", text: "Schedule crane inspection for Veliu site", status: "Veliu" },
            { id: "w3", text: "Prepare weekly payroll for Friday", status: "Today" },
            { id: "w4", text: "Walk Dragash site with municipality inspector", status: "Dragash" },
          ]}
        />
      </div>
    </div>
  );
}
