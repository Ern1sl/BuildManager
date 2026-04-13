"use server";

export async function searchCities(query: string) {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  if (!query || query.length < 2 || !API_KEY) {
    if (!API_KEY) console.error("WEATHER ERROR: OPENWEATHER_API_KEY is missing from environment");
    return [];
  }

  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
    console.log("WEATHER INFO: Searching for city:", query);
    
    const res = await fetch(url);
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`WEATHER ERROR: API responded with status ${res.status}: ${errorText}`);
        return [];
    }
    
    const data = await res.json();
    console.log(`WEATHER INFO: Found ${data.length} results for ${query}`);
    
    return data.map((item: any) => ({
      name: item.name,
      state: item.state,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
    }));
  } catch (error) {
    console.error("WEATHER ERROR: Search cities request failed:", error);
    return [];
  }
}

export async function getWeatherByCoords(lat: number, lon: number) {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  if (!API_KEY) {
    console.error("OPENWEATHER_API_KEY is missing from environment");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("Failed to fetch weather");
    const data = await res.json();

    // Map hazard levels based on weather conditions
    let hazardLevel: 'Low' | 'Moderate' | 'High' = 'Low';
    let hazardSource = 'Normative';

    const windKmh = data.wind.speed * 3.6; // Convert m/s to km/h
    
    if (data.weather[0].main === 'Thunderstorm' || windKmh > 50) {
      hazardLevel = 'High';
      hazardSource = windKmh > 50 ? 'High Winds' : 'Electrical Storm';
    } else if (['Rain', 'Drizzle', 'Snow'].includes(data.weather[0].main) || windKmh > 25) {
      hazardLevel = 'Moderate';
      hazardSource = windKmh > 25 ? 'Breezy Conditions' : 'Precipitation';
    }

    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1),
      windSpeed: Math.round(windKmh),
      humidity: data.main.humidity,
      hazardLevel,
      hazardSource
    };
  } catch (error) {
    console.error("Get weather error:", error);
    return null;
  }
}
