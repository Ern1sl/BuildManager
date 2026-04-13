"use client";

import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "@/components/SettingsContext";

import { SafetyProvider } from "@/components/SafetyContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SettingsProvider>
        <SafetyProvider>
          {children}
        </SafetyProvider>
      </SettingsProvider>
    </SessionProvider>
  );
}
