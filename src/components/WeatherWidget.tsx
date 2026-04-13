"use client";

import { 
  Cloud, 
  Wind, 
  AlertTriangle, 
  Search, 
  MapPin, 
  RefreshCcw, 
  X,
  Loader2,
  Settings2
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useSettings } from "@/components/SettingsContext";
import { searchCities, getWeatherByCoords } from "@/lib/actions/weather";

interface WeatherData {
  temp: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  hazardLevel: 'Low' | 'Moderate' | 'High';
  hazardSource: string;
}

interface CitySuggestion {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

export default function WeatherWidget() {
  const { weatherLocation, setWeatherLocation } = useSettings();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search States
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const weather = await getWeatherByCoords(lat, lon);
      if (weather) {
        setData(weather);
      } else {
        setError("Could not fetch weather data");
      }
    } catch (err) {
      setError("Communication error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (weatherLocation) {
      fetchWeather(weatherLocation.lat, weatherLocation.lon);
    }
  }, [weatherLocation, fetchWeather]);

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsFetchingSuggestions(true);
        const results = await searchCities(searchQuery);
        setSuggestions(results);
        setIsFetchingSuggestions(false);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectCity = (city: CitySuggestion) => {
    setWeatherLocation({
      name: `${city.name}${city.state ? `, ${city.state}` : ""}, ${city.country}`,
      lat: city.lat,
      lon: city.lon
    });
    setIsSearching(false);
    setSearchQuery("");
  };

  // 1. Initial Empty / Setup State
  if (!weatherLocation || isSearching) {
    return (
      <div className="window-panel border border-[var(--card-border)] p-6 h-full flex flex-col bg-[var(--background)] relative shadow-xl z-20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h3 className="text-[var(--foreground)] font-condensed text-[12px] font-black uppercase tracking-[0.2em] opacity-60">
              Environment
            </h3>
            <p className="text-[10px] font-jakarta font-bold text-[var(--accent-primary)] uppercase tracking-widest mt-1">
              Location Setup Required
            </p>
          </div>
          {isSearching && weatherLocation && (
             <button 
              onClick={() => setIsSearching(false)}
              className="p-2 hover:bg-[var(--foreground)]/5 rounded-xl transition-all text-[var(--text-secondary)]"
             >
                <X size={18} />
             </button>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center relative z-10 space-y-4">
          <div className="text-center space-y-2 mb-2">
             <div className="w-12 h-12 bg-[var(--accent-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-[var(--accent-primary)]" size={24} />
             </div>
             <h4 className="text-[var(--foreground)] font-bold text-sm">Monitor Site Environment</h4>
             <p className="text-[10px] text-[var(--text-secondary)] font-medium">Search for a city to activate site sensors</p>
          </div>

          <div className="relative z-50">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              {isFetchingSuggestions ? (
                <Loader2 size={16} className="animate-spin text-[var(--accent-primary)]" />
              ) : (
                <Search size={16} className="text-[var(--text-secondary)]" />
              )}
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Start typing city name..."
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl py-3.5 pl-12 pr-4 text-xs font-jakarta font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)]/50 transition-all"
              autoFocus
            />

            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)]/95 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl py-2 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 min-w-[200px]">
                {suggestions.map((city, idx) => (
                  <button
                    key={`${city.lat}-${city.lon}-${idx}`}
                    onClick={() => handleSelectCity(city)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--foreground)]/5 transition-all text-left group"
                  >
                    <div className="p-2 rounded-xl bg-[var(--foreground)]/5 group-hover:bg-[var(--accent-primary)]/10 transition-colors">
                       <MapPin size={14} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[var(--foreground)]">{city.name}</p>
                      <p className="text-[9px] font-medium text-[var(--text-secondary)] opacity-60">
                        {city.state ? `${city.state}, ` : ""}{city.country}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading && !data) {
    return (
      <div className="window-panel border border-[var(--card-border)] p-8 h-full flex flex-col justify-center items-center bg-[var(--background)] animate-pulse">
        <div className="w-12 h-12 rounded-full bg-[var(--foreground)]/5 mb-4" />
        <div className="w-32 h-4 bg-[var(--foreground)]/5 rounded-full mb-2" />
        <div className="w-24 h-2 bg-[var(--foreground)]/5 rounded-full" />
      </div>
    );
  }

  // 3. Error / Failed Fetch State
  if (error || !data) {
    return (
      <div className="window-panel border border-[var(--card-border)] p-8 h-full flex flex-col justify-center items-center bg-[var(--background)] text-center space-y-4">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-[var(--foreground)] text-sm font-bold">Sensor Sync Failed</p>
          <p className="text-[10px] text-[var(--text-secondary)] mt-1">{error || "Connection timed out"}</p>
        </div>
        <button 
          onClick={() => fetchWeather(weatherLocation.lat, weatherLocation.lon)}
          className="flex items-center gap-2 px-6 py-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] transition-all"
        >
          <RefreshCcw size={12} /> Retry Sync
        </button>
      </div>
    );
  }

  // 4. Main Weather State
  return (
    <div className="window-panel border border-[var(--card-border)] p-6 h-full flex flex-col bg-[var(--background)] relative overflow-hidden group shadow-xl transition-all">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/5 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-[var(--accent-primary)]/10" />
      
      <div className="flex justify-between items-start mb-4 shrink-0 relative z-10">
        <div>
           <h3 className="text-[var(--foreground)] font-condensed text-[12px] font-black uppercase tracking-[0.2em] opacity-60">
             Environment
           </h3>
           <p className="text-[10px] font-jakarta font-bold text-[var(--accent-primary)] uppercase tracking-widest mt-1 flex items-center gap-1.5">
             <span className="w-1 h-1 rounded-full bg-[var(--accent-primary)] animate-ping" />
             {weatherLocation.name || "Site Active"}
           </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSearching(true)}
            className="p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 transition-all opacity-0 group-hover:opacity-100"
            title="Change Location"
          >
             <Settings2 size={16} />
          </button>
          <div className={`p-2.5 rounded-2xl ${data.hazardLevel === 'High' ? 'bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-[0_0_15px_rgba(139,92,246,0.1)]'}`}>
             <Cloud size={20} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="flex items-baseline gap-1">
           <span className="text-5xl font-jakarta font-medium text-[var(--foreground)] tracking-tighter tabular-nums">
              {data.temp}°
           </span>
           <span className="text-lg font-jakarta font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-tighter">
              Celsius
           </span>
        </div>
        <p className="text-sm font-jakarta font-medium text-[var(--text-secondary)] mt-2 flex items-center gap-2">
           <span className={`w-1.5 h-1.5 rounded-full ${data.hazardLevel === 'High' ? 'bg-red-500' : 'bg-green-500'} shadow-[0_0_8px_currentColor]`} />
           {data.condition}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-4 shrink-0 relative z-10">
        <div className="bg-[var(--foreground)]/[0.03] rounded-2xl p-4 border border-[var(--card-border)] hover:bg-[var(--foreground)]/[0.05] transition-all">
           <div className="flex items-center gap-2 mb-1.5">
              <Wind size={12} className="text-[var(--text-secondary)]" strokeWidth={3} />
              <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.1em]">Wind</span>
           </div>
           <p className="text-xs font-black text-[var(--foreground)] tabular-nums">{data.windSpeed} km/h</p>
        </div>
        <div className="bg-[var(--foreground)]/[0.03] rounded-2xl p-4 border border-[var(--card-border)] hover:bg-[var(--foreground)]/[0.05] transition-all">
           <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle size={12} className={data.hazardLevel !== 'Low' ? 'text-orange-500' : 'text-[var(--text-secondary)]'} strokeWidth={3} />
              <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.1em]">Hazards</span>
           </div>
           <p className="text-[10px] font-black text-[var(--foreground)] uppercase truncate">{data.hazardSource}</p>
        </div>
      </div>
    </div>
  );
}
