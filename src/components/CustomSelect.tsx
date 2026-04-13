"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  id: string | number;
  name: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  touched?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select option",
  label,
  error,
  touched
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.id === value || opt.name === value);

  return (
    <div className="space-y-2 flex-1" ref={containerRef}>
      {label && (
        <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest pl-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 text-left transition-all flex items-center justify-between group ${
            isOpen ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/10" : 
            touched && error ? "border-red-500/50" : "border-[var(--input-border)] hover:border-[var(--foreground)]/20"
          }`}
        >
          <span className={`text-sm tracking-tight ${selectedOption ? "text-[var(--foreground)] font-bold" : "text-[var(--text-secondary)]"}`}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-[var(--text-secondary)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-[100] w-full mt-2 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {options.length > 0 ? (
                  options.map((option) => {
                    const isSelected = option.id === value || option.name === value;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          onChange(option.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
                          isSelected 
                            ? "bg-[var(--accent-primary)] text-white" 
                            : "text-[var(--text-secondary)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <span className="tracking-tight">{option.name}</span>
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest text-center">
                    No options available
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {touched && error && (
         <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest pl-1 mt-1 animate-in fade-in slide-in-from-top-1">
            {error}
         </div>
      )}
    </div>
  );
}
