import Sidebar from "@/components/Sidebar";
import GlobalAlarmManager from "@/components/GlobalAlarmManager";
import CommandPalette from "@/components/CommandPalette";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fixed inset-0 flex items-stretch bg-[var(--frame-bg)] p-2 sm:p-3 lg:p-4 gap-2 sm:gap-3 lg:gap-4 overflow-hidden">
      {/* Sidebar - fluid width that scales with viewport */}
      <aside 
        className="flex-shrink-0 h-full window-panel overflow-hidden flex flex-col"
        style={{ width: "clamp(220px, 20vw, 320px)" }}
      >
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="flex-1 min-w-0 h-full window-panel overflow-hidden relative flex flex-col">
        <div
          className="flex-1 overflow-y-auto custom-scrollbar pt-4 px-4 sm:px-6 lg:px-10 pb-10 flex flex-col"
          style={{
            overscrollBehavior: "none",
            transform: "translateZ(0)",
          }}
        >
          {children}
        </div>
      </main>
      <div className="fixed inset-0 pointer-events-none z-[999]">
        <GlobalAlarmManager />
      </div>
      <CommandPalette />
    </div>
  );
}
