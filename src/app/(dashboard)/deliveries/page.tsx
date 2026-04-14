import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DeliveriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const stocks = await db.stock.findMany({
    where: { userId: session.user.id },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="pb-10">
      <header className="mb-10 text-[var(--foreground)]">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Stock deliveries</h1>
        <p className="text-[var(--text-secondary)] font-semibold tracking-tight">Upcoming arrivals and site assignments</p>
      </header>

      <div className="max-w-4xl">
        <div className="window-panel rounded-[32px] p-10 border border-[var(--card-border)] shadow-2xl">
          <div className="flex flex-col gap-8">
            {stocks.map((deliv) => (
              <div key={deliv.id} className="flex justify-between items-center group">
                <div className="flex gap-10 items-center">
                  <div className="w-24">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-none mb-1">Date</p>
                    <p className="text-[var(--foreground)] text-sm font-bold tracking-tight">{deliv.date}</p>
                  </div>
                  <div className="w-48">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-none mb-1">Item</p>
                    <p className="text-[var(--foreground)] text-sm font-bold tracking-tight">{deliv.item} — {deliv.amount}</p>
                  </div>
                  <div className="w-32">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-none mb-1">Assigned site</p>
                    <p className="text-[var(--foreground)] text-sm font-bold tracking-tight">{deliv.project?.name || "Unassigned"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                    deliv.status === "On track" ? "border-green-500/20 text-green-500 bg-green-500/5" :
                    deliv.status === "Scheduled" ? "border-blue-500/20 text-blue-500 bg-blue-500/5" :
                    "border-orange-500/20 text-orange-500 bg-orange-500/5"
                  }`}>
                    {deliv.status || "Scheduled"}
                  </span>
                  <p className="text-[var(--text-secondary)] text-[10px] font-bold mt-2 uppercase tracking-widest">{deliv.bay || "TBD"}</p>
                </div>
              </div>
            ))}
            {stocks.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-[var(--text-secondary)]">No upcoming deliveries synchronized for your account.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
