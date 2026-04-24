import { useState, useEffect } from 'react';

/**
 * Shared hook for weather and time data.
 * Supports dual-mode for API Key (OpenWeatherMap) or Keyless (Open-Meteo + Nominatim).
 */
export function useWeather(settings: any) {
    const { apiKey, location = 'London', units = 'metric' } = settings || {};
    const [weatherData, setWeatherData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [time, setTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Weather Fetching Logic
    useEffect(() => {
        if (!location) return;

        const fetchWeather = async () => {
            setLoading(true);
            try {
                if (apiKey) {
                    // --- OPENWEATHERMAP (Standard Mode) ---
                    const fetchUnits = units === 'imperial' ? 'imperial' : 'metric';
                    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=${fetchUnits}`);
                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`OpenWeatherMap Error: ${res.status} ${errorText}`);
                    }
                    const data = await res.json();
                    if (data.cod === 200) {
                        setWeatherData({
                            source: 'openweather',
                            temp: Math.round(data.main.temp),
                            high: Math.round(data.main.temp_max),
                            low: Math.round(data.main.temp_min),
                            description: data.weather[0].description,
                            icon: data.weather[0].icon
                        });
                    }
                } else {
                    // --- OPEN-METEO FALLBACK (Keyless Mode) ---
                    let lat = 51.5074; // London Default
                    let lon = -0.1278;
                    
                    // 1. Check Geocode Cache to avoid 429 Rate Limits
                    const cacheKey = `geo_cache_${location.toLowerCase().replace(/\s+/g, '_')}`;
                    const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
                    const now = Date.now();
                    
                    if (cached) {
                        try {
                            const { lat: cLat, lon: cLon, expires } = JSON.parse(cached);
                            if (now < expires) {
                                lat = cLat;
                                lon = cLon;
                            }
                        } catch (e) {
                            localStorage.removeItem(cacheKey);
                        }
                    }

                    // If not cached or expired, try to fetch
                    if (!cached || now >= JSON.parse(cached || '{}').expires) {
                        try {
                            const geoRes = await fetch(`/api/weather/geocode?q=${encodeURIComponent(location)}`);
                            if (geoRes.ok) {
                                const geoData = await geoRes.json();
                                if (geoData && geoData.length > 0) {
                                    lat = parseFloat(geoData[0].lat);
                                    lon = parseFloat(geoData[0].lon);
                                    // Cache for 24 hours
                                    localStorage.setItem(cacheKey, JSON.stringify({ 
                                        lat, lon, expires: now + 86400000 
                                    }));
                                }
                            } else {
                                console.warn(`[WEATHER]: Geocoding failed with status ${geoRes.status}. Using defaults.`);
                            }
                        } catch (geoErr) {
                            console.error('[WEATHER]: Geocoding fetch failed:', geoErr);
                        }
                    }

                    const fetchUnits = units === 'imperial' ? '&temperature_unit=fahrenheit' : '';
                    const metRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto${fetchUnits}`);
                    
                    if (!metRes.ok) {
                        throw new Error(`Open-Meteo Error: ${metRes.status}`);
                    }
                    
                    const metData = await metRes.json();
                    
                    if (metData.current_weather) {
                        const cw = metData.current_weather;
                        const daily = metData.daily || {};
                        const hasDaily = daily.temperature_2m_max && daily.temperature_2m_max.length > 0;
                        
                        setWeatherData({
                            source: 'openmeteo',
                            temp: Math.round(cw.temperature),
                            high: hasDaily ? Math.round(daily.temperature_2m_max[0]) : Math.round(cw.temperature + 2),
                            low: hasDaily ? Math.round(daily.temperature_2m_min[0]) : Math.round(cw.temperature - 2),
                            description: mapWmoCode(cw.weathercode),
                            icon: getIconFromWmo(cw.weathercode, cw.is_day === 1)
                        });
                    }
                }
            } catch (err) {
                console.error('Weather fetch failed:', err);
            }
            setLoading(false);
        };

        fetchWeather();
        const weatherInterval = setInterval(fetchWeather, 1800000);
        return () => clearInterval(weatherInterval);
    }, [apiKey, location, units]);

    const isMetric = units !== 'imperial';
    
    return {
        time,
        weatherData,
        loading,
        isMetric,
        temp: weatherData ? weatherData.temp : (isMetric ? 14 : 57),
        description: weatherData ? weatherData.description : 'Cloudy',
        high: weatherData ? weatherData.high : (isMetric ? 16 : 61),
        low: weatherData ? weatherData.low : (isMetric ? 12 : 54),
        icon: weatherData ? weatherData.icon : '04d'
    };
}

/**
 * Map WMO Weather Interpretation Codes to readable descriptions
 */
function mapWmoCode(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 56 && code <= 57) return 'Freezing Drizzle';
    if (code >= 61 && code <= 65) return 'Rainy';
    if (code >= 66 && code <= 67) return 'Freezing Rain';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 85 && code <= 86) return 'Snow Showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Cloudy';
}

/**
 * Return approximate OpenWeatherMap icon code from WMO code for UI consistency
 */
function getIconFromWmo(code: number, isDay: boolean): string {
    const d = isDay ? 'd' : 'n';
    if (code === 0) return `01${d}`;
    if (code === 1 || code === 2) return `02${d}`;
    if (code === 3) return `03${d}`;
    if (code >= 45 && code <= 48) return `50${d}`;
    if (code >= 51 && code <= 57) return `10${d}`; // Drizzle and Freezing Rain mapped to 10 Rain
    if (code >= 61 && code <= 67) return `10${d}`;
    if (code >= 71 && code <= 77) return `13${d}`;
    if (code >= 80 && code <= 86) return `09${d}`;
    if (code >= 95 && code <= 99) return `11${d}`;
    return `04${d}`;
}
