"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl">
          <AlertCircle size={48} className="text-red-400" />
        </div>
        
        <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Signal Lost</h2>
          <p className="text-gray-400 max-w-sm mx-auto text-sm">
            We couldn't locate the sector you're looking for. The page may have been relocated or purged from the database.
          </p>
        </div>
        
        <Link 
          href="/dashboard"
          className="mt-8 px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-2xl font-bold tracking-widest uppercase text-xs transition-all active:scale-95"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
