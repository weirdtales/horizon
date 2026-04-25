import { useState, useEffect } from 'react';

/**
 * Shared hook for weather and time data.
 * Supports dual-mode for API Key (OpenWeatherMap) or Keyless (Open-Meteo + Nominatim).
 */
interface WeatherSettings {
    apiKey?: string;
    location?: string;
    units?: 'metric' | 'imperial';
}

interface WeatherData {
    source: 'openweather' | 'openmeteo';
    temp: number;
    high: number;
    low: number;
    description: string;
    icon: string;
}

export function useWeather(settings: WeatherSettings | null) {
    const rawLocation = settings?.location;
    const location =
        rawLocation &&
        typeof rawLocation === 'string' &&
        rawLocation.trim() !== '' &&
        rawLocation.toUpperCase() !== 'ABOUT:BLANK'
            ? rawLocation
            : 'London';
    const { apiKey, units = 'metric' } = settings || {};
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasLocationError, setHasLocationError] = useState(false);
    const [time, setTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Weather Fetching Logic
    useEffect(() => {
        if (!location || location.toUpperCase() === 'ABOUT:BLANK') return;
        const controller = new AbortController();

        const fetchWeather = async (retryCount = 0) => {
            if (typeof window !== 'undefined' && !navigator.onLine) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setHasLocationError(false);
            try {
                if (apiKey) {
                    // --- OPENWEATHERMAP (Standard Mode) ---
                    const fetchUnits = units === 'imperial' ? 'imperial' : 'metric';
                    const res = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=${fetchUnits}`,
                        {
                            signal: controller.signal,
                            headers: { Accept: 'application/json' },
                        }
                    );
                    if (!res.ok) {
                        const errorText = await res.text().catch(() => 'Unknown Error');
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
                            icon: data.weather[0].icon,
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

                    let isCacheValid = false;
                    if (cached) {
                        try {
                            const parsed = JSON.parse(cached);
                            if (parsed.expires && now < parsed.expires && !isNaN(parsed.lat) && !isNaN(parsed.lon)) {
                                lat = parsed.lat;
                                lon = parsed.lon;
                                isCacheValid = true;
                            }
                        } catch {
                            localStorage.removeItem(cacheKey);
                        }
                    }

                    // If not cached or expired, try to fetch
                    if (!isCacheValid) {
                        try {
                            const geoRes = await fetch(`/api/weather/geocode?q=${encodeURIComponent(location)}`, {
                                signal: controller.signal,
                                headers: { Accept: 'application/json' },
                            });
                            if (geoRes.ok) {
                                const geoData = await geoRes.json();
                                if (geoData && geoData.length > 0) {
                                    const newLat = parseFloat(geoData[0].lat);
                                    const newLon = parseFloat(geoData[0].lon);

                                    if (!isNaN(newLat) && !isNaN(newLon)) {
                                        lat = newLat;
                                        lon = newLon;
                                        // Cache for 24 hours
                                        localStorage.setItem(
                                            cacheKey,
                                            JSON.stringify({
                                                lat,
                                                lon,
                                                expires: now + 86400000,
                                            })
                                        );
                                    } else {
                                        setHasLocationError(true);
                                    }
                                } else {
                                    setHasLocationError(true);
                                }
                            } else if (geoRes.status !== 404) {
                                // If it's a 429 or 500, we might want to retry but for now just log
                                console.warn(
                                    `[WEATHER]: Geocoding failed with status ${geoRes.status}. Using defaults.`
                                );
                            }
                        } catch (geoErr) {
                            if (geoErr instanceof Error && geoErr.name !== 'AbortError') {
                                console.warn('[WEATHER]: Geocoding fetch interrupted:', geoErr.message);
                            }
                        }
                    }

                    const fetchUnits = units === 'imperial' ? '&temperature_unit=fahrenheit' : '';
                    if (isNaN(lat) || isNaN(lon)) {
                        lat = 51.5074;
                        lon = -0.1278;
                    }

                    const metRes = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto${fetchUnits}`,
                        {
                            signal: controller.signal,
                            headers: { Accept: 'application/json' },
                        }
                    );

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
                            icon: getIconFromWmo(cw.weathercode, cw.is_day === 1),
                        });
                    }
                }
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    // Retry logic for transient failures
                    if (retryCount < 3) {
                        const delay = Math.pow(2, retryCount) * 1000;
                        setTimeout(() => fetchWeather(retryCount + 1), delay);
                        return;
                    }
                    console.warn('Weather synchronization failed after retries:', err.message);
                    setWeatherData(null);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchWeather();
        const weatherInterval = setInterval(fetchWeather, 1800000);
        return () => {
            controller.abort();
            clearInterval(weatherInterval);
        };
    }, [apiKey, location, units]);

    const isMetric = units !== 'imperial';

    return {
        time,
        weatherData,
        loading,
        isMetric,
        hasLocationError,
        temp: weatherData ? weatherData.temp : loading ? null : isMetric ? 14 : 57,
        description: weatherData ? weatherData.description : 'Cloudy',
        high: weatherData ? weatherData.high : isMetric ? 16 : 61,
        low: weatherData ? weatherData.low : isMetric ? 12 : 54,
        icon: weatherData ? weatherData.icon : '04d',
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
