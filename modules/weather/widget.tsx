'use client';

import React from 'react';
import { CloudRain, Sun, Cloud, CloudLightning, CloudSnow, Wind, Loader2 } from 'lucide-react';

import { AppSettings } from '@/lib/types';

import { useWeather } from '@/app/hooks/useWeather';

const WeatherIcon = ({ condition, size }: { condition: string; size: number }) => {
    const iconProps = { size, strokeWidth: 1.5, style: { opacity: 0.9 } };
    const desc = condition.toLowerCase();
    if (desc.includes('clear')) return <Sun {...iconProps} color="var(--md-color-weather-sun)" />;
    if (desc.includes('rain') || desc.includes('drizzle'))
        return <CloudRain {...iconProps} color="var(--md-color-weather-rain)" />;
    if (desc.includes('storm') || desc.includes('thunder'))
        return <CloudLightning {...iconProps} color="var(--md-color-weather-storm)" />;
    if (desc.includes('snow')) return <CloudSnow {...iconProps} color="var(--md-sys-color-on-surface)" />;
    if (desc.includes('mist') || desc.includes('fog'))
        return <Wind {...iconProps} color="var(--md-color-weather-mist)" />;
    return <Cloud {...iconProps} color="var(--md-color-weather-mist)" />;
};

export default function WeatherWidget({ settings }: { settings?: AppSettings['weather'] }) {
    const w = settings || { location: 'London', units: 'metric' };
    const { time, loading, isMetric, temp, description, high, hasLocationError } = useWeather(w);

    const rawLoc = w.location;
    const displayLocation =
        rawLoc && typeof rawLoc === 'string' && rawLoc.trim() !== '' && rawLoc.toUpperCase() !== 'ABOUT:BLANK'
            ? rawLoc
            : 'London';

    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '28px',
                boxSizing: 'border-box',
                justifyContent: 'space-between',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div
                        style={{
                            fontSize: '12px',
                            fontWeight: 900,
                            color: 'var(--md-sys-color-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            marginBottom: '4px',
                        }}
                    >
                        {displayLocation}
                    </div>
                    <div
                        style={{
                            fontSize: 'clamp(2rem, 10vw, 4rem)',
                            fontWeight: 900,
                            lineHeight: 0.9,
                            letterSpacing: '-3px',
                            color: 'var(--md-sys-color-on-surface)',
                        }}
                    >
                        {time.getHours().toString().padStart(2, '0')}
                        <span style={{ opacity: 0.3 }}>:</span>
                        {time.getMinutes().toString().padStart(2, '0')}
                    </div>
                </div>
                {loading ? (
                    <Loader2 className="animate-spin" size={40} opacity={0.3} />
                ) : (
                    <WeatherIcon condition={description} size={56} />
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    background: 'var(--md-sys-color-surface-container-high)',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: '28px',
                    marginTop: 'auto',
                }}
            >
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--md-sys-color-on-surface)' }}>
                    {temp !== null ? `${temp}°` : '--°'}
                    <span style={{ fontSize: '18px', opacity: 0.5 }}>{isMetric ? 'C' : 'F'}</span>
                </div>
                <div
                    style={{
                        height: '24px',
                        width: '1px',
                        background: 'var(--md-sys-color-outline-variant)',
                        opacity: 0.3,
                    }}
                />
                <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.2 }}>
                    <div style={{ textTransform: 'capitalize', color: 'var(--md-sys-color-on-surface)' }}>
                        {hasLocationError ? 'Location not found' : description}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', opacity: 0.6 }}>
                        {high !== null ? `High: ${high}°` : 'Stats unavailable'}
                    </div>
                </div>
            </div>
        </div>
    );
}
