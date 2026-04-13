"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSafety } from "./SafetyContext";
import { Shield, Lock, ArrowRight } from "lucide-react";

export default function SafetyScreen() {
  const { isLocked, unlock } = useSafety();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the hidden input whenever the screen is active
    if (isLocked) {
      inputRef.current?.focus();
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlock(input);
    if (success) {
      setInput("");
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= 4) {
      setInput(val);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[999999] bg-[#050505] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex flex-col items-center gap-12 w-full max-w-sm">
        {/* Logo / Icon */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)] shadow-[0_0_40px_rgba(139,92,246,0.1)] relative">
            <Shield size={32} className="animate-pulse" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#050505] border border-[var(--accent-primary)]/20 flex items-center justify-center">
               <Lock size={12} className="text-[var(--accent-primary)]" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-sans font-light text-white tracking-tighter">System Vault</h1>
            <p className="text-zinc-500 text-[10px] font-jakarta font-bold uppercase tracking-[0.3em] mt-2">Privacy Lock Active</p>
          </div>
        </div>

        {/* Input Interface */}
        <form onSubmit={handleSubmit} className="w-full space-y-8">
           <div className="flex justify-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={`w-14 h-18 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center ${
                    error ? 'border-red-500 bg-red-500/10' : 
                    input.length > i ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 
                    'border-zinc-800 bg-zinc-900/40'
                  }`}
                >
                   {input.length > i ? (
                     <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]" />
                   ) : (
                     <div className="w-1 h-1 rounded-full bg-zinc-800" />
                   )}
                </div>
              ))}
           </div>

           <div className="relative group">
              <input 
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                autoFocus
                autoComplete="off"
                className="opacity-0 absolute inset-0 w-full h-full cursor-default"
              />
              <p className="text-center text-zinc-600 text-[9px] font-jakarta font-medium uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                Enter your 4-character code to resume
              </p>
           </div>

           {input.length === 4 && (
             <button 
               type="submit"
               className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform animate-in fade-in slide-in-from-bottom-2"
             >
                Unlock Dashboard <ArrowRight size={14} />
             </button>
           )}
        </form>

        <div className="mt-8">
           <p className="text-[10px] font-jakarta font-bold text-zinc-700 uppercase tracking-widest text-center">
             BuildManager Operational Security Level 4
           </p>
        </div>
      </div>
    </div>
  );
}
