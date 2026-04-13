export default function DeliveriesPage() {
  const deliveries = [
    { id: "1", date: "Tomorrow", item: "Concrete — 12 m³", site: "Northgate", bay: "Bay 2", status: "On track" },
    { id: "2", date: "Apr 11", item: "Rebar — 200 units", site: "Veliu Block", bay: "Storage A", status: "Scheduled" },
    { id: "3", date: "Apr 15", item: "Window frames — 34 pcs", site: "Northgate", bay: "Bay 1", status: "Awaiting confirm" },
    { id: "4", date: "Apr 18", item: "Lumber — 15 pallets", site: "Dragash", bay: "Main site", status: "Scheduled" },
  ];

  return (
    <div className="pb-10">
      <header className="mb-10 text-white">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Stock deliveries</h1>
        <p className="text-gray-400 font-semibold tracking-tight">Upcoming arrivals and site assignments</p>
      </header>

      <div className="max-w-4xl">
        <div className="bg-[#1a1a1a] rounded-[32px] p-10 border border-white/5 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-8">
            {deliveries.map((deliv) => (
              <div key={deliv.id} className="flex justify-between items-center group">
                <div className="flex gap-10 items-center">
                  <div className="w-24">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Date</p>
                    <p className="text-white text-sm font-bold tracking-tight">{deliv.date}</p>
                  </div>
                  <div className="w-48">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Item</p>
                    <p className="text-white text-sm font-bold tracking-tight">{deliv.item}</p>
                  </div>
                  <div className="w-32">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Assigned site</p>
                    <p className="text-white text-sm font-bold tracking-tight">{deliv.site}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                    deliv.status === "On track" ? "border-green-500/20 text-green-500 bg-green-500/5" :
                    deliv.status === "Scheduled" ? "border-blue-500/20 text-blue-500 bg-blue-500/5" :
                    "border-orange-500/20 text-orange-500 bg-orange-500/5"
                  }`}>
                    {deliv.status}
                  </span>
                  <p className="text-gray-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{deliv.bay}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
