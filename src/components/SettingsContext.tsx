"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [theme, setThemeState] = useState<Theme>("dark");
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const [avatar, setAvatarState] = useState<string>("👤"); // Default silhouette emoji
  const [userName, setUserNameState] = useState<string>("Admin");
  const [weatherLocation, setWeatherLocationState] = useState<{ name: string, lat: number, lon: number } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("bm_theme") as Theme;
    const savedCurrency = localStorage.getItem("bm_currency") as Currency;
    const savedAvatar = localStorage.getItem("bm_avatar");
    const savedName = localStorage.getItem("bm_username");
    const savedWeather = localStorage.getItem("bm_weather_location");

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedTheme) setThemeState(savedTheme);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedCurrency) setCurrencyState(savedCurrency);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedAvatar) setAvatarState(savedAvatar);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedName) setUserNameState(savedName);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedWeather) setWeatherLocationState(JSON.parse(savedWeather));
  }, []);

  // Persists and applies theme
  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("bm_theme", t);
    
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
    localStorage.setItem("bm_currency", c);
  };

  const setAvatar = (a: string) => {
    setAvatarState(a);
    localStorage.setItem("bm_avatar", a);
  };

  const setUserName = (n: string) => {
    setUserNameState(n);
    localStorage.setItem("bm_username", n);
  };

  const setWeatherLocation = (loc: { name: string, lat: number, lon: number } | null) => {
    setWeatherLocationState(loc);
    if (loc) {
      localStorage.setItem("bm_weather_location", JSON.stringify(loc));
    } else {
      localStorage.removeItem("bm_weather_location");
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
