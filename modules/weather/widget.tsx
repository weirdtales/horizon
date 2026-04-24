"use client";

import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, CloudLightning, CloudSnow, Wind, Loader2 } from 'lucide-react';

// Mapping for Open-Meteo weather codes
const WEATHER_CODES: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    95: 'Thunderstorm',
};

import { AppSettings } from '@/lib/types';

interface WeatherData {
    temp: number;
    high: number;
    description: string;
}

// Simplified internal hook for the module
function useWeather(settings: AppSettings['weather']) {
    const { apiKey, location = 'London', units = 'metric' } = settings || {};
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasLocationError, setHasLocationError] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!location) return;
        const controller = new AbortController();

        const fetchWeather = async () => {
            setLoading(true);
            setHasLocationError(false);
            try {
                if (apiKey) {
                    const fetchUnits = units === 'imperial' ? 'imperial' : 'metric';
                    // Note: current weather API's temp_max is instantaneous. 
                    // For true daily highs, One Call API /forecast/daily would be required.
                    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=${fetchUnits}`, { signal: controller.signal });
                    if (res.ok) {
                        const data = await res.json();
                        setWeatherData({
                            temp: Math.round(data.main.temp),
                            high: Math.round(data.main.temp_max),
                            description: data.weather[0].description,
                        });
                    } else {
                        const err = await res.json().catch(() => ({ message: res.statusText }));
                        console.error('Weather (OpenWeatherMap) failed:', res.status, err.message);
                        setWeatherData(null);
                    }
                } else {
                    // Fallback to Open-Meteo (keyless)
                    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`, { signal: controller.signal });
                    let lat = 51.5074, lon = -0.1278; // London fallback
                    
                    if (geoRes.ok) {
                        const geoData = await geoRes.json();
                        if (geoData.results && geoData.results[0]) {
                            lat = geoData.results[0].latitude;
                            lon = geoData.results[0].longitude;
                        } else {
                            setHasLocationError(true);
                        }
                    } else {
                        setHasLocationError(true);
                    }

                    const metRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max&timezone=auto${units === 'imperial' ? '&temperature_unit=fahrenheit' : ''}`, { signal: controller.signal });
                    if (metRes.ok) {
                        const metData = await metRes.json();
                        const code = metData.current_weather.weathercode;
                        setWeatherData({
                            temp: Math.round(metData.current_weather.temperature),
                            high: Math.round(metData.daily.temperature_2m_max[0]),
                            description: WEATHER_CODES[code] || 'Cloudy',
                        });
                    } else {
                        const err = await metRes.text();
                        console.error('Weather (Open-Meteo) failed:', metRes.status, err);
                        setWeatherData(null);
                    }
                }
            } catch (err: unknown) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Weather fetch failed:', err.message);
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
        loading,
        isMetric,
        hasLocationError,
        temp: weatherData ? weatherData.temp : null,
        description: weatherData ? weatherData.description : (loading ? 'Loading...' : 'Unavailable'),
        high: weatherData ? weatherData.high : null,
    };
}

const WeatherIcon = ({ condition, size }: { condition: string, size: number }) => {
    const iconProps = { size, strokeWidth: 1.5, style: { opacity: 0.9 } };
    const desc = condition.toLowerCase();
    if (desc.includes('clear')) return <Sun {...iconProps} color="var(--md-color-weather-sun)" />;
    if (desc.includes('rain') || desc.includes('drizzle')) return <CloudRain {...iconProps} color="var(--md-color-weather-rain)" />;
    if (desc.includes('storm') || desc.includes('thunder')) return <CloudLightning {...iconProps} color="var(--md-color-weather-storm)" />;
    if (desc.includes('snow')) return <CloudSnow {...iconProps} color="var(--md-sys-color-on-surface)" />;
    if (desc.includes('mist') || desc.includes('fog')) return <Wind {...iconProps} color="var(--md-color-weather-mist)" />;
    return <Cloud {...iconProps} color="var(--md-color-weather-mist)" />;
};

export default function WeatherWidget({ settings }: { settings?: AppSettings }) {
    const w = settings?.weather || { location: 'London', units: 'metric' };
    const { time, loading, isMetric, temp, description, high, hasLocationError } = useWeather(w);

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '28px', boxSizing: 'border-box', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--md-sys-color-primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
                        {(typeof w.location !== 'string' || w.location.toUpperCase() === 'ABOUT:BLANK') ? 'London' : w.location}
                    </div>
                    <div style={{ fontSize: 'clamp(2rem, 10vw, 4rem)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-3px', color: 'var(--md-sys-color-on-surface)' }}>
                        {time.getHours().toString().padStart(2, '0')}<span style={{ opacity: 0.3 }}>:</span>{time.getMinutes().toString().padStart(2, '0')}
                    </div>
                </div>
                {loading ? <Loader2 className="animate-spin" size={40} opacity={0.3} /> : <WeatherIcon condition={description} size={56} />}
            </div>

            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '16px 20px', 
                background: 'var(--md-sys-color-surface-container-high)', 
                border: '1px solid var(--md-sys-color-outline-variant)',
                borderRadius: '28px', 
                marginTop: 'auto'
            }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>
                    {temp !== null ? `${temp}°` : '--°'}<span style={{ fontSize: '18px', opacity: 0.5 }}>{isMetric ? 'C' : 'F'}</span>
                </div>
                <div style={{ height: '24px', width: '1px', background: 'var(--md-sys-color-outline-variant)', opacity: 0.3 }} />
                <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.2 }}>
                    <div style={{ textTransform: 'capitalize', color: 'var(--md-sys-color-on-surface)' }}>{hasLocationError ? 'Location not found' : description}</div>
                    <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', opacity: 0.6 }}>
                        {high !== null ? `High: ${high}°` : 'Stats unavailable'}
                    </div>
                </div>
            </div>
        </div>
    );
}
