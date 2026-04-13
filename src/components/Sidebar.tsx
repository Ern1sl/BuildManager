"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutGrid,
  Calendar,
  Briefcase,
  LogOut,
  Users,
  ShieldAlert
} from "lucide-react";
import Modal from "./Modal";

const navGroups = [
  {
    category: "MAIN",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutGrid },
      { name: "Projects", href: "/projects", icon: Briefcase },
      { name: "Calendar", href: "/calendar", icon: Calendar },
      { name: "Personnel", href: "/team", icon: Users },
    ],
  },
  {
    category: "SYSTEM",
    items: [
      { name: "Settings", href: "/settings", icon: ShieldAlert },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const userEmail = session?.user?.email ?? "Admin";
  const userInitials = userEmail.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Branding - Matching Logo Style */}
      <div className="pt-6 pb-2 px-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
            <div className="bg-white/20 p-1.5 rounded-lg">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-sans font-light text-[var(--foreground)] tracking-tighter">BuildManager.</h1>
        </div>
      </div>

      {/* Navigation - High Density Grouping */}
      <nav className="flex flex-col gap-10 px-6">
        {navGroups.map((group) => (
          <div key={group.category} className="flex flex-col gap-3">
            <h3 className="text-[10px] font-condensed font-black tracking-[0.2em] text-[var(--text-secondary)] uppercase opacity-40 ml-2">
              {group.category}
            </h3>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                        isActive
                          ? "bg-[var(--foreground)]/[0.05] text-[var(--foreground)] shadow-xl ring-1 ring-[var(--foreground)]/[0.1]"
                          : "text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                      }`}
                    >
                      <item.icon
                        size={18}
                        className={
                          isActive
                            ? "text-[var(--accent-primary)]"
                            : "group-hover:text-[var(--foreground)]"
                        }
                      />
                      <span className="text-sm font-heading tracking-wide">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout - Bottom Anchored */}
      <div className="mt-auto px-6 pb-10">
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="flex items-center gap-3 w-full px-6 py-4 rounded-2xl border border-transparent text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-red-500/10 hover:border-red-500/50 transition-all group"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-xs font-condensed font-bold tracking-widest uppercase">Logout</span>
          </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Security Check">
         <div className="text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 mx-auto flex items-center justify-center">
               <ShieldAlert size={24} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Log Out?</h2>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">
               Are you sure you want to end your current session? You will need to sign in again to access the dashboard.
            </p>
         </div>
         <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="w-full py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.1] shadow-lg"
            >
               Stay
            </button>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
               Confirm Exit
            </button>
         </div>
      </Modal>
    </div>
  );
}
