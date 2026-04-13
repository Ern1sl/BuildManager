import Sidebar from "@/components/Sidebar";
import GlobalAlarmManager from "@/components/GlobalAlarmManager";
import CommandPalette from "@/components/CommandPalette";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fixed inset-0 flex items-stretch bg-[var(--frame-bg)] p-4 gap-4 overflow-hidden">
      {/* Sidebar - own compositing layer */}
      <aside className="w-80 flex-shrink-0 h-full window-panel overflow-hidden flex flex-col">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="flex-1 h-full window-panel overflow-hidden relative flex flex-col">
        <div
          className="flex-1 overflow-y-auto custom-scrollbar pt-4 px-10 pb-10 flex flex-col"
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
