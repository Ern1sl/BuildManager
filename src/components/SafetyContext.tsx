"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SafetyContextType {
  isLocked: boolean;
  isGhostMode: boolean;
  lock: () => void;
  unlock: (pin: string) => boolean;
  toggleGhostMode: () => void;
  setSafetyPin: (newPin: string) => void;
  hasCustomPin: boolean;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

const MASTER_PIN = "pass";

export function SafetyProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [customPin, setCustomPin] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem("buildmanager_safety_pin");
    const savedLockState = localStorage.getItem("buildmanager_is_locked") === "true";
    const savedGhostState = localStorage.getItem("buildmanager_ghost_mode") === "true";
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedPin) setCustomPin(savedPin);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedLockState) setIsLocked(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedGhostState) setIsGhostMode(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsInitialized(true);
  }, []);

  const lock = () => {
    setIsLocked(true);
    setIsGhostMode(false);
    localStorage.setItem("buildmanager_is_locked", "true");
    localStorage.setItem("buildmanager_ghost_mode", "false");
  };

  const toggleGhostMode = () => {
    setIsGhostMode(prev => {
      const next = !prev;
      localStorage.setItem("buildmanager_ghost_mode", next ? "true" : "false");
      return next;
    });
  };

  const unlock = (enteredPin: string) => {
    const normalizedInput = enteredPin.toLowerCase();
    if (normalizedInput === MASTER_PIN.toLowerCase() || (customPin && normalizedInput === customPin.toLowerCase())) {
      setIsLocked(false);
      localStorage.setItem("buildmanager_is_locked", "false");
      return true;
    }
    return false;
  };

  const setSafetyPin = (newPin: string) => {
    setCustomPin(newPin);
    localStorage.setItem("buildmanager_safety_pin", newPin);
  };

  if (!isInitialized) return null;

  return (
    <SafetyContext.Provider value={{ 
      isLocked, 
      isGhostMode,
      lock, 
      unlock, 
      toggleGhostMode,
      setSafetyPin, 
      hasCustomPin: !!customPin 
    }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (context === undefined) {
    throw new Error("useSafety must be used within a SafetyProvider");
  }
  return context;
}
