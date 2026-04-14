"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getScopedKey } from "@/lib/storage";

type Theme = "dark" | "light" | "system";
type Currency = "USD" | "EUR";

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  avatar: string; // Avatar ID or URL
  setAvatar: (avatar: string) => void;
  userName: string;
  setUserName: (userName: string) => void;
  weatherLocation: { name: string, lat: number, lon: number } | null;
  setWeatherLocation: (loc: { name: string, lat: number, lon: number } | null) => void;
  formatCurrency: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Load from localStorage on mount and when user changes
  useEffect(() => {
    if (!userId) {
      // Optional: Reset to defaults when logged out
      setThemeState("dark");
      setCurrencyState("EUR");
      setAvatarState("👤");
      setUserNameState("Admin");
      setWeatherLocationState(null);
      return;
    }

    const savedTheme = localStorage.getItem(getScopedKey(userId, "bm_theme")) as Theme;
    const savedCurrency = localStorage.getItem(getScopedKey(userId, "bm_currency")) as Currency;
    const savedAvatar = localStorage.getItem(getScopedKey(userId, "bm_avatar"));
    const savedName = localStorage.getItem(getScopedKey(userId, "bm_username"));
    const savedWeather = localStorage.getItem(getScopedKey(userId, "bm_weather_location"));

    if (savedTheme) setThemeState(savedTheme);
    if (savedCurrency) setCurrencyState(savedCurrency);
    if (savedAvatar) setAvatarState(savedAvatar);
    if (savedName) setUserNameState(savedName);
    if (savedWeather) setWeatherLocationState(JSON.parse(savedWeather));
  }, [userId]);

  // Persists and applies theme
  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (userId) localStorage.setItem(getScopedKey(userId, "bm_theme"), t);
    
    const root = window.document.documentElement;
    if (t === "light") {
      root.classList.add("light-mode");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light-mode");
      root.classList.add("dark");
    }
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    if (userId) localStorage.setItem(getScopedKey(userId, "bm_currency"), c);
  };

  const setAvatar = (a: string) => {
    setAvatarState(a);
    if (userId) localStorage.setItem(getScopedKey(userId, "bm_avatar"), a);
  };

  const setUserName = (n: string) => {
    setUserNameState(n);
    if (userId) localStorage.setItem(getScopedKey(userId, "bm_username"), n);
  };

  const setWeatherLocation = (loc: { name: string, lat: number, lon: number } | null) => {
    setWeatherLocationState(loc);
    if (userId) {
      if (loc) {
        localStorage.setItem(getScopedKey(userId, "bm_weather_location"), JSON.stringify(loc));
      } else {
        localStorage.removeItem(getScopedKey(userId, "bm_weather_location"));
      }
    }
  };

  // Immediate theme application on mount/change
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light-mode");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light-mode");
      root.classList.add("dark");
    }
  }, [theme]);

  const formatCurrency = (amount: number) => {
    const symbol = currency === "USD" ? "$" : "€";
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        currency,
        setCurrency,
        avatar,
        setAvatar,
        userName,
        setUserName,
        weatherLocation,
        setWeatherLocation,
        formatCurrency,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
