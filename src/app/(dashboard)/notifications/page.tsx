const icons = {
  warning: (
    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-lg">
      !
    </div>
  ),
  delivery: (
    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-lg">
      ↓
    </div>
  ),
  payroll: (
    <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center text-blue-400 font-bold text-lg">
      €
    </div>
  ),
  stock: (
    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-lg flex-shrink-0">
      📦
    </div>
  ),
  success: (
    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-lg">
      ✓
    </div>
  ),
};

const notifications = [
  {
    id: "1",
    type: "warning",
    title: "Overdue",
    desc: "Northgate plumbing phase is 12% behind the pace required to finish by May 30.",
    time: "Today",
  },
  {
    id: "2",
    type: "delivery",
    title: "Tomorrow 08:00",
    desc: "Concrete delivery (12 m³) arriving at Northgate, bay 2. Assign workers in advance.",
    time: "Tomorrow",
  },
  {
    id: "3",
    type: "payroll",
    title: "Friday",
    desc: "Weekly payroll due. Estimated €9,200 for 22 workers across 2 active sites.",
    time: "Apr 11",
  },
  {
    id: "4",
    type: "stock",
    title: "Apr 11",
    desc: "Rebar delivery (200 units) arriving at Veliu Residential. Confirm storage space.",
    time: "Apr 11",
  },
  {
    id: "5",
    type: "success",
    title: "Framing inspection",
    desc: "on Northgate zone B passed this morning. No issues recorded.",
    time: "Today 08:14",
  },
  {
    id: "6",
    type: "success",
    title: "Dragash Road Extension",
    desc: "— site prep phase marked complete by foreman.",
    time: "Yesterday",
  },
];

export default function NotificationsPage() {
  return (
    <div className="pb-10">
      <header className="mb-10 text-white">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Notifications
        </h1>
        <p className="text-gray-400 font-semibold tracking-tight">
          All alerts, reminders, and delivery warnings
        </p>
      </header>

      <div className="max-w-3xl">
        <div className="bg-[#1a1a1a] rounded-[32px] p-8 border border-white/5 shadow-2xl shadow-black/20 flex flex-col divide-y divide-white/5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex gap-6 py-6 first:pt-0 last:pb-0 group cursor-pointer transition-all"
            >
              <div className="flex-shrink-0 transition-transform group-hover:scale-110">
                {icons[notif.type as keyof typeof icons]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-4">
                  <h3 className="text-white text-sm font-bold leading-tight">
                    <span className="text-gray-200">{notif.title}:</span>{" "}
                    {notif.desc}
                  </h3>
                  <span className="text-gray-500 text-[11px] font-bold whitespace-nowrap pt-0.5">
                    {notif.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
